import React, { useState, useEffect } from 'react';
import { User, Trophy, Award, CheckCircle } from 'lucide-react';

export default function SettingsView({ profile, onSave, badges = [] }) {
  const [formData, setFormData] = useState(profile);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const handleSave = () => {
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
       <h1 className="text-2xl font-bold text-slate-800 flex items-center"><User className="mr-3 text-slate-400"/> ตั้งค่าบัญชี</h1>
       
       <div className="bg-gradient-to-r from-[#BEE1FF] to-[#E0F2FE] rounded-3xl p-6 shadow-sm border border-blue-100 relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-10 -translate-y-10">
             <Trophy size={180} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center relative z-10">
             <Award className="mr-2 text-slate-700"/> เหรียญรางวัลของฉัน
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
             {badges.map(badge => (
                <div key={badge.id} className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl flex flex-col items-center text-center shadow-sm">
                   <div className={`w-12 h-12 rounded-full ${badge.color} flex items-center justify-center mb-2 shadow-md`}>
                      {badge.icon}
                   </div>
                   <span className="font-bold text-sm text-slate-700">{badge.name}</span>
                   <span className="text-xs text-slate-500">{badge.date}</span>
                </div>
             ))}
          </div>
       </div>

       <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 max-w-2xl">
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-bold text-slate-600 mb-1">ชื่อจริง</label>
                 <input 
                  type="text" 
                  value={formData.firstName} 
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-[#BEE1FF] outline-none"
                 />
               </div>
               <div>
                 <label className="block text-sm font-bold text-slate-600 mb-1">นามสกุล</label>
                 <input 
                  type="text" 
                  value={formData.lastName} 
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-[#BEE1FF] outline-none"
                 />
               </div>
             </div>
             <button 
              type="submit" 
              className={`px-6 py-3 rounded-xl font-bold shadow-sm transition-all ${
                  isSaved ? 'bg-green-500 text-white' : 'bg-[#96C68E] text-white hover:bg-[#85b57d]'
              }`}
             >
               {isSaved ? <><CheckCircle className="mr-2"/> บันทึกเรียบร้อย</> : 'บันทึกการเปลี่ยนแปลง'}
             </button>
          </form>
       </div>
    </div>
  );
}
