import { auth, db } from '../../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

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
export const loginWithGoogle = async (role = 'student') => {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Check if user exists in Firestore
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            // Create new user in Firestore if not exists
            await setDoc(docRef, {
                uid: user.uid,
                email: user.email,
                fullName: user.displayName,
                role: role,
                photoURL: user.photoURL,
                createdAt: new Date().toISOString()
            });
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
