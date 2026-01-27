import { db } from '../../firebase';
import { collection, getDocs, addDoc, query, where, updateDoc, doc, orderBy, serverTimestamp, onSnapshot } from 'firebase/firestore';

/**
 * Fetch notifications for a specific user
 */
export const getNotifications = async (userId) => {
    try {
        const notifCol = collection(db, 'notifications');
        const q = query(
            notifCol,
            where('userId', '==', userId),
            orderBy('createdAt', 'desc') // Assuming we add a timestamp
        );

        const snapshot = await getDocs(q);

        // If no notifications found (new user), maybe seed them?
        // Or just return empty.

        return snapshot.docs.map(doc => ({
            ...doc.data(),
            firestoreId: doc.id
        }));
    } catch (error) {
        console.error("Error getting notifications:", error);
        return [];
    }
};

/**
 * Subscribe to real-time notifications
 * @param {string} userId 
 * @param {function} callback - Function to call with new notifications
 */
export const subscribeToNotifications = (userId, callback) => {
    const notifCol = collection(db, 'notifications');
    const q = query(
        notifCol,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({
            ...doc.data(),
            firestoreId: doc.id
        }));

        // Pass both full list and changes to the callback
        callback(notifications, snapshot.docChanges());
    });
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notifId, isRead = true) => {
    try {
        const ref = doc(db, 'notifications', notifId);
        await updateDoc(ref, { read: isRead });
    } catch (error) {
        console.error("Error updating notification:", error);
    }
};

/**
 * Seed initial notifications for a user
 */
export const seedNotifications = async (userId) => {
    const INITIAL_NOTIFICATIONS = [
        {
            type: 'user',
            message: 'ยินดีต้อนรับสู่ Schooly Scoot!',
            time: 'วันนี้', // In real app, use timestamp
            read: false,
            detail: 'ขอต้อนรับเข้าสู่ระบบการเรียนรู้ออนไลน์ที่ทันสมัยที่สุด',
            userId: userId,
            createdAt: new Date()
        },
        {
            type: 'homework',
            message: 'ระบบพร้อมใช้งานแล้ว',
            time: 'วันนี้',
            read: true,
            detail: 'คุณสามารถเริ่มสร้างห้องเรียนหรือสมัครเรียนได้ทันที',
            userId: userId,
            createdAt: new Date(Date.now() - 86400000) // Yesterday
        }
    ];

    try {
        const col = collection(db, 'notifications');
        const q = query(col, where('userId', '==', userId));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) return; // Already seeded

        for (const notif of INITIAL_NOTIFICATIONS) {
            await addDoc(col, notif);
        }
    } catch (error) {
        console.error("Error seeding notifications:", error);
    }
};

/**
 * Create a new notification
 * @param {string} userId - Recipient user ID
 * @param {string} message - Main notification text
 * @param {string} type - 'homework', 'system', 'user', etc.
 * @param {string} detail - Detailed description
 */
export const createNotification = async (userId, message, type = 'system', detail = '', metadata = {}) => {
    try {
        await addDoc(collection(db, 'notifications'), {
            userId,
            message,
            type,
            detail,
            read: false,
            time: 'ตอนนี้', // You might want to format this or use relative time in UI
            createdAt: new Date().toISOString(),
            ...metadata // Spread optional metadata (e.g., courseId, targetId)
        });
    } catch (error) {
        console.error("Error creating notification:", error);
    }
};
// Exporting this function explicitly to avoid import errors
export const markAllNotificationsAsRead = async (userId) => {
    try {
        const notifCol = collection(db, 'notifications');
        const q = query(
            notifCol,
            where('userId', '==', userId),
            where('read', '==', false)
        );

        const snapshot = await getDocs(q);
        const updatePromises = snapshot.docs.map(doc =>
            updateDoc(doc.ref, { read: true })
        );

        await Promise.all(updatePromises);
        return true;
    } catch (error) {
        console.error("Error marking all as read:", error);
        return false;
    }
};
