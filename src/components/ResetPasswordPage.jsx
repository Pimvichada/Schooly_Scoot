import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Check, AlertCircle, ArrowRight, ChevronLeft } from 'lucide-react';
import { verifyResetCode, confirmPasswordChange } from '../services/authService';

const ResetPasswordPage = ({ darkMode, onBackToLogin }) => {
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [verifying, setVerifying] = useState(true);

    const hasVerified = React.useRef(false);

    useEffect(() => {
        if (hasVerified.current) return;

        const urlParams = new URLSearchParams(window.location.search);
        const oobCode = urlParams.get('oobCode');
        if (oobCode) {
            hasVerified.current = true;
            setCode(oobCode);
            handleVerifyCode(oobCode);
        } else {
            setError('ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้อง หรือหมดอายุแล้ว');
            setVerifying(false);
        }
    }, []);

    // --- ANIMATION EFFECTS ---
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

    const handleVerifyCode = async (oobCode) => {
        try {
            await verifyResetCode(oobCode);
            setVerifying(false);
        } catch (err) {
            console.error(err);
            let msg = 'ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้อง หรือหมดอายุแล้ว';
            if (err.code === 'auth/invalid-action-code') msg = 'ลิงก์หมดอายุหรือถูกใช้งานไปแล้ว กรุณาขอยกเลิกใหม่';
            if (err.code === 'auth/expired-action-code') msg = 'ลิงก์หมดอายุแล้ว กรุณาส่งอีเมลใหม่อีกครั้ง';
            setError(msg);
            setVerifying(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword.length < 6) {
            setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('รหัสผ่านไม่ตรงกัน');
            return;
        }

        setLoading(true);
        try {
            await confirmPasswordChange(code, newPassword);
            setSuccess(true);
        } catch (err) {
            console.error(err);
            setError('ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาลองใหม่ในภายหลัง');
        } finally {
            setLoading(false);
        }
    };

    if (verifying) {
        return (
            <div className={`min-h-screen w-full flex items-center justify-center font-kanit ${darkMode ? 'bg-slate-950 text-white' : 'bg-[#f4f7f5] text-slate-800'}`}>
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#96C68E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="font-bold">กำลังตรวจสอบลิงก์...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen w-full flex flex-col items-center justify-center relative px-4 font-kanit py-20 overflow-hidden ${darkMode ? 'bg-slate-950' : 'bg-[#f4f7f5]'}`}>
            <style>{`
                @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-20px) rotate(5deg); } }
                @keyframes drift { 0% { transform: translate(0, 0); } 50% { transform: translate(15px, -10px); } 100% { transform: translate(0, 0); } }
                @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
                
                .animate-blob { animation: blob 7s infinite; }
                .animation-delay-2000 { animation-delay: 2s; }
                
                .floating-shape { position: fixed; z-index: 1; opacity: 0.8; transition: transform 0.1s ease-out; pointer-events: none; }
                .shape-1 { animation: float 6s ease-in-out infinite; }
                .shape-2 { animation: float 8s ease-in-out infinite reverse; }
                .shape-3 { animation: drift 10s ease-in-out infinite; }
                .shape-4 { animation: float 7s ease-in-out infinite 1s; }
                .shape-5 { animation: drift 12s ease-in-out infinite reverse; }
                
                @keyframes bounce-slow {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-10px); }
                }
                .animation-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
            `}</style>

            {/* Background Decorations */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="floating-shape shape-1 top-[15%] left-[20%] w-32 h-16"><svg viewBox="0 0 100 50"><path d="M0,50 A50,50 0 0,1 100,50 Z" fill="#90c9a7" /><circle cx="70" cy="35" r="2" fill="black" /><path d="M68,42 Q70,45 72,42" stroke="black" fill="none" strokeWidth="1.5" /></svg></div>
                <div className="floating-shape shape-2 bottom-[15%] right-[30%] w-24 h-24"><svg viewBox="0 0 100 100"><path d="M10,40 L50,10 L90,40 L90,90 L10,90 Z" fill="#f8a595" /><circle cx="45" cy="60" r="2" fill="black" /><circle cx="55" cy="60" r="2" fill="black" /><path d="M47,68 Q50,71 53,68" stroke="black" fill="none" strokeWidth="1.5" /></svg></div>
                <div className="floating-shape shape-3 top-[60%] left-[10%] w-40 h-40"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#add8f7" stroke="#add8f7" strokeDasharray="2,2" /><circle cx="55" cy="45" r="2.5" fill="black" /><circle cx="75" cy="45" r="2.5" fill="black" /><path d="M62,55 Q65,60 68,55" stroke="black" fill="none" strokeWidth="2" /></svg></div>
                <div className="floating-shape shape-4 top-[10%] right-[40%] w-16 h-16"><svg viewBox="0 0 100 100"><path d="M50 0 L61 39 L100 50 L61 61 L50 100 L39 61 L0 50 L39 39 Z" fill="#f88d75" /></svg></div>
                <div className="floating-shape shape-5 top-[25%] left-[15%] w-8 h-8"><svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="5" fill="#fce883" /></svg></div>
                <div className="floating-shape shape-1 bottom-[40%] right-[10%] w-32 h-32"><svg viewBox="0 0 100 100"><path d="M50,5 L55,15 L65,10 L68,20 L78,15 L78,25 L88,25 L85,35 L95,38 L90,48 L100,53 L90,58 L95,68 L85,71 L88,81 L78,81 L78,91 L68,86 L65,96 L55,91 L50,100 L45,91 L35,96 L32,86 L22,91 L22,81 L12,81 L15,71 L5,68 L10,58 L0,53 L10,48 L5,38 L15,35 L12,25 L22,25 L22,15 L32,20 L35,10 L45,15 Z" fill="#ffef92" /><circle cx="45" cy="50" r="2" fill="black" /><circle cx="55" cy="50" r="2" fill="black" /><path d="M48,58 Q50,61 52,58" stroke="black" fill="none" strokeWidth="1.5" /></svg></div>
                <div className="floating-shape shape-3 bottom-[5%] left-[35%] w-28 h-28 opacity-60"><svg viewBox="0 0 100 100"><path d="M20,80 A40,40 0 1,1 80,80" fill="none" stroke="#90c9a7" strokeWidth="15" strokeLinecap="round" /></svg></div>

                {/* Blur Blobs */}
                <div className="absolute top-20 right-20 w-64 h-64 bg-[#ffef92] rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
                <div className="absolute bottom-20 left-20 w-80 h-80 bg-[#add8f7] rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
            </div>

            <div className={`w-full max-w-md p-8 md:p-10 rounded-[3rem] shadow-2xl relative z-10 border-4 bg-clip-padding backdrop-filter backdrop-blur-xl bg-opacity-90 ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-white/50'}`}>

                {success ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
                        <div className="w-20 h-20 bg-[#96C68E] rounded-full mx-auto mb-6 flex items-center justify-center text-white shadow-lg animation-bounce-slow">
                            <Check size={40} strokeWidth={3} />
                        </div>
                        <h2 className={`text-3xl font-black mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>เย้! เปลี่ยนสำเร็จ</h2>
                        <p className={darkMode ? 'text-slate-400' : 'text-slate-500'}>รหัสผ่านใหม่ของคุณพร้อมใช้งานแล้ว</p>
                        <button
                            onClick={() => {
                                // Clear URL params and go back to login
                                window.history.replaceState({}, document.title, window.location.pathname);
                                onBackToLogin();
                            }}
                            className="w-full bg-[#96C68E] text-white py-4 rounded-3xl font-black text-lg hover:bg-[#85b57d] hover:-translate-y-1 transition-all shadow-xl active:scale-95 mt-6 border-b-4 border-[#7aa874] active:border-b-0 active:translate-y-1"
                        >
                            เข้าสู่ระบบด้วยรหัสใหม่
                        </button>
                    </div>
                ) : error ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
                        <div className="w-20 h-20 bg-red-100 rounded-full mx-auto mb-6 flex items-center justify-center text-red-500 shadow-lg">
                            <AlertCircle size={40} strokeWidth={3} />
                        </div>
                        <h2 className={`text-2xl font-black mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>เกิดข้อผิดพลาด</h2>
                        <p className={darkMode ? 'text-slate-400' : 'text-slate-500'}>{error}</p>
                        <button
                            onClick={onBackToLogin}
                            className="w-full bg-slate-900 text-white py-4 rounded-3xl font-black text-lg hover:bg-slate-800 hover:-translate-y-1 transition-all shadow-xl active:scale-95 mt-6"
                        >
                            กลับไปหน้าล็อกอิน
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-[#ffef92] rounded-full mx-auto mb-4 flex items-center justify-center text-[#d1b000]">
                                <Lock size={32} />
                            </div>
                            <h2 className={`text-2xl font-black mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>ตั้งรหัสผ่านใหม่</h2>
                            <p className={darkMode ? 'text-slate-400' : 'text-slate-500 text-sm'}>ระบุรหัสผ่านใหม่ที่คุณต้องการใช้งาน</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className={`block text-sm font-bold mb-2 pl-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>รหัสผ่านใหม่</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className={`w-full px-6 py-4 rounded-3xl border-2 border-transparent focus:border-[#BEE1FF] outline-none transition-all font-bold placeholder:text-slate-300 focus:shadow-[0_0_0_4px_rgba(190,225,255,0.3)] ${darkMode ? 'bg-slate-800 text-slate-100' : 'bg-[#f4f7f5] text-slate-700'}`}
                                        required
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#96C68E]">
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className={`block text-sm font-bold mb-2 pl-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>ยืนยันรหัสผ่านใหม่</label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className={`w-full px-6 py-4 rounded-3xl border-2 border-transparent focus:border-[#BEE1FF] outline-none transition-all font-bold placeholder:text-slate-300 focus:shadow-[0_0_0_4px_rgba(190,225,255,0.3)] ${darkMode ? 'bg-slate-800 text-slate-100' : 'bg-[#f4f7f5] text-slate-700'}`}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#96C68E] text-white py-4 rounded-3xl font-black text-lg hover:bg-[#85b57d] hover:-translate-y-1 transition-all shadow-xl active:scale-95 disabled:opacity-70 mt-4 border-b-4 border-[#7aa874] active:border-b-0 active:translate-y-1"
                            >
                                {loading ? 'กำลังบันทึก...' : 'เปลี่ยนรหัสผ่าน'}
                            </button>

                            <button
                                type="button"
                                onClick={onBackToLogin}
                                className="w-full text-slate-400 hover:text-slate-600 font-bold transition-colors flex items-center justify-center gap-2 py-2"
                            >
                                <ChevronLeft size={18} />
                                ยกเลิกและกลับไปหน้าล็อกอิน
                            </button>
                        </form>
                    </div>
                )}
            </div>

            <div className="absolute bottom-6 w-full text-center text-slate-400 text-[10px] tracking-widest uppercase font-bold opacity-60 z-20">© 2026 Schooly Scoot Inc.</div>
        </div>
    );
};

export default ResetPasswordPage;
