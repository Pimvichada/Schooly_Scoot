import { db } from '../../firebase';
import { collection, getDocs, addDoc, query, where, updateDoc, doc, deleteDoc, collectionGroup, onSnapshot } from 'firebase/firestore';

/**
 * Fetch assignments for a course or user
 */
export const getAssignments = async (courseName, uid, role, courseNames = null) => {
    try {
        const assignmentsCol = collection(db, 'assignments');
        let q;

        if (courseName) {
            q = query(assignmentsCol, where('course', '==', courseName));
        } else if (courseNames && courseNames.length > 0) {
            // Filter by multiple course names (only first 10 due to firestore limit, but usually enough)
            q = query(assignmentsCol, where('course', 'in', courseNames.slice(0, 10)));
        } else {
            // Fetch all assignments and filter/enrich based on user
            q = query(assignmentsCol);
        }
        const snapshot = await getDocs(q);
        currentAssignments = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                firestoreId: doc.id,
                course: (data.course || '').trim()
            };
        });

        // If student, check submission status for each assignment
        if (role === 'student' && uid) {
            let submissionsByAssignment = {};
            try {
                // Try efficient group query (requires index)
                const allSubmissionsQuery = query(collectionGroup(db, 'submissions'), where('userId', '==', uid));
                const allSubmissionsSnapshot = await getDocs(allSubmissionsQuery);
                allSubmissionsSnapshot.docs.forEach(doc => {
                    submissionsByAssignment[doc.ref.parent.parent.id] = doc.data();
                });
            } catch (err) {
                console.warn("CollectionGroup query failed (index possibly missing), falling back to individual checks.");
                // Fallback to slower but safe individual checks
                return await Promise.all(assignments.map(async (assign) => {
                    const subCol = collection(db, 'assignments', assign.firestoreId, 'submissions');
                    const subSnapshot = await getDocs(query(subCol, where('userId', '==', uid)));
                    if (!subSnapshot.empty) {
                        const sub = subSnapshot.docs[0].data();
                        return {
                            ...assign,
                            status: 'submitted',
                            submittedFiles: Array.isArray(sub.file) ? sub.file : (sub.file ? [sub.file] : []),
                            score: sub.score,
                            submittedAt: sub.submittedAt
                        };
                    }
                    return { ...assign, status: 'pending', submittedFiles: [], score: null };
                }));
            }

            return assignments.map((assign) => {
                const sub = submissionsByAssignment[assign.firestoreId];
                if (sub) {
                    return {
                        ...assign,
                        status: 'submitted',
                        submittedFiles: Array.isArray(sub.file) ? sub.file : (sub.file ? [sub.file] : []),
                        score: sub.score,
                        submittedAt: sub.submittedAt
                    };
                }
                return { ...assign, status: 'pending', submittedFiles: [], score: null };
            });
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
 * Subscribe to assignments with real-time updates
 */
export const subscribeToAssignments = (uid, role, courseNames, callback) => {
    if (!uid) {
        callback([]);
        return () => { };
    }

    const assignmentsCol = collection(db, 'assignments');
    let q;

    // Robust course name trimming
    const trimmedCourseNames = (courseNames || [])
        .map(n => typeof n === 'string' ? n.trim() : n)
        .filter(Boolean);

    if (trimmedCourseNames.length > 0) {
        q = query(assignmentsCol, where('course', 'in', trimmedCourseNames.slice(0, 10)));
    } else if (role === 'teacher') {
        q = query(assignmentsCol);
    } else {
        callback([]);
        return () => { };
    }

    let currentAssignments = [];
    let currentSubmissions = {};
    let unsubSubmissions = null;
    let isInitialSubmissionsLoaded = false;

    // Helper to fetch submissions manually for all assignments
    const fetchSubmissionsEagerly = async (assignments) => {
        if (role !== 'student' || !uid || assignments.length === 0) return {};

        const subs = {};
        await Promise.all(assignments.map(async (assign) => {
            try {
                const targetId = assign.firestoreId || assign.id;
                const subCol = collection(db, 'assignments', targetId, 'submissions');
                const qSub = query(subCol, where('userId', '==', uid));
                const subSnap = await getDocs(qSub);
                if (!subSnap.empty) {
                    subs[targetId] = subSnap.docs[0].data();
                }
            } catch (e) {
                console.warn(`Manual sub fetch failed for ${assign.id}:`, e);
            }
        }));
        return subs;
    };

    const processData = async () => {
        if (currentAssignments.length === 0) {
            callback([]);
            return;
        }

        // Deep copy and prepare IDs
        let finalAssignments = currentAssignments.map(assign => ({
            ...assign,
            joinId: assign.firestoreId || assign.id
        }));

        if (role === 'student' && uid) {
            finalAssignments = finalAssignments.map((assign) => {
                const sub = currentSubmissions[assign.joinId];
                if (sub) {
                    return {
                        ...assign,
                        status: 'submitted',
                        submittedFiles: Array.isArray(sub.file) ? sub.file : (sub.file ? [sub.file] : []),
                        score: sub.score || null,
                        submittedAt: sub.submittedAt
                    };
                }
                // If we haven't even loaded submissions yet, we might want to wait or show loading
                // But for now, default to pending
                return { ...assign, status: 'pending', submittedFiles: [], score: null };
            });
        } else if (role === 'teacher') {
            finalAssignments = await Promise.all(finalAssignments.map(async (assignment) => {
                try {
                    const subCol = collection(db, 'assignments', assignment.joinId, 'submissions');
                    const subSnapshot = await getDocs(subCol);
                    let pendingCount = 0;
                    if (!subSnapshot.empty) {
                        subSnapshot.docs.forEach(doc => {
                            if (!doc.data().score) pendingCount++;
                        });
                        const subs = subSnapshot.docs.map(doc => ({ ...doc.data(), firestoreId: doc.id }));
                        return {
                            ...assignment,
                            status: (pendingCount > 0 ? 'pending_review' : 'submitted'),
                            submissionCount: subSnapshot.size,
                            pendingCount: pendingCount,
                            submissions: subs
                        };
                    }
                    return { ...assignment, status: 'pending', submissionCount: 0, pendingCount: 0, submissions: [] };
                } catch (err) { return assignment; }
            }));
        }

        callback(finalAssignments);
    };

    // 1. Listen to Assignments
    const unsubAssignments = onSnapshot(q, async (snapshot) => {
        const newAssignments = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
            firestoreId: doc.id,
            course: (doc.data().course || '').trim()
        }));

        currentAssignments = newAssignments;

        // On first assignment load, also do an eager submission fetch for students
        if (role === 'student' && !isInitialSubmissionsLoaded) {
            const initialSubs = await fetchSubmissionsEagerly(newAssignments);
            currentSubmissions = { ...currentSubmissions, ...initialSubs };
            isInitialSubmissionsLoaded = true;
        }

        processData();
    }, (error) => {
        console.error("Error in assignments subscription:", error);
    });

    // 2. Listen to Submissions group-wide (Student only)
    if (role === 'student') {
        try {
            const subGroupQ = query(collectionGroup(db, 'submissions'), where('userId', '==', uid));
            unsubSubmissions = onSnapshot(subGroupQ, (snapshot) => {
                const updatedSubs = { ...currentSubmissions };
                snapshot.docs.forEach(doc => {
                    const assignmentId = doc.ref.parent.parent.id;
                    if (assignmentId) {
                        updatedSubs[assignmentId] = doc.data();
                    }
                });
                currentSubmissions = updatedSubs;
                isInitialSubmissionsLoaded = true;
                processData();
            }, (err) => {
                console.warn("Submissions listener failed (index possibly missing), relying on eager fetch fallback");
            });
        } catch (e) {
            console.error("Submissions group listener setup failed:", e);
        }
    }

    return () => {
        unsubAssignments();
        if (unsubSubmissions) unsubSubmissions();
    };
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
