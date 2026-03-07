import React from 'react';
import { Check, X, AlertTriangle, Info, HelpCircle } from 'lucide-react';

const SystemModal = ({ isOpen, onClose, onConfirm, type = "success", title, message, darkMode, showCancel = false }) => {
    if (!isOpen) return null;

    // Determine icon and colors based on type
    const getIconConfig = () => {
        switch (type) {
            case 'confirm':
                return {
                    icon: <HelpCircle size={56} className="text-[#FF917B]" strokeWidth={3} />,
                    circleStroke: '#FF917B',
                    bgCircle: darkMode ? '#32211e' : '#fff5f2'
                };
            case 'error':
            case 'danger':
                return {
                    icon: <X size={56} className="text-red-500" strokeWidth={4} />,
                    circleStroke: '#EF4444',
                    bgCircle: darkMode ? '#451a1a' : '#fef2f2'
                };
            case 'warning':
                return {
                    icon: <AlertTriangle size={56} className="text-amber-500" strokeWidth={3} />,
                    circleStroke: '#F59E0B',
                    bgCircle: darkMode ? '#452e1a' : '#fffbeb'
                };
            case 'info':
                return {
                    icon: <Info size={56} className="text-blue-500" strokeWidth={3} />,
                    circleStroke: '#3B82F6',
                    bgCircle: darkMode ? '#1a2e45' : '#eff6ff'
                };
            default:
                return {
                    icon: <Check size={56} className="text-[#4ADE80]" strokeWidth={4} />,
                    circleStroke: '#4ADE80',
                    bgCircle: darkMode ? '#1a452d' : '#f0fdf4'
                };
        }
    };

    const config = getIconConfig();
    const displayTitle = title || (type === 'confirm' ? 'ยืนยัน' : type === 'error' ? 'ไม่สำเร็จ' : 'สำเร็จ');

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`w-full max-w-sm rounded-[2.5rem] p-8 text-center shadow-2xl transform transition-all animate-in zoom-in duration-300 ${darkMode ? 'bg-[#1a1a1a] text-white border border-white/10' : 'bg-white text-slate-800'}`}>

                <div className="relative w-32 h-32 flex items-center justify-center mx-auto mb-6">
                    {/* Circle Background */}
                    <div className="absolute inset-0 rounded-full flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke={darkMode ? 'rgba(255,255,255,0.05)' : config.bgCircle}
                                strokeWidth="2"
                            />
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke={config.circleStroke}
                                strokeWidth="2"
                                strokeDasharray="280"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>

                    {/* Icon */}
                    <div className="z-10 bg-transparent">
                        {config.icon}
                    </div>
                </div>

                <h2 className={`text-3xl font-black mb-3 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                    {displayTitle}
                </h2>

                <p className={`text-lg font-medium mb-8 px-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {message}
                </p>

                <div className={`flex gap-3 ${showCancel ? 'flex-row' : 'flex-col'}`}>
                    {showCancel && (
                        <button
                            onClick={onClose}
                            className={`flex-1 py-4 font-bold text-xl rounded-[1.25rem] transition-all active:scale-95 border ${darkMode ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-white'}`}
                        >
                            ยกเลิก
                        </button>
                    )}
                    <button
                        onClick={onConfirm || onClose}
                        className={`flex-1 py-4 text-white rounded-[1.25rem] font-bold text-xl shadow-lg transition-all active:scale-95 ${type === 'error' || type === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-200' :
                            type === 'warning' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200' :
                                type === 'info' ? 'bg-blue-500 hover:bg-blue-600 shadow-blue-200' :
                                    type === 'confirm' ? 'bg-[#FF917B] hover:bg-[#FF7A5C] shadow-orange-200' :
                                        'bg-[#4ADE80] hover:bg-[#3ec471] shadow-green-200'
                            }`}
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SystemModal;
