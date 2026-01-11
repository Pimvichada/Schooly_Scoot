import React from 'react';
import { FileText, CheckSquare, User } from 'lucide-react';

export default function NotificationItem({ notif, onClick, compact = false }) {
  const Icon = notif.type === 'homework' ? FileText : notif.type === 'grade' ? CheckSquare : User;
  const bg = notif.type === 'homework' ? 'bg-[#FFE787]' : notif.type === 'grade' ? 'bg-[#96C68E]' : 'bg-[#BEE1FF]';

  if (compact) {
    return (
      <div onClick={onClick} className="flex gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${bg}`}>
          <Icon size={18} className="text-slate-700"/>
        </div>
        <div>
          <p className="text-sm text-slate-800 font-medium leading-tight group-hover:text-[#96C68E] transition-colors">{notif.message}</p>
          <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
        </div>
      </div>
    );
  }

  return (
    <div onClick={onClick} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all cursor-pointer group">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${bg}`}>
        <Icon size={24} className="text-slate-700"/>
      </div>
      <div>
        <p className="text-slate-800 font-bold text-base leading-tight mb-1 group-hover:text-[#96C68E] transition-colors">{notif.message}</p>
        <p className="text-sm text-slate-400">{notif.time}</p>
      </div>
    </div>
  );
}
