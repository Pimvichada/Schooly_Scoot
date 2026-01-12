import React from 'react';
import { FileText, CheckSquare, User, Bell } from 'lucide-react';

const NOTIF_CONFIG = {
  homework: {
    Icon: FileText,
    bg: 'bg-[#FFE787]',
    hoverText: 'group-hover:text-[#3fbf28]'
  },
  grade: {
    Icon: CheckSquare,
    bg: 'bg-[#96C68E]',
    hoverText: 'group-hover:text-[#96C68E]'
  },
  default: {
    Icon: User,
    bg: 'bg-[#BEE1FF]',
    hoverText: 'group-hover:text-blue-500'
  }
};

export default function NotificationItem({ notif, onClick, displayTime, compact = false, isSelected = false }) {
  const config = NOTIF_CONFIG[notif.type] || NOTIF_CONFIG.default;
  const { Icon, bg, hoverText } = config;

  const containerClasses = compact
    ? "p-3 gap-3 hover:bg-slate-50"
    : "p-4 gap-4 bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md";
  
  const iconSize = compact ? 18 : 24;
  const iconWrapperSize = compact ? "w-10 h-10" : "w-12 h-12";
  const titleSize = compact ? "text-sm font-medium" : "text-base font-bold mb-1";

  const readContainerClass = notif.read ? 'bg-slate-50/80' : '';
  const titleTextClass = notif.read ? 'text-slate-500' : 'text-slate-800';
  const iconColorClass = notif.read ? 'text-slate-400' : 'text-slate-700';

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      className={`flex rounded-2xl transition-all cursor-pointer group ${containerClasses} ${readContainerClass} ${isSelected ? 'ring-2 ring-indigo-100 bg-white shadow-md' : ''}`}
    >
      <div className={`${iconWrapperSize} rounded-full flex items-center justify-center flex-shrink-0 ${bg}`}>
          <Icon size={iconSize} className={iconColorClass} />
      </div>

      <div className="flex flex-col justify-center flex-1">
          <p className={`${titleTextClass} leading-tight transition-colors ${titleSize} ${notif.read ? '' : hoverText}`}>
          {notif.message}
        </p>
        <p className={`${compact ? 'text-xs' : 'text-sm'} text-slate-400 mt-1`}>
          {/* ใช้ค่าที่คำนวณส่งมาให้จากหน้าหลัก */}
          {displayTime} 
        </p>
      </div>
      
      {/* (แถม) เพิ่มจุดสีแดงถ้ายังไม่ได้อ่าน */}
      {!notif.read && (
        <div className="w-2 h-2 bg-red-500 rounded-full self-center ml-2" />
      )}
    </div>
  );
}