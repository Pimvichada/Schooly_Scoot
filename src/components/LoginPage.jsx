import React, { useState } from 'react';
import { User, Lock, ArrowRight, GraduationCap, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { MascotStar } from './Mascots';
import { loginUser, resetPassword, setAuthPersistence } from '../services/authService';
import logo_Schooly from '../assets/logo_Schooly.png';

export default function LoginPage({ onLogin, onNavigateToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // 2. เพิ่ม State สำหรับเปิด-ปิดรหัสผ่าน
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      setError('กรุณากรอกอีเมลเพื่อรีเซ็ตรหัสผ่าน');
      return;
    }
    try {
      await resetPassword(email);
      alert('ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว');
      setError('');
    } catch (err) {
      console.error(err);
      setError('ไม่สามารถส่งอีเมลรีเซ็ตรหัสผ่านได้ ตรวจสอบอีเมลอีกครั้ง');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await setAuthPersistence(rememberMe);
      await loginUser(email, password);
      // onLogin prop isn't strictly needed for auth logic anymore but might be used for other side effects if any
      if (onLogin) onLogin();
    } catch (err) {
      console.error(err);
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง หรือเกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] via-[#eef2f6] to-[#e6e9f0] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#96C68E]/10 blur-[100px]"></div>
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-[#BEE1FF]/10 blur-[100px]"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[45%] h-[45%] rounded-full bg-[#FF917B]/10 blur-[100px]"></div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md relative z-10 border border-white/60">
        <div className="text-center mb-8">
          {/* <div className="w-24 h-24 bg-gradient-to-tr from-[#FF917B] to-[#FFE787] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl transform rotate-3 hover:rotate-6 transition-transform duration-500">
            <MascotStar className="w-16 h-16 text-white drop-shadow-sm" />
          </div> */}
          <h1 className="flex justify-center items-center">
            <img
              src={logo_Schooly}
              alt="Schooly Scoot Logo"
              className="h-38 w-auto"
            />
          </h1>
          {/* <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Schooly Scoot</h1> */}
          <p className="text-slate-500 mt-3 font-medium">ระบบจัดการการเรียนรู้สำหรับคนรุ่นใหม่</p>
        </div>

        {/* ส่วนเลือก Role */}


        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 flex items-start text-sm">
            <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">ชื่อผู้ใช้ / อีเมล</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#96C68E] transition-colors" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white/50 focus:bg-white focus:border-[#96C68E] focus:ring-4 focus:ring-[#96C68E]/10 transition-all outline-none text-slate-700 font-medium placeholder:text-slate-300"
                placeholder="กรอกอีเมล..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">รหัสผ่าน</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#96C68E] transition-colors" size={20} />
              <input
                // 3. เปลี่ยน type ตาม State
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-12 pr-12 py-4 rounded-2xl border border-slate-200 bg-white/50 focus:bg-white focus:border-[#96C68E] focus:ring-4 focus:ring-[#96C68E]/10 transition-all outline-none text-slate-700 font-medium placeholder:text-slate-300"
                placeholder="กรอกรหัสผ่าน..."
              />
              {/* 4. เพิ่มปุ่มดวงตา */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-slate-600 cursor-pointer hover:text-slate-800 transition-colors">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#96C68E] focus:ring-[#96C68E] mr-2"
              />
              จดจำฉัน
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="font-bold text-gray-500  hover:text-[#ff7e61] hover:underline transition-colors"
            >
              ลืมรหัสผ่าน?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-gray-500 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center group bg-[#fde487] hover:bg-[#85b57d] disabled:opacity-70 disabled:cursor-not-allowed`}
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'} <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            ยังไม่มีบัญชี?
            <button
              type="button"
              onClick={onNavigateToRegister}
              className={`ml-1 font-bold hover:underline transition-colors text-[#96C68E]`}
            >
              ลงทะเบียนเรียน
            </button>
          </p>
        </div>
      </div >
    </div >
  );
}