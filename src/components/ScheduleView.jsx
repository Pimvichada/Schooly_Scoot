import React from 'react';
import { Calendar } from 'lucide-react';

const ScheduleView = ({ darkMode, userRole, courses }) => {
    return (
        <div className={`space-y-6 ${darkMode ? 'text-slate-200' : ''}`}>
            <h1 className={`text-2xl font-bold flex items-center ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                <Calendar className="mr-3 text-[#96C68E]" /> {userRole === 'teacher' ? 'ตารางสอน' : 'ตารางเรียน'}
            </h1>

            <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} rounded-3xl p-6 shadow-sm border`}>
                {/* Dynamic Weekly View */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {['จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์'].map((day, i) => {
                        const dayOfWeek = i + 1; // 1=Mon, 5=Fri
                        const dailyItems = courses.flatMap(c =>
                            (c.schedule || []).filter(s => s.dayOfWeek === dayOfWeek).map(s => ({
                                ...s,
                                courseName: c.name,
                                courseCode: c.code,
                                teacher: c.teacher,
                                color: c.color
                            }))
                        ).sort((a, b) => a.startTime.localeCompare(b.startTime));

                        return (
                            <div key={day} className="space-y-3">
                                <div className={`text-center font-bold mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{day}</div>
                                {dailyItems.length > 0 ? dailyItems.map((slot, idx) => (
                                    <div key={idx} className={`p-3 rounded-xl text-sm mb-2 text-center transition-all ${slot.color
                                        ? (darkMode ? 'bg-slate-700 border border-slate-600' : `${slot.color} bg-opacity-20 border border-black/5`)
                                        : (darkMode ? 'bg-slate-700 border border-slate-600' : 'bg-slate-50 border border-slate-100')}`}>
                                        <div className={`font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{slot.startTime} - {slot.endTime}</div>
                                        <div className={`font-bold line-clamp-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{slot.courseName}</div>
                                        <div className={`${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{slot.courseCode}</div>
                                        <div className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>ห้อง {slot.room}</div>
                                    </div>
                                )) : (
                                    <div className={`p-4 rounded-xl border-2 border-dashed text-center text-sm ${darkMode ? 'border-slate-800 text-slate-700' : 'border-slate-100 text-slate-300'}`}>
                                        ว่าง
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ScheduleView;
