import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getUserProfile, logoutUser, updateUserProfile, toggleHiddenCourse, getUserDetails } from './services/authService';
import { getAllCourses, seedCourses, createCourse, deleteCourse, getCoursesForUser, joinCourse, updateCourse, leaveCourse, approveJoinRequest, rejectJoinRequest } from './services/courseService';
import { createQuiz, getQuizzesByCourse, deleteQuiz, updateQuiz, submitQuiz as submitQuizService, checkSubmission, getQuizSubmissions, updateQuizSubmissionScore, updateQuizSubmission, getQuiz, startQuizAttempt } from './services/quizService';
import { getAssignments, seedAssignments, submitAssignment, getSubmissions, updateAssignmentStatus, createAssignment, deleteAssignment, gradeSubmission } from './services/assignmentService';
import { getNotifications, seedNotifications, markNotificationAsRead, createNotification, markAllNotificationsAsRead, subscribeToNotifications } from './services/notificationService';
import { createPost, getPostsByCourse, subscribeToPosts, addComment, getComments, toggleLikePost, deletePost, updatePost, toggleHidePost } from './services/postService';
// import { getChats, seedChats, sendMessage } from './services/chatService';
import { getUsersByIds } from './services/authService';
import { uploadFile } from './services/uploadService';
import LoginPage from './components/LoginPage';
import AnalyticsView from './components/AnalyticsView';
import { useWelcomeMessage } from './hooks/useWelcomeMessage';
import { useAuthUser } from './hooks/useAuthUser';
import { useCourses } from './hooks/useCourses';
import { useNotifications } from './hooks/useNotifications';
import { useTime } from './hooks/useTime';
import { useMeeting } from './hooks/useMeeting';
import { useQuiz } from './hooks/useQuiz';
import { usePosts } from './hooks/usePosts';


import {
  BookOpen,
  Calendar,
  CheckSquare,
  Bell,
  User,
  LogOut,
  PieChart,
  FileText,
  Upload,
  Users,
  Plus,
  Search,
  MoreVertical,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  Settings,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Save,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Lock,
  Info,
  Paperclip,
  ArrowRight,
  Clock,
  CheckCircle2,
  HelpCircle,
  Trash,
  Award,
  Heart,
  Star,
  Zap,
  GraduationCap,
  Smile,
  Copy,
  Edit2,
  EyeOff,
  Eye,
  Trash2,
} from 'lucide-react';

import { MascotCircle, MascotSquare, MascotTriangle, Cute1 } from './components/Mascots';

import { timeToMinutes, isOverlap, getCourseIcon, WELCOME_MESSAGES } from './utils/helpers.jsx';

import Sidebar, { MobileHeader, TopHeader } from './components/Sidebar';
import NotificationItem, { NotificationModals } from './components/NotificationItem';
import VideoConference from './components/VideoConference';
import RegisterPage from './components/RegisterPage';
import CalendarPage from './components/CalendarPage';
import DashboardView from './components/DashboardView';
import CoursesView from './components/CoursesView';
import AssignmentsView, { AssignmentDetailModal, CreateAssignmentModal, GradingModal } from './components/AssignmentsView';
import ScheduleView from './components/ScheduleView';
import SettingsView, { EditProfileModal } from './components/SettingsView';
import PostItem from './components/PostItem';
import ToastNotification from './components/ToastNotification';
import QuizModals from './components/QuizModals';
import CourseDetailView, { CourseModals } from './components/CourseDetailView';
import notiSoundUrl from './assets/notisound.mp3';
import logo_no_text from './assets/logo_no_tex3.png';



// --- MAIN COMPONENT ---
export default function SchoolyScootLMS() {

  // --- Custom Hooks ---
  const {
    uid, isLoggedIn, userRole, authLoading, profile,
    hiddenCourseIds, setHiddenCourseIds,
    editProfileData, setEditProfileData, isSavingProfile,
    handleUpdateProfile, handleProfileImageUpload
  } = useAuthUser();

  // Notification Settings (Persistent) - Kept here as it's passed to hook
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem('schooly_notifications_enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const {
    courses, setCourses, handleToggleHideCourse, refreshCourses
  } = useCourses(isLoggedIn, userRole, uid, hiddenCourseIds, setHiddenCourseIds);

  const {
    notifications, activeNotifications,
    addNotification, removeNotification, markAsRead, markAllRead
  } = useNotifications(uid, notificationsEnabled);

  const currentTime = useTime(); // Global Time

  const { meetingConfig, setMeetingConfig, startMeeting } = useMeeting();

  const welcomeMessage = useWelcomeMessage(userRole);

  // States that remain in App.jsx (UI specific or not yet refactored)
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [workView, setWorkView] = useState('current');
  // const [currentView, setCurrentView] = useState('login'); // 'current' หรือ 'all'
  // const [authLoading, setAuthLoading] = useState(true); // Handled by useAuthUser
  // const [hiddenCourseIds, setHiddenCourseIds] = useState([]); // Handled by useAuthUser
  const [currentView, setCurrentView] = useState('landing');
  const [isLoading, setIsLoading] = useState(false);

  // Meeting State - Handled by useMeeting
  // const [meetingConfig, setMeetingConfig] = useState({...});

  // Time State - Handled by useTime
  // const [currentTime, setCurrentTime] = useState(new Date());
  // States for course selection and tabs (needed by hooks)
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseTab, setCourseTab] = useState('home');

  // App Settings & UI State
  const [fontSize, setFontSize] = useState(100);
  const [darkMode, setDarkMode] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ day: '1', start: '', end: '', room: '' });
  const [editingScheduleIndex, setEditingScheduleIndex] = useState(null);

  // Modal State needs to be defined BEFORE useQuiz because useQuiz uses it (pass setter or value)
  const [activeModal, setActiveModal] = useState(null);

  const {
    activeQuiz, setActiveQuiz,
    quizAnswers, setQuizAnswers,
    quizResult, setQuizResult,
    quizRemainingSeconds, setQuizRemainingSeconds,
    mySubmissions, setMySubmissions,
    courseSubmissions, setCourseSubmissions,
    selectedSubmission, setSelectedSubmission,
    manualScores, setManualScores,
    handleStartQuiz,
    submitQuiz
  } = useQuiz(uid, profile, selectedCourse, activeModal, setActiveModal);

  const {
    posts, setPosts, newPostContent, setNewPostContent, newPostFiles, setNewPostFiles,
    loading: postsLoading, handleCreatePost, handleDeletePost, handleEditPost,
    handlePostFileSelect, handleRemovePostFile
  } = usePosts(uid, profile, selectedCourse);


  const [quizzes, setQuizzes] = useState([]);
  const [pendingGradingList, setPendingGradingList] = useState([]);
  const [monitoredQuizzes, setMonitoredQuizzes] = useState([]); // Upcoming scheduled quizzes






  // Global Font Scale Effect
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
  }, [fontSize]);


  // Profile State - Handled by useAuthUser
  // const [profile, setProfile] = useState({...});
  // const welcomeMessage = useMemo(...) -> Replaced with hook above

  // Auth Effect - Handled by useAuthUser


  // Custom Hooks Usage replaced local state/effects
  // courses -> useCourses
  // selectedCourse logic remains here 

  // UI State Refs
  const fileInputRef = useRef(null);

  // State for creating course
  const [editingCourse, setEditingCourse] = useState(null); // State for editing in settings
  const [newCourseData, setNewCourseData] = useState({
    name: '', code: '', color: 'bg-[#96C68E]', description: '',
    startDate: '', endDate: '',
    scheduleItems: [] // {dayOfWeek: 1, startTime: '08:30', endTime: '10:30', room: '421' }
  });
  const [joinCode, setJoinCode] = useState(''); // State for student joining

  // Fetch Courses handled by useCourses

  // Handle Toggle Hide Course handled by useCourses

  // Filter visible and hidden courses


  // Filter visible and hidden courses
  const visibleCourses = courses.filter(c => !hiddenCourseIds.includes(c.firestoreId));
  const hiddenCoursesList = courses.filter(c => hiddenCourseIds.includes(c.firestoreId));
  const [showHiddenCourses, setShowHiddenCourses] = useState(false);


  // Real-time listener for selected course
  useEffect(() => {
    if (!selectedCourse?.firestoreId) return;

    const courseRef = doc(db, 'courses', selectedCourse.firestoreId);
    const unsubscribe = onSnapshot(courseRef, (docSnap) => {
      if (docSnap.exists()) {
        const courseData = docSnap.data();

        // Sync Meeting State
        if (courseData.meeting) {
          setMeetingConfig(prev => ({
            ...prev,
            ...courseData.meeting
          }));
        } else {
          setMeetingConfig(prev => ({ ...prev, isActive: false }));
        }

        // Update selected course data continuously
        // setSelectedCourse(prev => ({...prev, ...courseData })); // Careful with recursion/re-renders if not handled
      }
    });



    return () => unsubscribe();
  }, [selectedCourse?.firestoreId]);



  // Fetch quizzes when entering a course or changing tab to quizzes
  // Fetch quizzes and submissions
  useEffect(() => {
    const fetchQuizzesAndSubmissions = async () => {
      if (selectedCourse && (courseTab === 'quizzes' || courseTab === 'grades')) {
        const q = await getQuizzesByCourse(selectedCourse.name);
        setQuizzes(q);

        // Fetch Submissions if Student
        if (userRole === 'student' && auth.currentUser) {
          const submissions = {};
          for (const quiz of q) {
            const sub = await checkSubmission(quiz.firestoreId, auth.currentUser.uid);
            if (sub) submissions[quiz.firestoreId] = sub;
          }
          setMySubmissions(submissions);
        }
      }
    };
    fetchQuizzesAndSubmissions();
  }, [selectedCourse, courseTab, userRole]);




  // Fetch Assignments
  useEffect(() => {
    const loadAssignments = async () => {
      if (authLoading) return; // Wait for auth to be ready

      await seedAssignments(); // Run once (safe check inside service)
      const uid = auth.currentUser ? auth.currentUser.uid : null;
      const fetched = await getAssignments(null, uid, userRole);
      setAssignments(fetched);
    };
    loadAssignments();
  }, [authLoading, userRole, auth.currentUser]);

  //  Assignment State (สำคัญมาก)





  // Monitor All Quizzes for Scheduled Start Times (Across all enrolled courses)
  useEffect(() => {
    const fetchUpcomingQuizzes = async () => {
      if (!isLoggedIn || !auth.currentUser || courses.length === 0) return;

      try {
        const allQuizzes = [];
        for (const course of courses) {
          const courseQuizzes = await getQuizzesByCourse(course.name);
          allQuizzes.push(...courseQuizzes.map(q => ({
            ...q,
            courseName: course.name,
            courseFirestoreId: course.firestoreId
          })));
        }

        // Filter for quizzes that are scheduled in the future
        const now = new Date();
        const upcoming = allQuizzes.filter(q => {
          if (!q.scheduledAt) return false;
          const scheduledDate = new Date(q.scheduledAt);
          return scheduledDate > now;
        });

        setMonitoredQuizzes(upcoming);
      } catch (err) {
        console.error("Failed to fetch upcoming quizzes for monitoring:", err);
      }
    };

    fetchUpcomingQuizzes();
    // Refresh list periodically or when courses change
    const interval = setInterval(fetchUpcomingQuizzes, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [isLoggedIn, auth.currentUser, courses]);

  // Monitor current time against scheduled quizzes
  useEffect(() => {
    if (userRole !== 'student' || monitoredQuizzes.length === 0) return;

    monitoredQuizzes.forEach(async (quiz) => {
      if (!quiz.scheduledAt) return;

      const scheduledTime = new Date(quiz.scheduledAt);

      // If scheduled time has passed and we haven't notified yet
      if (scheduledTime <= currentTime) {
        // Check if we already have a notification for this quiz start
        const hasNotified = notifications.some(n =>
          n.targetId === quiz.firestoreId &&
          n.type === 'quiz_opened'
        );

        if (!hasNotified) {
          console.log(`Quiz opening: ${quiz.title}`);
          await createNotification(
            auth.currentUser.uid,
            `ถึงเวลาทำแบบทดสอบแล้ว!`,
            'quiz_opened',
            `แบบทดสอบ "${quiz.title}" ในวิชา ${quiz.courseName} เปิดให้ทำแล้ว`,
            {
              courseId: quiz.courseFirestoreId,
              targetType: 'quiz',
              targetId: quiz.firestoreId
            }
          );

          // Remove from monitored list so we don't try again
          setMonitoredQuizzes(prev => prev.filter(q => q.firestoreId !== quiz.firestoreId));
        }
      }
    });
  }, [currentTime, monitoredQuizzes, userRole, notifications, auth.currentUser]);









  // งาน
  const [assignments, setAssignments] = useState([]);
  const [assignmentFilter, setAssignmentFilter] = useState('pending');
  // ฟอร์มสร้างงาน
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    course: '',
    dueDate: '',
    description: '',
    files: [],
  });


  // State for student file upload
  const [uploadFile, setUploadFile] = useState([]);
  // Create Exam State
  const [newExam, setNewExam] = useState({
    id: null,
    title: '',
    course: '', // will be set dynamically
    time: 30,
    items: [{
      id: 'init_1',
      type: 'choice',
      q: '',
      image: null,
      options: ['', '', '', ''],
      optionImages: [null, null, null, null],
      correct: 0,
      keywords: [],
      correctAnswer: true,
      pairs: [{ left: '', right: '' }]
    }],
    scheduledAt: '' // New field for scheduling
  });

  const [isListLoading, setIsListLoading] = useState(false); // Loading state for modal list

  // Fetch Pending Quizzes for Dashboard Monitor (Must be after activeModal is defined)
  useEffect(() => {
    const fetchPendingQuizzes = async () => {
      if (activeModal === 'pendingQuizzes' && userRole === 'teacher' && auth.currentUser) {
        setIsListLoading(true);
        try {
          const myCourses = courses.filter(c => c.ownerId === auth.currentUser.uid);
          // console.log("Checking courses:", myCourses);
          const results = [];

          for (const course of myCourses) {
            const courseQuizzes = await getQuizzesByCourse(course.name);
            for (const quiz of courseQuizzes) {
              const submissions = await getQuizSubmissions(quiz.firestoreId);
              // console.log(`Quiz ${quiz.title} submissions:`, submissions);
              const pendingCount = submissions.filter(s => s.status === 'pending_grading').length;
              if (pendingCount > 0) {
                results.push({
                  ...quiz,
                  courseName: course.name,
                  pendingCount
                });
              }
            }
          }
          setPendingGradingList(results);
        } catch (error) {
          console.error("Error fetching pending quizzes:", error);
        } finally {
          setIsListLoading(false);
        }
      }
    };
    fetchPendingQuizzes();
  }, [activeModal, userRole, courses]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  // Data States

  const [members, setMembers] = useState([]);
  const [pendingMembers, setPendingMembers] = useState([]); // Pending Students
  const [submissions, setSubmissions] = useState([]);
  const [missingSubmissions, setMissingSubmissions] = useState([]); // Students who haven't submitted
  const [editingScores, setEditingScores] = useState({}); // Stores unsaved scores { submissionId: score }

  const [gradingTab, setGradingTab] = useState('submitted'); // 'submitted' or 'missing'
  const [comments, setComments] = useState([]);


  // Quiz Taking Logic
  // Quiz Taking Logic








  useEffect(() => {
    const fetchMembers = async () => {
      if (selectedCourse && selectedCourse.studentIds && selectedCourse.studentIds.length > 0) {
        const users = await getUsersByIds(selectedCourse.studentIds);
        // Map to display structure if needed, or use raw
        setMembers(users.map(u => ({
          id: u.uid,
          name: u.fullName || 'Unknown',
          role: 'student',
          avatar: u.photoURL || 'bg-blue-200' // fallback color/avatar
        })));
      } else {
        setMembers([]);
      }
    };
    fetchMembers();
  }, [selectedCourse]);




  // Fetch Pending Members (For Teacher)
  useEffect(() => {
    const fetchPendingMembers = async () => {
      if (userRole === 'teacher' && selectedCourse && selectedCourse.pendingStudentIds && selectedCourse.pendingStudentIds.length > 0) {
        const users = await getUsersByIds(selectedCourse.pendingStudentIds);
        setPendingMembers(users.map(u => ({
          id: u.uid,
          name: u.fullName || 'Unknown',
          role: 'student',
          avatar: u.photoURL || 'bg-yellow-200'
        })));
      } else {
        setPendingMembers([]);
      }
    };
    fetchPendingMembers();
  }, [selectedCourse, userRole]);

  // Handle Approve Request
  const handleApprove = async (studentId) => {
    try {
      await approveJoinRequest(selectedCourse.firestoreId, studentId);

      // Update local state
      const student = pendingMembers.find(m => m.id === studentId);
      setPendingMembers(prev => prev.filter(m => m.id !== studentId));
      setMembers(prev => [...prev, { ...student, avatar: student.avatar || 'bg-blue-200' }]);

      // Update selected course data
      const updatedPending = selectedCourse.pendingStudentIds.filter(id => id !== studentId);
      const updatedStudents = [...(selectedCourse.studentIds || []), studentId];
      setSelectedCourse(prev => ({ ...prev, pendingStudentIds: updatedPending, studentIds: updatedStudents }));

      // Also update courses list locally to reflect count if used
      setCourses(prev => prev.map(c =>
        c.firestoreId === selectedCourse.firestoreId
          ? { ...c, pendingStudentIds: updatedPending, studentIds: updatedStudents }
          : c
      ));

      alert('อนุมัติเข้าห้องเรียนเรียบร้อย');
    } catch (error) {
      console.error("Failed to approve", error);
      alert('เกิดข้อผิดพลาดในการอนุมัติ');
    }
  };

  // Handle Reject Request
  const handleReject = async (studentId) => {
    if (!confirm('ต้องการปฏิเสธคำขอนี้ใช่หรือไม่?')) return;
    try {
      await rejectJoinRequest(selectedCourse.firestoreId, studentId);

      // Update local state
      setPendingMembers(prev => prev.filter(m => m.id !== studentId));

      // Update selected course data
      const updatedPending = selectedCourse.pendingStudentIds.filter(id => id !== studentId);
      setSelectedCourse(prev => ({ ...prev, pendingStudentIds: updatedPending }));

      setCourses(prev => prev.map(c =>
        c.firestoreId === selectedCourse.firestoreId
          ? { ...c, pendingStudentIds: updatedPending }
          : c
      ));

    } catch (error) {
      console.error("Failed to reject", error);
      alert('เกิดข้อผิดพลาดในการปฏิเสธ');
    }
  };

  // Handle opening grading modal
  const openGradingModal = async (assignment) => {
    console.log("Opening grading modal for:", assignment.title, "ID:", assignment.firestoreId || assignment.id);
    setSelectedAssignment(assignment);
    setSubmissions([]); // Clear previous data immediately
    setMissingSubmissions([]); // Clear missing list
    setEditingScores({}); // Clear editing scores
    setSubmissionsLoading(true); // Start loading

    // Fetch submissions for this assignment
    try {
      const targetId = assignment.firestoreId || assignment.id;
      if (!targetId) {
        throw new Error("Invalid Assignment ID");
      }
      const subs = await getSubmissions(targetId);
      console.log("Fetched submissions for", targetId, ":", subs);
      setSubmissions(subs);

      // Initialize editing scores from fetched submissions
      const initialScores = {};
      subs.forEach(s => {
        initialScores[s.firestoreId || s.id] = s.score || "";
      });
      setEditingScores(initialScores);

      // Fetch Course to find missing students
      const coursesCol = collection(db, 'courses');
      const qCourse = query(coursesCol, where('name', '==', assignment.course));
      const courseSnap = await getDocs(qCourse);

      if (!courseSnap.empty) {
        const courseDoc = courseSnap.docs[0];
        const courseData = courseDoc.data();
        const courseId = courseDoc.id;

        // Attach courseId to selectedAssignment so it's available even if selectedCourse is null
        setSelectedAssignment(prev => ({ ...prev, courseId }));

        const allStudentIds = courseData.studentIds || [];
        const submittedStudentIds = subs.map(s => s.userId);

        // Find IDs that are in allStudentIds but NOT in submittedStudentIds
        const missingIds = allStudentIds.filter(id => !submittedStudentIds.includes(id));

        if (missingIds.length > 0) {
          const missingProfiles = await Promise.all(missingIds.map(async (uid) => {
            const user = await getUserDetails(uid);
            return user ? { ...user, uid } : null;
          }));
          setMissingSubmissions(missingProfiles.filter(p => p !== null));
        } else {
          setMissingSubmissions([]);
        }
      }

      setActiveModal('grading');
    } catch (e) {
      console.error("Error opening grading modal:", e);
      alert("ไม่สามารถโหลดข้อมูลการส่งงานได้");
    } finally {
      setSubmissionsLoading(false);
    }
  };

  // Notifications state conflict removed. Using the one defined earlier.
  // const [notifications, setNotifications] = useState([]); <--- REMOVED

  // Calculate unread status from the main notifications state
  const hasUnread = notifications.some(n => !n.read);

  const [submissionsLoading, setSubmissionsLoading] = useState(false); // New state

  // Smart Navigation Handler
  const handleNotificationClick = async (notif) => {
    setSelectedNotification({ ...notif, read: true });
    markAsRead(notif.firestoreId);
    setActiveModal('notificationDetail'); // Default open detail

    // 1. Try Metadata Navigation (New System)
    if (notif.courseId) {
      const targetCourse = courses.find(c => c.firestoreId === notif.courseId);
      if (targetCourse) {
        setSelectedCourse(targetCourse);

        if (notif.targetType === 'meeting') {
          setCourseTab('meeting');
          setActiveModal('videoConference');
        } else if (notif.targetType === 'assignment' || notif.type === 'homework') {
          setCourseTab('work');
          if (notif.targetId) {
            const assign = assignments.find(a => (a.firestoreId || a.id) === notif.targetId);
            if (assign) {
              if (userRole === 'teacher') openGradingModal(assign);
              else { setSelectedAssignment(assign); setActiveModal('assignmentDetail'); }
            }
          }
        } else if (notif.targetType === 'quiz') { // NEW: Student -> Take Quiz
          setCourseTab('quizzes');
          if (notif.targetId) {
            try {
              const quiz = await getQuiz(notif.targetId);
              if (quiz) {
                // Check if already submitted
                const existingSubmission = await checkSubmission(notif.targetId, auth.currentUser.uid);

                if (existingSubmission) {
                  alert("คุณได้ทำแบบทดสอบนี้ไปแล้ว");
                  return;
                }

                setActiveQuiz(quiz);
                // Check locked
                const scheduledTime = quiz.scheduledAt ? new Date(quiz.scheduledAt) : null;
                const isLocked = scheduledTime && scheduledTime > new Date();
                if (!isLocked) {
                  const minutes = parseInt(quiz.time) || 0;
                  setQuizRemainingSeconds(minutes * 60);
                  setActiveModal('takeQuiz');
                } else {
                  alert("แบบทดสอบนี้ยังไม่เปิดให้ทำ");
                }
              }
            } catch (e) { console.error(e); }
          }
        } else if (notif.targetType === 'quiz_result') { // NEW: Teacher -> View Results
          setCourseTab('quizzes');
          if (notif.targetId) {
            try {
              const quiz = await getQuiz(notif.targetId);
              if (quiz) {
                handleViewResults(quiz);
              }
            } catch (e) { console.error(e); }
          }
        } else if (notif.targetType === 'grades') { // NEW: Student -> View Grades
          setCourseTab('grades');
        } else if (notif.targetType === 'join_request') {
          setCourseTab('people');
          setActiveModal(null);
        } else if (notif.targetType === 'join_approved') {
          setCourseTab('home');
          setActiveModal(null);
        }
        return; // Navigation handled
      }
    }

    // 2. Legacy Fuzzy Match Navigation (Fallback)
    if (notif.message.includes('คำขอเข้าห้องเรียน') && userRole === 'teacher') {
      const courseName = notif.message.split(': ')[1];
      const targetCourse = courses.find(c => c.name === courseName);
      if (targetCourse) {
        setSelectedCourse(targetCourse);
        setCourseTab('people');
        setActiveModal(null);
      }
    } else if (notif.message.includes('อนุมัติการเข้าห้องเรียน') && userRole === 'student') {
      const courseName = notif.message.split(': ')[1];
      const targetCourse = courses.find(c => c.name === courseName);
      if (targetCourse) {
        setSelectedCourse(targetCourse);
        setCourseTab('home'); // Go to feed
        setActiveModal(null);
      }
    } else if (notif.type === 'homework') {
      // Fallback for old homework notifications without IDs
      // Try to find course name from detail or message? Hard without structure.
      // But renderAssignments filters by course.
      // We can just open assignments tab if we can guess course.
      // For now, just show detail modal is fine for legacy.
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files); // แปลง FileList เป็น Array
    if (files.length > 0) {
      setUploadFile(prev => [...prev, ...files]); // เพิ่มไฟล์ใหม่เข้าไปในลิสต์เดิม
    }
  };
  const removeFile = (index) => {
    setUploadFile(prev => prev.filter((_, i) => i !== index));
  };

  const handleLogin = (role) => {
    // This function is now mainly a placeholder or can be used for UI updates if needed
    // The useEffect in useAuthUser handles the state update when auth state changes
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      // State updates handled by onAuthStateChanged
      setActiveTab('dashboard');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };



  // Create Exam Logic
  const handleAddQuestion = () => {
    setNewExam(prev => ({
      ...prev,
      items: [...prev.items, {
        id: Date.now().toString(),
        type: 'choice', // choice, true_false, text, matching
        q: '',
        image: null,
        options: ['', '', '', ''],
        correct: 0,
        correctAnswer: true, // for true_false
        keywords: [], // for text
        pairs: [{ left: '', right: '' }] // for matching
      }]
    }));
  };

  const handleRemoveQuestion = (idx) => {
    setNewExam(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx)
    }));
  };

  const handleUpdateQuestion = (idx, field, value) => {
    setNewExam(prev => {
      const updatedItems = [...prev.items];
      updatedItems[idx] = { ...updatedItems[idx], [field]: value };
      return { ...prev, items: updatedItems };
    });
  };

  const handleUpdateOption = (qIdx, optIdx, value) => {
    setNewExam(prev => {
      const updatedItems = [...prev.items];
      const targetItem = { ...updatedItems[qIdx] };
      const updatedOptions = [...targetItem.options];
      updatedOptions[optIdx] = value;
      targetItem.options = updatedOptions;
      updatedItems[qIdx] = targetItem;
      return { ...prev, items: updatedItems };
    });
  };

  const handleQuestionImageUpload = (idx, file) => {
    if (!file) return;

    // Check file size (e.g., 2MB limit)
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_SIZE) {
      alert("รูปภาพต้องมีขนาดไม่เกิน 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      handleUpdateQuestion(idx, 'image', base64String);
    };
    reader.onerror = () => {
      console.error("Failed to read file");
      alert("เกิดข้อผิดพลาดในการอ่านไฟล์รูปภาพ");
    };
    reader.readAsDataURL(file);
  };

  const handleOptionImageUpload = (qIdx, optIdx, file) => {
    // Delete Case
    if (file === null) {
      setNewExam(prev => {
        const updatedItems = [...prev.items];
        const targetItem = { ...updatedItems[qIdx] };
        if (targetItem.optionImages) {
          const updatedOptionImages = [...targetItem.optionImages];
          updatedOptionImages[optIdx] = null;
          targetItem.optionImages = updatedOptionImages;
        }
        updatedItems[qIdx] = targetItem;
        return { ...prev, items: updatedItems };
      });
      return;
    }

    if (!file) return;

    // ... (rest is same)
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_SIZE) {
      alert("รูปภาพต้องมีขนาดไม่เกิน 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewExam(prev => {
        const updatedItems = [...prev.items];
        const targetItem = { ...updatedItems[qIdx] };
        // Initialize optionImages if not present
        if (!targetItem.optionImages) {
          targetItem.optionImages = [null, null, null, null];
        }
        const updatedOptionImages = [...targetItem.optionImages];
        updatedOptionImages[optIdx] = reader.result;
        targetItem.optionImages = updatedOptionImages;
        updatedItems[qIdx] = targetItem;
        return { ...prev, items: updatedItems };
      });
    };
    reader.onerror = () => {
      alert("เกิดข้อผิดพลาดในการอ่านไฟล์");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveExam = async () => {
    if (!newExam.title || newExam.items.some(i => !i.q)) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    try {
      const examData = {
        title: newExam.title,
        course: newExam.course || selectedCourse.name,
        questions: newExam.items.length,
        time: newExam.time,
        scheduledAt: newExam.scheduledAt || null, // Persist schedule
        status: newExam.status || 'available', // Preserve status if editing, default available
        score: null,
        items: newExam.items.map(item => ({
          ...item,
          options: item.options ? [...item.options] : [],
          optionImages: item.optionImages ? [...item.optionImages] : [null, null, null, null],
          keywords: item.keywords ? [...item.keywords] : [],
          pairs: item.pairs ? item.pairs.map(p => ({ ...p })) : []
        })),
        ownerId: auth.currentUser.uid
      };

      if (newExam.id) {
        // UPDATE EXISTING
        await updateQuiz(newExam.id, examData);
        setQuizzes(prev => prev.map(q => q.firestoreId === newExam.id ? { ...q, ...examData, firestoreId: newExam.id } : q));
        alert('แก้ไขแบบทดสอบเรียบร้อย');
      } else {
        // CREATE NEW
        const createdQuiz = await createQuiz(examData);
        setQuizzes([...quizzes, createdQuiz]);
        alert('สร้างแบบทดสอบเรียบร้อย');

        // Notify Students
        if (selectedCourse?.studentIds) {
          const recipients = selectedCourse.studentIds.filter(id => id !== auth.currentUser.uid);

          await Promise.all(recipients.map(async (studentId) => {
            const isScheduled = !!examData.scheduledAt;
            const message = isScheduled
              ? `มีแบบทดสอบใหม่กำหนดสอบวันที่ ${new Date(examData.scheduledAt).toLocaleString('th-TH', {
                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
              })}`
              : `มีแบบทดสอบใหม่ "${examData.title}" ทำเเบบทดสอบเเล้ว`;

            return createNotification(
              studentId,
              `แบบทดสอบใหม่: ${examData.title}`,
              'quiz',
              message,
              { courseId: selectedCourse.firestoreId, targetType: 'quiz', targetId: createdQuiz.firestoreId }
            );
          }));
        }
      }

      setActiveModal(null);
      // Reset form
      setNewExam({
        id: null,
        title: '',
        course: '',
        time: 30,
        items: [{ q: '', options: ['', '', '', ''], optionImages: [null, null, null, null], correct: 0 }],
        scheduledAt: ''
      });

    } catch (error) {
      console.error("Failed to save quiz", error);
      alert('เกิดข้อผิดพลาดในการบันทึก');
    }
  };

  const handleToggleQuizStatus = async (quiz) => {
    try {
      if (!quiz.firestoreId) return;
      const newStatus = quiz.status === 'available' ? 'closed' : 'available';
      await updateQuiz(quiz.firestoreId, { status: newStatus });

      // Update local
      setQuizzes(prev => prev.map(q =>
        q.firestoreId === quiz.firestoreId ? { ...q, status: newStatus } : q
      ));
    } catch (error) {
      console.error("Failed to toggle status", error);
      alert('ไม่สามารถเปลี่ยนสถานะได้');
    }
  };

  const handleEditQuiz = (quiz) => {
    setNewExam({
      id: quiz.firestoreId,
      title: quiz.title,
      course: quiz.course,
      time: parseInt(quiz.time) || 30,
      scheduledAt: quiz.scheduledAt || '',
      status: quiz.status,
      items: quiz.items.map(i => ({
        ...i,
        options: [...i.options],
        optionImages: i.optionImages ? [...i.optionImages] : [null, null, null, null]
      })) // Deep copy
    });
    setActiveModal('createExam');
  };

  const handleViewResults = async (quiz) => {
    try {
      const subs = await getQuizSubmissions(quiz.firestoreId);
      // Calculate true total points from items
      const totalPoints = quiz.items ? quiz.items.reduce((sum, item) => sum + (Number(item.points) || 1), 0) : 0;

      // Inject total points into quiz object for display if not present
      const quizWithTotal = { ...quiz, totalPoints };

      setCourseSubmissions(subs);
      setActiveQuiz(quizWithTotal);
      setActiveModal('viewResults');
    } catch (error) {
      console.error("Failed to fetch results", error);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!confirm('คุณต้องการลบแบบทดสอบนี้ใช่หรือไม่?')) return;
    try {
      await deleteQuiz(quizId);
      setQuizzes(prev => prev.filter(q => q.firestoreId !== quizId));
    } catch (error) {
      console.error("Failed to delete quiz", error);
      alert('เกิดข้อผิดพลาดในการลบ');
    }
  }

  // ฟังก์ชันยืนยันการส่งงานและบันทึกไฟล์ลงใน State หลัก
  const handleConfirmSubmit = async (assignmentId) => {
    try {
      if (!auth.currentUser) return;

      // Find the assignment to get the proper ID (firestoreId preferred)
      const assignment = assignments.find(a => a.id === assignmentId);
      const targetId = assignment.firestoreId || assignment.id; // Fallback only if legacy local data

      // Prepare file data with Base64 content
      const processStudentFiles = async () => {
        return Promise.all(uploadFile.map(file => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve({
              name: file.name,
              size: file.size,
              type: file.type,
              content: reader.result
            });
            reader.onerror = error => reject(error);
          });
        }));
      };

      const fileData = await processStudentFiles();

      // Call Service
      await submitAssignment(
        targetId,
        auth.currentUser.uid,
        `${profile.firstName} ${profile.lastName}`,
        fileData
      );

      // Notify Teacher (Course Owner)
      if (selectedCourse?.ownerId && selectedCourse.ownerId !== auth.currentUser.uid) {
        await createNotification(
          selectedCourse.ownerId,
          `มีการส่งงาน: ${assignment.title}`,
          'system',
          `${profile.firstName} ส่งงานแล้ว`,
          { courseId: selectedCourse.firestoreId, targetType: 'assignment', targetId: targetId }
        );
      }

      // Update Local State
      setAssignments(prev => prev.map(assign => {
        if (assign.id === assignmentId) {
          return {
            ...assign,
            status: 'submitted',
            submittedFiles: uploadFile,
            submittedAt: new Date().toISOString() // Keep local file objects for UI display
          };
        }
        return assign;
      }));

      // Clear Modal
      setUploadFile([]);
      setActiveModal(null);
      setSelectedAssignment(null);
      alert('ส่งงานเรียบร้อยแล้ว!');

    } catch (error) {
      console.error("Error submitting assignment:", error);
      alert('เกิดข้อผิดพลาดในการส่งงาน: ' + error.message);
    }
  };

  // Sync editingCourse state when entering settings or changing course
  useEffect(() => {
    if (selectedCourse && courseTab === 'settings') {
      setEditingCourse({
        ...selectedCourse,
        scheduleItems: selectedCourse.schedule || []
      });
    }
  }, [selectedCourse, courseTab]);

  const handleUpdateCourse = async () => {
    if (!editingCourse) return;
    try {
      await updateCourse(editingCourse.firestoreId, {
        name: editingCourse.name,
        code: editingCourse.code,
        description: editingCourse.description,
        schedule: editingCourse.scheduleItems,
        startDate: editingCourse.startDate || null,
        endDate: editingCourse.endDate || null
      });

      // Update local state
      const updatedCourses = courses.map(c =>
        c.firestoreId === editingCourse.firestoreId
          ? { ...c, ...editingCourse, schedule: editingCourse.scheduleItems }
          : c
      );
      setCourses(updatedCourses);
      setSelectedCourse({ ...selectedCourse, ...editingCourse, schedule: editingCourse.scheduleItems });

      // Reset Edit State
      setEditingScheduleIndex(null);
      setScheduleForm({ day: '1', start: '', end: '', room: '' });

      setScheduleForm({ day: '1', start: '', end: '', room: '' });

      alert('บันทึกการเปลี่ยนแปลงเรียบร้อย');
    } catch (error) {
      console.error("Failed to update course", error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const validateScheduleConflict = useCallback((newItem, excludeCourseId) => {
    if (!auth.currentUser) return { conflict: false };

    for (const course of courses) {
      if (course.firestoreId === excludeCourseId) continue;
      // Ensure we only check courses this teacher actually owns/teaches
      if (course.ownerId !== auth.currentUser.uid) continue;

      const items = course.schedule || course.scheduleItems;
      if (items && Array.isArray(items)) {
        for (const existingItem of items) {
          if (isOverlap(newItem, existingItem)) {
            return {
              conflict: true,
              courseName: course.name,
              detail: `${existingItem.dayLabel || ''} ${existingItem.startTime}-${existingItem.endTime}`
            };
          }
        }
      }
    }
    return { conflict: false };
  }, [courses, auth.currentUser]);

  const handleLeaveCourse = async () => {
    if (!confirm('ยืนยันที่จะออกจากห้องเรียนนี้หรือไม่? ข้อมูลการส่งงานและคะแนนอาจสูญหาย')) return;
    try {
      if (!selectedCourse.firestoreId) {
        // Fallback for mock data courses
        alert('ไม่สามารถออกจากวิชาตัวอย่างได้ (Mock Data)');
        return;
      }

      await leaveCourse(selectedCourse.firestoreId, auth.currentUser.uid);

      // Update local state
      setCourses(courses.filter(c => c.firestoreId !== selectedCourse.firestoreId));
      setSelectedCourse(null);

      alert('ออกจากห้องเรียนเรียบร้อยแล้ว');
    } catch (error) {
      console.error("Failed to leave course", error);
      alert('เกิดข้อผิดพลาดในการออกจากห้องเรียน: ' + error.message);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#96C68E]"></div>
    </div>;
  }

  const handleDeleteCourse = async (courseToDelete) => {
    if (!confirm(`คุณต้องการลบวิชา "${courseToDelete.name}" ใช่หรือไม่?`)) return;

    try {
      await deleteCourse(courseToDelete.firestoreId);
      setCourses(prev => prev.filter(c => c.firestoreId !== courseToDelete.firestoreId));
      alert('ลบรายวิชาเรียบร้อยแล้ว');
      if (selectedCourse?.firestoreId === courseToDelete.firestoreId) {
        setSelectedCourse(null);
      }
    } catch (error) {
      console.error("Failed to delete course", error);
      alert('เกิดข้อผิดพลาดในการลบรายวิชา');
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!newCourseData.name || !newCourseData.code) {
      alert('กรุณากรอกชื่อวิชาและรหัสวิชา');
      return;
    }

    try {
      if (!auth.currentUser) return;

      const createdCourse = await createCourse({
        name: newCourseData.name,
        code: newCourseData.code,
        color: newCourseData.color,
        description: newCourseData.description,
        startDate: newCourseData.startDate,
        endDate: newCourseData.endDate,
        schedule: newCourseData.scheduleItems,
        teacher: profile.firstName ? `ครู${profile.firstName}` : 'คุณครู',
        ownerId: auth.currentUser.uid
      });

      const courseWithIcon = {
        ...createdCourse,
        icon: getCourseIcon(createdCourse.iconType)
      };

      setCourses(prev => [...prev, courseWithIcon]);
      setActiveModal(null);
      setNewCourseData({
        name: '', code: '', color: 'bg-[#96C68E]', description: '',
        startDate: '', endDate: '',
        scheduleItems: []
      });
      alert('สร้างห้องเรียนสำเร็จ!');
    } catch (error) {
      console.error("Failed to create course", error);
      alert('เกิดข้อผิดพลาดในการสร้างห้องเรียน');
    }
  };

  const handleJoinCourse = async (e) => {
    e.preventDefault();
    if (!joinCode) return;

    try {
      if (!auth.currentUser) return;
      const result = await joinCourse(joinCode, {
        uid: auth.currentUser.uid,
        displayName: `${profile.firstName} ${profile.lastName}`.trim()
      });

      if (result.status === 'pending') {
        alert('ส่งคำขอเข้าร่วมห้องเรียนเรียบร้อย กรุณารอคุณครูอนุมัติ');
        setJoinCode('');
        setActiveModal(null);
        return;
      }

      const joinedCourse = result;
      // Add icon component for display
      const courseWithIcon = {
        ...joinedCourse,
        icon: getCourseIcon(joinedCourse.iconType)
      };
      setCourses(prev => [...prev, courseWithIcon]);
      setActiveModal(null);
      setJoinCode('');

      // Notification
      await createNotification(
        auth.currentUser.uid,
        `เข้าห้องเรียน ${joinedCourse.name} สำเร็จ`,
        'system',
        'คุณได้เข้าร่วมห้องเรียนเรียบร้อยแล้ว'
      );

      alert('เข้าร่วมห้องเรียนสำเร็จ!');
    } catch (error) {
      console.error("Failed to join course", error);
      alert(error.message || 'รหัสเข้าห้องเรียนไม่ถูกต้อง');
    }
  };

  // Helper to open Base64 files in new tab correctly
  const openBase64InNewTab = (base64Data, contentType = 'application/octet-stream') => {
    try {
      // Split if it contains metadata, e.g. "data:image/png;base64,..."
      const base64Content = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

      const byteCharacters = atob(base64Content);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: contentType });
      const blobUrl = URL.createObjectURL(blob);

      const newWindow = window.open(blobUrl, '_blank');
      if (!newWindow) {
        alert('Please allow popups for this website');
      }

      // Clean up after a delay
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (e) {
      console.error("Error opening file:", e);
      alert('ไม่สามารถเปิดไฟล์ได้');
    }
  };

  const renderModal = () => {
    if (!activeModal) return null;
    const currentAssignmentData = assignments.find(a => a.id === selectedAssignment?.id);

    const closeModal = () => {
      // If teacher is viewing assignment detail (from grading), go back to grading
      if ((activeModal === 'assignmentDetail' || activeModal === 'grading_detail') && userRole === 'teacher') {
        setActiveModal('grading');
        return;
      }

      // Quiz Exist Confirmation
      if (activeModal === 'takeQuiz' && !quizResult) {
        const confirmExit = window.confirm("คุณยืนยันที่จะออกใช่ไหม? \nหากออกตอนนี้ ระบบจะทำการส่งคำตอบเท่าที่ทำได้ทันที และคุณจะไม่สามารถกลับมาแก้ไขได้");
        if (!confirmExit) return;
      }

      setActiveModal(null);
      // setSelectedAssignment(null);
      // setSelectedNotification(null);
      setUploadFile([]);
      setSubmissions([]); // Clear submissions to prevent stale data
      setActiveQuiz(null);
      setQuizAnswers({});
      setQuizResult(null);
    };

    const submitQuiz = async () => {
      if (!auth.currentUser || !activeQuiz) return;

      if (!confirm('ยืนยันที่จะส่งข้อสอบ?')) return;

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
        const result = await submitQuizService(activeQuiz.firestoreId, auth.currentUser.uid, submissionData);
        setQuizResult(result);

        // Update local status of mySubmissions
        setMySubmissions(prev => ({
          ...prev,
          [activeQuiz.firestoreId]: { ...result, firestoreId: result.firestoreId } // Update with result
        }));

        // Notify Teacher
        if (selectedCourse?.ownerId && selectedCourse.ownerId !== auth.currentUser.uid) {
          await createNotification(
            selectedCourse.ownerId,
            `มีการส่งข้อสอบ: ${activeQuiz.title}`,
            'quiz',
            `${profile.firstName} ${profile.lastName || ''} ได้ส่งข้อสอบแล้ว`,
            { courseId: selectedCourse.firestoreId, targetType: 'quiz_submission', targetId: activeQuiz.firestoreId }
          );
        }

      } catch (error) {
        console.error("Failed to submit quiz", error);
        alert('ส่งข้อสอบไม่สำเร็จ: ' + error.message);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className={`${darkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white'} rounded-3xl shadow-2xl w-full ${['createExam', 'viewAnswerDetail'].includes(activeModal) ? 'max-w-7xl h-[90vh]' : ['grading', 'grading_detail', 'takeQuiz', 'create', 'assignmentDetail', 'pendingQuizzes', 'viewResults'].includes(activeModal) ? 'max-w-6xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto relative`}>
          {!['grading', 'grading_detail', 'viewAnswerDetail'].includes(activeModal) && (
            <button onClick={closeModal} className={`absolute top-4 right-4 p-2 rounded-full z-10 ${darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'}`}>
              <X size={20} className={`${darkMode ? 'text-slate-300' : 'text-slate-600'}`} />
            </button>
          )}

          {/* QUIZ MODALS (Extracted) */}
          <QuizModals
            {...{
              activeModal, setActiveModal, closeModal, darkMode, profile, selectedCourse, courses,
              isListLoading, pendingGradingList, setIsLoading: setIsListLoading, getQuizSubmissions, setSelectedCourse,
              activeQuiz, setActiveQuiz, quizAnswers, setQuizAnswers, quizResult,
              quizRemainingSeconds, courseSubmissions, setCourseSubmissions,
              selectedSubmission, setSelectedSubmission, manualScores, setManualScores,
              submitQuiz, newExam, setNewExam, handleAddQuestion, handleUpdateQuestion,
              handleRemoveQuestion, handleQuestionImageUpload, handleOptionImageUpload,
              handleUpdateOption, handleSaveExam
            }}
          />




          {/* VIDEO CALL MODAL */}
          {activeModal === 'video' && (
            <div className="h-[80vh] w-full max-w-6xl bg-slate-900 rounded-[2rem] overflow-hidden relative shadow-2xl">
              <VideoConference
                roomName={`SchoolyScoot-${selectedCourse?.firestoreId || 'demo'}`}
                userName={userRole === 'teacher' ? (profile.firstName ? `Cru ${profile.firstName}` : 'Teacher') : (profile.firstName || 'Student')}
                isTeacher={userRole === 'teacher'}
                onLeave={closeModal}
              />
            </div>
          )}



          <CourseModals
            {...{
              activeModal,
              newCourseData,
              setNewCourseData,
              handleCreateCourse,
              courses,
              joinCode,
              setJoinCode,
              handleJoinCourse
            }}
          />



          <NotificationModals
            {...{
              activeModal,
              setActiveModal,
              darkMode,
              markAllRead,
              notifications,
              selectedNotification,
              handleNotificationClick
            }}
          />

          <AssignmentDetailModal
            {...{
              activeModal,
              currentAssignmentData,
              darkMode,
              openBase64InNewTab,
              handleFileUpload,
              uploadFile,
              removeFile,
              handleConfirmSubmit,
              setAssignments
            }}
          />




          <EditProfileModal
            {...{
              activeModal,
              editProfileData,
              setEditProfileData,
              handleUpdateProfile,
              isSavingProfile,
              handleProfileImageUpload
            }}
          />



          <CreateAssignmentModal
            {...{
              activeModal,
              setActiveModal,
              newAssignment,
              setNewAssignment,
              auth,
              createAssignment,
              setAssignments,
              courses,
              createNotification
            }}
          />




          <GradingModal
            {...{
              activeModal,
              setActiveModal,
              selectedAssignment,
              darkMode,
              openBase64InNewTab,
              gradingTab,
              setGradingTab,
              submissions,
              submissionsLoading,
              missingSubmissions,
              editingScores,
              setEditingScores,
              gradeSubmission,
              createNotification,
              selectedCourse,
              setAssignments,
              setSubmissions
            }}
          />

        </div>
      </div >
    );
  };

  // --- PAGE CONTENT RENDERERS ---



  // renderExams removed





  // IF NOT LOGGED IN, SHOW LOGIN PAGE
  // --- ส่วนตัดสินใจว่าจะแสดงหน้าไหนก่อนเข้าสู่ระบบ ---
  if (!isLoggedIn) {

    if (currentView === 'register') {
      return (
        <RegisterPage
          onRegister={(data) => {
            console.log("Registration successful", data);
            // Auth state change will handle navigation to dashboard
          }}
          onBackToLogin={() => setCurrentView('landing')}
        />
      );
    } else {
      // Default to Landing Page (which contains Login)
      return <LoginPage
        onNavigateToRegister={() => setCurrentView('register')}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />;
    }
  }



  return (
    <div className={`flex h-screen bg-[#F8FAFC] font-sans ${darkMode ? 'dark bg-slate-950 text-slate-100' : ''}`}>
      {renderModal()}
      {/* VIDEO CONFERENCE MODAL (Jitsi) */}
      {/* VIDEO CONFERENCE MODAL (Jitsi) */}
      {activeModal === 'videoConference' && (
        <VideoConference
          meetingConfig={meetingConfig}
          profile={profile}
          onClose={() => setActiveModal(null)}
        />
      )}

      <Sidebar
        darkMode={darkMode}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        profile={profile}
        setSelectedCourse={setSelectedCourse}
      />

      {/* Main Content */}
      <main className={`flex-1 flex flex-col h-screen overflow-hidden relative ${darkMode ? 'bg-slate-950 text-slate-100' : ''}`}>
        <MobileHeader
          darkMode={darkMode}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          setActiveModal={setActiveModal}
          hasUnread={hasUnread}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            <TopHeader
              activeTab={activeTab}
              userRole={userRole}
              setActiveModal={setActiveModal}
              darkMode={darkMode}
              hasUnread={hasUnread}
            />

            {selectedCourse ? (
              <CourseDetailView
                darkMode={darkMode}
                selectedCourse={selectedCourse}
                setSelectedCourse={setSelectedCourse}
                courseTab={courseTab}
                setCourseTab={setCourseTab}
                profile={profile}
                newPostContent={newPostContent}
                setNewPostContent={setNewPostContent}
                newPostFiles={newPostFiles}
                handleRemovePostFile={handleRemovePostFile}
                fileInputRef={fileInputRef}
                handlePostFileSelect={handlePostFileSelect}
                handleCreatePost={handleCreatePost}
                loading={postsLoading}
                posts={posts}
                auth={auth}
                handleDeletePost={handleDeletePost}
                handleEditPost={handleEditPost}
                assignments={assignments}
                setAssignments={setAssignments}
                userRole={userRole}
                openGradingModal={openGradingModal}
                setActiveModal={setActiveModal}
                setSelectedAssignment={setSelectedAssignment}
                deleteAssignment={deleteAssignment}
                workView={workView}
                setNewAssignment={setNewAssignment}
                pendingMembers={pendingMembers}
                handleApprove={handleApprove}
                handleReject={handleReject}
                members={members}
                handleLeaveCourse={handleLeaveCourse}
                quizzes={quizzes}
                mySubmissions={mySubmissions}
                handleToggleQuizStatus={handleToggleQuizStatus}
                handleViewResults={handleViewResults}
                handleEditQuiz={handleEditQuiz}
                handleDeleteQuiz={handleDeleteQuiz}
                setNewExam={setNewExam}
                currentTime={currentTime}

                setActiveQuiz={handleStartQuiz} /* Pass custom handler instead of setActiveQuiz directly */
                setQuizRemainingSeconds={setQuizRemainingSeconds}
                meetingConfig={meetingConfig}
                setMeetingConfig={setMeetingConfig}
                updateCourse={updateCourse}
                handleStartMeeting={startMeeting}
                editingCourse={editingCourse}
                setEditingCourse={setEditingCourse}
                scheduleForm={scheduleForm}
                setScheduleForm={setScheduleForm}
                editingScheduleIndex={editingScheduleIndex}
                setEditingScheduleIndex={setEditingScheduleIndex}
                handleUpdateCourse={handleUpdateCourse}
                handleDeleteCourse={handleDeleteCourse}
                validateScheduleConflict={validateScheduleConflict}
              />
            ) : (
              <>
                {activeTab === 'dashboard' && (
                  <DashboardView
                    darkMode={darkMode}
                    userRole={userRole}
                    profile={profile}
                    welcomeMessage={welcomeMessage}
                    courses={courses}
                    assignments={assignments}
                    currentTime={currentTime}
                    notifications={notifications}
                    selectedNotification={selectedNotification}
                    handleNotificationClick={handleNotificationClick}
                    setActiveTab={setActiveTab}
                    setSelectedCourse={setSelectedCourse}
                    setCourseTab={setCourseTab}
                    setActiveModal={setActiveModal}
                  />
                )}
                {activeTab === 'courses' && (
                  <CoursesView
                    darkMode={darkMode}
                    hiddenCoursesList={hiddenCoursesList}
                    showHiddenCourses={showHiddenCourses}
                    setShowHiddenCourses={setShowHiddenCourses}
                    userRole={userRole}
                    setActiveModal={setActiveModal}
                    visibleCourses={visibleCourses}
                    handleToggleHideCourse={handleToggleHideCourse}
                    setSelectedCourse={setSelectedCourse}
                    handleDeleteCourse={handleDeleteCourse}
                  />
                )}
                {activeTab === 'assignments' && (
                  <AssignmentsView
                    darkMode={darkMode}
                    assignments={assignments}
                    courses={courses}
                    userRole={userRole}
                    assignmentFilter={assignmentFilter}
                    setAssignmentFilter={setAssignmentFilter}
                    openGradingModal={openGradingModal}
                    setSelectedAssignment={setSelectedAssignment}
                    setActiveModal={setActiveModal}
                    deleteAssignment={deleteAssignment}
                    setAssignments={setAssignments}
                  />
                )}
                {activeTab === 'schedule' && (
                  <ScheduleView
                    darkMode={darkMode}
                    userRole={userRole}
                    courses={courses}
                  />
                )}
                {activeTab === 'calendar' && <CalendarPage courses={courses} userRole={userRole} darkMode={darkMode} />}
                {activeTab === 'analytics' && <AnalyticsView setView={setActiveTab} courses={courses} assignments={assignments} userRole={userRole} userId={auth.currentUser?.uid} darkMode={darkMode} />}
                {activeTab === 'settings' && (
                  <SettingsView
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                    profile={profile}
                    fontSize={fontSize}
                    setFontSize={setFontSize}
                    notificationsEnabled={notificationsEnabled}
                    setNotificationsEnabled={setNotificationsEnabled}
                    setEditProfileData={setEditProfileData}
                    setActiveModal={setActiveModal}
                    handleLogout={handleLogout}
                  />
                )}

              </>
            )}

            <div className="h-20"></div>
          </div>
        </div>

      </main>

      {/* Notification Stack Container */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end pointer-events-none">
        {activeNotifications.map((noti) => (
          <ToastNotification
            key={noti.id}
            message={noti.message}
            type={noti.type}
            duration={10000} // 10 seconds
            onClose={() => removeNotification(noti.id)}
          />
        ))}
      </div>

      {isLoading && (
        <div className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#96C68E] mb-4"></div>
            <p className="text-lg font-bold text-slate-700">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      )}
    </div>
  );
}



