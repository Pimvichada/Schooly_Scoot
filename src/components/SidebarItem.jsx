import React from 'react';

export default function SidebarItem({ id, label, icon: Icon, activeTab, onSelect }) {
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
}
