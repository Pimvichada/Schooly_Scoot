import { ChevronRight } from 'lucide-react';

export default function CourseCard({ course, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-indigo-100/50 hover:border-[#BEE1FF] hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden"
    >
      <div className={`h-28 rounded-2xl ${course.color} mb-4 flex items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent"></div>
        <div className="transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
          {course.icon}
        </div>
      </div>
      <h3 className="font-bold text-lg text-slate-800 mb-1 line-clamp-1 group-hover:text-[#FF917B] transition-colors">{course.name}</h3>
      <p className="text-slate-500 text-sm mb-4 font-medium flex items-center gap-2">
        <span className="bg-slate-100 px-2 py-0.5 rounded-md text-xs">{course.code}</span>
        <span className="truncate">{course.teacher}</span>
      </p>
      <div className="flex items-center justify-between mt-auto">
        <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full group-hover:bg-[#EBF5FF] group-hover:text-[#BEE1FF] transition-colors">
          {course.studentIds?.length || 0} นักเรียน
        </span>
        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#FF917B] group-hover:text-white group-hover:shadow-lg group-hover:shadow-orange-200 transition-all duration-300">
          <ChevronRight size={20} />
        </div>
      </div>
    </div>
  );
}
