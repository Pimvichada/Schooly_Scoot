import { db } from '../../firebase';
import { collection, getDocs, addDoc, query, where, updateDoc, doc, orderBy, serverTimestamp, getDoc } from 'firebase/firestore';

/**
 * Fetch chats for a user
 */
export const getChats = async (userId) => {
    try {
        const chatsCol = collection(db, 'chats');
        // In a real app, 'participants' array logic is better. 
        // For now, simpler query or just fetch all and filter client side if small app, 
        // but let's try 'participants' array-contains.
        const q = query(chatsCol, where('participantIds', 'array-contains', userId));
        const snapshot = await getDocs(q);

        const chatList = await Promise.all(snapshot.docs.map(async (chatDoc) => {
            const data = chatDoc.data();
            // Fetch simplified messages preview? Or just rely on 'lastMessage' field in chat doc
            return {
                ...data,
                id: chatDoc.id, // override legacy number id
                firestoreId: chatDoc.id
            };
        }));
        return chatList;
    } catch (error) {
        console.error("Error getting chats:", error);
        return [];
    }
};

export const getMessages = async (chatId) => {
    try {
        const msgsCol = collection(db, 'chats', chatId, 'messages');
        const q = query(msgsCol, orderBy('timestamp', 'asc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    } catch (error) {
        console.error("Error getting messages:", error);
        return [];
    }
}

export const sendMessage = async (chatId, text, senderId) => {
    try {
        const msgsCol = collection(db, 'chats', chatId, 'messages');
        await addDoc(msgsCol, {
            text,
            sender: senderId === 'me' ? 'me' : senderId, // Adjust logic as needed
            timestamp: serverTimestamp(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        // Update last message in chat
        await updateDoc(doc(db, 'chats', chatId), {
            lastMessage: text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
    } catch (error) {
        console.error("Error sending message:", error);
    }
}


export const seedChats = async (userId) => {
    const chatsCol = collection(db, 'chats');
    const q = query(chatsCol, where('participantIds', 'array-contains', userId));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) return;

    // Create a sample chat
    const newChat = await addDoc(chatsCol, {
        name: 'แชทกลุ่มห้องเรียน',
        role: 'Group',
        avatar: 'bg-[#FF917B]',
        lastMessage: 'ยินดีต้อนรับทุกคนครับ',
        time: 'Now',
        unread: 1,
        participantIds: [userId, 'teacher_bot'],
        createdAt: serverTimestamp()
    });

    // Add welcome message
    const msgsCol = collection(db, 'chats', newChat.id, 'messages');
    await addDoc(msgsCol, {
        sender: 'teacher_bot',
        name: 'Teacher Bot',
        text: 'สวัสดีครับนักเรียน ยินดีต้อนรับสู่แชทกลุ่ม',
        time: 'Now',
        timestamp: serverTimestamp()
    });
};
