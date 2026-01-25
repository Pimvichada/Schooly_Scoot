import { storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Upload a file to Firebase Storage
 * @param {File} file - The file object
 * @param {string} path - The folder path (e.g., 'quiz_images')
 * @returns {Promise<string>} - The download URL
 */
export const uploadFile = async (file, path = 'uploads') => {
    if (!file) return null;
    try {
        const timestamp = Date.now();
        const uniqueName = `${timestamp}_${file.name}`;
        const storageRef = ref(storage, `${path}/${uniqueName}`);

        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
    }
};
