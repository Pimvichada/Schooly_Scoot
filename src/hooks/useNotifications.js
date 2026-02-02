import { useState, useEffect, useRef, useCallback } from 'react';
import { subscribeToNotifications, createNotification, markNotificationAsRead, markAllNotificationsAsRead } from '../services/notificationService';
import notiSoundUrl from '../assets/notisound.mp3';

export const useNotifications = (uid, notificationsEnabled) => {
    const [notifications, setNotifications] = useState([]);
    const [activeNotifications, setActiveNotifications] = useState([]);

    // Ref to track toggle state without triggering effect re-subscriptions
    const notificationsEnabledRef = useRef(notificationsEnabled);

    useEffect(() => {
        notificationsEnabledRef.current = notificationsEnabled;
    }, [notificationsEnabled]);

    const addNotification = useCallback((notification) => {
        const noti = { ...notification, id: notification.id || Date.now().toString() };

        // Only show toast and play sound if notifications are enabled
        if (notificationsEnabledRef.current) {
            setActiveNotifications(prev => {
                // Prevent exact duplicates if checking by firestoreId within short timeframe
                if (noti.firestoreId && prev.some(n => n.firestoreId === noti.firestoreId)) {
                    return prev;
                }
                return [...prev, noti];
            });

            // Play Sound
            try {
                const audio = new Audio(notiSoundUrl);
                audio.volume = 0.5;
                audio.play().catch(e => console.error("Audio play failed:", e));
            } catch (err) {
                console.error("Error initializing audio:", err);
            }
        }
    }, []);

    const removeNotification = useCallback((id) => {
        setActiveNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const notificationSessionRef = useRef({
        handlingInitial: true,
        initialCount: 0,
        seenIds: new Set(),
        hasShownSummary: false,
        firstUnread: null
    });

    useEffect(() => {
        if (!uid) {
            notificationSessionRef.current = {
                handlingInitial: true,
                initialCount: 0,
                seenIds: new Set(),
                hasShownSummary: false,
                firstUnread: null
            };
            return;
        }

        // Grace period: Collect all existing notifications for 2 seconds
        const syncTimeout = setTimeout(() => {
            notificationSessionRef.current.handlingInitial = false;

            const session = notificationSessionRef.current;
            if (session.initialCount > 0 && notificationsEnabledRef.current && !session.hasShownSummary) {
                session.hasShownSummary = true;

                if (session.initialCount > 1) {
                    addNotification({
                        id: 'summary-' + Date.now(),
                        message: `คุณมีรายการใหม่ที่ยังไม่ได้อ่าน ${session.initialCount} รายการ`,
                        type: 'summary',
                        detail: 'ตรวจสอบได้ที่แถบแจ้งเตือนและการบ้าน',
                        read: false
                    });
                } else if (session.firstUnread) {
                    addNotification(session.firstUnread);
                }

                // Sound usually played by addNotification, but if blocking etc needed:
                // already handled inside addNotification
            }
        }, 2000);

        const unsubscribe = subscribeToNotifications(uid, (allNotifications, changes) => {
            setNotifications(allNotifications);

            const session = notificationSessionRef.current;

            if (session.handlingInitial) {
                // Phase 1: Buffering
                const unreadList = allNotifications.filter(n => !n.read);
                session.initialCount = unreadList.length;
                if (unreadList.length > 0) {
                    session.firstUnread = unreadList[0];
                }
                allNotifications.forEach(n => session.seenIds.add(n.firestoreId));
            } else {
                // Phase 2: Live Updates
                if (changes) {
                    changes.forEach(change => {
                        if (change.type === 'added') {
                            const data = change.doc.data();
                            const id = change.doc.id;

                            if (!data.read && !session.seenIds.has(id)) {
                                session.seenIds.add(id);
                                addNotification({ ...data, firestoreId: id });
                            }
                        }
                    });
                }
            }
        });

        return () => {
            unsubscribe();
            clearTimeout(syncTimeout);
        };
    }, [uid, addNotification]);

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.firestoreId === id ? { ...n, read: true } : n));
        markNotificationAsRead(id);
    };

    const markAllRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        if (uid) {
            await markAllNotificationsAsRead(uid);
        }
    };

    return {
        notifications,
        setNotifications,
        activeNotifications,
        addNotification,
        removeNotification,
        markAsRead,
        markAllRead
    };
};
