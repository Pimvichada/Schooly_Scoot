import React from 'react';

const CourseTabs = ({ courseTab, setCourseTab, userRole, pendingMembersCount, darkMode }) => {
    const tabs = [
        'หน้าหลัก',
        'งานในชั้นเรียน',
        'แบบทดสอบ',
        'สมาชิก',
        'คะแนน',
        'ห้องเรียนออนไลน์',
        ...(userRole === 'teacher' ? ['ตั้งค่า'] : [])
    ];

    const getTabKey = (tab) => {
        switch (tab) {
            case 'หน้าหลัก': return 'home';
            case 'งานในชั้นเรียน': return 'work';
            case 'แบบทดสอบ': return 'quizzes';
            case 'สมาชิก': return 'people';
            case 'คะแนน': return 'grades';
            case 'ห้องเรียนออนไลน์': return 'meeting';
            case 'ตั้งค่า': return 'settings';
            default: return 'home';
        }
    };

    return (
        <div className={`flex p-1.5 gap-1 overflow-x-auto custom-scrollbar rounded-2xl ${darkMode ? 'bg-slate-900/50' : 'bg-slate-100/50'}`}>
            {tabs.map((tab) => {
                const tabKey = getTabKey(tab);
                const isActive = courseTab === tabKey;

                return (
                    <button
                        key={tab}
                        onClick={() => setCourseTab(tabKey)}
                        className={`relative px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 ${isActive
                            ? (darkMode ? 'bg-slate-800 text-white shadow-lg shadow-black/20' : 'bg-white text-slate-800 shadow-sm')
                            : (darkMode ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50')
                            }`}
                    >
                        {tab}
                        {tab === 'สมาชิก' && userRole === 'teacher' && pendingMembersCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#F8FAFC] shadow-sm animate-pulse">
                                {pendingMembersCount}
                            </span>
                        )}
                    </button>
                )
            })}
        </div>
    );
};

export default CourseTabs;
