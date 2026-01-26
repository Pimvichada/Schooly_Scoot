import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, Phone, Hand, MessageSquare, Plus, Smile, MoreVertical } from 'lucide-react';

const VideoConference = ({ roomName, userName, onLeave, isTeacher }) => {
    const jitsiContainerRef = useRef(null);
    const [api, setApi] = useState(null);
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoMuted, setIsVideoMuted] = useState(false);
    const [isHandRaised, setIsHandRaised] = useState(false);
    const [showChat, setShowChat] = useState(false); // Can be toggleable

    // Custom Pastel Theme Classes
    const theme = {
        bg: "bg-[#F0F9FF]", // Light Blue Background
        videoTile: "rounded-[32px] border-4 border-white shadow-sm overflow-hidden",
        toolbar: "bg-white/80 backdrop-blur-md shadow-lg rounded-full px-8 py-4 flex gap-4 items-center border border-white/50",
        btnBase: "p-4 rounded-full transition-all duration-300 transform hover:scale-110 shadow-sm flex items-center justify-center",
        btnActive: "bg-[#96C68E] text-white", // Green
        btnInactive: "bg-[#FF9B8A] text-white", // Salmon/Orange-Pink
        btnNeutral: "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100",
    };

    useEffect(() => {
        if (!window.JitsiMeetExternalAPI) {
            console.error("Jitsi API not loaded");
            return;
        }

        const domain = 'meet.jit.si';
        const options = {
            roomName: roomName || 'SchoolyScootClassroom',
            width: '100%',
            height: '100%',
            parentNode: jitsiContainerRef.current,
            userInfo: {
                displayName: userName || 'Student'
            },
            configOverwrite: {
                startWithAudioMuted: true,
                startWithVideoMuted: false,
                prejoinPageEnabled: false,
                toolbarButtons: [], // Hide default toolbar completely!
                disableDeepLinking: true,
            },
            interfaceConfigOverwrite: {
                TOOLBAR_ALWAYS_VISIBLE: false,
                SHOW_JITSI_WATERMARK: false,
                SHOW_WATERMARK_FOR_GUESTS: false,
                DEFAULT_BACKGROUND: '#F0F9FF',
                DISABLE_VIDEO_BACKGROUND: true,
            }
        };

        const jitsiApi = new window.JitsiMeetExternalAPI(domain, options);
        setApi(jitsiApi);

        // Event Listeners
        jitsiApi.addEventListeners({
            audioMuteStatusChanged: (e) => setIsAudioMuted(e.muted),
            videoMuteStatusChanged: (e) => setIsVideoMuted(e.muted),
            // We can listen for other events like participantJoined etc.
        });

        return () => {
            jitsiApi.dispose();
        };
    }, [roomName, userName]);

    // Command handlers
    const toggleAudio = () => {
        api?.executeCommand('toggleAudio');
    };

    const toggleVideo = () => {
        api?.executeCommand('toggleVideo');
    };

    const toggleHand = () => {
        api?.executeCommand('toggleRaiseHand');
        setIsHandRaised(!isHandRaised);
    };

    const hangup = () => {
        api?.executeCommand('hangup');
        onLeave?.();
    };

    return (
        <div className={`relative w-full h-full flex flex-col overflow-hidden ${theme.bg}`}>

            {/* 1. Header with Status & Subject */}
            <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start pointer-events-none">
                <div className="bg-white/90 backdrop-blur rounded-2xl p-4 shadow-sm border border-white flex items-center gap-4 pointer-events-auto">
                    <div className="bg-[#A7F3D0] w-3 h-3 rounded-full animate-pulse shadow-[0_0_10px_#A7F3D0]"></div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">ห้องเรียนออนไลน์</h3>
                        <span className="text-xs font-bold text-[#FF9B8A] bg-[#FFF0EE] px-2 py-0.5 rounded-lg">LIVE</span>
                    </div>
                </div>

                {/* Participants/Chat Toggles could go here */}
                <div className="flex gap-2 pointer-events-auto">
                    <button className="bg-white p-3 rounded-2xl shadow-sm text-slate-400 hover:text-[#96C68E] transition-colors">
                        <Smile size={24} />
                    </button>
                    <button className="bg-white p-3 rounded-2xl shadow-sm text-slate-400 hover:text-[#BEE1FF] transition-colors">
                        <MessageSquare size={24} />
                    </button>
                </div>
            </div>

            {/* 2. Main Stage - Jitsi Container */}
            <div className="flex-1 relative z-10 p-6 pt-24 pb-24">
                {/* We apply rounded corners to the container, but iframe content styles are hard to override cross-origin.
             However, checking 'rounded-[32px]' on the container might clip the corners. */}
                <div ref={jitsiContainerRef} className={`w-full h-full ${theme.videoTile} bg-slate-200`} />
            </div>

            {/* 3. Floating Toolbar (Pencil Box) */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 pointer-events-auto">
                <div className={theme.toolbar}>
                    {/* Mic */}
                    <button onClick={toggleAudio} className={`${theme.btnBase} ${!isAudioMuted ? theme.btnActive : theme.btnInactive} w-14 h-14`}>
                        {!isAudioMuted ? <Mic size={24} /> : <MicOff size={24} />}
                    </button>

                    {/* Camera */}
                    <button onClick={toggleVideo} className={`${theme.btnBase} ${!isVideoMuted ? theme.btnActive : theme.btnInactive} w-14 h-14`}>
                        {!isVideoMuted ? <Video size={24} /> : <VideoOff size={24} />}
                    </button>

                    <div className="w-px h-8 bg-slate-200 mx-2"></div>

                    {/* Hand */}
                    <button onClick={toggleHand} className={`${theme.btnBase} ${isHandRaised ? 'bg-[#FFE787] text-slate-800' : theme.btnNeutral} w-12 h-12`}>
                        <Hand size={20} />
                    </button>

                    {/* More Options */}
                    <button className={`${theme.btnBase} ${theme.btnNeutral} w-12 h-12`}>
                        <MoreVertical size={20} />
                    </button>

                    <div className="w-px h-8 bg-slate-200 mx-2"></div>

                    {/* Leave */}
                    <button onClick={hangup} className={`${theme.btnBase} bg-[#FF9B8A] text-white hover:bg-[#ff8672] w-16 h-14 rounded-[2rem]`}>
                        <Phone size={24} className="rotate-[135deg]" />
                    </button>
                </div>
            </div>

        </div>
    );
};

export default VideoConference;
