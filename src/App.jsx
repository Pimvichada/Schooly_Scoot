import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getUserProfile, logoutUser, updateUserProfile, toggleHiddenCourse, getUserDetails } from './services/authService';
import { getAllCourses, seedCourses, createCourse, deleteCourse, getCoursesForUser, joinCourse, updateCourse, leaveCourse, approveJoinRequest, rejectJoinRequest } from './services/courseService';
import { createQuiz, getQuizzesByCourse, deleteQuiz, updateQuiz, submitQuiz as submitQuizService, checkSubmission, getQuizSubmissions, updateQuizSubmissionScore, getQuiz } from './services/quizService';
import { getAssignments, seedAssignments, submitAssignment, getSubmissions, updateAssignmentStatus, createAssignment, deleteAssignment, gradeSubmission } from './services/assignmentService';
import { getNotifications, seedNotifications, markNotificationAsRead, createNotification, markAllNotificationsAsRead, subscribeToNotifications } from './services/notificationService';
import { createPost, getPostsByCourse, subscribeToPosts, addComment, getComments, toggleLikePost, deletePost, updatePost, toggleHidePost } from './services/postService';
import { getChats, seedChats, sendMessage } from './services/chatService';
import { getUsersByIds } from './services/authService';
import { uploadFile } from './services/uploadService';
import LandingPage from './components/LandingPage';
import AnalyticsView from './components/AnalyticsView';


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
  ClipboardList,
  Clock,
  CheckCircle2,
  HelpCircle,
  Trash,
  Award,
  Heart,
  Star,
  Zap,
  Trophy,
  GraduationCap,
  Smile,
  Copy,
  Edit2,
  EyeOff,
  Eye,
  Trash2,
  BarChart3,
} from 'lucide-react';

import { MascotCircle, MascotSquare, MascotTriangle, MascotStar, Cute1 } from './components/Mascots';
import LoginPage from './components/LoginPage';
import { timeToMinutes, isOverlap, getCourseIcon, WELCOME_MESSAGES } from './utils/helpers.jsx';
import StatCard from './components/StatCard';
import SidebarItem from './components/SidebarItem';
import NotificationItem from './components/NotificationItem';
import VideoConference from './components/VideoConference';
import RegisterPage from './components/RegisterPage';
import CalendarPage from './components/CalendarPage';
import DashboardView from './components/DashboardView';
import CoursesView from './components/CoursesView';
import CourseDetailView from './components/CourseDetailView';
import PostItem from './components/PostItem';
import ToastNotification from './components/ToastNotification';
import notiSoundUrl from './assets/notisound.mp3';
import logo_no_text from './assets/logo_no_tex3.png';



// --- MAIN COMPONENT ---

export default function SchoolyScootLMS() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('student');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [workView, setWorkView] = useState('current');
  // const [currentView, setCurrentView] = useState('login'); // 'current' หรือ 'all'
  const [authLoading, setAuthLoading] = useState(true);
  const [hiddenCourseIds, setHiddenCourseIds] = useState([]); // Store hidden course IDs locally
  const [currentView, setCurrentView] = useState('landing'); // 'current' หรือ 'all'


  // Meeting State
  const [meetingConfig, setMeetingConfig] = useState({
    topic: '',
    isActive: false,
    roomName: ''
  });

  // Time State
  const [currentTime, setCurrentTime] = useState(new Date());
  const [quizRemainingSeconds, setQuizRemainingSeconds] = useState(0);

  // Schedule Editing State
  const [scheduleForm, setScheduleForm] = useState({ day: '1', start: '', end: '', room: '' });
  const [editingScheduleIndex, setEditingScheduleIndex] = useState(null);
  const [fontSize, setFontSize] = useState(100);
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);



  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000); // Update every second
    return () => clearInterval(timer);
  }, []);


  // Profile State
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    roleLabel: '',
    photoURL: ''
  });

  const welcomeMessage = useMemo(() => {
    const messages = WELCOME_MESSAGES[userRole] || WELCOME_MESSAGES.student;
    return messages[Math.floor(Math.random() * messages.length)];
  }, [userRole]);

  useEffect(() => {
    let unsubscribeProfile = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      // Unsubscribe from previous profile listener if exists
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (user) {
        setAuthLoading(true);
        // Real-time listener for user profile
        const userRef = doc(db, "users", user.uid);
        unsubscribeProfile = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const userProfile = docSnap.data();
            setUserRole(userProfile.role);

            // Safer splitting and defaults
            const fullName = userProfile.fullName || '';
            const parts = fullName.split(' ');

            setProfile({
              firstName: parts[0] || 'User',
              lastName: parts.slice(1).join(' ') || '',
              email: user.email,
              roleLabel: userProfile.role === 'student' ? 'นักเรียน' : 'ครูผู้สอน',
              photoURL: userProfile.photoURL || user.photoURL || ''
            });
            setHiddenCourseIds(userProfile.hiddenCourses || []);
            setIsLoggedIn(true);
          } else {
            // User exists in Auth but not yet in Firestore (creating...)
          }
          setAuthLoading(false);
        }, (error) => {
          console.error("Error listening to user profile:", error);
          setAuthLoading(false);
        });

      } else {
        setIsLoggedIn(false);
        setProfile({
          firstName: '',
          lastName: '',
          email: '',
          roleLabel: '',
          photoURL: ''
        });
        setAuthLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);






  // Chat State
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const [courses, setCourses] = useState([]); // Empty initially
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseTab, setCourseTab] = useState('home');
  // State for creating course
  const [editingCourse, setEditingCourse] = useState(null); // State for editing in settings
  const [newCourseData, setNewCourseData] = useState({
    name: '', code: '', color: 'bg-[#96C68E]', description: '',
    startDate: '', endDate: '',
    scheduleItems: [] // {dayOfWeek: 1, startTime: '08:30', endTime: '10:30', room: '421' }
  });
  const [joinCode, setJoinCode] = useState(''); // State for student joining







  // Fetch Courses
  useEffect(() => {
    const fetchCourses = async () => {
      if (!isLoggedIn || !auth.currentUser) return;

      try {
        const fetchedCourses = await getCoursesForUser(userRole, auth.currentUser.uid);
        if (fetchedCourses.length > 0) {
          // Map icon string back to component
          const coursesWithIcons = fetchedCourses.map(c => ({
            ...c,
            icon: getCourseIcon(c.iconType)
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
    fetchCourses();
  }, [isLoggedIn, userRole]); // Re-fetch when login state or role changes

  const handleToggleHideCourse = async (course) => {
    if (!auth.currentUser) return;
    const isHidden = hiddenCourseIds.includes(course.firestoreId);

    // Optimistic Update
    setHiddenCourseIds(prev =>
      isHidden ? prev.filter(id => id !== course.firestoreId) : [...prev, course.firestoreId]
    );

    try {
      await toggleHiddenCourse(auth.currentUser.uid, course.firestoreId, !isHidden);
    } catch (error) {
      console.error("Failed to toggle hide", error);
      // Revert if failed
      setHiddenCourseIds(prev =>
        isHidden ? [...prev, course.firestoreId] : prev.filter(id => id !== course.firestoreId)
      );
    }
  };

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
  const [activeQuiz, setActiveQuiz] = useState(null); // Which quiz is currently being taken
  const [quizAnswers, setQuizAnswers] = useState({}); // Stores answers {questionIndex: optionIndex }
  const [quizResult, setQuizResult] = useState(null); // Stores final score
  const [quizzes, setQuizzes] = useState([]);


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

  // Notification System
  const [activeNotifications, setActiveNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const noti = { ...notification, id: notification.id || Date.now().toString() };
    setActiveNotifications(prev => {
      // Prevent exact duplicates if checking by firestoreId within short timeframe
      if (noti.firestoreId && prev.some(n => n.firestoreId === noti.firestoreId)) {
        return prev;
      }
      return [...prev, noti];
    });
    // Play Sound
    const audio = new Audio(notiSoundUrl);
    audio.play().catch(e => console.log("Audio play failed:", e));
  }, []);

  const removeNotification = useCallback((id) => {
    setActiveNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Store page load time to filter old notifications from popping up
    const pageLoadTime = Date.now();

    const unsubscribe = subscribeToNotifications(auth.currentUser.uid, (notifications, changes) => {
      // Update the notifications list (optional if you want to show list)

      if (changes) {
        changes.forEach(change => {
          if (change.type === 'added') {
            const newNoti = change.doc.data();

            // Check creation time
            let notiTime = 0;
            if (newNoti.createdAt) {
              // Handle standard ISO string or Firestore Timestamp
              notiTime = new Date(newNoti.createdAt).getTime();
            }

            // Show popup ONLY if:
            // 1. It is unread
            // 2. It was created AFTER this page loaded (with 2s buffer)
            if (!newNoti.read && notiTime > (pageLoadTime - 2000)) {
              addNotification({ ...newNoti, firestoreId: change.doc.id });
            }
          }
        });
      }
    });

    return () => unsubscribe();
  }, [auth.currentUser?.uid]);






  const handleStartMeeting = async () => {
    if (!meetingConfig.topic) {
      alert('กรุณาระบุหัวข้อการเรียน');
      return;
    }

    const roomID = `SchoolyScoot_${selectedCourse.code}_${Date.now()}`;  // Generate Unique Room
    const meetingData = {
      topic: meetingConfig.topic,
      isActive: true,
      roomName: roomID
    };

    // 1. Update Local State (Immediate Feedback)
    setMeetingConfig(meetingData);
    setActiveModal('videoConference');

    // 2. Sync to Firestore
    try {
      await updateCourse(selectedCourse.firestoreId, {
        meeting: meetingData
      });

      // 3. Notify Students
      // 3. Notify Students (Fetch latest data to ensure no one is missed)
      const courseRef = doc(db, 'courses', selectedCourse.firestoreId);
      const courseSnap = await getDoc(courseRef);

      if (courseSnap.exists()) {
        const latestCourseData = courseSnap.data();
        if (latestCourseData.studentIds && latestCourseData.studentIds.length > 0) {
          console.log("Sending notifications to:", latestCourseData.studentIds);
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

  // Modal State
  const [activeModal, setActiveModal] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  // Data States

  const [members, setMembers] = useState([]);
  const [pendingMembers, setPendingMembers] = useState([]); // Pending Students
  const [submissions, setSubmissions] = useState([]);
  const [missingSubmissions, setMissingSubmissions] = useState([]); // Students who haven't submitted

  const [gradingTab, setGradingTab] = useState('submitted'); // 'submitted' or 'missing'
  // Post Feed State
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostFiles, setNewPostFiles] = useState([]);

  // const [newPostFiles, setNewPostFiles] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);


  // Quiz Taking Logic
  // Quiz Taking Logic
  const submitQuiz = useCallback(async () => {
    if (!activeQuiz) return;
    let score = 0;
    activeQuiz.items.forEach((item, idx) => {
      const answer = quizAnswers[idx];
      let isCorrect = false;

      if (!item.type || item.type === 'choice') {
        isCorrect = answer === item.correct;
      } else if (item.type === 'true_false') {
        isCorrect = answer === item.correctAnswer;
      } else if (item.type === 'matching') {
        // all pairs must match
        const pairs = item.pairs || [];
        isCorrect = pairs.every((p, pIdx) => {
          const userRight = answer ? answer[pIdx] : null;
          return userRight === p.right;
        });
      } else if (item.type === 'text') {
        if (item.manualGrading) {
          isCorrect = false;
        } else {
          const userText = (answer || '').trim().toLowerCase();
          const keywords = (item.keywords || []).map(k => k.trim().toLowerCase());
          isCorrect = keywords.some(k => userText.includes(k));
        }
      }

      if (isCorrect) score++;
    });

    const total = activeQuiz.items.length;
    setQuizResult({ score, total });

    // Save submission to Backend
    if (auth.currentUser) {
      try {
        const submissionData = {
          score,
          total,
          answers: quizAnswers,
          studentName: profile.firstName + ' ' + (profile.lastName || ''),
        };
        const savedSub = await submitQuizService(activeQuiz.firestoreId, auth.currentUser.uid, submissionData);

        // Update local state to reflect submission
        setMySubmissions(prev => ({
          ...prev,
          [activeQuiz.firestoreId]: savedSub
        }));

        // NOTIFY TEACHER
        if (selectedCourse?.ownerId && selectedCourse.ownerId !== auth.currentUser.uid) {
          await createNotification(
            selectedCourse.ownerId,
            `มีการส่งแบบทดสอบ: ${activeQuiz.title}`,
            'system',
            `${submissionData.studentName} ได้ส่งแบบทดสอบแล้ว`,
            { courseId: activeQuiz.courseId || selectedCourse.firestoreId, targetType: 'quiz_result', targetId: activeQuiz.firestoreId }
          );
        }
      } catch (error) {
        console.error("Failed to submit quiz:", error);
        alert("เกิดข้อผิดพลาดในการส่งคำตอบ แต่คะแนนถูกคำนวณแล้ว");
      }
    }
  }, [activeQuiz, quizAnswers, profile, auth.currentUser]);

  // Use a ref to access the latest submitQuiz function inside the interval
  const submitQuizRef = useRef(submitQuiz);
  useEffect(() => {
    submitQuizRef.current = submitQuiz;
  }, [submitQuiz]);

  const [mySubmissions, setMySubmissions] = useState({}); // Map: quizId -> submission
  const [courseSubmissions, setCourseSubmissions] = useState({}); // For teacher view
  const [selectedSubmission, setSelectedSubmission] = useState(null); // For detailed answer view

  // Quiz Timer Countdown & Auto Submit
  useEffect(() => {
    if (activeModal === 'takeQuiz' && !quizResult && quizRemainingSeconds > 0) {
      const timer = setInterval(() => {
        setQuizRemainingSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            submitQuizRef.current(); // Auto submit
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [activeModal, quizResult, quizRemainingSeconds]);


  // Fetch Posts and Quiz Submissions when course selected
  useEffect(() => {
    const fetchAllData = async () => {
      // ตรวจสอบว่ามี selectedCourse หรือไม่
      if (!selectedCourse?.firestoreId) {
        setPosts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true); // เริ่มโหลด

        // 1. Fetch Posts
        const postsData = await getPostsByCourse(selectedCourse.firestoreId);
        setPosts(postsData);

        // 2. Fetch Quiz Submissions (if Student)
        if (auth.currentUser && userRole === 'student') {
          const courseQuizzes = await getQuizzesByCourse(selectedCourse.name); // Note: Current logic matches by course name or ID? checking createExam.. it uses course name.
          // Wait, getQuizzesByCourse logic in App might depend on how quizzes are linked. Use logic similar to what we might expect.
          // Actually, let's look at how quizzes are filtered in render: "const quizzes = allQuizzes.filter..."
          // But wait, "quizzes" state might not be loaded yet if we only rely on this effect?
          // The "quizzes" state seems to be global or fetched elsewhere?
          // Let's check where "quizzes" comes from.
          // If I look at line 1408: setQuizzes([...quizzes, createdQuiz]);
          // It seems "quizzes" is a state.
          // I should probably fetch quizzes here too if they aren't already?
          // OR iterate over `quizzes` if it's already there?
          // Issue: this effect runs on `selectedCourse`.
          // Let's just fetch them for sure to be safe and accurate.

          // Re-reading quizService: getQuizzesByCourse(courseName)
          const fetchedQuizzes = await getQuizzesByCourse(selectedCourse.name);

          const submissionsMap = {};
          await Promise.all(fetchedQuizzes.map(async (q) => {
            const sub = await checkSubmission(q.firestoreId, auth.currentUser.uid);
            if (sub) {
              submissionsMap[q.firestoreId] = sub;
            }
          }));
          setMySubmissions(submissionsMap);
        }

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false); // หยุดโหลดไม่ว่าจะสำเร็จหรือล้มเหลว
      }
    };

    fetchAllData();
  }, [selectedCourse, auth.currentUser, userRole]);

  // Handle Create Post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim() && newPostFiles.length === 0) return;

    try {
      const author = {
        uid: auth.currentUser.uid,
        name: `${profile.firstName} ${profile.lastName}`,
        avatar: profile.photoURL,
        role: profile.roleLabel
      };

      // Pass files to createPost
      const newPost = await createPost(selectedCourse.firestoreId, newPostContent, author, newPostFiles);

      // Notify Course Members
      const recipients = new Set(selectedCourse.studentIds || []);
      if (selectedCourse.ownerId) recipients.add(selectedCourse.ownerId);
      recipients.delete(auth.currentUser.uid); // Don't notify self

      recipients.forEach(async (uid) => {
        await createNotification(
          uid,
          `โพสต์ใหม่ในวิชา ${selectedCourse.name}`,
          'system',
          `${profile.firstName} ได้โพสต์ประกาศใหม่`,
          { courseId: selectedCourse.firestoreId, targetType: 'post', targetId: newPost.id }
        );
      });

      // Update local state
      setPosts([newPost, ...posts]);
      setNewPostContent('');
      setNewPostFiles([]); // Clear files
      // alert('โพสต์ประกาศเรียบร้อย');
    } catch (error) {
      console.error("Failed to create post", error);
      alert('ไม่สามารถสร้างโพสต์ได้: ' + error.message);
    }
  };

  // Handle Delete Post
  const handleDeletePost = async (postId) => {
    try {
      await deletePost(postId);
      // Update local state
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (error) {
      console.error("Failed to delete post", error);
      alert('ไม่สามารถลบโพสต์ได้');
    }
  };

  // Handle Edit Post
  const handleEditPost = (postId, newContent) => {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, content: newContent } : p
    ));
  };

  const handlePostFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setNewPostFiles(prev => [...prev, ...files]);
    }
    // Reset value so the same file can be selected again
    e.target.value = null;
  };

  const handleRemovePostFile = (index) => {
    setNewPostFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Edit Profile State
  const [editProfileData, setEditProfileData] = useState({
    firstName: '',
    lastName: '',
    photoURL: ''
  });

  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Handle Update Profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (isSavingProfile) return;
    setIsSavingProfile(true);
    try {
      if (!auth.currentUser) return;

      const fullName = `${editProfileData.firstName} ${editProfileData.lastName}`.trim();
      const updatePayload = {
        fullName,
        photoURL: editProfileData.photoURL
      };

      await updateUserProfile(auth.currentUser.uid, updatePayload);

      // Update local state
      setProfile(prev => ({
        ...prev,
        firstName: editProfileData.firstName,
        lastName: editProfileData.lastName,
        photoURL: editProfileData.photoURL
      }));

      setActiveModal(null);
      alert('บันทึกข้อมูลโปรไฟล์เรียบร้อย');
    } catch (error) {
      console.error("Failed to update profile", error);
      alert('เกิดข้อผิดพลาดในการบันทึกโปรไฟล์: ' + (error.message || 'Unknown Error'));
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle File Upload (Convert to Base64)
  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500 * 1024) { // 500KB limit for base64
        alert('รูปภาพต้องมีขนาดไม่เกิน 500KB เพื่อให้บันทึกได้สำเร็จ (Base64 มีข้อจำกัดด้านขนาด)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditProfileData(prev => ({ ...prev, photoURL: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };
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

      // Fetch Course to find missing students
      const coursesCol = collection(db, 'courses');
      const qCourse = query(coursesCol, where('name', '==', assignment.course));
      const courseSnap = await getDocs(qCourse);

      if (!courseSnap.empty) {
        const courseData = courseSnap.docs[0].data();
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

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const hasUnread = notifications.some(n => !n.read);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [submissionsLoading, setSubmissionsLoading] = useState(false); // New state

  // Fetch Notifications & Chats
  // ค้นหาช่วง useEffect นี้ในไฟล์ของคุณ
  useEffect(() => {
    const fetchData = async () => {
      // เช็คให้ชัวร์ว่า user login แล้วจริงๆ (Re-check inside async)
      const user = auth.currentUser;
      if (user) {
        try {
          /* 1. ลบบรรทัด seedNotifications ออก */
          // await seedNotifications(user.uid); // <--- ลบทิ้ง หรือ Comment ไว้

          /* 2. ดึงข้อมูลจริงจาก Firestore */
          const notifs = await getNotifications(user.uid);
          setNotifications(notifs);

          /* 3. จัดการเรื่องแชท (ถ้าแชทหายเหมือนกัน ให้ลบ seedChats ออกด้วย) */
          // await seedChats(user.uid); 
          const chatData = await getChats(user.uid);
          setChats(chatData);

        } catch (error) {
          console.error("Error loading data:", error);
        }
      }
    };

    // เรียกฟังก์ชันเมื่อ auth.currentUser เปลี่ยนแปลง หรือตอนโหลดหน้า
    fetchData();
  }, [auth.currentUser, isLoggedIn]); // เพิ่ม isLoggedIn เข้าไปใน dependency
  const markNotificationRead = (id) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => n.firestoreId === id ? { ...n, read: true } : n));
    // Sync with Firestore
    const notif = notifications.find(n => n.firestoreId === id);
    if (notif && notif.firestoreId) {
      markNotificationAsRead(notif.firestoreId);
    }
    if (selectedNotification && selectedNotification.firestoreId === id) {
      setSelectedNotification(prev => prev ? { ...prev, read: true } : prev);
    }
  };

  const handleMarkAllRead = async () => {
    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    // Call service
    if (auth.currentUser) {
      await markAllNotificationsAsRead(auth.currentUser.uid);
    }
  };

  // Smart Navigation Handler
  const handleNotificationClick = async (notif) => {
    setSelectedNotification(notif);
    markNotificationRead(notif.firestoreId);
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
                setActiveQuiz(quiz);
                // Check locked
                const scheduledTime = quiz.scheduledAt ? new Date(quiz.scheduledAt) : null;
                const isLocked = scheduledTime && scheduledTime > new Date();
                if (!isLocked) {
                  const minutes = parseInt(quiz.time) || 0;
                  setQuizRemainingSeconds(minutes * 60);
                  setActiveModal('takeQuiz');
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
    // actual login happens in LoginPage component via firebase auth
    // The useEffect above handles the state update when auth state changes
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
              : `มีแบบทดสอบใหม่ "${examData.title}" เปิดให้ทำแล้ว`;

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
      // Map submissions to include student names (already in submission data)
      setCourseSubmissions(subs);
      setActiveQuiz(quiz);
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
        schedule: editingCourse.scheduleItems
      });

      // Update local state
      const updatedCourses = courses.map(c =>
        c.firestoreId === editingCourse.firestoreId
          ? { ...c, ...editingCourse, schedule: editingCourse.scheduleItems }
          : c
      );
      setCourses(updatedCourses);
      setSelectedCourse({ ...selectedCourse, ...editingCourse, schedule: editingCourse.scheduleItems });

      alert('บันทึกการเปลี่ยนแปลงเรียบร้อย');
    } catch (error) {
      console.error("Failed to update course", error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

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

      setActiveModal(null);
      // setSelectedAssignment(null);
      // setSelectedNotification(null);
      setUploadFile([]);
      setSubmissions([]); // Clear submissions to prevent stale data
      setActiveQuiz(null);
      setQuizAnswers({});
      setQuizResult(null);
    };

    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className={`bg-white rounded-3xl shadow-2xl w-full ${activeModal === 'createExam' ? 'max-w-7xl h-[90vh]' : ['grading', 'grading_detail', 'takeQuiz', 'create', 'assignmentDetail'].includes(activeModal) ? 'max-w-4xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto relative`}>
          {!['grading', 'grading_detail'].includes(activeModal) && (
            <button onClick={closeModal} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 z-10">
              <X size={20} className="text-slate-600" />
            </button>
          )}

          {/* CREATE EXAM MODAL (TEACHER) */}
          {activeModal === 'createExam' && (
            <div className="p-8 h-full flex flex-col">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <Plus className="mr-3 text-[#FF917B]" /> สร้างแบบทดสอบใหม่
              </h2>
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
                {/* Exam Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-1">ชื่อแบบทดสอบ</label>
                    <input
                      type="text"
                      className="w-full p-3 rounded-xl border border-slate-200 focus:border-[#96C68E] outline-none"
                      placeholder="เช่น สอบย่อยบทที่ 1"
                      value={newExam.title}
                      onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-1">วิชา</label>
                    {selectedCourse ? (
                      <input
                        type="text"
                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-bold outline-none cursor-not-allowed"
                        value={selectedCourse.name}
                        readOnly
                      />
                    ) : (
                      <select
                        className="w-full p-3 rounded-xl border border-slate-200 focus:border-[#96C68E] outline-none bg-white"
                        value={newExam.course}
                        onChange={(e) => setNewExam({ ...newExam, course: e.target.value })}
                      >
                        <option value="">-- เลือกวิชา --</option>
                        {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-1">เวลาในการทำ (นาที)</label>
                    <div className="space-y-2">
                      <div className="relative">
                        <input
                          type="number"
                          className="w-full p-3 rounded-xl border border-slate-200 focus:border-[#96C68E] outline-none"
                          placeholder="ระบุเวลา (นาที)"
                          value={newExam.time}
                          onChange={(e) => setNewExam({ ...newExam, time: parseInt(e.target.value) || '' })}
                        />
                        <span className="absolute right-4 top-3.5 text-slate-400 text-sm font-bold">นาที</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {[15, 30, 45, 60, 90, 120].map(t => (
                          <button
                            key={t}
                            onClick={() => setNewExam({ ...newExam, time: t })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${newExam.time === t
                              ? 'bg-[#96C68E] text-white border-[#96C68E]'
                              : 'bg-white text-slate-500 border-slate-200 hover:border-[#96C68E] hover:text-[#96C68E]'
                              }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Schedule Exam */}
                  <div className="col-span-full bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <label className="flex items-center gap-3 cursor-pointer mb-2">
                      <input
                        type="checkbox"
                        className="w-5 h-5 accent-[#FF917B] rounded-lg"
                        checked={!!newExam.scheduledAt}
                        onChange={(e) => {
                          if (e.target.checked) {
                            // Default to tomorrow 8:00 AM for convenience
                            const tomorrow = new Date();
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            tomorrow.setHours(8, 0, 0, 0);
                            // Format to YYYY-MM-DDTHH:mm
                            const localIso = new Date(tomorrow.getTime() - (tomorrow.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
                            setNewExam({ ...newExam, scheduledAt: localIso });
                          } else {
                            setNewExam({ ...newExam, scheduledAt: '' });
                          }
                        }}
                      />
                      <span className="font-bold text-slate-700 flex items-center">
                        <Calendar size={18} className="mr-2 text-orange-500" /> กำหนดเวลาสอบ (Scheduled Release)
                      </span>
                    </label>
                    <p className="text-sm text-slate-500 ml-8 mb-3">หากกำหนดเวลา นักเรียนจะไม่เห็นข้อสอบจนกว่าจะถึงเวลาที่กำหนด</p>

                    {newExam.scheduledAt && (
                      <div className="ml-8">
                        <input
                          type="datetime-local"
                          className="w-full md:w-1/2 p-3 rounded-xl border border-orange-200 focus:border-orange-400 outline-none bg-white font-medium text-slate-700"
                          value={newExam.scheduledAt}
                          onChange={(e) => setNewExam({ ...newExam, scheduledAt: e.target.value })}
                        />
                      </div>
                    )}
                  </div>
                </div>



                {/* Question Editor */}
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-700">รายการคำถาม ({newExam.items.length})</h3>
                  {newExam.items.map((item, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-2xl p-4 relative group hover:border-[#BEE1FF] transition-all bg-white shadow-sm">
                      {/* Header: Num, Type, Delete */}
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">ข้อที่ {idx + 1}</span>
                          <select
                            value={item.type || 'choice'}
                            onChange={(e) => handleUpdateQuestion(idx, 'type', e.target.value)}
                            className="text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-[#96C68E]"
                          >
                            <option value="choice">ปรนัย (4 ตัวเลือก)</option>
                            <option value="true_false">ถูก/ผิด (True/False)</option>
                            <option value="matching">จับคู่ (Matching)</option>
                            <option value="text">เติมคำ (Keywords)</option>
                          </select>
                        </div>
                        <button onClick={() => handleRemoveQuestion(idx)} className="text-red-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"><Trash size={16} /></button>
                      </div>

                      {/* Question Text & Image */}
                      <div className="mb-4">
                        <div className="relative">
                          <input
                            type="text"
                            className="w-full p-3 pr-12 mb-2 border border-slate-200 rounded-xl focus:border-[#96C68E] outline-none font-bold text-slate-700 bg-slate-50 focus:bg-white transition-colors"
                            placeholder="พิมพ์โจทย์คำถาม..."
                            value={item.q}
                            onChange={(e) => handleUpdateQuestion(idx, 'q', e.target.value)}
                          />
                          <label className="absolute right-2 top-2 p-2 cursor-pointer text-slate-400 hover:text-[#96C68E] hover:bg-slate-100 rounded-full transition-colors z-10">
                            <ImageIcon size={20} />
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onClick={(e) => e.target.value = null}
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleQuestionImageUpload(idx, e.target.files[0]);
                                }
                              }}
                            />
                          </label>
                        </div>
                        {item.image && (
                          <div className="relative w-fit mt-2">
                            <img src={item.image} alt="Question" className="h-32 rounded-lg border border-slate-200 object-cover" />
                            <button
                              onClick={() => handleUpdateQuestion(idx, 'image', null)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Answer Editor based on Type */}
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        {/* CASE: CHOICE */}
                        {(!item.type || item.type === 'choice') && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {item.options.map((opt, optIdx) => (
                              <div key={optIdx} className="bg-white p-3 rounded-xl border border-slate-200 focus-within:border-[#96C68E] focus-within:ring-1 focus-within:ring-[#96C68E] relative">
                                <div className="flex items-center gap-2 mb-2">
                                  <input
                                    type="radio"
                                    name={`correct-${idx}`}
                                    checked={item.correct === optIdx}
                                    onChange={() => handleUpdateQuestion(idx, 'correct', optIdx)}
                                    className="w-4 h-4 accent-[#96C68E]"
                                  />
                                  <input
                                    type="text"
                                    className="flex-1 text-sm outline-none text-slate-600 font-medium bg-transparent"
                                    placeholder={`ตัวเลือก ${optIdx + 1}`}
                                    value={opt}
                                    onChange={(e) => handleUpdateOption(idx, optIdx, e.target.value)}
                                  />
                                  <label className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer text-slate-400 hover:text-[#96C68E] transition-colors" title="เพิ่มรูปภาพ">
                                    <ImageIcon size={16} />
                                    <input
                                      type="file"
                                      className="hidden"
                                      accept="image/*"
                                      onChange={(e) => handleOptionImageUpload(idx, optIdx, e.target.files[0])}
                                    />
                                  </label>
                                </div>

                                {item.optionImages && item.optionImages[optIdx] && (
                                  <div className="relative w-full h-32 bg-slate-50 rounded-lg overflow-hidden border border-slate-100 mt-2 group/img">
                                    <img src={item.optionImages[optIdx]} alt={`Option ${optIdx + 1}`} className="w-full h-full object-contain" />
                                    <button
                                      onClick={() => handleOptionImageUpload(idx, optIdx, null)} // This will need a slight adjustment in handleOptionImageUpload or a new handler if we pass null to delete
                                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover/img:opacity-100 transition-opacity transform hover:scale-110"
                                      title="ลบรูปภาพ"
                                    >
                                      <X size={12} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* CASE: TRUE/FALSE */}
                        {item.type === 'true_false' && (
                          <div className="flex gap-4">
                            <label className={`flex-1 p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-center font-bold ${item.correctAnswer === true ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-slate-200 text-slate-400 hover:border-green-200'}`}>
                              <input
                                type="radio"
                                name={`tf-${idx}`}
                                checked={item.correctAnswer === true}
                                onChange={() => handleUpdateQuestion(idx, 'correctAnswer', true)}
                                className="hidden"
                              />
                              <CheckCircle2 size={20} className="mr-2" /> ถูก (True)
                            </label>
                            <label className={`flex-1 p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-center font-bold ${item.correctAnswer === false ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-slate-200 text-slate-400 hover:border-red-200'}`}>
                              <input
                                type="radio"
                                name={`tf-${idx}`}
                                checked={item.correctAnswer === false}
                                onChange={() => handleUpdateQuestion(idx, 'correctAnswer', false)}
                                className="hidden"
                              />
                              <X size={20} className="mr-2" /> ผิด (False)
                            </label>
                          </div>
                        )}

                        {/* CASE: MATCHING */}
                        {item.type === 'matching' && (
                          <div className="space-y-2">
                            {(item.pairs || []).map((pair, pIdx) => (
                              <div key={pIdx} className="flex gap-2 items-center">
                                <input
                                  placeholder="ฝั่งซ้าย (โจทย์)"
                                  className="flex-1 p-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-[#96C68E]"
                                  value={pair.left}
                                  onChange={(e) => {
                                    const newPairs = [...item.pairs];
                                    newPairs[pIdx].left = e.target.value;
                                    handleUpdateQuestion(idx, 'pairs', newPairs);
                                  }}
                                />
                                <ArrowRight size={16} className="text-slate-300" />
                                <input
                                  placeholder="ฝั่งขวา (คำตอบ)"
                                  className="flex-1 p-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-[#96C68E]"
                                  value={pair.right}
                                  onChange={(e) => {
                                    const newPairs = [...item.pairs];
                                    newPairs[pIdx].right = e.target.value;
                                    handleUpdateQuestion(idx, 'pairs', newPairs);
                                  }}
                                />
                                {item.pairs.length > 1 && (
                                  <button
                                    onClick={() => {
                                      const newPairs = item.pairs.filter((_, i) => i !== pIdx);
                                      handleUpdateQuestion(idx, 'pairs', newPairs);
                                    }}
                                    className="text-slate-300 hover:text-red-500"
                                  >
                                    <Trash size={16} />
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              onClick={() => {
                                const newPairs = [...(item.pairs || []), { left: '', right: '' }];
                                handleUpdateQuestion(idx, 'pairs', newPairs);
                              }}
                              className="text-xs font-bold text-[#96C68E] hover:underline flex items-center"
                            >
                              <Plus size={12} className="mr-1" /> เพิ่มคู่จับคู่
                            </button>
                          </div>
                        )}

                        {/* CASE: TEXT / FILL IN BLANK */}
                        {item.type === 'text' && (
                          <div>
                            <label className="flex items-center gap-2 mb-4 bg-yellow-50 p-3 rounded-xl border border-yellow-100 cursor-pointer">
                              <input
                                type="checkbox"
                                className="w-5 h-5 accent-yellow-500 rounded"
                                checked={!!item.manualGrading}
                                onChange={(e) => handleUpdateQuestion(idx, 'manualGrading', e.target.checked)}
                              />
                              <span className="font-bold text-slate-700 text-sm">ต้องการตรวจคำตอบเอง (Manual Grading)</span>
                            </label>

                            {!item.manualGrading && (
                              <p className="text-xs font-bold text-slate-500 mb-2">คำตอบที่ถูกต้อง (Keywords)</p>
                            )}
                            <p className="text-[10px] text-slate-400 mb-2">ระบบจะตรวจคำตอบว่ามีคำเหล่านี้หรือไม่ (คั่นด้วยจุลภาค ,)</p>
                            <input
                              type="text"
                              className="w-full p-3 rounded-xl border border-slate-200 focus:border-[#96C68E] outline-none"
                              placeholder="เช่น โปรตีน, เนื้อสัตว์, ถั่ว"
                              value={item.keywords ? item.keywords.join(', ') : ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                const keys = val.split(',').map(k => k.trim());
                                handleUpdateQuestion(idx, 'keywords', keys);
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={handleAddQuestion}
                    className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:border-[#96C68E] hover:text-[#96C68E] hover:bg-slate-50 transition-all"
                  >
                    + เพิ่มข้อสอบ
                  </button>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-3">

                <button onClick={handleSaveExam} className="px-6 py-3 rounded-xl bg-[#96C68E] text-white font-bold hover:bg-[#85b57d] shadow-sm flex items-center">
                  <Save size={20} className="mr-2" /> {newExam.id ? 'บันทึกการแก้ไข' : 'สร้างแบบทดสอบ'}
                </button>
              </div>
            </div>
          )}

          {/* VIEW RESULTS MODAL */}
          {activeModal === 'viewResults' && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl h-[92vh] flex flex-col overflow-hidden">
                {/* HEADER */}
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
                  <div className="flex items-center space-x-4">
                    <div className="bg-amber-100 p-3 rounded-2xl">
                      <Trophy className="text-amber-500" size={32} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                        ผลคะแนนสอบ
                      </h2>
                      <p className="text-slate-500 font-medium mt-1">
                        แบบทดสอบ: <span className="text-indigo-600">{activeQuiz?.title}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={closeModal}
                    className="group p-2 hover:bg-red-50 rounded-xl transition-colors duration-200"
                  >
                    <X size={28} className="text-slate-400 group-hover:text-red-500 transition-colors" />
                  </button>
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                  <div className="max-w-6xl mx-auto">
                    {/* STATS GRID */}
                    {courseSubmissions.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-slate-500 text-sm font-bold">คะแนนเฉลี่ย</p>
                            <BarChart3 size={20} className="text-indigo-400" />
                          </div>
                          <p className="text-4xl font-black text-slate-800">
                            {(courseSubmissions.reduce((a, b) => a + b.score, 0) / courseSubmissions.length).toFixed(1)}
                            <span className="text-lg text-slate-400 font-medium ml-1">/ {activeQuiz?.questions}</span>
                          </p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-slate-500 text-sm font-bold">ผ่านเกณฑ์ (50%)</p>
                            <CheckCircle2 size={20} className="text-green-400" />
                          </div>
                          <p className="text-4xl font-black text-slate-800">
                            {Math.round((courseSubmissions.filter(s => s.score >= (s.total / 2)).length / courseSubmissions.length) * 100)}%
                          </p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-slate-500 text-sm font-bold">คะแนนสูงสุด</p>
                            <TrendingUp size={20} className="text-amber-400" />
                          </div>
                          <p className="text-4xl font-black text-slate-800">
                            {Math.max(...courseSubmissions.map(s => s.score))}
                          </p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-slate-500 text-sm font-bold">ส่งแล้ว</p>
                            <Users size={20} className="text-blue-400" />
                          </div>
                          <p className="text-4xl font-black text-slate-800">
                            {courseSubmissions.length}
                            <span className="text-lg text-slate-400 font-medium ml-1">/ {selectedCourse?.studentIds?.length || 0} คน</span>
                          </p>
                        </div>
                      </div>
                    )}

                    {/* RESULTS TABLE */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
                      {courseSubmissions.length > 0 ? (
                        <table className="w-full text-left">
                          <thead className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                            <tr>
                              <th className="p-4 pl-6 font-bold">นักเรียน</th>
                              <th className="p-4 font-bold">สถานะ</th>
                              <th className="p-4 font-bold">เวลาส่ง</th>
                              <th className="p-4 pr-6 font-bold text-right">คะแนนสอบ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {courseSubmissions.map((sub) => {
                              const percent = (sub.score / sub.total) * 100;
                              return (
                                <tr
                                  key={sub.firestoreId}
                                  className="cursor-pointer group"
                                  onClick={() => {
                                    setSelectedSubmission(sub);
                                    setActiveModal('viewAnswerDetail');
                                  }}
                                >
                                  <td className="p-4 pl-6">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200 group-hover:border-indigo-200 group-hover:text-indigo-500 transition-colors">
                                        {sub.studentName.charAt(0)}
                                      </div>
                                      <div>
                                        <div className="font-bold text-slate-700 group-hover:text-indigo-700">{sub.studentName}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center bg-green-100 text-green-700`}>
                                      <CheckCircle2 size={12} className="mr-1" /> ส่งแล้ว
                                    </span>
                                  </td>
                                  <td className="p-4">
                                    <div className="flex items-center text-slate-500 font-medium text-sm">
                                      <Clock size={16} className="mr-2 text-slate-400" />
                                      {new Date(sub.submittedAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                                    </div>
                                  </td>
                                  <td className="p-4 pr-6 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <div className="flex items-center gap-1">
                                        <input
                                          type="number" // Change to number
                                          defaultValue={sub.score}
                                          className="w-16 p-1 text-center font-black text-slate-800 border border-transparent hover:border-slate-300 focus:border-[#96C68E] rounded-lg text-2xl outline-none"
                                          id={`quiz-score-${sub.firestoreId}`}
                                          onClick={(e) => e.stopPropagation()} // Prevent row click
                                        />
                                        <span className="text-sm font-medium text-slate-400">/ {sub.total}</span>
                                      </div>
                                      <button
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          const input = document.getElementById(`quiz-score-${sub.firestoreId}`);
                                          const newScore = input.value;
                                          try {
                                            await updateQuizSubmissionScore(sub.firestoreId, newScore);
                                            // Optimistic Update
                                            setCourseSubmissions(prev => prev.map(s => s.firestoreId === sub.firestoreId ? { ...s, score: Number(newScore) } : s));
                                            alert('บันทึกคะแนนสอบเรียบร้อย');

                                            // NOTIFY STUDENT
                                            if (sub.studentId) {
                                              await createNotification(
                                                sub.studentId,
                                                `คะแนนสอบ: ${activeQuiz?.title}`,
                                                'system',
                                                `คุณครูได้ตรวจและบันทึกคะแนนสอบของคุณแล้ว`,
                                                { courseId: selectedCourse.firestoreId, targetType: 'grades', targetId: activeQuiz.firestoreId }
                                              );
                                            }
                                          } catch (err) {
                                            console.error(err);
                                            alert('บันทึกไม่สำเร็จ');
                                          }
                                        }}
                                        className="p-2 text-slate-300 hover:text-green-500 hover:bg-green-50 rounded-lg transition-all"
                                        title="บันทึกคะแนน"
                                      >
                                        <Save size={20} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
                          <div className="bg-slate-50 p-6 rounded-full mb-4">
                            <ClipboardList size={48} className="opacity-50" />
                          </div>
                          <p className="font-medium">ยังไม่มีนักเรียนส่งคำตอบ</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* FOOTER */}
                <div className="px-8 py-5 border-t border-slate-100 bg-white flex justify-end">
                  <button
                    onClick={closeModal}
                    className="px-6 py-2.5 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-700 transition-all active:scale-95 shadow-lg shadow-slate-200"
                  >
                    ปิดหน้าต่าง
                  </button>
                </div>
              </div>
            </div>
          )}



          {/* VIEW ANSWER DETAIL MODAL */}
          {activeModal === 'viewAnswerDetail' && selectedSubmission && activeQuiz && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl h-[92vh] flex flex-col overflow-hidden">
                {/* HEADER */}
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setActiveModal('viewResults')}
                      className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-colors text-slate-600"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <div className="bg-indigo-100 p-3 rounded-2xl">
                      <FileText className="text-indigo-500" size={32} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                        {selectedSubmission.studentName}
                      </h2>
                      <p className="text-slate-500 font-medium mt-1">
                        คะแนนสอบ: <span className="text-green-600 font-black text-lg">{selectedSubmission.score}</span> / {selectedSubmission.total}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={closeModal}
                    className="group p-2 hover:bg-red-50 rounded-xl transition-colors duration-200"
                  >
                    <X size={28} className="text-slate-400 group-hover:text-red-500 transition-colors" />
                  </button>
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                  <div className="max-w-5xl mx-auto space-y-6">
                    {activeQuiz.items.map((item, idx) => {
                      const answer = selectedSubmission.answers ? selectedSubmission.answers[idx] : null;
                      let isCorrect = false;

                      // Scoring Logic Check
                      if (!item.type || item.type === 'choice') {
                        isCorrect = answer === item.correct;
                      } else if (item.type === 'true_false') {
                        isCorrect = answer === item.correctAnswer;
                      } else if (item.type === 'matching') {
                        const pairs = item.pairs || [];
                        isCorrect = pairs.every((p, pIdx) => {
                          const userRight = answer ? answer[pIdx] : null;
                          return userRight === p.right;
                        });
                      } else if (item.type === 'text') {
                        if (item.manualGrading) {
                          isCorrect = false;
                        } else {
                          const userText = (answer || '').toString().trim().toLowerCase();
                          const keywords = (item.keywords || []).map(k => k.trim().toLowerCase());
                          isCorrect = keywords.some(k => userText.includes(k));
                        }
                      }

                      return (
                        <div key={idx} className={`bg-white p-8 rounded-3xl border shadow-sm transition-all hover:shadow-md ${isCorrect ? 'border-green-100 ring-4 ring-green-50/50' : 'border-red-100 ring-4 ring-red-50/50'}`}>
                          <div className="flex justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <span className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {idx + 1}
                              </span>
                              <h3 className="font-bold text-slate-700 text-lg">{item.q}</h3>
                            </div>
                            {item.manualGrading ? (
                              <span className="bg-yellow-100 text-yellow-700 px-4 py-1.5 rounded-xl text-sm font-bold flex items-center h-fit">
                                <AlertCircle size={18} className="mr-2" /> รอตรวจ (Manual)
                              </span>
                            ) : isCorrect ? (
                              <span className="bg-green-100 text-green-600 px-4 py-1.5 rounded-xl text-sm font-bold flex items-center h-fit">
                                <CheckCircle2 size={18} className="mr-2" /> ถูกต้อง
                              </span>
                            ) : (
                              <span className="bg-red-50 text-red-500 px-4 py-1.5 rounded-xl text-sm font-bold flex items-center h-fit">
                                <X size={18} className="mr-2" /> ผิด
                              </span>
                            )}
                          </div>

                          {item.image && (
                            <div className="mb-6 pl-11">
                              <img src={item.image} alt="Question" className="h-48 rounded-2xl border border-slate-100 object-cover shadow-sm" />
                            </div>
                          )}

                          <div className="pl-11 space-y-4">
                            {/* TYPE: CHOICE */}
                            {(!item.type || item.type === 'choice') && (
                              item.options.map((opt, optIdx) => {
                                let optionClass = "p-4 rounded-xl border flex items-center justify-between transition-all relative overflow-hidden ";
                                if (optIdx === item.correct) {
                                  optionClass += "bg-green-50 border-green-200 text-green-700 font-bold shadow-sm";
                                } else if (optIdx === answer) {
                                  optionClass += "bg-red-50 border-red-200 text-red-600 font-bold shadow-sm";
                                } else {
                                  optionClass += "bg-white border-slate-100 text-slate-500 opacity-60";
                                }
                                return (
                                  <div key={optIdx} className="mb-2"> {/* Wrapper for layout */}
                                    <div className={optionClass}>
                                      <span className="flex items-center gap-3 relative z-10">
                                        <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-[10px] opacity-50">
                                          {['A', 'B', 'C', 'D'][optIdx]}
                                        </span>
                                        {opt}
                                      </span>
                                      {optIdx === item.correct && <CheckCircle size={20} className="text-green-500 relative z-10" />}
                                      {optIdx === answer && optIdx !== item.correct && <X size={20} className="text-red-500 relative z-10" />}
                                    </div>
                                    {item.optionImages && item.optionImages[optIdx] && (
                                      <div className={`mt-2 rounded-xl border-2 border-dashed ${optIdx === item.correct ? 'border-green-200 bg-green-50/50' : 'border-slate-100 bg-slate-50/50'} p-2 w-fit`}>
                                        <img src={item.optionImages[optIdx]} alt="Option" className="h-32 rounded-lg object-contain" />
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            )}

                            {/* TYPE: TRUE/FALSE */}
                            {item.type === 'true_false' && (
                              <div className="flex gap-4">
                                <div className={`flex-1 p-4 rounded-2xl border flex items-center justify-center font-bold text-lg relative ${item.correctAnswer === true ? 'bg-green-50 border-green-200 text-green-700' : (answer === true ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white text-slate-300 border-slate-100')}`}>
                                  TRUE
                                  {item.correctAnswer === true && <CheckCircle size={20} className="absolute right-4 text-green-500" />}
                                  {answer === true && item.correctAnswer !== true && <X size={20} className="absolute right-4 text-red-500" />}
                                </div>
                                <div className={`flex-1 p-4 rounded-2xl border flex items-center justify-center font-bold text-lg relative ${item.correctAnswer === false ? 'bg-green-50 border-green-200 text-green-700' : (answer === false ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white text-slate-300 border-slate-100')}`}>
                                  FALSE
                                  {item.correctAnswer === false && <CheckCircle size={20} className="absolute right-4 text-green-500" />}
                                  {answer === false && item.correctAnswer !== false && <X size={20} className="absolute right-4 text-red-500" />}
                                </div>
                              </div>
                            )}

                            {/* TYPE: MATCHING */}
                            {item.type === 'matching' && (
                              <div className="bg-slate-50 p-6 rounded-2xl space-y-3 border border-slate-100">
                                {(item.pairs || []).map((pair, pIdx) => {
                                  const userVal = answer ? answer[pIdx] : '-';
                                  const isPairCorrect = userVal === pair.right;
                                  return (
                                    <div key={pIdx} className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center text-sm">
                                      <div className="md:col-span-3 bg-white p-3 rounded-xl border border-slate-200 font-bold text-slate-600 shadow-sm">{pair.left}</div>
                                      <div className="md:col-span-1 flex justify-center text-slate-300"><ArrowRight size={20} /></div>
                                      <div className={`md:col-span-3 p-3 rounded-xl border font-bold flex justify-between items-center shadow-sm ${isPairCorrect ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
                                        <span>{userVal}</span>
                                        {!isPairCorrect && <span className="text-xs text-slate-400 font-normal ml-2 bg-white/50 px-2 py-0.5 rounded">(เฉลย: {pair.right})</span>}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* TYPE: TEXT */}
                            {item.type === 'text' && (
                              <div className="space-y-4">
                                <div>
                                  <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">คำตอบของนักเรียน</p>
                                  <div className={`p-4 rounded-2xl border text-lg font-bold shadow-sm ${isCorrect ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                                    {answer || <span className="text-slate-300 italic">ไม่ตอบ</span>}
                                  </div>
                                </div>
                                {!isCorrect && (
                                  <div>
                                    <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">คำตอบที่ถูกต้อง (Keywords)</p>
                                    <div className="p-4 rounded-2xl border border-slate-200 bg-white text-slate-600 font-medium shadow-sm">
                                      {(item.keywords || []).join(', ')}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* FOOTER */}
                <div className="px-8 py-5 border-t border-slate-100 bg-white flex justify-end">
                  <button
                    onClick={() => setActiveModal('viewResults')}
                    className="px-6 py-2.5 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-700 transition-all active:scale-95 shadow-lg shadow-slate-200"
                  >
                    กลับไปหน้าผลรวม
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* QUIZ TAKING MODAL */}
          {activeModal === 'takeQuiz' && activeQuiz && (
            <div className="p-8 h-[80vh] flex flex-col">
              <div className="mb-6 pb-4 border-b border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                    <ClipboardList className="mr-3 text-[#FF917B]" /> {activeQuiz.title}
                  </h2>
                  <div className={`flex items-center font-bold px-4 py-2 rounded-xl transition-colors ${quizRemainingSeconds < 60 ? 'bg-red-50 text-red-500 animate-pulse' : 'bg-[#F0FDF4] text-[#96C68E]'}`}>
                    <Clock size={18} className="mr-2" />
                    {quizRemainingSeconds > 0
                      ? `${Math.floor(quizRemainingSeconds / 60)}:${(quizRemainingSeconds % 60).toString().padStart(2, '0')} นาที`
                      : activeQuiz.time}

                  </div>
                </div>
                <p className="text-slate-500">{activeQuiz.course} • {activeQuiz.questions} ข้อ</p>
              </div>

              {quizResult ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-32 h-32 bg-[#BEE1FF] rounded-full flex items-center justify-center mb-6 shadow-lg">
                    <MascotStar className="w-24 h-24" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-800 mb-2">ส่งข้อสอบเรียบร้อย!</h3>
                  <p className="text-slate-500 mb-6">คุณทำคะแนนได้</p>
                  <div className="text-6xl font-bold text-[#FF917B] mb-8">
                    {quizResult.score} <span className="text-2xl text-slate-300">/ {quizResult.total}</span>
                  </div>
                  <button onClick={closeModal} className="bg-slate-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-700">ปิดหน้าต่าง</button>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                    {activeQuiz.items.map((item, idx) => (
                      <div key={idx} className="mb-8 last:mb-0">
                        <div className="flex items-start gap-4 mb-4">
                          <span className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-500 text-sm">
                            {idx + 1}
                          </span>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-800 mb-2">{item.q}</h3>
                            {item.image && (
                              <img src={item.image} alt="Question" className="h-48 rounded-xl border border-slate-200 object-cover mb-4" />
                            )}
                          </div>
                        </div>

                        <div className="pl-12">
                          {/* TYPE: CHOICE */}
                          {(!item.type || item.type === 'choice') && (
                            <div className="space-y-3">
                              {item.options.map((opt, optIdx) => (
                                <label key={optIdx} className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${quizAnswers[idx] === optIdx
                                  ? 'bg-[#F0FDF4] border-[#96C68E] shadow-sm'
                                  : 'bg-white border-slate-100 hover:border-[#96C68E]'
                                  }`}>
                                  <div className="flex items-center w-full">
                                    <input
                                      type="radio"
                                      name={`q-${idx}`}
                                      className="mr-3 w-5 h-5 accent-[#96C68E] flex-shrink-0"
                                      onChange={() => setQuizAnswers({ ...quizAnswers, [idx]: optIdx })}
                                      checked={quizAnswers[idx] === optIdx}
                                    />
                                    <span className="text-slate-700 font-medium">{opt}</span>
                                  </div>
                                  {item.optionImages && item.optionImages[optIdx] && (
                                    <div className="ml-8 mt-3 w-fit">
                                      <img src={item.optionImages[optIdx]} alt="Option" className="h-40 rounded-lg object-contain border border-slate-100" />
                                    </div>
                                  )}
                                </label>
                              ))}
                            </div>
                          )}

                          {/* TYPE: TRUE/FALSE */}
                          {item.type === 'true_false' && (
                            <div className="flex gap-4">
                              <button
                                onClick={() => setQuizAnswers({ ...quizAnswers, [idx]: true })}
                                className={`flex-1 p-6 rounded-2xl border-2 font-bold text-lg transition-all flex items-center justify-center gap-2 ${quizAnswers[idx] === true ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-100 bg-white text-slate-400 hover:border-green-200'}`}
                              >
                                <CheckCircle2 size={24} /> ถูก (True)
                              </button>
                              <button
                                onClick={() => setQuizAnswers({ ...quizAnswers, [idx]: false })}
                                className={`flex-1 p-6 rounded-2xl border-2 font-bold text-lg transition-all flex items-center justify-center gap-2 ${quizAnswers[idx] === false ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-100 bg-white text-slate-400 hover:border-red-200'}`}
                              >
                                <X size={24} /> ผิด (False)
                              </button>
                            </div>
                          )}

                          {/* TYPE: MATCHING */}
                          {item.type === 'matching' && (
                            <div className="space-y-4 bg-slate-50 p-4 rounded-xl">
                              {item.pairs.map((pair, pIdx) => (
                                <div key={pIdx} className="flex flex-col md:flex-row md:items-center gap-2 justify-between">
                                  <div className="flex-1 font-bold text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                                    {pair.left}
                                  </div>
                                  <ArrowRight className="hidden md:block text-slate-300" />
                                  <div className="flex-1">
                                    <select
                                      className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:border-[#96C68E] bg-white cursor-pointer"
                                      value={quizAnswers[idx] ? quizAnswers[idx][pIdx] || '' : ''}
                                      onChange={(e) => {
                                        const currentAns = quizAnswers[idx] || {};
                                        setQuizAnswers({
                                          ...quizAnswers,
                                          [idx]: { ...currentAns, [pIdx]: e.target.value }
                                        });
                                      }}
                                    >
                                      <option value="">เลือกคำตอบ...</option>
                                      {[...item.pairs].sort(() => Math.random() - 0.5).map((p, optionIdx) => (
                                        <option key={optionIdx} value={p.right}>{p.right}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* TYPE: TEXT */}
                          {item.type === 'text' && (
                            <div>
                              <input
                                type="text"
                                placeholder="พิมพ์คำตอบของคุณที่นี่..."
                                className="w-full p-4 rounded-xl border border-slate-200 outline-none focus:border-[#96C68E] font-medium text-slate-700"
                                value={quizAnswers[idx] || ''}
                                onChange={(e) => setQuizAnswers({ ...quizAnswers, [idx]: e.target.value })}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={submitQuiz}
                      disabled={Object.keys(quizAnswers).length < activeQuiz.items.length}
                      className={`px-8 py-3 rounded-xl font-bold text-lg transition-all ${Object.keys(quizAnswers).length === activeQuiz.items.length
                        ? 'bg-[#96C68E] text-white hover:bg-[#85b57d] shadow-md hover:translate-y-[-2px]'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                      ส่งข้อสอบ
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

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
                <h2 className='text-2xl font-bold text-slate-800 flex items-center'>
                  <Bell className="mr-3 text-[#FF917B]" /> การแจ้งเตือนทั้งหมด
                </h2>
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-[10px] font-bold border px-2 py-0.5 rounded-full transition-all shadow-sm text-[#96C68E] hover:text-white bg-white hover:bg-[#96C68E] border-[#96C68E] hover:shadow-md active:scale-95"
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
                  />

                ))}
              </div>
            </div>
          )}

          {/* NOTIFICATION DETAIL MODAL */}
          {activeModal === 'notificationDetail' && selectedNotification && (
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <button onClick={() => setActiveModal('notificationsList')} className="p-2 rounded-full hover:bg-slate-100">
                  <ChevronLeft size={24} className="text-slate-700" />
                </button>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center 
                   ${selectedNotification.type === 'homework' ? 'bg-[#FFE787]' : selectedNotification.type === 'grade' ? 'bg-[#96C68E]' : 'bg-[#BEE1FF]'}`}>
                  {selectedNotification.type === 'homework' ? <FileText size={24} className="text-slate-700" /> :
                    selectedNotification.type === 'grade' ? <CheckSquare size={24} className="text-white" /> : <User size={24} className="text-slate-700" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">รายละเอียดการแจ้งเตือน</h3>
                  <p className="text-sm text-slate-500">{selectedNotification.time}</p>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                <h4 className="font-bold text-slate-700 mb-2">{selectedNotification.message}</h4>
                <p className="text-slate-600 text-sm leading-relaxed">
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
                  <h2 className="text-2xl font-bold text-slate-800">{currentAssignmentData.title}</h2>
                  <p className="text-slate-500">{currentAssignmentData.course} • ครบกำหนด {currentAssignmentData.dueDate ? new Date(currentAssignmentData.dueDate).toLocaleString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'ไม่มีกำหนด'}</p>
                </div>
                <div className="bg-[#BEE1FF] px-4 py-2 rounded-xl text-slate-700 font-bold whitespace-nowrap">
                  {currentAssignmentData.maxScore || 10} คะแนน
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
                <h3 className="font-bold text-slate-700 mb-2">คำชี้แจง</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{currentAssignmentData.description}</p>

                {/* Display attached files from teacher */}
                {currentAssignmentData.files && currentAssignmentData.files.length > 0 && (
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <h4 className="text-sm font-bold text-slate-600 mb-2 flex items-center gap-2">
                      <Paperclip size={16} /> ไฟล์แนบ ({currentAssignmentData.files.length})
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {currentAssignmentData.files.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-white border border-slate-200 p-3 rounded-xl justify-between group">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <FileText className="text-[#BEE1FF] flex-shrink-0" size={20} />
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-700 truncate">{file.name}</p>
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
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-3 bg-white border border-slate-200 p-3 rounded-xl">
                      <FileText className="text-[#BEE1FF]" size={20} />
                      <p className="text-sm font-bold text-slate-700">{currentAssignmentData.fileName}</p>
                    </div>
                  </div>
                )}
              </div>


              <div className="border-t border-slate-100 pt-6">
                <h3 className="font-bold text-slate-800 mb-4">งานของคุณ</h3>

                {/* 1. กรณีส่งงานเรียบร้อยแล้ว */}
                {currentAssignmentData.status === 'submitted' ? (
                  <div className="space-y-3 animate-in fade-in">
                    <div className="bg-[#F0FDF4] border border-[#96C68E] p-4 rounded-2xl flex items-center gap-3">
                      <CheckCircle className="text-[#96C68E]" />
                      <span className="text-slate-700 font-bold">ส่งงานเรียบร้อยแล้ว</span>
                    </div>

                    <div className="space-y-2">
                      {currentAssignmentData.submittedFiles?.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-xl group hover:border-[#96C68E] transition-colors">
                          <div className="flex items-center gap-3">
                            <FileText size={18} className="text-[#96C68E]" />
                            <span className="text-sm font-medium text-slate-700">{file.name}</span>
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
                      <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all mb-4 ${uploadFile.length > 0 ? 'border-[#96C68E] bg-[#F0FDF4]' : 'border-slate-300 hover:bg-slate-50'
                        }`}>
                        <Upload size={32} className="mx-auto text-slate-400 mb-2" />
                        <p className="text-slate-500 font-bold">คลิกเพื่ออัพโหลดไฟล์งาน</p>
                        <p className="text-xs text-slate-400 mt-1">สามารถเลือกได้หลายไฟล์ (PDF, JPG, PNG)</p>
                      </div>
                    </div>

                    {uploadFile.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {uploadFile.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-xl animate-in slide-in-from-bottom-2">
                            <div className="flex items-center gap-3">
                              <FileText size={18} className="text-[#96C68E]" />
                              <span className="text-sm font-medium text-slate-700 truncate max-w-[200px]">{file.name}</span>
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
                      className={`w-full py-3 rounded-xl font-bold text-lg shadow-sm flex items-center justify-center transition-all ${uploadFile.length > 0 ? 'bg-[#96C68E] text-white hover:scale-[1.02]' : 'bg-slate-200 text-slate-400'
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
                <div className="absolute inset-0 z-50 bg-white p-8 flex flex-col animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-[#FFE787] p-3 rounded-2xl">
                      <FileText size={32} className="text-slate-700" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-slate-800">{selectedAssignment.title}</h2>
                      <p className="text-slate-500">{selectedAssignment.course} • ครบกำหนด {selectedAssignment.dueDate ? new Date(selectedAssignment.dueDate).toLocaleString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'ไม่มีกำหนด'}</p>
                    </div>
                    <button
                      onClick={() => setActiveModal('grading')}
                      className="bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors"
                    >
                      <X size={24} className="text-slate-500" />
                    </button>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-100 mb-6 flex-1 overflow-y-auto custom-scrollbar">
                    <h3 className="font-bold text-slate-700 mb-4 text-lg border-b border-slate-200 pb-2">คำชี้แจง</h3>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedAssignment.description || 'ไม่มีรายละเอียดเพิ่มเติม'}</p>

                    {/* Display attached files */}
                    {selectedAssignment.files && selectedAssignment.files.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-slate-200">
                        <h4 className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-2">
                          <Paperclip size={18} /> ไฟล์แนบ ({selectedAssignment.files.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {selectedAssignment.files.map((file, idx) => (
                            <div key={idx} className="flex items-center gap-3 bg-white border border-slate-200 p-3 rounded-xl hover:border-[#96C68E] transition-colors group cursor-pointer"
                              onClick={() => {
                                if (file.content) openBase64InNewTab(file.content, file.type || 'application/pdf');
                                else alert('ไม่สามารถเปิดไฟล์ได้');
                              }}
                            >
                              <div className="bg-[#F0FDF4] p-2 rounded-lg">
                                <FileText className="text-[#96C68E]" size={20} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-slate-700 truncate">{file.name}</p>
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

              <div className="p-8 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">ตรวจงาน: {selectedAssignment.title}</h2>
                    <div className="flex items-center gap-3 text-slate-500">
                      <p>{selectedAssignment.course}</p>
                      <div className="h-1 w-1 rounded-full bg-slate-300"></div>
                      {/* Left side minimal metadata if needed */}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveModal('grading_detail')}
                      className="hover:text-[#96C68E] cursor-pointer transition-colors flex items-center gap-1 font-bold text-sm bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 hover:border-[#96C68E]"
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
                <div className="flex gap-2 mt-4 border-b border-slate-100 pb-2">
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
                      <thead className="text-left text-slate-500 text-sm border-b border-slate-100">
                        <tr>
                          <th className="pb-2">ชื่อ-นามสกุล</th>
                          <th className="pb-2">สถานะ</th>
                          <th className="pb-2">ไฟล์แนบ</th>
                          <th className="pb-2 text-center">คะแนน</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {submissions.length > 0 ? submissions.map((student) => (
                          <tr key={student.firestoreId || student.id} className="group hover:bg-slate-50">
                            <td className="py-3 font-medium text-slate-700">{student.userName || 'Unknown'}</td>
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
                                        className="text-left font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2 bg-slate-50 border border-slate-200 px-2 py-1 rounded cursor-pointer text-sm max-w-full"
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
                                defaultValue={student.score}
                                className="w-16 p-2 border border-slate-200 rounded-lg text-center font-bold focus:border-[#96C68E] outline-none"
                                id={`score-${student.firestoreId || student.id}`}
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
                            <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                                {student.fullName ? student.fullName.charAt(0) : '?'}
                              </div>
                              <div>
                                <div className="font-bold text-slate-700">{student.fullName || 'Unknown'}</div>
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

                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    onClick={closeModal}
                    className="px-6 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                  >
                    ปิด
                  </button>

                  <button
                    onClick={async () => {
                      try {
                        const targetId = selectedAssignment.firestoreId || selectedAssignment.id;
                        const savePromises = submissions.map(async (student) => {
                          const input = document.getElementById(`score-${student.firestoreId || student.id}`);
                          if (!input) return; // guard against missing element
                          const newScore = input.value;

                          await gradeSubmission(targetId, student.firestoreId || student.id, newScore);

                          if (newScore !== "" && newScore !== null) {
                            await createNotification(
                              student.userId || student.id,
                              `ประกาศคะแนน: ${selectedAssignment.title}`,
                              'grade',
                              `คุณครูได้ตรวจงานและให้คะแนนวิชา ${selectedAssignment.course} แล้ว ได้คะแนน ${newScore}/${selectedAssignment.maxScore || 10}`,
                              {
                                courseId: selectedCourse.firestoreId,
                                targetType: 'assignment',
                                targetId: targetId
                              }
                            );
                          }
                        });

                        await Promise.all(savePromises);
                        alert('บันทึกคะแนนและส่งการแจ้งเตือนเรียบร้อยแล้ว');

                        setSubmissions(prev => prev.map(s => {
                          const el = document.getElementById(`score-${s.firestoreId || s.id}`);
                          return el ? { ...s, score: el.value } : s;
                        }));

                        // Update Main Assignments State with new Pending Count
                        setAssignments(prev => prev.map(a => {
                          if (a.id === selectedAssignment.id || a.firestoreId === selectedAssignment.firestoreId) {
                            let newPendingCount = 0;
                            submissions.forEach(s => {
                              const input = document.getElementById(`score-${s.firestoreId || s.id}`);
                              const val = input ? input.value : s.score;
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


  const renderAssignments = () => {
    // 1. Base Filter: Filter by Course (User must be related to the course)
    const userAssignments = assignments.filter(assign =>
      courses.some(c => c.name === assign.course)
    );

    // 2. Filter by Status Tab (for the list display)
    const filteredAssignments = userAssignments.filter(assign => {
      if (assignmentFilter === 'all') return true;
      if (assignmentFilter === 'pending') {
        return assign.status === 'pending' || assign.status === 'late';
      } else { // submitted
        return assign.status === 'submitted';
      }
    });

    return (
      <div className={`space-y-6 ${darkMode ? 'text-slate-100' : ''}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className={`text-2xl font-bold flex items-center ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            <CheckSquare className="mr-3 text-[#FF917B]" />
            {userRole === 'student' ? 'การบ้านของฉัน' : 'งานที่มอบหมาย'}
          </h1>

          {/* Tab Switcher */}
          <div className={`${darkMode ? 'bg-slate-800' : 'bg-slate-100'} p-1 rounded-xl w-fit flex`}>
            <button
              onClick={() => setAssignmentFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${assignmentFilter === 'all'
                ? (darkMode ? 'bg-slate-700 text-white shadow-md' : 'bg-white text-slate-800 shadow-sm')
                : `text-slate-500 hover:text-slate-700 ${darkMode ? 'dark:hover:text-slate-300' : ''}`
                }`}
            >
              ทั้งหมด ({userAssignments.length})
            </button>
            <button
              onClick={() => setAssignmentFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${assignmentFilter === 'pending'
                ? (darkMode ? 'bg-slate-700 text-white shadow-md' : 'bg-white text-slate-800 shadow-sm')
                : `text-slate-500 hover:text-slate-700 ${darkMode ? 'dark:hover:text-slate-300' : ''}`
                }`}
            >
              {userRole === 'teacher' ? 'รอตรวจ' : 'ยังไม่ส่ง'} ({userAssignments.filter(a => a.status !== 'submitted').length})
            </button>
            <button
              onClick={() => setAssignmentFilter('submitted')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${assignmentFilter === 'submitted'
                ? (darkMode ? 'bg-slate-700 text-white shadow-md' : 'bg-white text-slate-800 shadow-sm')
                : `text-slate-500 hover:text-slate-700 ${darkMode ? 'dark:hover:text-slate-300' : ''}`
                }`}
            >
              {userRole === 'teacher' ? 'เสร็จสิ้น' : 'ส่งแล้ว'} ({userAssignments.filter(a => a.status === 'submitted').length})
            </button>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} rounded-3xl p-6 shadow-sm border`}>
          <div className="space-y-4">
            {filteredAssignments.length > 0 ? (
              filteredAssignments.map((assign) => (
                <div key={assign.id} className={`flex flex-col md:flex-row md:items-center p-4 border rounded-2xl transition-all cursor-pointer ${darkMode ? 'border-slate-800 hover:border-indigo-900 hover:bg-slate-800/50' : 'border-slate-100 hover:border-[#BEE1FF] hover:bg-slate-50'}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${assign.status === 'pending' ? (darkMode ? 'bg-yellow-900/40 text-yellow-400' : 'bg-yellow-100 text-yellow-600') :
                        assign.status === 'submitted' ? (darkMode ? 'bg-green-900/40 text-green-400' : 'bg-green-100 text-green-600') : (darkMode ? 'bg-red-900/40 text-red-400' : 'bg-red-100 text-red-600')
                        }`}>
                        {assign.status === 'pending' ? 'รอส่ง' : assign.status === 'submitted' ? 'ส่งแล้ว' : 'เลยกำหนด'}
                      </span>
                      <span className="text-xs text-slate-500">{assign.course}</span>
                    </div>
                    <h3 className={`font-bold text-lg ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>{assign.title}</h3>
                    <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>กำหนดส่ง: {assign.dueDate ? new Date(assign.dueDate).toLocaleString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'ยังไม่กำหนด'}</p>
                  </div>

                  <div className="mt-4 md:mt-0 flex items-center gap-4">
                    {assign.score && (
                      <div className="text-right">
                        <div className="text-xs text-slate-500">คะแนน</div>
                        <div className="font-bold text-[#96C68E] text-xl">{assign.score}</div>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        if (userRole === 'teacher') {
                          openGradingModal(assign);
                        } else {
                          setSelectedAssignment(assign);
                          setActiveModal('assignmentDetail');
                        }
                      }}
                      className={`px-6 py-2 rounded-xl font-bold text-sm ${userRole === 'teacher'
                        ? (darkMode ? 'bg-slate-800 border-2 border-[#96C68E] text-[#96C68E] hover:bg-slate-700' : 'bg-white border-2 border-[#96C68E] text-[#96C68E] hover:bg-slate-50')
                        : 'bg-[#BEE1FF] text-slate-800 hover:bg-[#A0D5FF]'
                        } transition-colors`}>
                      {userRole === 'teacher' ? 'ตรวจงาน' : (assign.status === 'submitted' ? 'ดูงานที่ส่ง' : 'ส่งการบ้าน')}
                    </button>

                    {userRole === 'teacher' && (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (window.confirm('คุณต้องการลบงานนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
                            try {
                              await deleteAssignment(assign.firestoreId || assign.id);
                              // Remove from local state
                              setAssignments(prev => prev.filter(a => a.id !== assign.id));
                            } catch (error) {
                              console.error('Failed to delete', error);
                              alert('ลบงานไม่สำเร็จ');
                            }
                          }
                        }}
                        className={`p-2 rounded-xl transition-all ${darkMode ? 'text-slate-500 hover:text-red-400 hover:bg-red-900/20' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
                        title="ลบงาน"
                      >
                        <Trash size={20} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                  <CheckCircle className="text-slate-500" size={32} />
                </div>
                <p className="text-slate-500 font-medium">ไม่มีรายการการบ้านในหมวดนี้</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // renderExams removed

  const renderSchedule = () => (
    <div className={`space-y-6 ${darkMode ? 'text-slate-100' : ''}`}>
      <h1 className={`text-2xl font-bold flex items-center ${darkMode ? 'text-white' : 'text-slate-800'}`}>
        <Calendar className="mr-3 text-[#96C68E]" /> {userRole === 'teacher' ? 'ตารางสอน' : 'ตารางเรียน'}
      </h1>

      <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} rounded-3xl p-6 shadow-sm border`}>
        {/* <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-700">มกราคม 2567</h2>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-slate-100 rounded-lg"><ChevronRight className="rotate-180" size={20} /></button>
            <button className="p-2 hover:bg-slate-100 rounded-lg"><ChevronRight size={20} /></button>
          </div>
        </div> */}
        {/* Dynamic Weekly View */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {['จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์'].map((day, i) => {
            const dayOfWeek = i + 1; // 1=Mon, 5=Fri
            // Collect all schedule items for this day from all courses
            // Collect all schedule items for this day from all courses
            const dailyItems = courses.flatMap(c =>
              (c.schedule || []).filter(s => s.dayOfWeek === dayOfWeek).map(s => ({
                ...s,
                courseName: c.name,
                courseCode: c.code,
                teacher: c.teacher,
                color: c.color
              }))
            ).sort((a, b) => a.startTime.localeCompare(b.startTime));

            return (
              <div key={day} className="space-y-3">
                <div className={`text-center font-bold mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{day}</div>
                {dailyItems.length > 0 ? dailyItems.map((slot, idx) => (
                  <div key={idx} className={`p-3 rounded-xl text-sm mb-2 text-center transition-all ${slot.color
                    ? (darkMode ? `${slot.color} bg-opacity-30 border border-white/10` : `${slot.color} bg-opacity-20 border border-black/5`)
                    : (darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-slate-50 border border-slate-100')}`}>
                    <div className={`font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{slot.startTime} - {slot.endTime}</div>
                    <div className={`font-bold line-clamp-1 ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{slot.courseName}</div>
                    <div className={`${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{slot.courseCode}</div>
                    <div className={`text-xs mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>ห้อง {slot.room}</div>
                  </div>
                )) : (
                  <div className={`p-4 rounded-xl border-2 border-dashed text-center text-sm ${darkMode ? 'border-slate-800 text-slate-700' : 'border-slate-100 text-slate-300'}`}>
                    ว่าง
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );

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


  const renderSettings = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <User className="text-[#96C68E]" /> บัญชีผู้ใช้
        </h3>

        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          {/* Profile Picture */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-slate-100 mb-4 overflow-hidden border-4 border-white shadow-md relative group">
              {profile.photoURL ? (
                <img src={profile.photoURL} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#BEE1FF] text-3xl font-bold text-slate-600">
                  {profile.firstName?.[0]}
                </div>
              )}
            </div>
            <button
              onClick={() => {
                setEditProfileData({
                  firstName: profile.firstName,
                  lastName: profile.lastName,
                  photoURL: profile.photoURL
                });
                setActiveModal('editProfile');
              }}
              className="text-sm text-blue-500 hover:text-blue-600 font-bold"
            >
              แก้ไขรูปโปรไฟล์
            </button>
          </div>

          <div className="flex-1 space-y-4 w-full">
            <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'} p-4 rounded-2xl border`}>
              <p className="text-xs text-slate-400 font-bold uppercase mb-1">ชื่อ - นามสกุล</p>
              <p className={`${darkMode ? 'text-slate-200' : 'text-slate-700'} font-medium`}>{profile.firstName} {profile.lastName}</p>
            </div>
            <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'} p-4 rounded-2xl border`}>
              <p className="text-xs text-slate-400 font-bold uppercase mb-1">อีเมล</p>
              <p className={`${darkMode ? 'text-slate-200' : 'text-slate-700'} font-medium`}>{profile.email}</p>
            </div>
            <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'} p-4 rounded-2xl border`}>
              <p className="text-xs text-slate-400 font-bold uppercase mb-1">สถานะ</p>
              <span className={`inline-block px-3 py-1 ${darkMode ? 'bg-green-900/30 text-[#96C68E]' : 'bg-[#F0FDF4] text-[#96C68E]'} rounded-lg text-sm font-bold`}>
                {profile.roleLabel}
              </span>
            </div>
          </div>
        </div>

        <div className={`mt-8 pt-8 ${darkMode ? 'border-slate-800' : 'border-slate-50'} border-t flex justify-end`}>
          <button
            onClick={() => {
              setEditProfileData({
                firstName: profile.firstName,
                lastName: profile.lastName,
                photoURL: profile.photoURL
              });
              setActiveModal('editProfile');
            }}
            className={`flex items-center gap-2 px-6 py-3 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'} border rounded-2xl font-bold transition-all mr-4 shadow-sm`}
          >
            <Edit2 size={18} /> แก้ไขข้อมูลส่วนตัว
          </button>

          <button
            onClick={handleLogout}
            className={`flex items-center gap-2 px-6 py-3 ${darkMode ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-red-50 text-red-500 hover:bg-red-100'} rounded-2xl font-bold transition-all shadow-sm`}
          >
            <LogOut size={18} /> ออกจากระบบ
          </button>
        </div>
      </div>

      <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} rounded-3xl p-8 border shadow-sm relative overflow-hidden transition-all duration-500`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'} flex items-center gap-2`}>
            <Settings className="text-[#96C68E]" /> การตั้งค่าทั่วไป
          </h3>
        </div>

        <div className="space-y-6">
          {/* FONT SIZE SETTING */}
          <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
            <div className="flex justify-between items-center mb-4">
              <span className={`font-bold flex items-center gap-2 ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                <BarChart3 size={18} className="text-blue-400" /> ขนาดตัวอักษร
              </span>
              <span className={`text-sm font-bold ${darkMode ? 'text-blue-400 bg-blue-900/40' : 'text-blue-500 bg-blue-50'} px-3 py-1 rounded-lg`}>{fontSize}%</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-400">เล็ก</span>
              <input
                type="range"
                min="80"
                max="150"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className={`flex-1 h-2 ${darkMode ? 'bg-slate-700' : 'bg-slate-200'} rounded-lg appearance-none cursor-pointer accent-[#96C68E]`}
              />
              <span className={`text-sm font-bold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>ใหญ่</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">* ปรับขนาดตัวอักษรของระบบให้เหมาะสมกับการมองเห็น</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* NOTIFICATIONS SETTING */}
            <div className={`p-6 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${notificationsEnabled ? (darkMode ? 'bg-slate-800 border-green-900/50 shadow-sm' : 'bg-white border-green-200 shadow-sm') : (darkMode ? 'bg-slate-900/50 border-slate-800 opacity-60' : 'bg-slate-50 border-slate-100 opacity-60')}`}
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${notificationsEnabled ? (darkMode ? 'bg-green-900/40 text-[#96C68E]' : 'bg-green-100 text-green-600') : (darkMode ? 'bg-slate-700 text-slate-500' : 'bg-slate-200 text-slate-400')}`}>
                  <Bell size={20} />
                </div>
                <div>
                  <p className={`font-bold text-sm ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>การแจ้งเตือน</p>
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{notificationsEnabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</p>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-colors ${notificationsEnabled ? 'bg-[#96C68E]' : 'bg-slate-300'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notificationsEnabled ? 'right-1' : 'left-1'}`}></div>
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );

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
      return <LandingPage onNavigateToRegister={() => setCurrentView('register')} />;
    }
  }



  return (
    <div className={`flex h-screen bg-[#F8FAFC] font-sans ${darkMode ? 'dark bg-slate-950 text-slate-100' : ''}`} style={{ fontSize: `${fontSize}%` }}>
      {renderModal()}
      {/* VIDEO CONFERENCE MODAL (Jitsi) */}
      {activeModal === 'videoConference' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D3436]/60 backdrop-blur-md p-4">
          <div className="bg-white w-[95vw] h-[90vh] rounded-[2.5rem] overflow-hidden flex flex-col relative shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-4 border-white">

            {/* Header - ใช้สีฟ้า #BEE1FF เป็นพื้นหลังหลัก */}
            <div className="bg-[#BEE1FF] p-5 flex justify-between items-center border-b-2 border-[#96C68E]/20">
              <div className="flex items-center gap-4">
                {/* Icon Box - ใช้สีส้ม #FF917B */}
                <div className="bg-[#FF917B] p-3 rounded-2xl shadow-sm rotate-3">
                  <Video size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-black text-[#4A4A4A] text-xl tracking-tight leading-none">
                    {meetingConfig.topic || 'ห้องเรียนออนไลน์'}
                  </h3>
                  <p className="text-xs font-bold text-[#96C68E] mt-1 uppercase tracking-wider">
                    Schooly Scoot Conference
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveModal(null)}
                className="bg-white hover:bg-[#FFE787] text-[#4A4A4A] px-6 py-2.5 rounded-2xl transition-all font-bold text-sm shadow-sm border-2 border-transparent hover:border-[#FF917B] active:scale-95"
              >
                ปิดหน้าต่าง
              </button>
            </div>

            {/* Jitsi Iframe Container */}
            <div className="flex-1 bg-[#F8FAFC] relative">
              <iframe
                src={`https://meet.jit.si/${meetingConfig.roomName}#config.startWithAudioMuted=true&config.startWithVideoMuted=true&userInfo.displayName="${profile.firstName} ${profile.lastName}"`}
                className="w-full h-full border-0 relative z-10"
                allow="camera; microphone; fullscreen; display-capture; autoplay"
              ></iframe>

              {/* Overlay Loading - ใช้สีเหลือง #FFE787 เป็นพื้นหลังตอนโหลด */}
              <div className="absolute inset-0 bg-[#FFE787]/30 flex flex-col items-center justify-center z-0">
                <div className="flex gap-2 mb-4">
                  <div className="w-3 h-3 bg-[#FF917B] rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-[#96C68E] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-3 h-3 bg-[#BEE1FF] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                </div>
                <span className="text-[#4A4A4A] font-bold text-lg animate-pulse">
                  กำลังจัดเตรียมห้องเรียน...
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}






      {/* Sidebar แถบตัวเลือกข้างๆ */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30 w-64 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#F0F4F8] border-white'} p-4 flex flex-col transition-transform duration-300 border-r
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>

        <h1 className="flex justify-center items-center">
          <img
            src={logo_no_text}
            alt="Schooly Scoot Logo"
            className="h-20 w-auto"
          />
        </h1>

        <span className="text-xl font-bold text-slate-800 tracking-tight text-center mb-6">Schooly Scoot</span>


        <nav className="flex-1 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">เมนูหลัก</p>
          <SidebarItem id="dashboard" label="แดชบอร์ด" icon={PieChart} activeTab={activeTab} darkMode={darkMode} onSelect={() => { setActiveTab('dashboard'); setSelectedCourse(null); setIsMobileMenuOpen(false); }} />
          <SidebarItem id="courses" label="ห้องเรียน" icon={BookOpen} activeTab={activeTab} darkMode={darkMode} onSelect={() => { setActiveTab('courses'); setSelectedCourse(null); setIsMobileMenuOpen(false); }} />
          <SidebarItem id="assignments" label={userRole === 'student' ? "การบ้าน" : "ตรวจงาน"} icon={CheckSquare} activeTab={activeTab} darkMode={darkMode} onSelect={() => { setActiveTab('assignments'); setSelectedCourse(null); setIsMobileMenuOpen(false); }} />
          <SidebarItem id="schedule" label="ตารางเรียน" icon={Calendar} activeTab={activeTab} darkMode={darkMode} onSelect={() => { setActiveTab('schedule'); setSelectedCourse(null); setIsMobileMenuOpen(false); }} />
          <SidebarItem id="settings" label="ตั้งค่า" icon={Settings} activeTab={activeTab} darkMode={darkMode} onSelect={() => { setActiveTab('settings'); setSelectedCourse(null); setIsMobileMenuOpen(false); }} />
        </nav>

        {/* โปรไฟล์ ด้านล่าง*/}
        <div className={`mt-auto ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-transparent'} p-3 rounded-2xl shadow-sm border`}>
          <div
            className="flex items-center p-2 rounded-xl"
          >
            <div className={`w-10 h-10 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-slate-200'} flex items-center justify-center overflow-hidden`}>
              {profile.photoURL ? (
                <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="text-slate-400" />
              )}
            </div>
            <div className="ml-3 flex-1 overflow-hidden">
              <p className={`text-sm font-bold ${darkMode ? 'text-slate-100' : 'text-slate-800'} truncate`}>
                {profile.firstName} {profile.lastName}
              </p>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} truncate capitalize`}>{profile.roleLabel}</p>
            </div>
          </div>
          {/* <button
            onClick={() => {
              const testNoti = {
                message: "ทดสอบการแจ้งเตือน!",
                type: "system",
                id: "test-" + Date.now()
              };
              addNotification(testNoti);
            }}
            className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 text-slate-400 hover:text-blue-500 hover:bg-slate-50 rounded-xl transition-all text-xs border border-dashed border-slate-200"
          >
            <Bell size={14} /> ทดสอบแจ้งเตือน (Local)
          </button> */}

        </div>
      </aside>


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
                loading={loading}
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
                setActiveQuiz={setActiveQuiz}
                setQuizRemainingSeconds={setQuizRemainingSeconds}
                meetingConfig={meetingConfig}
                setMeetingConfig={setMeetingConfig}
                updateCourse={updateCourse}
                handleStartMeeting={handleStartMeeting}
                editingCourse={editingCourse}
                setEditingCourse={setEditingCourse}
                scheduleForm={scheduleForm}
                setScheduleForm={setScheduleForm}
                editingScheduleIndex={editingScheduleIndex}
                setEditingScheduleIndex={setEditingScheduleIndex}
                handleUpdateCourse={handleUpdateCourse}
                handleDeleteCourse={handleDeleteCourse}
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
                {activeTab === 'assignments' && renderAssignments()}
                {activeTab === 'schedule' && renderSchedule()}
                {activeTab === 'messages' && renderMessages()}
                {activeTab === 'calendar' && <CalendarPage courses={courses} userRole={userRole} />}
                {activeTab === 'analytics' && <AnalyticsView setView={setActiveTab} courses={courses} assignments={assignments} userRole={userRole} userId={auth.currentUser?.uid} />}
                {activeTab === 'settings' && renderSettings()}

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
            duration={20000} // 20 seconds
            onClose={() => removeNotification(noti.id)}
          />
        ))}
      </div>

    </div>
  );
}



