import React from 'react';

export default function StatCard({ title, value, color, icon, onClick, interactive = true }) {
  return (
    <div
      onClick={interactive ? onClick : undefined}
      className={`${color} p-5 rounded-3xl shadow-sm relative overflow-hidden transition-all ${interactive ? 'hover:shadow-md cursor-pointer hover:scale-105 active:scale-95' : ''
        }`}
    >
      <div className="absolute right-[-10px] top-[-10px] opacity-20 transform rotate-12">
        {icon}
      </div>
      <h3 className="text-slate-700 font-medium text-sm mb-1">{title}</h3>
      <div className="text-3xl font-bold text-slate-800">{value}</div>
      {interactive && (
        <div className="mt-2 text-xs font-bold text-slate-800 opacity-60 flex items-center">
          แตะเพื่อดูรายละเอียด
        </div>
      )}
    </div>
  );
}
