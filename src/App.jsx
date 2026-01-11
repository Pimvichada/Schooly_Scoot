import React, { useState, useEffect, useRef } from 'react';
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

// --- MASCOT COMPONENTS (น้องๆ เรขาคณิต) ---

const MascotCircle = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <circle cx="50" cy="50" r="45" fill="#96C68E" stroke="#7aa371" strokeWidth="3" />
    <circle cx="35" cy="45" r="8" fill="white" />
    <circle cx="35" cy="45" r="3" fill="black" />
    <circle cx="65" cy="45" r="8" fill="white" />
    <circle cx="65" cy="45" r="3" fill="black" />
    <path d="M 40 65 Q 50 75 60 65" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

const MascotSquare = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <rect x="10" y="10" width="80" height="80" rx="10" fill="#BEE1FF" stroke="#90b8e6" strokeWidth="3" />
    <circle cx="35" cy="40" r="8" fill="white" />
    <circle cx="35" cy="40" r="3" fill="black" />
    <circle cx="65" cy="40" r="8" fill="white" />
    <circle cx="65" cy="40" r="3" fill="black" />
    <path d="M 35 65 Q 50 60 65 65" stroke="#5a7a9e" strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

const MascotTriangle = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <path d="M 50 10 L 90 90 L 10 90 Z" fill="#FF917B" stroke="#d6725e" strokeWidth="3" strokeLinejoin="round" />
    <circle cx="40" cy="55" r="6" fill="white" />
    <circle cx="40" cy="55" r="2.5" fill="black" />
    <circle cx="60" cy="55" r="6" fill="white" />
    <circle cx="60" cy="55" r="2.5" fill="black" />
    <circle cx="50" cy="75" r="3" fill="#8f4637" />
  </svg>
);

const MascotStar = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <polygon points="50,5 61,35 95,35 68,55 79,90 50,70 21,90 32,55 5,35 39,35" fill="#FFE787" stroke="#e0c868" strokeWidth="3" strokeLinejoin="round"/>
    <circle cx="42" cy="50" r="5" fill="white" />
    <circle cx="42" cy="50" r="2" fill="black" />
    <circle cx="58" cy="50" r="5" fill="white" />
    <circle cx="58" cy="50" r="2" fill="black" />
    <path d="M 45 65 Q 50 70 55 65" stroke="#b39d49" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);

// --- MOCK DATA (Updated with Dynamic Feed) ---

const COURSES = [
  { 
    id: 1, 
    name: 'คณิตศาสตร์พื้นฐาน', 
    code: 'MATH101', 
    teacher: 'ครูสมชาย', 
    color: 'bg-[#96C68E]', 
    icon: <MascotSquare className="w-12 h-12"/>,
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
    icon: <MascotCircle className="w-12 h-12"/>,
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
    icon: <MascotTriangle className="w-12 h-12"/>,
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
    icon: <MascotStar className="w-12 h-12"/>,
    description: 'ฝึกวาดภาพระบายสี องค์ประกอบศิลป์ และประวัติศาสตร์ศิลปะ',
    feed: [
      { id: 401, text: 'อย่าลืมเตรียมสีน้ำและพู่กันมาในคาบหน้านะครับ', date: '10 ม.ค.', file: null },
      { id: 402, text: 'ตัวอย่างผลงานศิลปะ Impressionism สำหรับเป็นแรงบันดาลใจ', date: 'วันนี้', file: 'Art_Examples.jpg' }
    ]
  },
];

const ASSIGNMENTS = [
  { id: 1, title: 'แบบฝึกหัดบทที่ 1', course: 'คณิตศาสตร์พื้นฐาน', dueDate: 'พรุ่งนี้, 16:00', status: 'pending', score: null, description: 'ให้นักเรียนทำแบบฝึกหัดท้ายบทที่ 1 ข้อ 1-10 แสดงวิธีทำอย่างละเอียด' },
  { id: 2, title: 'รายงานการทดลอง', course: 'วิทยาศาสตร์ทั่วไป', dueDate: '15 ม.ค. 67', status: 'submitted', score: '8/10', description: 'สรุปผลการทดลองเรื่องแรงและการเคลื่อนที่ พร้อมรูปประกอบ' },
  { id: 3, title: 'แต่งกลอนสุภาพ', course: 'ภาษาไทยเพื่อการสื่อสาร', dueDate: '20 ม.ค. 67', status: 'pending', score: null, description: 'แต่งกลอนสุภาพ 2 บท หัวข้อ "โรงเรียนของฉัน"' },
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

const NOTIFICATIONS = [
  { id: 1, type: 'homework', message: 'ใกล้ถึงกำหนดส่ง: แบบฝึกหัดบทที่ 1', time: '1 ชม. ที่แล้ว', read: false, detail: 'แบบฝึกหัดบทที่ 1 วิชาคณิตศาสตร์พื้นฐาน จะหมดเวลาส่งในอีก 1 ชั่วโมง กรุณารีบดำเนินการและตรวจสอบความถูกต้องก่อนส่ง' },
  { id: 2, type: 'grade', message: 'ประกาศคะแนนสอบกลางภาค วิชาศิลปะ', time: '3 ชม. ที่แล้ว', read: false, detail: 'คุณครูศิลป์ได้ทำการประกาศคะแนนสอบกลางภาคแล้ว นักเรียนสามารถเข้าไปดูคะแนนได้ที่เมนู "ห้องเรียน > ศิลปะและการออกแบบ > คะแนน"' },
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
  { id: 1, name: 'ส่งงานตรงเวลา', icon: <CheckCircle className="text-white"/>, color: 'bg-green-400', date: '5 ม.ค. 67' },
  { id: 2, name: 'ยอดนักอ่าน', icon: <BookOpen className="text-white"/>, color: 'bg-blue-400', date: '8 ม.ค. 67' },
  { id: 3, name: 'คะแนนเต็ม', icon: <Star className="text-white"/>, color: 'bg-yellow-400', date: '10 ม.ค. 67' },
  { id: 4, name: 'แอคทีฟสุดๆ', icon: <Zap className="text-white"/>, color: 'bg-red-400', date: 'เมื่อวาน' },
];

// --- SEPARATE COMPONENTS ---

const LoginPage = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState('student'); // 'student' or 'teacher'

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] via-[#eef2f6] to-[#e6e9f0] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Elegant Abstract Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#96C68E]/10 blur-[100px]"></div>
          <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-[#BEE1FF]/10 blur-[100px]"></div>
          <div className="absolute -bottom-[10%] left-[20%] w-[45%] h-[45%] rounded-full bg-[#FF917B]/10 blur-[100px]"></div>
      </div>
      
      <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md relative z-10 border border-white/60">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-tr from-[#FF917B] to-[#FFE787] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl transform rotate-3 hover:rotate-6 transition-transform duration-500">
            <MascotStar className="w-16 h-16 text-white drop-shadow-sm" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Schooly Scoot</h1>
          <p className="text-slate-500 mt-3 font-medium">ระบบจัดการการเรียนรู้สำหรับคนรุ่นใหม่</p>
        </div>

        {/* Role Switcher */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8 relative">
          <div 
            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-out ${selectedRole === 'teacher' ? 'translate-x-full left-1.5' : 'left-1.5'}`}
          ></div>
          <button 
            onClick={() => setSelectedRole('student')}
            className={`flex-1 flex items-center justify-center py-3 rounded-xl font-bold text-sm relative z-10 transition-colors duration-300 ${selectedRole === 'student' ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <User size={18} className="mr-2"/> นักเรียน
          </button>
          <button 
            onClick={() => setSelectedRole('teacher')}
            className={`flex-1 flex items-center justify-center py-3 rounded-xl font-bold text-sm relative z-10 transition-colors duration-300 ${selectedRole === 'teacher' ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <GraduationCap size={18} className="mr-2"/> ครูผู้สอน
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onLogin(selectedRole); }} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">ชื่อผู้ใช้ / อีเมล</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#96C68E] transition-colors" size={20}/>
              <input 
                type="text" 
                key={selectedRole} // Force re-render on role change
                defaultValue={selectedRole === 'student' ? "student@schoolyscoot.ac.th" : "teacher@schoolyscoot.ac.th"}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white/50 focus:bg-white focus:border-[#96C68E] focus:ring-4 focus:ring-[#96C68E]/10 transition-all outline-none text-slate-700 font-medium placeholder:text-slate-300"
                placeholder="กรอกชื่อผู้ใช้..."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">รหัสผ่าน</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#96C68E] transition-colors" size={20}/>
              <input 
                type="password" 
                defaultValue="password123"
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white/50 focus:bg-white focus:border-[#96C68E] focus:ring-4 focus:ring-[#96C68E]/10 transition-all outline-none text-slate-700 font-medium placeholder:text-slate-300"
                placeholder="กรอกรหัสผ่าน..."
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            className={`w-full text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center group ${selectedRole === 'student' ? 'bg-[#96C68E] hover:bg-[#85b57d]' : 'bg-[#FF917B] hover:bg-[#ff7e61]'}`}
          >
            {selectedRole === 'student' ? 'เข้าสู่ระบบนักเรียน' : 'เข้าสู่ระบบอาจารย์'} <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20}/>
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            ยังไม่มีบัญชี? <a href="#" className={`font-bold hover:underline transition-colors ${selectedRole === 'student' ? 'text-[#96C68E]' : 'text-[#FF917B]'}`}>ลงทะเบียนเรียน</a>
          </p>
        </div>
      </div>
    </div>
  );
};

const SettingsView = ({ profile, onSave }) => {
  const [formData, setFormData] = useState(profile);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const handleSave = () => {
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
       <h1 className="text-2xl font-bold text-slate-800 flex items-center"><User className="mr-3 text-slate-400"/> ตั้งค่าบัญชี</h1>
       
       {/* Badges Section */}
       <div className="bg-gradient-to-r from-[#BEE1FF] to-[#E0F2FE] rounded-3xl p-6 shadow-sm border border-blue-100 relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-10 -translate-y-10">
             <Trophy size={180} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center relative z-10">
             <Award className="mr-2 text-slate-700"/> เหรียญรางวัลของฉัน
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
             {BADGES.map(badge => (
                <div key={badge.id} className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl flex flex-col items-center text-center shadow-sm">
                   <div className={`w-12 h-12 rounded-full ${badge.color} flex items-center justify-center mb-2 shadow-md`}>
                      {badge.icon}
                   </div>
                   <span className="font-bold text-sm text-slate-700">{badge.name}</span>
                   <span className="text-xs text-slate-500">{badge.date}</span>
                </div>
             ))}
          </div>
       </div>

       <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 max-w-2xl">
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-bold text-slate-600 mb-1">ชื่อจริง</label>
                 <input 
                  type="text" 
                  value={formData.firstName} 
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-[#BEE1FF] outline-none"
                 />
               </div>
               <div>
                 <label className="block text-sm font-bold text-slate-600 mb-1">นามสกุล</label>
                 <input 
                  type="text" 
                  value={formData.lastName} 
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-[#BEE1FF] outline-none"
                 />
               </div>
             </div>
             <button 
              type="submit" 
              className={`px-6 py-3 rounded-xl font-bold shadow-sm transition-all flex items-center ${
                  isSaved ? 'bg-green-500 text-white' : 'bg-[#96C68E] text-white hover:bg-[#85b57d]'
              }`}
             >
               {isSaved ? <><CheckCircle className="mr-2"/> บันทึกเรียบร้อย</> : 'บันทึกการเปลี่ยนแปลง'}
             </button>
          </form>
       </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

export default function SchoolyScootLMS() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('student');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Profile State
  const [profile, setProfile] = useState({
    firstName: 'รักเรียน',
    lastName: 'ขยันยิ่ง',
    email: 'student@schoolyscoot.ac.th',
    roleLabel: 'นักเรียน',
    level: 5,
    xp: 75
  });
  
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
  const [uploadFile, setUploadFile] = useState(null);

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
    const file = e.target.files[0];
    if (file) setUploadFile(file);
  };

  const handleLogin = (role) => {
    setIsLoggedIn(true);
    setUserRole(role);
    setProfile({
      firstName: role === 'student' ? 'รักเรียน' : 'สมชาย',
      lastName: role === 'student' ? 'ขยันยิ่ง' : 'ใจดี',
      email: role === 'student' ? 'student@schoolyscoot.ac.th' : 'teacher@schoolyscoot.ac.th',
      roleLabel: role === 'student' ? 'นักเรียน' : 'ครูผู้สอน'
    });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('dashboard');
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

  // --- SUB-COMPONENTS (Internal) ---

  const SidebarItem = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        setSelectedCourse(null);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center w-full px-4 py-3 mb-2 rounded-2xl transition-all duration-200 ${
        activeTab === id 
          ? 'bg-white shadow-sm text-slate-800 font-bold' 
          : 'text-slate-600 hover:bg-white/50'
      }`}
    >
      <Icon className={`w-5 h-5 mr-3 ${activeTab === id ? 'text-[#FF917B]' : 'text-slate-400'}`} />
      <span>{label}</span>
    </button>
  );

  const StatCard = ({ title, value, color, icon, onClick }) => (
    <div 
      onClick={onClick}
      className={`${color} p-5 rounded-3xl shadow-sm hover:shadow-md transition-all relative overflow-hidden cursor-pointer hover:scale-105 active:scale-95`}
    >
      <div className="absolute right-[-10px] top-[-10px] opacity-20 transform rotate-12">
        {icon}
      </div>
      <h3 className="text-slate-700 font-medium text-sm mb-1">{title}</h3>
      <p className="text-3xl font-bold text-slate-800">{value}</p>
      <div className="mt-2 text-xs font-bold text-slate-800 opacity-60 flex items-center">
        แตะเพื่อดูรายละเอียด <ChevronRight size={12} className="ml-1"/>
      </div>
    </div>
  );

  const CourseCard = ({ course, onClick }) => (
    <div 
      onClick={onClick}
      className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg hover:border-[#BEE1FF] transition-all cursor-pointer group"
    >
      <div className={`h-24 rounded-2xl ${course.color} mb-4 flex items-center justify-center relative overflow-hidden`}>
        <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-all"></div>
        {course.icon}
      </div>
      <h3 className="font-bold text-lg text-slate-800 mb-1">{course.name}</h3>
      <p className="text-slate-500 text-sm mb-3">{course.code} • {course.teacher}</p>
      <div className="flex items-center justify-between mt-4">
        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">25 นักเรียน</span>
        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#FF917B] group-hover:text-white transition-colors">
          <ChevronRight size={16} />
        </div>
      </div>
    </div>
  );

  // --- MODALS ---

  const renderModal = () => {
    if (!activeModal) return null;

    const closeModal = () => {
      setActiveModal(null);
      setSelectedAssignment(null);
      setSelectedNotification(null);
      setUploadFile(null);
      setActiveQuiz(null);
      setQuizAnswers({});
      setQuizResult(null);
    };

    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className={`bg-white rounded-3xl shadow-2xl w-full ${['grading', 'takeQuiz', 'createExam'].includes(activeModal) ? 'max-w-4xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto relative`}>
          <button onClick={closeModal} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 z-10">
            <X size={20} className="text-slate-600"/>
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
                            onChange={(e) => setNewExam({...newExam, title: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-1">วิชา</label>
                        <select 
                            className="w-full p-3 rounded-xl border border-slate-200 focus:border-[#96C68E] outline-none bg-white"
                            value={newExam.course}
                            onChange={(e) => setNewExam({...newExam, course: e.target.value})}
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
                            onChange={(e) => setNewExam({...newExam, time: e.target.value})}
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
                                <button onClick={() => handleRemoveQuestion(idx)} className="text-red-400 hover:text-red-600"><Trash size={16}/></button>
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
                    <Save size={20} className="mr-2"/> บันทึกแบบทดสอบ
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
                        <ClipboardList className="mr-3 text-[#FF917B]"/> {activeQuiz.title}
                    </h2>
                    <div className="flex items-center text-[#96C68E] font-bold bg-[#F0FDF4] px-4 py-2 rounded-xl">
                        <Clock size={18} className="mr-2"/> {activeQuiz.time}
                    </div>
                 </div>
                 <p className="text-slate-500">{activeQuiz.course} • {activeQuiz.questions} ข้อ</p>
               </div>

               {quizResult ? (
                 <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in">
                    <div className="w-32 h-32 bg-[#BEE1FF] rounded-full flex items-center justify-center mb-6 shadow-lg">
                        <MascotStar className="w-24 h-24"/>
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
                                      <label key={optIdx} className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                          quizAnswers[idx] === optIdx 
                                            ? 'border-[#96C68E] bg-white shadow-sm' 
                                            : 'border-transparent bg-white hover:bg-slate-100'
                                      }`}>
                                          <input 
                                            type="radio" 
                                            name={`q-${idx}`} 
                                            className="w-5 h-5 text-[#96C68E] mr-3"
                                            onChange={() => setQuizAnswers({...quizAnswers, [idx]: optIdx})}
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
                        className={`px-8 py-3 rounded-xl font-bold text-lg transition-all ${
                            Object.keys(quizAnswers).length < activeQuiz.items.length
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
                    <button className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 shadow-lg" onClick={closeModal}><PhoneOff size={24}/></button>
                    <button className="p-4 rounded-full bg-slate-700 text-white hover:bg-slate-600"><MicOff size={24}/></button>
                    <button className="p-4 rounded-full bg-slate-700 text-white hover:bg-slate-600"><VideoOff size={24}/></button>
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
               <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                 {NOTIFICATIONS.map((notif) => (
                   <div 
                    key={notif.id} 
                    onClick={() => {
                      setSelectedNotification(notif);
                      setActiveModal('notificationDetail');
                    }}
                    className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all cursor-pointer group"
                   >
                     <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 
                       ${notif.type === 'homework' ? 'bg-[#FFE787]' : notif.type === 'grade' ? 'bg-[#96C68E]' : 'bg-[#BEE1FF]'}`}>
                       {notif.type === 'homework' ? <FileText size={24} className="text-slate-700"/> : 
                        notif.type === 'grade' ? <CheckSquare size={24} className="text-white"/> : <User size={24} className="text-slate-700"/>}
                     </div>
                     <div>
                       <p className="text-slate-800 font-bold text-base leading-tight mb-1 group-hover:text-[#96C68E] transition-colors">{notif.message}</p>
                       <p className="text-sm text-slate-400">{notif.time}</p>
                     </div>
                   </div>
                 ))}
               </div>
               <button onClick={closeModal} className="w-full py-3 mt-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200">
                 ปิด
               </button>
            </div>
          )}

          {/* NOTIFICATION DETAIL MODAL */}
          {activeModal === 'notificationDetail' && selectedNotification && (
            <div className="p-6">
               <div className="flex items-center gap-4 mb-4">
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center 
                   ${selectedNotification.type === 'homework' ? 'bg-[#FFE787]' : selectedNotification.type === 'grade' ? 'bg-[#96C68E]' : 'bg-[#BEE1FF]'}`}>
                   {selectedNotification.type === 'homework' ? <FileText size={24} className="text-slate-700"/> : 
                    selectedNotification.type === 'grade' ? <CheckSquare size={24} className="text-white"/> : <User size={24} className="text-slate-700"/>}
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
               <button onClick={closeModal} className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200">
                 ปิด
               </button>
            </div>
          )}

          {/* ASSIGNMENT DETAIL MODAL */}
          {activeModal === 'assignmentDetail' && selectedAssignment && (
            <div className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-[#FFE787] p-3 rounded-2xl">
                   <FileText size={32} className="text-slate-700"/>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{selectedAssignment.title}</h2>
                  <p className="text-slate-500">{selectedAssignment.course} • ครบกำหนด {selectedAssignment.dueDate}</p>
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
                <h3 className="font-bold text-slate-700 mb-2">คำชี้แจง</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{selectedAssignment.description}</p>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h3 className="font-bold text-slate-800 mb-4">งานของคุณ</h3>
                <div className="relative">
                  <input 
                    type="file" 
                    onChange={handleFileUpload} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all mb-4 ${
                    uploadFile 
                      ? 'border-[#96C68E] bg-[#F0FDF4]' 
                      : 'border-slate-300 hover:bg-slate-50 hover:border-[#96C68E]'
                  }`}>
                    {uploadFile ? (
                       <div>
                         <CheckCircle size={32} className="mx-auto text-[#96C68E] mb-2"/>
                         <p className="text-slate-800 font-bold">{uploadFile.name}</p>
                         <p className="text-xs text-slate-500 mt-1">{(uploadFile.size / 1024).toFixed(2)} KB • พร้อมส่ง</p>
                       </div>
                    ) : (
                       <div>
                         <Upload size={32} className="mx-auto text-slate-400 mb-2"/>
                         <p className="text-slate-500 font-bold">ลากไฟล์มาวาง หรือ คลิกเพื่ออัพโหลด</p>
                         <p className="text-xs text-slate-400 mt-1">รองรับไฟล์ PDF, JPG, PNG</p>
                       </div>
                    )}
                  </div>
                </div>

                <button 
                  onClick={closeModal} 
                  disabled={!uploadFile}
                  className={`w-full py-3 rounded-xl font-bold text-lg shadow-sm flex items-center justify-center transition-all ${
                    uploadFile 
                      ? 'bg-[#96C68E] text-white hover:bg-[#85b57d]' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle className="mr-2"/> ส่งการบ้าน
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
                           <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                             student.status === 'submitted' ? 'bg-green-100 text-green-600' :
                             student.status === 'late' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                           }`}>
                             {student.status === 'submitted' ? 'ส่งแล้ว' : student.status === 'late' ? 'ส่งช้า' : 'ยังไม่ส่ง'}
                           </span>
                         </td>
                         <td className="py-4">
                           {student.file ? (
                             <button className="text-[#BEE1FF] font-bold text-sm hover:underline flex items-center">
                               <FileText size={16} className="mr-1"/> {student.file}
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        <StatCard 
          title="การแจ้งเตือน" 
          value="5" 
          color="bg-[#BEE1FF]" 
          icon={<Bell size={64} />} 
          onClick={() => setActiveModal('notificationsList')}
        />
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
             {NOTIFICATIONS.map((notif) => (
               <div 
                key={notif.id} 
                onClick={() => {
                  setSelectedNotification(notif);
                  setActiveModal('notificationDetail');
                }}
                className="flex gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group"
               >
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 
                   ${notif.type === 'homework' ? 'bg-[#FFE787]' : notif.type === 'grade' ? 'bg-[#96C68E]' : 'bg-[#BEE1FF]'}`}>
                   {notif.type === 'homework' ? <FileText size={18} className="text-slate-700"/> : 
                    notif.type === 'grade' ? <CheckSquare size={18} className="text-white"/> : <User size={18} className="text-slate-700"/>}
                 </div>
                 <div>
                   <p className="text-sm text-slate-800 font-medium leading-tight group-hover:text-[#96C68E] transition-colors">{notif.message}</p>
                   <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
                 </div>
               </div>
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

  const renderAssignments = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold text-slate-800 flex items-center"><CheckSquare className="mr-3 text-[#FF917B]"/> {userRole === 'student' ? 'การบ้านของฉัน' : 'งานที่มอบหมาย'}</h1>
      
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="space-y-4">
          {ASSIGNMENTS.map((assign) => (
            <div key={assign.id} className="flex flex-col md:flex-row md:items-center p-4 border border-slate-100 rounded-2xl hover:border-[#BEE1FF] hover:bg-slate-50 transition-all cursor-pointer">
               <div className="flex-1">
                 <div className="flex items-center gap-2 mb-1">
                   <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                     assign.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
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
                  className={`px-6 py-2 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 ${
                   userRole === 'teacher' ? 'bg-white border-2 border-[#96C68E] text-[#96C68E]' : 'bg-[#BEE1FF] text-slate-800'
                 }`}>
                   {userRole === 'teacher' ? 'ตรวจงาน' : 'ดูรายละเอียด'}
                 </button>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderExams = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center"><ClipboardList className="mr-3 text-[#96C68E]"/> แบบทดสอบ</h1>
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
                        ? <div className="bg-green-100 text-green-600 p-2 rounded-full"><CheckCircle size={24}/></div>
                        : <div className="bg-yellow-100 text-yellow-600 p-2 rounded-full"><Clock size={24}/></div>
                    }
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                    <span className="flex items-center"><HelpCircle size={16} className="mr-1"/> {quiz.questions} ข้อ</span>
                    <span className="flex items-center"><Clock size={16} className="mr-1"/> {quiz.time}</span>
                </div>
                
                {quiz.status === 'completed' ? (
                    <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl">
                        <span className="font-bold text-slate-600">คะแนนที่ได้</span>
                        <span className="font-bold text-xl text-[#96C68E]">{quiz.score}</span>
                    </div>
                ) : (
                    <button 
                        onClick={() => {
                            if(quiz.items && quiz.items.length > 0) {
                                setActiveQuiz(quiz);
                                setActiveModal('takeQuiz');
                            }
                        }}
                        disabled={!quiz.items || quiz.items.length === 0}
                        className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
                            quiz.items && quiz.items.length > 0 
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
      <h1 className="text-2xl font-bold text-slate-800 flex items-center"><Calendar className="mr-3 text-[#96C68E]"/> ตารางเรียน/สอน</h1>
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
         <div className="flex justify-between items-center mb-6">
           <h2 className="text-lg font-bold text-slate-700">มกราคม 2567</h2>
           <div className="flex gap-2">
             <button className="p-2 hover:bg-slate-100 rounded-lg"><ChevronRight className="rotate-180" size={20}/></button>
             <button className="p-2 hover:bg-slate-100 rounded-lg"><ChevronRight size={20}/></button>
           </div>
         </div>
         {/* Simple Mock Weekly View */}
         <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
           {['จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์'].map((day, i) => (
             <div key={day} className="space-y-3">
                <div className="text-center font-bold text-slate-500 mb-2">{day}</div>
                {[1, 2, 3].map((slot) => (
                   <div key={slot} className={`p-3 rounded-xl text-sm ${
                     (i + slot) % 3 === 0 ? 'bg-[#F0FDF4] border border-[#96C68E]' : 
                     (i + slot) % 4 === 0 ? 'bg-[#FFF7ED] border border-[#FF917B]' : 'bg-slate-50 border border-slate-100'
                   }`}>
                     <div className="font-bold text-slate-800">09:00 - 10:30</div>
                     <div className="text-slate-600">{(i+slot) % 3 === 0 ? 'คณิตศาสตร์' : (i+slot)%4 === 0 ? 'ภาษาไทย' : 'ว่าง'}</div>
                     {(i+slot)%3 === 0 && <div className="mt-2 text-xs text-[#96C68E] font-bold">● กำลังสอน</div>}
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
         <h1 className="text-2xl font-bold text-slate-800 flex items-center"><MessageSquare className="mr-3 text-[#BEE1FF]"/> ข้อความ</h1>
         <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 flex overflow-hidden">
           {/* Chat List */}
           <div className={`w-full md:w-1/3 border-r border-slate-100 overflow-y-auto ${activeChatId ? 'hidden md:block' : 'block'}`}>
             <div className="p-4 border-b border-slate-100 bg-slate-50">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
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
                       <ChevronRight className="rotate-180"/>
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
                     <button className="p-2 hover:bg-slate-50 rounded-full"><Video size={20}/></button>
                     <button className="p-2 hover:bg-slate-50 rounded-full"><Info size={20}/></button>
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
                           <div className={`p-3 rounded-2xl text-sm ${
                             isMe 
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
                       <Plus size={20}/>
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
                       className={`p-3 rounded-xl transition-all ${
                         chatInput.trim() 
                           ? 'bg-[#96C68E] text-white hover:bg-[#85b57d] shadow-sm' 
                           : 'bg-slate-100 text-slate-300'
                       }`}
                     >
                       <Send size={20}/>
                     </button>
                   </form>
                 </div>
               </>
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-400 p-8 text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare size={32} className="opacity-50"/>
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
      switch(courseTab) {
        case 'work':
          return (
             <div className="space-y-4">
               <button className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 font-bold hover:border-[#96C68E] hover:text-[#96C68E] transition-all">
                 + เพิ่มงาน (เฉพาะครู) หรือ ส่งงาน (เฉพาะนักเรียน)
               </button>
               {ASSIGNMENTS.filter(a => a.course === selectedCourse.name).length > 0 ? (
                 ASSIGNMENTS.filter(a => a.course === selectedCourse.name).map(a => (
                   <div key={a.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-slate-800">{a.title}</h4>
                        <p className="text-sm text-slate-500">ครบกำหนด: {a.dueDate}</p>
                      </div>
                      <span className="text-sm px-3 py-1 bg-slate-100 rounded-lg text-slate-600">10 คะแนน</span>
                   </div>
                 ))
               ) : (
                 <p className="text-center text-slate-400 py-10">ยังไม่มีงานในวิชานี้</p>
               )}
             </div>
          );
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
               <PieChart size={64} className="mx-auto text-slate-200 mb-4"/>
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
                    <div className="text-2xl font-mono text-[#96C68E] font-bold tracking-widest">X7K-9P2</div>
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
                    <User size={20} className="text-slate-500"/>
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-xl px-4 py-3 text-slate-400 text-sm cursor-text hover:bg-slate-100 transition-colors">
                    ประกาศบางอย่างให้กับชั้นเรียน...
                  </div>
                  <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full">
                    <Upload size={20}/>
                  </button>
                </div>

                {selectedCourse.feed && selectedCourse.feed.length > 0 ? (
                  selectedCourse.feed.map(post => (
                    <div key={post.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${selectedCourse.color} flex items-center justify-center`}>
                            <FileText size={20} className="opacity-50"/>
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">ครู{selectedCourse.teacher}</h4>
                            <p className="text-xs text-slate-400">โพสต์เมื่อ {post.date}</p>
                          </div>
                        </div>
                        <button><MoreVertical size={20} className="text-slate-300"/></button>
                      </div>
                      <p className="text-slate-600 text-sm mb-4">
                        {post.text}
                      </p>
                      {post.file && (
                        <div className="flex gap-2">
                          <div className="border border-slate-200 rounded-xl p-3 flex items-center gap-3 w-1/2 hover:bg-slate-50 cursor-pointer">
                              <div className="bg-red-100 p-2 rounded-lg"><FileText size={20} className="text-red-500"/></div>
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
              className={`pb-3 font-bold text-sm whitespace-nowrap transition-colors ${
                courseTab === tab.id 
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
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
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
          <SidebarItem id="dashboard" label="แดชบอร์ด" icon={PieChart} />
          <SidebarItem id="courses" label="ห้องเรียน" icon={BookOpen} />
          <SidebarItem id="assignments" label={userRole === 'student' ? "การบ้าน" : "ตรวจงาน"} icon={CheckSquare} />
          <SidebarItem id="exams" label="แบบทดสอบ" icon={ClipboardList} />
          <SidebarItem id="schedule" label="ตารางเรียน" icon={Calendar} />
          
          <p className="px-4 text-xs font-bold text-slate-400 uppercase mb-2 mt-6 tracking-wider">อื่นๆ</p>
          <SidebarItem id="messages" label="ข้อความ" icon={MessageSquare} />
          <SidebarItem id="settings" label="ตั้งค่า" icon={Settings} />
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
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
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
                {activeTab === 'settings' && <SettingsView profile={profile} onSave={setProfile} />}
              </>
            )}
            
            <div className="h-20"></div>
          </div>
        </div>

        <div className="fixed bottom-6 right-6 z-40">
          <button 
            onClick={toggleRole}
            className="bg-slate-800 text-white px-5 py-3 rounded-full shadow-lg font-bold flex items-center hover:scale-105 transition-transform"
          >
            <User size={18} className="mr-2"/>
            สลับมุมมอง: {userRole === 'student' ? 'นักเรียน' : 'ครูผู้สอน'}
          </button>
        </div>

      </main>
    </div>
  );
}