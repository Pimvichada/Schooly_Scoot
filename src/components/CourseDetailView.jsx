import React from 'react';
import CourseHeader from './CourseDetail/CourseHeader';
import CourseTabs from './CourseDetail/CourseTabs';
import CourseFeed from './CourseDetail/CourseFeed';
import CourseClasswork from './CourseDetail/CourseClasswork';
import CourseQuizzes from './CourseDetail/CourseQuizzes';
import CourseMembers from './CourseDetail/CourseMembers';
import CourseGrades from './CourseDetail/CourseGrades';
import CourseMeeting from './CourseDetail/CourseMeeting';
import CourseSettings from './CourseDetail/CourseSettings';
import { Plus, X } from 'lucide-react';
import { isOverlap } from '../utils/helpers.jsx';

const CourseDetailView = ({
    darkMode,
    selectedCourse,
    setSelectedCourse,
    courseTab,
    setCourseTab,
    profile,
    newPostContent,
    setNewPostContent,
    newPostFiles,
    handleRemovePostFile,
    fileInputRef,
    handlePostFileSelect,
    handleCreatePost,
    loading,
    posts,
    auth,
    handleDeletePost,
    handleEditPost,
    assignments,
    setAssignments,
    userRole,
    openGradingModal,
    setActiveModal,
    setSelectedAssignment,
    deleteAssignment,
    workView,
    setNewAssignment,
    pendingMembers,
    handleApprove,
    handleReject,
    members,
    handleLeaveCourse,
    quizzes,
    mySubmissions,
    handleToggleQuizStatus,
    handleViewResults,
    handleEditQuiz,
    handleDeleteQuiz,
    setNewExam,
    currentTime,
    setActiveQuiz,
    setQuizRemainingSeconds,
    meetingConfig,
    setMeetingConfig,
    updateCourse,
    handleStartMeeting,
    editingCourse,
    setEditingCourse,
    scheduleForm,
    setScheduleForm,
    editingScheduleIndex,
    setEditingScheduleIndex,
    handleUpdateCourse,
    handleDeleteCourse,
    validateScheduleConflict,
    selectedPostId,
    setSelectedPostId
}) => {
    const renderSubTabContent = () => {
        switch (courseTab) {
            case 'home':
                return (
                    <CourseFeed
                        darkMode={darkMode}
                        selectedCourse={selectedCourse}
                        profile={profile}
                        newPostContent={newPostContent}
                        setNewPostContent={setNewPostContent}
                        newPostFiles={newPostFiles}
                        handleRemovePostFile={handleRemovePostFile}
                        fileInputRef={fileInputRef}
                        handlePostFileSelect={handlePostFileSelect}
                        handleCreatePost={handleCreatePost}
                        loading={loading}
                        posts={posts}
                        auth={auth}
                        handleDeletePost={handleDeletePost}
                        handleEditPost={handleEditPost}
                        setCourseTab={setCourseTab}
                        selectedPostId={selectedPostId}
                        setSelectedPostId={setSelectedPostId}
                    />
                );
            case 'work':
                return (
                    <CourseClasswork
                        darkMode={darkMode}
                        selectedCourse={selectedCourse}
                        assignments={assignments}
                        setAssignments={setAssignments}
                        userRole={userRole}
                        openGradingModal={openGradingModal}
                        setActiveModal={setActiveModal}
                        setSelectedAssignment={setSelectedAssignment}
                        deleteAssignment={deleteAssignment}
                        workView={workView}
                        setNewAssignment={setNewAssignment}
                    />
                );
            case 'quizzes':
                return (
                    <CourseQuizzes
                        darkMode={darkMode}
                        userRole={userRole}
                        quizzes={quizzes}
                        mySubmissions={mySubmissions}
                        handleToggleQuizStatus={handleToggleQuizStatus}
                        handleViewResults={handleViewResults}
                        handleEditQuiz={handleEditQuiz}
                        handleDeleteQuiz={handleDeleteQuiz}
                        setNewExam={setNewExam}
                        selectedCourse={selectedCourse}
                        setActiveModal={setActiveModal}
                        currentTime={currentTime}
                        setActiveQuiz={setActiveQuiz}
                        setQuizRemainingSeconds={setQuizRemainingSeconds}
                    />
                );
            case 'people':
                return (
                    <CourseMembers
                        darkMode={darkMode}
                        userRole={userRole}
                        pendingMembers={pendingMembers}
                        handleApprove={handleApprove}
                        handleReject={handleReject}
                        selectedCourse={selectedCourse}
                        members={members}
                        handleLeaveCourse={handleLeaveCourse}
                    />
                );
            case 'grades':
                return (
                    <CourseGrades
                        darkMode={darkMode}
                        quizzes={quizzes}
                        mySubmissions={mySubmissions}
                        userRole={userRole}
                        handleViewResults={handleViewResults}
                        assignments={assignments}
                        selectedCourse={selectedCourse}
                        openGradingModal={openGradingModal}
                    />
                );
            case 'meeting':
                return (
                    <CourseMeeting
                        darkMode={darkMode}
                        userRole={userRole}
                        meetingConfig={meetingConfig}
                        setMeetingConfig={setMeetingConfig}
                        updateCourse={updateCourse}
                        selectedCourse={selectedCourse}
                        setActiveModal={setActiveModal}
                        handleStartMeeting={handleStartMeeting}
                    />
                );
            case 'settings':
                return (
                    <CourseSettings
                        darkMode={darkMode}
                        editingCourse={editingCourse}
                        setEditingCourse={setEditingCourse}
                        scheduleForm={scheduleForm}
                        setScheduleForm={setScheduleForm}
                        editingScheduleIndex={editingScheduleIndex}
                        setEditingScheduleIndex={setEditingScheduleIndex}
                        handleUpdateCourse={handleUpdateCourse}
                        handleDeleteCourse={handleDeleteCourse}
                        userRole={userRole}
                        selectedCourse={selectedCourse}
                        validateScheduleConflict={validateScheduleConflict}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className={`space-y-6 animate-in fade-in duration-500 ${darkMode ? 'text-slate-100' : ''}`}>
            <CourseHeader
                selectedCourse={selectedCourse}
                setSelectedCourse={setSelectedCourse}
                darkMode={darkMode}
            />

            <CourseTabs
                courseTab={courseTab}
                setCourseTab={setCourseTab}
                userRole={userRole}
                pendingMembersCount={pendingMembers.length}
                darkMode={darkMode}
            />

            <div className="min-h-[400px]">
                {renderSubTabContent()}
            </div>
        </div>
    );
};


export const CourseModals = ({
    activeModal,
    newCourseData,
    setNewCourseData,
    handleCreateCourse,
    courses,
    joinCode,
    setJoinCode,
    handleJoinCourse
}) => {
    const [attemptedSubmit, setAttemptedSubmit] = React.useState(false);

    React.useEffect(() => {
        if (newCourseData?.scheduleItems?.length > 0) {
            setAttemptedSubmit(false);
        }
    }, [newCourseData?.scheduleItems]);

    if (activeModal !== 'create' && activeModal !== 'join') return null;

    const dayMap = { '0': 'อาทิตย์', '1': 'จันทร์', '2': 'อังคาร', '3': 'พุธ', '4': 'พฤหัส', '5': 'ศุกร์', '6': 'เสาร์' };

    return (
        <>
            {/* CREATE CLASS MODAL */}
            {activeModal === 'create' && (
                <div className="p-8">
                    <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">สร้างห้องเรียนใหม่</h2>
                    <form className="space-y-6" onSubmit={(e) => {
                        e.preventDefault();
                        if (!newCourseData.scheduleItems || newCourseData.scheduleItems.length === 0) {
                            setAttemptedSubmit(true);
                            alert('ไม่สามารถสร้างห้องเรียนได้: กรุณาเพิ่มวันในตารางเรียนอย่างน้อย 1 วัน โดยการกดปุ่ม + (บวก)');
                            return;
                        }
                        handleCreateCourse(e);
                    }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">ชื่อวิชา</label>
                                <input
                                    type="text"
                                    className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:border-[#96C68E] outline-none transition-colors text-lg"
                                    placeholder="เช่น วิทยาศาสตร์ ม.1"
                                    value={newCourseData.name}
                                    onChange={(e) => setNewCourseData({ ...newCourseData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">รหัสวิชา/CLASS ID</label>
                                <input
                                    type="text"
                                    className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:border-[#96C68E] outline-none transition-colors text-lg"
                                    placeholder="SCI-101"
                                    value={newCourseData.code}
                                    onChange={(e) => setNewCourseData({ ...newCourseData, code: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-2">คำอธิบายรายวิชา/Description</label>
                            <textarea
                                className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:border-[#96C68E] outline-none transition-colors h-32"
                                placeholder="รายละเอียดวิชา..."
                                value={newCourseData.description}
                                onChange={(e) => setNewCourseData({ ...newCourseData, description: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">วันที่เริ่มเรียน/Start Date</label>
                                <input
                                    type="date"
                                    className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:border-[#96C68E] outline-none transition-colors"
                                    value={newCourseData.startDate}
                                    onChange={(e) => setNewCourseData({ ...newCourseData, startDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">วันที่สิ้นสุด/End Date</label>
                                <input
                                    type="date"
                                    className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:border-[#96C68E] outline-none transition-colors"
                                    value={newCourseData.endDate}
                                    onChange={(e) => setNewCourseData({ ...newCourseData, endDate: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Schedule Builder */}
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-2">ตารางเรียน <span className="text-red-500">*จำเป็นต้องเพิ่ม*</span></label>
                            <div className={`bg-slate-50 p-6 rounded-2xl border ${attemptedSubmit && (!newCourseData.scheduleItems || newCourseData.scheduleItems.length === 0) ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200'} space-y-4`}>
                                <div className="flex flex-wrap gap-4 items-end">
                                    <div className="flex-1 min-w-[120px]">
                                        <label className="text-xs font-bold text-slate-400 mb-1 block">วัน</label>
                                        <select id="daySelect" className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#96C68E]">
                                            <option value="1">จันทร์</option>
                                            <option value="2">อังคาร</option>
                                            <option value="3">พุธ</option>
                                            <option value="4">พฤหัส</option>
                                            <option value="5">ศุกร์</option>
                                            <option value="6">เสาร์</option>
                                            <option value="0">อาทิตย์</option>
                                        </select>
                                    </div>
                                    <div className="flex-1 min-w-[120px]">
                                        <label className="text-xs font-bold text-slate-400 mb-1 block">เวลาเริ่ม</label>
                                        <input id="startTime" type="time" className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#96C68E]" />
                                    </div>
                                    <div className="flex-none self-center pb-3 text-slate-400">-</div>
                                    <div className="flex-1 min-w-[120px]">
                                        <label className="text-xs font-bold text-slate-400 mb-1 block">เวลาสิ้นสุด</label>
                                        <input id="endTime" type="time" className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#96C68E]" />
                                    </div>
                                    <div className="flex-1 min-w-[100px]">
                                        <label className="text-xs font-bold text-slate-400 mb-1 block">ห้องเรียน</label>
                                        <input id="room" type="text" placeholder="ระบุห้อง" className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#96C68E]" />
                                    </div>
                                    <button type="button" onClick={() => {
                                        const day = document.getElementById('daySelect').value;
                                        const start = document.getElementById('startTime').value;
                                        const end = document.getElementById('endTime').value;
                                        const room = document.getElementById('room').value;

                                        if (start && end) {
                                            const newItem = {
                                                dayOfWeek: parseInt(day),
                                                startTime: start,
                                                endTime: end,
                                                room: room,
                                                dayLabel: dayMap[day]
                                            };

                                            // VALIDATION: Check Overlap
                                            for (const c of courses) {
                                                if (c.schedule) {
                                                    for (const exist of c.schedule) {
                                                        if (isOverlap(newItem, exist)) {
                                                            alert(`เวลาเรียนชนกับวิชา "${c.name}" (${exist.dayLabel} ${exist.startTime}-${exist.endTime})`);
                                                            return;
                                                        }
                                                    }
                                                }
                                            }
                                            for (const item of newCourseData.scheduleItems) {
                                                if (isOverlap(newItem, item)) {
                                                    alert(`เวลาเรียนชนกับรายการที่คุณเพิ่งเพิ่ม (${item.dayLabel} ${item.startTime}-${item.endTime})`);
                                                    return;
                                                }
                                            }

                                            setNewCourseData({
                                                ...newCourseData,
                                                scheduleItems: [...newCourseData.scheduleItems, newItem]
                                            });
                                        }
                                    }} className="bg-blue-500 text-white p-3 rounded-xl hover:bg-blue-600 transition-colors shadow-sm flex items-center justify-center min-w-[50px]">
                                        <Plus size={20} />
                                    </button>
                                </div>

                                {newCourseData.scheduleItems.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                        {newCourseData.scheduleItems.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-[#E0F2FE] text-[#0284C7] font-bold px-3 py-1 rounded-lg text-sm">{item.dayLabel}</div>
                                                    <div className="text-sm text-slate-700 font-medium">{item.startTime} - {item.endTime}</div>
                                                    <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">ห้อง {item.room}</div>
                                                </div>
                                                <button type="button" onClick={() => {
                                                    const newItems = newCourseData.scheduleItems.filter((_, i) => i !== idx);
                                                    setNewCourseData({ ...newCourseData, scheduleItems: newItems });
                                                }} className="text-slate-400 hover:text-red-500 p-1"><X size={18} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-2">เลือกสีธีม</label>
                            <div className="flex flex-wrap gap-4">
                                {[
                                    'bg-[#96C68E]', 'bg-[#FF917B]', 'bg-[#BEE1FF]', 'bg-[#FFE787]',
                                    'bg-[#E0BBE4]', 'bg-[#FFC6FF]', 'bg-[#B5EAD7]', 'bg-[#FFDAC1]'
                                ].map(c => (
                                    <div
                                        key={c}
                                        onClick={() => setNewCourseData({ ...newCourseData, color: c })}
                                        className={`w-12 h-12 rounded-full ${c} cursor-pointer ring-offset-2 transition-all shadow-sm ${newCourseData.color === c ? 'ring-2 ring-slate-400 scale-110 shadow-md' : 'ring-0 hover:ring-2 hover:ring-slate-200'}`}
                                    ></div>
                                ))}
                            </div>
                        </div>

                        {attemptedSubmit && (!newCourseData.scheduleItems || newCourseData.scheduleItems.length === 0) && (
                            <div className="text-red-600 bg-red-50 p-4 rounded-xl flex items-center gap-3 font-bold border border-red-200 shadow-sm animate-pulse">
                                <span className="text-2xl">⚠️</span>
                                <div>
                                    <h4 className="text-red-700">ไม่อนุญาตให้สร้างห้องเรียน!</h4>
                                    <p className="text-sm text-red-600">กรุณาเลื่อนขึ้นไป <b>เลือกวัน เวลา</b> และกดปุ่ม <b className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded mx-1 pb-1">+ (บวก)</b> เพื่อตั้งตารางเรียนอย่างน้อย 1 วัน</p>
                                </div>
                            </div>
                        )}

                        <button type="submit" className="w-full py-4 bg-[#96C68E] text-white rounded-xl font-bold text-xl mt-6 hover:bg-[#85b57d] shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">สร้างห้องเรียน</button>
                    </form>
                </div>
            )}

            {/* JOIN CLASS MODAL */}
            {activeModal === 'join' && (
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">เข้าร่วมห้องเรียน</h2>
                    <form className="space-y-4" onSubmit={handleJoinCourse}>
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">รหัสเข้าห้องเรียน (Invite Code)</label>
                            <input
                                type="text"
                                className="w-full p-4 text-center text-2xl tracking-widest uppercase rounded-xl border border-slate-200 bg-slate-50 focus:border-[#96C68E] outline-none transition-colors font-mono"
                                placeholder="ABC-123"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                            />
                            <p className="text-xs text-slate-400 mt-2 text-center">ขอรหัส 6 หลักจากคุณครูผู้สอนเพื่อเข้าร่วม</p>
                        </div>
                        <button type="submit" className="w-full py-3 bg-[#96C68E] text-white rounded-xl font-bold text-lg mt-4 hover:bg-[#85b57d] shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">เข้าร่วม</button>
                    </form>
                </div>
            )}
        </>
    );
};

export default CourseDetailView;
