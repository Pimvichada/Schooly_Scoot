import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Video } from 'lucide-react';

const VideoConference = ({ meetingConfig, profile, isMinimized, onMinimize, onRestore, onLeave }) => {
    // State for Dragging
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0 }); // Refs for mutable values during drag
    const initialPosRef = useRef({ x: 0, y: 0 });

    // Reset position when minimized/maximized changes
    useEffect(() => {
        if (!isMinimized) {
            setPosition({ x: 0, y: 0 });
        }
    }, [isMinimized]);

    // Handle Drag Start
    const handleMouseDown = (e) => {
        if (!isMinimized) return; // Only draggable when minimized
        setIsDragging(true);
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        initialPosRef.current = { ...position };
    };

    // Handle Drag Move & End (Global)
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            const deltaX = e.clientX - dragStartRef.current.x;
            const deltaY = e.clientY - dragStartRef.current.y;
            setPosition({
                x: initialPosRef.current.x + deltaX,
                y: initialPosRef.current.y + deltaY
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    // Handle Click (Prevent restore if dragging happened)
    const handleClick = (e) => {
        if (isMinimized) {
            // Calculate distance moved. If small, treat as click. If large, it was a drag.
            const distance = Math.sqrt(Math.pow(position.x - initialPosRef.current.x, 2) + Math.pow(position.y - initialPosRef.current.y, 2));
            if (distance < 5 && !isDragging) {
                onRestore();
            }
        }
    };


    // Memoize the URL to prevent iframe reloading on re-renders (preserves audio/connection)
    const jitsiUrl = useMemo(() => {
        return `https://meet.jit.si/${meetingConfig.roomName}#config.startWithAudioMuted=true&config.startWithVideoMuted=true&userInfo.displayName="${profile.firstName} ${profile.lastName}"`;
    }, [meetingConfig.roomName, profile.firstName, profile.lastName]);

    return (
        <div
            className={`fixed z-[100] bg-slate-900 shadow-2xl overflow-hidden transition-shadow duration-300 ease-in-out origin-bottom-right
                right-[2.5vw] bottom-[2.5vh] w-[95vw] h-[95vh] rounded-[2.5rem] ring-4 ring-white
                ${isMinimized ? 'cursor-grab active:cursor-grabbing hover:ring-[#FF917B]' : ''}`}
            onClick={handleClick}
            onMouseDown={handleMouseDown}
            style={{
                pointerEvents: 'auto',
                // Important: Combine Translate (Drag) with Scale (PiP Zoom)
                // When Not Minimized: No Translate, Scale 1
                // When Minimized: Translate(x,y), Scale 0.25 (and force absolute position logic handled below)
                transform: isMinimized
                    ? `translate(${position.x}px, ${position.y}px) scale(0.25)`
                    : 'translate(0px, 0px) scale(1)',
                transition: isDragging ? 'none' : 'transform 0.3s ease-in-out' // Disable transition during drag for smoothness
            }}
        >
            {/* 1. Header (Absolute Overlay) - Fades out when minimized */}
            <div className={`absolute top-0 left-0 right-0 z-[300] bg-[#BEE1FF]/95 backdrop-blur-sm p-3 flex justify-between items-center border-b border-[#96C68E]/20 transition-opacity duration-300 ${isMinimized ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <div className="flex items-center gap-4">
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

                <div className="flex gap-3">
                    <button
                        onClick={(e) => { e.stopPropagation(); onMinimize(); }}
                        className="bg-white/80 hover:bg-[#FFE787] text-[#4A4A4A] px-6 py-2.5 rounded-2xl transition-all font-bold text-sm shadow-sm border-2 border-transparent hover:border-[#FF917B] active:scale-95"
                    >
                        ย่อหน้าต่าง _
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onLeave(); }}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-2xl transition-all font-bold text-sm shadow-sm active:scale-95 border-2 border-red-500"
                    >
                        ออกจากห้องเรียน
                    </button>
                </div>
            </div>

            <div className={`absolute inset-0 z-30 flex flex-col justify-between p-[2rem] pointer-events-none transition-opacity duration-300 ${isMinimized ? 'opacity-100' : 'opacity-0'}`}>
                {/* Top center "Expand" Button - Transparent until hovered/active */}
                <div className="flex justify-center pt-8">
                    <div className="bg-white/80 backdrop-blur-md rounded-[3rem] px-10 py-5 flex items-center gap-4 text-[#4A4A4A] hover:bg-[#BEE1FF] hover:scale-105 transition-all pointer-events-auto shadow-xl border-[6px] border-white/20 cursor-pointer animate-pulse hover:animate-none">
                        <Video size={56} className="text-[#FF917B]" />
                        <span className="text-[2.5rem] font-bold whitespace-nowrap">
                            ขยายเต็มจอ
                        </span>
                    </div>
                </div>
            </div>

            {/* Iframe Wrapper with higher z-index */}
            <div className="absolute inset-0 z-[200]">

                {/* 3. Jitsi Iframe (Absolute Fullscreen) - NEVER MOVES, NEVER RESIZES */}
                <div className="absolute top-20 left-0 right-0 bottom-0 bg-[#F8FAFC]">
                {/* Pointer events disabled when minimized so clicks go to container */}
                <iframe
                    src={jitsiUrl}
                    className={`w-full h-full border-0 ${isMinimized ? 'pointer-events-none' : ''}`}
                    allow="camera; microphone; fullscreen; display-capture; autoplay"
                ></iframe>

                {/* Loading State */}
                <div className="absolute inset-0 bg-[#FFE787]/30 flex flex-col items-center justify-center z-[-1]">
                    <span className="text-[#4A4A4A] font-bold text-lg animate-pulse">Loading...</span>
                </div>

            </div>
        </div >
        </div>
    );
    
};



export default VideoConference;
