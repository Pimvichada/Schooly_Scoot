import React, { useState } from 'react';
// เพิ่ม Eye และ EyeOff เข้ามา
import { User, Lock, Mail, ArrowRight, GraduationCap, FileText, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { MascotStar } from './Mascots';
import { registerUser, authenticateWithGoogle, completeGoogleRegistration } from '../services/authService';

export default function RegisterPage({ onRegister, onBackToLogin }) {
  const [selectedRole, setSelectedRole] = useState('student');
  // 1. เพิ่ม State สำหรับการสลับการมองเห็นรหัสผ่าน
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
      // onRegister prop might be used for navigation
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
      // 1. Authenticate only
      const { user, isNewUser, existingRole } = await authenticateWithGoogle();

      if (isNewUser) {
        // 2. If new, show Modal to ask for Role and Name
        setGoogleUser(user);
        setGoogleFullName(user.displayName || '');
        setShowGoogleModal(true);
      } else {
        // 3. If exists, just login (callback with role for navigation)
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
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] via-[#eef2f6] to-[#e6e9f0] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl w-full max-w-lg relative z-10 border border-white/60">

        {/* ส่วนหัวเหมือนเดิม... */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-tr from-[#96C68E] to-[#BEE1FF] rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg transform -rotate-3">
            <MascotStar className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800">สร้างบัญชีใหม่</h1>
        </div>

        {/* Modal for Google Registration */}
        {showGoogleModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
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
                  <button
                    type="button"
                    onClick={() => setSelectedRole('student')}
                    className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${selectedRole === 'student' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
                  >
                    นักเรียน
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('teacher')}
                    className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${selectedRole === 'teacher' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
                  >
                    ครูผู้สอน
                  </button>
                </div>

                <button
                  onClick={confirmGoogleRegistration}
                  disabled={loading}
                  className="w-full bg-[#96C68E] text-white py-3 rounded-xl font-bold hover:bg-[#85b57d] transition-all disabled:opacity-70 mt-4"
                >
                  {loading ? 'กำลังบันทึก...' : 'ตกลง'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ส่วนเลือก Role เหมือนเดิม... */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6 relative">
          <button
            type="button"
            onClick={() => setSelectedRole('student')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm z-10 transition-all ${selectedRole === 'student' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
          >
            นักเรียน
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('teacher')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm z-10 transition-all ${selectedRole === 'teacher' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
          >
            ครูผู้สอน
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 flex items-start text-sm">
            <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input name="fullName" onChange={handleChange} required className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 outline-none focus:border-[#96C68E]" placeholder="ชื่อ-นามสกุล" />
          </div>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="email" name="email" onChange={handleChange} required className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 outline-none focus:border-[#96C68E]" placeholder="อีเมล" />
          </div>

          {/* 2. ช่องรหัสผ่านที่ปรับปรุงใหม่ */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              // เปลี่ยน type ตามสถานะ showPassword
              type={showPassword ? "text" : "password"}
              name="password"
              onChange={handleChange}
              required
              className="w-full pl-12 pr-12 py-4 rounded-2xl border border-slate-200 outline-none focus:border-[#96C68E]"
              placeholder="รหัสผ่าน"
            />
            {/* ปุ่มดวงตา */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all ${selectedRole === 'student' ? 'bg-[#96C68E]' : 'bg-[#FF917B]'} disabled:opacity-70 disabled:cursor-not-allowed`}
          >
            {loading ? 'กำลังสร้างบัญชี...' : 'สมัครสมาชิก'}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="px-4 text-slate-400 text-sm">หรือ</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full bg-white text-slate-700 py-4 rounded-2xl font-bold text-lg border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center mb-6"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6 mr-3" alt="Google" />
          ลงทะเบียนด้วย Google
        </button>

        <p className="mt-6 text-center text-sm text-slate-500">
          มีบัญชีอยู่แล้ว? <button onClick={onBackToLogin} type="button" className="font-bold text-[#96C68E] hover:underline">เข้าสู่ระบบ</button>
        </p>
      </div>
    </div>
  );
}