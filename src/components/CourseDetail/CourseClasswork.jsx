import React from 'react';
import { Plus, Clock, FileText, CheckCircle, Trash } from 'lucide-react';

const CourseClasswork = ({
    darkMode,
    selectedCourse,
    assignments,
    setAssignments,
    userRole,
    openGradingModal,
    setActiveModal,
    setSelectedAssignment,
    deleteAssignment,
    workView,
    setWorkView,
    setNewAssignment
}) => {
    const isTeacher = userRole?.toLowerCase() === 'teacher';

    const isAllSubmitted = (assign) => {
        if (!selectedCourse) return false;
        const allStudentIds = selectedCourse.studentIds || [];
        const actualStudentIds = allStudentIds.filter(id => id !== selectedCourse.ownerId);
        if (actualStudentIds.length === 0) return false;
        const submittedStudentIds = assign.submissions
            ? [...new Set(assign.submissions.map(s => s.userId))]
            : [];
        const missingIds = actualStudentIds.filter(id => !submittedStudentIds.includes(id));
        return assign.submissionCount > 0 && missingIds.length === 0;
    };

    const isAllCompleted = (assign) => {
        if (!selectedCourse) return false;
        const allStudentIds = selectedCourse.studentIds || [];
        const actualStudentIds = allStudentIds.filter(id => id !== selectedCourse.ownerId);
        if (actualStudentIds.length === 0) return false;
        const submittedStudentIds = assign.submissions
            ? [...new Set(assign.submissions.map(s => s.userId))]
            : [];
        const missingIds = actualStudentIds.filter(id => !submittedStudentIds.includes(id));
        return assign.submissionCount > 0 && missingIds.length === 0 && assign.pendingCount === 0;
    };

    const courseAssignments = assignments.filter(a => a.course === selectedCourse.name).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    const pendingWork = courseAssignments.filter(a => isTeacher ? !isAllCompleted(a) : a.status !== 'submitted');
    const submittedWork = courseAssignments.filter(a => isTeacher ? isAllCompleted(a) : a.status === 'submitted');

    const renderCard = (data) => {
        const completed = isTeacher ? isAllCompleted(data) : (data.status === 'submitted');
        const allSubmitted = isTeacher ? isAllSubmitted(data) : completed;
        const isLate = (data.status === 'late' || (data.dueDate && new Date(data.dueDate) < new Date())) && !completed;

        // const badge = (() => {
        //     if (isTeacher) {
        //         if (completed) return { text: 'ตรวจแล้ว', color: darkMode ? 'bg-green-900/40 text-green-400' : 'bg-green-50 text-green-600' };
        //         if (allSubmitted) return { text: 'ส่งครบ', color: darkMode ? 'bg-yellow-900/40 text-yellow-400' : 'bg-yellow-50 text-yellow-600' };
        //         return { text: 'ส่งไม่ครบ', color: darkMode ? 'bg-red-900/40 text-red-400' : 'bg-red-50 text-red-600' };
        //     } else {
        //         if (completed) return { text: 'ส่งแล้ว', color: darkMode ? 'bg-green-900/40 text-green-400' : 'bg-green-50 text-green-600' };
        //         if (isLate) return { text: 'เลยกำหนด', color: darkMode ? 'bg-red-900/40 text-red-400' : 'bg-red-50 text-red-600' };
        //         return { text: 'ยังไม่ส่ง', color: darkMode ? 'bg-yellow-900/40 text-yellow-400' : 'bg-yellow-50 text-yellow-600' };
        //     }
        // })();

        return (
            <div key={data.id || data.firestoreId} className={`p-3 md:p-4 rounded-2xl border flex items-center justify-between group transition-all ${completed
                ? (darkMode ? 'bg-slate-800/50 border-slate-700 opacity-60' : 'bg-slate-50/50 border-slate-100 opacity-80')
                : (darkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-600 shadow-lg shadow-black/20' : 'bg-white border-slate-100 hover:shadow-md')
                }`}>
                <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
                    <div className="min-w-0 flex-1">
                        <h4 className={`font-bold text-sm md:text-base leading-snug truncate ${completed
                            ? (darkMode ? 'text-slate-500' : 'text-slate-400')
                            : (darkMode ? 'text-slate-200' : 'text-slate-800')
                            }`} title={data.title}>{data.title}</h4>
                        <div className="flex flex-wrap items-center gap-y-0 gap-x-2 mt-0.5">
                            <p className={`text-[10px] md:text-xs ${completed
                                ? (darkMode ? 'text-green-400 font-bold' : 'text-green-500 font-bold')
                                : (darkMode ? 'text-slate-500' : 'text-slate-400')
                                }`}>
                                {isTeacher
                                    ? `ส่งแล้ว ${data.submissionCount || 0}/${(() => {
                                        const count = selectedCourse.studentIds?.length || 0;
                                        return count;
                                    })()} คน`
                                    : (completed ? 'ส่งเรียบร้อยแล้ว' : (data.dueDate ? `กำหนดส่ง: ${new Date(data.dueDate).toLocaleString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}` : 'ยังไม่มีกำหนดส่ง'))
                                }
                            </p>
                            {isLate && userRole === 'student' && (
                                <span className="text-[10px] md:text-xs font-bold text-red-500 whitespace-nowrap">
                                    (เลยกำหนด)
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2 ml-2">
                    <button
                        onClick={() => {
                            setSelectedAssignment(data);
                            if (isTeacher) openGradingModal(data);
                            else setActiveModal('assignmentDetail');
                        }}
                        className={`px-2.5 md:px-4 py-1.5 md:py-2 rounded-xl text-[11px] md:text-sm font-bold transition-colors whitespace-nowrap ${darkMode
                            ? 'bg-slate-700 text-slate-300 hover:bg-indigo-900/30 hover:text-indigo-400'
                            : 'bg-slate-50 text-slate-400 group-hover:bg-[#BEE1FF] group-hover:text-slate-800'
                            }`}
                    >
                        {isTeacher ? 'ตรวจงาน' : (completed ? 'ดูผล' : 'ส่งการบ้าน')}
                    </button>
                    {isTeacher && (
                        <div className="flex gap-1.5 md:gap-2">
                            <button
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    if (await window.confirm('คุณต้องการลบงานนี้ใช่หรือไม่?')) {
                                        try {
                                            await deleteAssignment(data.firestoreId || data.id);
                                            setAssignments(prev => prev.filter(c => c.id !== data.id));
                                        } catch (err) {
                                            console.error(err);
                                            alert('ลบไม่สำเร็จ');
                                        }
                                    }
                                }}
                                className={`p-1.5 md:p-2 rounded-xl transition-all ${darkMode
                                    ? 'text-slate-500 hover:text-red-400 hover:bg-red-900/20'
                                    : 'text-slate-300 hover:text-red-500 hover:bg-red-50'
                                    }`}
                                title="ลบงาน"
                            >
                                <Trash size={16} className="md:w-5 md:h-5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Search/Filter Controls could go here */}
            <div className={`p-4 rounded-2xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <div>
                    <h2 className={`text-xl font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>งานในชั้นเรียน</h2>
                    <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>จัดการงานและการบ้านของคุณ</p>
                </div>

                {userRole === 'teacher' && (
                    <button
                        onClick={() => {
                            setNewAssignment(prev => ({ ...prev, course: selectedCourse.name }));
                            setActiveModal('createAssignment');
                        }}
                        className="px-4 py-2 bg-[#96C68E] text-white rounded-xl font-bold text-sm shadow-sm hover:bg-[#85b57d] hover:shadow transition-all flex items-center"
                    >
                        <Plus size={16} className="mr-2" /> มอบหมายงานใหม่
                    </button>
                )}
            </div>

            {workView === 'current' ? (
                <div className="space-y-6">
                    <section>
                        <h3 className={`text-md font-bold mb-3 flex items-center ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                            <Clock className="mr-2 text-yellow-500" size={18} /> {isTeacher ? 'งานที่ยังไม่เสร็จ' : 'งานทั้งหมด'} ({pendingWork.length})
                        </h3>
                        <div className="space-y-3">
                            {pendingWork.length > 0 ? pendingWork.map(renderCard) : (
                                <div className={`p-8 rounded-2xl text-center border-2 border-dashed ${darkMode ? 'bg-slate-800/50 text-slate-500 border-slate-700' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                                    {isTeacher ? 'ไม่มีงานค้างเลย สุดยอด! ✨' : 'ไม่มีงานค้าง ดีมาก! ✨'}
                                </div>
                            )}
                        </div>
                    </section>

                    {(isTeacher ? submittedWork.length > 0 : (userRole === 'student' && submittedWork.length > 0)) && (
                        <section className={`pt-4 border-t ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                            <h3 className={`text-md font-bold mb-3 flex items-center ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                <CheckCircle className="mr-2 text-green-500" size={18} /> {isTeacher ? 'ตรวจแล้ว' : 'ส่งแล้ว'} ({submittedWork.length})
                            </h3>
                            <div className="space-y-3">
                                {submittedWork.map(renderCard)}
                            </div>
                        </section>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {courseAssignments.length > 0 ? (
                        courseAssignments.map(renderCard)
                    ) : (
                        <div className={`p-20 text-center ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>ยังไม่มีข้อมูลงาน</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CourseClasswork;
