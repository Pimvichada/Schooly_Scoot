import React from 'react';
import { Settings, Save, Trash, Plus, Edit2, X, Check } from 'lucide-react';

const CourseSettings = ({
    darkMode,
    editingCourse,
    setEditingCourse,
    scheduleForm,
    setScheduleForm,
    editingScheduleIndex,
    setEditingScheduleIndex,
    handleUpdateCourse,
    handleDeleteCourse,
    userRole,
    selectedCourse,
    validateScheduleConflict
}) => {
    return (
        <div className={`space-y-6 animate-in slide-in-from-bottom-4 duration-500 ${darkMode ? 'text-slate-100' : ''}`}>
            <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'} rounded-[2.5rem] p-8 border`}>
                <h3 className={`text-2xl font-bold mb-8 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                    <Settings className={darkMode ? 'text-indigo-400' : 'text-blue-500'} /> ตั้งค่ารายวิชา
                </h3>

                <div className={`${darkMode ? 'bg-slate-800/20 border-slate-800' : 'bg-white border-slate-100'} p-6 rounded-3xl border space-y-6`}>
                    <h4 className={`font-bold text-lg ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>ข้อมูลทั่วไป</h4>
                    {editingCourse && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className={`text-sm font-bold ml-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>ชื่อวิชา</label>
                                    <input
                                        type="text"
                                        value={editingCourse.name}
                                        onChange={(e) => setEditingCourse({ ...editingCourse, name: e.target.value })}
                                        className={`w-full p-3.5 rounded-2xl border transition-all focus:outline-none focus:ring-2 ${darkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-indigo-500/20 focus:border-indigo-500' : 'bg-slate-50 border-slate-100 focus:ring-blue-500/20 focus:border-blue-400'}`}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={`text-sm font-bold ml-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>รหัสวิชา</label>
                                    <input
                                        type="text"
                                        value={editingCourse.code}
                                        onChange={(e) => setEditingCourse({ ...editingCourse, code: e.target.value })}
                                        className={`w-full p-3.5 rounded-2xl border transition-all focus:outline-none focus:ring-2 ${darkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-indigo-500/20 focus:border-indigo-500' : 'bg-slate-50 border-slate-100 focus:ring-blue-500/20 focus:border-blue-400'}`}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={`text-sm font-bold ml-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>วันเริ่มต้น</label>
                                    <input
                                        type="date"
                                        value={editingCourse.startDate || ''}
                                        onChange={(e) => setEditingCourse({ ...editingCourse, startDate: e.target.value })}
                                        className={`w-full p-3.5 rounded-2xl border transition-all focus:outline-none focus:ring-2 ${darkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-indigo-500/20 focus:border-indigo-500' : 'bg-slate-50 border-slate-100 focus:ring-blue-500/20 focus:border-blue-400'}`}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={`text-sm font-bold ml-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>วันสิ้นสุด</label>
                                    <input
                                        type="date"
                                        value={editingCourse.endDate || ''}
                                        onChange={(e) => setEditingCourse({ ...editingCourse, endDate: e.target.value })}
                                        className={`w-full p-3.5 rounded-2xl border transition-all focus:outline-none focus:ring-2 ${darkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-indigo-500/20 focus:border-indigo-500' : 'bg-slate-50 border-slate-100 focus:ring-blue-500/20 focus:border-blue-400'}`}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className={`text-sm font-bold ml-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>คำอธิบายรายวิชา</label>
                                <textarea
                                    value={editingCourse.description || ''}
                                    onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                                    className={`w-full p-3.5 rounded-2xl border transition-all focus:outline-none focus:ring-2 h-28 ${darkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-indigo-500/20 focus:border-indigo-500' : 'bg-slate-50 border-slate-100 focus:ring-blue-500/20 focus:border-blue-400'}`}
                                    placeholder="ใส่รายละเอียดวิชา..."
                                />
                            </div>

                            {/* Schedule Editor */}
                            <div className="space-y-3">
                                <label className={`text-sm font-bold ml-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>จัดการตารางเรียน</label>
                                <div className={`${darkMode ? 'bg-slate-800/40' : 'bg-slate-50'} p-5 rounded-2xl space-y-4`}>
                                    <div className="flex flex-wrap gap-3 items-center">
                                        <select
                                            value={scheduleForm.day}
                                            onChange={(e) => {
                                                const newVal = e.target.value;
                                                const dayMap = { '1': 'จันทร์', '2': 'อังคาร', '3': 'พุธ', '4': 'พฤหัส', '5': 'ศุกร์', '6': 'เสาร์', '0': 'อาทิตย์' };
                                                setScheduleForm({ ...scheduleForm, day: newVal });

                                                if (editingScheduleIndex !== null) {
                                                    const updatedItems = [...(editingCourse.scheduleItems || [])];
                                                    updatedItems[editingScheduleIndex] = {
                                                        ...updatedItems[editingScheduleIndex],
                                                        dayOfWeek: parseInt(newVal),
                                                        dayLabel: dayMap[newVal]
                                                    };
                                                    setEditingCourse({ ...editingCourse, scheduleItems: updatedItems });
                                                }
                                            }}
                                            className={`p-2.5 rounded-xl border text-sm transition-all outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500' : 'bg-white border-slate-200 focus:border-[#96C68E]'}`}
                                        >
                                            <option value="1">จันทร์</option>
                                            <option value="2">อังคาร</option>
                                            <option value="3">พุธ</option>
                                            <option value="4">พฤหัส</option>
                                            <option value="5">ศุกร์</option>
                                            <option value="6">เสาร์</option>
                                            <option value="0">อาทิตย์</option>
                                        </select>
                                        <input
                                            type="time"
                                            value={scheduleForm.start}
                                            onChange={(e) => {
                                                const newVal = e.target.value;
                                                setScheduleForm({ ...scheduleForm, start: newVal });
                                                if (editingScheduleIndex !== null) {
                                                    const updatedItems = [...(editingCourse.scheduleItems || [])];
                                                    updatedItems[editingScheduleIndex] = { ...updatedItems[editingScheduleIndex], startTime: newVal };
                                                    setEditingCourse({ ...editingCourse, scheduleItems: updatedItems });
                                                }
                                            }}
                                            className={`p-2.5 rounded-xl border text-sm transition-all outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500' : 'bg-white border-slate-200 focus:border-[#96C68E]'}`}
                                        />
                                        <span className={darkMode ? 'text-slate-600' : 'text-slate-400'}>-</span>
                                        <input
                                            type="time"
                                            value={scheduleForm.end}
                                            onChange={(e) => {
                                                const newVal = e.target.value;
                                                setScheduleForm({ ...scheduleForm, end: newVal });
                                                if (editingScheduleIndex !== null) {
                                                    const updatedItems = [...(editingCourse.scheduleItems || [])];
                                                    updatedItems[editingScheduleIndex] = { ...updatedItems[editingScheduleIndex], endTime: newVal };
                                                    setEditingCourse({ ...editingCourse, scheduleItems: updatedItems });
                                                }
                                            }}
                                            className={`p-2.5 rounded-xl border text-sm transition-all outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500' : 'bg-white border-slate-200 focus:border-[#96C68E]'}`}
                                        />
                                        <input
                                            type="text"
                                            placeholder="ห้อง"
                                            value={scheduleForm.room}
                                            onChange={(e) => {
                                                const newVal = e.target.value;
                                                setScheduleForm({ ...scheduleForm, room: newVal });
                                                if (editingScheduleIndex !== null) {
                                                    const updatedItems = [...(editingCourse.scheduleItems || [])];
                                                    updatedItems[editingScheduleIndex] = { ...updatedItems[editingScheduleIndex], room: newVal };
                                                    setEditingCourse({ ...editingCourse, scheduleItems: updatedItems });
                                                }
                                            }}
                                            className={`p-2.5 rounded-xl border text-sm transition-all outline-none w-24 ${darkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500' : 'bg-white border-slate-200 focus:border-[#96C68E]'}`}
                                        />

                                        {editingScheduleIndex === null ? (
                                            <button onClick={() => {
                                                const dayMap = { '1': 'จันทร์', '2': 'อังคาร', '3': 'พุธ', '4': 'พฤหัส', '5': 'ศุกร์', '6': 'เสาร์', '0': 'อาทิตย์' };
                                                if (scheduleForm.start && scheduleForm.end) {
                                                    const newItem = {
                                                        dayOfWeek: parseInt(scheduleForm.day),
                                                        startTime: scheduleForm.start,
                                                        endTime: scheduleForm.end,
                                                        room: scheduleForm.room || 'N/A',
                                                        dayLabel: dayMap[scheduleForm.day]
                                                    };

                                                    // PRE-ADD VALIDATION
                                                    const conflictCheck = validateScheduleConflict(newItem, editingCourse.firestoreId);
                                                    if (conflictCheck.conflict) {
                                                        alert(`ไม่สามารถเพิ่มช่วงเวลานี้ได้ เนื่องจากเวลาชนกับวิชา "${conflictCheck.courseName}" (${conflictCheck.detail})`);
                                                        return;
                                                    }

                                                    setEditingCourse({
                                                        ...editingCourse,
                                                        scheduleItems: [...(editingCourse.scheduleItems || []), newItem]
                                                    });
                                                    setScheduleForm({ day: '1', start: '', end: '', room: '' });
                                                }
                                            }} className="bg-blue-500 hover:bg-blue-600 text-white p-2.5 rounded-xl shadow-md transition-all active:scale-95">
                                                <Plus size={18} />
                                            </button>
                                        ) : (
                                            <button onClick={() => {
                                                setEditingScheduleIndex(null);
                                                setScheduleForm({ day: '1', start: '', end: '', room: '' });
                                            }} className="bg-slate-400 hover:bg-slate-500 text-white p-2.5 rounded-xl shadow-md transition-all active:scale-95">
                                                <X size={18} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-2 mt-2">
                                        {(editingCourse.scheduleItems || []).map((item, idx) => (
                                            <div key={idx} className={`flex justify-between items-center p-3 rounded-xl border text-sm transition-all ${editingScheduleIndex === idx
                                                ? (darkMode ? 'border-amber-500/50 bg-amber-900/10' : 'border-amber-500 bg-amber-50 shadow-inner')
                                                : (darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-100 text-slate-700')}`}>
                                                <span className="font-medium">{item.dayLabel || ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์'][item.dayOfWeek]} {item.startTime}-{item.endTime} ({item.room})</span>
                                                <div className="flex gap-2">
                                                    <button onClick={() => {
                                                        setScheduleForm({
                                                            day: item.dayOfWeek.toString(),
                                                            start: item.startTime,
                                                            end: item.endTime,
                                                            room: item.room || ''
                                                        });
                                                        setEditingScheduleIndex(idx);
                                                    }} className={`p-1.5 rounded-lg transition-colors ${editingScheduleIndex === idx ? 'text-amber-600 bg-amber-200' : 'text-amber-400 hover:text-amber-600 hover:bg-amber-400/10'}`}><Edit2 size={16} /></button>
                                                    <button onClick={() => {
                                                        const newItems = editingCourse.scheduleItems.filter((_, i) => i !== idx);
                                                        setEditingCourse({ ...editingCourse, scheduleItems: newItems });
                                                        if (editingScheduleIndex === idx) {
                                                            setEditingScheduleIndex(null);
                                                            setScheduleForm({ day: '1', start: '', end: '', room: '' });
                                                        }
                                                    }} className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-400/10 transition-colors"><X size={16} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleUpdateCourse}
                                    className="bg-[#96C68E] text-white px-8 py-3 rounded-2xl font-bold hover:bg-[#85b57d] shadow-lg shadow-[#96C68E]/20 flex items-center transition-all hover:-translate-y-0.5"
                                >
                                    <Save className="mr-2" size={20} /> บันทึกการเปลี่ยนแปลง
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* DANGER ZONE */}
                {userRole === 'teacher' && (
                    <div className={`p-6 rounded-3xl border mt-8 ${darkMode ? 'bg-red-900/10 border-red-900/30' : 'bg-red-50 border-red-100'}`}>
                        <h4 className="font-bold text-lg text-red-500 mb-2">โซนอันตราย</h4>
                        <p className={`text-sm mb-4 ${darkMode ? 'text-red-400/70' : 'text-red-400'}`}>การลบรายวิชาจะไม่สามารถกู้คืนได้ กรุณาตรวจสอบให้แน่ใจก่อนดำเนินการ</p>
                        <button
                            onClick={() => handleDeleteCourse(selectedCourse)}
                            className="bg-red-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-red-600 flex items-center shadow-lg hover:shadow-xl transition-all"
                        >
                            <Trash className="mr-2" size={20} /> ลบรายวิชานี้
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseSettings;
