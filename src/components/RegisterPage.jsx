



import React, { useEffect, useState } from 'react';
import { User, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { registerUser, authenticateWithGoogle, completeGoogleRegistration } from '../services/authService';
import logo_Schooly from '../assets/logo_Schooly.png';

export default function RegisterPage({ onRegister, onBackToLogin }) {
  const [selectedRole, setSelectedRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // State for Google Registration Modal
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleUser, setGoogleUser] = useState(null);
  const [googleFullName, setGoogleFullName] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });

  // Parallax Effect Logic (Same as LandingPage)
  useEffect(() => {
    const handleMouseMove = (e) => {
      const shapes = document.querySelectorAll('.floating-shape');
      const x = (window.innerWidth - e.pageX * 2) / 100;
      const y = (window.innerHeight - e.pageY * 2) / 100;

      shapes.forEach((shape, index) => {
        const speed = (index + 1) * 0.5;
        shape.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registerUser(formData.email, formData.password, {
        ...formData,
        role: selectedRole
      });
      if (onRegister) onRegister({ ...formData, role: selectedRole });
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น');
      } else if (err.code === 'auth/weak-password') {
        setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      } else {
        setError('เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      const { user, isNewUser, existingRole } = await authenticateWithGoogle();

      if (isNewUser) {
        setGoogleUser(user);
        setGoogleFullName(user.displayName || '');
        setShowGoogleModal(true);
      } else {
        if (onRegister) onRegister({ role: existingRole });
      }
    } catch (err) {
      console.error(err);
      setError('เกิดข้อผิดพลาดในการลงทะเบียนด้วย Google');
    }
  };

  const confirmGoogleRegistration = async () => {
    if (!googleUser) return;
    setLoading(true);
    try {
      await completeGoogleRegistration(googleUser, selectedRole, googleFullName);
      setShowGoogleModal(false);
      if (onRegister) onRegister({ role: selectedRole });
    } catch (err) {
      console.error(err);
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative bg-[#f4f7f5] overflow-hidden font-sans">
      {/* Styles for Animations (Same as LandingPage) */}
      <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;500;700&display=swap');
            .font-kanit { font-family: 'Kanit', sans-serif; }
            @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-20px) rotate(5deg); } }
            @keyframes drift { 0% { transform: translate(0, 0); } 50% { transform: translate(15px, -10px); } 100% { transform: translate(0, 0); } }
            .floating-shape { position: absolute; z-index: 1; opacity: 0.8; transition: transform 0.1s ease-out; pointer-events: none; }
            .shape-1 { animation: float 6s ease-in-out infinite; }
            .shape-2 { animation: float 8s ease-in-out infinite reverse; }
            .shape-3 { animation: drift 10s ease-in-out infinite; }
            .shape-4 { animation: float 7s ease-in-out infinite 1s; }
            .shape-5 { animation: drift 12s ease-in-out infinite reverse; }
      `}</style>

      {/* Background Shapes */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="floating-shape shape-1 top-[15%] left-[20%] w-32 h-16">
          <svg viewBox="0 0 100 50">
            <path d="M0,50 A50,50 0 0,1 100,50 Z" fill="#90c9a7" />
            <circle cx="70" cy="35" r="2" fill="black" />
            <path d="M68,42 Q70,45 72,42" stroke="black" fill="none" strokeWidth="1.5" />
          </svg>
        </div>
        <div className="floating-shape shape-2 bottom-[15%] right-[30%] w-24 h-24">
          <svg viewBox="0 0 100 100">
            <path d="M10,40 L50,10 L90,40 L90,90 L10,90 Z" fill="#f8a595" />
            <circle cx="45" cy="60" r="2" fill="black" />
            <circle cx="55" cy="60" r="2" fill="black" />
            <path d="M47,68 Q50,71 53,68" stroke="black" fill="none" strokeWidth="1.5" />
          </svg>
        </div>
        <div className="floating-shape shape-3 top-[60%] left-[10%] w-40 h-40">
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="#add8f7" stroke="#add8f7" strokeDasharray="2,2" />
            <circle cx="55" cy="45" r="2.5" fill="black" />
            <circle cx="75" cy="45" r="2.5" fill="black" />
            <path d="M62,55 Q65,60 68,55" stroke="black" fill="none" strokeWidth="2" />
          </svg>
        </div>
        <div className="floating-shape shape-4 top-[10%] right-[40%] w-16 h-16">
          <svg viewBox="0 0 100 100">
            <path d="M50 0 L61 39 L100 50 L61 61 L50 100 L39 61 L0 50 L39 39 Z" fill="#f88d75" />
          </svg>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl w-full max-w-lg relative z-10 border border-white/60 font-kanit">
        <div className="text-center mb-8">
          <h1 className="flex justify-center items-center">
            <img src={logo_Schooly} alt="Schooly Scoot Logo" className="h-32 w-auto" />
          </h1>
          <h1 className="text-3xl font-bold text-slate-800 mt-2">สร้างบัญชีใหม่</h1>
          <p className="text-slate-500 mt-1">เข้าร่วมชุมชนการเรียนรู้ Schooly Scoot</p>
        </div>

        {showGoogleModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 font-kanit">
            <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl relative overflow-hidden">
              <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">ยืนยันข้อมูล</h3>
              <p className="text-sm text-slate-500 text-center mb-6">กรุณาตรวจสอบชื่อและเลือกสถานะของคุณ</p>
              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    value={googleFullName}
                    onChange={(e) => setGoogleFullName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#96C68E]"
                    placeholder="ชื่อ-นามสกุล"
                  />
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button type="button" onClick={() => setSelectedRole('student')} className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${selectedRole === 'student' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}>นักเรียน</button>
                  <button type="button" onClick={() => setSelectedRole('teacher')} className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${selectedRole === 'teacher' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}>ครูผู้สอน</button>
                </div>
                <button onClick={confirmGoogleRegistration} disabled={loading} className="w-full bg-[#96C68E] text-white py-3 rounded-xl font-bold hover:bg-[#85b57d] transition-all disabled:opacity-70 mt-4">
                  {loading ? 'กำลังบันทึก...' : 'ตกลง'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6 relative">
          <button type="button" onClick={() => setSelectedRole('student')} className={`flex-1 py-3 rounded-xl font-bold text-sm z-10 transition-all ${selectedRole === 'student' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}>นักเรียน</button>
          <button type="button" onClick={() => setSelectedRole('teacher')} className={`flex-1 py-3 rounded-xl font-bold text-sm z-10 transition-all ${selectedRole === 'teacher' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}>ครูผู้สอน</button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 flex items-start text-sm">
            <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#96C68E] transition-colors" size={18} />
            <input name="fullName" onChange={handleChange} required className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 outline-none focus:border-[#96C68E] bg-white/50 focus:bg-white transition-all" placeholder="ชื่อ-นามสกุล" />
          </div>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#96C68E] transition-colors" size={18} />
            <input type="email" name="email" onChange={handleChange} required className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 outline-none focus:border-[#96C68E] bg-white/50 focus:bg-white transition-all" placeholder="อีเมล" />
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#96C68E] transition-colors" size={18} />
            <input type={showPassword ? "text" : "password"} name="password" onChange={handleChange} required className="w-full pl-12 pr-12 py-4 rounded-2xl border border-slate-200 outline-none focus:border-[#96C68E] bg-white/50 focus:bg-white transition-all" placeholder="รหัสผ่าน" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button type="submit" disabled={loading} className={`w-full text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all ${selectedRole === 'student' ? 'bg-[#96C68E] hover:bg-[#85b57d]' : 'bg-[#FF917B] hover:bg-[#ff8672]'} disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center`}>
            {loading ? 'กำลังสร้างบัญชี...' : 'สมัครสมาชิก'} <ArrowRight className="ml-2" size={20} />
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="px-4 text-slate-400 text-sm">หรือ</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        <button type="button" onClick={handleGoogleLogin} className="w-full bg-white text-slate-700 py-4 rounded-2xl font-bold text-lg border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center mb-6 shadow-sm hover:shadow-md">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6 mr-3" alt="Google" />
          ลงทะเบียนด้วย Google
        </button>

        <p className="mt-6 text-center text-sm text-slate-500">
          มีบัญชีอยู่แล้ว? <button onClick={onBackToLogin} type="button" className="font-bold text-[#96C68E] hover:underline transition-colors">เข้าสู่ระบบ</button>
        </p>
      </div>

      <div className="absolute bottom-4 text-gray-400 text-xs tracking-widest uppercase font-kanit">
        © 2026 Schooly Scoot Inc. All Rights Reserved
      </div>
    </div>
  );
}