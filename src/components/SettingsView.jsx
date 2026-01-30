import React from 'react';
import { User, Edit2, LogOut, Settings, BarChart3, Bell, Moon, Sun } from 'lucide-react';

const SettingsView = ({
    darkMode,
    setDarkMode,
    profile,
    fontSize,
    setFontSize,
    notificationsEnabled,
    setNotificationsEnabled,
    setEditProfileData,
    setActiveModal,
    handleLogout
}) => {
    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
            {/* ส่วนบัญชีผู้ใช้ */}
            <div className={`${darkMode ? 'bg-slate-500 border-slate-400' : 'bg-white border-slate-100'} rounded-3xl p-8 border shadow-sm`}>
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'} mb-6 flex items-center gap-2`}>
                    <User className="text-[#96C68E]" /> บัญชีผู้ใช้
                </h3>

                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                    <div className="flex flex-col items-center">
                        <div className={`w-24 h-24 rounded-full ${darkMode ? 'bg-slate-400 border-slate-300' : 'bg-slate-100 border-white'} mb-4 overflow-hidden border-4 shadow-md relative group`}>
                            {profile.photoURL ? (
                                <img src={profile.photoURL} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className={`w-full h-full flex items-center justify-center ${darkMode ? 'bg-indigo-900/50 text-indigo-300' : 'bg-[#BEE1FF] text-slate-600'} text-3xl font-bold`}>
                                    {profile.firstName?.[0]}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => {
                                setEditProfileData({
                                    firstName: profile.firstName,
                                    lastName: profile.lastName,
                                    photoURL: profile.photoURL
                                });
                                setActiveModal('editProfile');
                            }}
                            className="text-sm text-blue-500 hover:text-blue-600 font-bold"
                        >
                            แก้ไขรูปโปรไฟล์
                        </button>
                    </div>

                    <div className="flex-1 space-y-4 w-full">
                        <Info label="ชื่อ - นามสกุล" value={`${profile.firstName} ${profile.lastName}`} darkMode={darkMode} />
                        <Info label="อีเมล" value={profile.email} darkMode={darkMode} />
                        <div className={`${darkMode ? 'bg-slate-400 border-slate-300' : 'bg-[#f8fafc] border-[#f1f5f9]'} p-4 rounded-2xl border`}>
                            <p className={`text-xs ${darkMode ? 'text-slate-200 font-bold' : 'text-[#94a3b8] font-bold'} uppercase mb-1`}>สถานะ</p>
                            <span className={`inline-block px-3 py-1 ${darkMode ? 'bg-green-900/30 text-[#96C68E]' : 'bg-[#f0fdf4] text-[#16a34a]'} rounded-lg text-sm font-bold`}>
                                {profile.roleLabel}
                            </span>
                        </div>
                    </div>
                </div>

                <div className={`mt-8 pt-8 ${darkMode ? 'border-slate-400' : 'border-slate-50'} border-t flex flex-wrap gap-4 justify-end`}>
                    <button
                        onClick={() => {
                            setEditProfileData({
                                firstName: profile.firstName,
                                lastName: profile.lastName,
                                photoURL: profile.photoURL
                            });
                            setActiveModal('editProfile');
                        }}
                        className={`flex items-center gap-2 px-6 py-3 ${darkMode ? 'bg-slate-400 border-slate-300 text-white hover:bg-slate-300' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'} border rounded-2xl font-bold transition-all shadow-sm`}
                    >
                        <Edit2 size={18} /> แก้ไขข้อมูลส่วนตัว
                    </button>
                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-2 px-6 py-3 ${darkMode ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-red-50 text-red-500 hover:bg-red-100'} rounded-2xl font-bold transition-all shadow-sm`}
                    >
                        <LogOut size={18} /> ออกจากระบบ
                    </button>
                </div>
            </div>

            {/* ส่วนการตั้งค่าทั่วไป */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                    <Settings className="text-[#96C68E]" size={22} />
                    <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                        การตั้งค่าทั่วไป
                    </h3>
                </div>

                <div className={`${darkMode ? 'bg-slate-500 border-slate-400' : 'bg-[#f8fafc] border-slate-100'} rounded-3xl p-8 border shadow-sm`}>
                    <div className="space-y-8">
                        {/* Font Size Slider */}
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-2">
                                    <BarChart3 size={20} className="text-blue-400 transform rotate-90" />
                                    <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                                        ขนาดตัวอักษร
                                    </span>
                                </div>
                                <div className={`px-4 py-1 rounded-lg font-bold ${darkMode ? 'bg-blue-900/40 text-blue-200' : 'bg-[#edf2ff] text-blue-500'}`}>
                                    {fontSize}%
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className={`${darkMode ? 'text-slate-200' : 'text-slate-400'} text-sm min-w-[30px]`}>เล็ก</span>
                                <div className="relative flex-1 h-6 flex items-center">
                                    <input
                                        type="range"
                                        min="80"
                                        max="150"
                                        value={fontSize}
                                        onChange={(e) => setFontSize(parseInt(e.target.value))}
                                        className={`w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#96C68E] ${darkMode ? 'bg-slate-400' : 'bg-[#e2e8f0]'}`}
                                    />
                                    {/* 100% Marker (Value 100 in range 80-150 is approx 28.57%) */}
                                    <div
                                        className="absolute top-1/2 -translate-y-1/2 w-1 h-3 bg-slate-400 rounded-full pointer-events-none"
                                        style={{ left: '28.57%' }}
                                    ></div>
                                    <span className="absolute -bottom-5 left-[28.57%] -translate-x-1/2 text-[10px] text-slate-400 font-bold">100</span>
                                </div>
                                <span className={`${darkMode ? 'text-slate-200' : 'text-slate-400'} text-sm min-w-[30px] text-right`}>ใหญ่</span>
                            </div>
                            <p className={`${darkMode ? 'text-slate-200' : 'text-slate-400'} text-xs mt-4 italic`}>
                                * ปรับขนาดตัวอักษรของระบบให้เหมาะสมกับการมองเห็น
                            </p>
                        </div>

                        {/* Toggle Buttons (Switch) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ToggleCard
                                icon={<Bell size={20} />}
                                title="การแจ้งเตือน"
                                value={notificationsEnabled}
                                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                                darkMode={darkMode}
                            />

                            <ToggleCard
                                icon={darkMode ? <Moon size={20} /> : <Sun size={20} />}
                                title="โหมดมืด (Dark Mode)"
                                value={darkMode}
                                onClick={() => setDarkMode(!darkMode)}
                                darkMode={darkMode}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Info = ({ label, value, darkMode }) => (
    <div className={`${darkMode ? 'bg-slate-400 border-slate-300' : 'bg-[#f8fafc] border-[#f1f5f9]'} p-4 rounded-2xl border`}>
        <p className={`text-xs ${darkMode ? 'text-slate-200 font-bold' : 'text-[#94a3b8] font-bold'} uppercase mb-1`}>{label}</p>
        <p className={`${darkMode ? 'text-white' : 'text-[#1e293b]'} text-lg font-bold`}>{value}</p>
    </div>
);

const ActionButton = ({ icon, text, darkMode, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-3 ${darkMode ? 'bg-slate-400 border-slate-300 text-white hover:bg-slate-300' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'} border rounded-2xl font-bold transition-all shadow-sm`}
    >
        {icon} {text}
    </button>
);

const ToggleCard = ({ icon, title, value, onClick, darkMode }) => (
    <div
        onClick={onClick}
        className={`p-6 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${value
            ? (darkMode ? 'bg-slate-400 border-[#96C68E] shadow-sm' : 'bg-white border-[#96C68E] shadow-md transform scale-[1.02]')
            : (darkMode ? 'bg-slate-600 opacity-60 border-slate-500' : 'bg-slate-50 opacity-60 border-slate-200')
            } group hover:shadow-lg duration-300`}
    >
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl transition-colors ${value
                ? (darkMode ? 'bg-[#96C68E]/20 text-[#96C68E]' : 'bg-[#F0FDF4] text-[#96C68E]')
                : 'bg-slate-200 text-slate-400'
                }`}>
                {icon}
            </div>
            <div>
                <p className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-800'}`}>{title}</p>
                <p className={`text-xs ${darkMode ? 'text-slate-200' : 'text-slate-500'}`}>{value ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</p>
            </div>
        </div>

        {/* Modern Visual Switch */}
        <div className={`w-12 h-6 rounded-full relative transition-all duration-300 ease-in-out shadow-inner ${value ? 'bg-[#96C68E]' : (darkMode ? 'bg-slate-700' : 'bg-slate-300')
            }`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-lg ${value ? 'left-7 scale-110' : 'left-1'
                }`} />
        </div>
    </div>
);

export default SettingsView;