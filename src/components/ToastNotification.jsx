import React, { useEffect, useState } from 'react';
import { X, Bell } from 'lucide-react';

const ToastNotification = ({ message, type = 'system', onClose, duration = 20000 }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(true);

    useEffect(() => {
        // Animation in
        setTimeout(() => setIsVisible(true), 10);

        const timer = setTimeout(() => {
            setIsVisible(false);
            // Wait for animation out to finish before calling onClose
            setTimeout(() => {
                setShouldRender(false);
                onClose();
            }, 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    if (!message || !shouldRender) return null;

    return (
        <div
            className={`transition-all duration-300 transform mb-3
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
        >
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 w-80 flex gap-4 items-start pr-10 relative overflow-hidden pointer-events-auto">
                {/* Decorative background element */}
                <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-bl-[4rem] opacity-10 pointer-events-none`} />

                <div className={`
          w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-md
          ${type === 'homework' ? 'bg-[#FF917B]' :
                        type === 'meeting' ? 'bg-[#96C68E]' :
                            type === 'quiz' ? 'bg-purple-500' :
                                type === 'post' ? 'bg-pink-500' :
                                    'bg-blue-500'}
        `}>
                    <Bell size={20} className={isVisible ? 'animate-bounce' : ''} />
                </div>

                <div className="flex-1">
                    <h4 className="font-bold text-slate-800 text-sm mb-1">
                        {type === 'homework' ? 'การบ้านใหม่' :
                            type === 'meeting' ? 'เรียกเข้าเรียน' :
                                type === 'quiz' ? 'แบบทดสอบใหม่' :
                                    type === 'post' ? 'ประกาศใหม่' :
                                        type === 'summary' ? 'สรุปการแจ้งเตือน' :
                                            'แจ้งเตือนระบบ'}
                    </h4>
                    <p className="text-slate-600 text-xs leading-relaxed break-words">{message}</p>
                </div>

                <button
                    onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }}
                    className="absolute top-2 right-2 text-slate-300 hover:text-slate-500 transition-colors p-1"
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    );
};

export default ToastNotification;
