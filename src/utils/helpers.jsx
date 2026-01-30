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
