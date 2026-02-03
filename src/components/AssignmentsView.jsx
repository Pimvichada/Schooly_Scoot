import React from 'react';
import { CheckSquare, Trash, CheckCircle, FileText, Paperclip, Upload, X, Save, Eye, AlertCircle } from 'lucide-react';

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
export const CreateAssignmentModal = ({
    activeModal,
    setActiveModal,
    newAssignment,
    setNewAssignment,
    auth,
    createAssignment,
    setAssignments,
    courses,
    createNotification
}) => {
    if (activeModal !== 'createAssignment') return null;

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
                เพิ่มงานในชั้นเรียน
            </h2>

            <div className="space-y-4">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="ชื่องาน"
                            className="w-full p-3 rounded-xl border"
                            value={newAssignment.title}
                            onChange={(e) =>
                                setNewAssignment({ ...newAssignment, title: e.target.value })
                            }
                        />
                    </div>
                    <div className="w-32">
                        <input
                            type="number"
                            placeholder="คะแนนเต็ม"
                            className="w-full p-3 rounded-xl border text-center"
                            value={newAssignment.maxScore}
                            onChange={(e) =>
                                setNewAssignment({ ...newAssignment, maxScore: e.target.value })
                            }
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-600 mb-1">
                        กำหนดส่ง
                    </label>

                    <input
                        type="datetime-local"
                        className="
      w-full p-3 rounded-xl
      border border-slate-200
      bg-white text-slate-700
      focus:outline-none
      focus:border-[#96C68E]
      focus:ring-1 focus:ring-[#96C68E]/30
    "
                        value={newAssignment.dueDate}
                        onChange={(e) =>
                            setNewAssignment({
                                ...newAssignment,
                                dueDate: e.target.value,
                            })
                        }
                    />

                    <p className="text-xs text-slate-400 mt-1">
                        เลือกวันและเวลาที่ต้องการให้ส่งงาน
                    </p>
                </div>



                <textarea
                    placeholder="คำอธิบายงาน"
                    rows={4}
                    className="w-full p-3 rounded-xl border"
                    value={newAssignment.description}
                    onChange={(e) =>
                        setNewAssignment({ ...newAssignment, description: e.target.value })
                    }
                />

                {/* แนบไฟล์สำหรับงานที่กำลังสร้าง */}
                <div>
                    <label className="block text-sm font-bold text-slate-600 mb-1">
                        แนบไฟล์ (ถ้ามี)
                    </label>

                    <input
                        type="file"
                        multiple // Allow multiple files
                        onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                                setNewAssignment(prev => ({
                                    ...prev,
                                    files: [...prev.files, ...Array.from(e.target.files)]
                                }));
                            }
                        }}
                        className="block w-full text-sm text-slate-500
               file:mr-4 file:py-2 file:px-4
               file:rounded-xl file:border-0
               file:text-sm file:font-bold
               file:bg-[#F0FDF4] file:text-[#96C68E]
               hover:file:bg-[#E6F7EC]"
                    />

                    {newAssignment.files && newAssignment.files.length > 0 && (
                        <div className="mt-3 space-y-2">
                            {newAssignment.files.map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-3">
                                    <div className="flex items-center gap-3">
                                        <FileText className="text-[#96C68E] w-5 h-5" />
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-bold text-slate-700 truncate max-w-[200px]">
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {(file.size / 1024).toFixed(1)} KB
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setNewAssignment(prev => ({
                                                ...prev,
                                                files: prev.files.filter((_, i) => i !== index)
                                            }));
                                        }}
                                        className="text-slate-400 hover:text-red-500 p-1"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>


                <button
                    onClick={async () => {
                        if (!newAssignment.title) {
                            alert('กรุณากรอกชื่องาน');
                            return;
                        }

                        try {
                            // Prepare data for Firestore
                            const processFiles = async () => {
                                return Promise.all(newAssignment.files.map(file => {
                                    return new Promise((resolve, reject) => {
                                        const reader = new FileReader();
                                        reader.readAsDataURL(file);
                                        reader.onload = () => resolve({
                                            name: file.name,
                                            size: file.size,
                                            type: file.type,
                                            content: reader.result // Store Base64
                                        });
                                        reader.onerror = error => reject(error);
                                    });
                                }));
                            };


                            const processedFiles = await processFiles();
                            const assignmentPayload = {
                                title: newAssignment.title,
                                course: newAssignment.course,
                                dueDate: newAssignment.dueDate,
                                description: newAssignment.description,
                                files: processedFiles,
                                status: 'pending',
                                score: null,
                                maxScore: newAssignment.maxScore || 10,
                                createdAt: new Date().toISOString(),
                                ownerId: auth.currentUser?.uid
                            };

                            // 1. Save to Database
                            const createdAssign = await createAssignment(assignmentPayload);

                            // 2. Update Local State (so it shows up immediately)
                            setAssignments(prev => [...prev, createdAssign]);

                            // 3. Notify Students
                            const currentCourse = courses.find(c => c.name === newAssignment.course);
                            if (currentCourse && currentCourse.studentIds && currentCourse.studentIds.length > 0) {
                                // Loop through students
                                currentCourse.studentIds.forEach(studentId => {
                                    createNotification(
                                        studentId,
                                        `มีการบ้านใหม่: ${newAssignment.title}`,
                                        'homework',
                                        `วิชา ${newAssignment.course} สั่งงานใหม่ กำหนดส่ง ${newAssignment.dueDate || 'ยังไม่กำหนด'}`,
                                        { courseId: currentCourse.firestoreId, targetType: 'assignment', targetId: createdAssign.firestoreId }
                                    );
                                });
                            }

                            // 4. Reset Form
                            setNewAssignment({
                                title: '',
                                course: '',
                                dueDate: '',
                                description: '',
                                files: [],
                                maxScore: '' // Added maxScore to state
                            });

                            setActiveModal(null);
                            alert('มอบหมายงานเรียบร้อยแล้ว (บันทึกลงฐานข้อมูล)');
                        } catch (error) {
                            console.error("Error creating assignment:", error);
                            alert('เกิดข้อผิดพลาดในการบันทึกงาน: ' + error.message);
                        }
                    }}
                    className="w-full py-3 bg-[#96C68E] text-white rounded-xl font-bold"
                >
                    บันทึกงาน
                </button>
            </div>
        </div>
    );
};

export const GradingModal = ({
    activeModal,
    setActiveModal,
    selectedAssignment,
    darkMode,
    openBase64InNewTab,
    gradingTab,
    setGradingTab,
    submissions,
    submissionsLoading,
    missingSubmissions,
    editingScores,
    setEditingScores,
    gradeSubmission,
    createNotification,
    selectedCourse,
    setAssignments,
    setSubmissions
}) => {
    if ((activeModal !== 'grading' && activeModal !== 'grading_detail') || !selectedAssignment) return null;

    const closeModal = () => {
        setActiveModal(null);
        setSubmissions([]); // Clear submissions to prevent stale data
    };

    return (
        <div className="h-[80vh] flex flex-col relative">
            {/* Overlay for Detail View */}
            {activeModal === 'grading_detail' && (
                <div className={`absolute inset-0 z-50 ${darkMode ? 'bg-slate-900' : 'bg-white'} p-8 flex flex-col animate-in fade-in zoom-in-95 duration-200`}>
                    <div className="flex items-start gap-4 mb-6">
                        <div className="bg-[#FFE787] p-3 rounded-2xl">
                            <FileText size={32} className="text-slate-700" />
                        </div>
                        <div className="flex-1">
                            <h2 className={`text-2xl font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{selectedAssignment.title}</h2>
                            <p className="text-slate-500">{selectedAssignment.course} • ครบกำหนด {selectedAssignment.dueDate ? new Date(selectedAssignment.dueDate).toLocaleString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'ไม่มีกำหนด'}</p>
                        </div>
                        <button
                            onClick={() => setActiveModal('grading')}
                            className={`${darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'} p-2 rounded-full transition-colors`}
                        >
                            <X size={24} className="text-slate-500" />
                        </button>
                    </div>

                    <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} p-6 rounded-2xl border mb-6 flex-1 overflow-y-auto custom-scrollbar`}>
                        <h3 className={`font-bold ${darkMode ? 'text-slate-200 border-slate-700' : 'text-slate-700 border-slate-200'} mb-4 text-lg border-b pb-2`}>คำชี้แจง</h3>
                        <p className={`${darkMode ? 'text-slate-300' : 'text-slate-600'} leading-relaxed whitespace-pre-wrap`}>{selectedAssignment.description || 'ไม่มีรายละเอียดเพิ่มเติม'}</p>

                        {/* Display attached files */}
                        {selectedAssignment.files && selectedAssignment.files.length > 0 && (
                            <div className="mt-6 pt-4 border-t border-slate-200">
                                <h4 className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-2">
                                    <Paperclip size={18} /> ไฟล์แนบ ({selectedAssignment.files.length})
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {selectedAssignment.files.map((file, idx) => (
                                        <div key={idx} className={`flex items-center gap-3 border p-3 rounded-xl hover:border-[#96C68E] transition-colors group cursor-pointer ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
                                            onClick={() => {
                                                if (file.content) openBase64InNewTab(file.content, file.type || 'application/pdf');
                                                else alert('ไม่สามารถเปิดไฟล์ได้');
                                            }}
                                        >
                                            <div className="bg-[#F0FDF4] p-2 rounded-lg">
                                                <FileText className="text-[#96C68E]" size={20} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className={`text-sm font-bold truncate ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{file.name}</p>
                                                <p className="text-xs text-slate-400">{(file.size ? (file.size / 1024).toFixed(1) : 0)} KB</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className={`p-8 flex flex-col h-full ${darkMode ? 'text-slate-200' : ''}`}>
                <div className={`flex justify-between items-start mb-6 border-b ${darkMode ? 'border-slate-700' : 'border-slate-100'} pb-4`}>
                    <div>
                        <h2 className={`text-2xl font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>ตรวจงาน: {selectedAssignment.title}</h2>
                        <div className="flex items-center gap-3 text-slate-500">
                            <p>{selectedAssignment.course}</p>
                            <div className="h-1 w-1 rounded-full bg-slate-300"></div>
                            {/* Left side minimal metadata if needed */}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setActiveModal('grading_detail')}
                            className={`hover:text-[#96C68E] cursor-pointer transition-colors flex items-center gap-1 font-bold text-sm px-3 py-2 rounded-xl border hover:border-[#96C68E] ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                            title="ดูรายละเอียดงานต้นฉบับ"
                        >
                            <Eye size={16} /> ดูโจทย์
                        </button>
                        <div className="bg-[#BEE1FF] px-4 py-2 rounded-xl text-slate-700 font-bold">
                            คะแนนเต็ม: {selectedAssignment.maxScore || 10}
                        </div>
                    </div>
                </div>

                {/* Grading Tabs */}
                <div className={`flex gap-2 mt-4 border-b pb-2 ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                    <button
                        onClick={() => setGradingTab('submitted')}
                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${gradingTab === 'submitted' ? 'bg-[#96C68E] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        ส่งแล้ว ({submissions.length})
                    </button>
                    <button
                        onClick={() => setGradingTab('missing')}
                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${gradingTab === 'missing' ? 'bg-[#FF917B] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        ยังไม่ส่ง ({missingSubmissions.length})
                    </button>
                </div>

                {/* Grading List */}
                <div className="flex-1 overflow-y-auto mt-4">
                    {submissionsLoading ? (
                        <div className="flex items-center justify-center h-full py-10">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-[#96C68E]"></div>
                        </div>
                    ) : gradingTab === 'submitted' ? (
                        <table className="w-full">
                            <thead className={`text-left text-sm border-b ${darkMode ? 'text-slate-400 border-slate-700' : 'text-slate-500 border-slate-100'}`}>
                                <tr>
                                    <th className="pb-2">ชื่อ-นามสกุล</th>
                                    <th className="pb-2">สถานะ</th>
                                    <th className="pb-2">ไฟล์แนบ</th>
                                    <th className="pb-2 text-center">คะแนน</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-50'}`}>
                                {submissions.length > 0 ? submissions.map((student) => (
                                    <tr key={student.firestoreId || student.id} className={`group ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}>
                                        <td className={`py-3 font-medium ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{student.userName || 'Unknown'}</td>
                                        <td className="py-3">
                                            <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs">ส่งแล้ว</span>
                                        </td>
                                        <td className="py-3">
                                            {student.file ? (
                                                <div className="flex flex-col gap-1">
                                                    {(() => {
                                                        const files = Array.isArray(student.file) ? student.file : [student.file];
                                                        if (files.length === 0) return <span className="text-red-400 text-xs font-bold">ไฟล์ว่างเปล่า (Empty)</span>;

                                                        return files.map((f, idx) => (
                                                            <button
                                                                key={idx}
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    if (f.content) {
                                                                        openBase64InNewTab(f.content, f.type || 'application/pdf');
                                                                    } else {
                                                                        alert(`ไม่พบเนื้อหาไฟล์: ${f.name}`);
                                                                    }
                                                                }}
                                                                className={`text-left font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2 border px-2 py-1 rounded cursor-pointer text-sm max-w-full ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                                                                title={f.name || `File ${idx + 1}`}
                                                            >
                                                                <FileText size={16} className="text-blue-500 flex-shrink-0" />
                                                                <span className="truncate">{f.name || `ไฟล์แนบ ${idx + 1}`}</span>
                                                            </button>
                                                        ));
                                                    })()}
                                                </div>
                                            ) : (
                                                <span className="text-red-400 text-xs font-bold flex items-center gap-1">
                                                    <AlertCircle size={12} /> ไม่พบไฟล์แนบ
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 text-center flex items-center justify-center gap-2">
                                            {/* Unique ID for input using student ID */}
                                            <input
                                                type="text"
                                                placeholder="-"
                                                value={editingScores[student.firestoreId || student.id] || ""}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setEditingScores(prev => ({
                                                        ...prev,
                                                        [student.firestoreId || student.id]: val
                                                    }));
                                                }}
                                                className={`w-16 p-2 border rounded-lg text-center font-bold focus:border-[#96C68E] outline-none ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                                            />
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="4" className="text-center py-4 text-slate-400">ยังไม่มีใครส่งงาน</td></tr>
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <div className="space-y-4">
                            {missingSubmissions.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {missingSubmissions.map((student, idx) => (
                                        <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'border-slate-100 bg-slate-50/50'}`}>
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'}`}>
                                                {student.fullName ? student.fullName.charAt(0) : '?'}
                                            </div>
                                            <div>
                                                <div className={`font-bold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{student.fullName || 'Unknown'}</div>
                                                <div className="text-xs text-red-400 font-bold flex items-center gap-1">
                                                    <AlertCircle size={12} /> ยังไม่ส่งงาน
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-slate-400 flex flex-col items-center">
                                    <CheckCircle size={48} className="text-green-200 mb-4" />
                                    <p className="font-bold text-green-600">เยี่ยมมาก! ทุกคนส่งงานครบแล้ว</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className={`mt-6 pt-4 border-t flex justify-end gap-3 ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                    <button
                        onClick={closeModal}
                        className={`px-6 py-3 rounded-xl border font-bold ${darkMode ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                        ปิด
                    </button>

                    <button
                        onClick={async () => {
                            try {
                                const targetId = selectedAssignment.firestoreId || selectedAssignment.id;
                                const savePromises = submissions.map(async (student) => {
                                    const subId = student.firestoreId || student.id;
                                    const newScore = editingScores[subId];

                                    // Use the state value
                                    await gradeSubmission(targetId, subId, newScore);

                                    if (newScore !== "" && newScore !== null) {
                                        await createNotification(
                                            student.userId || student.id,
                                            `ประกาศคะแนน: ${selectedAssignment.title}`,
                                            'grade',
                                            `คุณครูได้ตรวจงานและให้คะแนนวิชา ${selectedAssignment.course} แล้ว ได้คะแนน ${newScore}/${selectedAssignment.maxScore || 10}`,
                                            {
                                                courseId: selectedAssignment.courseId || (selectedCourse ? selectedCourse.firestoreId : ""),
                                                targetType: 'assignment',
                                                targetId: targetId
                                            }
                                        );
                                    }
                                });

                                await Promise.all(savePromises);
                                alert('บันทึกคะแนนแล้ว');

                                setSubmissions(prev => prev.map(s => {
                                    const subId = s.firestoreId || s.id;
                                    return { ...s, score: editingScores[subId] };
                                }));

                                // Update Main Assignments State with new Pending Count
                                setAssignments(prev => prev.map(a => {
                                    const currentAssignId = a.firestoreId || a.id;
                                    if (currentAssignId === targetId) {
                                        let newPendingCount = 0;
                                        submissions.forEach(s => {
                                            const subId = s.firestoreId || s.id;
                                            const val = editingScores[subId];
                                            if (!val) newPendingCount++;
                                        });
                                        return { ...a, pendingSubmissionCount: newPendingCount };
                                    }
                                    return a;
                                }));

                            } catch (e) {
                                console.error(e);
                                alert('บันทึกคะแนนไม่สำเร็จ');
                            }
                        }}
                        className="px-6 py-3 rounded-xl bg-[#96C68E] hover:bg-[#85b57d] font-bold text-white shadow-md flex items-center gap-2 transition-all active:scale-95"
                    >
                        <Save size={18} />
                        บันทึกคะแนนทั้งหมด
                    </button>
                </div>
            </div>
        </div>
    );
};
