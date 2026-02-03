import { useState } from 'react';
import { updateCourse } from '../services/courseService';
import { createNotification } from '../services/notificationService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export const useMeeting = () => {
    const [meetingConfig, setMeetingConfig] = useState({
        topic: '',
        isActive: false,
        roomName: ''
    });

    const startMeeting = async (selectedCourse, setActiveModal) => {
        if (!meetingConfig.topic) {
            alert('กรุณาระบุหัวข้อการเรียน');
            return;
        }

        const roomID = `SchoolyScoot_${selectedCourse.code}_${Date.now()}`;
        const meetingData = {
            topic: meetingConfig.topic,
            isActive: true,
            roomName: roomID
        };

        // 1. Update Local State
        setMeetingConfig(meetingData);
        setActiveModal('video');

        // 2. Sync to Firestore
        try {
            await updateCourse(selectedCourse.firestoreId, {
                meeting: meetingData
            });

            // 3. Notify Students
            const courseRef = doc(db, 'courses', selectedCourse.firestoreId);
            const courseSnap = await getDoc(courseRef);

            if (courseSnap.exists()) {
                const latestCourseData = courseSnap.data();
                if (latestCourseData.studentIds && latestCourseData.studentIds.length > 0) {
                    latestCourseData.studentIds.forEach(studentId => {
                        createNotification(
                            studentId,
                            `เข้าเรียน: ${meetingConfig.topic}`,
                            'meeting',
                            `วิชา ${selectedCourse.name} เริ่มการเรียนการสอนแล้ว! กดเพื่อเข้าร่วม`,
                            { courseId: selectedCourse.firestoreId, targetType: 'meeting' }
                        );
                    });
                }
            }
        } catch (error) {
            console.error("Failed to start meeting:", error);
            alert("เกิดข้อผิดพลาดในการเริ่มคลาสเรียน");
        }
    };

    return {
        meetingConfig,
        setMeetingConfig,
        startMeeting
    };
};
