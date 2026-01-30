import React from 'react';
import { EyeOff, Eye, Plus, Search, BookOpen } from 'lucide-react';
import CourseCard from './CourseCard';

const CoursesView = ({
    darkMode,
    hiddenCoursesList,
    showHiddenCourses,
    setShowHiddenCourses,
    userRole,
    setActiveModal,
    visibleCourses,
    handleToggleHideCourse,
    setSelectedCourse,
    handleDeleteCourse
}) => {
    return (
        <div className={`space-y-6 animate-in fade-in duration-500 ${darkMode ? 'text-slate-100' : ''}`}>
            <div className="flex justify-between items-center">
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>ห้องเรียนของฉัน</h1>
                <div className="flex gap-3">
                    {hiddenCoursesList.length > 0 && (
                        <button
                            onClick={() => setShowHiddenCourses(!showHiddenCourses)}
                            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${showHiddenCourses
                                ? (darkMode ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-600')
                                : (darkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')
                                }`}
                        >
                            {showHiddenCourses ? <EyeOff size={18} /> : <Eye size={18} />}
                            {showHiddenCourses ? 'ซ่อนห้องที่ถูกซ่อน' : `ดูห้องที่ซ่อนไว้ (${hiddenCoursesList.length})`}
                        </button>
                    )}
                    {userRole === 'teacher' ? (
                        <button onClick={() => setActiveModal('create')} className="bg-[#96C68E] text-white px-4 py-2 rounded-xl font-bold shadow-sm flex items-center hover:bg-[#85b57d]">
                            <Plus size={20} className="mr-2" /> สร้างห้องเรียน
                        </button>
                    ) : (
                        <button onClick={() => setActiveModal('join')} className={`px-4 py-2 rounded-xl font-bold shadow-sm flex items-center transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'} border`}>
                            <Search size={20} className="mr-2" /> เข้าร่วมด้วยรหัส
                        </button>
                    )}
                </div>
            </div>

            {visibleCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {visibleCourses.map(course => (
                        <CourseCard
                            key={course.id || course.firestoreId}
                            course={{ ...course, isHidden: false, onToggleHide: handleToggleHideCourse }} // Explicitly pass handlers
                            onClick={() => setSelectedCourse(course)}
                            isTeacher={userRole === 'teacher'}
                            onDelete={handleDeleteCourse}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-100 border-dashed">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen size={32} className="text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-600">ยังไม่มีห้องเรียนที่แสดง</h3>
                    <p className="text-slate-500 text-sm mt-1">สร้างหรือเข้าร่วมห้องเรียนเพื่อเริ่มต้น หรือดูห้องที่ซ่อนไว้</p>
                </div>
            )}

            {/* Hidden Courses Section */}
            {showHiddenCourses && hiddenCoursesList.length > 0 && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300 mt-8 pt-8 border-t-2 border-slate-200 border-dashed">
                    <h2 className="text-lg font-bold text-slate-500 mb-6 flex items-center">
                        <EyeOff size={20} className="mr-2" /> ห้องเรียนที่ซ่อนไว้
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 opacity-75">
                        {hiddenCoursesList.map(course => (
                            <CourseCard
                                key={course.id || course.firestoreId}
                                course={{ ...course, isHidden: true, onToggleHide: handleToggleHideCourse, darkMode }}
                                onClick={() => setSelectedCourse(course)}
                                isTeacher={userRole === 'teacher'}
                                onDelete={handleDeleteCourse}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoursesView;
