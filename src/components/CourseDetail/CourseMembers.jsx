import React from 'react';
import { AlertCircle, LogOut } from 'lucide-react';

const CourseMembers = ({
    darkMode,
    userRole,
    pendingMembers,
    handleApprove,
    handleReject,
    selectedCourse,
    members,
    handleLeaveCourse
}) => {
    return (
        <div className={`rounded-3xl p-6 shadow-sm border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            {/* Pending Requests Section (For Teachers) */}
            {userRole === 'teacher' && pendingMembers.length > 0 && (
                <div className={`${darkMode ? 'bg-yellow-900/10 border-yellow-900/30' : 'bg-yellow-50 border-yellow-100'} p-4 rounded-2xl border mb-8`}>
                    <h3 className={`font-bold mb-4 text-lg border-b pb-2 flex items-center ${darkMode ? 'text-yellow-500 border-yellow-900/30' : 'text-yellow-700 border-yellow-200'}`}>
                        <AlertCircle className="mr-2" size={20} /> คำขอเข้าร่วม ({pendingMembers.length})
                    </h3>
                    <div className="space-y-3">
                        {pendingMembers.map(m => (
                            <div key={m.id} className={`${darkMode ? 'bg-slate-800' : 'bg-white'} flex items-center justify-between p-3 rounded-xl shadow-sm`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${m.avatar || (darkMode ? 'bg-slate-700 text-slate-300' : 'bg-yellow-200 text-slate-700')}`}>
                                        {m.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className={`font-bold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{m.name}</p>
                                        <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>ขอเข้าร่วม</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleApprove(m.id)}
                                        className="bg-[#96C68E] text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-[#85b57d] transition-colors"
                                    >
                                        อนุมัติ
                                    </button>
                                    <button
                                        onClick={() => handleReject(m.id)}
                                        className={`${darkMode ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-red-100 text-red-500 hover:bg-red-200'} px-3 py-1.5 rounded-lg text-sm font-bold transition-colors`}
                                    >
                                        ปฏิเสธ
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ครูผู้สอน */}
            <h3 className={`font-bold mb-4 text-lg border-b pb-2 ${darkMode ? 'text-orange-400 border-slate-800' : 'text-[#FF917B] border-slate-100'}`}>ครูผู้สอน</h3>
            <div className="flex items-center gap-4 mb-8">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${darkMode ? 'bg-orange-900/40 text-orange-400' : 'bg-[#FF917B] text-white'}`}>T</div>
                <span className={`font-bold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{selectedCourse.teacher}</span>
            </div>

            <h3 className={`font-bold mb-4 text-lg border-b pb-2 ${darkMode ? 'text-[#96C68E] border-slate-800' : 'text-[#96C68E] border-slate-100'}`}>เพื่อนร่วมชั้น ({members.length} คน)</h3>
            <div className="space-y-4">
                {members.length > 0 ? members.map(m => (
                    <div key={m.id} className="flex items-center gap-4 group">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs transition-colors ${darkMode ? 'bg-slate-800 text-slate-500 group-hover:bg-indigo-900/30 group-hover:text-indigo-400' : 'bg-blue-50 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600'} ${m.avatar || ''}`}>Std</div>
                        <span className={`font-medium transition-colors ${darkMode ? 'text-slate-300 group-hover:text-white' : 'text-slate-700 group-hover:text-slate-900'}`}>{m.name}</span>
                    </div>
                )) : (
                    <p className={`${darkMode ? 'text-slate-600' : 'text-slate-500'}`}>ยังไม่มีนักเรียนในวิชานี้</p>
                )}
            </div>

            {userRole === 'student' && (
                <div className={`mt-8 pt-6 border-t flex justify-center ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                    <button
                        onClick={handleLeaveCourse}
                        className={`px-6 py-3 rounded-xl text-sm font-bold flex items-center transition-colors ${darkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-500 hover:bg-red-50'}`}
                    >
                        <LogOut size={18} className="mr-2" /> ออกจากห้องเรียนนี้
                    </button>
                </div>
            )}
        </div>
    );
};

export default CourseMembers;
