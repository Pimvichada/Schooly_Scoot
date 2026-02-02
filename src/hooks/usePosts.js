import { useState, useEffect, useCallback } from 'react';
import { getPostsByCourse, createPost, deletePost } from '../services/postService';
import { createNotification } from '../services/notificationService';

export const usePosts = (uid, profile, selectedCourse) => {
    const [posts, setPosts] = useState([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostFiles, setNewPostFiles] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchPosts = useCallback(async () => {
        if (!selectedCourse?.firestoreId) {
            setPosts([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const postsData = await getPostsByCourse(selectedCourse.firestoreId);
            setPosts(postsData);
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    }, [selectedCourse?.firestoreId]);

    // Initial fetch and on course change
    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleCreatePost = async (e) => {
        if (e) e.preventDefault();
        if (!newPostContent.trim() && newPostFiles.length === 0) return;
        if (!selectedCourse?.firestoreId || !uid) return;

        try {
            const author = {
                uid: uid,
                name: `${profile.firstName} ${profile.lastName || ''}`,
                avatar: profile.photoURL,
                role: profile.roleLabel || (profile.role === 'teacher' ? 'คุณครู' : 'นักเรียน')
            };

            const newPost = await createPost(selectedCourse.firestoreId, newPostContent, author, newPostFiles);

            // Notify Course Members
            const recipients = new Set(selectedCourse.studentIds || []);
            if (selectedCourse.ownerId) recipients.add(selectedCourse.ownerId);
            recipients.delete(uid); // Don't notify self

            recipients.forEach(async (uid) => {
                await createNotification(
                    uid,
                    `โพสต์ใหม่ในวิชา ${selectedCourse.name}`,
                    'system',
                    `${profile.firstName} ได้โพสต์ประกาศใหม่`,
                    { courseId: selectedCourse.firestoreId, targetType: 'post', targetId: newPost.id }
                );
            });

            // Update local state
            setPosts(prev => [newPost, ...prev]);
            setNewPostContent('');
            setNewPostFiles([]);
            return newPost;
        } catch (error) {
            console.error("Failed to create post", error);
            throw error;
        }
    };

    const handleDeletePost = async (postId) => {
        try {
            await deletePost(postId);
            setPosts(prev => prev.filter(p => p.id !== postId));
        } catch (error) {
            console.error("Failed to delete post", error);
            throw error;
        }
    };

    const handleEditPost = (postId, newContent) => {
        // Optimistic update for UI if needed, or handle via service then refresh
        // The original code used optimistic update
        setPosts(prev => prev.map(p =>
            p.id === postId ? { icon: p.icon, ...p, content: newContent } : p
        ));
    };

    const handlePostFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setNewPostFiles(prev => [...prev, ...files]);
        }
        if (e.target) e.target.value = null;
    };

    const handleRemovePostFile = (index) => {
        setNewPostFiles(prev => prev.filter((_, i) => i !== index));
    };

    return {
        posts,
        setPosts,
        newPostContent,
        setNewPostContent,
        newPostFiles,
        setNewPostFiles,
        loading,
        fetchPosts,
        handleCreatePost,
        handleDeletePost,
        handleEditPost,
        handlePostFileSelect,
        handleRemovePostFile
    };
};
