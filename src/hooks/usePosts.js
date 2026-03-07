import { useState, useEffect, useCallback } from 'react';
import { getPostsByCourse, createPost, deletePost, subscribeToPosts } from '../services/postService';
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
        if (!selectedCourse?.firestoreId) {
            setPosts([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = subscribeToPosts(selectedCourse.firestoreId, (postsData) => {
            setPosts(postsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [selectedCourse?.firestoreId]);

    const handleCreatePost = async (e) => {
        if (e) e.preventDefault();
        if (!newPostContent.trim() && newPostFiles.length === 0) return;
        if (newPostContent.length > 500) {
            alert("ข้อความประกาศต้องไม่เกิน 500 ตัวอักษร");
            return;
        }
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
        } catch (error) {
            console.error("Failed to delete post", error);
            throw error;
        }
    };

    const handleEditPost = (postId, newContent) => {
        // Subscription will update the UI automatically
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
