import React from 'react';
import { CheckSquare, Trash, CheckCircle } from 'lucide-react';

const AssignmentsView = ({
    darkMode,
    assignments,
    courses,
    userRole,
    assignmentFilter,
    setAssignmentFilter,
    openGradingModal,
    setSelectedAssignment,
    setActiveModal,
    deleteAssignment,
    setAssignments
}) => {
    // 1. Base Filter: Filter by Course (User must be related to the course)
    const userAssignments = assignments.filter(assign =>
        courses.some(c => c.name === assign.course)
    );

    // 2. Filter by Status Tab (for the list display)
    const filteredAssignments = userAssignments.filter(assign => {
        if (assignmentFilter === 'all') return true;
        if (assignmentFilter === 'pending') {
            return assign.status === 'pending' || assign.status === 'late';
        } else { // submitted
            return assign.status === 'submitted';
        }
    });

    return (
        <div className={`space-y-6 ${darkMode ? 'text-slate-100' : ''}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className={`text-2xl font-bold flex items-center ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                    <CheckSquare className="mr-3 text-[#FF917B]" />
                    {userRole === 'student' ? 'การบ้านของฉัน' : 'งานที่มอบหมาย'}
                </h1>

                {/* Tab Switcher */}
                <div className={`${darkMode ? 'bg-slate-800' : 'bg-slate-100'} p-1 rounded-xl w-fit flex`}>
                    <button
                        onClick={() => setAssignmentFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${assignmentFilter === 'all'
                            ? (darkMode ? 'bg-slate-700 text-white shadow-md' : 'bg-white text-slate-800 shadow-sm')
                            : `text-slate-500 hover:text-slate-700 ${darkMode ? 'dark:hover:text-slate-300' : ''}`
                            }`}
                    >
                        ทั้งหมด ({userAssignments.length})
                    </button>
                    <button
                        onClick={() => setAssignmentFilter('pending')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${assignmentFilter === 'pending'
                            ? (darkMode ? 'bg-slate-700 text-white shadow-md' : 'bg-white text-slate-800 shadow-sm')
                            : `text-slate-500 hover:text-slate-700 ${darkMode ? 'dark:hover:text-slate-300' : ''}`
                            }`}
                    >
                        {userRole === 'teacher' ? 'รอตรวจ' : 'ยังไม่ส่ง'} ({userAssignments.filter(a => a.status !== 'submitted').length})
                    </button>
                    <button
                        onClick={() => setAssignmentFilter('submitted')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${assignmentFilter === 'submitted'
                            ? (darkMode ? 'bg-slate-700 text-white shadow-md' : 'bg-white text-slate-800 shadow-sm')
                            : `text-slate-500 hover:text-slate-700 ${darkMode ? 'dark:hover:text-slate-300' : ''}`
                            }`}
                    >
                        {userRole === 'teacher' ? 'เสร็จสิ้น' : 'ส่งแล้ว'} ({userAssignments.filter(a => a.status === 'submitted').length})
                    </button>
                </div>
            </div>

            <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} rounded-3xl p-6 shadow-sm border`}>
                <div className="space-y-4">
                    {filteredAssignments.length > 0 ? (
                        filteredAssignments.map((assign) => (
                            <div key={assign.id} className={`flex flex-col md:flex-row md:items-center p-4 border rounded-2xl transition-all cursor-pointer ${darkMode ? 'border-slate-800 hover:border-indigo-900 hover:bg-slate-800/50' : 'border-slate-100 hover:border-[#BEE1FF] hover:bg-slate-50'}`}>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${assign.status === 'pending' ? (darkMode ? 'bg-yellow-900/40 text-yellow-400' : 'bg-yellow-100 text-yellow-600') :
                                            assign.status === 'submitted' ? (darkMode ? 'bg-green-900/40 text-green-400' : 'bg-green-100 text-green-600') : (darkMode ? 'bg-red-900/40 text-red-400' : 'bg-red-100 text-red-600')
                                            }`}>
                                            {assign.status === 'pending' ? 'รอส่ง' : assign.status === 'submitted' ? 'ส่งแล้ว' : 'เลยกำหนด'}
                                        </span>
                                        <span className="text-xs text-slate-500">{assign.course}</span>
                                    </div>
                                    <h3 className={`font-bold text-lg ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>{assign.title}</h3>
                                    <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>กำหนดส่ง: {assign.dueDate ? new Date(assign.dueDate).toLocaleString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'ยังไม่กำหนด'}</p>
                                </div>

                                <div className="mt-4 md:mt-0 flex items-center gap-4">
                                    {(assign.score !== undefined && assign.score !== null && assign.score !== '') && (
                                        <div className="text-right">
                                            <div className="text-xs text-slate-500">คะแนน</div>
                                            <div className="font-bold text-[#96C68E] text-xl">{assign.score}</div>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => {
                                            if (userRole === 'teacher') {
                                                openGradingModal(assign);
                                            } else {
                                                setSelectedAssignment(assign);
                                                setActiveModal('assignmentDetail');
                                            }
                                        }}
                                        className={`px-6 py-2 rounded-xl font-bold text-sm ${userRole === 'teacher'
                                            ? (darkMode ? 'bg-slate-800 border-2 border-[#96C68E] text-[#96C68E] hover:bg-slate-700' : 'bg-white border-2 border-[#96C68E] text-[#96C68E] hover:bg-slate-50')
                                            : 'bg-[#BEE1FF] text-slate-800 hover:bg-[#A0D5FF]'
                                            } transition-colors`}>
                                        {userRole === 'teacher' ? 'ตรวจงาน' : (assign.status === 'submitted' ? 'ดูงานที่ส่ง' : 'ส่งการบ้าน')}
                                    </button>

                                    {userRole === 'teacher' && (
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                if (window.confirm('คุณต้องการลบงานนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
                                                    try {
                                                        await deleteAssignment(assign.firestoreId || assign.id);
                                                        // Remove from local state
                                                        setAssignments(prev => prev.filter(a => a.id !== assign.id));
                                                    } catch (error) {
                                                        console.error('Failed to delete', error);
                                                        alert('ลบงานไม่สำเร็จ');
                                                    }
                                                }
                                            }}
                                            className={`p-2 rounded-xl transition-all ${darkMode ? 'text-slate-500 hover:text-red-400 hover:bg-red-900/20' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
                                            title="ลบงาน"
                                        >
                                            <Trash size={20} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                                <CheckCircle className="text-slate-500" size={32} />
                            </div>
                            <p className="text-slate-500 font-medium">ไม่มีรายการการบ้านในหมวดนี้</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssignmentsView;
