import { db } from '../../firebase';
import { collection, addDoc, getDocs, query, where, doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';

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
/**
 * Submit quiz answers
 * @param {string} quizId 
 * @param {string} studentId 
 * @param {Object} submissionData ({ score, total, answers, studentName })
 */
export const submitQuiz = async (quizId, studentId, submissionData) => {
    try {
        const submissionsCol = collection(db, 'quiz_submissions');
        const newSubmission = {
            quizId,
            studentId,
            ...submissionData,
            submittedAt: new Date().toISOString()
        };
        const docRef = await addDoc(submissionsCol, newSubmission);
        return { ...newSubmission, firestoreId: docRef.id };
    } catch (error) {
        console.error("Error submitting quiz:", error);
        throw error;
    }
};

/**
 * Check if student has submitted a quiz
 * @param {string} quizId 
 * @param {string} studentId 
 */
export const checkSubmission = async (quizId, studentId) => {
    try {
        const submissionsCol = collection(db, 'quiz_submissions');
        const q = query(
            submissionsCol,
            where('quizId', '==', quizId),
            where('studentId', '==', studentId)
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { ...doc.data(), firestoreId: doc.id };
    } catch (error) {
        console.error("Error checking submission:", error);
        return null;
    }
};

/**
 * Get all submissions for a quiz (Teacher View)
 * @param {string} quizId 
 */
export const getQuizSubmissions = async (quizId) => {
    try {
        const submissionsCol = collection(db, 'quiz_submissions');
        const q = query(submissionsCol, where('quizId', '==', quizId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            ...doc.data(),
            firestoreId: doc.id
        }));
    } catch (error) {
        console.error("Error fetching submissions:", error);
        return [];
    }
};



/**
 * Update a quiz
 * @param {string} quizId 
 * @param {Object} updateData 
 */
export const updateQuiz = async (quizId, updateData) => {
    try {
        const docRef = doc(db, 'quizzes', quizId);
        await updateDoc(docRef, updateData);
        return true;
    } catch (error) {
        console.error("Error updating quiz:", error);
        throw error;
    }
};


/**
 * Update a quiz submission score (Teacher Only)
 * @param {string} submissionId 
 * @param {number|string} newScore 
 */
export const updateQuizSubmissionScore = async (submissionId, newScore) => {
    try {
        const docRef = doc(db, 'quiz_submissions', submissionId);
        await updateDoc(docRef, { score: Number(newScore) });
        return true;
    } catch (error) {
        console.error("Error updating quiz score:", error);
        throw error;
    }
};

/**
 * Get a single quiz by ID
 * @param {string} quizId 
 */
export const getQuiz = async (quizId) => {
    try {
        const docRef = doc(db, 'quizzes', quizId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { ...docSnap.data(), firestoreId: docSnap.id };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error getting quiz:", error);
        throw error;
    }
};
