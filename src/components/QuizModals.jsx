import React, { useMemo } from 'react';
import {
    X, Plus, Calendar, Trash, ImageIcon, Save, Trophy, BarChart3,
    CheckCircle2, TrendingUp, Users, Clock, ArrowRight, AlertCircle,
    ChevronLeft, ChevronRight, FileText, ClipboardList, ClipboardCheck, BookOpen, CheckCircle
} from 'lucide-react';
import { MascotStar } from './Mascots';
import { updateQuizSubmission, getQuizSubmissions as getSubmissionsService } from '../services/quizService';
import { createNotification } from '../services/notificationService';

const QuizModals = ({
    activeModal,
    setActiveModal,
    closeModal,
    darkMode,
    profile,
    selectedCourse,
    courses,
    isListLoading,
    pendingGradingList,
    setIsLoading,
    getQuizSubmissions,

    // useQuiz values
    activeQuiz,
    setActiveQuiz,
    quizAnswers,
    setQuizAnswers,
    quizResult,
    quizRemainingSeconds,
    courseSubmissions,
    setCourseSubmissions,
    selectedSubmission,
    setSelectedSubmission,
    manualScores,
    setManualScores,
    submitQuiz,

    // missing from previous step
    setSelectedCourse,

    // handlers from App.jsx
    newExam,
    setNewExam,
    handleAddQuestion,
    handleUpdateQuestion,
    handleRemoveQuestion,
    handleQuestionImageUpload,
    handleOptionImageUpload,
    handleUpdateOption,
    handleSaveExam,
}) => {
    const quizModals = ['createExam', 'viewResults', 'viewAnswerDetail', 'takeQuiz', 'pendingQuizzes'];
    if (!activeModal || !quizModals.includes(activeModal)) return null;

    return (
        <>

            {/* Create the specific modal content based on activeModal */}
            {activeModal === 'createExam' && <CreateExamModal {...{ newExam, setNewExam, selectedCourse, courses, handleAddQuestion, handleUpdateQuestion, handleRemoveQuestion, handleQuestionImageUpload, handleOptionImageUpload, handleUpdateOption, handleSaveExam, darkMode }} />}
            {activeModal === 'viewResults' && (
                <ViewResultsModal
                    {...{ courseSubmissions, activeQuiz, darkMode, closeModal, setSelectedSubmission, setManualScores, setActiveModal, selectedCourse }}
                />
            )}
            {activeModal === 'viewAnswerDetail' && selectedSubmission && activeQuiz && (
                <ViewAnswerDetailModal
                    {...{
                        activeModal, selectedSubmission, activeQuiz, darkMode, setActiveModal,
                        manualScores, setManualScores, updateQuizSubmission, createNotification,
                        selectedCourse, setSelectedSubmission, setCourseSubmissions, closeModal
                    }}
                />
            )}
            {activeModal === 'takeQuiz' && activeQuiz && (
                <TakeQuizModal
                    {...{
                        activeQuiz, darkMode, quizRemainingSeconds, quizResult, MascotStar,
                        quizAnswers, setQuizAnswers, submitQuiz, closeModal
                    }}
                />
            )}
            {activeModal === 'pendingQuizzes' && (
                <PendingQuizzesModal
                    {...{
                        darkMode, isListLoading, pendingGradingList, courses, setIsLoading,
                        setSelectedCourse, setActiveQuiz, setCourseSubmissions, setActiveModal,
                        getSubmissionsService
                    }}
                />
            )}

        </>
    );
};

// Sub-components for better organization
const CreateExamModal = ({
    newExam,
    setNewExam,
    selectedCourse,
    courses,
    handleAddQuestion,
    handleUpdateQuestion,
    handleRemoveQuestion,
    handleQuestionImageUpload,
    handleOptionImageUpload,
    handleUpdateOption,
    handleSaveExam,
    darkMode
}) => {
    const [showConfirm, setShowConfirm] = React.useState(false);

    const onSaveClick = () => {
        if (!newExam.title || newExam.items.some(i => !i.q)) {
            alert('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        if (newExam.id) {
            handleSaveExam(null); // Updating an existing quiz bypasses confirm
        } else {
            setShowConfirm(true); // Open the custom confirmation module instead of browser alert
        }
    };

    return (
        <div className="p-4 md:p-8 h-full flex flex-col relative">
            {showConfirm && (
                <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/40 rounded-[2rem] backdrop-blur-sm m-4">
                    <div className={`p-6 md:p-8 rounded-3xl w-full max-w-sm shadow-2xl transform transition-all scale-100 opacity-100 flex flex-col gap-4 md:gap-6 ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}>
                        <div className="flex items-center">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 md:mr-4 shrink-0">
                                <FileText size={20} className="md:w-6 md:h-6" />
                            </div>
                            <h3 className={`text-lg md:text-xl font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>ตั้งค่าการเผยแพร่</h3>
                        </div>
                        <p className={`text-xs md:text-sm leading-relaxed font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                            ต้องการเผยแพร่แบบทดสอบทันทีเลยหรือไม่?
                            <br /><br />
                            <span className="flex items-start mb-2"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500 mt-0.5 shrink-0" /> เผยแพร่เลย: นักเรียนจะเห็นและได้รับการแจ้งเตือนทันที</span>
                            <span className="flex items-start"><Clock className="w-4 h-4 mr-2 text-orange-500 mt-0.5 shrink-0" /> ยังไม่เปิดใช้งาน: เก็บไว้ก่อน ค่อยเปิดใช้งานและแจ้งเตือนภายหลัง</span>
                        </p>
                        <div className="flex flex-col gap-2 md:gap-3 mt-2">
                            <button
                                onClick={() => {
                                    setShowConfirm(false);
                                    handleSaveExam(true); // available
                                }}
                                className="w-full py-3.5 rounded-2xl bg-[#96C68E] hover:bg-[#85b57d] text-white font-bold transition-all shadow-md active:scale-95 text-base"
                            >
                                เผยแพร่เลย
                            </button>
                            <button
                                onClick={() => {
                                    setShowConfirm(false);
                                    handleSaveExam(false); // closed
                                }}
                                className={`w-full py-3.5 rounded-2xl font-bold transition-all active:scale-95 text-base ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                            >
                                ยังไม่เปิดใช้งาน
                            </button>
                            <button
                                onClick={() => setShowConfirm(false)}
                                className={`w-full py-2 font-bold text-sm opacity-60 hover:opacity-100 ${darkMode ? 'text-slate-300 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                ยกเลิก
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <h2 className={`text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                <Plus className="mr-2 md:mr-3 text-[#FF917B] shrink-0" /> สร้างแบบทดสอบใหม่
            </h2>
            <div className="flex-1 overflow-y-auto pr-1 md:pr-2 custom-scrollbar space-y-4 md:space-y-6">
                {/* Exam Details */}
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 p-3 md:p-4 rounded-2xl border ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                    <div>
                        <label className={`block text-sm font-bold mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>ชื่อแบบทดสอบ</label>
                        <input
                            type="text"
                            className={`w-full p-3 rounded-xl border outline-none focus:border-[#96C68E] ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}
                            placeholder="เช่น สอบย่อยบทที่ 1"
                            value={newExam.title}
                            onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-bold mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>วิชา</label>
                        {selectedCourse ? (
                            <input
                                type="text"
                                className={`w-full p-3 rounded-xl border font-bold outline-none cursor-not-allowed ${darkMode ? 'bg-slate-700 border-slate-600 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'}`}
                                value={selectedCourse.name}
                                readOnly
                            />
                        ) : (
                            <select
                                className={`w-full p-3 rounded-xl border outline-none focus:border-[#96C68E] ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}
                                value={newExam.course}
                                onChange={(e) => setNewExam({ ...newExam, course: e.target.value })}
                            >
                                <option value="">-- เลือกวิชา --</option>
                                {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                        )}
                    </div>
                    <div>
                        <label className={`block text-sm font-bold mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>เวลาในการทำ (นาที)</label>
                        <div className="space-y-2">
                            <div className="relative">
                                <input
                                    type="number"
                                    className={`w-full p-3 rounded-xl border outline-none focus:border-[#96C68E] ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}
                                    placeholder="ระบุเวลา (นาที)"
                                    value={newExam.time}
                                    onChange={(e) => setNewExam({ ...newExam, time: parseInt(e.target.value) || '' })}
                                />
                                <span className={`absolute right-4 top-3.5 text-sm font-bold ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>นาที</span>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {[15, 30, 45, 60, 90, 120].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setNewExam({ ...newExam, time: t })}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${newExam.time === t
                                            ? 'bg-[#96C68E] text-white border-[#96C68E]'
                                            : (darkMode ? 'bg-slate-800 text-slate-400 border-slate-700 hover:border-[#96C68E]' : 'bg-white text-slate-500 border-slate-200 hover:border-[#96C68E]')
                                            }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Dropdown for other courses (Placed next to time so it doesn't break row 1 height) */}
                    {selectedCourse && courses.filter(c => c.name !== selectedCourse.name).length > 0 && (
                        <div className="flex flex-col">
                            <label className={`block text-sm font-bold mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                เพิ่มไปยังห้องอื่น (ไม่บังคับ)
                            </label>
                            <details className="group relative">
                                <summary className={`list-none flex justify-between items-center cursor-pointer w-full p-3 rounded-xl border font-normal outline-none transition-colors ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}>
                                    <span className="truncate">
                                        {newExam.additionalCourses?.length > 0
                                            ? `เลือกเพิ่ม ${newExam.additionalCourses.length} ห้อง`
                                            : 'เลือกห้องเรียนอื่นๆ'}
                                    </span>
                                    <span className={`transition-transform duration-200 group-open:-rotate-180`}>▼</span>
                                </summary>
                                <div className={`absolute z-10 w-full mt-2 p-3 rounded-xl border shadow-xl flex flex-col gap-2 max-h-48 overflow-y-auto custom-scrollbar ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                    {courses.filter(c => c.name !== selectedCourse.name).map(c => (
                                        <label key={c.id || c.firestoreId} className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg transition-all ${newExam.additionalCourses?.some(ac => ac.firestoreId === c.firestoreId)
                                            ? (darkMode ? 'bg-blue-900/30' : 'bg-blue-50')
                                            : (darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50')
                                            }`}>
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 accent-[#96C68E] cursor-pointer"
                                                checked={newExam.additionalCourses?.some(ac => ac.firestoreId === c.firestoreId) || false}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    const current = newExam.additionalCourses || [];
                                                    if (checked) {
                                                        setNewExam({ ...newExam, additionalCourses: [...current, c] });
                                                    } else {
                                                        setNewExam({ ...newExam, additionalCourses: current.filter(ac => ac.firestoreId !== c.firestoreId) });
                                                    }
                                                }}
                                            />
                                            <span className={`text-sm font-bold truncate ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{c.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </details>
                        </div>
                    )}


                    {/* Schedule Exam */}
                    <div className={`col-span-full p-2 md:p-4 rounded-lg md:rounded-xl border ${darkMode ? 'bg-orange-950/20 border-orange-900/30' : 'bg-orange-50 border-orange-100'}`}>
                        <label className="flex items-center gap-1.5 md:gap-3 cursor-pointer mb-1 md:mb-2">
                            <input
                                type="checkbox"
                                className="w-3.5 h-3.5 md:w-5 md:h-5 accent-[#FF917B] rounded shrink-0"
                                checked={!!newExam.scheduledAt}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        const tomorrow = new Date();
                                        tomorrow.setDate(tomorrow.getDate() + 1);
                                        tomorrow.setHours(8, 0, 0, 0);
                                        const localIso = new Date(tomorrow.getTime() - (tomorrow.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
                                        setNewExam({ ...newExam, scheduledAt: localIso });
                                    } else {
                                        setNewExam({ ...newExam, scheduledAt: '' });
                                    }
                                }}
                            />
                            <span className={`font-bold flex items-center text-[10px] sm:text-xs md:text-base ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                <Calendar size={18} className="mr-1 md:mr-2 text-orange-500 w-3.5 h-3.5 md:w-5 md:h-5 shrink-0" /> กำหนดเวลาสอบ (Scheduled Release)
                            </span>
                        </label>
                        <p className={`text-[9px] sm:text-[10px] md:text-sm ml-5 md:ml-8 mb-1.5 md:mb-3 ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>หากกำหนดเวลา นักเรียนจะไม่เห็นข้อสอบจนกว่าจะถึงเวลาที่กำหนด</p>

                        {newExam.scheduledAt && (
                            <div className="ml-5 md:ml-8">
                                <input
                                    type="datetime-local"
                                    className={`w-full md:w-1/2 p-1 md:p-3 text-[10px] sm:text-xs md:text-base rounded md:rounded-xl border outline-none font-medium ${darkMode ? 'bg-slate-800 border-orange-900/50 text-slate-200' : 'bg-white border-orange-200 text-slate-700 focus:border-orange-400'}`}
                                    style={{ colorScheme: darkMode ? 'dark' : 'light' }}
                                    value={newExam.scheduledAt}
                                    onChange={(e) => setNewExam({ ...newExam, scheduledAt: e.target.value })}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Question Editor */}
                <div className="space-y-3 md:space-y-4">
                    <h3 className={`font-bold text-sm md:text-base ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>รายการคำถาม ({newExam.items.length})</h3>
                    {newExam.items.map((item, idx) => (
                        <div key={idx} className={`border rounded-xl md:rounded-2xl p-3 md:p-4 relative group transition-all shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700 hover:border-[#BEE1FF]/30' : 'bg-white border-slate-200 hover:border-[#BEE1FF]'}`}>
                            <div className="flex justify-between items-center mb-3 w-full gap-1.5 sm:gap-2">
                                <div className="flex items-center gap-1.5 sm:gap-2 flex-1 md:flex-none min-w-0">
                                    <span className={`text-xs md:text-sm font-bold px-2 md:px-3 py-1.5 md:py-2 rounded shrink-0 ${darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>ข้อที่ {idx + 1}</span>
                                    <select
                                        value={item.type || 'choice'}
                                        onChange={(e) => handleUpdateQuestion(idx, 'type', e.target.value)}
                                        className={`flex-1 md:flex-none md:w-auto min-w-0 text-xs md:text-sm font-bold border rounded-lg md:rounded-xl px-2 py-1.5 md:py-2 outline-none focus:border-[#96C68E] ${darkMode ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-white border-slate-200 text-slate-600'}`}
                                    >
                                        <option value="choice">ปรนัย (4 ตัวเลือก)</option>
                                        <option value="true_false">ถูก/ผิด (True/False)</option>
                                        <option value="matching">จับคู่ (Matching)</option>
                                        <option value="text">เติมคำ (Keywords)</option>
                                    </select>
                                    <div className={`flex items-center gap-1 md:gap-2 rounded-lg md:rounded-xl px-2 md:px-3 py-1.5 md:py-2 border shrink-0 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                                        <span className={`text-xs md:text-sm font-bold hidden sm:inline ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>คะแนน:</span>
                                        <input
                                            type="number"
                                            min="1"
                                            className={`w-8 md:w-14 text-xs md:text-sm font-black bg-transparent outline-none text-center ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}
                                            value={item.points || 1}
                                            onChange={(e) => handleUpdateQuestion(idx, 'points', Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                                <button onClick={() => handleRemoveQuestion(idx)} className="text-red-300 hover:text-red-500 hover:bg-red-50 p-1.5 md:p-2 rounded-lg md:rounded-xl transition-colors shrink-0"><Trash size={16} className="md:w-5 md:h-5" /></button>
                            </div>

                            <div className="mb-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        className={`w-full p-3 pr-12 mb-2 border rounded-xl outline-none font-bold transition-colors ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-200 focus:bg-slate-950 focus:border-[#96C68E]' : 'bg-slate-50 border-slate-200 text-slate-700 focus:bg-white focus:border-[#96C68E]'}`}
                                        placeholder="พิมพ์โจทย์คำถาม..."
                                        value={item.q}
                                        onChange={(e) => handleUpdateQuestion(idx, 'q', e.target.value)}
                                    />
                                    <label className={`absolute right-2 top-2 p-2 cursor-pointer transition-colors z-10 rounded-full ${darkMode ? 'text-slate-500 hover:text-[#96C68E] hover:bg-slate-800' : 'text-slate-400 hover:text-[#96C68E] hover:bg-slate-100'}`}>
                                        <ImageIcon size={20} />
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onClick={(e) => e.target.value = null}
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    handleQuestionImageUpload(idx, e.target.files[0]);
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                                {item.image && (
                                    <div className="relative w-fit mt-2">
                                        <img src={item.image} alt="Question" className={`h-32 rounded-lg border object-cover ${darkMode ? 'border-slate-700' : 'border-slate-200'}`} />
                                        <button
                                            onClick={() => handleUpdateQuestion(idx, 'image', null)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className={`rounded-xl p-2.5 md:p-4 border ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                                {(!item.type || item.type === 'choice') && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                                        {item.options.map((opt, optIdx) => (
                                            <div key={optIdx} className={`p-2 md:p-3 rounded-lg md:rounded-xl border focus-within:ring-1 focus-within:ring-[#96C68E] relative transition-all ${darkMode ? 'bg-slate-800 border-slate-700 focus-within:border-[#96C68E]' : 'bg-white border-slate-200 focus-within:border-[#96C68E]'}`}>
                                                <div className="flex items-center gap-2 mb-1 md:mb-2">
                                                    <input
                                                        type="radio"
                                                        name={`correct-${idx}`}
                                                        checked={item.correct === optIdx}
                                                        onChange={() => handleUpdateQuestion(idx, 'correct', optIdx)}
                                                        className="w-3.5 h-3.5 md:w-4 md:h-4 accent-[#96C68E]"
                                                    />
                                                    <input
                                                        type="text"
                                                        className={`flex-1 text-xs md:text-sm outline-none font-medium bg-transparent min-w-0 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}
                                                        placeholder={`ตัวเลือก ${optIdx + 1}`}
                                                        value={opt}
                                                        onChange={(e) => handleUpdateOption(idx, optIdx, e.target.value)}
                                                    />
                                                    <label className={`p-1.5 transition-colors rounded-lg cursor-pointer ${darkMode ? 'text-slate-500 hover:text-[#96C68E] hover:bg-slate-700' : 'text-slate-400 hover:text-[#96C68E] hover:bg-slate-100'}`} title="เพิ่มรูปภาพ">
                                                        <ImageIcon size={16} />
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={(e) => handleOptionImageUpload(idx, optIdx, e.target.files[0])}
                                                        />
                                                    </label>
                                                </div>
                                                {item.optionImages && item.optionImages[optIdx] && (
                                                    <div className={`relative w-full h-32 rounded-lg overflow-hidden border mt-2 group/img ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                                                        <img src={item.optionImages[optIdx]} alt={`Option ${optIdx + 1}`} className="w-full h-full object-contain" />
                                                        <button
                                                            onClick={() => handleOptionImageUpload(idx, optIdx, null)}
                                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover/img:opacity-100 transition-opacity transform hover:scale-110"
                                                            title="ลบรูปภาพ"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {item.type === 'true_false' && (
                                    <div className="flex gap-2 sm:gap-4">
                                        <label className={`flex-1 p-2 sm:p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-center font-bold text-xs sm:text-base ${item.correctAnswer === true ? (darkMode ? 'bg-green-900/30 border-green-500 text-green-400' : 'bg-green-50 border-green-500 text-green-700') : (darkMode ? 'bg-slate-800 border-slate-700 text-slate-500 hover:border-green-500/30' : 'bg-white border-slate-200 text-slate-400 hover:border-green-200')}`}>
                                            <input
                                                type="radio"
                                                name={`tf-${idx}`}
                                                checked={item.correctAnswer === true}
                                                onChange={() => handleUpdateQuestion(idx, 'correctAnswer', true)}
                                                className="hidden"
                                            />
                                            <CheckCircle2 size={16} className="mr-1.5 sm:mr-2 sm:w-5 sm:h-5" /> ถูก (True)
                                        </label>
                                        <label className={`flex-1 p-2 sm:p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-center font-bold text-xs sm:text-base ${item.correctAnswer === false ? (darkMode ? 'bg-red-900/30 border-red-500 text-red-400' : 'bg-red-50 border-red-500 text-red-700') : (darkMode ? 'bg-slate-800 border-slate-700 text-slate-500 hover:border-red-500/30' : 'bg-white border-slate-200 text-slate-400 hover:border-red-200')}`}>
                                            <input
                                                type="radio"
                                                name={`tf-${idx}`}
                                                checked={item.correctAnswer === false}
                                                onChange={() => handleUpdateQuestion(idx, 'correctAnswer', false)}
                                                className="hidden"
                                            />
                                            <X size={16} className="mr-1.5 sm:mr-2 sm:w-5 sm:h-5" /> ผิด (False)
                                        </label>
                                    </div>
                                )}

                                {item.type === 'matching' && (
                                    <div className="space-y-2">
                                        {(item.pairs || []).map((pair, pIdx) => (
                                            <div key={pIdx} className="grid grid-cols-[1fr_auto_1fr_auto] gap-1 sm:gap-2 items-center">
                                                <input
                                                    placeholder="ฝั่งซ้าย"
                                                    className={`w-full p-2 rounded-lg border text-xs sm:text-sm outline-none focus:border-[#96C68E] ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}
                                                    value={pair.left}
                                                    onChange={(e) => {
                                                        const newPairs = [...item.pairs];
                                                        newPairs[pIdx].left = e.target.value;
                                                        handleUpdateQuestion(idx, 'pairs', newPairs);
                                                    }}
                                                />
                                                <ArrowRight size={14} className={`sm:w-4 sm:h-4 ${darkMode ? 'text-slate-600' : 'text-slate-300'}`} />
                                                <input
                                                    placeholder="ฝั่งขวา"
                                                    className={`w-full p-2 rounded-lg border text-xs sm:text-sm outline-none focus:border-[#96C68E] ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}
                                                    value={pair.right}
                                                    onChange={(e) => {
                                                        const newPairs = [...item.pairs];
                                                        newPairs[pIdx].right = e.target.value;
                                                        handleUpdateQuestion(idx, 'pairs', newPairs);
                                                    }}
                                                />
                                                {item.pairs.length > 1 && (
                                                    <button
                                                        onClick={() => {
                                                            const newPairs = item.pairs.filter((_, i) => i !== pIdx);
                                                            handleUpdateQuestion(idx, 'pairs', newPairs);
                                                        }}
                                                        className="text-slate-500 hover:text-red-500"
                                                    >
                                                        <Trash size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => {
                                                const newPairs = [...(item.pairs || []), { left: '', right: '' }];
                                                handleUpdateQuestion(idx, 'pairs', newPairs);
                                            }}
                                            className="text-xs font-bold text-[#96C68E] hover:underline flex items-center"
                                        >
                                            <Plus size={12} className="mr-1" /> เพิ่มคู่จับคู่
                                        </button>
                                    </div>
                                )}

                                {item.type === 'text' && (
                                    <div>
                                        <label className={`flex items-center gap-2 mb-4 p-3 rounded-xl border cursor-pointer ${darkMode ? 'bg-yellow-900/20 border-yellow-800/30' : 'bg-yellow-50 border-yellow-100'}`}>
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 accent-yellow-500 rounded"
                                                checked={!!item.manualGrading}
                                                onChange={(e) => handleUpdateQuestion(idx, 'manualGrading', e.target.checked)}
                                            />
                                            <span className={`font-bold text-sm ${darkMode ? 'text-yellow-200/80' : 'text-slate-700'}`}>ต้องการตรวจคำตอบเอง (Manual Grading)</span>
                                        </label>

                                        {!item.manualGrading && (
                                            <>
                                                <p className={`text-xs font-bold mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>คำตอบที่ถูกต้อง (Keywords)</p>
                                                <p className={`text-[10px] mb-2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>ระบบจะตรวจคำตอบว่ามีคำเหล่านี้หรือไม่ (คั่นด้วยจุลภาค ,)</p>
                                                <input
                                                    type="text"
                                                    className={`w-full p-3 rounded-xl border outline-none focus:border-[#96C68E] ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}
                                                    placeholder="เช่น โปรตีน, เนื้อสัตว์, ถั่ว"
                                                    value={item.keywords ? item.keywords.join(', ') : ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        const keys = val.split(',').map(k => k.trim());
                                                        handleUpdateQuestion(idx, 'keywords', keys);
                                                    }}
                                                />
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={handleAddQuestion}
                        className={`w-full py-2.5 md:py-3 border-2 border-dashed rounded-xl font-bold text-sm md:text-base transition-all ${darkMode ? 'border-slate-700 text-slate-500 hover:border-[#96C68E] hover:text-[#96C68E] hover:bg-slate-800/30' : 'border-slate-300 text-slate-500 hover:border-[#96C68E] hover:text-[#96C68E] hover:bg-slate-50'}`}
                    >
                        + เพิ่มข้อสอบ
                    </button>
                </div>
            </div >
            <div className={`mt-3 md:mt-4 pt-3 md:pt-4 border-t flex justify-end gap-2 md:gap-3 ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                <button onClick={onSaveClick} className="px-4 md:px-6 py-2 md:py-3 rounded-xl bg-[#96C68E] text-white font-bold text-sm md:text-base hover:bg-[#85b57d] shadow-sm flex items-center">
                    <Save size={18} className="mr-1.5 md:mr-2 md:w-5 md:h-5" /> {newExam.id ? 'บันทึกการแก้ไข' : 'สร้างแบบทดสอบ'}
                </button>
            </div>
        </div >
    );
};

const ViewResultsModal = ({ courseSubmissions, activeQuiz, darkMode, closeModal, setSelectedSubmission, setManualScores, setActiveModal, selectedCourse }) => {
    const stats = React.useMemo(() => {
        if (!courseSubmissions || courseSubmissions.length === 0) return { avg: 0, passRate: 0, max: 0, count: 0, totalPossible: 1 };
        const graded = courseSubmissions.filter(s => s.status !== 'pending_grading');
        const count = courseSubmissions.length;
        const totalPossible = activeQuiz?.totalPoints || activeQuiz?.items?.reduce((t, i) => t + (Number(i.points) || 1), 0) || 1;

        if (graded.length === 0) return { avg: "0.0", passRate: 0, max: 0, count, totalPossible };

        const avg = graded.reduce((acc, s) => acc + (s.score || 0), 0) / graded.length;
        const max = Math.max(...graded.map(s => s.score || 0));
        const passRate = (graded.filter(s => (s.score / s.total) >= 0.5).length / graded.length) * 100;

        return {
            avg: avg.toFixed(1),
            passRate: Math.round(passRate),
            max,
            count,
            totalStudents: selectedCourse?.studentIds?.length || count,
            totalPossible
        };
    }, [courseSubmissions, activeQuiz, selectedCourse]);

    return (
        <div className="p-4 md:p-8 h-full flex flex-col w-full">
            <div className="flex justify-between items-center mb-6 md:mb-8">
                <div className="flex items-center gap-2 md:gap-4 font-inter">
                    {/* BACK BUTTON */}
                    <button
                        onClick={() => setActiveModal('pendingQuizzes')}
                        className={`p-2 md:p-3 rounded-xl md:rounded-2xl transition-colors shrink-0 ${darkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        title="กลับไปหน้ารอตรวจ"
                    >
                        <ChevronLeft size={20} className="md:w-6 md:h-6" />
                    </button>

                    <div className="flex items-center gap-2 md:gap-4">
                        <div className="bg-[#FFF7ED] p-2 md:p-3 rounded-xl md:rounded-2xl shadow-sm shrink-0">
                            <Trophy className="text-[#F59E0B]" size={28} />
                        </div>
                        <div className="min-w-0">
                            <h2 className={`text-lg md:text-3xl font-black ${darkMode ? 'text-slate-100' : 'text-slate-800'} tracking-tight leading-tight truncate`}>ผลคะแนนสอบ</h2>
                            <p className={`text-[10px] md:text-sm font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'} line-clamp-1`}>{activeQuiz?.title}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* STAT CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-6 md:mb-8">
                {[
                    { label: 'คะแนนเฉลี่ย', val: stats.avg, sub: `/${stats.totalPossible}`, icon: BarChart3, color: 'text-[#818CF8]' },
                    { label: 'ผ่านเกณฑ์', val: `${stats.passRate}%`, icon: CheckCircle, color: 'text-[#34D399]' },
                    { label: 'คะแนนสูงสุด', val: stats.max, icon: TrendingUp, color: 'text-[#FBBF24]' },
                    { label: 'ส่งแล้ว', val: stats.count, sub: `/${stats.totalStudents || stats.count}`, icon: Users, color: 'text-[#60A5FA]' }
                ].map((s, i) => (
                    <div key={i} className={`p-3 md:p-6 rounded-2xl md:rounded-[2rem] border transition-transform hover:scale-[1.02] ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <div className="flex justify-between items-start mb-1 md:mb-4">
                            <p className={`text-[10px] md:text-sm font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'} line-clamp-1`}>{s.label}</p>
                            <s.icon size={14} className={`${s.color} md:block hidden`} />
                        </div>
                        <div className="flex items-baseline gap-0.5 md:gap-1">
                            <span className={`text-xl md:text-4xl font-black ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>{s.val}</span>
                            {s.sub && <span className="text-slate-400 font-bold text-[10px] md:text-lg opacity-40">{s.sub}</span>}
                        </div>
                    </div>
                ))}
            </div>

            {/* LIST */}
            <div className={`flex-1 overflow-hidden flex flex-col rounded-2xl md:rounded-[2rem] border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                {/* Desk Header */}
                <div className={`hidden md:flex px-6 py-4 border-b font-bold text-[10px] uppercase tracking-wider ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                    <div className="flex-1">นักเรียน</div>
                    <div className="w-40 text-center">สถานะ</div>
                    <div className="w-56 text-center">เวลาส่ง</div>
                    <div className="w-32 text-center">คะแนนสอบ</div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {courseSubmissions.length === 0 ? (
                        <div className="text-center py-20 text-slate-400">
                            <ClipboardCheck size={64} className="mx-auto mb-4 opacity-10" />
                            <p className="text-lg font-bold">ยังไม่มีนักเรียนส่งข้อสอบ</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {courseSubmissions.map((sub, idx) => (
                                <div
                                    key={sub.firestoreId || idx}
                                    onClick={() => {
                                        setSelectedSubmission(sub);
                                        setManualScores(sub.itemScores || {});
                                        setActiveModal('viewAnswerDetail');
                                    }}
                                    className={`px-4 py-3 md:px-6 md:py-5 flex items-center transition-all cursor-pointer group hover:bg-slate-50 ${darkMode ? 'hover:bg-slate-800/50' : ''}`}
                                >
                                    {/* Student Name & Info */}
                                    <div className="flex-1 flex items-center gap-2 md:gap-4 overflow-hidden">
                                        <div className={`w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center font-black text-xs md:text-lg shrink-0 shadow-sm ring-2 ring-white/10 ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                                            {sub.studentName?.charAt(0) || '?'}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <h3 className={`font-bold text-xs md:text-lg leading-tight truncate ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{sub.studentName}</h3>
                                            <div className="md:hidden flex items-center gap-1">
                                                <Clock size={8} className="text-slate-400" />
                                                <span className={`text-[8px] font-bold ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                                    {sub.submittedAt ? (sub.submittedAt.toDate ? sub.submittedAt.toDate().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : new Date(sub.submittedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })) : '-'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 md:contents">
                                        {/* Status */}
                                        <div className="md:w-40 flex md:justify-center shrink-0">
                                            {sub.status === 'pending_grading' ? (
                                                <span className={`px-2 py-0.5 rounded-md text-[8px] md:text-[10px] font-bold whitespace-nowrap ${darkMode ? 'bg-orange-950 text-orange-400 border border-orange-900/30' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>รอตรวจ</span>
                                            ) : (
                                                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-green-50 border border-green-100 dark:bg-green-900/20 dark:border-green-800/30">
                                                    <CheckCircle className="text-green-500" size={10} />
                                                    <span className="text-[8px] md:text-[10px] font-black text-green-700 dark:text-green-400">ส่งแล้ว</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Time Desktop Only */}
                                        <div className={`hidden md:flex w-56 text-center text-sm font-bold items-center justify-center gap-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                            {sub.submittedAt ? (sub.submittedAt.toDate ? sub.submittedAt.toDate().toLocaleString('th-TH', { day: 'numeric', month: 'numeric', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : new Date(sub.submittedAt).toLocaleString('th-TH', { day: 'numeric', month: 'numeric', year: '2-digit', hour: '2-digit', minute: '2-digit' })) : '-'}
                                        </div>

                                        {/* Score */}
                                        <div className="md:w-32 flex md:justify-center items-center shrink-0">
                                            {sub.status === 'pending_grading' ? (
                                                <span className="text-slate-300 font-bold px-2 text-xs">-</span>
                                            ) : (
                                                <div className="flex items-baseline gap-0.5">
                                                    <span className={`text-base md:text-2xl font-black ${sub.score === 0 ? 'text-red-500' : 'text-green-600 dark:text-[#96C68E]'}`}>{sub.score}</span>
                                                    <span className="text-slate-400 font-bold text-[8px] md:text-xs">/{sub.total || stats.totalPossible}</span>
                                                </div>
                                            )}
                                            <ChevronRight size={14} className="ml-1 md:ml-3 text-slate-300 md:hidden" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ViewAnswerDetailModal = ({
    activeModal, selectedSubmission, activeQuiz, darkMode, setActiveModal,
    manualScores, setManualScores, updateQuizSubmission, createNotification,
    selectedCourse, setSelectedSubmission, setCourseSubmissions, closeModal
}) => {
    return (activeModal === 'viewAnswerDetail' && selectedSubmission && activeQuiz && (
        <div className="flex flex-col h-full w-full">
            {/* HEADER */}
            <div className={`px-4 py-3 md:px-8 md:py-6 border-b flex justify-between items-center ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
                <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
                    <button
                        onClick={() => setActiveModal('viewResults')}
                        className={`p-2 md:p-3 rounded-xl md:rounded-2xl transition-colors shrink-0 ${darkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        <ChevronLeft size={20} className="md:w-6 md:h-6" />
                    </button>
                    <div className="bg-indigo-100 p-2 md:p-3 rounded-xl md:rounded-2xl shrink-0 hidden sm:block">
                        <FileText className="text-indigo-500 md:w-8 md:h-8" size={24} />
                    </div>
                    <div className="min-w-0">
                        <h2 className={`text-sm md:text-2xl font-extrabold tracking-tight truncate ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                            {selectedSubmission.studentName}
                        </h2>
                        <div className="flex items-center gap-1.5 md:gap-2 mt-0.5 md:mt-1">
                            <span className={`text-[10px] md:text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'} whitespace-nowrap`}>คะแนนรวม:</span>
                            <div className={`flex items-center gap-0.5 md:gap-1 rounded-lg p-0.5 md:p-1 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                {selectedSubmission.status === 'pending_grading' ? (
                                    <span className="text-[10px] md:text-lg font-bold text-orange-400 px-1 md:px-2">รอตรวจ</span>
                                ) : (
                                    <span className={`text-[10px] md:text-xl font-black px-1 md:px-2 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                                        {activeQuiz.items.reduce((total, item, idx) => {
                                            const answer = selectedSubmission.answers ? selectedSubmission.answers[idx] : null;
                                            let isCorrect = false;
                                            if (!item.type || item.type === 'choice') isCorrect = answer === item.correct;
                                            else if (item.type === 'true_false') isCorrect = answer === item.correctAnswer;
                                            else if (item.type === 'matching') isCorrect = (item.pairs || []).length > 0 && (item.pairs || []).every((p, pIdx) => (answer ? answer[pIdx] : null) === p.right);
                                            else if (item.type === 'text') {
                                                if (!item.manualGrading) {
                                                    const userText = (answer || '').toString().trim().toLowerCase();
                                                    const keywords = (item.keywords || []).map(k => k.trim().toLowerCase());
                                                    isCorrect = keywords.some(k => userText.includes(k));
                                                }
                                            }

                                            const itemScore = item.manualGrading
                                                ? (manualScores[idx] !== undefined ? manualScores[idx] : (isCorrect ? (item.points || 1) : 0))
                                                : (isCorrect ? (item.points || 1) : 0);

                                            return total + itemScore;
                                        }, 0)}
                                    </span>
                                )}
                                <span className="text-slate-400 font-medium text-[8px] md:text-sm pr-1 md:pr-2">/ {activeQuiz?.totalPoints || activeQuiz?.items?.reduce((total, item) => total + (Number(item.points) || 1), 0) || selectedSubmission.total}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-1.5 md:gap-3 shrink-0">
                    <button
                        onClick={async () => {
                            try {
                                let newTotalScore = 0;
                                const newItemScores = { ...manualScores };

                                activeQuiz.items.forEach((item, idx) => {
                                    const itemPoints = Number(item.points) || 1;
                                    let itemScore = 0;

                                    if (newItemScores[idx] !== undefined && newItemScores[idx] !== '') {
                                        itemScore = Number(newItemScores[idx]);
                                    } else {
                                        let isCorrect = false;
                                        const answer = selectedSubmission.answers ? selectedSubmission.answers[idx] : null;

                                        if (!item.type || item.type === 'choice') isCorrect = answer === item.correct;
                                        else if (item.type === 'true_false') isCorrect = answer === item.correctAnswer;
                                        else if (item.type === 'matching') {
                                            const pairs = item.pairs || [];
                                            if (pairs.length > 0) isCorrect = pairs.every((p, pIdx) => (answer ? answer[pIdx] : null) === p.right);
                                        }
                                        else if (item.type === 'text' && !item.manualGrading) {
                                            const userText = (answer || '').toString().trim().toLowerCase();
                                            const keywords = (item.keywords || []).map(k => k.trim().toLowerCase());
                                            isCorrect = keywords.some(k => userText.includes(k));
                                        }

                                        if (isCorrect) itemScore = itemPoints;
                                    }
                                    newTotalScore += itemScore;
                                    newItemScores[idx] = itemScore;
                                });

                                const maxTotal = activeQuiz.items.reduce((sum, item) => sum + (Number(item.points) || 1), 0);

                                await updateQuizSubmission(selectedSubmission.firestoreId, {
                                    score: newTotalScore,
                                    total: maxTotal,
                                    itemScores: newItemScores,
                                    status: 'submitted'
                                });

                                const updatedSub = { ...selectedSubmission, score: newTotalScore, total: maxTotal, itemScores: newItemScores, status: 'submitted' };
                                setSelectedSubmission(updatedSub);
                                setCourseSubmissions(prev => prev.map(s => s.firestoreId === selectedSubmission.firestoreId ? updatedSub : s));

                                alert('บันทึกคะแนนเรียบร้อย');

                                const quizTotalPoints = activeQuiz.totalPoints || activeQuiz.items.reduce((total, item) => total + (Number(item.points) || 1), 0);

                                if (selectedSubmission.studentId) {
                                    await createNotification(
                                        selectedSubmission.studentId,
                                        `ประกาศคะแนน: ${activeQuiz?.title}`,
                                        'grade',
                                        `คุณครูได้ตรวจข้อสอบของคุณแล้ว ได้คะแนน ${newTotalScore}/${quizTotalPoints}`,
                                        { courseId: selectedCourse.firestoreId, targetType: 'grades', targetId: activeQuiz.firestoreId }
                                    );
                                }

                            } catch (err) {
                                console.error(err);
                                alert('บันทึกไม่สำเร็จ: ' + err.message);
                            }
                        }}
                        className="px-3 md:px-6 py-1.5 md:py-2 bg-[#96C68E] text-white rounded-lg md:rounded-xl hover:bg-[#85b57d] transition-colors shadow-md font-bold flex items-center gap-1 md:gap-2 text-[10px] md:text-base"
                    >
                        <Save size={14} className="md:w-5 md:h-5" /> <span className="hidden xs:inline">บันทึก</span>
                    </button>
                    <button
                        onClick={closeModal}
                        className="group p-1.5 md:p-2 hover:bg-red-50 rounded-lg md:rounded-xl transition-colors duration-200 shrink-0"
                    >
                        <X size={20} className="text-slate-400 md:w-7 md:h-7 group-hover:text-red-500 transition-colors" />
                    </button>
                </div>
            </div>

            {/* CONTENT */}
            <div className={`flex-1 overflow-y-auto p-4 md:p-8 ${darkMode ? 'bg-slate-950/50' : 'bg-slate-50/50'}`}>
                <div className="max-w-5xl mx-auto space-y-4 md:space-y-6">
                    {activeQuiz.items.map((item, idx) => {
                        const answer = selectedSubmission.answers ? selectedSubmission.answers[idx] : null;
                        let isCorrect = false;

                        if (!item.type || item.type === 'choice') {
                            isCorrect = answer === item.correct;
                        } else if (item.type === 'true_false') {
                            isCorrect = answer === item.correctAnswer;
                        } else if (item.type === 'matching') {
                            const pairs = item.pairs || [];
                            if (pairs.length > 0) isCorrect = pairs.every((p, pIdx) => (answer ? answer[pIdx] : null) === p.right);
                        } else if (item.type === 'text') {
                            if (item.manualGrading) {
                                isCorrect = false;
                            } else {
                                const userText = (answer || '').toString().trim().toLowerCase();
                                const keywords = (item.keywords || []).map(k => k.trim().toLowerCase());
                                isCorrect = keywords.some(k => userText.includes(k));
                            }
                        }

                        const currentScore = item.manualGrading
                            ? (manualScores[idx] !== undefined ? manualScores[idx] : (isCorrect ? (item.points || 1) : 0))
                            : (isCorrect ? (item.points || 1) : 0);

                        const maxPoints = item.points || 1;

                        return (
                            <div key={idx} className={`p-4 md:p-6 rounded-2xl md:rounded-3xl border shadow-sm transition-all hover:shadow-md ${item.manualGrading ? (darkMode ? 'bg-slate-800 border-orange-900/30 ring-2 md:ring-4 ring-orange-900/10' : 'bg-white border-orange-100 ring-2 md:ring-4 ring-orange-50/50') : (isCorrect ? (darkMode ? 'bg-slate-800 border-green-900/30 ring-2 md:ring-4 ring-green-900/10' : 'bg-white border-green-100 ring-2 md:ring-4 ring-green-50/50') : (darkMode ? 'bg-slate-800 border-red-900/30 ring-2 md:ring-4 ring-red-900/10' : 'bg-white border-red-100 ring-2 md:ring-4 ring-red-50/50'))}`}>
                                <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
                                    <div className="flex items-start gap-2 md:gap-3">
                                        <span className={`flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-lg font-bold text-[10px] md:text-sm shrink-0 ${darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                                            {idx + 1}
                                        </span>
                                        <h3 className={`font-bold text-sm md:text-lg leading-snug ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{item.q}</h3>
                                    </div>

                                    <div className="flex items-center gap-2 self-end sm:self-auto">
                                        <span className="text-[10px] md:text-xs font-bold text-slate-400">คะแนน</span>
                                        <input
                                            type="number"
                                            min="0"
                                            max={maxPoints}
                                            disabled={!item.manualGrading}
                                            className={`w-12 md:w-16 p-1 text-center font-bold text-xs md:text-base border rounded-lg outline-none focus:ring-2 focus:ring-indigo-100 ${item.manualGrading ? (darkMode ? 'bg-orange-900/20 border-orange-700 text-orange-400' : 'bg-orange-50 border-orange-200 text-orange-700') : (darkMode ? 'bg-slate-700 border-slate-600 text-slate-500 cursor-not-allowed' : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed')}`}
                                            value={currentScore}
                                            onChange={(e) => {
                                                if (item.manualGrading) {
                                                    setManualScores(prev => ({ ...prev, [idx]: Number(e.target.value) }));
                                                }
                                            }}
                                        />
                                        <span className="text-slate-400 font-bold text-xs md:text-sm">/ {maxPoints}</span>
                                    </div>
                                </div>

                                {item.manualGrading && (
                                    <div className="mb-4">
                                        <span className={`px-2 py-1 rounded-lg text-[9px] md:text-xs font-bold flex items-center w-fit ${darkMode ? 'bg-orange-900/20 text-orange-400' : 'bg-orange-100 text-orange-700'}`}>
                                            <AlertCircle size={12} className="mr-1 md:w-3.5 md:h-3.5" /> ต้องตรวจเอง
                                        </span>
                                    </div>
                                )}

                                {item.image && (
                                    <div className="mb-4 md:mb-6 pl-0 md:pl-11">
                                        <img src={item.image} alt="Question" className="h-32 md:h-48 w-full md:w-auto rounded-xl md:rounded-2xl border border-slate-100 object-cover shadow-sm" />
                                    </div>
                                )}

                                <div className="pl-0 md:pl-11 space-y-2 md:space-y-4">
                                    {(!item.type || item.type === 'choice') && (
                                        item.options.map((opt, optIdx) => {
                                            let optionClass = "p-2.5 md:p-3 rounded-lg md:rounded-xl border flex items-center justify-between transition-all relative overflow-hidden text-xs md:text-base ";
                                            if (optIdx === item.correct) optionClass += (darkMode ? "bg-green-900/20 border-green-500/50 text-green-400 font-bold" : "bg-green-50 border-green-200 text-green-700 font-bold");
                                            else if (optIdx === answer) optionClass += (darkMode ? "bg-slate-700 border-slate-600 text-slate-300 font-bold" : "bg-slate-50 border-slate-200 text-slate-600 font-bold");
                                            else optionClass += (darkMode ? "bg-slate-800 border-slate-700 text-slate-500 opacity-60" : "bg-white border-slate-100 text-slate-400 opacity-60");

                                            return (
                                                <div key={optIdx} className={optionClass}>
                                                    <span className="flex items-center gap-2 md:gap-3 relative z-10">
                                                        <div className="w-5 h-5 md:w-6 md:h-6 rounded-full border border-current flex items-center justify-center text-[8px] md:text-[10px] opacity-50 shrink-0">
                                                            {['A', 'B', 'C', 'D'][optIdx]}
                                                        </div>
                                                        <span className="min-w-0 break-words">{opt}</span>
                                                    </span>
                                                    {optIdx === item.correct && <CheckCircle size={14} className="text-green-500 shrink-0 md:w-4.5 md:h-4.5" />}
                                                    {optIdx === answer && optIdx !== item.correct && <span className="text-[9px] md:text-xs font-bold text-slate-400 shrink-0">ตอบ</span>}
                                                </div>
                                            );
                                        })
                                    )}

                                    {item.type === 'text' && (
                                        <div className={`p-3 md:p-4 rounded-xl border ${darkMode ? 'bg-slate-700/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                            <p className="text-[9px] md:text-xs font-bold text-slate-400 mb-1">คำตอบของนักเรียน:</p>
                                            <p className={`text-base md:text-lg font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{answer || '-'}</p>
                                            <div className={`mt-2 md:mt-3 pt-2 md:pt-3 border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                                                <p className="text-[9px] md:text-xs font-bold text-slate-400 mb-1">เฉลย (Keywords):</p>
                                                <div className="flex flex-wrap gap-1.5 md:gap-2">
                                                    {(item.keywords || []).map((k, kIdx) => (
                                                        <span key={kIdx} className={`border px-1.5 md:px-2 py-0.5 md:py-1 rounded text-[9px] md:text-xs ${darkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-white border-slate-200 text-slate-500'}`}>{k}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {item.type === 'matching' && (
                                        <div className={`p-3 md:p-4 rounded-xl space-y-1.5 md:space-y-2 ${darkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                                            {(item.pairs || []).map((pair, pIdx) => (
                                                <div key={pIdx} className="flex justify-between items-center text-[11px] md:text-sm gap-2">
                                                    <span className={`min-w-0 truncate ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{pair.left}</span>
                                                    <ArrowRight size={12} className="text-slate-300 shrink-0 md:w-3.5 md:h-3.5" />
                                                    <div className="flex flex-col items-end min-w-0">
                                                        <span className={`truncate max-w-full ${((answer && answer[pIdx]) === pair.right) ? 'text-green-600 font-bold' : 'text-slate-500'}`}>
                                                            {answer ? answer[pIdx] : '-'}
                                                        </span>
                                                        <span className="text-[8px] md:text-[10px] text-slate-400 truncate">(เฉลย: {pair.right})</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* FOOTER */}
            <div className={`px-4 py-3 md:px-8 md:py-5 border-t flex justify-end ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
                <button
                    onClick={() => setActiveModal('viewResults')}
                    className="px-4 md:px-6 py-2 md:py-2.5 bg-slate-800 text-white text-xs md:text-sm font-semibold rounded-lg md:rounded-xl hover:bg-slate-700 transition-all active:scale-95 shadow-md"
                >
                    กลับไปหน้าผลรวม
                </button>
            </div>
        </div>
    ));
};

const TakeQuizModal = ({
    activeQuiz, darkMode, quizRemainingSeconds, quizResult, MascotStar,
    quizAnswers, setQuizAnswers, submitQuiz, closeModal
}) => {
    // Pre-calculate shuffled options for matching questions to keep them stable during the quiz
    const shuffledMatchingOptions = useMemo(() => {
        if (!activeQuiz || !activeQuiz.items) return {};

        const shuffledMap = {};
        activeQuiz.items.forEach((item, idx) => {
            if (item.type === 'matching' && item.pairs) {
                // Shuffle only once and store
                shuffledMap[idx] = [...item.pairs].sort(() => Math.random() - 0.5);
            }
        });
        return shuffledMap;
    }, [activeQuiz.firestoreId || activeQuiz.id]); // Re-shuffle only if it's a different quiz

    return (
        <div className="p-4 md:p-8 h-full flex flex-col pt-12 md:pt-8 relative">
            <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors md:hidden"
            >
                <X size={20} className="text-slate-400" />
            </button>
            <div className={`mb-4 md:mb-6 pb-3 md:pb-4 border-b ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                <div className="flex justify-between items-center mb-1 md:mb-2 gap-2">
                    <h2 className={`text-lg md:text-2xl font-bold flex items-center truncate ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        <ClipboardList className="mr-2 md:mr-3 text-[#FF917B] shrink-0 md:w-6 md:h-6" size={18} /> <span className="truncate">{activeQuiz.title}</span>
                    </h2>
                    <div className={`flex items-center font-bold px-2.5 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl transition-colors shrink-0 text-xs md:text-base ${quizRemainingSeconds < 60 ? 'bg-red-50 text-red-500 animate-pulse' : (darkMode ? 'bg-green-900/20 text-[#96C68E] border border-[#96C68E]/30' : 'bg-[#F0FDF4] text-[#96C68E]')}`}>
                        <Clock size={14} className="mr-1.5 md:w-5 md:h-5 md:mr-2" />
                        {quizRemainingSeconds > 0
                            ? `${Math.floor(quizRemainingSeconds / 60)}:${(quizRemainingSeconds % 60).toString().padStart(2, '0')} นาที`
                            : activeQuiz.time}
                    </div>
                </div>
                <p className={`text-[10px] md:text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{activeQuiz.course} • {activeQuiz.questions} ข้อ</p>
            </div>

            {quizResult ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-[#BEE1FF] rounded-full flex items-center justify-center mb-4 md:mb-6 shadow-lg">
                        <MascotStar className="w-16 h-16 md:w-24 md:h-24" />
                    </div>
                    <h3 className={`text-xl md:text-3xl font-black mb-1 md:mb-2 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>ส่งข้อสอบเรียบร้อย!</h3>
                    {quizResult.status === 'pending_grading' ? (
                        <>
                            <p className={`text-xs md:text-base mb-4 md:mb-6 font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>ข้อสอบนี้มีส่วนที่ต้องรอคุณครูตรวจ</p>
                            <div className={`text-1xl md:text-2xl font-black text-orange-400 mb-4 md:mb-8 px-5 py-6 md:px-10 md:py-6 rounded-2xl md:rounded-[2rem] border-4 ${darkMode ? 'bg-orange-950/20 border-orange-900/50 shadow-none' : 'bg-orange-50/50 border-orange-100'}`}>
                                <p className="text-lg md:text-xl mb-1 opacity-60 text-orange-400/80">สถานะ</p>
                                รอการตรวจให้คะแนน
                            </div>
                        </>
                    ) : (
                        <>
                            <p className={`text-xs md:text-base mb-4 md:mb-6 font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>คุณทำคะแนนได้</p>
                            <div className="text-5xl md:text-7xl font-black text-[#FF917B] mb-4 md:mb-8 flex items-baseline gap-2">
                                {quizResult.score} <span className={`text-xl md:text-2xl font-bold ${darkMode ? 'text-slate-500' : 'text-slate-300'}`}>/ {quizResult.total}</span>
                            </div>
                        </>
                    )}
                    <button
                        onClick={closeModal}
                        className="mt-4 px-8 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-all active:scale-95 shadow-md md:hidden"
                    >
                        กลับสู่หน้าหลัก
                    </button>
                </div>
            ) : (
                <>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                        {activeQuiz.items.map((item, idx) => (
                            <div key={idx} className="mb-8 last:mb-0">
                                <div className="flex items-start gap-4 mb-4">
                                    <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                                        {idx + 1}
                                    </span>
                                    <div className="flex-1">
                                        <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{item.q}</h3>
                                        {item.image && (
                                            <img src={item.image} alt="Question" className="h-48 rounded-xl border border-slate-200 object-cover mb-4" />
                                        )}
                                    </div>
                                </div>

                                <div className="pl-0 sm:pl-12 pt-2 sm:pt-0">
                                    {(!item.type || item.type === 'choice') && (
                                        <div className="space-y-3">
                                            {item.options.map((opt, optIdx) => (
                                                <label key={optIdx} className={`flex flex-col p-3 sm:p-4 rounded-xl border cursor-pointer transition-all ${quizAnswers[idx] === optIdx
                                                    ? (darkMode ? 'bg-green-900/20 border-[#96C68E]' : 'bg-[#F0FDF4] border-[#96C68E] shadow-sm')
                                                    : (darkMode ? 'bg-slate-800 border-slate-700 hover:border-[#96C68E]' : 'bg-white border-slate-100 hover:border-[#96C68E]')
                                                    }`}>
                                                    <div className="flex items-center w-full">
                                                        <input
                                                            type="radio"
                                                            name={`q-${idx}`}
                                                            className="mr-2 sm:mr-3 w-4 h-4 sm:w-5 sm:h-5 accent-[#96C68E] flex-shrink-0"
                                                            onChange={() => setQuizAnswers({ ...quizAnswers, [idx]: optIdx })}
                                                            checked={quizAnswers[idx] === optIdx}
                                                        />
                                                        <span className={`font-medium text-sm sm:text-base ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{opt}</span>
                                                    </div>
                                                    {item.optionImages && item.optionImages[optIdx] && (
                                                        <div className="ml-8 mt-3 w-fit">
                                                            <img src={item.optionImages[optIdx]} alt="Option" className="h-40 rounded-lg object-contain border border-slate-100" />
                                                        </div>
                                                    )}
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {item.type === 'true_false' && (
                                        <div className="flex gap-2 sm:gap-4">
                                            <button
                                                onClick={() => setQuizAnswers({ ...quizAnswers, [idx]: true })}
                                                className={`flex-1 p-3 sm:p-6 rounded-xl sm:rounded-2xl border-2 font-bold text-sm sm:text-lg transition-all flex items-center justify-center gap-1 sm:gap-2 ${quizAnswers[idx] === true ? 'border-green-50 bg-green-50 text-green-700' : (darkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:border-green-500' : 'border-slate-100 bg-white text-slate-400 hover:border-green-200')}`}
                                            >
                                                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" /> ถูก (True)
                                            </button>
                                            <button
                                                onClick={() => setQuizAnswers({ ...quizAnswers, [idx]: false })}
                                                className={`flex-1 p-3 sm:p-6 rounded-xl sm:rounded-2xl border-2 font-bold text-sm sm:text-lg transition-all flex items-center justify-center gap-1 sm:gap-2 ${quizAnswers[idx] === false ? 'border-red-50 bg-red-50 text-red-700' : (darkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:border-green-500' : 'border-slate-100 bg-white text-slate-400 hover:border-red-200')}`}
                                            >
                                                <X className="w-5 h-5 sm:w-6 sm:h-6" /> ผิด (False)
                                            </button>
                                        </div>
                                    )}

                                    {item.type === 'matching' && (
                                        <div className={`space-y-4 p-2 sm:p-4 rounded-xl w-full ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                                            {item.pairs.map((pair, pIdx) => (
                                                <div key={pIdx} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 w-full">
                                                    <div className={`font-bold p-2 sm:p-3 text-[11px] sm:text-base rounded-lg border break-words h-full flex items-center ${darkMode ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
                                                        <span>{pair.left}</span>
                                                    </div>
                                                    <ArrowRight size={16} className="text-slate-300 hidden sm:block flex-shrink-0" />
                                                    <ArrowRight size={12} className="text-slate-300 sm:hidden flex-shrink-0" />
                                                    <div className="h-full">
                                                        <select
                                                            className={`w-full h-full p-2 sm:p-3 text-[11px] sm:text-base rounded-lg border outline-none focus:border-[#96C68E] cursor-pointer ${darkMode ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-white border-slate-200'}`}
                                                            value={quizAnswers[idx] ? quizAnswers[idx][pIdx] || '' : ''}
                                                            onChange={(e) => {
                                                                const currentAns = quizAnswers[idx] || {};
                                                                setQuizAnswers({
                                                                    ...quizAnswers,
                                                                    [idx]: { ...currentAns, [pIdx]: e.target.value }
                                                                });
                                                            }}
                                                        >
                                                            <option value="">เลือกคำตอบ...</option>
                                                            {(shuffledMatchingOptions[idx] || []).map((p, optionIdx) => (
                                                                <option key={optionIdx} value={p.right}>{p.right}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {item.type === 'text' && (
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="พิมพ์คำตอบของคุณที่นี่..."
                                                className={`w-full p-3 sm:p-4 rounded-xl border outline-none focus:border-[#96C68E] font-medium text-sm sm:text-base ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}
                                                value={quizAnswers[idx] || ''}
                                                onChange={(e) => setQuizAnswers({ ...quizAnswers, [idx]: e.target.value })}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className={`mt-6 pt-4 border-t flex justify-end ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                        <button
                            onClick={submitQuiz}
                            disabled={Object.keys(quizAnswers).length < activeQuiz.items.length}
                            className={`px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-bold text-base sm:text-lg transition-all ${Object.keys(quizAnswers).length === activeQuiz.items.length
                                ? 'bg-[#96C68E] text-white hover:bg-[#85b57d] shadow-md hover:translate-y-[-2px]'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                        >
                            ส่งข้อสอบ
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

const PendingQuizzesModal = ({
    darkMode, isListLoading, pendingGradingList, courses, setIsLoading,
    setSelectedCourse, setActiveQuiz, setCourseSubmissions, setActiveModal,
    getSubmissionsService
}) => {
    return (
        <div className="p-8 h-full flex flex-col w-full max-w-6xl">
            <h2 className={`text-2xl font-bold mb-6 flex items-center ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                <ClipboardCheck className="mr-3 text-[#FF917B]" /> ตรวจข้อสอบ (Pending Grading)
            </h2>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
                {isListLoading ? (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#96C68E] mb-3"></div>
                        <p>กำลังค้นหาข้อสอบที่รอตรวจ...</p>
                    </div>
                ) : pendingGradingList.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <CheckCircle2 size={48} className="mx-auto mb-4 text-green-200" />
                        <p>ไม่มีข้อสอบที่ต้องตรวจแล้ว!</p>
                    </div>
                ) : (
                    pendingGradingList.map((quiz) => (
                        <div key={quiz.firestoreId} className={`p-6 rounded-2xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${darkMode ? 'bg-slate-800 border-slate-700 hover:border-[#96C68E]' : 'bg-slate-50 border-slate-200 hover:border-[#96C68E]'}`}
                            onClick={() => {
                                const course = courses.find(c => c.name === quiz.courseName);
                                if (course) {
                                    setIsLoading(true);
                                    setSelectedCourse(course);
                                    setActiveQuiz(quiz);
                                    getSubmissionsService(quiz.firestoreId).then(subs => {
                                        if (subs) {
                                            setCourseSubmissions(subs);
                                            setActiveModal('viewResults');
                                        } else {
                                            alert('ไม่พบข้อมูลการส่งข้อสอบ');
                                        }
                                    }).catch(err => {
                                        console.error("Error loading submissions:", err);
                                        alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
                                    }).finally(() => {
                                        setIsLoading(false);
                                    });
                                } else {
                                    alert('ไม่พบข้อมูลวิชา');
                                }
                            }}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className={`font-bold text-lg ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{quiz.title}</h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${darkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-600'}`}>
                                    รอตรวจ {quiz.pendingCount} คน
                                </span>
                            </div>
                            <p className={`text-sm flex items-center gap-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                <BookOpen size={14} /> {quiz.courseName}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default QuizModals;
