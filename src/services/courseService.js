import { db } from '../../firebase';
import { collection, getDocs, addDoc, query, orderBy, serverTimestamp, deleteDoc, doc, where, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

/**
 * Fetch courses based on user role
 * @param {string} role - 'student' or 'teacher'
 * @param {string} uid - User ID
 */
export const getCoursesForUser = async (role, uid) => {
    try {
        const coursesCol = collection(db, 'courses');
        let q;

        if (role === 'teacher') {
            // Teachers see the courses they created
            q = query(coursesCol, where('ownerId', '==', uid));
        } else {
            // Students see courses they are enrolled in
            q = query(coursesCol, where('studentIds', 'array-contains', uid));
        }

        const courseSnapshot = await getDocs(q);
        const courseList = courseSnapshot.docs.map(doc => ({
            ...doc.data(),
            firestoreId: doc.id
        }));
        return courseList;
    } catch (error) {
        console.error("Error getting courses:", error);
        return []; // Return empty array on error (or if no courses found/permission denied)
    }
};

/**
 * Fetch all courses (Legacy/Admin usage or Fallback)
 */
export const getAllCourses = async () => {
    try {
        const coursesCol = collection(db, 'courses');
        const q = query(coursesCol, orderBy('id')); // Order by ID to keep consistent with mock
        const courseSnapshot = await getDocs(q);
        const courseList = courseSnapshot.docs.map(doc => ({
            ...doc.data(),
            // Firestore stores ID as document ID, but we might want to keep numerical ID for now if used elsewhere
            // or just use data().id if provided
            firestoreId: doc.id
        }));
        return courseList;
    } catch (error) {
        console.error("Error getting courses:", error);
        throw error;
    }
};

/**
 * Seed initial courses data (Run once)
 * @param {Array} coursesData 
 */
export const seedCourses = async (coursesData) => {
    try {
        const coursesCol = collection(db, 'courses');
        // check if empty first? or just append? 
        // for safety, let's just add them
        for (const course of coursesData) {
            // Remove the JSX icon component before saving to DB, as functions/components can't be stored
            // We'll handle icon rendering on frontend based on an icon name/key
            const { icon, ...courseData } = course;
            // Add a field to identify icon type
            let iconType = 'square';
            if (course.color.includes('BEE1FF')) iconType = 'circle';
            else if (course.color.includes('FF917B')) iconType = 'triangle';
            else if (course.color.includes('FFE787')) iconType = 'star';

            await addDoc(coursesCol, {
                ...courseData,
                iconType
            });
        }
        console.log("Courses seeded successfully");
    } catch (error) {
        console.error("Error seeding courses:", error);
    }
};

/**
 * Create a new course
 * @param {Object} courseData 
 */
export const createCourse = async (courseData) => {
    try {
        const coursesCol = collection(db, 'courses');

        // Determine iconType based on color or default
        let iconType = 'square';
        if (courseData.color?.includes('BEE1FF')) iconType = 'circle';
        else if (courseData.color?.includes('FF917B')) iconType = 'triangle';
        else if (courseData.color?.includes('FFE787')) iconType = 'star';

        const newCourse = {
            ...courseData,
            id: Date.now(), // Simple ID generation
            iconType,
            feed: [], // Initial empty feed
            createdAt: new Date().toISOString(),
            inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(), // Generate 6-char code
            studentIds: [], // Init empty student list
            ownerId: courseData.ownerId // Teacher's UID
        };

        const docRef = await addDoc(coursesCol, newCourse);
        return { ...newCourse, firestoreId: docRef.id };
    } catch (error) {
        console.error("Error creating course:", error);
        throw error;
    }
};

/**
 * Delete a course by document ID
 * @param {string} courseId - The Firestore document ID
 */
export const deleteCourse = async (courseId) => {
    try {
        const courseDocRef = doc(db, 'courses', courseId);
        await deleteDoc(courseDocRef);
        return true;
    } catch (error) {
        console.error("Error deleting course:", error);
        throw error;
    }
};

/**
 * Join a course using invite code
 * @param {string} inviteCode 
 * @param {string} studentUid 
 */
export const joinCourse = async (inviteCode, studentUid) => {
    try {
        const coursesCol = collection(db, 'courses');
        const q = query(coursesCol, where('inviteCode', '==', inviteCode));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error("ไม่พบห้องเรียนที่มีรหัสนี้");
        }

        const courseDoc = querySnapshot.docs[0];
        const courseRef = doc(db, 'courses', courseDoc.id);

        // Check if already joined
        if (courseDoc.data().studentIds?.includes(studentUid)) {
            throw new Error("คุณอยู่ในห้องเรียนนี้อยู่แล้ว");
        }

        await updateDoc(courseRef, {
            studentIds: arrayUnion(studentUid)
        });

        return { ...courseDoc.data(), firestoreId: courseDoc.id };
    } catch (error) {
        console.error("Error joining course:", error);
        throw error;
    }
};

/**
 * Update course details
 * @param {string} courseId 
 * @param {Object} updateData 
 */
export const updateCourse = async (courseId, updateData) => {
    try {
        const courseRef = doc(db, 'courses', courseId);
        await updateDoc(courseRef, updateData);
        return true;
    } catch (error) {
        console.error("Error updating course:", error);
        throw error;
    }
};

/**
 * Leave a course
 * @param {string} courseId 
 * @param {string} studentUid 
 */
export const leaveCourse = async (courseId, studentUid) => {
    try {
        const courseRef = doc(db, 'courses', courseId);
        await updateDoc(courseRef, {
            studentIds: arrayRemove(studentUid)
        });
        return true;
    } catch (error) {
        console.error("Error leaving course:", error);
        throw error;
    }
};
