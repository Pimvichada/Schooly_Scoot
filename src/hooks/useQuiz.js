import { useState, useEffect, useRef, useCallback } from 'react';
import { submitQuiz as submitQuizService, startQuizAttempt, getQuizSubmissions, getQuizzesByCourse, checkSubmission } from '../services/quizService';
import { createNotification } from '../services/notificationService';
import { auth } from '../../firebase';

export const useQuiz = (uid, profile, selectedCourse, activeModal, setActiveModal) => {
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [quizAnswers, setQuizAnswers] = useState({});
    const [quizResult, setQuizResult] = useState(null);
    const [quizRemainingSeconds, setQuizRemainingSeconds] = useState(0);

    const [mySubmissions, setMySubmissions] = useState({}); // Map: quizId -> submission
    const [courseSubmissions, setCourseSubmissions] = useState({}); // For teacher view
    const [selectedSubmission, setSelectedSubmission] = useState(null); // For detailed answer view
    const [manualScores, setManualScores] = useState({});

    // Fetch submissions if student
    useEffect(() => {
        const fetchSubmissions = async () => {
            if (uid && profile.role === 'student' && selectedCourse) {
                try {
                    const fetchedQuizzes = await getQuizzesByCourse(selectedCourse.name);
                    const submissionsMap = {};
                    await Promise.all(fetchedQuizzes.map(async (q) => {
                        const sub = await checkSubmission(q.firestoreId, uid);
                        if (sub) {
                            submissionsMap[q.firestoreId] = sub;
                        }
                    }));
                    setMySubmissions(submissionsMap);
                } catch (error) {
                    console.error("Error fetching student submissions:", error);
                }
            }
        };
        fetchSubmissions();
    }, [uid, profile.role, selectedCourse, getQuizzesByCourse, checkSubmission]);

    // Handle Start Quiz (Create Submission Record)
    const handleStartQuiz = async (quiz) => {
        // 1. Check if already submitted (UI should block, but double check)
        if (mySubmissions[quiz.firestoreId]) {
            alert("คุณทำแบบทดสอบนี้ไปแล้ว");
            return;
        }

        try {
            // 2. Create "In Progress" Submission
            const studentName = profile.firstName + ' ' + (profile.lastName || '');
            const submission = await startQuizAttempt(quiz.firestoreId, uid, studentName);

            // Safety Check: If backend returns an existing submission that is already submitted
            if (submission.status === 'submitted') {
                alert("ไม่อนุญาตให้ทำแบบทดสอบซ้ำ");
                // Sync local state
                setMySubmissions(prev => ({ ...prev, [quiz.firestoreId]: submission }));
                return;
            }

            // 3. Update Local State IMMEDIATELY (Block re-entry in UI)
            setMySubmissions(prev => ({ ...prev, [quiz.firestoreId]: submission }));

            // 4. Open Modal & Start Timer
            setActiveQuiz(quiz);
            const minutes = parseInt(quiz.time) || 0;
            setQuizRemainingSeconds(minutes * 60);
            setQuizAnswers({}); // Reset answers
            setQuizResult(null); // Reset result
            setActiveModal('takeQuiz');

        } catch (error) {
            console.error("Failed to start quiz:", error);
            alert("เกิดข้อผิดพลาดในการเริ่มทำข้อสอบ");
        }
    };

    const submitQuiz = useCallback(async () => {
        if (!uid || !activeQuiz) return;

        // Note: We don't always ask for confirmation here because this function is also called by the timer (auto-submit)
        // logic in App.jsx usually asks for confirmation via button click, but this function does the actual work.
        // Wait, the original code had `if (!confirm('ยืนยันที่จะส่งข้อสอบ?')) return;` INSIDE submitQuiz.
        // But for auto-submit, we probably skipped that? 
        // Checking original App.jsx: 
        //   const submitQuiz = async () => { ... if (!confirm...) ... }
        //   Timer calls `submitQuizRef.current()`.
        //   So the timer would trigger a confirmation dialog? That's bad UX for timeout.
        //   Let's check the timer logic in App.jsx again.
        //   It calls `submitQuizRef.current()`. 
        //   If the user is AFK, the confirm dialog blocks execution? 
        //   Actually, `window.confirm` blocks the script.
        //   Let's refine this: We should pass a `force` flag or similar.

        // Refactored to accept 'force' parameter

    }, [uid, activeQuiz, quizAnswers, profile, selectedCourse, setMySubmissions, setQuizResult]);

    // Re-implementing submitQuiz with a flag to bypass confirmation
    const handleSubmitQuiz = async (force = false) => {
        if (!uid || !activeQuiz) return;

        if (!force && !confirm('ยืนยันที่จะส่งข้อสอบ?')) return;

        let score = 0;
        let earnedPoints = 0;
        let totalPoints = 0;
        let hasManualGrading = false;

        // Calculate Score
        activeQuiz.items.forEach((item, idx) => {
            const answer = quizAnswers[idx];
            const itemPoints = Number(item.points) || 1; // Default to 1 if not set
            totalPoints += itemPoints;

            let isCorrect = false;

            if (!item.type || item.type === 'choice') {
                isCorrect = answer === item.correct;
            } else if (item.type === 'true_false') {
                isCorrect = answer === item.correctAnswer;
            } else if (item.type === 'matching') {
                const pairs = item.pairs || [];
                if (pairs.length > 0) {
                    isCorrect = pairs.every((p, pIdx) => {
                        const userRight = answer ? answer[pIdx] : null;
                        return userRight === p.right;
                    });
                }
            } else if (item.type === 'text') {
                if (item.manualGrading) {
                    hasManualGrading = true;
                    isCorrect = false; // Will be graded by teacher
                } else {
                    const userText = (answer || '').toString().trim().toLowerCase();
                    const keywords = (item.keywords || []).map(k => k.trim().toLowerCase());
                    isCorrect = keywords.some(k => userText.includes(k));
                }
            }

            if (isCorrect) {
                earnedPoints += itemPoints;
                score += 1; // Legacy count (optional to keep)
            }
        });

        const submissionData = {
            answers: quizAnswers,
            score: earnedPoints, // Use accumulated points
            total: totalPoints,  // Use accumulated total points
            correctCount: score, // Keep track of correct items count if needed
            hasManualGrading: hasManualGrading,
            studentName: profile.firstName + ' ' + (profile.lastName || ''),
            status: hasManualGrading ? 'pending_grading' : 'submitted'
        };

        try {
            const result = await submitQuizService(activeQuiz.firestoreId, user.uid, submissionData);
            setQuizResult(result);

            // Update local status of mySubmissions
            setMySubmissions(prev => ({
                ...prev,
                [activeQuiz.firestoreId]: { ...result, firestoreId: result.firestoreId } // Update with result
            }));

            // Notify Teacher
            if (selectedCourse?.ownerId && selectedCourse.ownerId !== user.uid) {
                await createNotification(
                    selectedCourse.ownerId,
                    `มีการส่งข้อสอบ: ${activeQuiz.title}`,
                    'quiz',
                    `${profile.firstName} ${profile.lastName || ''} ได้ส่งข้อสอบแล้ว`,
                    { courseId: selectedCourse.firestoreId, targetType: 'quiz_submission', targetId: activeQuiz.firestoreId }
                );
            }

            // Only alert if manual submission (not forced by timer)
            if (!force) {
                // alert('ส่งข้อสอบเรียบร้อย'); // The UI usually shows the result modal, maybe no need for alert
            }

        } catch (error) {
            console.error("Failed to submit quiz", error);
            alert('ส่งข้อสอบไม่สำเร็จ: ' + error.message);
        }
    };

    // Use a ref to access the latest submitQuiz function inside the interval
    const submitQuizRef = useRef(handleSubmitQuiz);
    useEffect(() => {
        submitQuizRef.current = handleSubmitQuiz;
    }, [handleSubmitQuiz]);

    // Quiz Timer Countdown & Auto Submit
    useEffect(() => {
        if (activeModal === 'takeQuiz' && !quizResult && quizRemainingSeconds > 0) {

            // Add BeforeUnload Event Listener
            const handleBeforeUnload = (e) => {
                e.preventDefault();
                e.returnValue = ''; // Trigger browser warning
            };
            window.addEventListener('beforeunload', handleBeforeUnload);

            const timer = setInterval(() => {
                setQuizRemainingSeconds(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        submitQuizRef.current(true); // Auto submit with Force=true
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            // Cleanup
            return () => {
                clearInterval(timer);
                window.removeEventListener('beforeunload', handleBeforeUnload);

                // AUTO SUBMIT ON EXIT (If not already submitted)
                if (activeModal !== 'takeQuiz') {
                    // This logic in original App.jsx was:
                    // submitQuizRef.current();
                    // But verify if we really want to auto-submit on simple close?
                    // The logic says "if (activeModal !== 'takeQuiz')" inside cleanup.
                    // This implies the modal was closed.
                    // If quizResult is NOT set (checked in dependency or condition), we submit.

                    // CAREFUL: This cleanup runs when `quizResult` changes too (because it is in dependency list of effect).
                    // But the effect condition `if (activeModal === 'takeQuiz' && !quizResult ...)` would be false if quizResult IS set.
                    // So this effect is torn down when quizResult becomes true.
                    // In that case, `activeModal` is likely still 'takeQuiz' (we just show results in same modal? or strictly switch view?)

                    // Let's look at how App.jsx toggles activeModal.
                    // When submitting, `setQuizResult` is called. The modal content changes to "results" but `activeModal` *might* still be 'takeQuiz'?
                    // Ah, looking at JSX: `{activeModal === 'takeQuiz' && activeQuiz && (...)}`
                    // Inside that logic: `{quizResult ? (Show Result) : (Show Questions)}`
                    // So `activeModal` STAYS 'takeQuiz'.

                    // So if `quizResult` becomes set, the effect cleanup runs.
                    // Inside cleanup: `if (activeModal !== 'takeQuiz')`
                    // Since activeModal IS 'takeQuiz', this block handles the "User closed modal manualy" case?
                    // No, if user closes modal, `activeModal` becomes null (or something else).
                    // So `if (activeModal !== 'takeQuiz')` is true.
                    // So it submits.

                    // But if `quizResult` becomes true, the effect cleans up.
                    // `activeModal` is still 'takeQuiz'.
                    // So `activeModal !== 'takeQuiz'` is false.
                    // So it does NOT double submit. Correct.

                    // So we need to keep this logic.
                    // But we can't read the *current* activeModal inside cleanup easily if it's stale closure?
                    // Actually, `activeModal` in the closure is the value from when effect ran.
                    // Wait, we need "current" value of activeModal to know if it CHANGED.
                    // No, cleanup runs. We want to know WHY it runs.
                    // If it runs because dependencies changed (`quizResult` became true), we shouldn't submit.
                    // If it runs because component unmounted or `activeModal` changed (user closed it), we should submit.

                    // The original code was:
                    /*
                     return () => {
                         ...
                         if (activeModal !== 'takeQuiz') { ... }
                     }
                    */
                    // But `activeModal` here is closed over. It will be 'takeQuiz' (the value that started the effect).
                    // So `activeModal !== 'takeQuiz'` will ALWAYS be false in the closure!
                    // UNLESS `activeModal` is a Ref? No, it's state.

                    // ACTUALLY, the original code in App.jsx might have been buggy or relying on something subtle.
                    // `activeModal` in the dependency array.
                    // When `activeModal` changes from 'takeQuiz' to null.
                    // The effect cleanup runs.
                    // But the scope of cleanup function captures `activeModal` from the render where effect started.
                    // So `activeModal` is 'takeQuiz'.
                    // So `if (activeModal !== 'takeQuiz')` is FALSE.
                    // So it would NEVER auto-submit on close?

                    // Let's re-read the original code provided by user in step 295.
                    /*
                     useEffect(() => {
                         if (activeModal === 'takeQuiz' ...) {
                             ...
                             return () => {
                                 ...
                                 if (activeModal !== 'takeQuiz') { submitQuizRef.current(); }
                             }
                         }
                     }, [activeModal, ...]);
                    */

                    // If activeModal changes to 'home', the effect re-runs (or just cleans up and doesn't restart).
                    // The cleanup runs. The closure sees `activeModal` as 'takeQuiz'.
                    // So `activeModal !== 'takeQuiz'` is false.
                    // So it does NOTHING.
                    // So the "Auto submit on exit" logic might have been broken in the original code?

                    // OR, does React provide the *new* value? No.

                    // Maybe they intended to use a Ref for activeModal?
                    // Or maybe I am misinterpreting providing code.

                    // User said: "ส่วนนี้สามารถแยกออกจากหน้าappได้มั้ย" (Can this part be extracted?)
                    // I should extract it AS IS, but maybe fix it if it's broken.
                    // But to be safe, I should duplicate the behavior or rely on a Ref to check current activeModal.

                    // Let's use a Ref to track activeModal to be sure we check the LATEST value in cleanup.
                }
            };
        }
    }, [activeModal, quizResult, quizRemainingSeconds, handleSubmitQuiz]);

    // Use a ref to check the LATEST activeModal in the cleanup function
    const activeModalRef = useRef(activeModal);
    useEffect(() => {
        activeModalRef.current = activeModal;
    }, [activeModal]);

    // Revised Timer Logic with Safe Cleanup
    useEffect(() => {
        if (activeModal === 'takeQuiz' && !quizResult && quizRemainingSeconds > 0) {
            const handleBeforeUnload = (e) => {
                e.preventDefault();
                e.returnValue = '';
            };
            window.addEventListener('beforeunload', handleBeforeUnload);

            const timer = setInterval(() => {
                setQuizRemainingSeconds(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        submitQuizRef.current(true); // Auto submit forceful
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => {
                clearInterval(timer);
                window.removeEventListener('beforeunload', handleBeforeUnload);

                // Check if we switched AWAY from takeQuiz (via Ref)
                // If activeModalRef.current is NOT 'takeQuiz', it means we closed it.
                // However, verification: when this cleanup runs, has the effect for the NEW activeModal run yet? 
                // Or has the ref been updated?
                // React updates refs in commit phase. Cleanup runs before the new effect? 
                // Usually cleanup runs, then new effect.
                // But the STATE `activeModal` changed. This triggers re-render.
                // 1. `activeModal` becomes null.
                // 2. Render. `activeModalRef` is updated via effect? No, effect runs after paint.
                // So `activeModalRef` might still be `takeQuiz` during the cleanup of the previous effect?
                // This is tricky.

                // Alternative: Use a mutable flag `isMounted` or just rely on the fact that if we aren't unmounting, we don't care?
                // If user accidentally closes modal.

                // Let's stick to the extracted code logic but perhaps assume the user wants it to work.
                // If I just supply `submitQuiz` logic, the `App.jsx` can call it.
                // But the user specifically pointed to the `useEffect` block.

                // Let's implement the Auto-Submit-On-Close logic carefully.
                // Using a separate effect to detect "Unmount of Quiz View" when quiz is in progress.
            };
        }
    }, [activeModal, quizResult, quizRemainingSeconds]);

    // Auto-submit on modal close check (Separate from timer to be clearer)
    const prevActiveModal = useRef(activeModal);
    useEffect(() => {
        // If we WERE taking quiz, and now we are NOT, and we don't have a result yet...
        if (prevActiveModal.current === 'takeQuiz' && activeModal !== 'takeQuiz' && !quizResult && quizRemainingSeconds > 0) {
            // Logic to submit
            // But wait, if we submit, `quizResult` gets set. 
            // We need to act BEFORE state is lost? 
            // Actually, `quizAnswers` state is inside this hook. It persists as long as `App` uses the hook.
            // So we CAN submit even after modal closes.
            submitQuizRef.current(true);
        }
        prevActiveModal.current = activeModal;
    }, [activeModal, quizResult, quizRemainingSeconds]);


    return {
        activeQuiz, setActiveQuiz,
        quizAnswers, setQuizAnswers,
        quizResult, setQuizResult,
        quizRemainingSeconds, setQuizRemainingSeconds,
        mySubmissions, setMySubmissions,
        courseSubmissions, setCourseSubmissions,
        selectedSubmission, setSelectedSubmission,
        manualScores, setManualScores,
        handleStartQuiz,
        submitQuiz: handleSubmitQuiz, // Expose as submitQuiz
        handleSubmitQuiz // Expose explicit name too if needed
    };
};
