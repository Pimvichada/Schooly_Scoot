import { db } from '../../firebase';
import { collection, getDocs, addDoc, query, where, updateDoc, doc, deleteDoc, collectionGroup } from 'firebase/firestore';

/**
 * Fetch assignments for a course or user
 */
export const getAssignments = async (courseName, uid, role, courseNames = null) => {
    try {
        const assignmentsCol = collection(db, 'assignments');
        let q;

        if (courseName) {
            q = query(assignmentsCol, where('course', '==', courseName));
        } else if (role === 'teacher' && uid) {
            // OPTIMIZATION: Only fetch assignments owned by this teacher
            q = query(assignmentsCol, where('ownerId', '==', uid));
        } else if (role === 'student' && courseNames && courseNames.length > 0) {
            // List of courses the student is in
            q = query(assignmentsCol, where('course', 'in', courseNames.slice(0, 30)));
        } else {
            // For students or general view, we might still need to fetch more, 
            // but we'll try to keep it as focused as possible.
            q = query(assignmentsCol);
        }
        const snapshot = await getDocs(q);
        const assignments = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
            firestoreId: doc.id
        }));

        // If student, check submission status for each assignment efficiently
        if (role === 'student' && uid) {
            // OPTIMIZATION: Fetch ALL submissions for this student in ONE query
            const allSubmissionsQuery = query(collectionGroup(db, 'submissions'), where('userId', '==', uid));
            const allSubmissionsSnapshot = await getDocs(allSubmissionsQuery);

            // Map by parent assignment ID for quick lookup
            const submissionsByAssignment = {};
            allSubmissionsSnapshot.docs.forEach(doc => {
                const subData = doc.data();
                // Parent of 'submissions' doc is 'assignments' doc
                const assignmentId = doc.ref.parent.parent.id;
                submissionsByAssignment[assignmentId] = subData;
            });

            const enrichedAssignments = assignments.map((assignment) => {
                const submission = submissionsByAssignment[assignment.firestoreId];

                if (submission) {
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

                return {
                    ...assignment,
                    status: 'pending',
                    submittedFiles: [],
                    score: null
                };
            });
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
                            status: subSnapshot.empty ? 'pending' : (pendingCount > 0 ? 'pending_review' : 'submitted'),
                            submissionCount: subSnapshot.size,
                            pendingCount: pendingCount,
                            submissions: subs
                        };
                    }
                    return {
                        ...assignment,
                        status: 'pending',
                        submissionCount: 0,
                        pendingCount: 0,
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
        const newAssignment = { ...assignmentData, createdAt: new Date().toISOString() };
        const docRef = await addDoc(col, newAssignment);
        return { ...newAssignment, firestoreId: docRef.id };
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
