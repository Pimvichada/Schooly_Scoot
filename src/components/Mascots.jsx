import React from 'react';

export const MascotCircle = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <circle cx="50" cy="50" r="45" fill="#96C68E" stroke="#7aa371" strokeWidth="3" />
    <circle cx="35" cy="45" r="8" fill="white" />
    <circle cx="35" cy="45" r="3" fill="black" />
    <circle cx="65" cy="45" r="8" fill="white" />
    <circle cx="65" cy="45" r="3" fill="black" />
    <path d="M 40 65 Q 50 75 60 65" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

export const MascotSquare = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <rect x="10" y="10" width="80" height="80" rx="10" fill="#BEE1FF" stroke="#90b8e6" strokeWidth="3" />
    <circle cx="35" cy="40" r="8" fill="white" />
    <circle cx="35" cy="40" r="3" fill="black" />
    <circle cx="65" cy="40" r="8" fill="white" />
    <circle cx="65" cy="40" r="3" fill="black" />
    <path d="M 35 65 Q 50 60 65 65" stroke="#5a7a9e" strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

export const MascotTriangle = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <path d="M 50 10 L 90 90 L 10 90 Z" fill="#FF917B" stroke="#d6725e" strokeWidth="3" strokeLinejoin="round" />
    <circle cx="40" cy="55" r="6" fill="white" />
    <circle cx="40" cy="55" r="2.5" fill="black" />
    <circle cx="60" cy="55" r="6" fill="white" />
    <circle cx="60" cy="55" r="2.5" fill="black" />
    <circle cx="50" cy="75" r="3" fill="#8f4637" />
  </svg>
);

export const MascotStar = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <polygon points="50,5 61,35 95,35 68,55 79,90 50,70 21,90 32,55 5,35 39,35" fill="#FFE787" stroke="#e0c868" strokeWidth="3" strokeLinejoin="round" />
    <circle cx="42" cy="50" r="5" fill="white" />
    <circle cx="42" cy="50" r="2" fill="black" />
    <circle cx="58" cy="50" r="5" fill="white" />
    <circle cx="58" cy="50" r="2" fill="black" />
    <path d="M 45 65 Q 50 70 55 65" stroke="#b39d49" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);

export const Cute1 = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <path d="M50,5 L55,15 L65,10 L68,20 L78,15 L78,25 L88,25 L85,35 L95,38 L90,48 L100,53 L90,58 L95,68 L85,71 L88,81 L78,81 L78,91 L68,86 L65,96 L55,91 L50,100 L45,91 L35,96 L32,86 L22,91 L22,81 L12,81 L15,71 L5,68 L10,58 L0,53 L10,48 L5,38 L15,35 L12,25 L22,25 L22,15 L32,20 L35,10 L45,15 Z" fill="#ffef92" />
    <circle cx="45" cy="50" r="2" fill="black" />
    <circle cx="55" cy="50" r="2" fill="black" />
    <path d="M48,58 Q50,61 52,58" stroke="black" fill="none" strokeWidth="1.5" />
  </svg>
);

export const LoadingOverlay = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#96C68E] mb-4"></div>
        <p className="text-lg font-bold text-slate-700">กำลังโหลดข้อมูล...</p>
      </div>
    </div>
  );
};
