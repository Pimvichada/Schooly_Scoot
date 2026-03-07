import { useState, useEffect } from 'react';
import { getCoursesForUser } from '../services/courseService';
import { toggleHiddenCourse } from '../services/authService';
import { getCourseIcon as getIconFromUtils } from '../utils/helpers.jsx';
import { auth } from '../../firebase'; // Need auth for uid if not passed, but better to pass uid
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

export const useCourses = (isLoggedIn, userRole, uid, hiddenCourseIds, setHiddenCourseIds) => {
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        if (!isLoggedIn || !uid) {
            setCourses([]);
            return;
        }

        const coursesCol = collection(db, 'courses');
        let q;

        if (userRole === 'teacher') {
            q = query(coursesCol, where('ownerId', '==', uid));
        } else {
            q = query(coursesCol, where('studentIds', 'array-contains', uid));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const courseList = snapshot.docs.map(doc => ({
                ...doc.data(),
                firestoreId: doc.id
            }));
            const coursesWithIcons = courseList.map(c => ({
                ...c,
                icon: getIconFromUtils(c.iconType)
            }));
            setCourses(coursesWithIcons);
        }, (error) => {
            console.error("Error subscribing to courses:", error);
        });

        return unsubscribe;
    }, [isLoggedIn, userRole, uid]);

    const handleToggleHideCourse = async (course) => {
        if (!uid) return;
        const isHidden = hiddenCourseIds.includes(course.firestoreId);

        // Optimistic Update via prop setter
        const newHiddenIds = isHidden
            ? hiddenCourseIds.filter(id => id !== course.firestoreId)
            : [...hiddenCourseIds, course.firestoreId];

        setHiddenCourseIds(newHiddenIds);

        try {
            await toggleHiddenCourse(uid, course.firestoreId, !isHidden);
        } catch (error) {
            console.error("Failed to toggle hide", error);
            // Revert if failed
            setHiddenCourseIds(hiddenCourseIds); // Revert to original
        }
    };

    const refreshCourses = async () => {
        if (!isLoggedIn || !uid) return;
        try {
            const fetchedCourses = await getCoursesForUser(userRole, uid);
            if (fetchedCourses.length > 0) {
                const coursesWithIcons = fetchedCourses.map(c => ({
                    ...c,
                    icon: getIconFromUtils(c.iconType)
                }));
                setCourses(coursesWithIcons);
            } else {
                setCourses([]);
            }
        } catch (err) {
            console.error("Failed to load courses", err);
        }
    };

    return {
        courses,
        setCourses, // Expose setter if needed for optimistic updates elsewhere
        handleToggleHideCourse,
        refreshCourses
    };
};
