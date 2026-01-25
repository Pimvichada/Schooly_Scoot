import React, { useState, useEffect, useRef, useMemo } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { getUserProfile, logoutUser, updateUserProfile } from './services/authService';
import { getAllCourses, seedCourses, createCourse, deleteCourse, getCoursesForUser, joinCourse, updateCourse, leaveCourse, approveJoinRequest, rejectJoinRequest } from './services/courseService';
import { createQuiz, getQuizzesByCourse, deleteQuiz } from './services/quizService';
import { getAssignments, seedAssignments, submitAssignment, getSubmissions, updateAssignmentStatus, createAssignment } from './services/assignmentService';
import { getNotifications, seedNotifications, markNotificationAsRead, createNotification } from './services/notificationService';
import { createPost, getPostsByCourse } from './services/postService';
import { getChats, seedChats, sendMessage } from './services/chatService';
import { getUsersByIds } from './services/authService';
import {
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
  Info,
  Send,
  Image as ImageIcon,
  Paperclip,
  Lock,
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
  Copy
} from 'lucide-react';

import { MascotCircle, MascotSquare, MascotTriangle, MascotStar } from './components/Mascots';
import LoginPage from './components/LoginPage';
import StatCard from './components/StatCard';
import CourseCard from './components/CourseCard';
import SidebarItem from './components/SidebarItem';
import NotificationItem from './components/NotificationItem';
import RegisterPage from './components/RegisterPage';
import CalendarPage from './components/CalendarPage';
import logo_no_text from './assets/logo_no_tex3.png';

const WELCOME_MESSAGES = {
  student: [
    'วันนี้พร้อมเรียนรู้เรื่องใหม่ๆ หรือยัง? อย่าลืมทำการบ้านนะ!',
    'พร้อมเปิดโลกการเรียนรู้ใบใหม่หรือยัง? วันนี้มีเรื่องสนุกๆ รออยู่เพียบ!',
    'วันนี้วันดี! มาตั้งใจเรียนและเก็บเกี่ยวความรู้กลับไปให้เต็มกระเป๋ากันเถอะ',
    'การบ้านเยอะไม่ใช่ปัญหา เพราะเธอเป็นคนเก่ง! สู้ๆ นะ เดี๋ยวก็เสร็จ',
    'ยินดีต้อนรับสู่คาบเรียนหรรษา! เตรียมสมองให้โล่งแล้วมาลุยกันเลย',
    'ทุกความพยายามคือความสำเร็จ! วันนี้มาทำให้เต็มที่ สนุกไปกับการเรียนรู้นะ'
  ],
  teacher: [
    'เตรียมตัวให้พร้อมสำหรับการสอนวันนี้นะครับ นักเรียนกำลังรอความรู้จากคุณครูอยู่!',
    'วันนี้อากาศดี เหมาะกับการสอนมากครับ อย่าลืมแวะตรวจการบ้านด้วยนะครับ',
    'สวัสดีครับคุณครู! วันนี้ตารางแน่นหน่อย แต่รับรองว่าสนุกแน่นอนครับ',
    'ยินดีต้อนรับกลับครับ วันนี้มีเรื่องราวใหม่ๆ รอไปเล่าให้นักเรียนฟังเพียบเลย',
    'พร้อมลุยงานวันนี้หรือยังครับ? มีนักเรียนส่งงานมารอให้คุณครูตรวจเต็มเลย!'
  ]
};



/**
 * Helper to map iconType string back to Component
 */
const getCourseIcon = (type) => {
  switch (type) {
    case 'square': return <MascotSquare className="w-12 h-12" />;
    case 'circle': return <MascotCircle className="w-12 h-12" />;
    case 'triangle': return <MascotTriangle className="w-12 h-12" />;
    case 'star': return <MascotStar className="w-12 h-12" />; // Default
    default: return <MascotStar className="w-12 h-12" />;
  }
};



// --- MAIN COMPONENT ---

export default function SchoolyScootLMS() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('student');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [workView, setWorkView] = useState('current');
  const [currentView, setCurrentView] = useState('login'); // 'current' หรือ 'all'
  const [authLoading, setAuthLoading] = useState(true);

  // Meeting State
  const [meetingConfig, setMeetingConfig] = useState({
    topic: '',
    isActive: false,
    roomName: ''
  });

  // Time State
  const [currentTime, setCurrentTime] = useState(new Date());

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
    // level: 1,
    // xp: 0,
    photoURL: ''
  });

  const welcomeMessage = useMemo(() => {
    const messages = WELCOME_MESSAGES[userRole] || WELCOME_MESSAGES.student;
    return messages[Math.floor(Math.random() * messages.length)];
  }, [userRole]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch user profile from Firestore
          const userProfile = await getUserProfile(user.uid);

          if (userProfile) {
            setUserRole(userProfile.role);
            setProfile({
              firstName: userProfile.fullName.split(' ')[0] || 'User',
              lastName: userProfile.fullName.split(' ').slice(1).join(' ') || '',
              email: user.email,
              roleLabel: userProfile.role === 'student' ? 'นักเรียน' : 'ครูผู้สอน',
              level: userProfile.level || 1,
              xp: userProfile.xp || 0,
              photoURL: userProfile.photoURL || user.photoURL || ''
            });
            setIsLoggedIn(true);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setIsLoggedIn(false);
        setProfile({
          firstName: '',
          lastName: '',
          email: '',
          roleLabel: '',
          level: 1,
          xp: 0
        });
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);


  // Chat State
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);

  const [courses, setCourses] = useState([]); // Empty initially
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseTab, setCourseTab] = useState('home');
  // State for creating course
  const [newCourseData, setNewCourseData] = useState({
    name: '', code: '', color: 'bg-[#96C68E]', description: '',
    startDate: '', endDate: '',
    scheduleItems: [] // { dayOfWeek: 1, startTime: '08:30', endTime: '10:30', room: '421' }
  });
  const [editingCourse, setEditingCourse] = useState(null); // State for editing in settings
  const [joinCode, setJoinCode] = useState(''); // State for student joining

  // Fetch Courses
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
  }, [isLoggedIn, userRole]); // Re-fetch when login state or role changes

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
        // setSelectedCourse(prev => ({ ...prev, ...courseData })); // Careful with recursion/re-renders if not handled
      }
    });

    return () => unsubscribe();
  }, [selectedCourse?.firestoreId]);
  const [activeQuiz, setActiveQuiz] = useState(null); // Which quiz is currently being taken
  const [quizAnswers, setQuizAnswers] = useState({}); // Stores answers { questionIndex: optionIndex }
  const [quizResult, setQuizResult] = useState(null); // Stores final score
  const [quizzes, setQuizzes] = useState([]);


  // Fetch quizzes when entering a course or changing tab to quizzes
  useEffect(() => {
    const fetchQuizzes = async () => {
      if (selectedCourse && courseTab === 'quizzes') {
        const q = await getQuizzesByCourse(selectedCourse.name);
        setQuizzes(q);
      }
    };
    fetchQuizzes();
  }, [selectedCourse, courseTab]);


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
      if (selectedCourse && selectedCourse.studentIds) {
        selectedCourse.studentIds.forEach(studentId => {
          createNotification(
            studentId,
            `เข้าเรียน: ${meetingConfig.topic}`,
            'meeting',
            `วิชา ${selectedCourse.name} เริ่มการเรียนการสอนแล้ว! กดเพื่อเข้าร่วม`
          );
        });
      }
    } catch (error) {
      console.error("Failed to start meeting:", error);
      alert("เกิดข้อผิดพลาดในการเริ่มคลาสเรียน");
    }
  };

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
    title: '',
    course: '', // विल be set dynamically
    time: '30 นาที',
    items: [{ q: '', options: ['', '', '', ''], correct: 0 }]
  });

  // Modal State
  const [activeModal, setActiveModal] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  // Data States

  const [members, setMembers] = useState([]);
  const [pendingMembers, setPendingMembers] = useState([]); // Pending Students
  const [submissions, setSubmissions] = useState([]);

  // Post Feed State
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');

  // Fetch Posts when course selected
  useEffect(() => {
    const fetchPosts = async () => {
      if (selectedCourse?.firestoreId) {
        try {
          const loadedPosts = await getPostsByCourse(selectedCourse.firestoreId);
          setPosts(loadedPosts);
        } catch (error) {
          console.error("Failed to load posts", error);
        }
      } else {
        setPosts([]);
      }
    };
    fetchPosts();
  }, [selectedCourse]);

  // Handle Create Post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    try {
      const author = {
        uid: auth.currentUser.uid,
        name: `${profile.firstName} ${profile.lastName}`,
        avatar: profile.photoURL,
        role: profile.roleLabel
      };

      const newPost = await createPost(selectedCourse.firestoreId, newPostContent, author);

      // Update local state
      setPosts([newPost, ...posts]);
      setNewPostContent('');
      // alert('โพสต์ประกาศเรียบร้อย');
    } catch (error) {
      console.error("Failed to create post", error);
      alert('ไม่สามารถสร้างโพสต์ได้');
    }
  };

  // Edit Profile State
  const [editProfileData, setEditProfileData] = useState({
    firstName: '',
    lastName: '',
    photoURL: ''
  });

  // Handle Update Profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
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
      alert('เกิดข้อผิดพลาดในการบันทึกโปรไฟล์');
    }
  };

  // Handle File Upload (Convert to Base64)
  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for base64
        alert('รูปภาพต้องมีขนาดไม่เกิน 1MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditProfileData({ ...editProfileData, photoURL: reader.result });
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
    setSelectedAssignment(assignment);
    // Fetch submissions for this assignment
    const subs = await getSubmissions(assignment.firestoreId);
    setSubmissions(subs);
    setActiveModal('grading');
  };

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);

  // Fetch Notifications & Chats
  useEffect(() => {
    const fetchData = async () => {
      if (auth.currentUser) {
        // Notifications
        await seedNotifications(auth.currentUser.uid);
        const notifs = await getNotifications(auth.currentUser.uid);
        setNotifications(notifs);

        // Chats
        await seedChats(auth.currentUser.uid);
        const chatData = await getChats(auth.currentUser.uid);
        setChats(chatData);
      }
    };
    fetchData();
  }, [auth.currentUser]);

  const markNotificationRead = (id) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    // Sync with Firestore
    const notif = notifications.find(n => n.id === id);
    if (notif && notif.firestoreId) {
      markNotificationAsRead(notif.firestoreId);
    }
    if (selectedNotification && selectedNotification.id === id) {
      setSelectedNotification(prev => prev ? { ...prev, read: true } : prev);
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

  // Quiz Taking Logic
  const submitQuiz = () => {
    if (!activeQuiz) return;
    let score = 0;
    activeQuiz.items.forEach((item, idx) => {
      if (quizAnswers[idx] === item.correct) score++;
    });
    setQuizResult({ score, total: activeQuiz.items.length });
  };

  // Create Exam Logic
  const handleAddQuestion = () => {
    setNewExam(prev => ({
      ...prev,
      items: [...prev.items, { q: '', options: ['', '', '', ''], correct: 0 }]
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

  const handleSaveExam = async () => {
    if (!newExam.title || newExam.items.some(i => !i.q)) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    try {
      const examToAdd = {
        title: newExam.title,
        course: newExam.course || selectedCourse.name, // Use selected course or user choice
        questions: newExam.items.length,
        time: newExam.time,
        status: 'available',
        score: null,
        // Deep copy items to avoid reference issues
        items: newExam.items.map(item => ({
          ...item,
          options: [...item.options]
        })),
        ownerId: auth.currentUser.uid
      };

      const createdQuiz = await createQuiz(examToAdd);

      setQuizzes([...quizzes, createdQuiz]);
      setActiveModal(null);
      // Reset form
      setNewExam({
        title: '',
        course: '',
        time: '',
        items: [{ q: '', options: ['', '', '', ''], correct: 0 }]
      });
      alert('สร้างแบบทดสอบเรียบร้อย');
    } catch (error) {
      console.error("Failed to create quiz", error);
      alert('เกิดข้อผิดพลาดในการสร้างแบบทดสอบ');
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

      // Prepare file data (names only for now as we don't have Storage)
      const fileData = uploadFile.map(f => ({ name: f.name, size: f.size }));

      // Call Service
      await submitAssignment(
        targetId,
        auth.currentUser.uid,
        `${profile.firstName} ${profile.lastName}`,
        fileData
      );

      // Update Local State
      setAssignments(prev => prev.map(assign => {
        if (assign.id === assignmentId) {
          return {
            ...assign,
            status: 'submitted',
            submittedFiles: uploadFile // Keep local file objects for UI display
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

  const renderModal = () => {
    if (!activeModal) return null;
    const currentAssignmentData = assignments.find(a => a.id === selectedAssignment?.id);

    const closeModal = () => {
      setActiveModal(null);
      // setSelectedAssignment(null);
      // setSelectedNotification(null);
      setUploadFile([]);
      setActiveQuiz(null);
      setQuizAnswers({});
      setQuizResult(null);
    };

    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className={`bg-white rounded-3xl shadow-2xl w-full ${['grading', 'takeQuiz', 'createExam', 'create'].includes(activeModal) ? 'max-w-4xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto relative`}>
          <button onClick={closeModal} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 z-10">
            <X size={20} className="text-slate-600" />
          </button>

          {/* CREATE EXAM MODAL (TEACHER) */}
          {activeModal === 'createExam' && (
            <div className="p-8 h-[80vh] flex flex-col">
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
                    <select
                      className="w-full p-3 rounded-xl border border-slate-200 focus:border-[#96C68E] outline-none bg-white"
                      value={newExam.course}
                      onChange={(e) => setNewExam({ ...newExam, course: e.target.value })}
                    >


                      {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-1">เวลาในการทำ (นาที)</label>
                    <input
                      type="text"
                      className="w-full p-3 rounded-xl border border-slate-200 focus:border-[#96C68E] outline-none"
                      placeholder="เช่น 30 นาที"
                      value={newExam.time}
                      onChange={(e) => setNewExam({ ...newExam, time: e.target.value })}
                    />
                  </div>
                </div>

                {/* Question Editor */}
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-700">รายการคำถาม ({newExam.items.length})</h3>
                  {newExam.items.map((item, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-2xl p-4 relative group hover:border-[#BEE1FF] transition-all">
                      <div className="flex justify-between mb-2">
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">ข้อที่ {idx + 1}</span>
                        <button onClick={() => handleRemoveQuestion(idx)} className="text-red-400 hover:text-red-600"><Trash size={16} /></button>
                      </div>
                      <input
                        type="text"
                        className="w-full p-2 mb-3 border-b border-slate-200 focus:border-[#96C68E] outline-none font-bold text-slate-700"
                        placeholder="พิมพ์โจทย์คำถาม..."
                        value={item.q}
                        onChange={(e) => handleUpdateQuestion(idx, 'q', e.target.value)}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {item.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center">
                            <input
                              type="radio"
                              name={`correct-${idx}`}
                              checked={item.correct === optIdx}
                              onChange={() => handleUpdateQuestion(idx, 'correct', optIdx)}
                              className="mr-2"
                            />
                            <input
                              type="text"
                              className={`flex-1 p-2 rounded-lg border text-sm ${item.correct === optIdx ? 'border-[#96C68E] bg-[#F0FDF4]' : 'border-slate-200'}`}
                              placeholder={`ตัวเลือก ${optIdx + 1}`}
                              value={opt}
                              onChange={(e) => handleUpdateOption(idx, optIdx, e.target.value)}
                            />
                          </div>
                        ))}
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
                <button onClick={closeModal} className="px-6 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50">ยกเลิก</button>
                <button onClick={handleSaveExam} className="px-6 py-3 rounded-xl bg-[#96C68E] text-white font-bold hover:bg-[#85b57d] shadow-sm flex items-center">
                  <Save size={20} className="mr-2" /> บันทึกแบบทดสอบ
                </button>
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
                  <div className="flex items-center text-[#96C68E] font-bold bg-[#F0FDF4] px-4 py-2 rounded-xl">
                    <Clock size={18} className="mr-2" /> {activeQuiz.time}
                  </div>
                </div>
                <p className="text-slate-500">{activeQuiz.course} • {activeQuiz.questions} ข้อ</p>
              </div>

              {quizResult ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in">
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
                  <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                    {activeQuiz.items.map((q, idx) => (
                      <div key={idx} className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <h4 className="font-bold text-lg text-slate-800 mb-4">{q.q}</h4>
                        <div className="space-y-3">
                          {q.options.map((opt, optIdx) => (
                            <label key={optIdx} className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${quizAnswers[idx] === optIdx
                              ? 'border-[#96C68E] bg-white shadow-sm'
                              : 'border-transparent bg-white hover:bg-slate-100'
                              }`}>
                              <input
                                type="radio"
                                name={`q-${idx}`}
                                className="w-5 h-5 text-[#96C68E] mr-3"
                                onChange={() => setQuizAnswers({ ...quizAnswers, [idx]: optIdx })}
                                checked={quizAnswers[idx] === optIdx}
                              />
                              <span className="text-slate-700">{opt}</span>
                            </label>
                          ))}
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
            <div className="flex flex-col h-[600px] bg-slate-900 rounded-3xl overflow-hidden relative group">
              <div className="absolute top-6 left-6 z-20 flex items-center space-x-3">
                <div className="bg-red-500 px-3 py-1 rounded-full flex items-center animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                  <span className="text-white text-xs font-bold uppercase tracking-wider">Live</span>
                </div>
              </div>

              <div className="flex-1 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="w-24 h-24 rounded-full bg-slate-800 mx-auto mb-4 flex items-center justify-center text-4xl animate-bounce">👨‍🏫</div>
                  <h3 className="text-2xl font-bold mb-2">กำลังรอให้ครูอนุญาต...</h3>
                  <p className="text-slate-400">ห้องเรียน: คณิตศาสตร์</p>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-center gap-4">
                <button onClick={closeModal} className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg transition-transform hover:scale-110"><PhoneOff size={24} /></button>
                <button className="p-4 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-transform hover:scale-110"><MicOff size={24} /></button>
                <button className="p-4 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-transform hover:scale-110"><VideoOff size={24} /></button>
              </div>
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
                          setNewCourseData({
                            ...newCourseData,
                            scheduleItems: [...newCourseData.scheduleItems, {
                              dayOfWeek: parseInt(day),
                              startTime: start,
                              endTime: end,
                              room: room,
                              dayLabel: dayMap[day]
                            }]
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
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <Bell className="mr-3 text-[#FF917B]" /> การแจ้งเตือนทั้งหมด
              </h2>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar ">
                {notifications.map((notif) => (
                  <NotificationItem
                    key={notif.id}
                    notif={notif}
                    isSelected={selectedNotification?.id === notif.id}
                    onClick={() => {
                      setSelectedNotification(notif);
                      markNotificationRead(notif.id);

                      // Smart Navigation Logic
                      if (notif.message.includes('คำขอเข้าห้องเรียน') && userRole === 'teacher') {
                        // Extract course name or find relevant course
                        // NOTE: In a real app we'd store courseId in notification metadata.
                        // Here we try to fuzzy match or just let teacher find it, BUT 
                        // let's try to match by name if present in message, e.g. "คำขอเข้าห้องเรียน: Science"
                        const courseName = notif.message.split(': ')[1];
                        const targetCourse = courses.find(c => c.name === courseName);
                        if (targetCourse) {
                          setSelectedCourse(targetCourse);
                          setCourseTab('people'); // Navigate to Members/Approvals
                          setActiveModal(null); // Close modal
                        } else {
                          setActiveModal('notificationDetail');
                        }
                      } else if (notif.message.includes('อนุมัติการเข้าห้องเรียน') && userRole === 'student') {
                        const courseName = notif.message.split(': ')[1];
                        const targetCourse = courses.find(c => c.name === courseName);
                        if (targetCourse) {
                          setSelectedCourse(targetCourse);
                          setCourseTab('home');
                          setActiveModal(null);
                        } else {
                          setActiveModal('notificationDetail');
                        }
                      } else {
                        // Default behavior
                        setActiveModal('notificationDetail');
                      }
                    }}
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
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{currentAssignmentData.title}</h2>
                  <p className="text-slate-500">{currentAssignmentData.course} • ครบกำหนด {currentAssignmentData.dueDate}</p>
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
                        <div key={idx} className="flex items-center gap-3 bg-white border border-slate-200 p-3 rounded-xl">
                          <FileText className="text-[#BEE1FF]" size={20} />
                          <div>
                            <p className="text-sm font-bold text-slate-700">{file.name}</p>
                            <p className="text-xs text-slate-400">{(file.size ? (file.size / 1024).toFixed(1) : 0)} KB</p>
                          </div>
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
                            onClick={() => window.open(URL.createObjectURL(file), '_blank')}
                            className="text-xs font-bold text-[#96C68E] bg-[#F0FDF4] px-3 py-1.5 rounded-lg hover:bg-[#96C68E] hover:text-white transition-all"
                          >
                            เปิดดูไฟล์
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        setAssignments(prev => prev.map(a => a.id === currentAssignmentData.id ? { ...a, status: 'pending', submittedFiles: [] } : a));
                      }}
                      className="text-sm text-red-400 hover:underline mt-2"
                    >
                      ยกเลิกการส่งเพื่อแก้ไข
                    </button>
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
                  className="w-full py-3 bg-[#96C68E] text-white rounded-xl font-bold hover:bg-[#85b57d] shadow-lg hover:shadow-xl transition-all"
                >
                  บันทึกการเปลี่ยนแปลง
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
                <input
                  type="text"
                  placeholder="ชื่องาน"
                  className="w-full p-3 rounded-xl border"
                  value={newAssignment.title}
                  onChange={(e) =>
                    setNewAssignment({ ...newAssignment, title: e.target.value })
                  }
                />
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
                      const assignmentPayload = {
                        title: newAssignment.title,
                        course: newAssignment.course,
                        dueDate: newAssignment.dueDate,
                        description: newAssignment.description,
                        // Store array of file metadata
                        files: newAssignment.files.map(f => ({
                          name: f.name,
                          size: f.size,
                          type: f.type
                        })),
                        status: 'pending',
                        score: null,
                        createdAt: new Date().toISOString(),
                        ownerId: auth.currentUser?.uid // Track who created it
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
                            `วิชา ${newAssignment.course} สั่งงานใหม่ กำหนดส่ง ${newAssignment.dueDate || 'ยังไม่กำหนด'}`
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
          {activeModal === 'grading' && selectedAssignment && (
            <div className="p-8 h-[80vh] flex flex-col">
              <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">ตรวจงาน: {selectedAssignment.title}</h2>
                  <p className="text-slate-500">{selectedAssignment.course}</p>
                </div>
                <div className="bg-[#BEE1FF] px-4 py-2 rounded-xl text-slate-700 font-bold">
                  คะแนนเต็ม: 10
                </div>
              </div>


              {/* Grading List */}
              <div className="flex-1 overflow-y-auto mt-4">
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
                          {student.file && (
                            <a href="#" className="font-medium text-blue-500 hover:underline flex items-center gap-1">
                              <FileText size={14} /> ไฟล์งาน
                            </a>
                          )}
                        </td>
                        <td className="py-3 text-center">
                          <input
                            type="text"
                            placeholder="-"
                            defaultValue={student.score}
                            className="w-16 p-2 border border-slate-200 rounded-lg text-center font-bold focus:border-[#96C68E] outline-none"
                          />
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="4" className="text-center py-4 text-slate-400">ยังไม่มีใครส่งงาน</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button onClick={closeModal} className="px-6 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50">ปิด</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- PAGE CONTENT RENDERERS ---



  const renderDashboard = () => (
    <div className="h-screen space-y-6 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <div className="bg-[#BEE1FF] rounded-3xl p-6 md:p-10 relative overflow-hidden group">
        <div className="relative z-10 max-w-[70%]">
          <h1 className="text-2xl md:text-4xl font-bold text-slate-800 mb-2">
            สวัสดี, {userRole === 'student' ? `น้อง${profile.firstName}!` : `คุณครู${profile.firstName}!`} 👋
          </h1>
          <p className="text-slate-600">
            {welcomeMessage}
          </p>
          <div className="mt-6 flex space-x-3">
            <button onClick={() => setActiveTab('schedule')} className="bg-white text-slate-800 px-6 py-2 rounded-xl font-bold shadow-sm hover:shadow hover:scale-105 transition-all">
              ดูตารางเรียน
            </button>
            <button onClick={() => setActiveTab('assignments')} className="bg-[#FF917B] text-white px-6 py-2 rounded-xl font-bold shadow-sm hover:shadow hover:scale-105 transition-all">
              {userRole === 'student' ? 'การบ้านคงเหลือ' : 'ตรวจการบ้าน'}
            </button>
          </div>
        </div>

        {/* Decorative Mascots with Hover Animation */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 md:right-10 flex space-x-[-20px] items-center">
          <div className="transition-transform duration-300 hover:-translate-y-4 hover:rotate-6 cursor-pointer">
            <MascotCircle className="w-24 h-24 md:w-40 md:h-40" />
          </div>
          <div className="transition-transform duration-300 hover:-translate-y-4 hover:-rotate-6 cursor-pointer delay-75">
            <MascotTriangle className="w-20 h-20 md:w-32 md:h-32" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          title={userRole === 'student' ? "วิชาเรียน" : "ห้องเรียน"}
          value={courses.length.toString()}
          color="bg-[#FFE787]"
          icon={<BookOpen size={64} />}
          onClick={() => setActiveTab('courses')}
        />
        <StatCard
          title={userRole === 'student' ? "การบ้านที่ต้องส่ง" : "งานรอตรวจ"}
          value={userRole === 'student'
            ? assignments.filter(a => a.status === 'pending').length.toString()
            : assignments.length.toString()}
          icon={<FileText size={64} />}
          color="bg-[#FF917B]"
          onClick={() => setActiveTab('assignments')}
        />
        <StatCard
          value={
            <div className="flex flex-col">
              <span className="text-4xl font-black text-slate-800 tracking-tight">
                {currentTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-sm font-medium text-slate-600 mt-1 opacity-80">
                {currentTime.toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          }
          color="bg-[#96C68E]"
          icon={<Clock size={80} className="opacity-40" />}
          onClick={() => setActiveTab('calendar')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center">
              <Calendar className="mr-2 text-[#96C68E]" /> ตารางเรียนวันนี้
            </h2>
          </div>
          <div className="space-y-4">
            {(() => {
              const today = new Date().getDay(); // 0=Sun, 1=Mon...
              const now = new Date();
              const currentHm = now.getHours() * 60 + now.getMinutes();

              const todaySchedule = courses.flatMap(c =>
                (c.schedule || [])
                  .filter(s => s.dayOfWeek === today)
                  .map(s => ({ ...s, subject: c.name }))
              ).sort((a, b) => a.startTime.localeCompare(b.startTime));

              if (todaySchedule.length === 0) {
                return (
                  <div className="text-center py-12 text-slate-400">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Calendar size={24} />
                    </div>
                    วันนี้ไม่มีการเรียนการสอน พักผ่อนให้เต็มที่! 😴
                  </div>
                );
              }

              return todaySchedule.map((slot, idx) => {
                const [sH, sM] = slot.startTime.split(':').map(Number);
                const [eH, eM] = slot.endTime.split(':').map(Number);
                const startHm = sH * 60 + sM;
                const endHm = eH * 60 + eM;
                const isActive = currentHm >= startHm && currentHm < endHm;

                return (
                  <div key={idx} className={`flex items-center p-4 rounded-2xl transition-all ${isActive ? 'bg-[#F0FDF4] border border-[#96C68E] shadow-sm scale-[1.02]' : 'bg-slate-50 border border-slate-50'}`}>
                    <div className={`w-28 font-bold ${isActive ? 'text-[#96C68E]' : 'text-slate-500'}`}>
                      {slot.startTime} - {slot.endTime}
                    </div>
                    <div className="flex-1 px-4 border-l border-slate-200 ml-4">
                      <div className="font-bold text-slate-800 text-lg">{slot.subject}</div>
                      <div className="text-sm text-slate-500 flex items-center mt-1">
                        <span className="bg-slate-200 px-2 py-0.5 rounded text-xs mr-2">ห้อง {slot.room}</span>
                      </div>
                    </div>
                    {isActive && (
                      <button onClick={() => setActiveModal('video')} className="bg-[#96C68E] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center hover:bg-[#85b57d] shadow-sm animate-pulse">
                        <Video size={16} className="mr-1" /> เข้าเรียน
                      </button>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
            <Bell className="mr-2 text-[#FF917B]" /> การแจ้งเตือน
          </h2>
          <div className="space-y-4">
            {/* ใช้ .slice(0, 3) เพื่อเลือกแค่ 3 รายการแรก */}
            {notifications.slice(0, 4).map((notif) => (
              <NotificationItem
                compact
                key={notif.id}
                notif={notif}
                isSelected={selectedNotification?.id === notif.id}
                onClick={() => {
                  setSelectedNotification(notif);
                  markNotificationRead(notif.id);
                  setActiveModal('notificationDetail');
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div >
  );

  const renderCourses = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">ห้องเรียนของฉัน</h1>
        {userRole === 'teacher' ? (
          <button onClick={() => setActiveModal('create')} className="bg-[#96C68E] text-white px-4 py-2 rounded-xl font-bold shadow-sm flex items-center hover:bg-[#85b57d]">
            <Plus size={20} className="mr-2" /> สร้างห้องเรียน
          </button>
        ) : (
          <button onClick={() => setActiveModal('join')} className="bg-white text-slate-600 border border-slate-200 px-4 py-2 rounded-xl font-bold shadow-sm flex items-center hover:bg-slate-50">
            <Search size={20} className="mr-2" /> เข้าร่วมด้วยรหัส
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courses.map(course => (
          <CourseCard
            key={course.id}
            course={course}
            onClick={() => setSelectedCourse(course)}
            isTeacher={userRole === 'teacher'}
            onDelete={handleDeleteCourse}
          />
        ))}

      </div>
    </div>
  );



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
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center">
            <CheckSquare className="mr-3 text-[#FF917B]" />
            {userRole === 'student' ? 'การบ้านของฉัน' : 'งานที่มอบหมาย'}
          </h1>

          {/* Tab Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setAssignmentFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${assignmentFilter === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              ทั้งหมด ({userAssignments.length})
            </button>
            <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
              <button
                onClick={() => setAssignmentFilter('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${assignmentFilter === 'pending' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                ยังไม่ส่ง ({userAssignments.filter(a => a.status !== 'submitted').length})
              </button>
              <button
                onClick={() => setAssignmentFilter('submitted')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${assignmentFilter === 'submitted' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                ส่งแล้ว ({userAssignments.filter(a => a.status === 'submitted').length})
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="space-y-4">
            {filteredAssignments.length > 0 ? (
              filteredAssignments.map((assign) => (
                <div key={assign.id} className="flex flex-col md:flex-row md:items-center p-4 border border-slate-100 rounded-2xl hover:border-[#BEE1FF] hover:bg-slate-50 transition-all cursor-pointer">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${assign.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                        assign.status === 'submitted' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                        {assign.status === 'pending' ? 'รอส่ง' : assign.status === 'submitted' ? 'ส่งแล้ว' : 'เลยกำหนด'}
                      </span>
                      <span className="text-xs text-slate-400">{assign.course}</span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg">{assign.title}</h3>
                    <p className="text-sm text-slate-500">กำหนดส่ง: {assign.dueDate}</p>
                  </div>

                  <div className="mt-4 md:mt-0 flex items-center gap-4">
                    {assign.score && (
                      <div className="text-right">
                        <div className="text-xs text-slate-400">คะแนน</div>
                        <div className="font-bold text-[#96C68E] text-xl">{assign.score}</div>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setSelectedAssignment(assign);
                        setActiveModal(userRole === 'teacher' ? 'grading' : 'assignmentDetail');
                      }}
                      className={`px-6 py-2 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 ${userRole === 'teacher' ? 'bg-white border-2 border-[#96C68E] text-[#96C68E]' : 'bg-[#BEE1FF] text-slate-800'
                        }`}>
                      {userRole === 'teacher' ? 'ตรวจงาน' : (assign.status === 'submitted' ? 'ดูงานที่ส่ง' : 'ส่งการบ้าน')}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-slate-300" size={32} />
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold text-slate-800 flex items-center"><Calendar className="mr-3 text-[#96C68E]" /> {userRole === 'teacher' ? 'ตารางสอน' : 'ตารางเรียน'}</h1>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
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
                <div className="text-center font-bold text-slate-500 mb-2 ">{day}</div>
                {dailyItems.length > 0 ? dailyItems.map((slot, idx) => (
                  <div key={idx} className={`p-3 rounded-xl text-sm border-gray-200 mb-2 text-center ${slot.color ? slot.color + ' bg-opacity-20 border-opacity-50' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="font-bold text-slate-800">{slot.startTime} - {slot.endTime}</div>
                    <div className="text-slate-700 font-bold line-clamp-1">{slot.courseName}</div>
                    <div className="text-slate-500">{slot.courseCode}</div>
                    <div className="text-xs text-slate-500 mt-1">ห้อง {slot.room}</div>
                  </div>
                )) : (
                  <div className="p-4 rounded-xl border-2 border-dashed border-slate-100 text-center text-slate-300 text-sm">
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
      <div className="space-y-6 animate-in fade-in duration-500 h-[calc(100vh-140px)] flex flex-col">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center"><MessageSquare className="mr-3 text-[#BEE1FF]" /> ข้อความ</h1>
        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 flex overflow-hidden">
          {/* Chat List */}
          <div className={`w-full md:w-1/3 border-r border-slate-100 overflow-y-auto ${activeChatId ? 'hidden md:block' : 'block'}`}>
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="ค้นหาแชท..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#BEE1FF] text-sm"
                />
              </div>
            </div>
            {chats.map(chat => (
              <div
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`p-4 hover:bg-slate-50 cursor-pointer border-b border-slate-50 flex gap-3 transition-colors ${activeChatId === chat.id ? 'bg-[#F0F9FF]' : ''}`}
              >
                <div className={`w-12 h-12 rounded-full ${chat.avatar} flex-shrink-0 flex items-center justify-center text-slate-700 font-bold text-lg`}>
                  {chat.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`font-bold truncate ${activeChatId === chat.id ? 'text-[#96C68E]' : 'text-slate-800'}`}>{chat.name}</h4>
                    <span className="text-xs text-slate-400 whitespace-nowrap ml-2">{chat.time}</span>
                  </div>
                  <p className="text-sm text-slate-500 truncate">{chat.lastMessage}</p>
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
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setActiveChatId(null)} className="md:hidden p-2 -ml-2 text-slate-500">
                      <ChevronRight className="rotate-180" />
                    </button>
                    <div className={`w-10 h-10 rounded-full ${activeChat.avatar} flex items-center justify-center text-slate-700 font-bold`}>
                      {activeChat.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{activeChat.name}</h4>
                      <p className="text-xs text-slate-500">{activeChat.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 text-slate-400">
                    <button className="p-2 hover:bg-slate-50 rounded-full"><Video size={20} /></button>
                    <button className="p-2 hover:bg-slate-50 rounded-full"><Info size={20} /></button>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8FAFC]">
                  {activeChat.messages.map(msg => {
                    const isMe = msg.sender === 'me';
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] ${isMe ? 'order-2' : 'order-1'}`}>
                          {msg.sender !== 'me' && msg.name && <p className="text-xs text-slate-400 mb-1 ml-1">{msg.name}</p>}
                          <div className={`p-3 rounded-2xl text-sm ${isMe
                            ? 'bg-[#BEE1FF] text-slate-800 rounded-br-none'
                            : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none shadow-sm'
                            }`}>
                            {msg.text}
                          </div>
                          <p className={`text-[10px] text-slate-400 mt-1 ${isMe ? 'text-right mr-1' : 'ml-1'}`}>
                            {msg.time}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-slate-100">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <button type="button" className="p-3 text-slate-400 hover:bg-slate-50 rounded-xl">
                      <Plus size={20} />
                    </button>
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="พิมพ์ข้อความ..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:border-[#96C68E] transition-colors"
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
              <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-400 p-8 text-center">
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

  const renderCourseDetail = () => {
    // Helper to render content based on active sub-tab
    const renderSubTabContent = () => {
      switch (courseTab) {
        case 'home':
        case 'home':
          return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Left Sidebar - Class Info & Upcoming Work */}
              <div className="md:col-span-1 space-y-6">
                {/* About Course Card */}
                <div className="relative overflow-hidden bg-white p-6 rounded-3xl border border-slate-100 shadow-sm group hover:shadow-md transition-all duration-300">
                  {/* Decorative Gradient Blob */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient[#FFE787]  opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

                  <h3 className="relative font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <div className="bg-[#E3F2FD] p-2 rounded-xl text-[#BEE1FF]">
                      <Info size={20} className="text-[#5B9BD5]" />
                    </div>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">เกี่ยวกับวิชา</span>
                  </h3>

                  <div className="relative space-y-5">

                    <div className="relative">

                      {selectedCourse.description && (
                        <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-50">
                          <p className="text-xs text-indigo-300 font-bold uppercase mt-1 flex items-center gap-1">
                            คำอธิบาย
                          </p>
                          <p className="text-sm text-indigo-900 leading-relaxed font-medium">{selectedCourse.description}</p>
                        </div>
                      )}
                      <p className="text-xs text-slate-400 font-bold uppercase mt-4 mb-2 tracking-wider flex items-center gap-1">
                        รหัสเข้าเรียน <Star size={12} className="text-[#FFE787] fill-[#FFE787]" />
                      </p>
                      <div
                        className="relative overflow-hidden flex items-center justify-between bg-[#FFF0EE] p-4 rounded-2xl border-2 border-dashed border-[#FF917B] cursor-pointer hover:bg-[#FFE5E2] transition-colors group/code"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedCourse.inviteCode);
                        }}

                      >

                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FF917B_1px,transparent_1px)] [background-size:8px_8px]"></div>

                        <code className="relative text-[#FF917B] font-black text-xl tracking-widest">{selectedCourse.inviteCode}</code>
                        <div className="relative bg-white p-2 rounded-xl shadow-sm group-hover/code:scale-110 transition-transform">
                          <Copy size={16} className="text-[#FF917B]" />
                        </div>
                      </div>
                    </div>


                  </div>
                </div>

                {/* Upcoming Work Card */}

              </div>

              {/* Main Feed Area */}
              <div className="md:col-span-3 space-y-6">
                {/* Post Input Area */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 relative">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-full bg-slate-100 p-1 flex-shrink-0 border-2 border-white shadow-sm">
                      <div className="w-full h-full rounded-full overflow-hidden">
                        {profile.photoURL ? (
                          <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#BEE1FF] to-[#9acbff] text-white font-bold text-xl">
                            {profile.firstName?.[0]}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <form onSubmit={handleCreatePost} className="relative z-10">
                        <div className="relative group">
                          <textarea
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            placeholder={`ประกาศบางอย่างให้กับชั้นเรียน...`}
                            className="w-full p-5 bg-[#F8FAFC] rounded-3xl border-2 border-transparent focus:border-[#BEE1FF]/50 focus:bg-white transition-all text-slate-700 resize-none min-h-[100px] shadow-inner placeholder:text-slate-400"
                          />
                          <div className="absolute right-3 bottom-3 flex gap-2">
                            <button type="button" className="p-2 text-slate-400 hover:bg-[#FFE787] hover:text-[#B49216] rounded-xl transition-all duration-300">
                              <Upload size={18} />
                            </button>
                            <button type="button" className="p-2 text-slate-400 hover:bg-[#96C68E] hover:text-[#2D5A27] rounded-xl transition-all duration-300">
                              <FileText size={18} />
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-end mt-3">
                          <button
                            type="submit"
                            disabled={!newPostContent.trim()}
                            className={`px-8 py-2.5 rounded-2xl font-bold transition-all transform hover:-translate-y-1 active:translate-y-0 ${newPostContent.trim() ? 'bg-gradient-to-r from-[#96C68E] to-[#7CB372] text-white shadow-lg shadow-green-200' : 'bg-slate-100 text-slate-300'}`}
                          >
                            ส่ง
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>

                {/* Posts List */}
                <div className="space-y-5">
                  {posts.length > 0 ? posts.map(post => (
                    <div key={post.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 p-1 shadow-sm">
                            <div className="w-full h-full rounded-xl overflow-hidden">
                              {post.author?.avatar ? (
                                <img src={post.author.avatar} alt="Author" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FF917B] to-[#FF7B61] text-white font-bold text-lg">
                                  {post.author?.name?.[0] || 'U'}
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-lg">{post.author?.name}</h4>
                            <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                              {post.createdAt || 'เมื่อสักครู่'} • <span className="px-2 py-0.5 bg-slate-100 rounded-lg text-slate-500">ครูผู้สอน</span>
                            </p>
                          </div>
                        </div>
                        <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                          <MoreVertical size={20} />
                        </button>
                      </div>

                      <div className="pl-[4.5rem]">
                        <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-[0.95rem]">{post.content}</p>

                        {/* Post Actions */}
                        <div className="flex gap-4 mt-6 pt-4 border-t border-slate-50">
                          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-400 hover:bg-[#FFF0EE] hover:text-[#FF917B] transition-all font-bold text-sm">
                            <Heart size={18} className="group-hover:fill-current" /> ถูกใจ
                          </button>
                          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-400 hover:bg-[#EBF5FF] hover:text-[#BEE1FF] transition-all font-bold text-sm">
                            <MessageSquare size={18} /> แสดงความคิดเห็น
                          </button>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 bg-gradient-to-br from-slate-50 to-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-slate-50">
                        <MessageSquare size={32} className="text-slate-200" />
                      </div>
                      <h3 className="text-slate-800 font-bold text-lg mb-2">ยังไม่มีประกาศใหม่</h3>
                      <p className="text-slate-400 max-w-xs mx-auto leading-relaxed">
                        เมื่อครูมีการแจ้งเตือนหรือประกาศข่าวสาร <br />ข้อมูลจะปรากฏที่นี่เป็นที่แรก
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );

        case 'work': {
          // กรองงานเฉพาะของวิชานี้
          const courseAssignments = assignments.filter(a => a.course === selectedCourse.name);
          const pendingWork = courseAssignments.filter(a => a.status !== 'submitted');
          const submittedWork = courseAssignments.filter(a => a.status === 'submitted');

          // สร้างฟังก์ชันช่วยวาดการ์ดงาน (เพื่อประหยัดพื้นที่โค้ดและลดความผิดพลาด)
          const renderCard = (data) => {
            const isDone = data.status === 'submitted';
            return (
              <div key={data.id} className={`p-4 rounded-2xl border transition-all flex items-center justify-between group ${isDone ? 'bg-slate-50/50 border-slate-100 opacity-80' : 'bg-white border-slate-100 hover:shadow-md'
                }`}>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${isDone ? 'bg-green-50' : 'bg-yellow-50'}`}>
                    {isDone ? <CheckCircle className="text-green-600" size={20} /> : <FileText className="text-yellow-600" size={20} />}
                  </div>
                  <div>
                    <h4 className={`font-bold ${isDone ? 'text-slate-400' : 'text-slate-800'}`}>{data.title}</h4>

                    <p className={`text-xs ${isDone ? 'text-green-600 font-bold' : 'text-slate-400'}`}>
                      {isDone ? 'ส่งเรียบร้อยแล้ว' : (data.dueDate ? `กำหนดส่ง: ${data.dueDate}` : 'ยังไม่มีกำหนดส่ง')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedAssignment(data);
                    if (userRole === 'teacher') openGradingModal(data);
                    else setActiveModal('assignmentDetail'); // For student
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${isDone ? 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50' : 'bg-[#BEE1FF] text-slate-800 hover:bg-[#a5d5ff]'
                    }`}
                >
                  {userRole === 'teacher' ? 'ตรวจงาน' : (isDone ? 'ดูงานที่ส่ง' : 'ส่งงาน')}
                </button>
              </div>
            );
          };

          return (
            <div className="space-y-6 animate-in fade-in duration-300">

              {/* ส่วนควบคุม: หัวข้อ และ ปุ่มสลับ (Toggle) */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">ภารกิจในวิชา</h2>
                  <p className="text-xs text-slate-400">จัดการงานและการบ้านของคุณ</p>
                </div>

                {/* ปุ่ม Toggle สลับโหมดการดู */}

                {/* ปุ่มเพิ่มงานสำหรับครู (ย้ายมาไว้ข้างบน) */}
                {userRole === 'teacher' && (
                  <button
                    onClick={() => {
                      setNewAssignment(prev => ({ ...prev, course: selectedCourse.name }));
                      setActiveModal('createAssignment');
                    }}
                    className="px-4 py-2 bg-[#96C68E] text-white rounded-xl font-bold text-sm shadow-sm hover:bg-[#85b57d] hover:shadow transition-all flex items-center"
                  >
                    <Plus size={16} className="mr-2" /> มอบหมายงานใหม่
                  </button>
                )}
              </div>

              {/* ปุ่มเพิ่มงานสำหรับครู */}


              {/* การแสดงผลรายการงาน */}
              {workView === 'current' ? (
                <div className="space-y-6">
                  <section>
                    <h3 className="text-md font-bold text-slate-700 mb-3 flex items-center">
                      <Clock className="mr-2 text-yellow-500" size={18} /> งานที่ต้องทำ ({pendingWork.length})
                    </h3>
                    <div className="space-y-3">
                      {pendingWork.length > 0 ? pendingWork.map(renderCard) : (
                        <div className="p-8 bg-slate-50 rounded-2xl text-center text-slate-400 border border-slate-200">
                          ไม่มีงานค้าง ดีมาก! ✨
                        </div>
                      )}
                    </div>
                  </section>

                  {submittedWork.length > 0 && (
                    <section className="pt-4 border-t border-slate-100">
                      <h3 className="text-md font-bold text-slate-700 mb-3 flex items-center">
                        <CheckCircle className="mr-2 text-green-500" size={18} /> ส่งแล้ว ({submittedWork.length})
                      </h3>
                      <div className="space-y-3">
                        {submittedWork.map(renderCard)}
                      </div>
                    </section>
                  )}
                </div>
              ) : (
                /* แสดงงานทั้งหมดแบบรวมกัน */
                <div className="space-y-3 animate-in slide-in-from-bottom-2">
                  {courseAssignments.length > 0 ? (
                    courseAssignments.map(renderCard)
                  ) : (
                    <div className="p-20 text-center text-slate-400">ยังไม่มีข้อมูลงาน</div>
                  )}
                </div>
              )}
            </div>
          );
        }



        case 'people':
          return (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">

              {/* Pending Requests Section (For Teachers) */}
              {userRole === 'teacher' && pendingMembers.length > 0 && (
                <div className="mb-8 p-4 bg-yellow-50 rounded-2xl border border-yellow-100">
                  <h3 className="font-bold text-yellow-700 mb-4 text-lg border-b border-yellow-200 pb-2 flex items-center">
                    <AlertCircle className="mr-2" size={20} /> คำขอเข้าร่วม ({pendingMembers.length})
                  </h3>
                  <div className="space-y-3">
                    {pendingMembers.map(m => (
                      <div key={m.id} className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${m.avatar || 'bg-yellow-200'} flex items-center justify-center text-slate-700 font-bold text-sm`}>
                            {m.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-700">{m.name}</p>
                            <p className="text-xs text-slate-400">ขอเข้าร่วม</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(m.id)}
                            className="bg-[#96C68E] text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-[#85b57d] transition-colors"
                          >
                            อนุมัติ
                          </button>
                          <button
                            onClick={() => handleReject(m.id)}
                            className="bg-red-100 text-red-500 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-red-200 transition-colors"
                          >
                            ปฏิเสธ
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <h3 className="font-bold text-[#FF917B] mb-4 text-lg border-b border-slate-100 pb-2">ครูผู้สอน</h3>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-full bg-[#FF917B] flex items-center justify-center text-white font-bold">T</div>
                <span className="font-bold text-slate-700">{selectedCourse.teacher}</span>
              </div>

              <h3 className="font-bold text-[#96C68E] mb-4 text-lg border-b border-slate-100 pb-2">เพื่อนร่วมชั้น ({members.length} คน)</h3>
              <div className="space-y-3">
                {members.length > 0 ? members.map(m => (
                  <div key={m.id} className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full ${m.avatar || 'bg-blue-200'} flex items-center justify-center text-slate-700 text-xs`}>Std</div>
                    <span className="font-medium text-slate-700">{m.name}</span>
                  </div>
                )) : (
                  <p className="text-slate-400">ยังไม่มีนักเรียนในวิชานี้</p>
                )}
              </div>


              {
                userRole === 'student' && (
                  <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
                    <button
                      onClick={handleLeaveCourse}
                      className="text-red-500 text-sm font-bold flex items-center hover:bg-red-50 px-6 py-3 rounded-xl transition-colors"
                    >
                      <LogOut size={18} className="mr-2" /> ออกจากห้องเรียนนี้
                    </button>
                  </div>
                )
              }
            </div >
          );
        case 'grades':
          return (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-center py-20">
              <PieChart size={64} className="mx-auto text-slate-200 mb-4" />
              <h3 className="font-bold text-slate-600 text-lg">คะแนนยังไม่ประกาศ</h3>
              <p className="text-slate-400">คุณครูยังไม่ได้กรอกคะแนนสำหรับวิชานี้</p>
            </div>
          );
        case 'settings':
          return (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">ตั้งค่ารายวิชา</h3>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
                <h4 className="font-bold text-lg text-slate-700">ข้อมูลทั่วไป</h4>
                {editingCourse && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-600 mb-1">ชื่อวิชา</label>
                        <input
                          type="text"
                          value={editingCourse.name}
                          onChange={(e) => setEditingCourse({ ...editingCourse, name: e.target.value })}
                          className="w-full p-3 rounded-xl border border-slate-200 focus:border-[#96C68E] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-600 mb-1">รหัสวิชา</label>
                        <input
                          type="text"
                          value={editingCourse.code}
                          onChange={(e) => setEditingCourse({ ...editingCourse, code: e.target.value })}
                          className="w-full p-3 rounded-xl border border-slate-200 focus:border-[#96C68E] outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-600 mb-1">คำอธิบายรายวิชา</label>
                      <textarea
                        value={editingCourse.description || ''}
                        onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                        className="w-full p-3 rounded-xl border border-slate-200 focus:border-[#96C68E] outline-none h-24"
                        placeholder="ใส่รายละเอียดวิชา..."
                      />
                    </div>

                    {/* Schedule Editor */}
                    <div>
                      <label className="block text-sm font-bold text-slate-600 mb-1">จัดการตารางเรียน</label>
                      <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                        <div className="flex flex-wrap gap-2 items-center">
                          <select id="editDaySelect" className="p-2 rounded-lg border border-slate-200 text-sm">
                            <option value="1">จันทร์</option>
                            <option value="2">อังคาร</option>
                            <option value="3">พุธ</option>
                            <option value="4">พฤหัส</option>
                            <option value="5">ศุกร์</option>
                          </select>
                          <input id="editStartTime" type="time" className="p-2 rounded-lg border border-slate-200 text-sm" />
                          <span className="self-center">-</span>
                          <input id="editEndTime" type="time" className="p-2 rounded-lg border border-slate-200 text-sm" />
                          <input id="editRoom" type="text" placeholder="ห้อง" className="p-2 rounded-lg border border-slate-200 text-sm w-20" />
                          <button onClick={() => {
                            const dayMap = { '1': 'จันทร์', '2': 'อังคาร', '3': 'พุธ', '4': 'พฤหัส', '5': 'ศุกร์' };
                            const day = document.getElementById('editDaySelect').value;
                            const start = document.getElementById('editStartTime').value;
                            const end = document.getElementById('editEndTime').value;
                            const room = document.getElementById('editRoom').value;
                            if (start && end) {
                              setEditingCourse({
                                ...editingCourse,
                                scheduleItems: [...(editingCourse.scheduleItems || []), {
                                  dayOfWeek: parseInt(day),
                                  startTime: start,
                                  endTime: end,
                                  room: room,
                                  dayLabel: dayMap[day]
                                }]
                              });
                            }
                          }} className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"><Plus size={16} /></button>
                        </div>

                        <div className="space-y-2 mt-2">
                          {(editingCourse.scheduleItems || []).map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100 text-sm">
                              <span>{item.dayLabel || ['', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์'][item.dayOfWeek]} {item.startTime}-{item.endTime} ({item.room})</span>
                              <button onClick={() => {
                                const newItems = editingCourse.scheduleItems.filter((_, i) => i !== idx);
                                setEditingCourse({ ...editingCourse, scheduleItems: newItems });
                              }} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        onClick={handleUpdateCourse}
                        className="bg-[#96C68E] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#85b57d] shadow-sm flex items-center"
                      >
                        <Save className="mr-2" size={20} /> บันทึกการเปลี่ยนแปลง
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* DANGER ZONE (Moved inside the main container) */}
              {userRole === 'teacher' && (
                <div className="bg-red-50 p-6 rounded-2xl border border-red-100 space-y-4 mt-6">
                  <h4 className="font-bold text-lg text-red-600">โซนอันตราย</h4>
                  <p className="text-sm text-red-400">การลบรายวิชาจะไม่สามารถกู้คืนได้ กรุณาตรวจสอบให้แน่ใจก่อนดำเนินการ</p>
                  <button
                    onClick={() => handleDeleteCourse(selectedCourse)}
                    className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-600 flex items-center shadow-lg hover:shadow-xl transition-all"
                  >
                    <Trash className="mr-2" size={20} /> ลบรายวิชานี้
                  </button>
                </div>
              )}

              {userRole === 'student' && (
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <button
                    onClick={handleLeaveCourse}
                    className="text-red-500 text-sm font-bold flex items-center hover:bg-red-50 px-4 py-2 rounded-xl transition-colors"
                  >
                    <LogOut size={18} className="mr-2" /> ออกจากห้องเรียนนี้
                  </button>
                </div>
              )}
            </div>
          );
        default: // 'home' (Feed)
          return (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-slate-700 mb-2">เกี่ยวกับรายวิชา</h3>
                  <p className="text-sm text-slate-500 mb-4">{selectedCourse.description}</p>

                  <div className="pt-4 border-t border-slate-100">
                    <h3 className="font-bold text-slate-700 mb-2">รหัสเข้าห้องเรียน</h3>
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-mono text-[#96C68E] font-bold tracking-widest">
                        {selectedCourse.inviteCode || 'N/A'}
                      </div>

                      <button
                        onClick={() => navigator.clipboard.writeText(selectedCourse.inviteCode || '')}
                        className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-slate-500 bg-slate-50 hover:bg-[#96C68E] hover:text-white rounded-md transition-colors border border-slate-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>

                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-slate-700 mb-2">งานที่ใกล้ถึงกำหนด</h3>
                  <p className="text-sm text-slate-500">ไม่มีงานที่ต้องส่งเร็วๆ นี้</p>
                  <div className="flex justify-end mt-2">
                    <button className="text-xs text-[#FF917B] font-bold" onClick={() => setCourseTab('work')}>ดูทั้งหมด</button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3 space-y-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                    <User size={20} className="text-slate-500" />
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-xl px-4 py-3 text-slate-400 text-sm cursor-text hover:bg-slate-100 transition-colors">
                    ประกาศบางอย่างให้กับชั้นเรียน...
                  </div>
                  <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full">
                    <Upload size={20} />
                  </button>
                </div>

                {selectedCourse.feed && selectedCourse.feed.length > 0 ? (
                  selectedCourse.feed.map(post => (
                    <div key={post.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${selectedCourse.color} flex items-center justify-center`}>
                            <FileText size={20} className="opacity-50" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">ครู{selectedCourse.teacher}</h4>
                            <p className="text-xs text-slate-400">โพสต์เมื่อ {post.date}</p>
                          </div>
                        </div>
                        <button><MoreVertical size={20} className="text-slate-300" /></button>
                      </div>
                      <p className="text-slate-600 text-sm mb-4">
                        {post.text}
                      </p>
                      {post.file && (
                        <div className="flex gap-2">
                          <div className="border border-slate-200 rounded-xl p-3 flex items-center gap-3 w-1/2 hover:bg-slate-50 cursor-pointer">
                            <div className="bg-red-100 p-2 rounded-lg"><FileText size={20} className="text-red-500" /></div>
                            <div className="overflow-hidden">
                              <div className="text-sm font-bold text-slate-700 truncate">{post.file}</div>
                              <div className="text-xs text-slate-400">เอกสารประกอบ</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-slate-400">
                    ยังไม่มีประกาศในรายวิชานี้
                  </div>
                )}
              </div>
            </div>
          );

        case 'quizzes':
          return (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold text-slate-800 flex items-center">
                  <ClipboardList className="mr-2 text-[#96C68E]" /> แบบทดสอบ
                </h2>
                {userRole === 'teacher' && (
                  <button
                    onClick={() => setActiveModal('createExam')}
                    className="bg-[#96C68E] text-white px-4 py-2 rounded-xl font-bold shadow-sm flex items-center hover:bg-[#85b57d]"
                  >
                    <Plus size={18} className="mr-2" /> สร้างแบบทดสอบ
                  </button>
                )}
              </div>

              {userRole === 'teacher' ? (
                // --- TEACHER VIEW: Management Table ---
                <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                      <tr>
                        <th className="p-4 font-bold">ชื่อแบบทดสอบ</th>
                        <th className="p-4 font-bold">สถานะ</th>
                        <th className="p-4 font-bold">จำนวนข้อ</th>
                        <th className="p-4 font-bold">เวลา</th>
                        <th className="p-4 font-bold text-right">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {quizzes.length > 0 ? quizzes.map((quiz) => (
                        <tr key={quiz.firestoreId || quiz.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-bold text-slate-700">{quiz.title}</td>
                          <td className="p-4">
                            <span className="bg-[#F0FDF4] text-[#96C68E] px-2 py-1 rounded-lg text-xs font-bold border border-[#96C68E]/20">
                              เปิดใช้งาน
                            </span>
                          </td>
                          <td className="p-4 text-slate-600 font-medium">{quiz.questions} ข้อ</td>
                          <td className="p-4 text-slate-600 font-medium">{quiz.time}</td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDeleteQuiz(quiz.firestoreId)}
                              className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                              title="ลบแบบทดสอบ"
                            >
                              <Trash size={18} />
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="5" className="p-8 text-center text-slate-400">
                            ยังไม่มีแบบทดสอบในวิชานี้
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                // --- STUDENT VIEW: Card Grid ---
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {quizzes.length > 0 ? quizzes.map((quiz) => (
                    <div key={quiz.firestoreId || quiz.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-[#F0FDF4] rounded-2xl flex items-center justify-center text-[#96C68E] mb-2 group-hover:scale-110 transition-transform">
                          <ClipboardList size={24} />
                        </div>
                        {/* Mock Status for now */}
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg self-start">Available</span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-1">{quiz.title}</h3>

                      <div className="flex items-center gap-4 text-xs text-slate-500 mb-6 font-medium">
                        <span className="flex items-center"><HelpCircle size={14} className="mr-1" /> {quiz.questions} ข้อ</span>
                        <span className="flex items-center"><Clock size={14} className="mr-1" /> {quiz.time}</span>
                      </div>

                      <button
                        onClick={() => {
                          setActiveQuiz(quiz);
                          setActiveModal('takeQuiz');
                        }}
                        className="w-full py-3 rounded-xl font-bold text-white bg-[#96C68E] hover:bg-[#85b57d] shadow-sm hover:shadow transition-all transform active:scale-95"
                      >
                        เริ่มทำข้อสอบ
                      </button>
                    </div>
                  )) : (
                    <div className="col-span-full py-16 text-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <ClipboardList size={32} />
                      </div>
                      <h3 className="text-slate-500 font-bold">ยังไม่มีแบบทดสอบ</h3>
                      <p className="text-slate-400 text-sm mt-1">คุณครูยังไม่ได้สร้างแบบทดสอบในวิชานี้</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )

        case 'meeting':
          return (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center">
                  <Video className="mr-2 text-[#96C68E]" /> ห้องเรียนออนไลน์
                </h2>
              </div>

              {userRole === 'teacher' ? (
                meetingConfig.isActive ? (
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center animate-in fade-in">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                      <Video size={48} className="text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">กำลังมีการเรียนการสอน</h3>
                    <p className="text-slate-600 mb-6">หัวข้อ: <span className="font-bold text-[#96C68E]">{meetingConfig.topic}</span></p>

                    <div className="flex flex-col gap-3 max-w-xs mx-auto">
                      <button
                        onClick={() => setActiveModal('videoConference')}
                        className="w-full py-3 bg-[#96C68E] text-white rounded-xl font-bold hover:bg-[#85b57d] shadow-sm flex items-center justify-center"
                      >
                        <Video size={20} className="mr-2" /> กลับเข้าห้องเรียน
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('ต้องการจบการสอนหรือไม่? นักเรียนทุกคนจะถูกตัดออกจากห้องเรียน')) {
                            try {
                              setMeetingConfig({ ...meetingConfig, isActive: false });
                              await updateCourse(selectedCourse.firestoreId, { meeting: { isActive: false } });
                            } catch (e) { console.error(e); alert('เกิดข้อผิดพลาด'); }
                          }
                        }}
                        className="w-full py-3 bg-red-100 text-red-500 rounded-xl font-bold hover:bg-red-200 shadow-sm flex items-center justify-center"
                      >
                        <VideoOff size={20} className="mr-2" /> จบการสอน
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center">
                    <div className="w-24 h-24 bg-[#F0FDF4] rounded-full flex items-center justify-center mx-auto mb-6">
                      <Video size={48} className="text-[#96C68E]" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">เปิดห้องเรียนออนไลน์</h3>
                    <p className="text-slate-500 mb-6">สร้างห้องเรียนวิดีโอเพื่อสอนนักเรียนแบบ Real-time</p>

                    <div className="max-w-md mx-auto space-y-4">
                      <input
                        type="text"
                        placeholder="หัวข้อการเรียน (เช่น บทที่ 5: สมการเชิงเส้น)"
                        className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#96C68E]"
                        value={meetingConfig.topic}
                        onChange={(e) => setMeetingConfig({ ...meetingConfig, topic: e.target.value })}
                      />
                      <button
                        onClick={handleStartMeeting}
                        className="w-full py-4 bg-[#96C68E] text-white rounded-2xl font-bold text-lg hover:bg-[#85b57d] shadow-lg hover:shadow-green-200 transition-all transform hover:-translate-y-1"
                      >
                        เริ่มการสอนทันที 🚀
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center">
                  {meetingConfig.isActive ? (
                    <>
                      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                        <Video size={48} className="text-green-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-2">กำลังมีการเรียนการสอน!</h3>
                      <p className="text-slate-600 font-medium mb-1">หัวข้อ: <span className="text-[#96C68E]">{meetingConfig.topic}</span></p>
                      <p className="text-slate-400 mb-8">คุณครูกำลังรอคุณอยู่ เข้าห้องเรียนเพื่อเริ่มเรียนได้เลย</p>

                      <button
                        onClick={() => setActiveModal('videoConference')}
                        className="px-10 py-4 bg-[#96C68E] text-white rounded-2xl font-bold text-lg hover:bg-[#85b57d] shadow-lg hover:shadow-green-200 transition-all transform hover:-translate-y-1 animate-bounce"
                      >
                        เข้าห้องเรียน
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <VideoOff size={48} className="text-slate-300" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-400 mb-2">ยังไม่มีการเรียนการสอน</h3>
                      <p className="text-slate-400">เมื่อคุณครูเริ่มคลาสเรียน ปุ่มเข้าห้องเรียนจะปรากฏที่นี่</p>
                    </>
                  )}
                </div>
              )}
            </div>
          );

      }
    };

    return (
      <div className="space-y-6 animate-in zoom-in duration-300">
        <button
          onClick={() => setSelectedCourse(null)}
          className="text-slate-500 hover:text-slate-800 flex items-center text-sm font-bold mb-4"
        >
          <ChevronRight className="rotate-180 mr-1" /> กลับไปหน้ารวม
        </button>

        <div className={`${selectedCourse.color} rounded-3xl p-8 relative overflow-hidden text-slate-800`}>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">{selectedCourse.name}</h1>
            <p className="opacity-80 text-lg">{selectedCourse.code} • {selectedCourse.teacher}</p>
          </div>
          <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-20 scale-150">
            {selectedCourse.icon}
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex space-x-1 overflow-x-auto pb-2 custom-scrollbar">
          {['หน้าหลัก', 'งานในชั้นเรียน', 'แบบทดสอบ', 'สมาชิก', 'คะแนน', 'ห้องเรียนออนไลน์', ...(userRole === 'teacher' ? ['ตั้งค่า'] : [])].map((tab) => {
            const tabKey = tab === 'หน้าหลัก' ? 'home' : tab === 'งานในชั้นเรียน' ? 'work' : tab === 'แบบทดสอบ' ? 'quizzes' : tab === 'สมาชิก' ? 'people' : tab === 'คะแนน' ? 'grades' : tab === 'ห้องเรียนออนไลน์' ? 'meeting' : 'settings';
            return (
              <button
                key={tab}
                onClick={() => setCourseTab(tabKey)}
                className={`relative px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${courseTab === tabKey
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'bg-transparent text-slate-500 hover:bg-slate-100'
                  }`}
              >
                {tab}
                {/* Notification Badge for Members Tab */}
                {tab === 'สมาชิก' && userRole === 'teacher' && pendingMembers.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#F8FAFC]">
                    {pendingMembers.length}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Render Tab Content */}
        {renderSubTabContent()}
      </div>
    );
  };

  // IF NOT LOGGED IN, SHOW LOGIN PAGE
  // --- ส่วนตัดสินใจว่าจะแสดงหน้าไหนก่อนเข้าสู่ระบบ ---
  if (!isLoggedIn) {
    if (currentView === 'login') {
      return (
        <LoginPage
          onLogin={handleLogin}
          onNavigateToRegister={() => setCurrentView('register')}
        />
      );
    } else {
      return (
        <RegisterPage
          onRegister={(data) => {
            console.log("Registration successful", data);
            // Auth state change will handle navigation to dashboard
          }}
          onBackToLogin={() => setCurrentView('login')}
        />
      );
    }
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans">
      {renderModal()}

      {/* VIDEO CONFERENCE MODAL (Jitsi) */}
      {activeModal === 'videoConference' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-[95vw] h-[90vh] rounded-3xl overflow-hidden flex flex-col relative shadow-2xl">
            {/* Header */}
            <div className="bg-slate-800 text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-red-500 p-2 rounded-lg"><Video size={20} className="text-white" /></div>
                <div>
                  <h3 className="font-bold text-lg">{meetingConfig.topic || 'ห้องเรียนออนไลน์'}</h3>
                  <p className="text-xs text-slate-400">Schooly Scoot Conference</p>
                </div>
              </div>
              <button
                onClick={() => {
                  // Just close the modal, don't end the meeting logic
                  setActiveModal(null);
                }}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl transition-all font-bold text-sm"
              >
                ปิดหน้าต่าง
              </button>
            </div>

            {/* Jitsi Iframe */}
            <div className="flex-1 bg-black relative">
              <iframe
                src={`https://meet.jit.si/${meetingConfig.roomName}#config.startWithAudioMuted=true&config.startWithVideoMuted=true&userInfo.displayName="${profile.firstName} ${profile.lastName}"`}
                className="w-full h-full border-0"
                allow="camera; microphone; fullscreen; display-capture; autoplay"
              ></iframe>

              {/* Overlay Loading */}
              <div className="absolute inset-0 bg-slate-900 flex items-center justify-center -z-10">
                <span className="text-slate-500 flex items-center gap-2"><div className="w-4 h-4 bg-slate-500 rounded-full animate-bounce"></div> กำลังโหลดห้องเรียน...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30 w-64 bg-[#F0F4F8] p-4 flex flex-col transition-transform duration-300 border-r border-white
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
          <SidebarItem id="dashboard" label="แดชบอร์ด" icon={PieChart} activeTab={activeTab} onSelect={() => { setActiveTab('dashboard'); setSelectedCourse(null); setIsMobileMenuOpen(false); }} />
          <SidebarItem id="courses" label="ห้องเรียน" icon={BookOpen} activeTab={activeTab} onSelect={() => { setActiveTab('courses'); setSelectedCourse(null); setIsMobileMenuOpen(false); }} />
          <SidebarItem id="assignments" label={userRole === 'student' ? "การบ้าน" : "ตรวจงาน"} icon={CheckSquare} activeTab={activeTab} onSelect={() => { setActiveTab('assignments'); setSelectedCourse(null); setIsMobileMenuOpen(false); }} />
          <SidebarItem id="schedule" label="ตารางเรียน" icon={Calendar} activeTab={activeTab} onSelect={() => { setActiveTab('schedule'); setSelectedCourse(null); setIsMobileMenuOpen(false); }} />

          <p className="px-4 text-xs font-bold text-slate-400 uppercase mb-2 mt-6 tracking-wider">อื่นๆ</p>
          <SidebarItem id="messages" label="ข้อความ" icon={MessageSquare} activeTab={activeTab} onSelect={() => { setActiveTab('messages'); setSelectedCourse(null); setIsMobileMenuOpen(false); }} />

        </nav>

        <div className="mt-auto bg-white p-3 rounded-2xl shadow-sm">
          <div
            className="flex items-center cursor-pointer hover:bg-slate-50 transition-colors p-2 rounded-xl"
            onClick={() => {
              setEditProfileData({
                firstName: profile.firstName,
                lastName: profile.lastName,
                photoURL: profile.photoURL
              });
              setActiveModal('editProfile');
            }}
          >
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
              {profile.photoURL ? (
                <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="text-slate-400" />
              )}
            </div>
            <div className="ml-3 flex-1 overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">
                {profile.firstName} {profile.lastName}
              </p>
              <p className="text-xs text-slate-500 truncate capitalize">{profile.roleLabel}</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); handleLogout(); }} className="text-slate-400 hover:text-red-400"><LogOut size={18} /></button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="md:hidden bg-white p-4 flex items-center justify-between shadow-sm z-10">
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-600">
            <Menu />
          </button>
          <span className="font-bold text-slate-800">Schooly Scoot</span>
          <button
            onClick={() => setActiveModal('notificationsList')}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center relative"
          >
            <Bell size={16} className="text-slate-600" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto">

            <div className="hidden md:flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800">
                {activeTab === 'dashboard' ? 'ภาพรวม' :
                  activeTab === 'courses' ? 'ห้องเรียน' :
                    activeTab === 'assignments' ? (userRole === 'student' ? 'การบ้าน' : 'ตรวจงาน') :
                      activeTab === 'schedule' ? 'ตารางเรียน' :
                        activeTab === 'messages' ? 'ข้อความ' : 'ตั้งค่า'}
              </h2>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="ค้นหา..."
                    className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#BEE1FF] w-64 text-sm"
                  />
                </div>
                <button
                  onClick={() => setActiveModal('notificationsList')}
                  className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center relative hover:bg-slate-50">
                  <Bell size={20} className="text-slate-600" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-[#FF917B] rounded-full ring-2 ring-white"></span>
                </button>
              </div>
            </div>

            {selectedCourse ? renderCourseDetail() : (
              <>
                {activeTab === 'dashboard' && renderDashboard()}
                {activeTab === 'courses' && renderCourses()}
                {activeTab === 'assignments' && renderAssignments()}
                {activeTab === 'schedule' && renderSchedule()}
                {activeTab === 'messages' && renderMessages()}
                {activeTab === 'calendar' && <CalendarPage courses={courses} userRole={userRole} />}

              </>
            )}

            <div className="h-20"></div>
          </div>
        </div>

      </main>
    </div>
  );
}