import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageSquare, MoreVertical, Edit2, Eye, EyeOff, Trash2, FileText, Send, X } from 'lucide-react';
import { toggleLikePost, addComment, getComments, toggleHidePost, updatePost } from '../services/postService';
import { createNotification } from '../services/notificationService';

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
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-2xl">×</button>
                </div>

                <div className="p-6">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        maxLength={500}
                        className="w-full h-40 bg-slate-50 border-none rounded-2xl p-4 text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                        placeholder="เขียนเนื้อหาใหม่..."
                    />
                    <div className={`text-right text-xs font-bold mt-2 ${content.length >= 500 ? 'text-red-500' : 'text-slate-400'}`}>
                        {content.length}/500
                    </div>
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

const PostItem = ({ post, currentUser, onDelete, onEdit, darkMode }) => {
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [showOptions, setShowOptions] = useState(false);
    const menuRef = useRef(null);
    const isOwner = currentUser?.uid === post.author?.uid;
    const [showComments, setShowComments] = useState(false);
    const [likes, setLikes] = useState(post.likes || []);
    const [isLiked, setIsLiked] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isHidden, setIsHidden] = useState(post.isHidden || false);


    useEffect(() => {
        setLikes(post.likes || []);
        setIsLiked(post.likes?.includes(currentUser?.uid) || false);
    }, [post.likes, currentUser?.uid]);

    // ปิดเมนูเมื่อคลิกข้างนอก
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowOptions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    // Handle Like
    const handleLike = async () => {
        if (!currentUser) return alert("กรุณาเข้าสู่ระบบ");

        // Optimistic UI
        const previousLikes = [...likes];
        const previousIsLiked = isLiked;

        if (isLiked) {
            setLikes(prev => prev.filter(id => id !== currentUser.uid));
            setIsLiked(false);
        } else {
            setLikes(prev => [...prev, currentUser.uid]);
            setIsLiked(true);
        }

        try {
            await toggleLikePost(post.id, currentUser.uid, isLiked);

            // Notify if liking (and not self)
            if (!isLiked && post.author?.uid && post.author.uid !== currentUser.uid) {
                await createNotification(
                    post.author.uid,
                    `มีคนถูกใจโพสต์ของคุณ`,
                    'system',
                    `${currentUser.displayName || currentUser.email} ถูกใจโพสต์ของคุณ`,
                    { courseId: post.courseId, targetType: 'post', targetId: post.id }
                );
            }
        } catch (error) {
            // Revert on error
            setLikes(previousLikes);
            setIsLiked(previousIsLiked);
            console.error(error);
        }
    };

    // 1. ดึงคอมเมนต์เมื่อกดเปิดดู
    const handleToggleComments = async () => {
        if (!post?.id) {
            console.error("Post ID is missing", post);
            return;
        }
        if (!showComments) {
            try {
                const data = await getComments(post.id);
                setComments(data);
            } catch (error) {
                console.error("Failed to load comments", error);
            }
        }
        setShowComments(!showComments);
    };

    // 2. ฟังก์ชันส่งคอมเมนต์
    const handleSendComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        try {
            const author = {
                uid: currentUser.uid,
                name: currentUser.displayName,
                avatar: currentUser.photoURL
            };

            const newComment = await addComment(post.id, commentText, author);

            // Notify if commenting (and not self)
            if (post.author?.uid && post.author.uid !== currentUser.uid) {
                await createNotification(
                    post.author.uid,
                    `ความคิดเห็นใหม่ในโพสต์ของคุณ`,
                    'system',
                    `${currentUser.displayName || currentUser.email} แสดงความคิดเห็น: "${commentText.substring(0, 20)}${commentText.length > 20 ? '...' : ''}"`,
                    { courseId: post.courseId, targetType: 'post', targetId: post.id }
                );
            }

            setComments([...comments, newComment]); // อัปเดต UI ทันที
            setCommentText(""); // ล้างช่องกรอก
        } catch (error) {
            alert("ไม่สามารถเพิ่มคอมเมนต์ได้");
        }
    };

    const handleToggleHide = async () => {
        try {
            const newStatus = await toggleHidePost(post.id, isHidden);
            setIsHidden(newStatus);
            setShowOptions(false);
            // alert(newStatus ? 'ซ่อนโพสต์เรียบร้อยแล้ว' : 'ยกเลิกการซ่อนโพสต์เรียบร้อยแล้ว');
        } catch (error) {
            alert('ไม่สามารถเปลี่ยนสถานะการซ่อนได้');
        }
    };


    return (
        <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} p-6 rounded-[2rem] border shadow-sm hover:shadow-md transition-all duration-300 group ${isHidden ? 'opacity-60' : ''}`}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-2xl p-1 shadow-sm ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                        <div className="w-full h-full rounded-xl overflow-hidden">
                            {post.author?.avatar ? (
                                <img src={post.author.avatar} alt="Author" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FF917B] to-[#FF7B61] text-white font-bold text-lg">
                                    {post.author?.name?.[0] || 'U'}
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <h4 className={`font-bold text-lg ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{post.author?.name}</h4>
                        <p className={`text-xs font-medium flex items-center gap-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                            {post.createdAt || 'เมื่อสักครู่'} • <span className={`px-2 py-0.5 rounded-lg ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>{post.author?.role || 'ครูผู้สอน'}</span>
                        </p>
                    </div>
                </div>
                {isOwner && (
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setShowOptions(!showOptions)}
                            className={`p-2 rounded-xl transition-colors ${darkMode ? 'text-slate-500 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-300 hover:text-slate-600 hover:bg-slate-50'}`}
                        >
                            <MoreVertical size={20} />
                        </button>

                        {/* Dropdown Menu */}
                        {showOptions && (
                            <div className={`absolute right-0 mt-2 w-48 rounded-2xl shadow-xl border py-2 z-50 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                                <>

                                    <button
                                        onClick={() => { setIsEditModalOpen(true); setShowOptions(false); }}
                                        className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        <Edit2 size={16} /> แก้ไขโพสต์
                                    </button>
                                </>


                                {/* ปุ่มซ่อน/แสดง */}
                                <button
                                    onClick={handleToggleHide}
                                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    {isHidden ? (
                                        <>
                                            <Eye size={16} className="text-blue-500" />
                                            <span>แสดงโพสต์</span>
                                        </>
                                    ) : (
                                        <>
                                            <EyeOff size={16} />
                                            <span>ซ่อนโพสต์</span>
                                        </>
                                    )}
                                </button>

                                {/* ปุ่มลบ */}
                                <div className={`h-[1px] my-1 mx-2 ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`} />
                                <button
                                    onClick={() => {
                                        if (window.confirm('ยืนยันการลบโพสต์?')) {
                                            onDelete(post.id);
                                        }
                                        setShowOptions(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${darkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-500 hover:bg-red-50'}`}
                                >
                                    <Trash2 size={16} /> ลบโพสต์
                                </button>


                            </div>
                        )}
                    </div>
                )}
            </div>


            <div className="pl-[4.5rem]">
                <p className={`whitespace-pre-wrap leading-relaxed text-[0.95rem] ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{post.content}</p>

                {post.attachments && post.attachments.length > 0 && (
                    <div className="mt-4">
                        {post.attachments.map((attachment, index) => (
                            <div key={index} className="mb-2">
                                {attachment.type.startsWith('image/') ? (
                                    <img
                                        src={attachment.url}
                                        alt={`Attachment ${index}`}
                                        className="max-w-full h-auto rounded-lg"
                                    />
                                ) : (
                                    <a
                                        href={attachment.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline flex items-center gap-2"
                                    >
                                        <FileText size={16} /> {attachment.name}
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Post Actions */}
                <div className={`flex gap-4 mt-6 pt-4 border-t ${darkMode ? 'border-slate-800' : 'border-slate-50'}`}>
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm ${isLiked
                            ? (darkMode ? 'bg-red-900/20 text-red-400' : 'bg-[#FFF0EE] text-[#FF917B]')
                            : (darkMode ? 'text-slate-500 hover:bg-red-900/10 hover:text-red-400' : 'text-slate-400 hover:bg-[#FFF0EE] hover:text-[#FF917B]')
                            }`}
                    >
                        <Heart size={18} className={isLiked ? 'fill-current' : ''} /> {likes.length} ถูกใจ
                    </button>
                    <button
                        onClick={handleToggleComments}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm ${darkMode ? 'text-slate-500 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        <MessageSquare size={18} /> {comments.length || post.commentCount || 0} ความคิดเห็น
                    </button>
                </div>

                {/* Comment Section */}
                {showComments && (
                    <div className="mt-6 animate-in slide-in-from-top-2 duration-300">
                        <div className="space-y-4 mb-6">
                            {comments.map((comment) => (
                                <div key={comment.id} className="flex gap-3">
                                    <div className={`w-8 h-8 rounded-xl flex-shrink-0 overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                        {comment.author?.avatar ? (
                                            <img src={comment.author.avatar} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className={`w-full h-full flex items-center justify-center text-xs font-bold ${darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'}`}>
                                                {comment.author?.name?.[0] || 'U'}
                                            </div>
                                        )}
                                    </div>
                                    <div className={`p-3 rounded-2xl rounded-tl-none flex-1 ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className={`font-bold text-sm ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{comment.author?.name}</span>
                                            <span className={`text-[10px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{comment.createdAt || 'เมื่อสักครู่'}</span>
                                        </div>
                                        <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{comment.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={`flex gap-3 border-t pt-4 ${darkMode ? 'border-slate-800' : 'border-slate-50'}`}>
                            <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center font-bold overflow-hidden ${darkMode ? 'bg-indigo-900/30 text-indigo-400' : 'bg-blue-50 text-blue-500'}`}>
                                {currentUser?.photoURL ? <img src={currentUser.photoURL} alt="" /> : currentUser?.displayName?.[0]}
                            </div>
                            <form onSubmit={handleSendComment} className="flex-1 flex gap-2">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="เขียนความคิดเห็น..."
                                        className={`w-full rounded-2xl px-4 py-2 text-sm outline-none focus:ring-2 transition-all ${darkMode ? 'bg-slate-800 border-none text-slate-200 focus:ring-indigo-900' : 'bg-slate-50 border-none text-slate-700 focus:ring-blue-100'}`}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!commentText.trim()}
                                    className="bg-[#96C68E] text-white p-3 rounded-2xl hover:bg-[#85b57d] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* ย้าย Modal มาไว้นอก Dropdown เพื่อไม่ให้หายไปเมื่อเมนูปิด */}
                {isEditModalOpen && (
                    <EditPostModal
                        post={post}
                        onClose={() => setIsEditModalOpen(false)}
                        onSave={(postId, newContent) => onEdit && onEdit(postId, newContent)}
                    />
                )}
            </div>
        </div>
    );


};

export default PostItem;
