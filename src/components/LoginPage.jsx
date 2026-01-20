import React, { useState } from 'react';
import { User, Lock, ArrowRight, GraduationCap } from 'lucide-react';
import { MascotStar } from './Mascots';

// 1. เพิ่ม onNavigateToRegister เข้าไปใน Props
// ต้องใส่ { } ครอบตัวแปรแบบนี้เป๊ะๆ นะครับ
export default function LoginPage({ onLogin, onNavigateToRegister }) {
  const [selectedRole, setSelectedRole] = useState('student');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] via-[#eef2f6] to-[#e6e9f0] flex items-center justify-center p-4 relative overflow-hidden">
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

        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8 relative">
          <div 
            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-out ${selectedRole === 'teacher' ? 'translate-x-full left-1.5' : 'left-1.5'}`}
          ></div>
          <button 
            type="button"
            onClick={() => setSelectedRole('student')}
            className={`flex-1 flex items-center justify-center py-3 rounded-xl font-bold text-sm relative z-10 transition-colors duration-300 ${selectedRole === 'student' ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <User size={18} className="mr-2"/> นักเรียน
          </button>
          <button 
            type="button"
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
                key={selectedRole} 
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
            ยังไม่มีบัญชี? 
            {/* 2. เปลี่ยน <a> เป็น <button> และเรียกใช้ onNavigateToRegister */}
            <button 
              type="button"
              onClick={onNavigateToRegister}
              className={`ml-1 font-bold hover:underline transition-colors ${selectedRole === 'student' ? 'text-[#96C68E]' : 'text-[#FF917B]'}`}
            >
              ลงทะเบียนเรียน
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}