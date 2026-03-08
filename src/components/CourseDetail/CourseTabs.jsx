import React, { useEffect, useRef, useState } from 'react';
import { Home, FileText, ClipboardCheck, Users, Star, Video, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

const CourseTabs = ({ courseTab, setCourseTab, userRole, pendingMembersCount, darkMode }) => {
    const scrollRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    const tabList = [
        { label: 'หน้าหลัก', key: 'home', icon: Home },
        { label: 'งานในชั้นเรียน', key: 'work', icon: FileText },
        { label: 'แบบทดสอบ', key: 'quizzes', icon: ClipboardCheck },
        { label: 'สมาชิก', key: 'people', icon: Users },
        { label: 'คะแนน', key: 'grades', icon: Star },
        { label: 'ห้องเรียนออนไลน์', key: 'meeting', icon: Video },
        ...(userRole === 'teacher' ? [{ label: 'ตั้งค่า', key: 'settings', icon: Settings }] : [])
    ];

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setShowLeftArrow(scrollLeft > 10);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    // Scroll active tab into view on mobile & check scroll
    useEffect(() => {
        if (scrollRef.current) {
            const activeTab = scrollRef.current.querySelector('[data-active="true"]');
            if (activeTab) {
                activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
            // Small delay to ensure layout is ready
            setTimeout(checkScroll, 100);
        }
    }, [courseTab]);

    useEffect(() => {
        const currentRef = scrollRef.current;
        if (currentRef) {
            currentRef.addEventListener('scroll', checkScroll);
            window.addEventListener('resize', checkScroll);
            // Initial check
            checkScroll();
        }
        return () => {
            if (currentRef) currentRef.removeEventListener('scroll', checkScroll);
            window.removeEventListener('resize', checkScroll);
        };
    }, []);

    return (
        <div className="relative group/tabs">
            {/* Desktop View: Original Clean Design */}
            <div className={`hidden md:flex p-1.5 gap-1 overflow-x-auto custom-scrollbar rounded-2xl ${darkMode ? 'bg-slate-900/50' : 'bg-slate-100/50'}`}>
                {tabList.map((tab) => {
                    const isActive = courseTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setCourseTab(tab.key)}
                            className={`relative px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 ${isActive
                                ? (darkMode ? 'bg-slate-800 text-white shadow-lg shadow-black/20' : 'bg-white text-slate-800 shadow-sm')
                                : (darkMode ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50')
                                }`}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Mobile View: Modern Pill Design with dynamic Scroll Indicators */}
            <div className="block md:hidden relative">
                {/* Scroll Indicators / Arrows */}
                {showLeftArrow && (
                    <div className={`absolute left-0 top-0 bottom-0 z-10 flex items-center pr-10 bg-gradient-to-r ${darkMode ? 'from-slate-900 via-slate-900/80 to-transparent' : 'from-slate-50 via-slate-50/80 to-transparent'} pointer-events-none transition-opacity duration-300`}>
                        <div className={`p-1 rounded-full ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-500 shadow-sm'} ml-1`}>
                            <ChevronLeft size={14} />
                        </div>
                    </div>
                )}

                {showRightArrow && (
                    <div className={`absolute right-0 top-0 bottom-0 z-10 flex items-center pl-10 bg-gradient-to-l ${darkMode ? 'from-slate-900 via-slate-900/80 to-transparent' : 'from-slate-50 via-slate-50/80 to-transparent'} pointer-events-none transition-opacity duration-300`}>
                        <div className={`p-1 rounded-full ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-500 shadow-sm'} mr-1`}>
                            <ChevronRight size={14} />
                        </div>
                    </div>
                )}

                <div
                    ref={scrollRef}
                    className={`flex items-center gap-1.5 p-2 overflow-x-auto no-scrollbar rounded-2xl ${darkMode ? 'bg-slate-800/30' : 'bg-slate-100/30'}`}
                >
                    {tabList.map((tab) => {
                        const isActive = courseTab === tab.key;
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.key}
                                data-active={isActive}
                                onClick={() => setCourseTab(tab.key)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 whitespace-nowrap border-2 ${isActive
                                    ? (darkMode ? 'bg-[#FF917B] border-[#FF917B] text-white shadow-lg' : 'bg-[#FF917B] border-[#FF917B] text-white shadow-md')
                                    : (darkMode ? 'bg-transparent border-slate-700 text-slate-500' : 'bg-white border-slate-200 text-slate-500')
                                    }`}
                            >
                                <Icon size={16} />
                                <span className="text-xs font-bold leading-none">{tab.label}</span>

                                {tab.key === 'people' && userRole === 'teacher' && pendingMembersCount > 0 && (
                                    <span className="flex h-3 w-3 rounded-full bg-red-500 border border-white pulse"></span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <style jsx="true">{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes pulse {
                    0% { transform: scale(0.95); opacity: 0.9; }
                    70% { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(0.95); opacity: 0.9; }
                }
                .pulse { animation: pulse 1.5s infinite ease-in-out; }
            `}</style>
        </div>
    );
};

export default CourseTabs;
