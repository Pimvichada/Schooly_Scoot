import React, { useState } from 'react';
import { updatePost } from '../services/postService';

const EditPostModal = ({ post, onClose, onSave }) => {
    const [content, setContent] = useState(post.content);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async () => {
        setIsSaving(true);
        try {
            await updatePost(post.id, content, post.attachments);
            onSave(post.id, content);
            onClose();
        } catch (error) {
            alert("แก้ไขไม่สำเร็จ");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">แก้ไขโพสต์</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">×</button>
                </div>

                <div className="p-6">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-40 bg-slate-50 border-none rounded-2xl p-4 text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                        placeholder="เขียนเนื้อหาใหม่..."
                    />
                </div>

                <div className="p-6 bg-slate-50 flex gap-3 justify-end">
                    <button onClick={onClose} className="px-6 py-2 text-slate-500 font-bold text-sm">ยกเลิก</button>
                    <button
                        disabled={isSaving}
                        onClick={handleSubmit}
                        className="bg-blue-500 text-white px-8 py-2 rounded-xl text-sm font-bold hover:bg-blue-600 transition-all disabled:opacity-50"
                    >
                        {isSaving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditPostModal;
