import { ChevronRight } from 'lucide-react';

export default function CourseCard({ course, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg hover:border-[#BEE1FF] transition-all cursor-pointer group"
    >
      <div className={`h-24 rounded-2xl ${course.color} mb-4 flex items-center justify-center relative overflow-hidden`}>
        <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-all"></div>
        {course.icon}
      </div>
      <h3 className="font-bold text-lg text-slate-800 mb-1">{course.name}</h3>
      <p className="text-slate-500 text-sm mb-3">{course.code} • {course.teacher}</p>
      <div className="flex items-center justify-between mt-4">
        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">25 นักเรียน</span>
        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#FF917B] group-hover:text-white transition-colors">
          <ChevronRight size={16} />
        </div>
      </div>
    </div>
  );
}
