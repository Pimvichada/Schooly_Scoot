import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { updateUserProfile } from '../services/authService';

export const useAuthUser = () => {
    const [uid, setUid] = useState(auth.currentUser?.uid);
    const [isLoggedIn, setIsLoggedIn] = useState(!!auth.currentUser);
    const [userRole, setUserRole] = useState('student');
    const [authLoading, setAuthLoading] = useState(true);
    const [hiddenCourseIds, setHiddenCourseIds] = useState([]);

    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        email: '',
        roleLabel: '',
        photoURL: ''
    });

    const [editProfileData, setEditProfileData] = useState({
        firstName: '',
        lastName: '',
        photoURL: ''
    });

    const [isSavingProfile, setIsSavingProfile] = useState(false);

    useEffect(() => {
        let unsubscribeProfile = null;

        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setUid(user?.uid);
            // Unsubscribe from previous profile listener if exists
            if (unsubscribeProfile) {
                unsubscribeProfile();
                unsubscribeProfile = null;
            }

            if (user) {
                setAuthLoading(true);
                // Real-time listener for user profile
                const userRef = doc(db, "users", user.uid);
                unsubscribeProfile = onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const userProfile = docSnap.data();
                        setUserRole(userProfile.role);

                        // Safer splitting and defaults
                        const fullName = userProfile.fullName || '';
                        const parts = fullName.split(' ');

                        const firstName = parts[0] || 'User';
                        const lastName = parts.slice(1).join(' ') || '';
                        const photoURL = userProfile.photoURL || user.photoURL || '';

                        setProfile({
                            firstName,
                            lastName,
                            email: user.email,
                            roleLabel: userProfile.role === 'student' ? 'นักเรียน' : 'ครูผู้สอน',
                            photoURL
                        });

                        // Sync edit data
                        setEditProfileData({
                            firstName,
                            lastName,
                            photoURL
                        });

                        setHiddenCourseIds(userProfile.hiddenCourses || []);
                        setIsLoggedIn(true);
                    } else {
                        // User exists in Auth but not yet in Firestore (creating...)
                    }
                    setAuthLoading(false);
                }, (error) => {
                    console.error("Error listening to user profile:", error);
                    setAuthLoading(false);
                });

            } else {
                setIsLoggedIn(false);
                setProfile({
                    firstName: '',
                    lastName: '',
                    email: '',
                    roleLabel: '',
                    photoURL: ''
                });
                setHiddenCourseIds([]); // Reset hidden courses on logout
                setAuthLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeProfile) unsubscribeProfile();
        };
    }, []);

    const handleUpdateProfile = async (e) => {
        if (e) e.preventDefault();
        if (isSavingProfile) return;
        setIsSavingProfile(true);
        try {
            if (!auth.currentUser) return;

            const fullName = `${editProfileData.firstName} ${editProfileData.lastName}`.trim();
            const updatePayload = {
                fullName,
                photoURL: editProfileData.photoURL
            };

            await updateUserProfile(auth.currentUser.uid, updatePayload);

            // Local state update is handled by the snapshot listener, but we can do optimistic if needed
            // Actually snapshot is fast enough normally, but for immediate feedback:
            setProfile(prev => ({
                ...prev,
                firstName: editProfileData.firstName,
                lastName: editProfileData.lastName,
                photoURL: editProfileData.photoURL
            }));

            return true; // Success
        } catch (error) {
            console.error("Failed to update profile", error);
            throw error;
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleProfileImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 500 * 1024) { // 500KB limit for base64
                alert('รูปภาพต้องมีขนาดไม่เกิน 500KB เพื่อให้บันทึกได้สำเร็จ (Base64 มีข้อจำกัดด้านขนาด)');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditProfileData(prev => ({ ...prev, photoURL: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    return {
        uid,
        isLoggedIn,
        userRole,
        authLoading,
        profile,
        hiddenCourseIds,
        setHiddenCourseIds, // Needed for optimistic updates in courses
        editProfileData,
        setEditProfileData,
        isSavingProfile,
        handleUpdateProfile,
        handleProfileImageUpload
    };
};
