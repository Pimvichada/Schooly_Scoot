import { auth, db } from '../../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

/**
 * Register a new user
 * @param {string} email 
 * @param {string} password 
 * @param {object} additionalData - { fullName, role, userId, ... }
 */
export const registerUser = async (email, password, additionalData) => {
    try {
        // 1. Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Update display name
        await updateProfile(user, {
            displayName: additionalData.fullName
        });

        // 3. Create user document in Firestore
        // Remove password from additionalData before saving to Firestore
        const { password: pw, ...userData } = additionalData;

        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: user.email,
            ...userData,
            createdAt: new Date().toISOString()
        });

        return user;
    } catch (error) {
        throw error;
    }
};

/**
 * Login user
 * @param {string} email 
 * @param {string} password 
 */
export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        throw error;
    }
};

/**
 * Login with Google
 */
/**
 * Authenticate with Google (No Firestore creation yet)
 * Returns { user, isNewUser, existingRole }
 */
export const authenticateWithGoogle = async () => {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Check if user exists in Firestore
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { user, isNewUser: false, existingRole: docSnap.data().role };
        } else {
            return { user, isNewUser: true };
        }
    } catch (error) {
        throw error;
    }
};

/**
 * Complete Google Registration (Create Firestore Doc)
 */
export const completeGoogleRegistration = async (user, role, fullName) => {
    try {
        const docRef = doc(db, "users", user.uid);
        await setDoc(docRef, {
            uid: user.uid,
            email: user.email,
            fullName: fullName || user.displayName,
            role: role,
            photoURL: user.photoURL,
            createdAt: new Date().toISOString()
        });
        return user;
    } catch (error) {
        throw error;
    }
};

/**
 * Legacy support / Quick login if needed
 */
export const loginWithGoogle = async (role = 'student') => {
    // This function can redirect to new flow or remain for backwards compatibility if needed
    // For now, we'll just wrap the new flow for auto-creation
    try {
        const { user, isNewUser } = await authenticateWithGoogle();
        if (isNewUser) {
            await completeGoogleRegistration(user, role, user.displayName);
        }
        return user;
    } catch (error) {
        throw error;
    }
};

/**
 * Logout user
 */
export const logoutUser = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        throw error;
    }
};

/**
 * Get user profile from Firestore
 * @param {string} uid 
 */
export const getUserProfile = async (uid) => {
    try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            console.log("No such user profile!");
            return null;
        }
    } catch (error) {
        throw error;
    }
};

/**
 * Get multiple user profiles by IDs
 * @param {Array} userIds 
 */
export const getUsersByIds = async (userIds) => {
    try {
        if (!userIds || userIds.length === 0) return [];
        // Firestore 'in' query supports up to 10 items. For more, we need multiple queries or just fetch all (bad).
        // For this small app, we can loop GetDoc use Promise.all

        const userDocs = await Promise.all(userIds.map(id => getDoc(doc(db, 'users', id))));
        return userDocs.map(d => d.exists() ? d.data() : null).filter(u => u !== null);
    } catch (error) {
        console.error("Error getting users:", error);
        return [];
    }
};

/**
 * Update user profile
 * @param {string} uid 
 * @param {object} updateData - { fullName, photoURL, ... }
 */
export const updateUserProfile = async (uid, updateData) => {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("ผู้ใช้ไม่ได้เข้าสู่ระบบ");

        // 1. Update Firebase Auth Profile (Display Name only if photo is Base64)
        try {
            const authPayload = {};
            if (updateData.fullName) authPayload.displayName = updateData.fullName;

            // Only update photoURL in Auth if it's NOT a Base64 string (Auth has short limits)
            if (updateData.photoURL && !updateData.photoURL.startsWith('data:')) {
                authPayload.photoURL = updateData.photoURL;
            }

            if (Object.keys(authPayload).length > 0) {
                await updateProfile(user, authPayload);
            }
        } catch (authErr) {
            console.warn("Auth profile update failed:", authErr.message);
            // Non-critical, continue to Firestore
        }

        // 2. Update Firestore (Primary Source of Truth)
        const docRef = doc(db, "users", uid);
        try {
            await updateDoc(docRef, updateData);
        } catch (e) {
            if (e.code === 'not-found' || e.message?.includes('not found')) {
                await setDoc(docRef, {
                    uid,
                    email: user.email,
                    ...updateData,
                    createdAt: new Date().toISOString(),
                    role: 'student'
                });
            } else {
                throw e; // Rethrow critical Firestore errors
            }
        }

        return true;
    } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
    }
};

/**
 * Send Password Reset Email
 * @param {string} email
 */
export const resetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error) {
        throw error;
    }
};

/**
 * Set Auth Persistence
 * @param {boolean} rememberMe
 */
export const setAuthPersistence = async (rememberMe) => {
    try {
        const type = rememberMe ? browserLocalPersistence : browserSessionPersistence;
        await setPersistence(auth, type);
    } catch (error) {
        console.error("Error setting persistence:", error);
    }
};

/**
 * Toggle hidden status of a course for a user
 * @param {string} uid 
 * @param {string} courseId 
 * @param {boolean} shouldHide - true to hide, false to unhide
 */
export const toggleHiddenCourse = async (uid, courseId, shouldHide) => {
    try {
        const userRef = doc(db, "users", uid);
        if (shouldHide) {
            await updateDoc(userRef, {
                hiddenCourses: arrayUnion(courseId)
            });
        } else {
            await updateDoc(userRef, {
                hiddenCourses: arrayRemove(courseId)
            });
        }
        return true;
    } catch (error) {
        console.error("Error toggling hidden course:", error);
        throw error;
    }
};
/**
 * Get user details by UID
 * @param {string} uid 
 */
export const getUserDetails = async (uid) => {
    try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching user details:", error);
        return null;
    }
};
