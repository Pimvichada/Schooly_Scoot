import { db } from '../../firebase';
import { collection, addDoc, getDocs, query, where, doc, deleteDoc, updateDoc } from 'firebase/firestore';

/**
 * Create a new quiz
 * @param {Object} quizData 
 */
export const createQuiz = async (quizData) => {
    try {
        const quizzesCol = collection(db, 'quizzes');
        const newQuiz = {
            ...quizData,
            createdAt: new Date().toISOString()
        };
        const docRef = await addDoc(quizzesCol, newQuiz);
        return { ...newQuiz, firestoreId: docRef.id };
    } catch (error) {
        console.error("Error creating quiz:", error);
        throw error;
    }
};

/**
 * Get quizzes for a specific course
 * @param {string} courseName 
 */
export const getQuizzesByCourse = async (courseName) => {
    try {
        const quizzesCol = collection(db, 'quizzes');
        const q = query(quizzesCol, where('course', '==', courseName));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            ...doc.data(),
            firestoreId: doc.id
        }));
    } catch (error) {
        console.error("Error fetching quizzes:", error);
        return [];
    }
};

/**
 * Delete a quiz
 * @param {string} quizId 
 */
export const deleteQuiz = async (quizId) => {
    try {
        const docRef = doc(db, 'quizzes', quizId);
        await deleteDoc(docRef);
        return true;
    } catch (error) {
        console.error("Error deleting quiz:", error);
        throw error;
    }
};

/**
 * Submit quiz answers (This could be expanded to save to a 'submissions' collection)
 * For now, we'll just mock the processing or update a local status if needed.
 * In a real app, you'd save the student's submission to a subcollection or separate collection.
 */
// export const submitQuiz = async (quizId, studentId, answers, score) => { ... }
