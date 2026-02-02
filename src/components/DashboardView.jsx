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
import StatCard from './StatCard';
import NotificationItem from './NotificationItem';
import { Cute1, MascotTriangle } from './Mascots';

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
                <div className="relative z-10 max-w-[70%]">
                    <h1 className={`text-2xl md:text-4xl font-bold mb-2 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        สวัสดี, {userRole === 'student' ? `น้อง${profile.firstName}!` : `คุณครู${profile.firstName}!`} 👋
                    </h1>
                    <p className={darkMode ? 'text-slate-300' : 'text-slate-600'}>
                        {welcomeMessage}
                    </p>
                    <div className="mt-6 flex space-x-3">
                        {userRole === 'teacher' ? (
                            <button onClick={() => setActiveModal('pendingQuizzes')} className={`bg-white text-slate-800 px-6 py-2 rounded-xl font-bold shadow-sm hover:shadow hover:scale-105 transition-all border border-slate-100 flex items-center gap-2 ${darkMode ? 'bg-slate-700 text-slate-200 border-slate-600' : ''}`}>
                                <ClipboardCheck size={18} className="text-[#96C68E]" /> ตรวจข้อสอบ
                            </button>
                        ) : (
                            <button onClick={() => setActiveTab('schedule')} className={`bg-white text-slate-800 px-6 py-2 rounded-xl font-bold shadow-sm hover:shadow hover:scale-105 transition-all ${darkMode ? 'bg-slate-700 text-slate-200 border border-slate-600' : ''}`}>
                                ดูตารางเรียน
                            </button>
                        )}
                        <button onClick={() => setActiveTab('analytics')} className="bg-[#FF917B] text-white px-6 py-2 rounded-xl font-bold shadow-sm hover:shadow hover:scale-105 transition-all">
                            <TrendingUp size={18} className="inline mr-1" /> วิเคราะห์การเรียน
                        </button>
                    </div>
                </div>

                {/* Decorative Mascots with Hover Animation */}
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 md:right-10 flex space-x-[-20px] items-center">
                    <div className="transition-transform duration-300 hover:-translate-y-4 hover:rotate-6 cursor-pointer">
                        <Cute1 className="w-24 h-24 md:w-40 md:h-40" />
                    </div>
                    <div className="transition-transform duration-300 hover:-translate-y-4 hover:-rotate-6 cursor-pointer delay-75">
                        <MascotTriangle className="w-20 h-20 md:w-32 md:h-32" />
                    </div>
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
                <StatCard
                    value={
                        <div className="flex flex-col">
                            <span className={`text-4xl font-black ${darkMode ? 'text-slate-200' : 'text-slate-800'} tracking-tight`}>
                                {currentTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'} mt-1 opacity-80`}>
                                {currentTime.toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                    }
                    color={darkMode ? 'bg-slate-800' : 'bg-[#96C68E]'}
                    icon={<Clock size={80} className="opacity-40" />}
                    onClick={() => setActiveTab('calendar')}
                    darkMode={darkMode}
                />
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

                            const todaySchedule = courses.flatMap(c =>
                                (c.schedule || [])
                                    .filter(s => s.dayOfWeek === today)
                                    .map(s => ({ ...s, subject: c.name, course: c }))
                            ).sort((a, b) => a.startTime.localeCompare(b.startTime));

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
                                        <div className={`w-28 font-bold ${isTimeActive ? 'text-[#96C68E]' : (darkMode ? 'text-slate-400' : 'text-slate-500')}`}>
                                            {slot.startTime} - {slot.endTime}
                                        </div>
                                        <div className={`flex-1 px-4 border-l ${darkMode ? 'border-slate-700' : 'border-slate-200'} ml-4`}>
                                            <div className={`font-bold text-lg ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>{slot.subject}</div>
                                            <div className="text-sm text-slate-500 flex items-center mt-1">
                                                <span className={`${darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-600'} px-2 py-0.5 rounded text-xs mr-2`}>ห้อง {slot.room}</span>
                                            </div>
                                        </div>
                                        {isMeetingActive && (
                                            <button
                                                onClick={() => {
                                                    setSelectedCourse(slot.course);
                                                    setCourseTab('meeting');
                                                    setActiveModal('videoConference');
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
