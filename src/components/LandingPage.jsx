import React, { useEffect, useRef, useState } from 'react';
import { User, Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { loginUser, resetPassword, setAuthPersistence, registerUser, authenticateWithGoogle, completeGoogleRegistration } from '../services/authService';
import logo_Schooly from '../assets/logo_Schooly.png';

const LandingPage = ({ onGetStarted }) => {
    const loginSectionRef = useRef(null);
    const teamSectionRef = useRef(null);

    const handleScrollToTeam = () => {
        teamSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Auth State
    const [isFlipped, setIsFlipped] = useState(false); // Controls the flip
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedRole, setSelectedRole] = useState('student');

    // Login Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    // Register Form State
    const [regFormData, setRegFormData] = useState({ fullName: '', email: '', password: '' });

    // Google Modal State
    const [showGoogleModal, setShowGoogleModal] = useState(false);
    const [googleUser, setGoogleUser] = useState(null);
    const [googleFullName, setGoogleFullName] = useState('');

    const handleScrollToLogin = () => {
        loginSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // --- LOGIN LOGIC ---
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await setAuthPersistence(rememberMe);
            await loginUser(email, password);
            // Auth listener in App.jsx handles redirect
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('อีเมล/รหัสผ่านไม่ถูกต้อง หรือคุณอาจสมัครด้วย Google?');
            } else {
                setError('เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่');
            }
        } finally {
            setLoading(false);
        }
    };

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
            setError('ไม่สามารถส่งอีเมลรีเซ็ตรหัสผ่านได้');
        }
    };

    // --- REGISTER LOGIC ---
    const handleRegChange = (e) => {
        setRegFormData({ ...regFormData, [e.target.name]: e.target.value });
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await registerUser(regFormData.email, regFormData.password, {
                ...regFormData,
                role: selectedRole
            });
            // Success will trigger auth change
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') setError('อีเมลนี้ถูกใช้งานแล้ว');
            else if (err.code === 'auth/weak-password') setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
            else setError('การลงทะเบียนล้มเหลว');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        if (loading) return; // Prevent double click
        setError('');
        setLoading(true); // Set loading immediately
        try {
            const { user, isNewUser } = await authenticateWithGoogle();
            if (isNewUser) {
                setGoogleUser(user);
                setGoogleFullName(user.displayName || '');
                setShowGoogleModal(true);
            }
            // If existing user, auth listener handles it
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/cancelled-popup-request') {
                // Ignore popup cancellation (user closed it)
                return;
            }
            setError('เกิดข้อผิดพลาดกับ Google Login');
        } finally {
            // Only unset loading if NOT showing modal (waiting for registration) 
            // and NOT successful login (which redirects). 
            // Actually, redirects happen via listener, so we might want to keep loading?
            // But if specific error, we must turn off loading.
            if (!showGoogleModal) setLoading(false);
        }
    };

    const confirmGoogleRegistration = async () => {
        if (!googleUser) return;
        setLoading(true);
        try {
            await completeGoogleRegistration(googleUser, selectedRole, googleFullName);
            setShowGoogleModal(false);
        } catch (err) {
            console.error(err);
            setError('บันทึกข้อมูลไม่สำเร็จ');
        } finally {
            setLoading(false);
        }
    };

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

    return (
        <div className="w-full relative bg-[#f4f7f5] overflow-x-hidden font-sans scroll-smooth">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');
                .font-kanit { font-family: 'Kanit', sans-serif; }
                
                /* Animations */
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
                
                .login-btn { 
                    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); 
                }
                .login-btn:hover { 
                    transform: scale(1.1) rotate(2deg); 
                }
            `}</style>

            {/* Background Shapes (Fixed) */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="floating-shape shape-1 top-[15%] left-[20%] w-32 h-16"><svg viewBox="0 0 100 50"><path d="M0,50 A50,50 0 0,1 100,50 Z" fill="#90c9a7" /><circle cx="70" cy="35" r="2" fill="black" /><path d="M68,42 Q70,45 72,42" stroke="black" fill="none" strokeWidth="1.5" /></svg></div>
                <div className="floating-shape shape-2 bottom-[15%] right-[30%] w-24 h-24"><svg viewBox="0 0 100 100"><path d="M10,40 L50,10 L90,40 L90,90 L10,90 Z" fill="#f8a595" /><circle cx="45" cy="60" r="2" fill="black" /><circle cx="55" cy="60" r="2" fill="black" /><path d="M47,68 Q50,71 53,68" stroke="black" fill="none" strokeWidth="1.5" /></svg></div>
                <div className="floating-shape shape-3 top-[60%] left-[10%] w-40 h-40"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#add8f7" stroke="#add8f7" strokeDasharray="2,2" /><circle cx="55" cy="45" r="2.5" fill="black" /><circle cx="75" cy="45" r="2.5" fill="black" /><path d="M62,55 Q65,60 68,55" stroke="black" fill="none" strokeWidth="2" /></svg></div>
                <div className="floating-shape shape-4 top-[10%] right-[40%] w-16 h-16"><svg viewBox="0 0 100 100"><path d="M50 0 L61 39 L100 50 L61 61 L50 100 L39 61 L0 50 L39 39 Z" fill="#f88d75" /></svg></div>
                <div className="floating-shape shape-5 top-[25%] left-[15%] w-8 h-8"><svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="5" fill="#fce883" /></svg></div>
                <div className="floating-shape shape-1 bottom-[40%] right-[10%] w-32 h-32"><svg viewBox="0 0 100 100"><path d="M50,5 L55,15 L65,10 L68,20 L78,15 L78,25 L88,25 L85,35 L95,38 L90,48 L100,53 L90,58 L95,68 L85,71 L88,81 L78,81 L78,91 L68,86 L65,96 L55,91 L50,100 L45,91 L35,96 L32,86 L22,91 L22,81 L12,81 L15,71 L5,68 L10,58 L0,53 L10,48 L5,38 L15,35 L12,25 L22,25 L22,15 L32,20 L35,10 L45,15 Z" fill="#ffef92" /><circle cx="45" cy="50" r="2" fill="black" /><circle cx="55" cy="50" r="2" fill="black" /><path d="M48,58 Q50,61 52,58" stroke="black" fill="none" strokeWidth="1.5" /></svg></div>
                <div className="floating-shape shape-3 bottom-[5%] left-[35%] w-28 h-28 opacity-60"><svg viewBox="0 0 100 100"><path d="M20,80 A40,40 0 1,1 80,80" fill="none" stroke="#90c9a7" strokeWidth="15" strokeLinecap="round" /></svg></div>
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 w-full p-8 flex justify-between items-center z-50 font-kanit">
                <div className="text-2xl font-black tracking-tight text-slate-800">schooly<span className="text-[#96C68E]">.</span></div>
                <div className="hidden md:flex space-x-8 text-sm font-bold text-slate-500">
                    {/* <a href="#" className="hover:text-[#96C68E] transition-colors">บริการ</a> */}
                    <a onClick={handleScrollToTeam} className="hover:text-[#96C68E] transition-colors cursor-pointer">เกี่ยวกับเรา</a>
                    <a href="#" className="hover:text-[#96C68E] transition-colors">ติดต่อ</a>
                    <div className="flex space-x-2 pl-4 border-l border-slate-200">
                        <span className="font-black text-slate-800 cursor-pointer">TH</span>
                        <span className="text-slate-300 hover:text-slate-500 cursor-pointer transition-colors">EN</span>
                    </div>
                </div>
            </nav>

            {/* HERO SECTION */}
            <div className="h-screen w-full flex flex-col items-center justify-center relative z-10 px-4 font-kanit">
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-800 mb-6 drop-shadow-sm text-center">
                    Schooly Scoot
                </h1>
                <p className="text-xl md:text-3xl text-slate-500 font-medium mb-12 text-center max-w-2xl">
                    ระบบจัดการโรงเรียนที่<span className="text-[#96C68E] underline decoration-wavy decoration-2 underline-offset-4 px-1">สนุก</span>และ<span className="text-[#FF917B] underline decoration-wavy decoration-2 underline-offset-4 px-1">ง่าย</span>ที่สุด
                </p>
                <button onClick={handleScrollToLogin} className="login-btn group relative inline-flex items-center justify-center cursor-pointer">
                    <div className="w-32 h-32 md:w-36 md:h-36 bg-slate-900 rounded-full flex flex-col items-center justify-center text-white shadow-2xl relative overflow-hidden group-hover:bg-[#96C68E] transition-colors duration-500">
                        <span className="text-xl font-bold mb-1 group-hover:-translate-y-1 transition-transform relative z-10">Let's go!</span>
                        <ArrowRight className="animate-bounce mt-1 relative z-10" size={24} />
                    </div>
                </button>
            </div>

            {/* AUTH SECTION */}
            <div ref={loginSectionRef} className="min-h-screen w-full flex flex-col items-center justify-center relative z-10 px-4 font-kanit py-20 pb-32 overflow-hidden">

                {/* Background Blobs (Pastel) */}
                <div className="absolute top-20 right-20 w-64 h-64 bg-[#ffef92] rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
                <div className="absolute bottom-20 left-20 w-80 h-80 bg-[#add8f7] rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>

                {/* Google Modal Overlay */}
                {showGoogleModal && (
                    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-[40px] p-10 max-w-sm w-full shadow-2xl relative overflow-hidden border border-gray-100">
                            {/* Decoration */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#90c9a7] rounded-full opacity-20"></div>

                            <div className="text-center mb-8 relative z-10">
                                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">👋</div>
                                <h3 className="text-2xl font-bold text-gray-900">ยินดีต้อนรับ!</h3>
                                <p className="text-gray-500 text-sm mt-1">กรุณาระบุข้อมูลเพิ่มเติมอีกนิดเดียว</p>
                            </div>

                            <div className="space-y-6 relative z-10">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 pl-2">ชื่อของคุณ</label>
                                    <input
                                        value={googleFullName}
                                        onChange={(e) => setGoogleFullName(e.target.value)}
                                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-black font-medium"
                                        placeholder="ระบุชื่อเรียกในระบบ"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3 pl-2">คุณต้องการใช้ในฐานะอะไร?</label>
                                    <div className="grid grid-cols-1 gap-3">
                                        <label className="relative cursor-pointer">
                                            <input
                                                type="radio"
                                                name="google-role"
                                                className="sr-only"
                                                checked={selectedRole === 'teacher'}
                                                onChange={() => setSelectedRole('teacher')}
                                            />
                                            <div className={`border-2 rounded-2xl py-3 text-center font-bold transition-all ${selectedRole === 'teacher' ? 'bg-black text-white border-black' : 'border-gray-100 text-gray-500 hover:border-gray-300'}`}>
                                                ครูผู้สอน
                                            </div>
                                        </label>
                                        <label className="relative cursor-pointer">
                                            <input
                                                type="radio"
                                                name="google-role"
                                                className="sr-only"
                                                checked={selectedRole === 'student'}
                                                onChange={() => setSelectedRole('student')}
                                            />
                                            <div className={`border-2 rounded-2xl py-3 text-center font-bold transition-all ${selectedRole === 'student' ? 'bg-black text-white border-black' : 'border-gray-100 text-gray-500 hover:border-gray-300'}`}>
                                                นักเรียน
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                <button onClick={confirmGoogleRegistration} disabled={loading} className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:bg-gray-800 shadow-lg disabled:opacity-70 transition-all active:scale-95">
                                    {loading ? 'กำลังบันทึก...' : 'เริ่มต้นใช้งาน'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB-BASED AUTH SECTION */}
                <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-[3rem] shadow-2xl relative z-10 border-4 border-white/50 bg-clip-padding backdrop-filter backdrop-blur-xl bg-opacity-90">
                    {/* Tab Switcher */}
                    <div className="flex justify-center mb-8 space-x-8">
                        <button
                            onClick={() => { setIsFlipped(false); setError(''); }}
                            className={`text-xl font-black pb-2 transition-all duration-300 ${!isFlipped ? 'border-b-4 border-[#96C68E] text-[#96C68E] scale-105' : 'border-b-4 border-transparent text-gray-300 hover:text-[#96C68E]/50'}`}
                        >
                            เข้าสู่ระบบ
                        </button>
                        <button
                            onClick={() => { setIsFlipped(true); setError(''); }}
                            className={`text-xl font-black pb-2 transition-all duration-300 ${isFlipped ? 'border-b-4 border-[#FF917B] text-[#FF917B] scale-105' : 'border-b-4 border-transparent text-gray-300 hover:text-[#FF917B]/50'}`}
                        >
                            ลงทะเบียน
                        </button>
                    </div>

                    {/* LOGIN FORM */}
                    {!isFlipped ? (
                        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl flex items-center text-xs font-bold"><AlertCircle size={16} className="mr-2 flex-shrink-0" />{error}</div>}
                            <form onSubmit={handleLoginSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 pl-2">อีเมล</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="example@school.com"
                                        className="w-full px-6 py-4 rounded-3xl bg-[#f4f7f5] border-2 border-transparent focus:border-[#BEE1FF] focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 focus:shadow-[0_0_0_4px_rgba(190,225,255,0.3)]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 pl-2">รหัสผ่าน</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full px-6 py-4 rounded-3xl bg-[#f4f7f5] border-2 border-transparent focus:border-[#BEE1FF] focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 focus:shadow-[0_0_0_4px_rgba(190,225,255,0.3)]"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#96C68E] transition-colors">
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center px-2">
                                    <label className="flex items-center text-gray-500 text-sm cursor-pointer select-none hover:text-[#96C68E] font-bold transition-colors">
                                        <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-5 h-5 rounded-lg border-2 border-slate-300 text-[#96C68E] focus:ring-[#96C68E] mr-2 accent-[#96C68E] transition-transform active:scale-90" />
                                        จดจำฉัน
                                    </label>
                                    <button type="button" onClick={handleForgotPassword} className="text-sm text-gray-400 hover:text-[#FF917B] underline underline-offset-4 font-bold transition-colors">ลืมรหัสผ่าน?</button>
                                </div>
                                <button type="submit" disabled={loading} className="w-full bg-[#96C68E] text-white py-4 rounded-3xl font-black text-lg hover:bg-[#85b57d] hover:-translate-y-1 transition-all shadow-[0_10px_20px_-10px_rgba(150,198,142,0.5)] active:scale-95 disabled:opacity-70 border-b-4 border-[#7aa874] active:border-b-0 active:translate-y-1">
                                    {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                                </button>
                            </form>
                        </div>
                    ) : (
                        /* REGISTER FORM */
                        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl flex items-center text-xs font-bold"><AlertCircle size={16} className="mr-2 flex-shrink-0" />{error}</div>}
                            <form onSubmit={handleRegisterSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 pl-2">ชื่อ-นามสกุล</label>
                                    <input
                                        name="fullName"
                                        onChange={handleRegChange}
                                        placeholder="สมชาย สกู๊ต"
                                        className="w-full px-6 py-4 rounded-3xl bg-[#f4f7f5] border-2 border-transparent focus:border-[#FF917B] focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 focus:shadow-[0_0_0_4px_rgba(255,145,123,0.3)]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 pl-2">อีเมล</label>
                                    <input
                                        type="email"
                                        name="email"
                                        onChange={handleRegChange}
                                        placeholder="yourname@email.com"
                                        className="w-full px-6 py-4 rounded-3xl bg-[#f4f7f5] border-2 border-transparent focus:border-[#FF917B] focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 focus:shadow-[0_0_0_4px_rgba(255,145,123,0.3)]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 pl-2">รหัสผ่าน</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            onChange={handleRegChange}
                                            placeholder="ตั้งรหัสผ่าน 8 ตัวขึ้นไป"
                                            className="w-full px-6 py-4 rounded-3xl bg-[#f4f7f5] border-2 border-transparent focus:border-[#FF917B] focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 focus:shadow-[0_0_0_4px_rgba(255,145,123,0.3)]"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF917B] transition-colors">
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3 pl-2">คุณคือใคร?</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className="relative cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="role"
                                                className="sr-only"
                                                checked={selectedRole === 'teacher'}
                                                onChange={() => setSelectedRole('teacher')}
                                            />
                                            <div className={`border-2 rounded-3xl py-3 text-center font-black transition-all duration-300 ${selectedRole === 'teacher' ? 'bg-[#FFE787] text-white border-[#FFE787] shadow-lg scale-105' : 'border-gray-100 text-gray-400 group-hover:border-[#FFE787] group-hover:text-[#FFE787]'}`}>
                                                คุณครู
                                            </div>
                                        </label>
                                        <label className="relative cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="role"
                                                className="sr-only"
                                                checked={selectedRole === 'student'}
                                                onChange={() => setSelectedRole('student')}
                                            />
                                            <div className={`border-2 rounded-3xl py-3 text-center font-black transition-all duration-300 ${selectedRole === 'student' ? 'bg-[#BEE1FF] text-white border-[#BEE1FF] shadow-lg scale-105' : 'border-gray-100 text-gray-400 group-hover:border-[#BEE1FF] group-hover:text-[#BEE1FF]'}`}>
                                                นักเรียน
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                <button type="submit" disabled={loading} className="w-full bg-[#FF917B] text-white py-4 rounded-3xl font-black text-lg hover:bg-[#ff7e65] hover:-translate-y-1 transition-all shadow-[0_10px_20px_-10px_rgba(255,145,123,0.5)] active:scale-95 disabled:opacity-70 border-b-4 border-[#e06c57] active:border-b-0 active:translate-y-1 mt-2">
                                    {loading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                        <div className="relative flex justify-center text-xs font-black"><span className="px-4 bg-white text-gray-300">OR</span></div>
                    </div>

                    {/* Google Login Button */}
                    <button onClick={handleGoogleLogin} className="w-full border-2 border-gray-100 flex items-center justify-center space-x-3 py-3.5 rounded-3xl font-bold hover:bg-[#FFE787]/20 hover:border-[#FFE787] transition-all active:scale-95 group">
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6 group-hover:scale-110 transition-transform" alt="Google" />
                        <span className="text-gray-600 group-hover:text-gray-800">เข้าสู่ระบบด้วย Google</span>
                    </button>
                </div>

                {/* TEAM SECTION */}
                <div ref={teamSectionRef} className="w-full py-24 relative z-10 bg-white/50 backdrop-blur-sm">
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="text-center mb-16 relative">
                            <h2 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-4">
                                ทีมผู้พัฒนา
                            </h2>
                            <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto">
                                พวกเราคือทีมเล็กๆ ที่มีความฝันยิ่งใหญ่ อยากให้การเรียนการสอนเป็นเรื่องสนุกสำหรับทุกคน!
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                            {/* Member 1 */}
                            <div className="group relative">
                                <div className="absolute inset-0 bg-[#96C68E] rounded-[2rem] rotate-3 group-hover:rotate-6 transition-transform opacity-20"></div>
                                <div className="bg-white border-4 border-white shadow-xl rounded-[2rem] p-6 text-center transform group-hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
                                    <div className="w-32 h-32 mx-auto bg-[#96C68E]/20 rounded-full mb-4 flex items-center justify-center text-5xl relative group-hover:scale-110 transition-transform">

                                    </div>
                                    <h3 className="text-xl font-black text-slate-800 mb-1">Pimvichada</h3>
                                    <p className="text-[#96C68E] font-bold text-sm mb-4">6504780</p>
                                    <p className="text-slate-500 text-sm leading-relaxed mb-6">"นักศึกษาชั้นปีที่ 4 "</p>

                                    <div className="flex justify-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">

                                        <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#96C68E] hover:text-white transition-colors cursor-pointer text-xs">IG</span>
                                    </div>
                                </div>
                            </div>

                            {/* Member 2 */}
                            <div className="group relative mt-8 md:mt-0">
                                <div className="absolute inset-0 bg-[#FF917B] rounded-[2rem] -rotate-2 group-hover:-rotate-6 transition-transform opacity-20"></div>
                                <div className="bg-white border-4 border-white shadow-xl rounded-[2rem] p-6 text-center transform group-hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
                                    <div className="w-32 h-32 mx-auto bg-[#FF917B]/20 rounded-full mb-4 flex items-center justify-center text-5xl relative group-hover:scale-110 transition-transform">
                                        😎

                                    </div>
                                    <h3 className="text-xl font-black text-slate-800 mb-1">Lalitwadee</h3>
                                    <p className="text-[#FF917B] font-bold text-sm mb-4">6504551</p>
                                    <p className="text-slate-500 text-sm leading-relaxed mb-6">"นักศึกษาชั้นปีที่ 4"</p>
                                    <div className="flex justify-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                                        <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#FF917B] hover:text-white transition-colors cursor-pointer text-xs">IG</span>
                                    </div>
                                </div>
                            </div>

                            {/* Member 3 */}
                            <div className="group relative">
                                <div className="absolute inset-0 bg-[#BEE1FF] rounded-[2rem] rotate-2 group-hover:rotate-6 transition-transform opacity-20"></div>
                                <div className="bg-white border-4 border-white shadow-xl rounded-[2rem] p-6 text-center transform group-hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
                                    <div className="w-32 h-32 mx-auto bg-[#BEE1FF]/20 rounded-full mb-4 flex items-center justify-center text-5xl relative group-hover:scale-110 transition-transform">
                                        🤓
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800 mb-1">Onphairin</h3>
                                    <p className="text-[#BEE1FF] font-bold text-sm mb-4">6504552</p>
                                    <p className="text-slate-500 text-sm leading-relaxed mb-6">"นักศึกษาชั้นปีที่ 4"</p>
                                    <div className="flex justify-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                                        <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#BEE1FF] hover:text-white transition-colors cursor-pointer text-xs">IG</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-6 w-full text-center text-slate-400 text-[10px] tracking-widest uppercase font-bold opacity-60 z-20">© 2026 Schooly Scoot Inc. All Rights Reserved</div>
        </div>
    );
};

export default LandingPage;
