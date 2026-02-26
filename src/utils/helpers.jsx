import React from 'react';
import { MascotCircle, MascotSquare, MascotTriangle, MascotStar, Cute1 } from '../components/Mascots';

export const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
};

export const isOverlap = (item1, item2) => {
    if (parseInt(item1.dayOfWeek) !== parseInt(item2.dayOfWeek)) return false;
    const start1 = timeToMinutes(item1.startTime);
    const end1 = timeToMinutes(item1.endTime);
    const start2 = timeToMinutes(item2.startTime);
    const end2 = timeToMinutes(item2.endTime);

    // Overlap if (Start1 < End2) and (End1 > Start2)
    return (start1 < end2) && (end1 > start2);
};

export const WELCOME_MESSAGES = {
    student: [
        'วันนี้พร้อมเรียนรู้เรื่องใหม่ๆ หรือยัง? อย่าลืมทำการบ้านนะ!',
        'พร้อมเปิดโลกการเรียนรู้ใบใหม่หรือยัง? วันนี้มีเรื่องสนุกๆ รออยู่เพียบ!',
        'วันนี้วันดี! มาตั้งใจเรียนและเก็บเกี่ยวความรู้กลับไปให้เต็มกระเป๋ากันเถอะ',
        'การบ้านเยอะไม่ใช่ปัญหา เพราะเธอเป็นคนเก่ง! สู้ๆ นะ เดี๋ยวก็เสร็จ',
        'ยินดีต้อนรับสู่คาบเรียนหรรษา! เตรียมสมองให้โล่งแล้วมาลุยกันเลย',
        'ทุกความพยายามคือความสำเร็จ! วันนี้มาทำให้เต็มที่ สนุกไปกับการเรียนรู้นะ'
    ],
    teacher: [
        'เตรียมตัวให้พร้อมสำหรับการสอนวันนี้นะครับ นักเรียนกำลังรอความรู้จากคุณครูอยู่!',
        'วันนี้อากาศดี เหมาะกับการสอนมากครับ อย่าลืมแวะตรวจการบ้านด้วยนะครับ',
        'สวัสดีครับคุณครู! วันนี้ตารางแน่นหน่อย แต่รับรองว่าสนุกแน่นอนครับ',
        'ยินดีต้อนรับกลับครับ วันนี้มีเรื่องราวใหม่ๆ รอไปเล่าให้นักเรียนฟังเพียบเลย',
        'พร้อมลุยงานวันนี้หรือยังครับ? มีนักเรียนส่งงานมารอให้คุณครูตรวจเต็มเลย!'
    ]
};

export const formatThaiDate = (date) => {
    if (!date) return "เมื่อสักครู่";

    let d;
    if (typeof date === 'object' && date.toDate) {
        d = date.toDate();
    } else if (date instanceof Date) {
        d = date;
    } else {
        d = new Date(date);
    }

    if (isNaN(d.getTime())) return "เมื่อสักครู่";

    // Format to match the "31/1/69 16:20" style seen in screenshots
    return d.toLocaleString('th-TH', {
        year: '2-digit',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
};

export const getCourseIcon = (type) => {
    switch (type) {
        case 'square': return <MascotSquare className="w-12 h-12" />;
        case 'circle': return <MascotCircle className="w-12 h-12" />;
        case 'triangle': return <MascotTriangle className="w-12 h-12" />;
        case 'star': return <MascotStar className="w-12 h-12" />;
        case 'cute1': return <Cute1 className="w-12 h-12" />;
        default: return <MascotStar className="w-12 h-12" />;
    }
};

export const getNormalizedSchedule = (course) => {
    if (!course) return [];

    // 1. Gather all potential schedule sources
    const sources = [
        course.schedule,
        course.scheduleItems,
        course.items,
        course.days,
        course.class_schedule,
        course.courseSchedule,
        course.timetable
    ];

    let items = [];
    sources.forEach(raw => {
        if (!raw) return;

        // Handle Object-based structures (e.g., { "0": [...], "monday": [...] })
        if (typeof raw === 'object' && !Array.isArray(raw)) {
            Object.keys(raw).forEach(key => {
                const val = raw[key];
                if (Array.isArray(val)) {
                    val.forEach(v => { if (v && typeof v === 'object') items.push({ ...v, _dayKey: key }); });
                } else if (val && typeof val === 'object') {
                    items.push({ ...val, _dayKey: key });
                }
            });
        } else if (Array.isArray(raw)) {
            items = [...items, ...raw];
        }
    });

    const thaiDays = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์'];
    const engDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    // 2. Normalize and Filter
    return items.map(s => {
        if (!s || typeof s !== 'object') return null;

        // Find day field
        let d = s.dayOfWeek !== undefined ? s.dayOfWeek :
            s.day !== undefined ? s.day :
                s.dayNum !== undefined ? s.dayNum :
                    s.dayID !== undefined ? s.dayID :
                        s.day_of_week !== undefined ? s.day_of_week :
                            s.weekday !== undefined ? s.weekday :
                                s._dayKey;

        if (d === undefined || d === null) return null;

        // Parse to 0-6
        let val = parseInt(d);
        if (isNaN(val)) {
            const strD = d.toString().trim().toLowerCase();
            const tIdx = thaiDays.findIndex(td => strD.includes(td.toLowerCase()) || td.toLowerCase().includes(strD));
            if (tIdx !== -1) val = tIdx;
            else {
                const eIdx = engDays.findIndex(ed => strD.includes(ed) || ed.includes(strD));
                if (eIdx !== -1) val = eIdx;
            }
        }

        // Handle common 1-7 offsets (Assume 7 is sunday if 1 is monday, or catch other shifts)
        if (val === 7) val = 0;

        return {
            ...s,
            _normalizedDay: val,
            startTime: s.startTime || s.start || "00:00",
            endTime: s.endTime || s.end || "00:00",
            room: s.room || s.location || "N/A"
        };
    }).filter(s => s !== null && s._normalizedDay !== null && !isNaN(s._normalizedDay));
};

