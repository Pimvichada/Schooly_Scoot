import { db } from '../../firebase';
import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp, doc, getDoc } from 'firebase/firestore';

/**
 * Create a new post in a course
 * @param {string} courseId 
 * @param {string} content 
 * @param {object} author - { uid, name, avatar, role }
 */
export const createPost = async (courseId, content, author) => {
    try {
        const postsCol = collection(db, 'posts');
        const newPost = {
            courseId,
            content,
            author, // Store a snapshot of the author profile
            attachments: [],
            likes: [],
            createdAt: serverTimestamp()
        };

        const docRef = await addDoc(postsCol, newPost);

        // Return constructed object with ID (since serverTimestamp is async/null initially)
        return {
            id: docRef.id,
            ...newPost,
            createdAt: new Date().toISOString() // Client-side approximation for immediate UI update
        };
    } catch (error) {
        console.error("Error creating post:", error);
        throw error;
    }
};

/**
 * Get posts for a specific course
 * @param {string} courseId 
 */
export const getPostsByCourse = async (courseId) => {
    try {
        const postsCol = collection(db, 'posts');
        const q = query(
            postsCol,
            where('courseId', '==', courseId),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Convert Timestamp to readable string if needed, or keep as object
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString('th-TH') : "Just now"
            };
        });
    } catch (error) {
        console.error("Error fetching posts:", error);
        // If index error, it might throw here. 
        // We will catch it.
        throw error;
    }
};
