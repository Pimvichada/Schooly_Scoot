import { ChevronRight } from 'lucide-react';

export default function CourseCard({ course, onClick, darkMode }) {
  return (
    <div
      onClick={onClick}
      className={`${darkMode ? 'bg-slate-800 border-slate-700 hover:shadow-slate-700/50 hover:border-[#96C68E]' : 'bg-white border-slate-100 hover:shadow-indigo-100/50 hover:border-[#BEE1FF]'} p-5 rounded-[2rem] shadow-sm border hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer group relative overflow-hidden ${course.isHidden ? 'opacity-70 grayscale-[0.5]' : ''}`}
    >
      <div className={`h-28 rounded-2xl ${darkMode ? 'bg-slate-700' : course.color} mb-4 flex items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500`}>
        <div className={`absolute inset-0 bg-gradient-to-tr ${darkMode ? 'from-black/20' : 'from-white/30'} to-transparent`}></div>
        <div className="transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
          {course.icon}
        </div>

        {/* Hide/Unhide Button - prevent bubbling */}
        {course.onToggleHide && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              course.onToggleHide(course);
            }}
            className="absolute top-2 right-2 w-8 h-8 bg-white/30 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:text-slate-600 transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
            title={course.isHidden ? "แสดงห้องเรียน" : "ซ่อนห้องเรียน"}
          >
            {course.isHidden ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10m0 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" /><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" /><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" /><path d="m2 2 20 20" /></svg>
            )}
          </button>
        )}
      </div>
      <h3 className={`font-bold text-lg ${darkMode ? 'text-slate-200' : 'text-slate-800'} mb-1 line-clamp-1 group-hover:text-[#FF917B] transition-colors`}>{course.name}</h3>
      <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} text-sm mb-4 font-medium flex items-center gap-2`}>
        <span className={`${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-800'} px-2 py-0.5 rounded-md text-xs`}>{course.code}</span>
        <span className="truncate">{course.teacher}</span>
      </p>
      <div className="flex items-center justify-between mt-auto">
        <span className={`text-xs font-bold ${darkMode ? 'text-slate-300 bg-slate-700' : 'text-slate-400 bg-slate-50'} px-3 py-1.5 rounded-full group-hover:bg-[#EBF5FF] group-hover:text-[#BEE1FF] transition-colors`}>
          {course.studentIds?.length || 0} นักเรียน
        </span>
        <div className={`w-10 h-10 rounded-full ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-50'} flex items-center justify-center group-hover:bg-[#FF917B] group-hover:text-white group-hover:shadow-lg group-hover:shadow-orange-200 transition-all duration-300`}>
          <ChevronRight size={20} />
        </div>
      </div>
    </div>
  );
}
