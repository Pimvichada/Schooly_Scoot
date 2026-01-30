import React from 'react';
import { ClipboardList, Plus, Trophy, Settings, Trash, Calendar, Clock, Lock, Award, HelpCircle, CheckCircle2 } from 'lucide-react';

const CourseQuizzes = ({
    darkMode,
    userRole,
    quizzes,
    mySubmissions,
    handleToggleQuizStatus,
    handleViewResults,
    handleEditQuiz,
    handleDeleteQuiz,
    setNewExam,
    selectedCourse,
    setActiveModal,
    currentTime,
    setActiveQuiz,
    setQuizRemainingSeconds
}) => {
    return (
        <div className={`space-y-6 ${darkMode ? 'text-slate-100' : ''}`}>
            <div className="flex justify-between items-center mb-2">
                <h2 className={`text-xl font-bold flex items-center ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                    <ClipboardList className="mr-2 text-[#96C68E]" /> แบบทดสอบ
                </h2>
                {userRole === 'teacher' && (
                    <button
                        onClick={() => {
                            setNewExam(prev => ({ ...prev, course: selectedCourse.name }));
                            setActiveModal('createExam');
                        }}
                        className="bg-[#96C68E] text-white px-4 py-2 rounded-xl font-bold shadow-sm flex items-center hover:bg-[#85b57d]"
                    >
                        <Plus size={18} className="mr-2" /> สร้างแบบทดสอบ
                    </button>
                )}
            </div>

            {userRole === 'teacher' ? (
                <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'} rounded-[2rem] border overflow-hidden`}>
                    <table className="w-full text-left">
                        <thead className={darkMode ? 'bg-slate-800/50' : 'bg-slate-50'}>
                            <tr>
                                <th className={`p-4 font-bold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>ชื่อชุดข้อสอบ</th>
                                <th className={`p-4 font-bold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>สถานะ</th>
                                <th className={`p-4 font-bold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>คำถาม</th>
                                <th className={`p-4 font-bold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>เวลา</th>
                                <th className={`p-4 font-bold text-right ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                            {quizzes.length > 0 ? quizzes.map((quiz) => (
                                <tr key={quiz.firestoreId} className={darkMode ? 'hover:bg-slate-800/30 transition-colors' : 'hover:bg-slate-50 transition-colors'}>
                                    <td className="p-4">
                                        <div className={`font-bold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{quiz.title}</div>
                                        {quiz.scheduledAt && (
                                            <div className={`text-xs flex items-center mt-1 font-medium w-fit px-2 py-0.5 rounded-lg border ${darkMode ? 'bg-orange-900/20 text-orange-400 border-orange-900/30' : 'bg-orange-50 text-orange-500 border-orange-100'}`}>
                                                <Calendar size={12} className="mr-1" />
                                                เริ่ม: {new Date(quiz.scheduledAt).toLocaleString('th-TH', { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => handleToggleQuizStatus(quiz)}
                                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${quiz.status === 'available'
                                                ? (darkMode ? 'bg-green-900/40 text-[#96C68E] border-[#96C68E]' : 'bg-[#F0FDF4] text-[#96C68E] border-[#96C68E]')
                                                : (darkMode ? 'bg-slate-800 text-slate-500 border-slate-700' : 'bg-slate-100 text-slate-400 border-slate-200')
                                                }`}>
                                            {quiz.status === 'available' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                                        </button>
                                    </td>
                                    <td className={`p-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{quiz.questions} ข้อ</td>
                                    <td className={`p-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{parseInt(quiz.time)} นาที</td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleViewResults(quiz)}
                                                className={`p-2 transition-all ${darkMode ? 'text-slate-600 hover:text-yellow-400 hover:bg-yellow-900/20' : 'text-slate-300 hover:text-yellow-500 hover:bg-yellow-50'} rounded-xl`}
                                                title="ดูคะแนน"
                                            >
                                                <Trophy size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleEditQuiz(quiz)}
                                                className={`p-2 transition-all ${darkMode ? 'text-slate-600 hover:text-blue-400 hover:bg-blue-900/20' : 'text-slate-300 hover:text-blue-500 hover:bg-blue-50'} rounded-xl`}
                                                title="แก้ไข"
                                            >
                                                <Settings size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteQuiz(quiz.firestoreId)}
                                                className={`p-2 transition-all ${darkMode ? 'text-slate-600 hover:text-red-400 hover:bg-red-900/20' : 'text-slate-300 hover:text-red-500 hover:bg-red-50'} rounded-xl`}
                                                title="ลบ"
                                            >
                                                <Trash size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="5" className={`p-8 text-center ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>ยังไม่มีแบบทดสอบ</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.filter(q => q.status !== 'closed').sort((a, b) => {
                        const isSubmittedA = !!mySubmissions[a.firestoreId];
                        const isSubmittedB = !!mySubmissions[b.firestoreId];
                        if (isSubmittedA === isSubmittedB) return 0;
                        return isSubmittedA ? 1 : -1;
                    }).map((quiz) => {
                        const scheduledTime = quiz.scheduledAt ? new Date(quiz.scheduledAt) : null;
                        const isLocked = scheduledTime && scheduledTime > currentTime;
                        const submission = mySubmissions[quiz.firestoreId];
                        const isSubmitted = !!submission;

                        return (
                            <div key={quiz.firestoreId || quiz.id} className={`p-6 rounded-3xl border shadow-sm relative overflow-hidden ${isSubmitted
                                ? (darkMode ? 'bg-slate-900 border-indigo-900/30' : 'bg-slate-50 border-slate-200 opacity-80')
                                : (isLocked ? (darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200') : (darkMode ? 'bg-slate-800 border-slate-700 hover:border-indigo-500' : 'bg-white border-slate-100 hover:border-blue-200'))
                                } transition-all duration-300`}>
                                {isLocked && !isSubmitted && (
                                    <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-xs font-bold flex items-center z-10 ${darkMode ? 'bg-orange-950 text-orange-400' : 'bg-orange-100 text-orange-600'}`}>
                                        <Clock size={12} className="mr-1" /> เริ่ม: {scheduledTime.toLocaleString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                )}
                                {isSubmitted && (
                                    <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-xs font-bold flex items-center z-10 ${darkMode ? 'bg-green-950 text-[#96C68E]' : 'bg-green-100 text-green-600'}`}>
                                        <CheckCircle2 size={12} className="mr-1" /> ส่งแล้ว
                                    </div>
                                )}
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 transition-transform ${isLocked ? (darkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-200 text-slate-400') : 'bg-[#F0FDF4] text-[#96C68E] group-hover:scale-110'}`}>
                                        {isLocked ? <Lock size={24} /> : (isSubmitted ? <Award size={24} /> : <ClipboardList size={24} />)}
                                    </div>
                                </div>
                                <h3 className={`text-lg font-bold mb-2 line-clamp-1 ${isLocked ? (darkMode ? 'text-slate-600' : 'text-slate-400') : (darkMode ? 'text-white' : 'text-slate-800')}`}>{quiz.title}</h3>
                                <div className="flex items-center gap-4 text-xs text-slate-500 mb-6 font-medium">
                                    <span className="flex items-center"><HelpCircle size={14} className="mr-1" /> {quiz.questions} ข้อ</span>
                                    <span className="flex items-center"><Clock size={14} className="mr-1" /> {parseInt(quiz.time)} นาที</span>
                                </div>
                                {isSubmitted ? (
                                    <div className={`w-full py-3 rounded-xl font-bold text-center border ${darkMode ? 'bg-green-900/20 text-[#96C68E] border-[#96C68E]/30' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                        คะแนน: {submission.score} / {submission.total}
                                    </div>
                                ) : (
                                    <button
                                        disabled={isLocked}
                                        onClick={() => {
                                            if (isLocked) return;
                                            setActiveQuiz(quiz);
                                            const minutes = parseInt(quiz.time) || 0;
                                            setQuizRemainingSeconds(minutes * 60);
                                            setActiveModal('takeQuiz');
                                        }}
                                        className={`w-full py-3 rounded-xl font-bold transition-all transform ${isLocked
                                            ? (darkMode ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-slate-200 text-slate-400 cursor-not-allowed')
                                            : 'text-white bg-[#96C68E] hover:bg-[#85b57d] shadow-sm hover:shadow active:scale-95'
                                            }`}
                                    >
                                        {isLocked ? `เริ่มสอบ ${scheduledTime.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} ${scheduledTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}` : 'เริ่มทำข้อสอบ'}
                                    </button>
                                )}
                            </div>
                        )
                    })}
                    {quizzes.filter(q => q.status !== 'closed').length === 0 && (
                        <div className="col-span-full py-16 text-center">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${darkMode ? 'bg-slate-800 text-slate-700' : 'bg-slate-50 text-slate-300'}`}>
                                <ClipboardList size={32} />
                            </div>
                            <h3 className={`font-bold ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>ยังไม่มีแบบทดสอบ</h3>
                            <p className={`text-sm mt-1 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>คุณครูยังไม่ได้สร้างแบบทดสอบในวิชานี้</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CourseQuizzes;
