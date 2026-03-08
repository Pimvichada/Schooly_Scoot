import React from 'react';
import { ChevronRight } from 'lucide-react';

const CourseHeader = ({ selectedCourse, setSelectedCourse, darkMode, teacherProfile }) => {
    const teacherDisplayName = (() => {
        if (!teacherProfile) return selectedCourse.teacher || 'คุณครู';

        // If we have first name, use it with prefix
        if (teacherProfile.firstName) {
            return `ครู${teacherProfile.firstName}${teacherProfile.lastName ? ' ' + teacherProfile.lastName : ''}`.trim();
        }

        // Fallback to fullName
        if (teacherProfile.fullName) {
            // Ensure prefix
            if (teacherProfile.fullName.startsWith('ครู')) return teacherProfile.fullName;
            return `ครู${teacherProfile.fullName}`.trim();
        }

        // Final fallbacks
        return selectedCourse.teacher || 'คุณครู';
    })();

    return (
        <div className="space-y-6">
            <button
                onClick={() => setSelectedCourse(null)}
                className={`flex items-center text-sm font-bold mb-4 transition-colors ${darkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-800'}`}
            >
                <ChevronRight className="rotate-180 mr-1" /> กลับไปหน้ารวม
            </button>
            <div className={`${selectedCourse.color} rounded-[2.5rem] p-6 md:p-8 relative overflow-hidden transition-all duration-700 shadow-xl shadow-black/5`}>
                <div className="relative z-10 text-slate-800">
                    <h1 className="text-2xl md:text-4xl font-black mb-2 break-words">{selectedCourse.name}</h1>
                    <div className="flex items-center gap-2">
                        {teacherProfile?.photoURL ? (
                            <img src={teacherProfile.photoURL} alt={teacherDisplayName} className="w-8 h-8 rounded-full object-cover border-2 border-white/50" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center font-bold text-xs">
                                {teacherDisplayName?.charAt(1) || selectedCourse.teacher?.charAt(0)}
                            </div>
                        )}
                        <p className="text-sm md:text-lg font-medium opacity-80 break-words line-clamp-2 md:line-clamp-none">{selectedCourse.code} • {teacherDisplayName}</p>
                    </div>
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
