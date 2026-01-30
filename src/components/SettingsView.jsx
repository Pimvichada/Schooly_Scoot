import React from 'react';
import {
    User,
    Edit2,
    LogOut,
    Settings,
    BarChart3,
    Bell,
    Moon,
    Sun
} from 'lucide-react';

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

    const bgMain = darkMode ? 'bg-slate-100' : 'bg-white';
    const bgCard = darkMode ? 'bg-white' : 'bg-slate-50';
    const border = 'border-slate-200';
    const textMain = 'text-slate-700';
    const textSub = 'text-slate-500';

    return (
        <div className="space-y-6">

            {/* ================= ACCOUNT ================= */}
            <div className={`${bgMain} ${border} rounded-3xl p-8 border`}>
                <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${textMain}`}>
                    <User className="text-[#96C68E]" /> บัญชีผู้ใช้
                </h3>

                <div className="flex flex-col md:flex-row gap-8">

                    {/* Profile */}
                    <div className="flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow">
                            {profile.photoURL ? (
                                <img src={profile.photoURL} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#BEE1FF] text-slate-600 text-3xl font-bold">
                                    {profile.firstName?.[0]}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => {
                                setEditProfileData(profile);
                                setActiveModal('editProfile');
                            }}
                            className="mt-3 text-sm font-bold text-blue-500 hover:underline"
                        >
                            แก้ไขรูปโปรไฟล์
                        </button>
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-4">
                        <Info label="ชื่อ - นามสกุล" value={`${profile.firstName} ${profile.lastName}`} />
                        <Info label="อีเมล" value={profile.email} />
                        <div className={`${bgCard} ${border} p-4 rounded-2xl border`}>
                            <p className="text-xs text-slate-400 font-bold mb-1">สถานะ</p>
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-bold">
                                {profile.roleLabel}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-8 pt-6 border-t border-slate-200 flex gap-4 justify-end">
                    <ActionButton icon={<Edit2 size={18} />} text="แก้ไขข้อมูล" />
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold bg-red-50 text-red-500 hover:bg-red-100"
                    >
                        <LogOut size={18} /> ออกจากระบบ
                    </button>
                </div>
            </div>

            {/* ================= SETTINGS ================= */}
            <div className={`${bgMain} ${border} rounded-3xl p-8 border`}>
                <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${textMain}`}>
                    <Settings className="text-[#96C68E]" /> การตั้งค่าทั่วไป
                </h3>

                <div className="space-y-6">

                    {/* Font */}
                    <div className={`${bgCard} ${border} p-6 rounded-2xl border`}>
                        <div className="flex justify-between mb-3">
                            <span className={`font-bold ${textMain} flex gap-2`}>
                                <BarChart3 size={18} /> ขนาดตัวอักษร
                            </span>
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold">
                                {fontSize}%
                            </span>
                        </div>
                        <input
                            type="range"
                            min="80"
                            max="150"
                            value={fontSize}
                            onChange={(e) => setFontSize(+e.target.value)}
                            className="w-full accent-[#96C68E]"
                        />
                    </div>

                    {/* Toggles */}
                    <div className="grid md:grid-cols-2 gap-4">

                        <ToggleCard
                            icon={<Bell />}
                            title="การแจ้งเตือน"
                            value={notificationsEnabled}
                            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                        />

                        <ToggleCard
                            icon={darkMode ? <Moon /> : <Sun />}
                            title="โหมดมืด"
                            value={darkMode}
                            onClick={() => setDarkMode(!darkMode)}
                        />

                    </div>
                </div>
            </div>
        </div>
    );
};

const Info = ({ label, value }) => (
    <div className="bg-white border border-slate-200 p-4 rounded-2xl">
        <p className="text-xs text-slate-400 font-bold mb-1">{label}</p>
        <p className="text-slate-700 font-medium">{value}</p>
    </div>
);

const ActionButton = ({ icon, text }) => (
    <button className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">
        {icon} {text}
    </button>
);

const ToggleCard = ({ icon, title, value, onClick }) => (
    <div
        onClick={onClick}
        className="bg-white border border-slate-200 p-6 rounded-2xl cursor-pointer flex items-center gap-3"
    >
        <div className={`${value ? 'text-green-500' : 'text-slate-400'}`}>
            {icon}
        </div>
        <div>
            <p className="font-bold text-slate-700 text-sm">{title}</p>
            <p className="text-xs text-slate-500">{value ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</p>
        </div>
    </div>
);

export default SettingsView;
