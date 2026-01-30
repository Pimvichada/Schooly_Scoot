import React from 'react';
import { Video } from 'lucide-react';

const VideoConference = ({ meetingConfig, profile, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D3436]/60 backdrop-blur-md p-4">
            <div className="bg-white w-[95vw] h-[90vh] rounded-[2.5rem] overflow-hidden flex flex-col relative shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-4 border-white">

                {/* Header - ใช้สีฟ้า #BEE1FF เป็นพื้นหลังหลัก */}
                <div className="bg-[#BEE1FF] p-5 flex justify-between items-center border-b-2 border-[#96C68E]/20">
                    <div className="flex items-center gap-4">
                        {/* Icon Box - ใช้สีส้ม #FF917B */}
                        <div className="bg-[#FF917B] p-3 rounded-2xl shadow-sm rotate-3">
                            <Video size={24} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-black text-[#4A4A4A] text-xl tracking-tight leading-none">
                                {meetingConfig.topic || 'ห้องเรียนออนไลน์'}
                            </h3>
                            <p className="text-xs font-bold text-[#96C68E] mt-1 uppercase tracking-wider">
                                Schooly Scoot Conference
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="bg-white hover:bg-[#FFE787] text-[#4A4A4A] px-6 py-2.5 rounded-2xl transition-all font-bold text-sm shadow-sm border-2 border-transparent hover:border-[#FF917B] active:scale-95"
                    >
                        ปิดหน้าต่าง
                    </button>
                </div>

                {/* Jitsi Iframe Container */}
                <div className="flex-1 bg-[#F8FAFC] relative">
                    <iframe
                        src={`https://meet.jit.si/${meetingConfig.roomName}#config.startWithAudioMuted=true&config.startWithVideoMuted=true&userInfo.displayName="${profile.firstName} ${profile.lastName}"`}
                        className="w-full h-full border-0 relative z-10"
                        allow="camera; microphone; fullscreen; display-capture; autoplay"
                    ></iframe>

                    {/* Overlay Loading - ใช้สีเหลือง #FFE787 เป็นพื้นหลังตอนโหลด */}
                    <div className="absolute inset-0 bg-[#FFE787]/30 flex flex-col items-center justify-center z-0">
                        <div className="flex gap-2 mb-4">
                            <div className="w-3 h-3 bg-[#FF917B] rounded-full animate-bounce"></div>
                            <div className="w-3 h-3 bg-[#96C68E] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-3 h-3 bg-[#BEE1FF] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        </div>
                        <span className="text-[#4A4A4A] font-bold text-lg animate-pulse">
                            กำลังจัดเตรียมห้องเรียน...
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoConference;
