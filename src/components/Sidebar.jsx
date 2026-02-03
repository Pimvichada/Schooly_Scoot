import React from 'react';
import { PieChart, BookOpen, CheckSquare, Calendar, Settings, User, Menu, Bell } from 'lucide-react';
import logo_no_text from '../assets/logo_no_tex3.png';

const SidebarItem = ({ id, label, icon: Icon, activeTab, onSelect }) => {
    const active = activeTab === id;
    return (
        <button
            onClick={onSelect}
            className={`flex items-center w-full px-4 py-3 mb-2 rounded-2xl transition-all duration-200 ${active
                ? 'bg-white shadow-sm text-slate-800 font-bold'
                : 'text-slate-600 hover:bg-white/50'
                }`}
        >
            <Icon className={`w-5 h-5 mr-3 ${active ? 'text-[#FF917B]' : 'text-slate-400'}`} />
            <span>{label}</span>
        </button>
    );
};

const Sidebar = ({
    darkMode,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    activeTab,
    setActiveTab,
    userRole,
    profile,
    setSelectedCourse
}) => {

    const handleSelect = (tab) => {
        setActiveTab(tab);
        setSelectedCourse(null);
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar Navigation */}
            <aside className={`
        fixed md:static inset-y-0 left-0 z-30 w-64 p-4 flex flex-col transition-transform duration-300 border-r
        ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#F0F4F8] border-white'}
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>

                <h1 className="flex justify-center items-center">
                    <img
                        src={logo_no_text}
                        alt="Schooly Scoot Logo"
                        className="h-20 w-auto"
                    />
                </h1>

                <span className={`text-xl font-bold tracking-tight text-center mb-6 transition-colors ${darkMode ? 'text-white' : 'text-slate-800'}`}>Schooly Scoot</span>

                <nav className="flex-1 overflow-y-auto custom-scrollbar">
                    <p className="px-4 text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">เมนูหลัก</p>
                    <SidebarItem
                        id="dashboard"
                        label="แดชบอร์ด"
                        icon={PieChart}
                        activeTab={activeTab}
                        darkMode={darkMode}
                        onSelect={() => handleSelect('dashboard')}
                    />
                    <SidebarItem
                        id="courses"
                        label="ห้องเรียน"
                        icon={BookOpen}
                        activeTab={activeTab}
                        darkMode={darkMode}
                        onSelect={() => handleSelect('courses')}
                    />
                    <SidebarItem
                        id="assignments"
                        label={userRole === 'student' ? "การบ้าน" : "ตรวจงาน"}
                        icon={CheckSquare}
                        activeTab={activeTab}
                        darkMode={darkMode}
                        onSelect={() => handleSelect('assignments')}
                    />
                    <SidebarItem
                        id="schedule"
                        label="ตารางเรียน"
                        icon={Calendar}
                        activeTab={activeTab}
                        darkMode={darkMode}
                        onSelect={() => handleSelect('schedule')}
                    />
                    <SidebarItem
                        id="settings"
                        label="ตั้งค่า"
                        icon={Settings}
                        activeTab={activeTab}
                        darkMode={darkMode}
                        onSelect={() => handleSelect('settings')}
                    />
                </nav>

                {/* Profile Footer */}
                <div className={`mt-auto ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-transparent'} p-3 rounded-2xl shadow-sm border`}>
                    <div className="flex items-center p-2 rounded-xl">
                        <div className={`w-10 h-10 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-slate-200'} flex items-center justify-center overflow-hidden`}>
                            {profile.photoURL ? (
                                <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User className="text-slate-400" />
                            )}
                        </div>
                        <div className="ml-3 flex-1 overflow-hidden">
                            <p className={`text-sm font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'} truncate`}>
                                {profile.firstName} {profile.lastName}
                            </p>
                            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} truncate capitalize`}>
                                {profile.roleLabel}
                            </p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;

export const MobileHeader = ({
    darkMode,
    setIsMobileMenuOpen,
    setActiveModal,
    hasUnread
}) => {
    return (
        <header className={`md:hidden ${darkMode ? 'bg-slate-900 border-slate-800 shadow-lg' : 'bg-white shadow-sm border-slate-100'} p-4 flex items-center justify-between z-10 border-b`}>
            <button
                onClick={() => setIsMobileMenuOpen(true)}
                className={`${darkMode ? 'text-slate-300' : 'text-slate-600'}`}
            >
                <Menu />
            </button>
            <span className={`font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Schooly Scoot</span>
            <button
                onClick={() => setActiveModal('notificationsList')}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center relative"
            >
                <Bell size={16} className="text-slate-600" />
                {hasUnread && <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>}
            </button>
        </header>
    );
};

export const TopHeader = ({
    activeTab,
    userRole,
    setActiveModal,
    darkMode,
    hasUnread
}) => {
    const getHeaderText = () => {
        switch (activeTab) {
            case 'dashboard': return 'ภาพรวม';
            case 'courses': return 'ห้องเรียน';
            case 'assignments': return userRole === 'student' ? 'การบ้าน' : 'ตรวจงาน';
            case 'schedule': return 'ตารางเรียน';
            default: return 'ตั้งค่า';
        }
    };

    return (
        <div className="hidden md:flex justify-between items-center mb-8">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                {getHeaderText()}
            </h2>
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setActiveModal('notificationsList')}
                    className={`w-10 h-10 rounded-xl ${darkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-50'} border flex items-center justify-center relative`}
                >
                    <Bell size={20} className="text-slate-600" />
                    {hasUnread && <span className="absolute top-2 right-2 w-2 h-2 bg-[#FF917B] rounded-full ring-2 ring-white"></span>}
                </button>
            </div>
        </div>
    );
};
