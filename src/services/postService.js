
import { db } from '../../firebase';
import {
    collection,
    addDoc,
    serverTimestamp,
    query,
    where,
    orderBy,
    getDocs,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc,

    increment,
    arrayUnion,
    arrayRemove
} from 'firebase/firestore';

/**
 * 1. ฟังก์ชันบีบอัดรูปภาพ (เฉพาะไฟล์ภาพ)
 * ช่วยลดขนาดไฟล์ให้เหลือประมาณ 100-300KB เพื่อให้เก็บใน Firestore ได้
 */
const compressImage = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // ปรับขนาดรูปภาพไม่ให้กว้างเกิน 1024px
                const MAX_WIDTH = 1024;
                if (width > MAX_WIDTH) {
                    height = (MAX_WIDTH / width) * height;
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // บีบอัดคุณภาพเหลือ 60% เป็น JPEG
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
                resolve(compressedBase64);
            };
        };
    });
};

/**
 * 2. ฟังก์ชันแปลงไฟล์ทั่วไป (เช่น PDF) เป็น Base64
 */
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

// ==========================================
//            ระบบ POSTS (โพสต์)
// ==========================================

/**
 * 3. สร้างโพสต์ใหม่พร้อมไฟล์แนบ (บีบอัดอัตโนมัติ)
 */
export const createPost = async (courseId, content, author, attachments = []) => {
    try {
        const postsCol = collection(db, 'posts');
        let uploadedAttachments = [];

        if (attachments && attachments.length > 0) {
            const uploadPromises = attachments.map(async (file) => {
                let finalData;

                if (file.type.startsWith('image/')) {
                    finalData = await compressImage(file);
                } else {
                    finalData = await fileToBase64(file);
                }

                // ตรวจสอบลิมิต 1MB ของ Firestore
                if (finalData.length > 1048487) {
                    throw new Error(`ไฟล์ ${file.name} ใหญ่เกินไป(จำกัด 1MB)`);
                }

                return {
                    name: file.name,
                    type: file.type,
                    url: finalData,
                    isBase64: true
                };
            });

            uploadedAttachments = await Promise.all(uploadPromises);
        }

        const newPost = {
            courseId,
            content,
            author,
            attachments: uploadedAttachments,
            likes: [],
            commentCount: 0,
            createdAt: serverTimestamp()
        };

        const docRef = await addDoc(postsCol, newPost);
        return { id: docRef.id, ...newPost, createdAt: new Date().toISOString() };
    } catch (error) {
        console.error("Error creating post:", error);
        alert(error.message);
        throw error;
    }
};

/**
 * 4. ดึงโพสต์ตามรายวิชา
 */
export const getPostsByCourse = async (courseId) => {
    try {
        const postsCol = collection(db, 'posts');
        const q = query(
            postsCol,
            where('courseId', '==', courseId),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate
                    ? data.createdAt.toDate().toLocaleString('th-TH', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : "เมื่อสักครู่"
            };
        });
    } catch (error) {
        console.error("Error fetching posts:", error);
        throw error;
    }
};

/**
 * 4.5 ดึงโพสต์แบบ Real-time
 */
export const subscribeToPosts = (courseId, callback) => {
    const postsCol = collection(db, 'posts');
    const q = query(
        postsCol,
        where('courseId', '==', courseId),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const posts = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate
                    ? data.createdAt.toDate().toLocaleString('th-TH', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : "เมื่อสักครู่"
            };
        });
        callback(posts);
    }, (error) => {
        console.error("Error subscribing to posts:", error);
    });
};

// ==========================================
//          ระบบ COMMENTS (คอมเมนต์)
// ==========================================

/**
 * 5. เพิ่มคอมเมนต์ใหม่ในโพสต์
 */
export const addComment = async (postId, content, author) => {
    try {
        // เก็บไว้ใน Sub-collection ของแต่ละโพสต์
        const commentsCol = collection(db, 'posts', postId, 'comments');

        const newComment = {
            content,
            author,
            createdAt: serverTimestamp()
        };

        const docRef = await addDoc(commentsCol, newComment);

        // Update comment count on parent post
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
            commentCount: increment(1)
        });

        return {
            id: docRef.id,
            ...newComment,
            createdAt: new Date().toISOString()
        };
    } catch (error) {
        console.error("Error adding comment:", error);
        throw error;
    }
};

/**
 * 6. ดึงคอมเมนต์ทั้งหมดของโพสต์นั้นๆ
 */
export const getComments = async (postId) => {
    try {
        const commentsCol = collection(db, 'posts', postId, 'comments');
        const q = query(commentsCol, orderBy('createdAt', 'asc'));

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate
                    ? data.createdAt.toDate().toLocaleString('th-TH', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : "เมื่อสักครู่"
            };
        });
    } catch (error) {
        console.error("Error fetching comments:", error);
        throw error;
    }
};

/**
 * 7. ฟังก์ชันสำหรับ กดใจ/เลิกกดใจ (Toggle Like)
 * @param {string} postId - ID ของโพสต์
 * @param {string} userId - ID ของผู้ใช้งานปัจจุบัน
 * @param {boolean} isLiked - สถานะปัจจุบันว่ากดใจอยู่หรือไม่
 */
export const toggleLikePost = async (postId, userId, isLiked) => {
    try {
        const postRef = doc(db, 'posts', postId);

        if (isLiked) {
            // ถ้ากดใจอยู่แล้ว ให้เอาออก (Unlike)
            await updateDoc(postRef, {
                likes: arrayRemove(userId)
            });
        } else {
            // ถ้ายังไม่ได้กด ให้เพิ่มเข้าไป (Like)
            await updateDoc(postRef, {
                likes: arrayUnion(userId)
            });
        }
    } catch (error) {
        console.error("Error toggling like:", error);
        throw error;
    }
};

/**
 * ลบโพสต์ออกจาก Firestore
 */
export const deletePost = async (postId) => {
    try {
        const postRef = doc(db, 'posts', postId);
        await deleteDoc(postRef);
        return true;
    } catch (error) {
        console.error("Error deleting post:", error);
        throw error;
    }
};


export const updatePost = async (postId, newContent, newAttachments = []) => {
    try {
        const postRef = doc(db, 'posts', postId);

        // อัปเดตเฉพาะเนื้อหา และ ไฟล์แนบ
        await updateDoc(postRef, {
            content: newContent,
            attachments: newAttachments, // ส่งไฟล์ที่บีบอัดแล้วมาที่นี่
            updatedAt: serverTimestamp() // (ทางเลือก) เก็บเวลาที่แก้ไขล่าสุดแยกไว้ได้ แต่ createdAt จะไม่เปลี่ยน
        });

        return true;
    } catch (error) {
        console.error("Error updating post:", error);
        throw error;
    }
};

export const toggleHidePost = async (postId, currentHiddenStatus) => {
    try {
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
            isHidden: !currentHiddenStatus // สลับค่า true เป็น false หรือ false เป็น true
        });
        return !currentHiddenStatus;
    } catch (error) {
        console.error("Error toggling hide post:", error);
        throw error;
    }
};