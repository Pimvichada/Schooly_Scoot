import React from 'react';
import { PieChart, Trophy, CheckCircle2, FileText, CheckSquare } from 'lucide-react';

const CourseGrades = ({
    darkMode,
    quizzes,
    mySubmissions,
    userRole,
    handleViewResults,
    assignments,
    selectedCourse,
    openGradingModal
}) => {
    const courseAssignments = assignments.filter(a => a.course === selectedCourse.name);

    return (
        <div className={`space-y-6 animate-in fade-in duration-300 ${darkMode ? 'text-slate-100' : ''}`}>
            <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-bold flex items-center ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                    <PieChart className="mr-2 text-[#96C68E]" /> คะแนนสอบ
                </h2>
            </div>

            <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'} rounded-2xl md:rounded-3xl border overflow-hidden`}>
                {/* Desktop View: Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className={`${darkMode ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-50 text-slate-500'} border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'} text-xs md:text-sm`}>
                            <tr>
                                <th className="p-3 md:p-4 font-bold">รายการสอบ</th>
                                <th className="p-3 md:p-4 font-bold">คะแนน</th>
                                <th className="p-3 md:p-4 font-bold">วันที่เปิดสอบ</th>
                                <th className="p-3 md:p-4 font-bold text-right">ผลลัพธ์</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-50'}`}>
                            {quizzes.length > 0 ? quizzes.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).map((quiz) => {
                                const submission = mySubmissions[quiz.firestoreId];
                                const isSubmitted = !!submission;

                                return (
                                    <tr key={quiz.firestoreId} className={`${darkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50/30'} transition-colors`}>
                                        <td className="p-3 md:p-4">
                                            <div className={`font-bold text-sm md:text-base ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{quiz.title}</div>
                                        </td>
                                        <td className={`p-3 md:p-4 text-xs md:text-sm font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                            {userRole === 'teacher' ? (
                                                <span>{quiz.questions} คะแนน</span>
                                            ) : (
                                                isSubmitted ? (
                                                    <span className="text-[#96C68E]">{submission.score} / {submission.total}</span>
                                                ) : (
                                                    <span className={darkMode ? 'text-slate-500' : 'text-slate-500'}>เต็ม {quiz.questions}</span>
                                                )
                                            )}
                                        </td>
                                        <td className="p-3 md:p-4 text-xs md:text-sm text-slate-400">
                                            {quiz.status === 'inactive' && quiz.activatedAt ? new Date(quiz.activatedAt).toLocaleString('th-TH', { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : (quiz.scheduledAt ? new Date(quiz.scheduledAt).toLocaleString('th-TH', { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : (quiz.createdAt ? new Date(quiz.createdAt).toLocaleString('th-TH', { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'))}
                                        </td>
                                        <td className="p-3 md:p-4 text-right">
                                            {userRole === 'teacher' ? (
                                                <button
                                                    onClick={() => handleViewResults(quiz)}
                                                    className={`px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all ${darkMode ? 'bg-amber-900/30 text-amber-400 border border-amber-900/50 hover:bg-amber-900/50' : 'bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100'}`}
                                                >
                                                    ดูผลสอบ
                                                </button>
                                            ) : (
                                                isSubmitted ? (
                                                    <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] md:text-xs font-bold ${darkMode ? 'bg-green-900/30 text-[#96C68E]' : 'bg-green-50 text-green-600'}`}>
                                                        <CheckCircle2 size={12} className="mr-1" /> ส่งแล้ว
                                                    </span>
                                                ) : (
                                                    <span className={darkMode ? 'text-slate-600' : 'text-slate-400'}>-</span>
                                                )
                                            )}
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="4" className={`p-8 text-center ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>ยังไม่มีรายการสอบ</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View: Cards */}
                <div className="md:hidden divide-y divide-slate-50 dark:divide-slate-800">
                    {quizzes.length > 0 ? quizzes.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).map((quiz) => {
                        const submission = mySubmissions[quiz.firestoreId];
                        const isSubmitted = !!submission;

                        return (
                            <div key={quiz.firestoreId} className={`p-4 ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className={`font-bold text-sm ${darkMode ? 'text-slate-200' : 'text-slate-700'} min-w-0 pr-2 truncate`}>
                                        {quiz.title}
                                    </div>
                                    <div className="shrink-0">
                                        {userRole === 'teacher' ? (
                                            <button
                                                onClick={() => handleViewResults(quiz)}
                                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all shadow-sm flex items-center gap-1 ${darkMode ? 'bg-amber-900/30 text-amber-400 border border-amber-900/50' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}
                                            >
                                               ดูผลสอบ
                                            </button>
                                        ) : (
                                            isSubmitted ? (
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold ${darkMode ? 'bg-green-900/30 text-[#96C68E]' : 'bg-green-50 text-green-600'}`}>
                                                    <CheckCircle2 size={10} className="mr-1" /> ส่งแล้ว
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-slate-400">รอส่ง</span>
                                            )
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-[11px]">
                                    <div className={`font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {userRole === 'teacher' ? `${quiz.questions} คะแนน` : (isSubmitted ? `คะแนน: ${submission.score}/${submission.total}` : `เต็ม ${quiz.questions}`)}
                                    </div>
                                    <div className="text-slate-400 font-medium">
                                        {quiz.status === 'inactive' && quiz.activatedAt ? new Date(quiz.activatedAt).toLocaleString('th-TH', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : (quiz.scheduledAt ? new Date(quiz.scheduledAt).toLocaleString('th-TH', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : (quiz.createdAt ? new Date(quiz.createdAt).toLocaleString('th-TH', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'))}
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className={`p-8 text-center text-sm ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>ยังไม่มีรายการสอบ</div>
                    )}
                </div>
            </div>

            <div className="flex justify-between items-center mb-4 mt-8">
                <h2 className={`text-xl font-bold flex items-center ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                    <FileText className={`mr-2 ${darkMode ? 'text-orange-400' : 'text-[#FF917B]'}`} /> คะแนนงาน
                </h2>
            </div>
            <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'} rounded-2xl md:rounded-3xl border overflow-hidden`}>
                {/* Desktop View: Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className={`${darkMode ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-50 text-slate-500'} border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'} text-xs md:text-sm`}>
                            <tr>
                                <th className="p-3 md:p-4 font-bold">ชื่องาน</th>
                                <th className="p-3 md:p-4 font-bold">คะแนน</th>
                                <th className="p-3 md:p-4 font-bold">วันที่สั่งงาน</th>
                                <th className="p-3 md:p-4 font-bold">วันที่กำหนดส่ง</th>
                                <th className="p-3 md:p-4 font-bold text-right">ผลลัพธ์</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-50'}`}>
                            {courseAssignments.length > 0 ? courseAssignments.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).map((assign) => (
                                <tr key={assign.id} className={`${darkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50/30'}`}>
                                    <td className="p-3 md:p-4">
                                        <div className={`font-bold text-sm md:text-base ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{assign.title}</div>
                                    </td>
                                    <td className={`p-3 md:p-4 text-xs md:text-sm font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                        {assign.score ? (
                                            <span className="text-[#96C68E]">{assign.score} / {assign.maxScore || 10}</span>
                                        ) : (
                                            <span className={darkMode ? 'text-slate-600' : 'text-slate-400'}>{userRole === 'teacher' ? (assign.maxScore || 10) : '-'}</span>
                                        )}
                                    </td>
                                    <td className={`p-3 md:p-4 text-xs md:text-sm ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                                        {assign.createdAt ? new Date(assign.createdAt).toLocaleString('th-TH', { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}
                                    </td>
                                    <td className={`p-3 md:p-4 text-xs md:text-sm ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                                        {assign.dueDate ? new Date(assign.dueDate).toLocaleString('th-TH', { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}
                                    </td>
                                    <td className="p-3 md:p-4 text-right">
                                        {userRole === 'teacher' ? (
                                            <button
                                                onClick={() => openGradingModal(assign)}
                                                className={`px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all ${darkMode ? 'bg-amber-900/30 text-amber-400 border border-amber-900/50 hover:bg-amber-900/50' : 'bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100'}`}
                                            >
                                                <CheckSquare size={12} className="inline mr-1 md:w-3.5 md:h-3.5" /> ตรวจงาน
                                            </button>
                                        ) : (
                                            assign.status === 'submitted' ? (
                                                <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] md:text-xs font-bold ${darkMode ? 'bg-green-900/30 text-[#96C68E]' : 'bg-green-50 text-green-600'}`}>
                                                    <CheckCircle2 size={12} className="mr-1" /> ส่งแล้ว
                                                </span>
                                            ) : (
                                                <span className={darkMode ? 'text-slate-600' : 'text-slate-400'}>ยังไม่ส่ง</span>
                                            )
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className={`p-8 text-center ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>ยังไม่มีการบ้าน</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View: Cards */}
                <div className="md:hidden divide-y divide-slate-50 dark:divide-slate-800">
                    {courseAssignments.length > 0 ? courseAssignments.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).map((assign) => (
                        <div key={assign.id} className={`p-4 ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <div className={`font-bold text-sm ${darkMode ? 'text-slate-200' : 'text-slate-700'} min-w-0 pr-2 truncate`}>
                                    {assign.title}
                                </div>
                                <div className="shrink-0">
                                    {userRole === 'teacher' ? (
                                        <button
                                            onClick={() => openGradingModal(assign)}
                                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all shadow-sm flex items-center gap-1 ${darkMode ? 'bg-amber-900/30 text-amber-400 border border-amber-900/50' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}
                                        >
                                            <CheckSquare size={11} /> ตรวจงาน
                                        </button>
                                    ) : (
                                        assign.status === 'submitted' ? (
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold ${darkMode ? 'bg-green-900/30 text-[#96C68E]' : 'bg-green-50 text-green-600'}`}>
                                                <CheckCircle2 size={10} className="mr-1" /> ส่งแล้ว
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-slate-400">ยังไม่ส่ง</span>
                                        )
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[10px] mt-2">
                                <div>
                                    <span className="text-slate-400 block mb-0.5">วันที่สั่ง:</span>
                                    <span className={darkMode ? 'text-slate-300' : 'text-slate-600'}>{assign.createdAt ? new Date(assign.createdAt).toLocaleDateString('th-TH') : '-'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block mb-0.5">กำหนดส่ง:</span>
                                    <span className="text-red-400">{assign.dueDate ? new Date(assign.dueDate).toLocaleDateString('th-TH') : '-'}</span>
                                </div>
                            </div>
                            {assign.score && (
                                <div className="mt-3 pt-2 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                                    <span className="text-[11px] font-bold text-slate-500 uppercase">คะแนนสะสม</span>
                                    <span className="text-sm font-black text-[#96C68E]">{assign.score} / {assign.maxScore || 10}</span>
                                </div>
                            )}
                        </div>
                    )) : (
                        <div className={`p-8 text-center text-sm ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>ยังไม่มีการบ้าน</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseGrades;
