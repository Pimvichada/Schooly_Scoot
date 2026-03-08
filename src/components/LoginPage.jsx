import React, { useEffect, useRef, useState } from 'react';
import { User, Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle, Moon, Sun, Instagram, Check, ChevronLeft } from 'lucide-react';
import { loginUser, resetPassword, setAuthPersistence, registerUser, authenticateWithGoogle, completeGoogleRegistration, checkSignInMethods } from '../services/authService';
import logo_Schooly from '../assets/logo_Schooly.png';
import Lalitwadee from '../assets/member/m1.jpg';
import Pim from '../assets/member/m2.jpg';
import fink from '../assets/member/m3.jpg';

const LoginPage = ({ onGetStarted, darkMode, setDarkMode }) => {
    const loginSectionRef = useRef(null);
    const teamSectionRef = useRef(null);
    const authCardRef = useRef(null);
    const [authVisible, setAuthVisible] = useState(false);
    const [teamVisible, setTeamVisible] = useState(false);

    const handleScrollToTeam = () => {
        teamSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Auth State
    const [authMode, setAuthMode] = useState('login'); // 'login', 'register', 'forgot', 'sent'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedRole, setSelectedRole] = useState('student');

    // Login Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    // Register Form State
    const [regFormData, setRegFormData] = useState({ firstName: '', lastName: '', email: '', password: '' });
    const [regNameLimitError, setRegNameLimitError] = useState('');

    // Google Modal State
    const [showGoogleModal, setShowGoogleModal] = useState(false);
    const [googleUser, setGoogleUser] = useState(null);
    const [googleFullName, setGoogleFullName] = useState('');

    // Timer State
    const [resendTimer, setResendTimer] = useState(0);

    useEffect(() => {
        let interval;
        if (authMode === 'sent' && resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [authMode, resendTimer]);

    const handleScrollToLogin = () => {
        loginSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // IntersectionObserver: trigger fade when auth section comes into view
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setAuthVisible(true);
                } else {
                    setAuthVisible(false);
                }
            },
            { threshold: 0.25 }
        );
        if (loginSectionRef.current) observer.observe(loginSectionRef.current);
        return () => observer.disconnect();
    }, []);

    // IntersectionObserver: trigger Team section animations
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTeamVisible(true);
                } else {
                    setTeamVisible(false);
                }
            },
            { threshold: 0.2 }
        );
        if (teamSectionRef.current) observer.observe(teamSectionRef.current);
        return () => observer.disconnect();
    }, []);

    // --- COPY EMAIL LOGIC ---
    const [copiedId, setCopiedId] = useState(null);

    const handleCopyEmail = (email, id) => {
        navigator.clipboard.writeText(email);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
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

    const handleForgotPasswordSubmit = async (e) => {
        if (e) e.preventDefault();
        setError('');
        if (!email) {
            setError('กรุณากรอกอีเมลเพื่อรีเซ็ตรหัสผ่าน');
            return;
        }
        setLoading(true);
        try {
            // Check sign-in methods
            const methods = await checkSignInMethods(email);
            if (methods && methods.includes('google.com')) {
                setError('อีเมลนี้เชื่อมต่อกับ Google กรุณาล็อกอินผ่านปุ่ม Google แทนการรีเซ็ตรหัสผ่าน');
                setLoading(false);
                return;
            }

            await resetPassword(email);
            setAuthMode('sent');
            setResendTimer(60); // 60 seconds cooldown
            setError('');
        } catch (err) {
            console.error(err);
            setError('ไม่พบผู้ใช้งานนี้ในระบบ หรืออาจกรอกอีเมลไม่ถูกต้อง');
        } finally {
            setLoading(false);
        }
    };

    const handleResendEmail = async () => {
        if (resendTimer > 0) return;
        setLoading(true);
        setError('');
        try {
            await resetPassword(email);
            setResendTimer(60);
        } catch (err) {
            console.error(err);
            setError('ไม่สามารถส่งอีเมลได้ กรุณาลองใหม่');
        } finally {
            setLoading(false);
        }
    };

    // --- REGISTER LOGIC ---
    const handleRegChange = (e) => {
        const { name, value } = e.target;

        setRegFormData(prev => {
            if (name === 'firstName' || name === 'lastName') {
                if (value.length >= 20) {
                    setRegNameLimitError('จำกัดชื่อและนามสกุลสูงสุดช่องละ 20 ตัวอักษร');
                } else {
                    const otherFieldName = name === 'firstName' ? 'lastName' : 'firstName';
                    if (prev[otherFieldName].length < 20) {
                        setRegNameLimitError('');
                    }
                }
            }
            return { ...prev, [name]: value };
        });
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const validatePassword = (pass) => {
            const hasUpper = /[A-Z]/.test(pass);
            const hasLower = /[a-z]/.test(pass);
            const hasNumber = /[0-9]/.test(pass);
            const hasMinLen = pass.length >= 6;

            if (!hasMinLen) return 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
            if (!hasUpper || !hasLower || !hasNumber) return 'รหัสผ่านต้องประกอบด้วยตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก และตัวเลข';
            return null;
        };

        if (!regFormData.firstName || !regFormData.lastName || !regFormData.email || !regFormData.password) {
            setError('กรุณากรอกข้อมูลให้ครบถ้วน');
            setLoading(false);
            return;
        }

        const passError = validatePassword(regFormData.password);
        if (passError) {
            setError(passError);
            setLoading(false);
            return;
        }

        try {
            const combinedFullName = `${regFormData.firstName} ${regFormData.lastName}`.trim();
            await registerUser(regFormData.email, regFormData.password, {
                ...regFormData,
                fullName: combinedFullName,
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
        <div className={`w-full relative overflow-x-hidden font-sans scroll-smooth transition-colors duration-500 ${darkMode ? 'bg-slate-950' : 'bg-[#f4f7f5]'}`}>
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
                
                @keyframes shake {
                  0%, 100% { transform: translateX(0); }
                  25% { transform: translateX(-5px); }
                  75% { transform: translateX(5px); }
                }
                .animate-shake { animation: shake 0.5s ease-in-out; }
                
                @keyframes bounce-slow {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-10px); }
                }
                .animation-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
                
                .login-btn { 
                    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); 
                }
                .login-btn:hover { 
                    transform: scale(1.1) rotate(2deg); 
                }

                /* ===== SCROLL REVEAL ===== */
                @keyframes auth-reveal {
                    0% { opacity: 0; transform: translateY(40px) scale(0.97); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes auth-hide {
                    0% { opacity: 1; transform: translateY(0) scale(1); }
                    100% { opacity: 0; transform: translateY(-80px) scale(0.9); }
                }
                @keyframes blob-reveal {
                    0% { opacity: 0; transform: scale(0.8); }
                    100% { opacity: 0.4; transform: scale(1); }
                }
                @keyframes member-from-left {
                    0% { opacity: 0; transform: translateX(-60px) rotate(-3deg); }
                    100% { opacity: 1; transform: translateX(0) rotate(0deg); }
                }
                @keyframes member-from-right {
                    0% { opacity: 0; transform: translateX(60px) rotate(3deg); }
                    100% { opacity: 1; transform: translateX(0) rotate(0deg); }
                }
                @keyframes member-from-bottom {
                    0% { opacity: 0; transform: translateY(60px) scale(0.9); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes team-title-reveal {
                    0% { opacity: 0; transform: translateY(-20px); letter-spacing: 0.3em; }
                    100% { opacity: 1; transform: translateY(0); letter-spacing: normal; }
                }
                .auth-card-reveal {
                    animation: auth-reveal 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
                }
                .auth-card-hide {
                    animation: auth-hide 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
                }
                .blob-reveal-1 {
                    animation: blob-reveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both;
                }
                .blob-reveal-2 {
                    animation: blob-reveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.25s both;
                }
                .member-left {
                    animation: member-from-left 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both;
                }
                .member-right {
                    animation: member-from-right 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both;
                }
                .member-center {
                    animation: member-from-bottom 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.5s both;
                }
                .team-title-anim {
                    animation: team-title-reveal 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
                }
                /* ===== HERO ENTRANCE ANIMATIONS ===== */
                @keyframes hero-title {
                    0% { opacity: 0; transform: translateY(40px) scale(0.97); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes hero-fade-up {
                    0% { opacity: 0; transform: translateY(30px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes nav-drop {
                    0% { opacity: 0; transform: translateY(-20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes hero-btn {
                    0% { opacity: 0; transform: scale(0.7); }
                    70% { transform: scale(1.05); }
                    100% { opacity: 1; transform: scale(1); }
                }
                @keyframes pulse-ring {
                    0% { transform: scale(1); opacity: 0.6; }
                    100% { transform: scale(1.5); opacity: 0; }
                }
                @keyframes text-shimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                
                .hero-title-anim {
                    animation: hero-title 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
                }
                .hero-sub-anim {
                    animation: hero-fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.35s both;
                }
                .hero-btn-anim {
                    animation: hero-btn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.6s both;
                }
                .nav-anim {
                    animation: nav-drop 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both;
                }
                .pulse-ring {
                    animation: pulse-ring 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                .gradient-text {
                    background: linear-gradient(135deg, #1e293b 0%, #475569 40%, #1e293b 60%, #475569 100%);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: text-shimmer 4s linear 1s infinite;
                }
                .gradient-text-dark {
                    background: linear-gradient(135deg, #f8fafc 0%, #94a3b8 40%, #f8fafc 60%, #94a3b8 100%);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: text-shimmer 4s linear 1s infinite;
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
            <nav className={`fixed top-0 w-full p-8 flex justify-between items-center z-50 font-kanit transition-colors duration-500 nav-anim ${darkMode ? 'bg-slate-900/80 backdrop-blur-md border-b border-slate-800' : ''}`}>
                <div className={`text-2xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>Schooly Scoot<span className="text-[#96C68E]">.</span></div>
                <div className={`hidden md:flex items-center space-x-8 text-sm font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    <a onClick={handleScrollToTeam} className="hover:text-[#96C68E] transition-colors cursor-pointer">เกี่ยวกับเรา</a>
                    <div className="flex items-center space-x-4 pl-4 border-l border-slate-200">
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className={`p-2 rounded-full transition-all duration-300 ${darkMode ? 'bg-slate-800 text-[#FF917B] hover:bg-slate-700' : 'bg-white text-slate-400 hover:text-[#FF917B] hover:bg-slate-50 shadow-sm'}`}
                        >
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <div className="flex space-x-2">
                            <span className={`font-black cursor-pointer ${darkMode ? 'text-white' : 'text-slate-800'}`}>TH</span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* HERO SECTION */}
            <div className="h-screen w-full flex flex-col items-center justify-center relative z-10 px-4 font-kanit">
                {/* Glow behind title */}
                <div className="absolute w-[600px] h-[300px] rounded-full blur-3xl opacity-20 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse, #96C68E 0%, #FF917B 50%, transparent 80%)' }}
                />

                <h1 className={`text-6xl md:text-8xl font-black tracking-tighter mb-6 drop-shadow-sm text-center hero-title-anim ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                    Schooly Scoot
                </h1>
                <p className={`text-xl md:text-3xl font-medium mb-12 text-center max-w-2xl hero-sub-anim ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    ระบบจัดการโรงเรียนที่<span className="text-[#96C68E] underline decoration-wavy decoration-2 underline-offset-4 px-1">สนุก</span>และ<span className="text-[#FF917B] underline decoration-wavy decoration-2 underline-offset-4 px-1">ง่าย</span>ที่สุด
                </p>
                <div className="hero-btn-anim relative inline-flex items-center justify-center">
                    {/* Pulsing rings */}
                    <div className="absolute w-36 h-36 md:w-40 md:h-40 rounded-full bg-[#96C68E]/20 pulse-ring" />
                    <div className="absolute w-36 h-36 md:w-40 md:h-40 rounded-full bg-[#96C68E]/10 pulse-ring" style={{ animationDelay: '0.9s' }} />
                    <button onClick={handleScrollToLogin} className="login-btn group relative inline-flex items-center justify-center cursor-pointer">
                        <div className="w-32 h-32 md:w-36 md:h-36 bg-slate-900 rounded-full flex flex-col items-center justify-center text-white shadow-2xl relative overflow-hidden group-hover:bg-[#96C68E] transition-colors duration-500">
                            <span className="text-xl font-bold mb-1 group-hover:-translate-y-1 transition-transform relative z-10">Let's go!</span>
                            <ArrowRight className="animate-bounce mt-1 relative z-10" size={24} />
                        </div>
                    </button>
                </div>
            </div>

            {/* AUTH SECTION */}
            <div ref={loginSectionRef} className="min-h-screen w-full flex flex-col items-center justify-center relative z-10 px-4 font-kanit py-20 pb-32 overflow-hidden">

                {/* Background Blobs (Pastel) */}
                <div className={`absolute top-20 right-20 w-64 h-64 bg-[#ffef92] rounded-full mix-blend-multiply filter blur-3xl animate-blob pointer-events-none ${authVisible ? 'blob-reveal-1' : 'opacity-0'}`}></div>
                <div className={`absolute bottom-20 left-20 w-80 h-80 bg-[#add8f7] rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000 pointer-events-none ${authVisible ? 'blob-reveal-2' : 'opacity-0'}`}></div>

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
                                    <div className="flex gap-4">
                                        <input
                                            value={googleFullName.split(' ')[0] || ''}
                                            onChange={(e) => {
                                                const first = e.target.value.slice(0, 20);
                                                const last = googleFullName.split(' ')[1] || '';
                                                setGoogleFullName(`${first} ${last}`);
                                            }}
                                            maxLength={20}
                                            className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-black font-medium"
                                            placeholder="ชื่อ"
                                        />
                                        <input
                                            value={googleFullName.split(' ')[1] || ''}
                                            onChange={(e) => {
                                                const last = e.target.value.slice(0, 20);
                                                const first = googleFullName.split(' ')[0] || '';
                                                setGoogleFullName(`${first} ${last}`);
                                            }}
                                            maxLength={20}
                                            className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-black font-medium"
                                            placeholder="นามสกุล"
                                        />
                                    </div>
                                    {(googleFullName.split(' ')[0]?.length >= 20 || googleFullName.split(' ')[1]?.length >= 20) && (
                                        <p className="text-red-500 text-[10px] mt-1 ml-2 font-bold animate-in fade-in">จำกัดชื่อและนามสกุลสูงสุดช่องละ 20 ตัวอักษร</p>
                                    )}
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
                <div ref={authCardRef} className={`w-full max-w-md p-8 mb-50 md:p-10 rounded-[3rem] shadow-2xl relative z-10 border-4 bg-clip-padding backdrop-filter backdrop-blur-xl bg-opacity-90 ${authVisible ? 'auth-card-reveal' : 'auth-card-hide'} ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-white/50'}`}>
                    {/* Tab Switcher */}
                    {(authMode === 'login' || authMode === 'register') && (
                        <div className="flex justify-center mb-8 space-x-8">
                            <button
                                onClick={() => { setAuthMode('login'); setError(''); }}
                                className={`text-xl font-black pb-2 transition-all duration-300 ${authMode === 'login' ? 'border-b-4 border-[#96C68E] text-[#96C68E] scale-105' : 'border-b-4 border-transparent text-gray-300 hover:text-[#96C68E]/50'}`}
                            >
                                เข้าสู่ระบบ
                            </button>
                            <button
                                onClick={() => { setAuthMode('register'); setError(''); }}
                                className={`text-xl font-black pb-2 transition-all duration-300 ${authMode === 'register' ? 'border-b-4 border-[#FF917B] text-[#FF917B] scale-105' : 'border-b-4 border-transparent text-gray-300 hover:text-[#FF917B]/50'}`}
                            >
                                ลงทะเบียน
                            </button>
                        </div>
                    )}

                    {/* LOGIN FORM */}
                    {authMode === 'login' ? (
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
                                        className={`w-full px-6 py-4 rounded-3xl border-2 border-transparent focus:border-[#BEE1FF] outline-none transition-all font-bold placeholder:text-slate-300 focus:shadow-[0_0_0_4px_rgba(190,225,255,0.3)] ${darkMode ? 'bg-slate-800 text-slate-100 focus:bg-slate-700' : 'bg-[#f4f7f5] text-slate-700 focus:bg-white'}`}
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
                                            className={`w-full px-6 py-4 rounded-3xl border-2 border-transparent focus:border-[#BEE1FF] outline-none transition-all font-bold placeholder:text-slate-300 focus:shadow-[0_0_0_4px_rgba(190,225,255,0.3)] ${darkMode ? 'bg-slate-800 text-slate-100 focus:bg-slate-700' : 'bg-[#f4f7f5] text-slate-700 focus:bg-white'}`}
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#96C68E] transition-colors">
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    <div className="text-slate-400 text-[10px] mt-2 ml-4 flex items-center animate-in fade-in duration-200">
                                        <AlertCircle size={10} className="mr-1" />
                                        ในการใส่รหัสต้องมีตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก และตัวเลข
                                    </div>
                                </div>
                                <div className="flex justify-between items-center px-2">
                                    <label className="flex items-center text-gray-500 text-sm cursor-pointer select-none hover:text-[#96C68E] font-bold transition-colors">
                                        <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-5 h-5 rounded-lg border-2 border-slate-300 text-[#96C68E] focus:ring-[#96C68E] mr-2 accent-[#96C68E] transition-transform active:scale-90" />
                                        จดจำฉัน
                                    </label>
                                    <button type="button" onClick={() => { setAuthMode('forgot'); setError(''); }} className="text-sm text-gray-400 hover:text-[#FF917B] underline underline-offset-4 font-bold transition-colors">ลืมรหัสผ่าน?</button>
                                </div>
                                <button type="submit" disabled={loading} className="w-full bg-[#96C68E] text-white py-4 rounded-3xl font-black text-lg hover:bg-[#85b57d] hover:-translate-y-1 transition-all shadow-[0_10px_20px_-10px_rgba(150,198,142,0.5)] active:scale-95 disabled:opacity-70 border-b-4 border-[#7aa874] active:border-b-0 active:translate-y-1">
                                    {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                                </button>
                            </form>
                        </div>
                    ) : authMode === 'register' ? (
                        /* REGISTER FORM */
                        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl flex items-center text-xs font-bold"><AlertCircle size={16} className="mr-2 flex-shrink-0" />{error}</div>}
                            <form onSubmit={handleRegisterSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 pl-2">ชื่อ-นามสกุล</label>
                                    <div className="flex gap-3">
                                        <input
                                            name="firstName"
                                            value={regFormData.firstName}
                                            onChange={handleRegChange}
                                            required
                                            maxLength={20}
                                            placeholder="ชื่อ"
                                            className={`w-full px-6 py-4 rounded-3xl border-2 border-transparent focus:border-[#FF917B] outline-none transition-all font-bold placeholder:text-slate-300 focus:shadow-[0_0_0_4px_rgba(255,145,123,0.3)] ${darkMode ? 'bg-slate-800 text-slate-100 focus:bg-slate-700' : 'bg-[#f4f7f5] text-slate-700 focus:bg-white'}`}
                                        />
                                        <input
                                            name="lastName"
                                            value={regFormData.lastName}
                                            onChange={handleRegChange}
                                            required
                                            maxLength={20}
                                            placeholder="นามสกุล"
                                            className={`w-full px-6 py-4 rounded-3xl border-2 border-transparent focus:border-[#FF917B] outline-none transition-all font-bold placeholder:text-slate-300 focus:shadow-[0_0_0_4px_rgba(255,145,123,0.3)] ${darkMode ? 'bg-slate-800 text-slate-100 focus:bg-slate-700' : 'bg-[#f4f7f5] text-slate-700 focus:bg-white'}`}
                                        />
                                    </div>
                                    {regNameLimitError && (
                                        <div className="text-red-500 text-[10px] mt-1 ml-4 font-bold flex items-center animate-in fade-in duration-200">
                                            <AlertCircle size={10} className="mr-1" />
                                            {regNameLimitError}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 pl-2">อีเมล</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={regFormData.email}
                                        onChange={handleRegChange}
                                        required
                                        placeholder="yourname@email.com"
                                        className={`w-full px-6 py-4 rounded-3xl border-2 border-transparent focus:border-[#FF917B] outline-none transition-all font-bold placeholder:text-slate-300 focus:shadow-[0_0_0_4px_rgba(255,145,123,0.3)] ${darkMode ? 'bg-slate-800 text-slate-100 focus:bg-slate-700' : 'bg-[#f4f7f5] text-slate-700 focus:bg-white'}`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 pl-2">รหัสผ่าน</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={regFormData.password}
                                            onChange={handleRegChange}
                                            required
                                            placeholder="ตั้งรหัสผ่าน 6 ตัวขึ้นไป"
                                            className={`w-full px-6 py-4 rounded-3xl border-2 border-transparent focus:border-[#FF917B] outline-none transition-all font-bold placeholder:text-slate-300 focus:shadow-[0_0_0_4px_rgba(255,145,123,0.3)] ${darkMode ? 'bg-slate-800 text-slate-100 focus:bg-slate-700' : 'bg-[#f4f7f5] text-slate-700 focus:bg-white'}`}
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF917B] transition-colors">
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    <div className="text-slate-400 text-[10px] mt-2 ml-4 flex items-center animate-in fade-in duration-200">
                                        <AlertCircle size={10} className="mr-1" />
                                        ในการใส่รหัสต้องมีตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก และตัวเลข
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
                    ) : authMode === 'forgot' ? (

                        /* FORGOT PASSWORD FORM */
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-[#ffef92] rounded-full mx-auto mb-4 flex items-center justify-center text-[#d1b000]">
                                    <Lock size={32} />
                                </div>
                                <h2 className={`text-2xl font-black mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>ลืมรหัสผ่าน?</h2>
                                <p className={darkMode ? 'text-slate-400' : 'text-slate-500 text-sm'}>ไม่ต้องกังวล! กรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ต</p>
                            </div>
                            {error && <div className={`${darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-500'} p-4 rounded-xl flex items-center text-xs font-bold shadow-sm animate-shake`}><AlertCircle size={16} className="mr-2 flex-shrink-0" />{error}</div>}
                            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                                <div>
                                    <label className={`block text-sm font-bold mb-2 pl-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>อีเมลของคุณ</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="example@email.com"
                                        className={`w-full px-6 py-4 rounded-3xl border-2 border-transparent focus:border-[#BEE1FF] outline-none transition-all font-bold placeholder:text-slate-300 focus:shadow-[0_0_0_4px_rgba(190,225,255,0.3)] ${darkMode ? 'bg-slate-800 text-slate-100 focus:bg-slate-700' : 'bg-[#f4f7f5] text-slate-700 focus:bg-white'}`}
                                    />
                                </div>
                                <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-3xl font-black text-lg hover:bg-slate-800 hover:-translate-y-1 transition-all shadow-xl active:scale-95 disabled:opacity-70 mt-4">
                                    {loading ? 'กำลังส่ง...' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
                                </button>
                                <button type="button" onClick={() => { setAuthMode('login'); setError(''); }} className="w-full text-slate-400 hover:text-slate-600 font-bold transition-colors flex items-center justify-center gap-2 py-2">
                                    <ChevronLeft size={18} />
                                    กลับไปยังหน้าเข้าสู่ระบบ
                                </button>
                            </form>
                        </div>
                    ) : (
                        /* PASSWORD RESET SENT SUCCESS */
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-[#ffef92] rounded-full mx-auto mb-4 flex items-center justify-center text-[#d1b000]">
                                    <Mail size={32} />
                                </div>
                                <h2 className={`text-2xl font-black mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>ส่งเรียบร้อย!</h2>
                                <p className={darkMode ? 'text-slate-400' : 'text-slate-500 text-sm'}>เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปให้คุณแล้ว</p>
                            </div>

                            {error && <div className={`${darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-500'} p-4 rounded-xl flex items-center text-xs font-bold shadow-sm animate-shake`}><AlertCircle size={16} className="mr-2 flex-shrink-0" />{error}</div>}

                            <div className="space-y-4">
                                <div>
                                    <label className={`block text-sm font-bold mb-2 pl-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>อีเมลของคุณ</label>
                                    <div className={`w-full px-6 py-4 rounded-3xl border-2 border-transparent font-bold ${darkMode ? 'bg-slate-800 text-slate-100' : 'bg-[#f4f7f5] text-slate-700'}`}>
                                        {email}
                                    </div>
                                </div>

                                <div className="text-center text-sm font-medium mt-2">
                                    <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>
                                        ลิงก์จะใช้ได้ภายใน 1 ชั่วโมง หากลิงก์หมดอายุหรือไม่ได้รับอีเมล กรุณากดส่งใหม่
                                    </span>
                                </div>

                                <button
                                    onClick={handleResendEmail}
                                    disabled={resendTimer > 0 || loading}
                                    className={`w-full py-4 rounded-3xl font-black text-lg transition-all mt-4 ${resendTimer > 0 ? 'bg-slate-300 text-slate-500 cursor-not-allowed border-none' : 'bg-slate-900 text-white hover:bg-slate-800 hover:-translate-y-1 active:scale-95 shadow-xl border-b-4 border-slate-700 active:border-b-0 active:translate-y-1'}`}
                                >
                                    {loading ? 'กำลังส่ง...' : resendTimer > 0 ? `ส่งอีเมลอีกครั้งใน (${resendTimer}s)` : 'ส่งลิงก์รีเซ็ตรหัสผ่านใหม่'}
                                </button>

                                <button type="button" onClick={() => { setAuthMode('login'); setError(''); setResendTimer(0); }} className="w-full text-slate-400 hover:text-slate-600 font-bold transition-colors flex items-center justify-center gap-2 py-2">
                                    <ChevronLeft size={18} />
                                    กลับไปยังหน้าเข้าสู่ระบบ
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Divider */}
                    {(authMode === 'login' || authMode === 'register') && (
                        <>
                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                                <div className="relative flex justify-center text-xs font-black"><span className={`px-4 ${darkMode ? 'bg-slate-900 text-slate-700' : 'bg-white text-gray-300'}`}>OR</span></div>
                            </div>

                            {/* Google Login Button */}
                            <button onClick={handleGoogleLogin} className={`w-full border-2 flex items-center justify-center space-x-3 py-3.5 rounded-3xl font-bold transition-all active:scale-95 group ${darkMode ? 'border-slate-700 hover:bg-slate-800 hover:border-[#FFE787]' : 'border-gray-100 hover:bg-[#FFE787]/20 hover:border-[#FFE787]'}`}>
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6 group-hover:scale-110 transition-transform" alt="Google" />
                                <span className={`${darkMode ? 'text-slate-300 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-800'}`}>เข้าสู่ระบบด้วย Google</span>
                            </button>
                        </>
                    )}
                </div>



                {/* TEAM SECTION */}
                <div ref={teamSectionRef} className={`w-full py-24 md:py-20 relative z-10 backdrop-blur-sm ${darkMode ? 'bg-slate-900/50' : 'bg-white/50'}`}>
                    <div className="max-w-6xl mx-auto px-4 relative">

                        {/* Center Hub (Desktop Only) */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-20 hidden md:block">
                            <h2 className={`text-5xl font-black ${teamVisible ? 'team-title-anim' : 'opacity-0'} ${darkMode ? 'text-white' : 'text-slate-800'}`}>ทีมผู้พัฒนา</h2>
                            <div className="w-px h-16 bg-gray-300 mx-auto mt-1 mb-150"></div>
                        </div>

                        {/* Distributed Layout */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-16 md:gap-0">

                            {/* Member 1: Pimvichada (Top Left) */}
                            <div className={`flex flex-col items-center md:items-center md:w-1/3 md:-mt-50 order-1 ${teamVisible ? 'member-left' : 'opacity-0'}`}>
                                <div className="relative w-[280px] h-[280px] ">
                                    <div className="absolute -right-8 -top-8 z-10 animate-blob mix-blend-multiply opacity-80">
                                        <svg width="90" height="90" viewBox="0 0 100 100" fill="none">
                                            <path d="M50 0 C22.4 0 0 22.4 0 50 C0 77.6 22.4 100 50 100 C77.6 100 100 77.6 100 50 C100 22.4 77.6 0 50 0 Z" fill="#96C68E" fillOpacity="0.3" />
                                            <circle cx="35" cy="35" r="10" fill="#96C68E" />
                                        </svg>
                                    </div>
                                    <img src={Pim} className="w-full h-full rounded-full object-cover border-[8px] border-white shadow-2xl bg-slate-200 transition-all duration-700 ease-out group-hover:scale-105 group-hover:rotate-3 group-hover:shadow-[0_20px_60px_-15px_rgba(150,198,142,0.6)]" alt="Pimvichada" />
                                </div>
                                <div className="text-center md:text-center mt-10">
                                    <h3 className={`font-black text-4xl mb-2 tracking-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>Pimvichada</h3>
                                    <div className="flex flex-col items-center md:items-center space-y-2">
                                        <div className="bg-gradient-to-r from-[#96C68E] to-[#7fb377] text-white px-5 py-1.5 rounded-full text-xs font-bold shadow-md">นักศึกษาชั้นปีที่ 4</div>
                                        <div className={`space-y-0.5 ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                                            <p className="text-sm font-medium">สาขาวิทยาการคอมพิวเตอร์</p>
                                            <p className="text-sm font-medium">คณะนวัตกรรมเทคโนโลยีดิจิทัล</p>
                                            <p className="text-sm font-medium">มหาวิทยาลัยรังสิต</p>
                                        </div>
                                        <p className={`text-[10px] tracking-widest font-black opacity-40 uppercase ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>ID: 6504780</p>

                                        {/* Contact Icons */}
                                        <div className="flex space-x-3 mt-4">
                                            <a href="https://www.instagram.com/pimvichada?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 text-white rounded-full hover:scale-110 hover:-rotate-12 transition-all shadow-lg hover:shadow-pink-500/30">
                                                <Instagram size={18} />
                                            </a>
                                            <button
                                                onClick={() => handleCopyEmail('Pimvichada172546@gmail.com', 'pimvichada')}
                                                className="relative p-2.5 bg-gradient-to-tr from-blue-400 to-cyan-400 text-white rounded-full hover:scale-110 hover:rotate-12 transition-all shadow-lg hover:shadow-blue-400/30 group"
                                            >
                                                {copiedId === 'pimvichada' ? <Check size={18} /> : <Mail size={18} />}
                                                {copiedId === 'pimvichada' && (
                                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap">
                                                        คัดลอกแล้ว!
                                                    </span>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Member 2: Lalitwadee (Center Bottom) */}
                            <div className={`flex flex-col items-center md:w-1/3 mt-30 order-2 relative z-30 ${teamVisible ? 'member-center' : 'opacity-0'}`}>
                                <div className="relative w-[280px] h-[280px]">
                                    <div className="absolute -left-10 -top-4 z-10 animate-blob animation-delay-2000 mix-blend-multiply opacity-80">
                                        <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                                            <path d="M50 0L61 35H98L68 57L79 91L50 70L21 91L32 57L2 35H39L50 0Z" fill="#FF917B" fillOpacity="0.3" />
                                            <circle cx="50" cy="50" r="15" fill="#FF917B" />
                                        </svg>
                                    </div>
                                    <img src={Lalitwadee} className="w-full h-full rounded-full object-cover border-[8px] border-white shadow-2xl bg-slate-200 transition-all duration-700 ease-out group-hover:scale-105 group-hover:-rotate-3 group-hover:shadow-[0_20px_60px_-15px_rgba(255,145,123,0.6)]" alt="Lalitwadee" />
                                </div>
                                <div className="text-center mt-10">
                                    <h3 className={`font-black text-4xl mb-2  ${darkMode ? 'text-white' : 'text-slate-800'}`}>Lalitwadee</h3>
                                    <div className="flex flex-col items-center space-y-2">
                                        <div className="bg-gradient-to-r from-[#FF917B] to-[#ff7e65] text-white px-5 py-1.5 rounded-full text-xs font-bold shadow-md">นักศึกษาชั้นปีที่ 4</div>
                                        <div className={`space-y-0.5 ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                                            <p className="text-sm font-medium">สาขาวิทยาการคอมพิวเตอร์</p>
                                            <p className="text-sm font-medium">คณะนวัตกรรมเทคโนโลยีดิจิทัล</p>
                                            <p className="text-sm font-medium">มหาวิทยาลัยรังสิต</p>
                                        </div>
                                        <p className={`text-[10px] tracking-widest font-black opacity-40 uppercase ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>ID: 6504551</p>

                                        {/* Contact Icons */}
                                        <div className="flex space-x-3 mt-4">
                                            <a href="https://www.instagram.com/aaim_tsw?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 text-white rounded-full hover:scale-110 hover:-rotate-12 transition-all shadow-lg hover:shadow-pink-500/30">
                                                <Instagram size={18} />
                                            </a>
                                            <button
                                                onClick={() => handleCopyEmail('Lalitwadee.999@gmail.com', 'lalitwadee')}
                                                className="relative p-2.5 bg-gradient-to-tr from-blue-400 to-cyan-400 text-white rounded-full hover:scale-110 hover:rotate-12 transition-all shadow-lg hover:shadow-blue-400/30 group"
                                            >
                                                {copiedId === 'lalitwadee' ? <Check size={18} /> : <Mail size={18} />}
                                                {copiedId === 'lalitwadee' && (
                                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap">
                                                        คัดลอกแล้ว!
                                                    </span>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Member 3: Onphairin (Top Right) */}
                            <div className={`flex flex-col items-center md:items-center md:w-1/3 md:-mt-50 order-3 ${teamVisible ? 'member-right' : 'opacity-0'}`}>
                                <div className="relative w-[280px] h-[280px] ">
                                    <div className="absolute -right-6 -bottom-6 z-10 animate-blob mix-blend-multiply opacity-80">
                                        <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
                                            <circle cx="30" cy="30" r="30" fill="#BEE1FF" fillOpacity="0.4" />
                                            <circle cx="70" cy="70" r="20" fill="#fce883" />
                                        </svg>
                                    </div>
                                    <img src={fink} className="w-full h-full rounded-full object-cover border-[8px] border-white shadow-2xl bg-slate-200 transition-all duration-700 ease-out group-hover:scale-105 group-hover:rotate-3 group-hover:shadow-[0_20px_60px_-15px_rgba(190,225,255,0.6)]" alt="Onphairin" />
                                </div>
                                <div className="text-center md:text-center mt-10">
                                    <h3 className={`font-black text-4xl mb-2 tracking-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>Onphairin</h3>
                                    <div className="flex flex-col items-center md:items-center space-y-2">
                                        <div className="bg-gradient-to-r from-[#BEE1FF] to-[#9acdfc] text-white px-5 py-1.5 rounded-full text-xs font-bold shadow-md">นักศึกษาชั้นปีที่ 4</div>
                                        <div className={`space-y-0.5 ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                                            <p className="text-sm font-medium">สาขาวิทยาการคอมพิวเตอร์</p>
                                            <p className="text-sm font-medium">คณะนวัตกรรมเทคโนโลยีดิจิทัล</p>
                                            <p className="text-sm font-medium">มหาวิทยาลัยรังสิต</p>
                                        </div>
                                        <p className={`text-[10px] tracking-widest font-black opacity-40 uppercase ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>ID: 6504552</p>

                                        {/* Contact Icons */}
                                        <div className="flex space-x-3 mt-4">
                                            <a href="https://www.instagram.com/sphnqr?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 text-white rounded-full hover:scale-110 hover:-rotate-12 transition-all shadow-lg hover:shadow-pink-500/30">
                                                <Instagram size={18} />
                                            </a>
                                            <button
                                                onClick={() => handleCopyEmail('finkopr2546@gmail.com', 'Onphairin')}
                                                className="relative p-2.5 bg-gradient-to-tr from-blue-400 to-cyan-400 text-white rounded-full hover:scale-110 hover:rotate-12 transition-all shadow-lg hover:shadow-blue-400/30 group"
                                            >
                                                {copiedId === 'Onphairin' ? <Check size={18} /> : <Mail size={18} />}
                                                {copiedId === 'Onphairin' && (
                                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap">
                                                        คัดลอกแล้ว!
                                                    </span>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Mobile Title View */}
                        <div className="mt-16 text-center md:hidden">
                            <div className="bg-[#2563eb] text-white px-6 py-1 rounded-full inline-block font-bold text-xl mb-2">
                                3
                            </div>
                            <h2 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>ทีมผู้พัฒนา</h2>
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-6 w-full text-center text-slate-400 text-[10px] tracking-widest uppercase font-bold opacity-60 z-20">© 2026 Schooly Scoot Inc. All Rights Reserved</div>
        </div>
    );
};

export default LoginPage;
