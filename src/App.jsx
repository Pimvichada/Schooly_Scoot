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
import { getChats, seedChats, sendMessage } from './services/chatService';
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
  TrendingUp,
  BookOpen,
  Calendar,
  CheckSquare,
  Bell,
  User,
  LogOut,
  PieChart,
  Video,
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
  MessageSquare,
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
  Send,
  Image as ImageIcon,
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
import StatCard from './components/StatCard';
import Sidebar from './components/Sidebar';
import NotificationItem from './components/NotificationItem';
import VideoConference from './components/VideoConference';
import RegisterPage from './components/RegisterPage';
import CalendarPage from './components/CalendarPage';
import DashboardView from './components/DashboardView';
import CoursesView from './components/CoursesView';
import CourseDetailView from './components/CourseDetailView';
import AssignmentsView from './components/AssignmentsView';
import ScheduleView from './components/ScheduleView';
import SettingsView from './components/SettingsView';
import PostItem from './components/PostItem';
import ToastNotification from './components/ToastNotification';
import QuizModals from './components/QuizModals';
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


  // --- Data States ---
  // Chat State
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Custom Hooks Usage replaced local state/effects
  // courses -> useCourses
  // selectedCourse logic remains here 

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

  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [submissionsLoading, setSubmissionsLoading] = useState(false); // New state

  // Fetch Chats (Notifications are handled by the new real-time listener above)
  useEffect(() => {
    const fetchChatData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {

          const chatData = await getChats(user.uid);
          setChats(chatData);
        } catch (error) {
          console.error("Error loading chat data:", error);
        }
      }
    };

    fetchChatData();
  }, [auth.currentUser, isLoggedIn]);



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

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chats, activeChatId]);


  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeChatId) return;

    // Send to Firestore
    try {
      const currentChat = chats.find(c => c.id === activeChatId);
      if (currentChat && currentChat.firestoreId) {
        const senderName = userRole === 'student' ? profile.firstName : 'ครู' + profile.firstName;
        await sendMessage(currentChat.firestoreId, chatInput, 'me'); // 'me' or userId
      }
    } catch (err) {
      console.error("Failed to send message", err);
    }

    // Optimistic Update (Optional, or wait for realtime listener - simpler to wait for now or just append)
    setChats(prev => prev.map(chat => {
      if (chat.id === activeChatId) {
        return {
          ...chat,
          messages: [...(chat.messages || []), { id: Date.now(), sender: 'me', text: chatInput, time: 'Now' }],
          lastMessage: chatInput,
          time: 'Now'
        };
      }
      return chat;
    }));

    setChatInput('');
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


          {/* CREATE CLASS MODAL */}
          {activeModal === 'create' && (
            <div className="p-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">สร้างห้องเรียนใหม่</h2>
              <form className="space-y-6" onSubmit={handleCreateCourse}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">ชื่อวิชา</label>
                    <input
                      type="text"
                      className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:border-[#96C68E] outline-none transition-colors text-lg"
                      placeholder="เช่น วิทยาศาสตร์ ม.1"
                      value={newCourseData.name}
                      onChange={(e) => setNewCourseData({ ...newCourseData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">รหัสวิชา/CLASS ID</label>
                    <input
                      type="text"
                      className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:border-[#96C68E] outline-none transition-colors text-lg"
                      placeholder="SCI-101"
                      value={newCourseData.code}
                      onChange={(e) => setNewCourseData({ ...newCourseData, code: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">คำอธิบายรายวิชา/Description</label>
                  <textarea
                    className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:border-[#96C68E] outline-none transition-colors h-32"
                    placeholder="รายละเอียดวิชา..."
                    value={newCourseData.description}
                    onChange={(e) => setNewCourseData({ ...newCourseData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">วันที่เริ่มเรียน/Start Date</label>
                    <input
                      type="date"
                      className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:border-[#96C68E] outline-none transition-colors"
                      value={newCourseData.startDate}
                      onChange={(e) => setNewCourseData({ ...newCourseData, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">วันที่สิ้นสุด/End Date</label>
                    <input
                      type="date"
                      className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:border-[#96C68E] outline-none transition-colors"
                      value={newCourseData.endDate}
                      onChange={(e) => setNewCourseData({ ...newCourseData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* Schedule Builder */}
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">ตารางเรียน</label>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex flex-wrap gap-4 items-end">
                      <div className="flex-1 min-w-[120px]">
                        <label className="text-xs font-bold text-slate-400 mb-1 block">วัน</label>
                        <select id="daySelect" className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#96C68E]">
                          <option value="1">จันทร์</option>
                          <option value="2">อังคาร</option>
                          <option value="3">พุธ</option>
                          <option value="4">พฤหัส</option>
                          <option value="5">ศุกร์</option>
                        </select>
                      </div>
                      <div className="flex-1 min-w-[120px]">
                        <label className="text-xs font-bold text-slate-400 mb-1 block">เวลาเริ่ม</label>
                        <input id="startTime" type="time" className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#96C68E]" />
                      </div>
                      <div className="flex-none self-center pb-3 text-slate-400">-</div>
                      <div className="flex-1 min-w-[120px]">
                        <label className="text-xs font-bold text-slate-400 mb-1 block">เวลาสิ้นสุด</label>
                        <input id="endTime" type="time" className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#96C68E]" />
                      </div>
                      <div className="flex-1 min-w-[100px]">
                        <label className="text-xs font-bold text-slate-400 mb-1 block">ห้องเรียน</label>
                        <input id="room" type="text" placeholder="ระบุห้อง" className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#96C68E]" />
                      </div>
                      <button type="button" onClick={() => {
                        const dayMap = { '1': 'จันทร์', '2': 'อังคาร', '3': 'พุธ', '4': 'พฤหัส', '5': 'ศุกร์' };
                        const day = document.getElementById('daySelect').value;
                        const start = document.getElementById('startTime').value;
                        const end = document.getElementById('endTime').value;
                        const room = document.getElementById('room').value;

                        if (start && end) {
                          const newItem = {
                            dayOfWeek: parseInt(day),
                            startTime: start,
                            endTime: end,
                            room: room,
                            dayLabel: dayMap[day]
                          };

                          // VALIDATION: Check Overlap
                          // 1. Check against other courses
                          for (const c of courses) {
                            if (c.schedule) {
                              for (const exist of c.schedule) {
                                if (isOverlap(newItem, exist)) {
                                  alert(`เวลาเรียนชนกับวิชา "${c.name}" (${exist.dayLabel} ${exist.startTime}-${exist.endTime})`);
                                  return;
                                }
                              }
                            }
                          }
                          // 2. Check against current new items
                          for (const item of newCourseData.scheduleItems) {
                            if (isOverlap(newItem, item)) {
                              alert(`เวลาเรียนชนกับรายการที่คุณเพิ่งเพิ่ม (${item.dayLabel} ${item.startTime}-${item.endTime})`);
                              return;
                            }
                          }

                          setNewCourseData({
                            ...newCourseData,
                            scheduleItems: [...newCourseData.scheduleItems, newItem]
                          });
                        }
                      }} className="bg-blue-500 text-white p-3 rounded-xl hover:bg-blue-600 transition-colors shadow-sm flex items-center justify-center min-w-[50px]">
                        <Plus size={20} />
                      </button>
                    </div>

                    {newCourseData.scheduleItems.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        {newCourseData.scheduleItems.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="bg-[#E0F2FE] text-[#0284C7] font-bold px-3 py-1 rounded-lg text-sm">{item.dayLabel}</div>
                              <div className="text-sm text-slate-700 font-medium">{item.startTime} - {item.endTime}</div>
                              <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">ห้อง {item.room}</div>
                            </div>
                            <button type="button" onClick={() => {
                              const newItems = newCourseData.scheduleItems.filter((_, i) => i !== idx);
                              setNewCourseData({ ...newCourseData, scheduleItems: newItems });
                            }} className="text-slate-400 hover:text-red-500 p-1"><X size={18} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">เลือกสีธีม</label>
                  <div className="flex flex-wrap gap-4">
                    {[
                      'bg-[#96C68E]', // Green (Original)
                      'bg-[#FF917B]', // Salmon (Original)
                      'bg-[#BEE1FF]', // Blue (Original)
                      'bg-[#FFE787]', // Yellow (Original)
                      'bg-[#E0BBE4]', // Pastel Purple
                      'bg-[#FFC6FF]', // Pastel Pink
                      'bg-[#B5EAD7]', // Pastel Mint
                      'bg-[#FFDAC1]'  // Pastel Peach
                    ].map(c => (
                      <div
                        key={c}
                        onClick={() => setNewCourseData({ ...newCourseData, color: c })}
                        className={`w-12 h-12 rounded-full ${c} cursor-pointer ring-offset-2 transition-all shadow-sm ${newCourseData.color === c ? 'ring-2 ring-slate-400 scale-110 shadow-md' : 'ring-0 hover:ring-2 hover:ring-slate-200'}`}
                      ></div>
                    ))}
                  </div>
                </div>
                <button type="submit" className="w-full py-4 bg-[#96C68E] text-white rounded-xl font-bold text-xl mt-6 hover:bg-[#85b57d] shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">สร้างห้องเรียน</button>
              </form>
            </div>
          )}

          {/* JOIN CLASS MODAL */}
          {/* JOIN CLASS MODAL */}
          {activeModal === 'join' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">เข้าร่วมห้องเรียน</h2>
              <form className="space-y-4" onSubmit={handleJoinCourse}>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">รหัสเข้าห้องเรียน (Invite Code)</label>
                  <input
                    type="text"
                    className="w-full p-4 text-center text-2xl tracking-widest uppercase rounded-xl border border-slate-200 bg-slate-50 focus:border-[#96C68E] outline-none transition-colors font-mono"
                    placeholder="ABC-123"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  />
                  <p className="text-xs text-slate-400 mt-2 text-center">ขอรหัส 6 หลักจากคุณครูผู้สอนเพื่อเข้าร่วม</p>
                </div>
                <button type="submit" className="w-full py-3 bg-[#96C68E] text-white rounded-xl font-bold text-lg mt-4 hover:bg-[#85b57d] shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">เข้าร่วม</button>
              </form>
            </div>
          )}

          {/* ALL NOTIFICATIONS LIST MODAL */}
          {activeModal === 'notificationsList' && (
            <div className="p-6 h-[80vh] flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <h2 className={`text-2xl font-bold flex items-center ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  <Bell className="mr-3 text-[#FF917B]" /> การแจ้งเตือนทั้งหมด
                </h2>
                <button
                  onClick={markAllRead}
                  className={`flex items-center gap-1 text-[10px] font-bold border px-2 py-0.5 rounded-full transition-all shadow-sm ${darkMode ? 'text-[#96C68E] hover:text-white bg-slate-800 hover:bg-[#96C68E] border-[#96C68E]' : 'text-[#96C68E] hover:text-white bg-white hover:bg-[#96C68E] border-[#96C68E]'} hover:shadow-md active:scale-95`}
                >
                  <CheckCircle size={12} />
                  อ่านทั้งหมด
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar ">
                {notifications.map((notif) => (
                  <NotificationItem
                    key={notif.firestoreId}
                    notif={notif}
                    displayTime={notif.date ? new Date(notif.date).toLocaleString('th-TH', { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}
                    isSelected={selectedNotification?.firestoreId === notif.firestoreId}
                    onClick={() => handleNotificationClick(notif)}
                    darkMode={darkMode}
                  />

                ))}
              </div>
            </div>
          )}

          {/* NOTIFICATION DETAIL MODAL */}
          {activeModal === 'notificationDetail' && selectedNotification && (
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <button onClick={() => setActiveModal('notificationsList')} className={`p-2 rounded-full ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}>
                  <ChevronLeft size={24} className={`${darkMode ? 'text-slate-300' : 'text-slate-700'}`} />
                </button>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center 
                   ${selectedNotification.type === 'homework' ? 'bg-[#FFE787]' : selectedNotification.type === 'grade' ? 'bg-[#96C68E]' : 'bg-[#BEE1FF]'}`}>
                  {selectedNotification.type === 'homework' ? <FileText size={24} className="text-slate-700" /> :
                    selectedNotification.type === 'grade' ? <CheckSquare size={24} className="text-white" /> : <User size={24} className="text-slate-700" />}
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>รายละเอียดการแจ้งเตือน</h3>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{selectedNotification.time}</p>
                </div>
              </div>
              <div className={`p-4 rounded-xl border mb-6 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <h4 className={`font-bold mb-2 ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{selectedNotification.message}</h4>
                <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {selectedNotification.detail || "ไม่มีรายละเอียดเพิ่มเติม"}
                </p>
              </div>

            </div>
          )}
          {activeModal === 'assignmentDetail' && currentAssignmentData && (
            <div className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-[#FFE787] p-3 rounded-2xl">
                  <FileText size={32} className="text-slate-700" />
                </div>
                <div className="flex-1">
                  <h2 className={`text-2xl font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{currentAssignmentData.title}</h2>
                  <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{currentAssignmentData.course} • ครบกำหนด {currentAssignmentData.dueDate ? new Date(currentAssignmentData.dueDate).toLocaleString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'ไม่มีกำหนด'}</p>
                </div>
                <div className="bg-[#BEE1FF] px-4 py-2 rounded-xl text-slate-700 font-bold whitespace-nowrap">
                  {(currentAssignmentData.score !== null && currentAssignmentData.score !== undefined && currentAssignmentData.score !== '')
                    ? `${currentAssignmentData.score} / ${currentAssignmentData.maxScore || 10}`
                    : `${currentAssignmentData.maxScore || 10} คะแนน`}
                </div>
              </div>

              <div className={`p-4 rounded-2xl border mb-6 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <h3 className={`font-bold mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>คำชี้แจง</h3>
                <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{currentAssignmentData.description}</p>

                {/* Display attached files from teacher */}
                {currentAssignmentData.files && currentAssignmentData.files.length > 0 && (
                  <div className={`mt-4 border-t pt-3 ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                    <h4 className={`text-sm font-bold mb-2 flex items-center gap-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      <Paperclip size={16} /> ไฟล์แนบ ({currentAssignmentData.files.length})
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {currentAssignmentData.files.map((file, idx) => (
                        <div key={idx} className={`flex items-center gap-3 border p-3 rounded-xl justify-between group ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                          <div className="flex items-center gap-3 overflow-hidden">
                            <FileText className="text-[#BEE1FF] flex-shrink-0" size={20} />
                            <div className="min-w-0">
                              <p className={`text-sm font-bold truncate ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{file.name}</p>
                              <p className="text-xs text-slate-400">{(file.size ? (file.size / 1024).toFixed(1) : 0)} KB</p>
                            </div>
                          </div>
                          {file.content && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                openBase64InNewTab(file.content, file.type || 'application/pdf'); // Default to PDF if unknown
                              }}
                              className="text-xs font-bold text-[#96C68E] bg-[#F0FDF4] px-3 py-1.5 rounded-lg hover:bg-[#96C68E] hover:text-white transition-all whitespace-nowrap"
                            >
                              เปิดดูไฟล์
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Fallback for old single file data */}
                {currentAssignmentData.fileName && !currentAssignmentData.files && (
                  <div className={`mt-4 border-t pt-3 ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                    <div className={`flex items-center gap-3 border p-3 rounded-xl ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                      <FileText className="text-[#BEE1FF]" size={20} />
                      <p className={`text-sm font-bold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{currentAssignmentData.fileName}</p>
                    </div>
                  </div>
                )}
              </div>


              <div className={`border-t pt-6 ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                <h3 className={`font-bold mb-4 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>งานของคุณ</h3>

                {/* 1. กรณีส่งงานเรียบร้อยแล้ว */}
                {currentAssignmentData.status === 'submitted' ? (
                  <div className="space-y-3 animate-in fade-in">
                    <div className="bg-[#F0FDF4] border border-[#96C68E] p-4 rounded-2xl flex items-center gap-3">
                      <CheckCircle className="text-[#96C68E]" />
                      <span className="text-slate-700 font-bold">ส่งงานเรียบร้อยแล้ว</span>
                    </div>

                    <div className="space-y-2">
                      {currentAssignmentData.submittedFiles?.map((file, idx) => (
                        <div key={idx} className={`flex items-center justify-between border p-3 rounded-xl group hover:border-[#96C68E] transition-colors ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                          <div className="flex items-center gap-3">
                            <FileText size={18} className="text-[#96C68E]" />
                            <span className={`text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{file.name}</span>
                          </div>
                          <button
                            onClick={() => {
                              if (file instanceof File) {
                                window.open(URL.createObjectURL(file), '_blank');
                              } else if (file.content) {
                                openBase64InNewTab(file.content, file.type || 'application/pdf');
                              } else {
                                alert('ไม่สามารถเปิดไฟล์ได้');
                              }
                            }}
                            className="text-xs font-bold text-[#96C68E] bg-[#F0FDF4] px-3 py-1.5 rounded-lg hover:bg-[#96C68E] hover:text-white transition-all"
                          >
                            เปิดดูไฟล์
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="w-full flex justify-end">
                      <button
                        onClick={() => {
                          setAssignments(prev =>
                            prev.map(a =>
                              a.id === currentAssignmentData.id
                                ? { ...a, status: 'pending', submittedFiles: [] }
                                : a
                            )
                          );
                        }}
                        className="text-sm text-red-400 hover:underline mt-2"
                      >
                        ยกเลิกการส่งเพื่อแก้ไข
                      </button>
                    </div>


                  </div>
                ) : (
                  /* 2. กรณีรอส่งงาน (UI สำหรับอัปโหลด) */
                  <>
                    <div className="relative">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all mb-4 ${uploadFile.length > 0 ? (darkMode ? 'border-[#96C68E] bg-green-900/10' : 'border-[#96C68E] bg-[#F0FDF4]') : (darkMode ? 'border-slate-600 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-50')
                        }`}>
                        <Upload size={32} className="mx-auto text-slate-400 mb-2" />
                        <p className="text-slate-500 font-bold">คลิกเพื่ออัพโหลดไฟล์งาน</p>
                        <p className="text-xs text-slate-400 mt-1">สามารถเลือกได้หลายไฟล์ (PDF, JPG, PNG)</p>
                      </div>
                    </div>

                    {uploadFile.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {uploadFile.map((file, index) => (
                          <div key={index} className={`flex items-center justify-between border p-3 rounded-xl animate-in slide-in-from-bottom-2 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <div className="flex items-center gap-3">
                              <FileText size={18} className="text-[#96C68E]" />
                              <span className={`text-sm font-medium truncate max-w-[200px] ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{file.name}</span>
                            </div>
                            <button onClick={() => removeFile(index)} className="text-red-400 hover:text-red-600">
                              <Trash size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => handleConfirmSubmit(currentAssignmentData.id)}
                      disabled={uploadFile.length === 0}
                      className={`w-full py-3 rounded-xl font-bold text-lg shadow-sm flex items-center justify-center transition-all ${uploadFile.length > 0 ? 'bg-[#96C68E] text-white hover:scale-[1.02]' : (darkMode ? 'bg-slate-700 text-slate-500' : 'bg-slate-200 text-slate-400')
                        }`}
                    >
                      <CheckCircle className="mr-2" /> ส่งการบ้าน {uploadFile.length > 0 && `(${uploadFile.length} ไฟล์)`}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}


          {/* EDIT PROFILE MODAL */}
          {activeModal === 'editProfile' && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <User className="mr-3 text-[#96C68E]" /> แก้ไขโปรไฟล์
              </h2>
              <div className="space-y-6">
                {/* Avatar Selection */}
                <div className="flex flex-col items-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-slate-100 mb-4 overflow-hidden border-4 border-white shadow-md relative group">
                    {editProfileData.photoURL ? (
                      <img src={editProfileData.photoURL} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#BEE1FF] text-3xl font-bold text-slate-600">
                        {editProfileData.firstName?.[0]}
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-bold text-xs">
                      <Upload size={20} className="mb-1" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleProfileImageUpload} />
                    </label>
                  </div>
                  <p className="text-xs text-slate-400">คลิกที่รูปเพื่ออัปโหลดภาพใหม่</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-1">ชื่อ</label>
                    <input
                      type="text"
                      value={editProfileData.firstName}
                      onChange={(e) => setEditProfileData({ ...editProfileData, firstName: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 focus:border-[#96C68E] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-1">นามสกุล</label>
                    <input
                      type="text"
                      value={editProfileData.lastName}
                      onChange={(e) => setEditProfileData({ ...editProfileData, lastName: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 focus:border-[#96C68E] outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleUpdateProfile}
                  disabled={isSavingProfile}
                  className={`w-full py-3 text-white rounded-xl font-bold shadow-lg transition-all ${isSavingProfile ? 'bg-slate-300 cursor-not-allowed' : 'bg-[#96C68E] hover:bg-[#85b57d] hover:shadow-xl'}`}
                >
                  {isSavingProfile ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>กำลังบันทึก...</span>
                    </div>
                  ) : 'บันทึกการเปลี่ยนแปลง'}
                </button>
              </div>
            </div>
          )}

          {/* CREATE ASSIGNMENT MODAL (TEACHER) */}
          {activeModal === 'createAssignment' && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">
                เพิ่มงานในชั้นเรียน
              </h2>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="ชื่องาน"
                      className="w-full p-3 rounded-xl border"
                      value={newAssignment.title}
                      onChange={(e) =>
                        setNewAssignment({ ...newAssignment, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      placeholder="คะแนนเต็ม"
                      className="w-full p-3 rounded-xl border text-center"
                      value={newAssignment.maxScore}
                      onChange={(e) =>
                        setNewAssignment({ ...newAssignment, maxScore: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">
                    กำหนดส่ง
                  </label>

                  <input
                    type="datetime-local"
                    className="
      w-full p-3 rounded-xl
      border border-slate-200
      bg-white text-slate-700
      focus:outline-none
      focus:border-[#96C68E]
      focus:ring-1 focus:ring-[#96C68E]/30
    "
                    value={newAssignment.dueDate}
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        dueDate: e.target.value,
                      })
                    }
                  />

                  <p className="text-xs text-slate-400 mt-1">
                    เลือกวันและเวลาที่ต้องการให้ส่งงาน
                  </p>
                </div>



                <textarea
                  placeholder="คำอธิบายงาน"
                  rows={4}
                  className="w-full p-3 rounded-xl border"
                  value={newAssignment.description}
                  onChange={(e) =>
                    setNewAssignment({ ...newAssignment, description: e.target.value })
                  }
                />

                {/* แนบไฟล์สำหรับงานที่กำลังสร้าง */}
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">
                    แนบไฟล์ (ถ้ามี)
                  </label>

                  <input
                    type="file"
                    multiple // Allow multiple files
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setNewAssignment(prev => ({
                          ...prev,
                          files: [...prev.files, ...Array.from(e.target.files)]
                        }));
                      }
                    }}
                    className="block w-full text-sm text-slate-500
               file:mr-4 file:py-2 file:px-4
               file:rounded-xl file:border-0
               file:text-sm file:font-bold
               file:bg-[#F0FDF4] file:text-[#96C68E]
               hover:file:bg-[#E6F7EC]"
                  />

                  {newAssignment.files && newAssignment.files.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {newAssignment.files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-3">
                          <div className="flex items-center gap-3">
                            <FileText className="text-[#96C68E] w-5 h-5" />
                            <div className="overflow-hidden">
                              <p className="text-sm font-bold text-slate-700 truncate max-w-[200px]">
                                {file.name}
                              </p>
                              <p className="text-xs text-slate-400">
                                {(file.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setNewAssignment(prev => ({
                                ...prev,
                                files: prev.files.filter((_, i) => i !== index)
                              }));
                            }}
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>


                <button
                  onClick={async () => {
                    if (!newAssignment.title) {
                      alert('กรุณากรอกชื่องาน');
                      return;
                    }

                    try {
                      // Prepare data for Firestore
                      const processFiles = async () => {
                        return Promise.all(newAssignment.files.map(file => {
                          return new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.readAsDataURL(file);
                            reader.onload = () => resolve({
                              name: file.name,
                              size: file.size,
                              type: file.type,
                              content: reader.result // Store Base64
                            });
                            reader.onerror = error => reject(error);
                          });
                        }));
                      };


                      const processedFiles = await processFiles();
                      const assignmentPayload = {
                        title: newAssignment.title,
                        course: newAssignment.course,
                        dueDate: newAssignment.dueDate,
                        description: newAssignment.description,
                        files: processedFiles,
                        status: 'pending',
                        score: null,
                        maxScore: newAssignment.maxScore || 10,
                        createdAt: new Date().toISOString(),
                        ownerId: auth.currentUser?.uid
                      };

                      // 1. Save to Database
                      const createdAssign = await createAssignment(assignmentPayload);

                      // 2. Update Local State (so it shows up immediately)
                      setAssignments(prev => [...prev, createdAssign]);

                      // 3. Notify Students
                      const currentCourse = courses.find(c => c.name === newAssignment.course);
                      if (currentCourse && currentCourse.studentIds && currentCourse.studentIds.length > 0) {
                        // Loop through students
                        currentCourse.studentIds.forEach(studentId => {
                          createNotification(
                            studentId,
                            `มีการบ้านใหม่: ${newAssignment.title}`,
                            'homework',
                            `วิชา ${newAssignment.course} สั่งงานใหม่ กำหนดส่ง ${newAssignment.dueDate || 'ยังไม่กำหนด'}`,
                            { courseId: currentCourse.firestoreId, targetType: 'assignment', targetId: createdAssign.firestoreId }
                          );
                        });
                      }

                      // 4. Reset Form
                      setNewAssignment({
                        title: '',
                        course: '',
                        dueDate: '',
                        description: '',
                        files: [],
                        maxScore: '' // Added maxScore to state
                      });

                      setActiveModal(null);
                      alert('มอบหมายงานเรียบร้อยแล้ว (บันทึกลงฐานข้อมูล)');
                    } catch (error) {
                      console.error("Error creating assignment:", error);
                      alert('เกิดข้อผิดพลาดในการบันทึกงาน: ' + error.message);
                    }
                  }}
                  className="w-full py-3 bg-[#96C68E] text-white rounded-xl font-bold"
                >
                  บันทึกงาน
                </button>
              </div>
            </div>
          )}


          {/* TEACHER GRADING MODAL */}
          {(activeModal === 'grading' || activeModal === 'grading_detail') && selectedAssignment && (
            <div className="h-[80vh] flex flex-col relative">
              {/* Overlay for Detail View */}
              {activeModal === 'grading_detail' && (
                <div className={`absolute inset-0 z-50 ${darkMode ? 'bg-slate-900' : 'bg-white'} p-8 flex flex-col animate-in fade-in zoom-in-95 duration-200`}>
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-[#FFE787] p-3 rounded-2xl">
                      <FileText size={32} className="text-slate-700" />
                    </div>
                    <div className="flex-1">
                      <h2 className={`text-2xl font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{selectedAssignment.title}</h2>
                      <p className="text-slate-500">{selectedAssignment.course} • ครบกำหนด {selectedAssignment.dueDate ? new Date(selectedAssignment.dueDate).toLocaleString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'ไม่มีกำหนด'}</p>
                    </div>
                    <button
                      onClick={() => setActiveModal('grading')}
                      className={`${darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'} p-2 rounded-full transition-colors`}
                    >
                      <X size={24} className="text-slate-500" />
                    </button>
                  </div>

                  <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} p-6 rounded-2xl border mb-6 flex-1 overflow-y-auto custom-scrollbar`}>
                    <h3 className={`font-bold ${darkMode ? 'text-slate-200 border-slate-700' : 'text-slate-700 border-slate-200'} mb-4 text-lg border-b pb-2`}>คำชี้แจง</h3>
                    <p className={`${darkMode ? 'text-slate-300' : 'text-slate-600'} leading-relaxed whitespace-pre-wrap`}>{selectedAssignment.description || 'ไม่มีรายละเอียดเพิ่มเติม'}</p>

                    {/* Display attached files */}
                    {selectedAssignment.files && selectedAssignment.files.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-slate-200">
                        <h4 className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-2">
                          <Paperclip size={18} /> ไฟล์แนบ ({selectedAssignment.files.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {selectedAssignment.files.map((file, idx) => (
                            <div key={idx} className={`flex items-center gap-3 border p-3 rounded-xl hover:border-[#96C68E] transition-colors group cursor-pointer ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
                              onClick={() => {
                                if (file.content) openBase64InNewTab(file.content, file.type || 'application/pdf');
                                else alert('ไม่สามารถเปิดไฟล์ได้');
                              }}
                            >
                              <div className="bg-[#F0FDF4] p-2 rounded-lg">
                                <FileText className="text-[#96C68E]" size={20} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className={`text-sm font-bold truncate ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{file.name}</p>
                                <p className="text-xs text-slate-400">{(file.size ? (file.size / 1024).toFixed(1) : 0)} KB</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className={`p-8 flex flex-col h-full ${darkMode ? 'text-slate-200' : ''}`}>
                <div className={`flex justify-between items-start mb-6 border-b ${darkMode ? 'border-slate-700' : 'border-slate-100'} pb-4`}>
                  <div>
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>ตรวจงาน: {selectedAssignment.title}</h2>
                    <div className="flex items-center gap-3 text-slate-500">
                      <p>{selectedAssignment.course}</p>
                      <div className="h-1 w-1 rounded-full bg-slate-300"></div>
                      {/* Left side minimal metadata if needed */}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveModal('grading_detail')}
                      className={`hover:text-[#96C68E] cursor-pointer transition-colors flex items-center gap-1 font-bold text-sm px-3 py-2 rounded-xl border hover:border-[#96C68E] ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                      title="ดูรายละเอียดงานต้นฉบับ"
                    >
                      <Eye size={16} /> ดูโจทย์
                    </button>
                    <div className="bg-[#BEE1FF] px-4 py-2 rounded-xl text-slate-700 font-bold">
                      คะแนนเต็ม: {selectedAssignment.maxScore || 10}
                    </div>
                  </div>
                </div>

                {/* Grading Tabs */}
                <div className={`flex gap-2 mt-4 border-b pb-2 ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                  <button
                    onClick={() => setGradingTab('submitted')}
                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${gradingTab === 'submitted' ? 'bg-[#96C68E] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    ส่งแล้ว ({submissions.length})
                  </button>
                  <button
                    onClick={() => setGradingTab('missing')}
                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${gradingTab === 'missing' ? 'bg-[#FF917B] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    ยังไม่ส่ง ({missingSubmissions.length})
                  </button>
                </div>

                {/* Grading List */}
                <div className="flex-1 overflow-y-auto mt-4">
                  {submissionsLoading ? (
                    <div className="flex items-center justify-center h-full py-10">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-[#96C68E]"></div>
                    </div>
                  ) : gradingTab === 'submitted' ? (
                    <table className="w-full">
                      <thead className={`text-left text-sm border-b ${darkMode ? 'text-slate-400 border-slate-700' : 'text-slate-500 border-slate-100'}`}>
                        <tr>
                          <th className="pb-2">ชื่อ-นามสกุล</th>
                          <th className="pb-2">สถานะ</th>
                          <th className="pb-2">ไฟล์แนบ</th>
                          <th className="pb-2 text-center">คะแนน</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-50'}`}>
                        {submissions.length > 0 ? submissions.map((student) => (
                          <tr key={student.firestoreId || student.id} className={`group ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}>
                            <td className={`py-3 font-medium ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{student.userName || 'Unknown'}</td>
                            <td className="py-3">
                              <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs">ส่งแล้ว</span>
                            </td>
                            <td className="py-3">
                              {student.file ? (
                                <div className="flex flex-col gap-1">
                                  {(() => {
                                    const files = Array.isArray(student.file) ? student.file : [student.file];
                                    if (files.length === 0) return <span className="text-red-400 text-xs font-bold">ไฟล์ว่างเปล่า (Empty)</span>;

                                    return files.map((f, idx) => (
                                      <button
                                        key={idx}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          if (f.content) {
                                            openBase64InNewTab(f.content, f.type || 'application/pdf');
                                          } else {
                                            alert(`ไม่พบเนื้อหาไฟล์: ${f.name}`);
                                          }
                                        }}
                                        className={`text-left font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2 border px-2 py-1 rounded cursor-pointer text-sm max-w-full ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                                        title={f.name || `File ${idx + 1}`}
                                      >
                                        <FileText size={16} className="text-blue-500 flex-shrink-0" />
                                        <span className="truncate">{f.name || `ไฟล์แนบ ${idx + 1}`}</span>
                                      </button>
                                    ));
                                  })()}
                                </div>
                              ) : (
                                <span className="text-red-400 text-xs font-bold flex items-center gap-1">
                                  <AlertCircle size={12} /> ไม่พบไฟล์แนบ
                                </span>
                              )}
                            </td>
                            <td className="py-3 text-center flex items-center justify-center gap-2">
                              {/* Unique ID for input using student ID */}
                              <input
                                type="text"
                                placeholder="-"
                                value={editingScores[student.firestoreId || student.id] || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditingScores(prev => ({
                                    ...prev,
                                    [student.firestoreId || student.id]: val
                                  }));
                                }}
                                className={`w-16 p-2 border rounded-lg text-center font-bold focus:border-[#96C68E] outline-none ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                              />
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan="4" className="text-center py-4 text-slate-400">ยังไม่มีใครส่งงาน</td></tr>
                        )}
                      </tbody>
                    </table>
                  ) : (
                    <div className="space-y-4">
                      {missingSubmissions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {missingSubmissions.map((student, idx) => (
                            <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'border-slate-100 bg-slate-50/50'}`}>
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'}`}>
                                {student.fullName ? student.fullName.charAt(0) : '?'}
                              </div>
                              <div>
                                <div className={`font-bold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{student.fullName || 'Unknown'}</div>
                                <div className="text-xs text-red-400 font-bold flex items-center gap-1">
                                  <AlertCircle size={12} /> ยังไม่ส่งงาน
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-slate-400 flex flex-col items-center">
                          <CheckCircle size={48} className="text-green-200 mb-4" />
                          <p className="font-bold text-green-600">เยี่ยมมาก! ทุกคนส่งงานครบแล้ว</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className={`mt-6 pt-4 border-t flex justify-end gap-3 ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                  <button
                    onClick={closeModal}
                    className={`px-6 py-3 rounded-xl border font-bold ${darkMode ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    ปิด
                  </button>

                  <button
                    onClick={async () => {
                      try {
                        const targetId = selectedAssignment.firestoreId || selectedAssignment.id;
                        const savePromises = submissions.map(async (student) => {
                          const subId = student.firestoreId || student.id;
                          const newScore = editingScores[subId];

                          // Use the state value
                          await gradeSubmission(targetId, subId, newScore);

                          if (newScore !== "" && newScore !== null) {
                            await createNotification(
                              student.userId || student.id,
                              `ประกาศคะแนน: ${selectedAssignment.title}`,
                              'grade',
                              `คุณครูได้ตรวจงานและให้คะแนนวิชา ${selectedAssignment.course} แล้ว ได้คะแนน ${newScore}/${selectedAssignment.maxScore || 10}`,
                              {
                                courseId: selectedAssignment.courseId || (selectedCourse ? selectedCourse.firestoreId : ""),
                                targetType: 'assignment',
                                targetId: targetId
                              }
                            );
                          }
                        });

                        await Promise.all(savePromises);
                        alert('บันทึกคะแนนแล้ว');

                        setSubmissions(prev => prev.map(s => {
                          const subId = s.firestoreId || s.id;
                          return { ...s, score: editingScores[subId] };
                        }));

                        // Update Main Assignments State with new Pending Count
                        setAssignments(prev => prev.map(a => {
                          const currentAssignId = a.firestoreId || a.id;
                          if (currentAssignId === targetId) {
                            let newPendingCount = 0;
                            submissions.forEach(s => {
                              const subId = s.firestoreId || s.id;
                              const val = editingScores[subId];
                              if (!val) newPendingCount++;
                            });
                            return { ...a, pendingSubmissionCount: newPendingCount };
                          }
                          return a;
                        }));

                      } catch (e) {
                        console.error(e);
                        alert('บันทึกคะแนนไม่สำเร็จ');
                      }
                    }}
                    className="px-6 py-3 rounded-xl bg-[#96C68E] hover:bg-[#85b57d] font-bold text-white shadow-md flex items-center gap-2 transition-all active:scale-95"
                  >
                    <Save size={18} />
                    บันทึกคะแนนทั้งหมด
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div >
    );
  };

  // --- PAGE CONTENT RENDERERS ---



  // renderExams removed


  const renderMessages = () => {
    const activeChat = chats.find(c => c.id === activeChatId);

    return (
      <div className={`space-y-6 h-[calc(100vh-140px)] flex flex-col ${darkMode ? 'text-slate-100' : ''}`}>
        <h1 className={`text-2xl font-bold flex items-center ${darkMode ? 'text-white' : 'text-slate-800'}`}>
          <MessageSquare className="mr-3 text-[#BEE1FF]" /> ข้อความ
        </h1>
        <div className={`flex-1 rounded-3xl shadow-sm border flex overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          {/* Chat List */}
          <div className={`w-full md:w-1/3 border-r overflow-y-auto ${activeChatId ? 'hidden md:block' : 'block'} ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <div className={`p-4 border-b ${darkMode ? 'border-slate-800 bg-slate-900/50' : 'bg-slate-50 border-slate-100'}`}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="text"
                  placeholder="ค้นหาแชท..."
                  className={`w-full pl-9 pr-4 py-2 rounded-xl border transition-colors text-sm focus:outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-indigo-500' : 'bg-white border-slate-200 focus:border-[#BEE1FF]'}`}
                />
              </div>
            </div>
            {chats.map(chat => (
              <div
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`p-4 cursor-pointer border-b flex gap-3 transition-colors ${activeChatId === chat.id
                  ? (darkMode ? 'bg-indigo-900/20 border-indigo-900/50' : 'bg-[#F0F9FF] border-slate-50')
                  : (darkMode ? 'hover:bg-slate-800 border-slate-800' : 'hover:bg-slate-50 border-slate-50')
                  }`}
              >
                <div className={`w-12 h-12 rounded-full ${chat.avatar} flex-shrink-0 flex items-center justify-center font-bold text-lg ${darkMode ? 'text-white' : 'text-slate-700'}`}>
                  {chat.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`font-bold truncate ${activeChatId === chat.id ? (darkMode ? 'text-[#96C68E]' : 'text-[#96C68E]') : (darkMode ? 'text-slate-200' : 'text-slate-800')}`}>{chat.name}</h4>
                    <span className="text-xs text-slate-500 whitespace-nowrap ml-2">{chat.time}</span>
                  </div>
                  <p className={`text-sm truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{chat.lastMessage}</p>
                </div>
                {chat.unread > 0 && (
                  <div className="w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold self-center">
                    {chat.unread}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Chat Detail */}
          <div className={`flex-1 flex flex-col ${!activeChatId ? 'hidden md:flex' : 'flex'}`}>
            {activeChat ? (
              <>
                {/* Chat Header */}
                <div className={`p-4 border-b flex items-center justify-between z-10 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setActiveChatId(null)} className={`md:hidden p-2 -ml-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      <ChevronRight className="rotate-180" />
                    </button>
                    <div className={`w-10 h-10 rounded-full ${activeChat.avatar} flex items-center justify-center font-bold ${darkMode ? 'text-white' : 'text-slate-700'}`}>
                      {activeChat.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className={`font-bold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>{activeChat.name}</h4>
                      <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{activeChat.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 text-slate-400">
                    <button className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}><Video size={20} /></button>
                    <button className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}><Info size={20} /></button>
                  </div>
                </div>

                {/* Messages Area */}
                <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${darkMode ? 'bg-slate-950' : 'bg-[#F8FAFC]'}`}>
                  {activeChat.messages.map(msg => {
                    const isMe = msg.sender === 'me';
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] ${isMe ? 'order-2' : 'order-1'}`}>
                          {msg.sender !== 'me' && msg.name && <p className={`text-xs mb-1 ml-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{msg.name}</p>}
                          <div className={`p-3 rounded-2xl text-sm ${isMe
                            ? (darkMode ? 'bg-indigo-600 text-white rounded-br-none shadow-indigo-900/20 shadow-lg' : 'bg-[#BEE1FF] text-slate-800 rounded-br-none')
                            : (darkMode ? 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700' : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none shadow-sm')
                            }`}>
                            {msg.text}
                          </div>
                          <p className={`text-[10px] mt-1 ${isMe ? 'text-right mr-1' : 'ml-1'} ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                            {msg.time}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className={`p-4 border-t ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <button type="button" className="p-3 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors">
                      <Plus size={20} />
                    </button>
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="พิมพ์ข้อความ..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 transition-colors focus:outline-none focus:border-[#96C68E]"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim()}
                      className={`p-3 rounded-xl transition-all ${chatInput.trim()
                        ? 'bg-[#96C68E] text-white hover:bg-[#85b57d] shadow-sm'
                        : 'bg-slate-100 text-slate-300'
                        }`}
                    >
                      <Send size={20} />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 text-slate-400 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare size={32} className="opacity-50" />
                </div>
                <h3 className="text-lg font-bold text-slate-600 mb-2">ยังไม่ได้เลือกแชท</h3>
                <p className="max-w-xs">เลือกรายชื่อเพื่อนหรือคุณครูจากเมนูด้านซ้ายเพื่อเริ่มการสนทนาได้เลย!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };



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
        <header className={`md:hidden ${darkMode ? 'bg-slate-900 border-slate-800 shadow-lg' : 'bg-white shadow-sm border-slate-100'} p-4 flex items-center justify-between z-10 border-b`}>
          <button onClick={() => setIsMobileMenuOpen(true)} className={`${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            <Menu />
          </button>
          <span className={`font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Schooly Scoot</span>
          <button
            onClick={() => setActiveModal('notificationsList')}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center relative"
          >
            <Bell size={16} className="text-slate-600" />
            {hasUnread && <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>}
          </button>
        </header>


        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto">

            <div className="hidden md:flex justify-between items-center mb-8">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                {activeTab === 'dashboard' ? 'ภาพรวม' :
                  activeTab === 'courses' ? 'ห้องเรียน' :
                    activeTab === 'assignments' ? (userRole === 'student' ? 'การบ้าน' : 'ตรวจงาน') :
                      activeTab === 'schedule' ? 'ตารางเรียน' :
                        activeTab === 'messages' ? 'ข้อความ' : 'ตั้งค่า'}
              </h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveModal('notificationsList')}
                  className={`w-10 h-10 rounded-xl ${darkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-50'} border flex items-center justify-center relative`}>
                  <Bell size={20} className="text-slate-600" />
                  {hasUnread && <span className="absolute top-2 right-2 w-2 h-2 bg-[#FF917B] rounded-full ring-2 ring-white"></span>}
                </button>
              </div>
            </div>

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
                {activeTab === 'messages' && renderMessages()}
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



