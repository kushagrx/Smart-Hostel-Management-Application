import {
    addDoc,
    collection,
    doc,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc
} from 'firebase/firestore';
import { getDbSafe } from './firebase';

export interface ChatMessage {
    _id: string;
    text: string;
    createdAt: any;
    user: {
        _id: string;
        name: string;
    };
    sent: boolean;
    received: boolean;
}

export const sendMessage = async (conversationId: string, text: string, user: { _id: string, name: string }) => {
    const db = getDbSafe();
    if (!db) return;

    const conversationRef = doc(db, 'conversations', conversationId);
    const messagesRef = collection(conversationRef, 'messages');

    // Add message
    await addDoc(messagesRef, {
        text,
        createdAt: serverTimestamp(),
        user,
        sent: true,
        received: false,
    });

    // Update conversation metadata
    const updateData = {
        lastMessage: text,
        lastMessageTime: serverTimestamp(),
        studentId: conversationId, // Ensure ID is set
        [user._id === 'admin' ? 'studentUnread' : 'adminUnread']: 1 // Increment logic would be better but simple toggle for now
    };

    // Use setDoc with merge to create if not exists
    await setDoc(conversationRef, updateData, { merge: true });
};

export const subscribeToMessages = (conversationId: string, callback: (messages: ChatMessage[]) => void) => {
    const db = getDbSafe();
    if (!db) return () => { };

    const q = query(
        collection(db, 'conversations', conversationId, 'messages'),
        orderBy('createdAt', 'desc'),
        limit(50)
    );

    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                _id: doc.id,
                text: data.text,
                createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
                user: data.user,
                sent: data.sent,
                received: data.received,
            };
        });
        callback(messages);
    });
};
