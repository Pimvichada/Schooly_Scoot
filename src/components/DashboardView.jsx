import React from 'react';
import {
    TrendingUp,
    BookOpen,
    Calendar,
    FileText,
    Clock,
    Video,
    Bell,
    ClipboardCheck
} from 'lucide-react';
import { getNormalizedSchedule } from '../utils/helpers.jsx';
import NotificationItem from './NotificationItem';
import { Cute1, MascotTriangle } from './Mascots';

// --- Sub-component: StatCard ---
const StatCard = ({ title, value, color, icon, onClick, interactive = true, darkMode, centerOnMobile = false }) => (
    <div
        onClick={interactive ? onClick : undefined}
        className={`${color} p-4 md:p-6 rounded-3xl shadow-sm relative overflow-hidden transition-all flex flex-col ${interactive ? 'hover:shadow-md cursor-pointer hover:scale-[1.03] active:scale-95' : ''
            } ${centerOnMobile ? 'items-center md:items-start text-center md:text-left' : ''}`}
    >
        <div className="absolute right-[-10px] top-[-10px] opacity-20 transform rotate-12 scale-75 md:scale-100">
            {icon}
        </div>
        {title && <h3 className={`font-bold ${darkMode ? 'text-white/70' : 'text-slate-700'} text-xs md:text-sm mb-1 uppercase tracking-tight`}>{title}</h3>}
        <div className={`text-2xl md:text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-800'} truncate w-full`}>{value}</div>
        {interactive && (
            <div className={`mt-2 text-[10px] md:text-xs ${darkMode ? 'text-white/60' : 'text-slate-800/60'} font-bold flex items-center w-full ${centerOnMobile ? 'justify-center md:justify-start' : ''}`}>
                แตะเพื่อดูรายละเอียด
            </div>
        )}
    </div>
);

const DashboardView = ({
    darkMode,
    userRole,
    profile,
    welcomeMessage,
    courses,
    assignments,
    currentTime,
    notifications,
    selectedNotification,
    handleNotificationClick,
    setActiveTab,
    setSelectedCourse,
    setCourseTab,
    setActiveModal
}) => {
    return (
        <div className={`h-screen space-y-6 ${darkMode ? 'text-slate-100' : ''}`}>
            {/* Welcome Section */}
            <div className={`rounded-3xl p-6 md:p-10 relative overflow-hidden group ${darkMode ? 'bg-slate-800' : 'bg-[#BEE1FF]'}`}>
                <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left w-full md:max-w-[70%]">
                    <h1 className={`text-2xl md:text-4xl font-bold mb-2 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        สวัสดี, {userRole === 'student' ? `น้อง${profile.firstName}!` : `คุณครู${profile.firstName}!`} 👋
                    </h1>
                    <p className={`${darkMode ? 'text-slate-300' : 'text-slate-600'} text-sm md:text-base max-w-xs md:max-w-none`}>
                        {welcomeMessage}
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        {userRole === 'teacher' ? (
                            <button onClick={() => setActiveModal('pendingQuizzes')} className={`bg-white text-slate-800 px-8 md:px-6 py-3 md:py-2.5 rounded-2xl font-bold shadow-sm hover:shadow-md hover:scale-105 transition-all border border-slate-100 flex items-center justify-center gap-2 text-sm md:text-base ${darkMode ? 'bg-slate-700 text-slate-200 border-slate-600' : ''}`}>
                                <ClipboardCheck size={18} className="text-[#96C68E]" /> ตรวจข้อสอบ
                            </button>
                        ) : (
                            <button onClick={() => setActiveTab('schedule')} className={`bg-white text-slate-800 px-8 md:px-6 py-3 md:py-2.5 rounded-2xl font-bold shadow-sm hover:shadow-md hover:scale-105 transition-all text-sm md:text-base flex items-center justify-center ${darkMode ? 'bg-slate-700 text-slate-200 border border-slate-600' : ''}`}>
                                ดูตารางเรียน
                            </button>
                        )}
                        <button onClick={() => setActiveTab('analytics')} className="bg-[#FF917B] text-white px-8 md:px-6 py-3 md:py-2.5 rounded-2xl font-bold shadow-sm hover:shadow-md hover:scale-105 transition-all flex items-center justify-center text-sm md:text-base">
                            <TrendingUp size={18} className="mr-2" /> วิเคราะห์การเรียน
                        </button>
                    </div>
                </div>

                {/* Decorative Mascots - Adjust for mobile centering */}
                <div className="absolute right-2 md:right-10 top-2 md:top-1/2 md:transform md:-translate-y-1/2 opacity-20 md:opacity-100 flex space-x-[-15px] md:space-x-[-20px] items-center pointer-events-none md:pointer-events-auto">
                    <Cute1 className="w-16 h-16 md:w-40 md:h-40" />
                    <MascotTriangle className="w-14 h-14 md:w-32 md:h-32" />
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard
                    title={userRole === 'student' ? "วิชาเรียน" : "ห้องเรียน"}
                    value={courses.length.toString()}
                    color={darkMode ? 'bg-slate-800' : 'bg-[#FFE787]'}
                    icon={<BookOpen size={64} />}
                    onClick={() => setActiveTab('courses')}
                    darkMode={darkMode}
                />
                <StatCard
                    title={userRole === 'student' ? "การบ้านที่ต้องส่ง" : "งานรอตรวจ"}
                    value={(() => {
                        const myAssignments = assignments.filter(a => courses.some(c => c.name.trim() === a.course.trim()));
                        return userRole === 'student'
                            ? myAssignments.filter(a => a.status === 'pending').length.toString()
                            : myAssignments.filter(a => a.status !== 'submitted').length.toString();
                    })()}
                    icon={<FileText size={64} />}
                    color={darkMode ? 'bg-slate-800' : 'bg-[#FF917B]'}
                    onClick={() => setActiveTab('assignments')}
                    darkMode={darkMode}
                />
                <div className="col-span-2 md:col-span-1">
                    <StatCard
                        value={
                            <div className="flex flex-col items-center md:items-start">
                                <span className={`text-2xl md:text-4xl font-black ${darkMode ? 'text-white' : 'text-slate-800'} tracking-tight`}>
                                    {currentTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className={`text-[10px] md:text-sm font-bold ${darkMode ? 'text-white/60' : 'text-slate-600'} mt-0.5 uppercase`}>
                                    {currentTime.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' })}
                                </span>
                            </div>
                        }
                        color={darkMode ? 'bg-slate-800' : 'bg-[#96C68E]'}
                        icon={<Clock size={80} className="opacity-40" />}
                        onClick={() => setActiveTab('calendar')}
                        darkMode={darkMode}
                        centerOnMobile={true}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className={`rounded-3xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} lg:col-span-2`}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className={`text-xl font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'} flex items-center`}>
                            <Calendar className="mr-2 text-[#96C68E]" /> ตารางเรียนวันนี้
                        </h2>
                    </div>
                    <div className="space-y-4">
                        {(() => {
                            const today = new Date().getDay(); // 0=Sun, 1=Mon...
                            const now = new Date();
                            const currentHm = now.getHours() * 60 + now.getMinutes();

                            const todaySchedule = courses.flatMap(c => {
                                return getNormalizedSchedule(c)
                                    .filter(s => s._normalizedDay == today)
                                    .map(s => ({ ...s, subject: c.name, course: c }))
                            }).sort((a, b) => (String(a.startTime || "00:00")).localeCompare(String(b.startTime || "00:00")));

                            if (todaySchedule.length === 0) {
                                return (
                                    <div className={`text-center py-12 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
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
                                const isTimeActive = currentHm >= startHm && currentHm < endHm;
                                const isMeetingActive = slot.course.meeting?.isActive;

                                return (
                                    <div key={idx} className={`flex items-center p-4 rounded-2xl transition-all ${isTimeActive
                                        ? (darkMode ? 'bg-green-900/20 border-[#96C68E] border' : 'bg-[#F0FDF4] border-[#96C68E]')
                                        : (darkMode ? 'bg-slate-700/50 border-slate-600 border' : 'bg-slate-50 border-slate-50')}`}>
                                        <div className={`w-20 md:w-28 text-xs md:text-base font-bold ${isTimeActive ? 'text-[#96C68E]' : (darkMode ? 'text-slate-400' : 'text-slate-500')} flex-shrink-0`}>
                                            {slot.startTime} - {slot.endTime}
                                        </div>
                                        <div className={`flex-1 px-3 md:px-4 border-l ${darkMode ? 'border-slate-700' : 'border-slate-200'} ml-2 md:ml-4 overflow-hidden`}>
                                            <div className={`font-bold text-sm md:text-lg ${darkMode ? 'text-slate-100' : 'text-slate-800'} truncate`}>{slot.subject}</div>
                                            <div className="text-[10px] md:text-sm text-slate-500 flex items-center mt-0.5">
                                                <span className={`${darkMode ? 'bg-slate-700 text-slate-400 border-slate-600' : 'bg-slate-100 text-slate-600 border-slate-200'} border px-1.5 md:px-2 py-0.5 rounded-lg font-bold text-[9px] md:text-xs mr-2 shadow-sm`}>ห้อง {slot.room}</span>
                                            </div>
                                        </div>
                                        {isMeetingActive && (
                                            <button
                                                onClick={() => {
                                                    setSelectedCourse(slot.course);
                                                    setCourseTab('meeting');
                                                    setActiveModal('video');
                                                }}
                                                className="bg-[#96C68E] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center hover:bg-[#85b57d] shadow-sm animate-pulse"
                                            >
                                                <Video size={16} className="mr-1" /> เข้าเรียน
                                            </button>
                                        )}
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </div>

                <div className={`rounded-3xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                    <h2 className={`text-xl font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'} flex items-center mb-6`}>
                        <Bell className="mr-2 text-[#FF917B]" /> การแจ้งเตือน
                    </h2>
                    <div className="space-y-4">
                        {notifications.slice(0, 4).map((notif) => (
                            <NotificationItem
                                compact
                                key={notif.firestoreId}
                                notif={notif}
                                displayTime={notif.date ? new Date(notif.date).toLocaleString('th-TH', { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}
                                isSelected={selectedNotification?.firestoreId === notif.firestoreId}
                                onClick={() => handleNotificationClick(notif)}
                                darkMode={darkMode}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
