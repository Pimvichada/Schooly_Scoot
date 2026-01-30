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
    validateScheduleConflict
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

export default CourseDetailView;
