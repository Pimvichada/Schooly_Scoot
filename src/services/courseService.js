import { db } from '../../firebase';
import { collection, getDocs, addDoc, query, orderBy, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';

/**
 * Fetch all courses from Firestore
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
            createdAt: new Date().toISOString()
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
