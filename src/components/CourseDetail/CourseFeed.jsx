import React from 'react';
import { Info, Star, Copy, FileText, X, ImageIcon, Paperclip, Send, MessageSquare, Upload, MoreVertical, User } from 'lucide-react';
import PostItem from '../PostItem';

const CourseFeed = ({
    darkMode,
    selectedCourse,
    profile,
    newPostContent,
    setNewPostContent,
    newPostFiles,
    handleRemovePostFile,
    fileInputRef,
    handlePostFileSelect,
    handleCreatePost,
    loading,
    posts,
    auth,
    handleDeletePost,
    handleEditPost,
    setCourseTab
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Left Sidebar - Class Info & Upcoming Work */}
            <div className="md:col-span-1 space-y-6">
                {/* About Course Card */}
                <div className={`${darkMode ? 'bg-slate-900 border-slate-800 shadow-xl shadow-black/20' : 'bg-white border-slate-100 shadow-sm shadow-indigo-100/20'} p-6 rounded-3xl border relative overflow-hidden transition-all duration-300`}>
                    {/* Decorative Gradient Blob */}
                    <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${darkMode ? 'from-indigo-600/30 to-slate-800/30' : 'from-[#FFE787] to-[#BEE1FF]'} opacity-20 rounded-full blur-2xl`}></div>

                    <h3 className="relative font-bold mb-6 flex items-center gap-2">
                        <div className={`${darkMode ? 'bg-slate-800' : 'bg-[#E3F2FD]'} p-2 rounded-xl`}>
                            <Info size={20} className={darkMode ? 'text-indigo-400' : 'text-[#5B9BD5]'} />
                        </div>
                        <span className={`bg-clip-text text-transparent bg-gradient-to-r ${darkMode ? 'from-white to-slate-400' : 'from-slate-800 to-slate-600'}`}>เกี่ยวกับวิชา</span>
                    </h3>

                    <div className="relative space-y-5">
                        <div className="relative">
                            {selectedCourse.description && (
                                <div className={`${darkMode ? 'bg-indigo-900/20 border-indigo-800/30' : 'bg-indigo-50/50 border-indigo-50'} p-4 rounded-2xl border`}>
                                    <p className={`text-xs font-bold uppercase mt-1 flex items-center gap-1 ${darkMode ? 'text-indigo-400' : 'text-[#BEE1FF]'}`}>
                                        คำอธิบาย
                                    </p>
                                    <p className={`text-sm leading-relaxed font-medium ${darkMode ? 'text-slate-300' : 'text-indigo-900'}`}>{selectedCourse.description}</p>
                                </div>
                            )}
                            <p className={`text-xs font-bold uppercase mt-4 mb-2 tracking-wider flex items-center gap-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                รหัสเข้าเรียน <Star size={12} className="text-[#FFE787] fill-[#FFE787]" />
                            </p>
                            <div
                                className={`relative overflow-hidden flex items-center justify-between p-4 rounded-2xl border-2 border-dashed transition-all ${darkMode ? 'border-indigo-800 bg-slate-800 hover:bg-slate-700' : 'border-[#FF917B] bg-[#FFF0EE] hover:bg-[#FFE5E2]'
                                    } cursor-pointer`}
                                onClick={() => {
                                    navigator.clipboard.writeText(selectedCourse.inviteCode);
                                }}
                            >
                                <div className={`absolute inset-0 opacity-10 ${darkMode ? 'bg-[radial-gradient(white_1px,transparent_1px)]' : 'bg-[radial-gradient(#FF917B_1px,transparent_1px)]'} [background-size:8px_8px]`}></div>
                                <code className={`relative font-black text-xl tracking-widest ${darkMode ? 'text-indigo-400' : 'text-[#FF917B]'}`}>{selectedCourse.inviteCode}</code>
                                <div className={`relative p-2 rounded-xl shadow-sm ${darkMode ? 'bg-slate-700' : 'bg-white'}`}>
                                    <Copy size={16} className={darkMode ? 'text-indigo-400' : 'text-[#FF917B]'} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upcoming Work Card Placeholder or Logic */}

            </div>

            {/* Main Feed Area */}
            <div className="md:col-span-3 space-y-6">
                {/* Post Input Area */}
                <div className={`p-6 rounded-[2rem] border shadow-sm relative transition-all duration-300 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                    <div className="flex gap-4 mb-2">
                        <div className={`w-14 h-14 rounded-full p-1 border-2 shadow-sm flex-shrink-0 ${darkMode ? 'bg-slate-800 border-indigo-900' : 'bg-white border-white'}`}>
                            {profile.photoURL ? (
                                <img src={profile.photoURL} className="w-full h-full rounded-full object-cover" alt="" />
                            ) : (
                                <div className="w-full h-full bg-[#BEE1FF] rounded-full flex items-center justify-center text-white font-bold text-xl">
                                    {profile.firstName?.[0]}
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <textarea
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                placeholder={`ประกาศบางอย่างให้กับชั้นเรียน ${selectedCourse.name}`}
                                className={`w-full h-24 p-4 rounded-2xl border-none focus:ring-0 resize-none text-lg transition-all ${darkMode ? 'bg-slate-800 text-slate-100 placeholder-slate-500' : 'bg-slate-50 text-slate-700 placeholder-slate-400'}`}
                            />
                        </div>
                    </div>

                    {/* File Previews */}
                    {newPostFiles.length > 0 && (
                        <div className="flex flex-wrap gap-3 mt-3 pl-[4.5rem]">
                            {newPostFiles.map((file, index) => (
                                <div key={index} className="relative group">
                                    {file.type.startsWith('image/') ? (
                                        <div className="relative rounded-xl overflow-hidden h-24 w-24 border border-slate-200 shadow-sm">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt="preview"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600">
                                            <FileText size={18} className="text-slate-400" />
                                            <span className="max-w-[150px] truncate">{file.name}</span>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => handleRemovePostFile(index)}
                                        className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md border border-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Toolbar */}
                    <div className="flex justify-between items-center mt-2 pl-[4.5rem]">
                        <div className="flex gap-2">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className={`p-2.5 rounded-xl transition-all ${darkMode ? 'text-slate-500 hover:text-indigo-400 hover:bg-indigo-900/30' : 'text-slate-400 hover:text-[#96C68E] hover:bg-[#F2F9F0]'}`}
                                title="Upload Image"
                            >
                                <ImageIcon size={22} strokeWidth={2} />
                            </button>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className={`p-2.5 rounded-xl transition-all ${darkMode ? 'text-slate-500 hover:text-indigo-400 hover:bg-indigo-900/30' : 'text-slate-400 hover:text-[#96C68E] hover:bg-[#F2F9F0]'}`}
                                title="Attach File"
                            >
                                <Paperclip size={22} strokeWidth={2} />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handlePostFileSelect}
                                className="hidden"
                                multiple
                                accept="image/*,application/pdf,.doc,.docx"
                            />
                        </div>
                        <button
                            onClick={handleCreatePost}
                            disabled={!newPostContent.trim() && newPostFiles.length === 0}
                            className={`px-8 py-2.5 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2 ${newPostContent.trim() || newPostFiles.length > 0
                                ? 'bg-[#96C68E] text-white hover:bg-[#85b57d] hover:shadow-md active:scale-95'
                                : (darkMode ? 'bg-slate-800 text-slate-700 cursor-not-allowed border border-slate-700' : 'bg-slate-100 text-slate-300 cursor-not-allowed')
                                }`}
                        >
                            <Send size={18} strokeWidth={2.5} />
                            โพสต์
                        </button>
                    </div>
                </div>

                {/* Post Feed */}
                <div className="mt-8">
                    {loading ? (
                        <div className={`flex flex-col items-center justify-center py-20 rounded-3xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                            <div className="relative">
                                <div className={`w-12 h-12 border-4 rounded-full ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}></div>
                                <div className="w-12 h-12 border-4 border-[#96C68E] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                            </div>
                            <p className={`mt-4 font-medium animate-pulse text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>กำลังดึงข้อมูลประกาศ...</p>
                        </div>
                    ) : posts.filter(p => !p.isHidden || p.author?.uid === auth.currentUser?.uid).length > 0 ? (
                        <div className="space-y-6">
                            {posts.filter(p => !p.isHidden || p.author?.uid === auth.currentUser?.uid).map((post) => (
                                <PostItem
                                    key={post.id}
                                    post={post}
                                    currentUser={{
                                        uid: auth.currentUser?.uid,
                                        displayName: `${profile.firstName} ${profile.lastName}`,
                                        photoURL: profile.photoURL
                                    }}
                                    onDelete={handleDeletePost}
                                    onEdit={handleEditPost}
                                    darkMode={darkMode}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 opacity-60">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                                <MessageSquare size={40} className={darkMode ? 'text-slate-600' : 'text-slate-200'} />
                            </div>
                            <h3 className={`font-bold text-lg mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-900'}`}>ยังไม่มีประกาศใหม่</h3>
                            <p className={`text-sm text-center max-w-[280px] leading-relaxed ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>เมื่อครูมีการแจ้งเตือนหรือประกาศข่าวสาร ข้อมูลจะปรากฏที่นี่เป็นที่แรก</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseFeed;
