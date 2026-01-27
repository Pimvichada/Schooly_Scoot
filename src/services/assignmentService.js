import { db } from '../../firebase';
import { collection, getDocs, addDoc, query, where, updateDoc, doc, deleteDoc } from 'firebase/firestore';

/**
 * Fetch assignments for a course or user
 */
export const getAssignments = async (courseName, uid, role) => {
    try {
        const assignmentsCol = collection(db, 'assignments');
        let q;

        if (courseName) {
            q = query(assignmentsCol, where('course', '==', courseName));
        } else {
            // Fallback or fetch all for dashboard?
            q = query(assignmentsCol);
        }
        const snapshot = await getDocs(q);
        const assignments = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id, // Ensure id is present for App.jsx compatibility
            firestoreId: doc.id
        }));

        // If student, check submission status for each assignment
        if (role === 'student' && uid) {
            const enrichedAssignments = await Promise.all(assignments.map(async (assignment) => {
                try {
                    // Check if this assignment has a submission from this user
                    const subCol = collection(db, 'assignments', assignment.firestoreId, 'submissions');
                    const subQuery = query(subCol, where('userId', '==', uid));
                    const subSnapshot = await getDocs(subQuery);

                    if (!subSnapshot.empty) {
                        const submission = subSnapshot.docs[0].data();
                        let files = [];
                        if (Array.isArray(submission.file)) {
                            files = submission.file;
                        } else if (submission.file) {
                            files = [submission.file];
                        }

                        return {
                            ...assignment,
                            status: 'submitted',
                            submittedFiles: files,
                            score: submission.score,
                            submittedAt: submission.submittedAt
                        };
                    }

                    // If no submission found for this student, force status to 'pending'

                    return {
                        ...assignment,
                        status: 'pending',
                        submittedFiles: [],
                        score: null
                    };
                } catch (err) {
                    console.error(`Error checking submission for ${assignment.firestoreId}:`, err);
                    return assignment;
                }
            }));
            return enrichedAssignments;
        }

        // If teacher, check if there are ANY submissions to categorize as "submitted" (Active/Grading)
        // versus "pending" (No submissions yet)
        // If teacher, check if there are ANY submissions to categorize as "submitted" (Active/Grading)
        // versus "pending" (No submissions yet)
        if (role === 'teacher') {
            const enrichedAssignments = await Promise.all(assignments.map(async (assignment) => {
                try {
                    const subCol = collection(db, 'assignments', assignment.firestoreId, 'submissions');
                    const subSnapshot = await getDocs(subCol);

                    let pendingCount = 0;
                    if (!subSnapshot.empty) {
                        subSnapshot.docs.forEach(doc => {
                            const data = doc.data();
                            if (!data.score) pendingCount++;
                        });
                    }

                    // Strict Completion Rule:
                    // 1. Fetch Course to get total students
                    // Optimally, we should query courses once, but for now per-assignment is safer for correctness
                    const coursesCol = collection(db, 'courses');
                    // Assuming assignment.course is the Name. It's better if we had courseId in assignment.
                    const qCourse = query(coursesCol, where('name', '==', assignment.course)); // assignment.course is Name
                    // const courseSnap = await getDocs(qCourse); // Unused for now but kept logic flow

                    if (!subSnapshot.empty) {
                        const subs = subSnapshot.docs.map(doc => doc.data());
                        return {
                            ...assignment,
                            status: 'submitted',
                            submissionCount: subSnapshot.size,
                            submissions: subs // Return full details
                        };
                    }
                    return {
                        ...assignment,
                        submissions: []
                    };
                } catch (err) {
                    console.error("Error checking teacher submissions:", err);
                    return assignment;
                }
            }));
            return enrichedAssignments;
        }

        return assignments;
    } catch (error) {
        console.error("Error getting assignments:", error);
        return [];
    }
};

/**
 * Seed initial assignments
 */
export const seedAssignments = async () => {
    const INITIAL_ASSIGNMENTS = [
        { title: 'แบบฝึกหัดบทที่ 1', course: 'คณิตศาสตร์พื้นฐาน', dueDate: null, status: 'pending', score: null },
        { title: 'สรุปผลการทดลอง', course: 'วิทยาศาสตร์ทั่วไป', dueDate: null, status: 'submitted', score: '8/10' },
        { title: 'แต่งกลอนสุภาพ', course: 'ภาษาไทยเพื่อการสื่อสาร', dueDate: null, status: 'pending', score: null },
    ];

    try {
        const col = collection(db, 'assignments');
        // Check if empty to avoid duplicate seeding (optional, but good practice)
        const snapshot = await getDocs(col);
        if (!snapshot.empty) return;

        for (const assign of INITIAL_ASSIGNMENTS) {
            await addDoc(col, assign);
        }
    } catch (error) {
        console.error("Error seeding assignments:", error);
    }
};

export const createAssignment = async (assignmentData) => {
    try {
        const col = collection(db, 'assignments');
        const docRef = await addDoc(col, assignmentData);
        return { ...assignmentData, firestoreId: docRef.id };
    } catch (error) {
        console.error("Error creating assignment:", error);
        throw error;
    }
};

export const updateAssignmentStatus = async (id, status, score = null) => {
    try {
        const ref = doc(db, 'assignments', id);
        await updateDoc(ref, { status, score });
    } catch (error) {
        console.error("Error updating assignment:", error);
        throw error;
    }
}

/**
 * Submit an assignment
 */
export const submitAssignment = async (assignmentId, userId, userName, file) => {
    try {
        const subCol = collection(db, 'assignments', assignmentId, 'submissions');
        await addDoc(subCol, {
            userId,
            userName,
            file,
            submittedAt: new Date().toISOString(),
            status: 'submitted',
            score: ''
        });

        // Also update status in main assignment doc if needed? 
        // Actually, status is per user. The generic assignment doc shouldn't change status.
        // But for the student's view, we need to know their status.
        // We might need a separate 'assignment_status' collection or query submissions.
    } catch (error) {
        console.error("Error submitting assignment:", error);
        throw error;
    }
};

/**
 * Get submissions for grading
 */
export const getSubmissions = async (assignmentId) => {
    try {
        console.log("Fetching submissions for Assignment ID:", assignmentId);
        if (!assignmentId) {
            console.error("getSubmissions called with empty ID");
            return [];
        }
        const subCol = collection(db, 'assignments', assignmentId, 'submissions');
        const snapshot = await getDocs(subCol);
        return snapshot.docs.map(doc => ({ ...doc.data(), firestoreId: doc.id }));
    } catch (error) {
        console.error("Error getting submissions:", error);
        return [];
    }
};

/**
 * Delete an assignment
 */
export const deleteAssignment = async (id) => {
    try {
        const ref = doc(db, 'assignments', id);
        await deleteDoc(ref);
    } catch (error) {
        console.error("Error deleting assignment:", error);
        throw error;
    }
};


/**
 * Grade a submission
 */
export const gradeSubmission = async (assignmentId, submissionId, score) => {
    try {
        const ref = doc(db, 'assignments', assignmentId, 'submissions', submissionId);
        await updateDoc(ref, { score });
    } catch (error) {
        console.error("Error grading submission:", error);
        throw error;
    }
};
