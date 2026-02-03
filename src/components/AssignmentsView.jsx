import React from 'react';
import { CheckSquare, Trash, CheckCircle, FileText, Paperclip, Upload } from 'lucide-react';

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

export const AssignmentDetailModal = ({
    activeModal,
    currentAssignmentData,
    darkMode,
    openBase64InNewTab,
    handleFileUpload,
    uploadFile,
    removeFile,
    handleConfirmSubmit,
    setAssignments
}) => {
    if (activeModal !== 'assignmentDetail' || !currentAssignmentData) return null;

    return (
        <div className="p-8">
            <div className="flex items-start gap-4 mb-6">
                <div className="bg-[#FFE787] p-3 rounded-2xl">
                    <FileText size={32} className="text-slate-700" />
                </div>
                <div className="flex-1">
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{currentAssignmentData.title}</h2>
                    <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{currentAssignmentData.course} • ครบกำหนด {currentAssignmentData.dueDate ? new Date(currentAssignmentData.dueDate).toLocaleString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'ไม่มีกำหนด'}</p>
                </div>
                <div className="bg-[#BEE1FF] px-4 py-2 rounded-xl text-slate-700 font-bold whitespace-nowrap">
                    {(currentAssignmentData.score !== null && currentAssignmentData.score !== undefined && currentAssignmentData.score !== '')
                        ? `${currentAssignmentData.score} / ${currentAssignmentData.maxScore || 10}`
                        : `${currentAssignmentData.maxScore || 10} คะแนน`}
                </div>
            </div>

            <div className={`p-4 rounded-2xl border mb-6 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <h3 className={`font-bold mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>คำชี้แจง</h3>
                <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{currentAssignmentData.description}</p>

                {/* Display attached files from teacher */}
                {currentAssignmentData.files && currentAssignmentData.files.length > 0 && (
                    <div className={`mt-4 border-t pt-3 ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                        <h4 className={`text-sm font-bold mb-2 flex items-center gap-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            <Paperclip size={16} /> ไฟล์แนบ ({currentAssignmentData.files.length})
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                            {currentAssignmentData.files.map((file, idx) => (
                                <div key={idx} className={`flex items-center gap-3 border p-3 rounded-xl justify-between group ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <FileText className="text-[#BEE1FF] flex-shrink-0" size={20} />
                                        <div className="min-w-0">
                                            <p className={`text-sm font-bold truncate ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{file.name}</p>
                                            <p className="text-xs text-slate-400">{(file.size ? (file.size / 1024).toFixed(1) : 0)} KB</p>
                                        </div>
                                    </div>
                                    {file.content && (
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                openBase64InNewTab(file.content, file.type || 'application/pdf'); // Default to PDF if unknown
                                            }}
                                            className="text-xs font-bold text-[#96C68E] bg-[#F0FDF4] px-3 py-1.5 rounded-lg hover:bg-[#96C68E] hover:text-white transition-all whitespace-nowrap"
                                        >
                                            เปิดดูไฟล์
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {/* Fallback for old single file data */}
                {currentAssignmentData.fileName && !currentAssignmentData.files && (
                    <div className={`mt-4 border-t pt-3 ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                        <div className={`flex items-center gap-3 border p-3 rounded-xl ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <FileText className="text-[#BEE1FF]" size={20} />
                            <p className={`text-sm font-bold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{currentAssignmentData.fileName}</p>
                        </div>
                    </div>
                )}
            </div>


            <div className={`border-t pt-6 ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                <h3 className={`font-bold mb-4 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>งานของคุณ</h3>

                {/* 1. กรณีส่งงานเรียบร้อยแล้ว */}
                {currentAssignmentData.status === 'submitted' ? (
                    <div className="space-y-3 animate-in fade-in">
                        <div className="bg-[#F0FDF4] border border-[#96C68E] p-4 rounded-2xl flex items-center gap-3">
                            <CheckCircle className="text-[#96C68E]" />
                            <span className="text-slate-700 font-bold">ส่งงานเรียบร้อยแล้ว</span>
                        </div>

                        <div className="space-y-2">
                            {currentAssignmentData.submittedFiles?.map((file, idx) => (
                                <div key={idx} className={`flex items-center justify-between border p-3 rounded-xl group hover:border-[#96C68E] transition-colors ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                    <div className="flex items-center gap-3">
                                        <FileText size={18} className="text-[#96C68E]" />
                                        <span className={`text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{file.name}</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (file instanceof File) {
                                                window.open(URL.createObjectURL(file), '_blank');
                                            } else if (file.content) {
                                                openBase64InNewTab(file.content, file.type || 'application/pdf');
                                            } else {
                                                alert('ไม่สามารถเปิดไฟล์ได้');
                                            }
                                        }}
                                        className="text-xs font-bold text-[#96C68E] bg-[#F0FDF4] px-3 py-1.5 rounded-lg hover:bg-[#96C68E] hover:text-white transition-all"
                                    >
                                        เปิดดูไฟล์
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="w-full flex justify-end">
                            <button
                                onClick={() => {
                                    setAssignments(prev =>
                                        prev.map(a =>
                                            a.id === currentAssignmentData.id
                                                ? { ...a, status: 'pending', submittedFiles: [] }
                                                : a
                                        )
                                    );
                                }}
                                className="text-sm text-red-400 hover:underline mt-2"
                            >
                                ยกเลิกการส่งเพื่อแก้ไข
                            </button>
                        </div>


                    </div>
                ) : (
                    /* 2. กรณีรอส่งงาน (UI สำหรับอัปโหลด) */
                    <>
                        <div className="relative">
                            <input
                                type="file"
                                multiple
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all mb-4 ${uploadFile.length > 0 ? (darkMode ? 'border-[#96C68E] bg-green-900/10' : 'border-[#96C68E] bg-[#F0FDF4]') : (darkMode ? 'border-slate-600 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-50')
                                }`}>
                                <Upload size={32} className="mx-auto text-slate-400 mb-2" />
                                <p className="text-slate-500 font-bold">คลิกเพื่ออัพโหลดไฟล์งาน</p>
                                <p className="text-xs text-slate-400 mt-1">สามารถเลือกได้หลายไฟล์ (PDF, JPG, PNG)</p>
                            </div>
                        </div>

                        {uploadFile.length > 0 && (
                            <div className="space-y-2 mb-4">
                                {uploadFile.map((file, index) => (
                                    <div key={index} className={`flex items-center justify-between border p-3 rounded-xl animate-in slide-in-from-bottom-2 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                        <div className="flex items-center gap-3">
                                            <FileText size={18} className="text-[#96C68E]" />
                                            <span className={`text-sm font-medium truncate max-w-[200px] ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{file.name}</span>
                                        </div>
                                        <button onClick={() => removeFile(index)} className="text-red-400 hover:text-red-600">
                                            <Trash size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={() => handleConfirmSubmit(currentAssignmentData.id)}
                            disabled={uploadFile.length === 0}
                            className={`w-full py-3 rounded-xl font-bold text-lg shadow-sm flex items-center justify-center transition-all ${uploadFile.length > 0 ? 'bg-[#96C68E] text-white hover:scale-[1.02]' : (darkMode ? 'bg-slate-700 text-slate-500' : 'bg-slate-200 text-slate-400')
                                }`}
                        >
                            <CheckCircle className="mr-2" /> ส่งการบ้าน {uploadFile.length > 0 && `(${uploadFile.length} ไฟล์)`}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
