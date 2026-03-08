import React from 'react';
import { Check, X, AlertTriangle, Info, HelpCircle } from 'lucide-react';

const SystemModal = ({ isOpen, onClose, onConfirm, type = "success", title, message, darkMode, showCancel = false }) => {
    if (!isOpen) return null;

    // Determine icon and colors based on type
    const getIconConfig = () => {
        switch (type) {
            case 'confirm':
                return {
                    icon: <HelpCircle size={40} className="text-[#FF917B]" strokeWidth={2.5} />,
                    circleStroke: '#FF917B',
                    bgCircle: darkMode ? '#32211e' : '#fff5f2'
                };
            case 'error':
            case 'danger':
                return {
                    icon: <X size={40} className="text-red-500" strokeWidth={3} />,
                    circleStroke: '#EF4444',
                    bgCircle: darkMode ? '#451a1a' : '#fef2f2'
                };
            case 'warning':
                return {
                    icon: <AlertTriangle size={40} className="text-[#FF917B]" strokeWidth={2.5} />,
                    circleStroke: '#FF917B',
                    bgCircle: darkMode ? '#32211e' : '#fff5f2'
                };
            case 'info':
                return {
                    icon: <Info size={40} className="text-blue-500" strokeWidth={2.5} />,
                    circleStroke: '#3B82F6',
                    bgCircle: darkMode ? '#1a2e45' : '#eff6ff'
                };
            default:
                return {
                    icon: <Check size={40} className="text-[#96C68E]" strokeWidth={3} />,
                    circleStroke: '#96C68E',
                    bgCircle: darkMode ? '#1a2e26' : '#f0fdf4'
                };
        }
    };

    const config = getIconConfig();
    const displayTitle = title || (type === 'confirm' ? 'ยืนยัน' : type === 'error' || type === 'danger' ? 'ไม่สำเร็จ' : type === 'warning' ? 'แจ้งเตือน' : 'เสร็จสิ้น');

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`w-full max-w-[320px] rounded-3xl p-6 text-center shadow-2xl transform transition-all animate-in zoom-in duration-300 ${darkMode ? 'bg-slate-900 text-white border border-slate-800' : 'bg-white text-slate-800'}`}>

                <div className="relative w-20 h-20 flex items-center justify-center mx-auto mb-5">
                    {/* Circle Background */}
                    <div className="absolute inset-0 rounded-full flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle
                                cx="50"
                                cy="50"
                                r="48"
                                fill="none"
                                stroke={darkMode ? 'rgba(255,255,255,0.05)' : config.bgCircle}
                                strokeWidth="2"
                            />
                            <circle
                                cx="50"
                                cy="50"
                                r="48"
                                fill="none"
                                stroke={config.circleStroke}
                                strokeWidth="3"
                                strokeDasharray="301"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>

                    {/* Icon */}
                    <div className="z-10 bg-transparent">
                        {config.icon}
                    </div>
                </div>

                <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                    {displayTitle}
                </h2>

                <p className={`text-sm font-medium mb-6 px-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {message}
                </p>

                <div className="flex gap-2">
                    {showCancel && (
                        <button
                            onClick={onClose}
                            className={`flex-1 py-2.5 font-bold text-sm rounded-xl transition-all active:scale-95 border ${darkMode ? 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-600'}`}
                        >
                            ยกเลิก
                        </button>
                    )}
                    <button
                        onClick={onConfirm || onClose}
                        className={`flex-1 py-2.5 text-white rounded-xl font-bold text-sm transition-all active:scale-95 ${type === 'error' || type === 'danger' ? 'bg-red-500 hover:bg-red-600' :
                            type === 'warning' ? 'bg-[#FF917B] hover:bg-[#FF7A5C]' :
                                type === 'info' ? 'bg-blue-500 hover:bg-blue-600' :
                                    type === 'confirm' ? 'bg-[#FF917B] hover:bg-[#FF7A5C]' :
                                        'bg-[#96C68E] hover:bg-[#85b57d]'
                            }`}
                    >
                        ตกลง
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SystemModal;
