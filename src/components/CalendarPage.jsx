import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, BookOpen } from 'lucide-react';

const HOLIDAYS = [
    // 2027 (Example future proofing or current year 2026/2027)
    { date: '2026-01-01', name: 'วันขึ้นปีใหม่', type: 'global' },
    { date: '2026-02-12', name: 'วันมาฆบูชา', type: 'thai' }, // Approx
    { date: '2026-04-06', name: 'วันจักรี', type: 'thai' },
    { date: '2026-04-13', name: 'วันสงกรานต์', type: 'thai' },
    { date: '2026-04-14', name: 'วันสงกรานต์', type: 'thai' },
    { date: '2026-04-15', name: 'วันสงกรานต์', type: 'thai' },
    { date: '2026-05-01', name: 'วันแรงงาน', type: 'global' },
    { date: '2026-05-04', name: 'วันฉัตรมงคล', type: 'thai' },
    { date: '2026-05-11', name: 'วันพืชมงคล', type: 'thai' }, // Approx
    { date: '2026-05-26', name: 'วันวิสาขบูชา', type: 'thai' }, // Approx
    { date: '2026-06-03', name: 'วันเฉลิมพระชนมพรรษาพระราชินี', type: 'thai' },
    { date: '2026-07-24', name: 'วันอาสาฬหบูชา', type: 'thai' }, // Approx
    { date: '2026-07-25', name: 'วันเข้าพรรษา', type: 'thai' }, // Approx
    { date: '2026-07-28', name: 'วันเฉลิมพระชนมพรรษา ร.10', type: 'thai' },
    { date: '2026-08-12', name: 'วันแม่แห่งชาติ', type: 'thai' },
    { date: '2026-10-13', name: 'วันคล้ายวันสวรรคต ร.9', type: 'thai' },
    { date: '2026-10-23', name: 'วันปิยมหาราช', type: 'thai' },
    { date: '2026-12-05', name: 'วันพ่อแห่งชาติ', type: 'thai' },
    { date: '2026-12-10', name: 'วันรัฐธรรมนูญ', type: 'thai' },
    { date: '2026-12-31', name: 'วันสิ้นปี', type: 'global' },
    // Add more as needed or current year detection
];

export default function CalendarPage({ courses = [], userRole = 'student', darkMode }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
        return { days, firstDay, year, month };
    };

    const { days, firstDay, year, month } = getDaysInMonth(currentDate);

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const today = new Date();

    return (
        <div className={`space-y-6 animate-in fade-in duration-500 ${darkMode ? 'text-slate-200' : ''}`}>
            <div className="flex items-center justify-between">
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'} flex items-center`}>
                    <CalendarIcon className="mr-3 text-[#96C68E]" />
                    ปฏิทินกิจกรรม
                </h1>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className={`p-2 border rounded-xl transition-colors ${darkMode ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                        <ChevronLeft size={20} />
                    </button>
                    <h2 className={`text-xl font-bold min-w-[180px] text-center ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        {currentDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button onClick={nextMonth} className={`p-2 border rounded-xl transition-colors ${darkMode ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} rounded-3xl p-6 shadow-sm border`}>
                <div className="grid grid-cols-7 mb-4">
                    {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day, i) => (
                        <div key={i} className={`text-center font-bold pb-2 ${i === 0 || i === 6 ? 'text-[#FF917B]' : (darkMode ? 'text-slate-500' : 'text-slate-400')}`}>
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {Array(firstDay).fill(null).map((_, i) => (
                        <div key={`empty-${i}`} className={`h-24 md:h-32 rounded-2xl ${darkMode ? 'bg-slate-700/30' : 'bg-slate-50/50'}`}></div>
                    ))}

                    {Array(days).fill(null).map((_, i) => {
                        const day = i + 1;
                        const currentDayDate = new Date(year, month, day);
                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const holiday = HOLIDAYS.find(h => h.date === dateStr);
                        const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

                        const dayOfWeek = currentDayDate.getDay();
                        const hasClass = courses.some(c => (c.schedule || []).some(s => s.dayOfWeek === dayOfWeek));

                        return (
                            <div
                                key={day}
                                className={`h-24 md:h-32 p-3 rounded-2xl border transition-all relative group cursor-pointer ${isToday
                                    ? (darkMode ? 'bg-green-900/20 border-[#96C68E] shadow-sm' : 'bg-[#F0FDF4] border-[#96C68E] shadow-sm')
                                    : holiday
                                        ? (darkMode ? 'bg-red-900/10 border-[#FF917B]/30 hover:border-[#FF917B]' : 'bg-[#FFF0EE] border-[#FF917B]/30 hover:border-[#FF917B]')
                                        : (darkMode ? 'bg-slate-800 border-slate-700 hover:border-[#96C68E]' : 'bg-white border-slate-100 hover:border-[#BEE1FF]')
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={`text-sm font-bold ${isToday
                                        ? 'w-8 h-8 rounded-full bg-[#96C68E] text-white flex items-center justify-center'
                                        : holiday ? 'text-[#FF917B]' : (darkMode ? 'text-slate-400' : 'text-slate-700')
                                        }`}>
                                        {day}
                                    </span>

                                    {hasClass && !holiday && (
                                        <div className="w-2 h-2 rounded-full bg-[#BEE1FF]"></div>
                                    )}
                                </div>

                                {holiday && (
                                    <div className="mt-2">
                                        <div className={`text-[10px] md:text-xs font-bold text-[#FF917B] p-1 rounded-lg backdrop-blur-sm line-clamp-2 border border-[#FF917B]/20 ${darkMode ? 'bg-slate-800/80' : 'bg-white/80'}`}>
                                            {holiday.name}
                                        </div>
                                    </div>
                                )}

                                {hasClass && !holiday && (
                                    <div className="mt-1">
                                        <span className={`text-[10px] md:text-xs font-bold text-[#5B9BD5] bg-[#E3F2FD] border-[#E3F2FD]/20 p-1 rounded-lg backdrop-blur-sm line-clamp-2 border ${darkMode ? 'bg-blue-900/20 text-blue-300 border-blue-800/50' : ''}`}>
                                            {userRole === 'teacher' ? 'สอน' : 'เรียน'}
                                        </span>
                                    </div>
                                )}

                                {isToday && !holiday && !hasClass && (
                                    <div className="mt-2 text-xs font-bold text-[#96C68E] text-center opacity-80">
                                        วันนี้
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-6 rounded-3xl border shadow-sm flex items-start gap-4 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                    <div className={`p-3 rounded-2xl ${darkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-500'}`}>
                        <MapPin size={24} />
                    </div>
                    <div>
                        <h3 className={`font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>วันหยุดนักขัตฤกษ์</h3>
                        <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            วันหยุดราชการไทย
                        </p>
                    </div>
                </div>
                <div className={`p-6 rounded-3xl border shadow-sm flex items-start gap-4 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                    <div className={`p-3 rounded-2xl ${darkMode ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-50 text-blue-500'}`}>
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <h3 className={`font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{userRole === 'teacher' ? 'วันที่มีสอน' : 'วันที่มีเรียน'}</h3>
                        <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            {userRole === 'teacher' ? 'วันที่ต้องเข้าสอนตามตาราง' : 'วันที่ต้องเข้าเรียนตามตาราง'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
