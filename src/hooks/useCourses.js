import { useState, useEffect } from 'react';
import { getCoursesForUser } from '../services/courseService';
import { toggleHiddenCourse } from '../services/authService';
// Note: getCourseIcon might be in utils or courseService depending on file structure. 
// Based on previous view_file of App.jsx, getCourseIcon is imported from './utils/helpers.jsx'.
// But in line 6 of App.jsx, it imports from courseService? No, line 78 imports from helpers.
import { getCourseIcon as getIconFromUtils } from '../utils/helpers.jsx';
import { auth } from '../../firebase'; // Need auth for uid if not passed, but better to pass uid

export const useCourses = (isLoggedIn, userRole, uid, hiddenCourseIds, setHiddenCourseIds) => {
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        const fetchCourses = async () => {
            if (!isLoggedIn || !uid) return;

            try {
                const fetchedCourses = await getCoursesForUser(userRole, uid);
                if (fetchedCourses.length > 0) {
                    // Map icon string back to component
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
        fetchCourses();
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
