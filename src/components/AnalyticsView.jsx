import React, { useMemo, useState, useEffect } from 'react';
import { ArrowLeft, BarChart2, TrendingUp, Users, Clock, Calendar, CheckCircle, AlertCircle, PieChart, Award, FileText, Activity, XCircle, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';

const AnalyticsView = ({ setView, courses = [], assignments = [], userRole = 'student', userId = null, darkMode }) => {

    // Filter assignments to only those belonging to the visible courses
    // This ensures teachers only see assignments for their own courses if 'courses' is already filtered.
    // We also strictly filter by ownerId if provided, for extra safety.
    const relevantAssignments = useMemo(() => {
        return assignments.filter(a => {
            const course = courses.find(c => c.name === a.course);
            if (!course) return false;
            if (userRole === 'teacher' && userId && course.ownerId && course.ownerId !== userId) return false;
            return true;
        });
    }, [assignments, courses, userRole, userId]);

    const [animate, setAnimate] = useState(false);


    // Trigger animation on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimate(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);



    // Calculate Stats
    const stats = useMemo(() => {
        // --- TEACHER STATS ---
        if (userRole === 'teacher') {
            const totalAssignments = relevantAssignments.length;
            let totalSubmissions = 0;
            const submissionsByCourse = {};
            let activeAssignments = 0;



            relevantAssignments.forEach(a => {
                const subCount = a.submissionCount || 0;
                totalSubmissions += subCount;
                if (subCount > 0) activeAssignments++;

                // 1. Group by Course
                if (!submissionsByCourse[a.course]) {
                    submissionsByCourse[a.course] = 0;
                }
                submissionsByCourse[a.course] += subCount;
            });

            const courseStats = Object.keys(submissionsByCourse).map(course => ({
                name: course,
                submissions: submissionsByCourse[course]
            })).sort((a, b) => b.submissions - a.submissions);

            const topCourse = courseStats.length > 0 ? courseStats[0] : { name: 'ไม่มีข้อมูล', submissions: 0 };

            return {
                role: 'teacher',
                totalAssignments,
                totalSubmissions,
                activeAssignments,
                quietAssignments: totalAssignments - activeAssignments,
                topCourse,
                courseStats
            };
        }

        // --- STUDENT STATS (Existing Logic) ---
        if (!relevantAssignments.length) return {
            role: 'student',
            submissionRate: 0,
            pendingCount: 0,
            totalStudyHours: 0,
            coursePerformance: [],
            submissionTiming: { early: 0, onTime: 0, late: 0, total: 0 },
            hardSkill: { name: 'N/A', score: 0 }
        };

        // 1. Submission Rate
        const submitted = relevantAssignments.filter(a => a.status === 'submitted');
        const submissionRate = Math.round((submitted.length / relevantAssignments.length) * 100) || 0;

        // 2. Pending Count
        let pendingAssignments = relevantAssignments.filter(a => a.status !== 'submitted');
        const pendingCount = pendingAssignments.length;

        // 3. Total Study Hours 
        let weeklyMinutes = 0;
        courses.forEach(course => {
            if (course.schedule) {
                course.schedule.forEach(slot => {
                    const [startH, startM] = slot.startTime.split(':').map(Number);
                    const [endH, endM] = slot.endTime.split(':').map(Number);
                    const durationCurrent = (endH * 60 + endM) - (startH * 60 + startM);
                    weeklyMinutes += durationCurrent;
                });
            }
        });
        const totalStudyHours = Math.floor(weeklyMinutes / 60);

        // 4. Course Performance & Hard Skills
        const graded = [];
        relevantAssignments.forEach(a => {
            if (a.status === 'submitted' && a.score) {
                let s = 0, m = 0;
                if (typeof a.score === 'string' && a.score.includes('/')) {
                    const parts = a.score.split('/');
                    s = parseFloat(parts[0]);
                    m = parseFloat(parts[1]);
                } else {
                    s = parseFloat(a.score);
                    m = parseFloat(a.maxScore) || parseFloat(a.points) || 10;
                }
                if (!isNaN(s) && !isNaN(m) && m > 0) {
                    graded.push({ score: s, max: m, ...a });
                }
            }
        });

        const courseMap = {};
        const examKeywords = ['สอบ', 'exam', 'midterm', 'final', 'quiz', 'test'];

        graded.forEach(a => {
            const courseName = a.course;
            if (!courseMap[courseName]) {
                courseMap[courseName] = {
                    name: courseName,
                    collectedObtained: 0,
                    collectedMax: 0,
                    examObtained: 0,
                    examMax: 0
                };
            }

            const titleLower = (a.title || '').toLowerCase();
            const isExam = examKeywords.some(k => titleLower.includes(k));

            if (isExam) {
                courseMap[courseName].examObtained += a.score;
                courseMap[courseName].examMax += a.max;
            } else {
                courseMap[courseName].collectedObtained += a.score;
                courseMap[courseName].collectedMax += a.max;
            }
        });

        let hardSkillName = 'N/A';
        let hardSkillScore = 0;
        Object.values(courseMap).forEach(c => {
            const examPerc = c.examMax > 0 ? (c.examObtained / c.examMax) * 100 : 0;
            if (examPerc > hardSkillScore) {
                hardSkillScore = examPerc;
                hardSkillName = c.name;
            }
        });

        const coursePerformance = Object.values(courseMap).map(c => {
            const totalMax = c.collectedMax + c.examMax;
            const collectedPerc = totalMax > 0 ? (c.collectedObtained / totalMax) * 100 : 0;
            const examPerc = totalMax > 0 ? (c.examObtained / totalMax) * 100 : 0;

            return {
                name: c.name,
                collected: collectedPerc,
                exam: examPerc,
                total: collectedPerc + examPerc
            };
        }).sort((a, b) => b.total - a.total);

        let early = 0, onTime = 0, late = 0;
        submitted.forEach(a => {
            if (!a.dueDate) { onTime++; return; }
            if (!a.submittedAt) { onTime++; return; }
            const due = new Date(a.dueDate);
            const submitDate = new Date(a.submittedAt);
            const diffMs = due - submitDate;
            const diffHours = diffMs / (1000 * 60 * 60);

            if (diffHours < 0) late++;
            else if (diffHours > 24) early++;
            else onTime++;
        });

        return {
            role: 'student',
            submissionRate,
            pendingCount,
            totalStudyHours,
            coursePerformance,
            submissionTiming: { early, onTime, late, total: submitted.length },
            hardSkill: { name: hardSkillName, score: hardSkillScore }
        };
    }, [relevantAssignments, courses, userRole]);


    return (
        <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-[#F8FAFC]'} p-4 md:p-8 font-sans animate-in fade-in zoom-in-95 duration-500`}>
            {/* Top Nav */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => setView('dashboard')}
                    className={`p-3 rounded-2xl shadow-sm transition-all border hover:scale-110 active:scale-95 duration-300 ${darkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-100 hover:bg-gray-50'}`}
                >
                    <ArrowLeft className={`w-6 h-6 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`} />
                </button>
                <div>
                    <h1 className={`text-2xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                        <TrendingUp className="text-[#96C68E] animate-bounce" /> วิเคราะห์การเรียน
                    </h1>
                    <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {userRole === 'teacher' ? 'ภาพรวมติดตามผู้เรียน' : 'ภาพรวมสถิติจากข้อมูลจริงของคุณ'}
                    </p>
                </div>
            </div>

            {/* --- TEACHER VIEW --- */}
            {stats.role === 'teacher' && (
                <div className="space-y-8">

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} p-6 rounded-3xl shadow-sm border relative overflow-hidden group hover:shadow-md transition-all duration-700 delay-100 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <FileText size={80} className="text-[#5B9BD5]" />
                            </div>
                            <div className="w-12 h-12 bg-[#E3F2FD] rounded-2xl flex items-center justify-center mb-4 text-[#5B9BD5]">
                                <FileText size={24} />
                            </div>
                            <h3 className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} font-bold mb-1`}>งานทั้งหมด</h3>
                            <p className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>{stats.totalAssignments}</p>
                            <p className="text-xs text-[#5B9BD5] font-bold mt-2">มอบหมายแล้ว</p>
                        </div>

                        <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} p-6 rounded-3xl shadow-sm border relative overflow-hidden group hover:shadow-md transition-all duration-700 delay-200 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Users size={80} className="text-[#96C68E]" />
                            </div>
                            <div className="w-12 h-12 bg-[#F0FDF4] rounded-2xl flex items-center justify-center mb-4 text-[#96C68E]">
                                <Users size={24} />
                            </div>
                            <h3 className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} font-bold mb-1`}>ส่งงานเข้ามา</h3>
                            <p className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>{stats.totalSubmissions}</p>
                            <p className="text-xs text-[#96C68E] font-bold mt-2">ครั้ง (รวมทั้งหมด)</p>
                        </div>

                        <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} p-6 rounded-3xl shadow-sm border relative overflow-hidden group hover:shadow-md transition-all duration-700 delay-300 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Award size={80} className="text-[#FFE787]" />
                            </div>
                            <div className="w-12 h-12 bg-[#FFF8E1] rounded-2xl flex items-center justify-center mb-4 text-orange-400">
                                <Award size={24} />
                            </div>
                            <h3 className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} font-bold mb-1`}>ห้องที่ขยันที่สุด</h3>
                            <p className={`text-xl font-black truncate ${darkMode ? 'text-white' : 'text-slate-800'}`} title={stats.topCourse.name}>
                                {stats.topCourse.name}
                            </p>
                            <p className="text-xs text-orange-400 font-bold mt-2">{stats.topCourse.submissions} การส่งงาน</p>
                        </div>
                    </div>

                    {/* Charts Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Bar Chart - Submissions by Course */}
                        <div className={`lg:col-span-2 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} p-6 rounded-3xl shadow-sm border transition-all duration-1000 delay-300 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'} mb-6`}>จำนวนการส่งงานรายวิชา</h3>
                            <div className="h-64 flex items-end justify-start gap-4 px-4 pb-2 border-b border-slate-100 overflow-x-auto custom-scrollbar">
                                {stats.courseStats.map((item, i) => {
                                    const maxVal = stats.courseStats[0].submissions || 1;
                                    const heightPerc = (item.submissions / maxVal) * 100;
                                    return (
                                        <div key={i} className="flex flex-col items-center gap-2 h-full justify-end group w-16 flex-shrink-0">
                                            <div className="relative w-full bg-slate-50 rounded-2xl h-full flex flex-col justify-end overflow-hidden">
                                                <div
                                                    style={{ height: animate ? `${heightPerc}%` : '0%' }}
                                                    className="w-full bg-[#BEE1FF] group-hover:bg-[#5B9BD5] transition-all duration-1000 ease-out relative"
                                                >
                                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-[#5B9BD5]">
                                                        {item.submissions}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className={`text-xs font-bold truncate w-full text-center ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} title={item.name}>
                                                {item.name.slice(0, 6)}..
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Donut Chart - Active Assignments */}
                        <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} p-6 rounded-3xl shadow-sm border transition-all duration-1000 delay-500 ${animate ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
                            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'} mb-6`}>สถานะงาน</h3>
                            <div className="flex flex-col items-center justify-center relative mb-6">
                                <div
                                    className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-[2000ms] ${animate ? 'rotate-0 scale-100' : '-rotate-180 scale-50'}`}
                                    style={{
                                        background: `conic-gradient(#96C68E 0deg ${(stats.activeAssignments / stats.totalAssignments) * 360}deg, #F1F5F9 ${(stats.activeAssignments / stats.totalAssignments) * 360}deg 360deg)`
                                    }}
                                >
                                    <div className={`w-32 h-32 ${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-full flex flex-col items-center justify-center shadow-inner`}>
                                        <span className={`text-4xl font-black ${darkMode ? 'text-white' : 'text-slate-700'}`}>{stats.activeAssignments}</span>
                                        <span className="text-xs text-slate-400">งานที่มีคนส่ง</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className={`flex items-center justify-between p-3 rounded-2xl border ${darkMode ? 'bg-green-500/10 border-green-500/20' : 'bg-[#F0FDF4] border-[#96C68E]/30'}`}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-[#96C68E]"></div>
                                        <span className={`text-sm font-bold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>มีการส่งงานแล้ว</span>
                                    </div>
                                    <span className="font-bold text-[#96C68E]">{stats.activeAssignments}</span>
                                </div>
                                <div className={`flex items-center justify-between p-3 ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'} rounded-2xl border`}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                                        <span className={`text-sm font-bold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>ยังไม่มีคนส่ง</span>
                                    </div>
                                    <span className="font-bold text-slate-400">{stats.quietAssignments}</span>
                                </div>
                            </div>
                        </div>


                    </div>
                </div>
            )}

            {/* --- STUDENT VIEW --- */}
            {stats.role === 'student' && (
                <div className="space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div
                            className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} p-6 rounded-3xl shadow-sm border relative overflow-hidden group hover:shadow-md transition-all duration-700 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                            style={{ transitionDelay: '0ms' }}
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500 group-hover:scale-110 group-hover:rotate-12">
                                <BarChart2 size={80} className="text-[#96C68E]" />
                            </div>
                            <div className={`w-12 h-12 ${darkMode ? 'bg-green-500/20' : 'bg-[#F0FDF4]'} rounded-2xl flex items-center justify-center mb-4 text-[#96C68E] group-hover:scale-110 transition-transform duration-300`}>
                                <CheckCircle size={24} />
                            </div>
                            <h3 className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} font-bold mb-1`}>งานที่ส่งแล้ว</h3>
                            <p className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>{stats.submissionRate}%</p>
                            <p className="text-xs text-[#96C68E] font-bold mt-2 flex items-center">
                                <TrendingUp size={12} className="mr-1" /> ส่งงานสม่ำเสมอ
                            </p>
                        </div>

                        <div
                            className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} p-6 rounded-3xl shadow-sm border relative overflow-hidden group hover:shadow-md transition-all duration-700 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                            style={{ transitionDelay: '100ms' }}
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500 group-hover:scale-110 group-hover:-rotate-12">
                                <Users size={80} className="text-[#BEE1FF]" />
                            </div>
                            <div className={`w-12 h-12 ${darkMode ? 'bg-blue-500/20' : 'bg-[#E3F2FD]'} rounded-2xl flex items-center justify-center mb-4 text-[#5B9BD5] group-hover:scale-110 transition-transform duration-300`}>
                                <Clock size={24} />
                            </div>
                            <h3 className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} font-bold mb-1`}>เรียน/สัปดาห์</h3>
                            <p className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>{stats.totalStudyHours} ชม.</p>
                            <p className="text-xs text-slate-400 mt-2">
                                จากตารางเรียนทั้งหมด
                            </p>
                        </div>

                        {/* Hard Skills Mastery Card */}
                        <div
                            className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} p-6 rounded-3xl shadow-sm border relative overflow-hidden group hover:shadow-md transition-all duration-700 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                            style={{ transitionDelay: '200ms' }}
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500 group-hover:scale-110 group-hover:rotate-12">
                                <Award size={80} className="text-[#A78BFA]" />
                            </div>
                            <div className={`w-12 h-12 ${darkMode ? 'bg-purple-500/20' : 'bg-[#F3E8FF]'} rounded-2xl flex items-center justify-center mb-4 text-[#A78BFA] group-hover:scale-110 transition-transform duration-300`}>
                                <Award size={24} />
                            </div>
                            <h3 className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} font-bold mb-1`}>วิชาที่ถนัด</h3>
                            <p className={`text-xl font-black truncate ${darkMode ? 'text-white' : 'text-slate-800'}`} title={stats.hardSkill.name}>
                                {stats.hardSkill.name !== 'N/A' ? stats.hardSkill.name : 'รอผลสอบ'}
                            </p>
                            <p className="text-xs text-[#A78BFA] font-bold mt-2">
                                {stats.hardSkill.score > 0 ? `คะแนนสอบ ${Math.round(stats.hardSkill.score)}% ` : 'วิชาที่ถนัดที่สุดวัดจากคะแนนสอบ'}
                            </p>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Stacked Bar Chart */}
                        <div className={`lg:col-span-2 space-y-8 transition-all duration-1000 delay-300 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                            <div className={`p-6 rounded-3xl shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>วิเคราะห์คะแนน (เก็บ vs สอบ)</h3>
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-[#BEE1FF]"></div>
                                            <span className="text-xs font-bold text-slate-500">คะแนนเก็บ</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-[#FF917B]"></div>
                                            <span className="text-xs font-bold text-slate-500">คะแนนสอบ</span>
                                        </div>
                                    </div>
                                </div>

                                {stats.coursePerformance.length > 0 ? (
                                    <div className="h-64 flex items-end justify-start gap-4 px-4 pb-2 border-b border-slate-100 overflow-x-auto custom-scrollbar">
                                        {stats.coursePerformance.map((item, i) => (
                                            <div key={i} className="flex flex-col items-center gap-2 h-full justify-end group w-16 flex-shrink-0">
                                                <div className="relative w-full bg-slate-50 rounded-2xl h-full flex flex-col-reverse overflow-hidden">
                                                    {/* Collected Score (Bottom) */}
                                                    <div
                                                        style={{ height: animate ? `${item.collected}% ` : '0%' }}
                                                        className="w-full bg-[#BEE1FF] relative group/bar transition-all duration-1000 ease-out"
                                                    >
                                                        {item.collected > 15 && (
                                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/bar:opacity-100 transition-opacity">
                                                                <span className="bg-white/90 text-[#5B9BD5] text-[10px] font-bold px-1 rounded shadow-sm">
                                                                    {Math.round(item.collected)}%
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {/* Exam Score (Top) */}
                                                    <div
                                                        style={{ height: animate ? `${item.exam}% ` : '0%' }}
                                                        className="w-full bg-[#FF917B] relative group/bar transition-all duration-1000 ease-out delay-500"
                                                    >
                                                        {item.exam > 15 && (
                                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/bar:opacity-100 transition-opacity">
                                                                <span className="bg-white/90 text-[#FF917B] text-[10px] font-bold px-1 rounded shadow-sm">
                                                                    {Math.round(item.exam)}%
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className={`text-xs font-bold truncate w-full text-center ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} title={item.name}>
                                                    {item.name.slice(0, 6)}..
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-64 flex items-center justify-center text-slate-400">
                                        ยังไม่มีข้อมูลคะแนน
                                    </div>
                                )}
                                <p className="text-center text-xs text-slate-400 mt-4">แสดงผลรายวิชาทั้งหมด</p>
                            </div>
                        </div>

                        {/* Right Column - Submission Speed Analysis */}
                        <div className={`space-y-6 transition-all duration-1000 delay-500 ${animate ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
                            <div className={`p-6 rounded-3xl shadow-sm border h-full ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'} mb-6 flex items-center gap-2`}>
                                    <PieChart className="text-[#96C68E]" /> ความเร็วในการส่งงาน
                                </h3>

                                <div className="flex flex-col items-center justify-center relative mb-6">
                                    <div
                                        className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-[2000ms] ${animate ? 'rotate-0 scale-100' : '-rotate-180 scale-50'}`}
                                        style={{
                                            background: `conic-gradient(
                                                #96C68E 0deg ${(stats.submissionTiming.early / stats.submissionTiming.total) * 360}deg,
                                                #FFE787 ${(stats.submissionTiming.early / stats.submissionTiming.total) * 360}deg ${(stats.submissionTiming.early / stats.submissionTiming.total) * 360 + (stats.submissionTiming.onTime / stats.submissionTiming.total) * 360}deg,
                                                #FF917B ${(stats.submissionTiming.early / stats.submissionTiming.total) * 360 + (stats.submissionTiming.onTime / stats.submissionTiming.total) * 360}deg 360deg
                                            )`
                                        }}
                                    >
                                        <div className={`w-32 h-32 ${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-full flex flex-col items-center justify-center shadow-inner`}>
                                            <span className={`text-4xl font-black ${darkMode ? 'text-white' : 'text-slate-700'}`}>{stats.submissionTiming.total}</span>
                                            <span className="text-xs text-slate-400">งานที่ส่งแล้ว</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className={`flex items-center justify-between p-3 rounded-2xl border hover:scale-105 transition-transform duration-300 ${darkMode ? 'bg-green-500/20 border-green-500/30' : 'bg-[#F0FDF4] border-[#96C68E]/30'}`}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-[#96C68E]"></div>
                                            <span className={`text-sm font-bold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>ส่งก่อนเวลา (&gt;1วัน)</span>
                                        </div>
                                        <span className="font-bold text-[#96C68E]">{stats.submissionTiming.early}</span>
                                    </div>

                                    <div className={`flex items-center justify-between p-3 rounded-2xl border hover:scale-105 transition-transform duration-300 ${darkMode ? 'bg-orange-500/20 border-orange-500/30' : 'bg-[#FFF8E1] border-[#FFE787]/50'}`}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-[#FFE787]"></div>
                                            <span className={`text-sm font-bold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>ทันเวลา</span>
                                        </div>
                                        <span className="font-bold text-orange-400">{stats.submissionTiming.onTime}</span>
                                    </div>

                                    <div className={`flex items-center justify-between p-3 rounded-2xl border hover:scale-105 transition-transform duration-300 ${darkMode ? 'bg-red-900/20 border-red-500/30' : 'bg-red-50 border-red-100'}`}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-[#FF917B]"></div>
                                            <span className={`text-sm font-bold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>ส่งช้า</span>
                                        </div>
                                        <span className="font-bold text-[#FF917B]">{stats.submissionTiming.late}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalyticsView;
