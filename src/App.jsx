import React, { useState, useEffect, useRef } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getUserProfile, logoutUser } from './services/authService';
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
  HelpCircle,
  Trash,
  Award,
  Star,
  Zap,
  Trophy,
  GraduationCap
} from 'lucide-react';

import { MascotCircle, MascotSquare, MascotTriangle, MascotStar } from './components/Mascots';
import LoginPage from './components/LoginPage';
import StatCard from './components/StatCard';
import CourseCard from './components/CourseCard';
import SidebarItem from './components/SidebarItem';
import NotificationItem from './components/NotificationItem';
import RegisterPage from './components/RegisterPage';

// --- MOCK DATA (Updated with Dynamic Feed) ---

const COURSES = [

  {
    id: 1,
    name: 'คณิตศาสตร์พื้นฐาน',
    code: 'MATH101',
    teacher: 'ครูสมชาย',
    color: 'bg-[#96C68E]',
    icon: <MascotSquare className="w-12 h-12" />,
    description: 'เรียนรู้พื้นฐานคณิตศาสตร์ พีชคณิต เรขาคณิต และสถิติเบื้องต้น',
    feed: [
      { id: 101, text: 'ยินดีต้อนรับสู่เทอมการศึกษาใหม่ ขอให้นักเรียนทุกคนตั้งใจเรียนนะครับ', date: '8 ม.ค.', file: null },
      { id: 102, text: 'ไฟล์ประกอบการเรียนสัปดาห์ที่ 1 เรื่องจำนวนจริง', date: '9 ม.ค.', file: 'Math_Week1.pdf' },
      { id: 103, text: 'อย่าลืมทำการบ้านแบบฝึกหัดที่ 1.2 ส่งภายในวันศุกร์นี้นะครับ', date: 'เมื่อวาน', file: null }
    ]
  },
  {
    id: 2,
    name: 'วิทยาศาสตร์ทั่วไป',
    code: 'SCI102',
    teacher: 'ครูวิไล',
    color: 'bg-[#BEE1FF]',
    icon: <MascotCircle className="w-12 h-12" />,
    description: 'ศึกษาเกี่ยวกับสิ่งมีชีวิต ระบบนิเวศ และสารเคมีในชีวิตประจำวัน',
    feed: [
      { id: 201, text: 'แจ้งการสอบเก็บคะแนนย่อยครั้งที่ 1 ในสัปดาห์หน้า เตรียมตัวให้พร้อมนะคะ', date: 'เมื่อวาน', file: null },
      { id: 202, text: 'สรุปผลการทดลองเรื่องกรด-เบส นักเรียนสามารถโหลดไปอ่านทบทวนได้ค่ะ', date: 'วันนี้', file: 'Lab_Report_Template.docx' }
    ]
  },
  {
    id: 3,
    name: 'ภาษาไทยเพื่อการสื่อสาร',
    code: 'THAI201',
    teacher: 'ครูมานี',
    color: 'bg-[#FF917B]',
    icon: <MascotTriangle className="w-12 h-12" />,
    description: 'การใช้ภาษาไทยเพื่อการสื่อสาร การเขียน และการพูดในที่สาธารณะ',
    feed: [
      { id: 301, text: 'ให้นักเรียนจับคู่ฝึกแต่งกลอนสุภาพ ส่งในคาบเรียน', date: '2 วันที่แล้ว', file: null }
    ]
  },
  {
    id: 4,
    name: 'ศิลปะและการออกแบบ',
    code: 'ART303',
    teacher: 'ครูศิลป์',
    color: 'bg-[#FFE787]',
    icon: <MascotStar className="w-12 h-12" />,
    description: 'ฝึกวาดภาพระบายสี องค์ประกอบศิลป์ และประวัติศาสตร์ศิลปะ',
    feed: [
      { id: 401, text: 'อย่าลืมเตรียมสีน้ำและพู่กันมาในคาบหน้านะครับ', date: '10 ม.ค.', file: null },
      { id: 402, text: 'ตัวอย่างผลงานศิลปะ Impressionism สำหรับเป็นแรงบันดาลใจ', date: 'วันนี้', file: 'Art_Examples.jpg' }
    ]
  },
];

const ASSIGNMENTS = [
  { id: 1, title: 'แบบฝึกหัดบทที่ 1', course: 'คณิตศาสตร์พื้นฐาน', dueDate: 'พรุ่งนี้, 16:00', status: 'pending', },
  { id: 2, title: 'รายงานการทดลอง', course: 'วิทยาศาสตร์ทั่วไป', dueDate: '15 ม.ค. 67', status: 'submitted', },
  { id: 3, title: 'แต่งกลอนสุภาพ', course: 'ภาษาไทยเพื่อการสื่อสาร', dueDate: '20 ม.ค. 67', status: 'pending', },
];

const INITIAL_QUIZZES = [
  {
    id: 1,
    title: 'สอบย่อย ครั้งที่ 1',
    course: 'คณิตศาสตร์พื้นฐาน',
    questions: 3,
    time: '15 นาที',
    status: 'available',
    score: null,
    items: [
      { q: '1. ข้อใดคือค่าของ 2 + 2 x 2 ?', options: ['6', '8', '4', '10'], correct: 0 },
      { q: '2. มุมภายในของสามเหลี่ยมรวมกันได้กี่องศา?', options: ['90', '180', '360', '270'], correct: 1 },
      { q: '3. สูตรพื้นที่สี่เหลี่ยมจัตุรัสคือ?', options: ['กว้าง x ยาว', 'ด้าน x ด้าน', '1/2 x ฐาน x สูง', '2 x (กว้าง + ยาว)'], correct: 1 }
    ]
  },
  {
    id: 2,
    title: 'สอบกลางภาค',
    course: 'วิทยาศาสตร์ทั่วไป',
    questions: 20,
    time: '60 นาที',
    status: 'completed',
    score: '18/20',
    items: []
  }
];

const DEFAULT_NOTIFICATIONS = [
  { id: 1, type: 'homework', message: 'ใกล้ถึงกำหนดส่ง: แบบฝึกหัดบทที่ 1', time: '1 ชม. ที่แล้ว', read: false, detail: 'แบบฝึกหัดบทที่ 1 วิชาคณิตศาสตร์พื้นฐาน จะหมดเวลาส่งในอีก 1 ชั่วโมง กรุณารีบดำเนินการและตรวจสอบความถูกต้องก่อนส่ง' },
  { id: 2, type: 'grade', message: 'ประกาศคะแนนสอบกลางภาค วิชาศิลปะ', time: '3 ชม. ที่แล้ว', read: false, detail: 'คุณครูศิลป์ได้ทำการประกาศคะแนนสอบกลางภาคแล้ว นักเรียนสามารถเข้าไปดูคะแนนได้ที่เมนู "ห้องเรียน > ศิลปะและการออกแบบ > คะแนน"' },
  {
    id: 3,
    type: 'homework',
    message: 'มอบหมายงานใหม่: การทดลองแรงโน้มถ่วง',
    time: '5 ชม. ที่แล้ว',
    read: true,
    detail: 'วิชาวิทยาศาสตร์: ให้นักเรียนจัดทำวิดีโอการทดลองสั้นๆ เรื่องแรงโน้มถ่วง พร้อมเขียนรายงานสรุปผลการทดลอง 1 หน้ากระดาษ A4'
  },
  {
    id: 4,
    type: 'user',
    message: 'คุณครูสมศรี เพิ่มคุณเข้ากลุ่ม "โครงงานวิทย์"',
    time: '1 วันที่แล้ว',
    read: false,
    detail: 'คุณถูกเชิญเข้ากลุ่มสำหรับการทำโครงงานวิทยาศาสตร์ประจำภาคเรียนที่ 2/2568 คุณสามารถเริ่มสนทนากับเพื่อนในกลุ่มได้ทันที'
  },
  {
    id: 5,
    type: 'grade',
    message: 'แก้ไขคะแนน: ใบงานที่ 4 วิชาภาษาไทย',
    time: '2 วันที่แล้ว',
    read: true,
    detail: 'มีการอัปเดตคะแนนใหม่เนื่องจากมีการตรวจทานซ้ำ คะแนนของคุณเปลี่ยนจาก 8 เป็น 10 คะแนน'
  },
  {
    id: 6,
    type: 'homework',
    message: 'แจ้งเตือน: งานค้างส่งวิชาประวัติศาสตร์',
    time: '2 วันที่แล้ว',
    read: false,
    detail: 'คุณยังมีงานค้าง "สรุปเหตุการณ์กรุงศรีอยุธยา" ที่เกินกำหนดส่งมาแล้ว 2 วัน กรุณาส่งงานเพื่อไม่ให้ถูกหักคะแนนความรับผิดชอบ'
  },
  {
    id: 7,
    type: 'user',
    message: 'เพื่อนร่วมชั้น 3 คน แสดงความคิดเห็นในโพสต์ของคุณ',
    time: '3 วันที่แล้ว',
    read: true,
    detail: 'เพื่อนๆ ได้เข้ามาแสดงความคิดเห็นในหัวข้อ "ไอเดียจัดงานวันเด็ก" ในกระดานข่าวสารห้องเรียน'
  },
  {
    id: 8,
    type: 'grade',
    message: 'สรุปผลการเรียนประจำเดือน ธันวาคม',
    time: '4 วันที่แล้ว',
    read: false,
    detail: 'ระบบสรุปภาพรวมคะแนนเก็บประจำเดือนธันวาคมของคุณออกมาแล้ว คุณมีคะแนนเฉลี่ยอยู่ในระดับ "ดีเยี่ยม"'
  },
  {
    id: 9,
    type: 'homework',
    message: 'เตรียมตัวสอบย่อย: คำศัพท์ภาษาอังกฤษ Unit 5',
    time: '5 วันที่แล้ว',
    read: true,
    detail: 'วิชาภาษาอังกฤษจะมีการทดสอบย่อย (Quiz) ในวันจันทร์หน้า อย่าลืมทบทวนคำศัพท์เกี่ยวกับ Environment จำนวน 20 คำ'
  },
  {
    id: 10,
    type: 'user',
    message: 'อัปเดตรูปโปรไฟล์ใหม่โดยคุณครูที่ปรึกษา',
    time: '1 สัปดาห์ที่แล้ว',
    read: true,
    detail: 'คุณครูประจำชั้นได้อัปเดตรูปภาพกิจกรรมในหน้าข้อมูลส่วนตัวของชั้นเรียน คุณสามารถเข้าไปดูภาพกิจกรรมทัศนศึกษาได้แล้ว'
  },
  {
    id: 11,
    type: 'grade',
    message: 'ประกาศผลการคัดเลือกตัวแทนแข่งขันคณิตศาสตร์',
    time: '1 สัปดาห์ที่แล้ว',
    read: false,
    detail: 'ยินดีด้วย! คุณผ่านการคัดเลือกรอบแรกในการเป็นตัวแทนโรงเรียนไปแข่งขันคณิตศาสตร์โอลิมปิกระดับจังหวัด'
  },
  {
    id: 12,
    type: 'user',
    message: 'แจ้งเตือน: การเข้าใช้งานระบบจากอุปกรณ์ใหม่',
    time: '2 สัปดาห์ที่แล้ว',
    read: true,
    detail: 'มีการเข้าสู่ระบบบัญชีการศึกษาของคุณผ่าน iPad เมื่อเวลา 14:20 น. หากไม่ใช่คุณ กรุณาเปลี่ยนรหัสผ่านทันที'
  },
  {
    id: 13,
    type: 'user',
    message: 'แจ้งเตือน: ',
    time: '2 สัปดาห์ที่แล้ว',
    read: true,
    detail: 'มีการเข้าสู่ระบบบัญชีการศึกษาของคุณผ่าน iPad เมื่อเวลา 14:20 น. หากไม่ใช่คุณ กรุณาเปลี่ยนรหัสผ่านทันที'
  }

];

const INITIAL_CHATS = [
  {
    id: 1,
    name: 'ครูสมชาย',
    role: 'Teacher',
    avatar: 'bg-[#FF917B]',
    lastMessage: 'อย่าลืมส่งงานนะครับ',
    time: '10:30',
    unread: 1,
    messages: [
      { id: 1, sender: 'other', text: 'สวัสดีครับนักเรียน วันนี้อย่าลืมส่งงานนะครับ', time: '10:30' }
    ]
  },
  {
    id: 2,
    name: 'สมหญิง (หัวหน้าห้อง)',
    role: 'Student',
    avatar: 'bg-pink-200',
    lastMessage: 'พรุ่งนี้มีสอบย่อยนะ',
    time: '09:15',
    unread: 0,
    messages: [
      { id: 1, sender: 'me', text: 'พรุ่งนี้วิชาอะไรสอบบ้างนะ?', time: '09:10' },
      { id: 2, sender: 'other', text: 'พรุ่งนี้มีสอบย่อยนะ วิชาคณิตคาบแรกเลย', time: '09:15' }
    ]
  },
];

const MEMBERS = [
  { id: 1, name: 'ด.ช. รักเรียน ขยันยิ่ง', role: 'student', avatar: 'bg-blue-200' },
  { id: 2, name: 'ด.ญ. มานี มีตา', role: 'student', avatar: 'bg-pink-200' },
];

const GRADING_LIST = [
  { id: 1, name: 'ด.ช. รักเรียน ขยันยิ่ง', status: 'submitted', file: 'homework1.pdf', score: '' },
  { id: 2, name: 'ด.ญ. มานี มีตา', status: 'submitted', file: 'homework1_manee.pdf', score: '9' },
];

const BADGES = [
  { id: 1, name: 'ส่งงานตรงเวลา', icon: <CheckCircle className="text-white" />, color: 'bg-green-400', date: '5 ม.ค. 67' },
  { id: 2, name: 'ยอดนักอ่าน', icon: <BookOpen className="text-white" />, color: 'bg-blue-400', date: '8 ม.ค. 67' },
  { id: 3, name: 'คะแนนเต็ม', icon: <Star className="text-white" />, color: 'bg-yellow-400', date: '10 ม.ค. 67' },
  { id: 4, name: 'แอคทีฟสุดๆ', icon: <Zap className="text-white" />, color: 'bg-red-400', date: 'เมื่อวาน' },
];

// --- SEPARATE COMPONENTS ---

// import LoginPage from './components/LoginPage';



// --- MAIN COMPONENT ---

export default function SchoolyScootLMS() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('student');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [workView, setWorkView] = useState('current');
  const [currentView, setCurrentView] = useState('login'); // 'current' หรือ 'all'
  const [authLoading, setAuthLoading] = useState(true);


  // Profile State
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    roleLabel: '',
    level: 1,
    xp: 0
  });

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
              xp: userProfile.xp || 0
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
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);

  // Course & Quiz State
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseTab, setCourseTab] = useState('home');


  // --- UPDATED QUIZ STATE & LOGIC ---
  const [quizzes, setQuizzes] = useState(INITIAL_QUIZZES);
  const [activeQuiz, setActiveQuiz] = useState(null); // Which quiz is currently being taken
  const [quizAnswers, setQuizAnswers] = useState({}); // Stores answers { questionIndex: optionIndex }
  const [quizResult, setQuizResult] = useState(null); // Stores final score

  //  Assignment State (สำคัญมาก)
  const [assignments, setAssignments] = useState(ASSIGNMENTS);
  const [assignmentFilter, setAssignmentFilter] = useState('pending');
  // ฟอร์มสร้างงาน
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    course: '',
    dueDate: '',
    description: '',
    files: [],
  });

  // Create Exam State
  const [newExam, setNewExam] = useState({
    title: '',
    course: COURSES[0].name,
    time: '30 นาที',
    items: [{ q: '', options: ['', '', '', ''], correct: 0 }]
  });

  // Modal State
  const [activeModal, setActiveModal] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [uploadFile, setUploadFile] = useState([]);

  // Notifications state
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    if (selectedNotification && selectedNotification.id === id) {
      setSelectedNotification(prev => prev ? { ...prev, read: true } : prev);
    }
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chats, activeChatId]);

  const toggleRole = () => {
    const newRole = userRole === 'student' ? 'teacher' : 'student';
    setUserRole(newRole);
    setProfile({
      firstName: newRole === 'student' ? 'รักเรียน' : 'สมชาย',
      lastName: newRole === 'student' ? 'ขยันยิ่ง' : 'ใจดี',
      email: newRole === 'student' ? 'student@schoolyscoot.ac.th' : 'teacher@schoolyscoot.ac.th',
      roleLabel: newRole === 'student' ? 'นักเรียน' : 'ครูผู้สอน',
      level: newRole === 'student' ? 5 : 99,
      xp: newRole === 'student' ? 75 : 100
    });
    setActiveTab('dashboard');
    setSelectedCourse(null);
    setCourseTab('home');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeChatId) return;
    const newMessage = { id: Date.now(), sender: 'me', text: chatInput, time: 'ตอนนี้' };
    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === activeChatId) {
        return { ...chat, messages: [...chat.messages, newMessage], lastMessage: chatInput, time: 'ตอนนี้' };
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
    const updatedItems = [...newExam.items];
    updatedItems[idx] = { ...updatedItems[idx], [field]: value };
    setNewExam(prev => ({ ...prev, items: updatedItems }));
  };

  const handleUpdateOption = (qIdx, optIdx, value) => {
    const updatedItems = [...newExam.items];
    const updatedOptions = [...updatedItems[qIdx].options];
    updatedOptions[optIdx] = value;
    updatedItems[qIdx].options = updatedOptions;
    setNewExam(prev => ({ ...prev, items: updatedItems }));
  };

  const handleSaveExam = () => {
    if (!newExam.title || newExam.items.some(i => !i.q)) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    const examToAdd = {
      id: Date.now(),
      title: newExam.title,
      course: newExam.course,
      questions: newExam.items.length,
      time: newExam.time,
      status: 'available',
      score: null,
      items: newExam.items
    };
    setQuizzes([...quizzes, examToAdd]);
    setActiveModal(null);
    // Reset form
    setNewExam({
      title: '',
      course: COURSES[0].name,
      time: '30 นาที',
      items: [{ q: '', options: ['', '', '', ''], correct: 0 }]
    });
  };

  // ฟังก์ชันยืนยันการส่งงานและบันทึกไฟล์ลงใน State หลัก
  const handleConfirmSubmit = (assignmentId) => {
    setAssignments(prev => prev.map(assign => {
      if (assign.id === assignmentId) {
        return {
          ...assign,
          status: 'submitted',
          submittedFiles: uploadFile // เก็บไฟล์ที่เลือกไว้ลงในตัวแปรใหม่
        };
      }
      return assign;
    }));

    // เคลียร์ค่าและปิด Modal
    setUploadFile([]);
    setActiveModal(null);
    setSelectedAssignment(null);
  };


  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#96C68E]"></div>
    </div>;
  }

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
        <div className={`bg-white rounded-3xl shadow-2xl w-full ${['grading', 'takeQuiz', 'createExam'].includes(activeModal) ? 'max-w-4xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto relative`}>
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
                      {COURSES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
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
                      className={`px-8 py-3 rounded-xl font-bold text-lg transition-all ${Object.keys(quizAnswers).length < activeQuiz.items.length
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-[#96C68E] text-white hover:bg-[#85b57d] shadow-md hover:translate-y-[-2px]'
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
            <div className="flex flex-col h-[500px]">
              <div className="flex-1 bg-slate-900 relative flex items-center justify-center rounded-t-3xl">
                <div className="text-white text-center">
                  <div className="w-24 h-24 rounded-full bg-slate-700 mx-auto mb-4 flex items-center justify-center text-4xl">👨‍🏫</div>
                  <h3 className="text-xl font-bold">ห้องเรียน: คณิตศาสตร์</h3>
                  <p className="text-slate-400">กำลังรอให้ครูอนุญาตให้เข้าห้อง...</p>
                </div>
                <div className="absolute bottom-6 flex space-x-4">
                  <button className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 shadow-lg" onClick={closeModal}><PhoneOff size={24} /></button>
                  <button className="p-4 rounded-full bg-slate-700 text-white hover:bg-slate-600"><MicOff size={24} /></button>
                  <button className="p-4 rounded-full bg-slate-700 text-white hover:bg-slate-600"><VideoOff size={24} /></button>
                </div>
              </div>
            </div>
          )}

          {/* CREATE CLASS MODAL */}
          {activeModal === 'create' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">สร้างห้องเรียนใหม่</h2>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); closeModal(); }}>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">ชื่อวิชา</label>
                  <input type="text" className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50" placeholder="เช่น วิทยาศาสตร์ ม.1" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">รหัสวิชา</label>
                  <input type="text" className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50" placeholder="SCI-101" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">เลือกสีธีม</label>
                  <div className="flex space-x-2">
                    {['bg-[#96C68E]', 'bg-[#FF917B]', 'bg-[#BEE1FF]', 'bg-[#FFE787]'].map(c => (
                      <div key={c} className={`w-8 h-8 rounded-full ${c} cursor-pointer ring-2 ring-offset-2 ring-transparent hover:ring-slate-300`}></div>
                    ))}
                  </div>
                </div>
                <button type="submit" className="w-full py-3 bg-[#96C68E] text-white rounded-xl font-bold text-lg mt-4 hover:bg-[#85b57d]">สร้างห้องเรียน</button>
              </form>
            </div>
          )}

          {/* JOIN CLASS MODAL */}
          {activeModal === 'join' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">เข้าร่วมห้องเรียน</h2>
              <p className="text-slate-500 mb-4">กรอกรหัสห้องเรียนที่ได้รับจากครูผู้สอน</p>
              <form onSubmit={(e) => { e.preventDefault(); closeModal(); }}>
                <input type="text" className="w-full p-4 rounded-xl border-2 border-[#BEE1FF] bg-slate-50 text-center text-2xl font-mono tracking-widest mb-6" placeholder="X7K-9P2" />
                <button type="submit" className="w-full py-3 bg-[#BEE1FF] text-slate-800 rounded-xl font-bold text-lg hover:bg-[#aed8ff]">เข้าร่วม</button>
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
                    onClick={() => { setSelectedNotification(notif); markNotificationRead(notif.id); setActiveModal('notificationDetail'); }}
                  />

                ))}
                {/* notif.read = true; */}
              </div>
              {/* <button onClick={closeModal} className="w-full py-3 mt-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200">
                 ปิด
               </button> */}
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
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        file: e.target.files[0],
                      })
                    }
                    className="block w-full text-sm text-slate-500
               file:mr-4 file:py-2 file:px-4
               file:rounded-xl file:border-0
               file:text-sm file:font-bold
               file:bg-[#F0FDF4] file:text-[#96C68E]
               hover:file:bg-[#E6F7EC]"
                  />

                  {newAssignment.file && (
                    <div className="mt-3 flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-3">
                      <FileText className="text-[#96C68E]" />
                      <div>
                        <p className="text-sm font-bold text-slate-700">
                          {newAssignment.file.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          ไฟล์ที่แนบ
                        </p>
                      </div>
                    </div>
                  )}
                </div>


                <button
                  onClick={() => {
                    if (!newAssignment.title) {
                      alert('กรุณากรอกชื่องาน');
                      return;
                    }

                    setAssignments(prev => [
                      ...prev,
                      {
                        id: Date.now(),
                        title: newAssignment.title,
                        course: newAssignment.course,
                        dueDate: newAssignment.dueDate,
                        description: newAssignment.description,
                        file: newAssignment.file, // ✅ เพิ่มตรงนี้
                        status: 'pending',
                        score: null,
                      },
                    ]);

                    setNewAssignment({
                      title: '',
                      course: '',
                      dueDate: '',
                      description: '',
                      file: null,
                    });


                    setActiveModal(null);
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

              <div className="flex-1 overflow-y-auto pr-2">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-slate-400 text-sm border-b border-slate-200">
                      <th className="py-3 font-bold">ชื่อ - นามสกุล</th>
                      <th className="py-3 font-bold">สถานะ</th>
                      <th className="py-3 font-bold">ไฟล์แนบ</th>
                      <th className="py-3 font-bold w-24">คะแนน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {GRADING_LIST.map(student => (
                      <tr key={student.id} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="py-4 flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-500">Std</div>
                          <span className="font-bold text-slate-700">{student.name}</span>
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-lg text-xs font-bold ${student.status === 'submitted' ? 'bg-green-100 text-green-600' :
                            student.status === 'late' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                            }`}>
                            {student.status === 'submitted' ? 'ส่งแล้ว' : student.status === 'late' ? 'ส่งช้า' : 'ยังไม่ส่ง'}
                          </span>
                        </td>
                        <td className="py-4">
                          {student.file ? (
                            <button className="text-[#BEE1FF] font-bold text-sm hover:underline flex items-center">
                              <FileText size={16} className="mr-1" /> {student.file}
                            </button>
                          ) : (
                            <span className="text-slate-300 text-sm">-</span>
                          )}
                        </td>
                        <td className="py-4">
                          <input
                            type="text"
                            placeholder="-"
                            defaultValue={student.score}
                            className="w-16 p-2 border border-slate-200 rounded-lg text-center font-bold focus:border-[#96C68E] outline-none"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button onClick={closeModal} className="px-6 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50">ยกเลิก</button>
                <button onClick={closeModal} className="px-6 py-3 rounded-xl bg-[#96C68E] text-white font-bold hover:bg-[#85b57d] shadow-sm">บันทึกและคืนคะแนน</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- PAGE CONTENT RENDERERS ---

  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <div className="bg-[#BEE1FF] rounded-3xl p-6 md:p-10 relative overflow-hidden group">
        <div className="relative z-10 max-w-[70%]">
          <h1 className="text-2xl md:text-4xl font-bold text-slate-800 mb-2">
            สวัสดี, {userRole === 'student' ? 'น้องนักเรียน!' : 'คุณครูคนเก่ง!'} 👋
          </h1>
          <p className="text-slate-600">
            {userRole === 'student'
              ? 'วันนี้พร้อมเรียนรู้เรื่องใหม่ๆ หรือยัง? อย่าลืมทำการบ้านนะ!'
              : 'วันนี้มีคาบสอน 3 วิชา และมีการบ้านรอตรวจ 12 งานครับ'}
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

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          title={userRole === 'student' ? "วิชาเรียน" : "ห้องเรียน"}
          value="8"
          color="bg-[#FFE787]"
          icon={<BookOpen size={64} />}
          onClick={() => setActiveTab('courses')}
        />
        <StatCard
          title={userRole === 'student' ? "การบ้านที่ต้องส่ง" : "งานรอตรวจ"}
          value="3"
          color="bg-[#FF917B]"
          icon={<FileText size={64} />}
          onClick={() => setActiveTab('assignments')}
        />
        <StatCard
          title={userRole === 'student' ? "แบบทดสอบ" : "สร้างข้อสอบ"}
          value="2"
          color="bg-[#96C68E]"
          icon={<ClipboardList size={64} />}
          onClick={() => setActiveTab('exams')}
        />
        {/* <StatCard 
          title="การแจ้งเตือน" 
          value="5" 
          color="bg-[#BEE1FF]" 
          icon={<Bell size={64} />} 
          onClick={() => setActiveModal('notificationsList')}
        /> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center">
              <Calendar className="mr-2 text-[#96C68E]" /> ตารางเรียนวันนี้
            </h2>
            <span className="text-sm text-slate-400">8 ม.ค. 2567</span>
          </div>
          <div className="space-y-4">
            {[
              { time: '08:30 - 10:20', subject: 'คณิตศาสตร์พื้นฐาน', room: 'ห้อง 401', active: true },
              { time: '10:30 - 12:00', subject: 'ภาษาไทย', room: 'ห้อง 202', active: false },
              { time: '13:00 - 15:00', subject: 'วิทยาศาสตร์', room: 'LAB 3', active: false },
            ].map((slot, idx) => (
              <div key={idx} className={`flex items-center p-4 rounded-2xl ${slot.active ? 'bg-[#F0FDF4] border border-[#96C68E]' : 'bg-slate-50'}`}>
                <div className="w-24 font-bold text-slate-600">{slot.time}</div>
                <div className="flex-1 px-4 border-l border-slate-200 ml-4">
                  <div className="font-bold text-slate-800">{slot.subject}</div>
                  <div className="text-sm text-slate-500">{slot.room}</div>
                </div>
                {slot.active && (
                  <button onClick={() => setActiveModal('video')} className="bg-[#96C68E] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center hover:bg-[#85b57d]">
                    <Video size={16} className="mr-1" /> เข้าเรียน
                  </button>
                )}
              </div>
            ))}
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
    </div>
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
        {COURSES.map(course => (
          <CourseCard key={course.id} course={course} onClick={() => { setSelectedCourse(course); setCourseTab('home'); }} />
        ))}
      </div>
    </div>
  );



  const renderAssignments = () => {
    // กรองข้อมูลตาม Filter และบทบาท
    const filteredAssignments = assignments.filter(assign => {
      if (assignmentFilter === 'all') return true; // ถ้าเป็น all ให้คืนค่าทั้งหมด
      if (assignmentFilter === 'pending') {
        return assign.status === 'pending' || assign.status === 'late';
      } else {
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
            {/* เพิ่มปุ่ม "ทั้งหมด" ตรงนี้ */}
            <button
              onClick={() => setAssignmentFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${assignmentFilter === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              ทั้งหมด ({assignments.length})
            </button>
            <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
              <button
                onClick={() => setAssignmentFilter('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${assignmentFilter === 'pending' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                ยังไม่ส่ง ({assignments.filter(a => a.status !== 'submitted').length})
              </button>
              <button
                onClick={() => setAssignmentFilter('submitted')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${assignmentFilter === 'submitted' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                ส่งแล้ว ({assignments.filter(a => a.status === 'submitted').length})
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

  const renderExams = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center"><ClipboardList className="mr-3 text-[#96C68E]" /> แบบทดสอบ</h1>
        {userRole === 'teacher' && (
          <button
            onClick={() => setActiveModal('createExam')}
            className="bg-[#96C68E] text-white px-4 py-2 rounded-xl font-bold shadow-sm flex items-center hover:bg-[#85b57d]"
          >
            <Plus size={20} className="mr-2" /> สร้างแบบทดสอบ
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-bold text-[#BEE1FF] bg-[#F0F9FF] px-2 py-1 rounded-lg mb-2 inline-block">{quiz.course}</span>
                <h3 className="text-xl font-bold text-slate-800">{quiz.title}</h3>
              </div>
              {quiz.status === 'completed'
                ? <div className="bg-green-100 text-green-600 p-2 rounded-full"><CheckCircle size={24} /></div>
                : <div className="bg-yellow-100 text-yellow-600 p-2 rounded-full"><Clock size={24} /></div>
              }
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
              <span className="flex items-center"><HelpCircle size={16} className="mr-1" /> {quiz.questions} ข้อ</span>
              <span className="flex items-center"><Clock size={16} className="mr-1" /> {quiz.time}</span>
            </div>

            {quiz.status === 'completed' ? (
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl">
                <span className="font-bold text-slate-600">คะแนนที่ได้</span>
                <span className="font-bold text-xl text-[#96C68E]">{quiz.score}</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (quiz.items && quiz.items.length > 0) {
                    setActiveQuiz(quiz);
                    setActiveModal('takeQuiz');
                  }
                }}
                disabled={!quiz.items || quiz.items.length === 0}
                className={`w-full py-3 rounded-xl font-bold text-white transition-all ${quiz.items && quiz.items.length > 0
                  ? 'bg-[#96C68E] hover:bg-[#85b57d]'
                  : 'bg-slate-300 cursor-not-allowed'
                  }`}
              >
                {quiz.items && quiz.items.length > 0 ? 'เริ่มทำข้อสอบ' : 'ยังไม่เปิดให้ทำ'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderSchedule = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold text-slate-800 flex items-center"><Calendar className="mr-3 text-[#96C68E]" /> ตารางเรียน/สอน</h1>
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-700">มกราคม 2567</h2>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-slate-100 rounded-lg"><ChevronRight className="rotate-180" size={20} /></button>
            <button className="p-2 hover:bg-slate-100 rounded-lg"><ChevronRight size={20} /></button>
          </div>
        </div>
        {/* Simple Mock Weekly View */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {['จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์'].map((day, i) => (
            <div key={day} className="space-y-3">
              <div className="text-center font-bold text-slate-500 mb-2">{day}</div>
              {[1, 2, 3].map((slot) => (
                <div key={slot} className={`p-3 rounded-xl text-sm ${(i + slot) % 3 === 0 ? 'bg-[#F0FDF4] border border-[#96C68E]' :
                  (i + slot) % 4 === 0 ? 'bg-[#FFF7ED] border border-[#FF917B]' : 'bg-slate-50 border border-slate-100'
                  }`}>
                  <div className="font-bold text-slate-800">09:00 - 10:30</div>
                  <div className="text-slate-600">{(i + slot) % 3 === 0 ? 'คณิตศาสตร์' : (i + slot) % 4 === 0 ? 'ภาษาไทย' : 'ว่าง'}</div>
                  {(i + slot) % 3 === 0 && <div className="mt-2 text-xs text-[#96C68E] font-bold">● กำลังสอน</div>}
                </div>
              ))}
            </div>
          ))}
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
                    <h4 className={`font-bold ${isDone ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{data.title}</h4>
                    <p className={`text-xs ${isDone ? 'text-green-600 font-bold' : 'text-slate-400'}`}>
                      {isDone ? 'ส่งเรียบร้อยแล้ว' : `กำหนดส่ง: ${data.dueDate}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedAssignment(data);
                    setActiveModal(userRole === 'teacher' ? 'grading' : 'assignmentDetail');
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
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setWorkView('current')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${workView === 'current' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                      }`}
                  >
                    งานปัจจุบัน
                  </button>
                  <button
                    onClick={() => setWorkView('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${workView === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                      }`}
                  >
                    งานทั้งหมด ({courseAssignments.length})
                  </button>
                </div>
              </div>

              {/* ปุ่มเพิ่มงานสำหรับครู */}
              {userRole === 'teacher' && (
                <button
                  onClick={() => {
                    setNewAssignment(prev => ({ ...prev, course: selectedCourse.name }));
                    setActiveModal('createAssignment');
                  }}
                  className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 font-bold hover:border-[#96C68E] hover:text-[#96C68E] transition-all bg-white/50"
                >
                  + มอบหมายงานใหม่
                </button>
              )}

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
              <h3 className="font-bold text-[#FF917B] mb-4 text-lg border-b border-slate-100 pb-2">ครูผู้สอน</h3>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-full bg-[#FF917B] flex items-center justify-center text-white font-bold">T</div>
                <span className="font-bold text-slate-700">{selectedCourse.teacher}</span>
              </div>

              <h3 className="font-bold text-[#96C68E] mb-4 text-lg border-b border-slate-100 pb-2">เพื่อนร่วมชั้น ({MEMBERS.length} คน)</h3>
              <div className="space-y-3">
                {MEMBERS.map(m => (
                  <div key={m.id} className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full ${m.avatar} flex items-center justify-center text-slate-700 text-xs`}>Std</div>
                    <span className="font-medium text-slate-700">{m.name}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        case 'grades':
          return (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-center py-20">
              <PieChart size={64} className="mx-auto text-slate-200 mb-4" />
              <h3 className="font-bold text-slate-600 text-lg">คะแนนยังไม่ประกาศ</h3>
              <p className="text-slate-400">คุณครูยังไม่ได้กรอกคะแนนสำหรับวิชานี้</p>
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
                        X7K-9P2
                      </div>

                      <button
                        onClick={() => navigator.clipboard.writeText('X7K-9P2')}
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
        <div className="border-b border-slate-200 flex space-x-6 overflow-x-auto">
          {[
            { id: 'home', label: 'หน้าหลัก' },
            { id: 'work', label: 'งานในชั้นเรียน' },
            { id: 'people', label: 'สมาชิก' },
            { id: 'grades', label: 'คะแนน' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCourseTab(tab.id)}
              className={`pb-3 font-bold text-sm whitespace-nowrap transition-colors ${courseTab === tab.id
                ? 'text-[#FF917B] border-b-2 border-[#FF917B]'
                : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              {tab.label}
            </button>
          ))}
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

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30 w-64 bg-[#F0F4F8] p-4 flex flex-col transition-transform duration-300 border-r border-white
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex items-center px-4 py-6 mb-6">
          <div className="w-10 h-10 bg-[#FF917B] rounded-xl flex items-center justify-center mr-3 shadow-sm">
            <MascotStar className="w-8 h-8" />
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">Schooly Scoot</span>
        </div>

        <nav className="flex-1 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">เมนูหลัก</p>
          <SidebarItem id="dashboard" label="แดชบอร์ด" icon={PieChart} activeTab={activeTab} onSelect={() => { setActiveTab('dashboard'); setSelectedCourse(null); setIsMobileMenuOpen(false); }} />
          <SidebarItem id="courses" label="ห้องเรียน" icon={BookOpen} activeTab={activeTab} onSelect={() => { setActiveTab('courses'); setSelectedCourse(null); setIsMobileMenuOpen(false); }} />
          <SidebarItem id="assignments" label={userRole === 'student' ? "การบ้าน" : "ตรวจงาน"} icon={CheckSquare} activeTab={activeTab} onSelect={() => { setActiveTab('assignments'); setSelectedCourse(null); setIsMobileMenuOpen(false); }} />
          <SidebarItem id="exams" label="แบบทดสอบ" icon={ClipboardList} activeTab={activeTab} onSelect={() => { setActiveTab('exams'); setSelectedCourse(null); setIsMobileMenuOpen(false); }} />
          <SidebarItem id="schedule" label="ตารางเรียน" icon={Calendar} activeTab={activeTab} onSelect={() => { setActiveTab('schedule'); setSelectedCourse(null); setIsMobileMenuOpen(false); }} />

          <p className="px-4 text-xs font-bold text-slate-400 uppercase mb-2 mt-6 tracking-wider">อื่นๆ</p>
          <SidebarItem id="messages" label="ข้อความ" icon={MessageSquare} activeTab={activeTab} onSelect={() => { setActiveTab('messages'); setSelectedCourse(null); setIsMobileMenuOpen(false); }} />

        </nav>

        <div className="mt-auto bg-white p-3 rounded-2xl shadow-sm">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
              <User className="text-slate-400" />
            </div>
            <div className="ml-3 flex-1 overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">
                {profile.firstName} {profile.lastName}
              </p>
              <p className="text-xs text-slate-500 truncate capitalize">{profile.roleLabel}</p>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-400"><LogOut size={18} /></button>
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
                      activeTab === 'exams' ? 'แบบทดสอบ' :
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
                {activeTab === 'exams' && renderExams()}
                {activeTab === 'schedule' && renderSchedule()}
                {activeTab === 'messages' && renderMessages()}

              </>
            )}

            <div className="h-20"></div>
          </div>
        </div>
        {/*         <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={toggleRole}
            className="bg-slate-800 text-white px-5 py-3 rounded-full shadow-lg font-bold flex items-center hover:scale-105 transition-transform"
          >
            <User size={18} className="mr-2" />
            สลับมุมมอง: {userRole === 'student' ? 'นักเรียน' : 'ครูผู้สอน'}
          </button>
        </div> */}

      </main>
    </div>
  );
}