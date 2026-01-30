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
    const courseAssignments = assignments.filter(a => a.course === selectedCourse.name);
    const pendingWork = courseAssignments.filter(a => a.status !== 'submitted');
    const submittedWork = courseAssignments.filter(a => a.status === 'submitted');

    const renderCard = (data) => {
        const isDone = data.status === 'submitted';
        let overdueDays = 0;
        if (data.dueDate) {
            const due = new Date(data.dueDate);
            const compareDate = isDone && data.submittedAt ? new Date(data.submittedAt) : (isDone ? due : new Date());

            if (compareDate > due) {
                const diffTime = Math.abs(compareDate - due);
                if (!isDone || (isDone && data.submittedAt && new Date(data.submittedAt) > due)) {
                    overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                }
            }
        }

        return (
            <div key={data.id || data.firestoreId} className={`p-4 rounded-2xl border flex items-center justify-between group transition-all ${isDone
                ? (darkMode ? 'bg-slate-800/50 border-slate-700 opacity-60' : 'bg-slate-50/50 border-slate-100 opacity-80')
                : (darkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-600 shadow-lg shadow-black/20' : 'bg-white border-slate-100 hover:shadow-md')
                }`}>
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${isDone
                        ? (darkMode ? 'bg-green-900/20 text-green-400' : 'bg-green-50 text-green-500')
                        : (darkMode ? 'bg-yellow-900/20 text-yellow-400' : 'bg-yellow-50 text-yellow-500')
                        }`}>
                        {isDone ? <CheckCircle size={20} className={darkMode ? 'text-green-400' : 'text-green-500'} /> : <FileText size={20} className={darkMode ? 'text-yellow-400' : 'text-yellow-500'} />}
                    </div>
                    <div>
                        <h4 className={`font-bold ${isDone
                            ? (darkMode ? 'text-slate-500' : 'text-slate-400')
                            : (darkMode ? 'text-slate-200' : 'text-slate-800')
                            }`}>{data.title}</h4>
                        <div className="flex items-center gap-2">
                            <p className={`text-xs ${isDone
                                ? (darkMode ? 'text-green-400 font-bold' : 'text-green-500 font-bold')
                                : (darkMode ? 'text-slate-500' : 'text-slate-400')
                                }`}>
                                {isDone ? 'ส่งเรียบร้อยแล้ว' : (data.dueDate ? `กำหนดส่ง: ${new Date(data.dueDate).toLocaleString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}` : 'ยังไม่มีกำหนดส่ง')}
                            </p>
                            {overdueDays > 0 && userRole === 'student' && (
                                <span className="text-xs font-bold text-red-500">
                                    (ล่าช้า {overdueDays} วัน)
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            setSelectedAssignment(data);
                            if (userRole === 'teacher') openGradingModal(data);
                            else setActiveModal('assignmentDetail');
                        }}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${darkMode
                            ? 'bg-slate-700 text-slate-300 hover:bg-indigo-900/30 hover:text-indigo-400'
                            : 'bg-slate-50 text-slate-400 group-hover:bg-[#BEE1FF] group-hover:text-slate-800'
                            }`}
                    >
                        {isDone ? 'ดูผลการเรียน' : 'ดูรายละเอียด'}
                    </button>
                    {userRole === 'teacher' && (
                        <div className="flex gap-2">
                            <button
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    if (window.confirm('คุณต้องการลบงานนี้ใช่หรือไม่?')) {
                                        try {
                                            await deleteAssignment(data.firestoreId || data.id);
                                            setAssignments(prev => prev.filter(c => c.id !== data.id));
                                        } catch (err) {
                                            console.error(err);
                                            alert('ลบไม่สำเร็จ');
                                        }
                                    }
                                }}
                                className={`p-2 rounded-xl transition-all ${darkMode
                                    ? 'text-slate-500 hover:text-red-400 hover:bg-red-900/20'
                                    : 'text-slate-300 hover:text-red-500 hover:bg-red-50'
                                    }`}
                                title="ลบงาน"
                            >
                                <Trash size={20} />
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
                            <Clock className="mr-2 text-yellow-500" size={18} /> งานทั้งหมด ({pendingWork.length})
                        </h3>
                        <div className="space-y-3">
                            {pendingWork.length > 0 ? pendingWork.map(renderCard) : (
                                <div className={`p-8 rounded-2xl text-center border-2 border-dashed ${darkMode ? 'bg-slate-800/50 text-slate-500 border-slate-700' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                                    ไม่มีงานค้าง ดีมาก! ✨
                                </div>
                            )}
                        </div>
                    </section>

                    {userRole === 'student' && submittedWork.length > 0 && (
                        <section className={`pt-4 border-t ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                            <h3 className={`text-md font-bold mb-3 flex items-center ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                <CheckCircle className="mr-2 text-green-500" size={18} /> ส่งแล้ว ({submittedWork.length})
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
