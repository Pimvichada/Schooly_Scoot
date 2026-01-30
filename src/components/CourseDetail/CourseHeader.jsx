import React from 'react';
import { ChevronRight } from 'lucide-react';

const CourseHeader = ({ selectedCourse, setSelectedCourse, darkMode }) => {
    return (
        <div className="space-y-6">
            <button
                onClick={() => setSelectedCourse(null)}
                className={`flex items-center text-sm font-bold mb-4 transition-colors ${darkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-800'}`}
            >
                <ChevronRight className="rotate-180 mr-1" /> กลับไปหน้ารวม
            </button>

            <div className={`${selectedCourse.color} rounded-[2.5rem] p-8 relative overflow-hidden transition-all duration-700 shadow-xl shadow-black/5`}>
                <div className="relative z-10 text-slate-800">
                    <h1 className="text-4xl font-black mb-2">{selectedCourse.name}</h1>
                    <p className="text-lg font-medium opacity-80">{selectedCourse.code} • {selectedCourse.teacher}</p>
                </div>
                <div className="absolute right-12 top-1/2 -translate-y-1/2 opacity-20 scale-[2.5] text-slate-800">
                    {selectedCourse.icon}
                </div>

                {/* Decorative Blob */}
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
};

export default CourseHeader;
