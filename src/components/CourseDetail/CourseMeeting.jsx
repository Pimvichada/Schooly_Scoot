import React from 'react';
import { Video, VideoOff } from 'lucide-react';

const CourseMeeting = ({
    darkMode,
    userRole,
    meetingConfig,
    setMeetingConfig,
    updateCourse,
    selectedCourse,
    setActiveModal,
    handleStartMeeting
}) => {
    return (
        <div className={`space-y-6 ${darkMode ? 'text-slate-100' : ''}`}>
            <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-bold flex items-center ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                    <Video className="mr-2 text-[#96C68E]" /> ห้องเรียนออนไลน์
                </h2>
            </div>

            {userRole === 'teacher' ? (
                meetingConfig.isActive ? (
                    <div className={`rounded-3xl p-8 shadow-sm border text-center ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${darkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
                            <Video size={48} className={darkMode ? 'text-[#96C68E]' : 'text-green-600'} />
                        </div>
                        <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>กำลังมีการเรียนการสอน</h3>
                        <p className={darkMode ? 'text-slate-400 mb-6' : 'text-slate-600 mb-6'}>หัวข้อ: <span className="font-bold text-[#96C68E]">{meetingConfig.topic}</span></p>

                        <div className="flex flex-col gap-3 max-w-xs mx-auto">
                            <button
                                onClick={() => setActiveModal('video')}
                                className="w-full py-3 bg-[#96C68E] text-white rounded-xl font-bold hover:bg-[#85b57d] shadow-sm flex items-center justify-center"
                            >
                                <Video size={20} className="mr-2" /> กลับเข้าห้องเรียน
                            </button>
                            <button
                                onClick={async () => {
                                    if (confirm('ต้องการจบการสอนหรือไม่? นักเรียนทุกคนจะถูกตัดออกจากห้องเรียน')) {
                                        try {
                                            setMeetingConfig({ ...meetingConfig, isActive: false });
                                            await updateCourse(selectedCourse.firestoreId, { meeting: { isActive: false } });
                                        } catch (e) {
                                            console.error(e);
                                            alert('เกิดข้อผิดพลาด');
                                        }
                                    }
                                }}
                                className="w-full py-3 bg-red-100 text-red-500 rounded-xl font-bold hover:bg-red-200 shadow-sm flex items-center justify-center"
                            >
                                <VideoOff size={20} className="mr-2" /> จบการสอน
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className={`rounded-3xl p-8 shadow-sm border text-center ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${darkMode ? 'bg-emerald-900/20' : 'bg-[#F0FDF4]'}`}>
                            <Video size={48} className="text-[#96C68E]" />
                        </div>
                        <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>เปิดห้องเรียนออนไลน์</h3>
                        <p className={darkMode ? 'text-slate-500 mb-6' : 'text-slate-500 mb-6'}>สร้างห้องเรียนวิดีโอเพื่อสอนนักเรียนแบบ Real-time</p>

                        <div className="max-w-md mx-auto space-y-4">
                            <input
                                type="text"
                                placeholder="หัวข้อการเรียน (เช่น บทที่ 5: สมการเชิงเส้น)"
                                className={`w-full p-4 rounded-2xl border transition-all focus:outline-none focus:ring-2 focus:ring-[#96C68E]/20 ${darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-[#96C68E]' : 'border-slate-200 bg-slate-50 focus:border-[#96C68E]'}`}
                                value={meetingConfig.topic}
                                onChange={(e) => setMeetingConfig({ ...meetingConfig, topic: e.target.value })}
                            />
                            <button
                                onClick={() => handleStartMeeting(selectedCourse, setActiveModal)}
                                className="w-full py-4 bg-[#96C68E] text-white rounded-2xl font-bold text-lg hover:bg-[#85b57d] shadow-lg transition-all"
                            >
                                เริ่มการสอนทันที 🚀
                            </button>
                        </div>
                    </div>
                )
            ) : (
                <div className={`rounded-3xl p-8 shadow-sm border text-center ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                    {meetingConfig.isActive ? (
                        <>
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${darkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
                                <Video size={48} className={darkMode ? 'text-[#96C68E]' : 'text-green-600'} />
                            </div>
                            <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>กำลังมีการเรียนการสอน!</h3>
                            <p className={`${darkMode ? 'text-slate-300' : 'text-slate-600'} font-medium mb-1`}>หัวข้อ: <span className="text-[#96C68E]">{meetingConfig.topic}</span></p>
                            <p className={`mb-8 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>คุณครูกำลังรอคุณอยู่ เข้าห้องเรียนเพื่อเริ่มเรียนได้เลย</p>

                            <button
                                onClick={() => setActiveModal('video')}
                                className="px-10 py-4 bg-[#96C68E] text-white rounded-2xl font-bold text-lg hover:bg-[#85b57d] shadow-lg transition-all"
                            >
                                เข้าห้องเรียน
                            </button>
                        </>
                    ) : (
                        <>
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${darkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                                <VideoOff size={48} className={darkMode ? 'text-slate-700' : 'text-slate-300'} />
                            </div>
                            <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>ยังไม่มีการเรียนการสอน</h3>
                            <p className={darkMode ? 'text-slate-600' : 'text-slate-400'}>เมื่อคุณครูเริ่มคลาสเรียน ปุ่มเข้าห้องเรียนจะปรากฏที่นี่</p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default CourseMeeting;
