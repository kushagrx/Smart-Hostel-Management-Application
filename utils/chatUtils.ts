import api from './api';

export interface ChatMessage {
    _id: string;
    text: string;
    createdAt: any;
    user: {
        _id: string;
        name: string;
        avatar?: string;
    };
    sent: boolean;
    received: boolean;
    read?: boolean;
}

export const sendMessage = async (conversationId: string, text: string, user: { _id: string, name: string }) => {
    try {
        await api.post(`/chats/${conversationId}/messages`, { text });
    } catch (error) {
        console.error("Error sending message:", error);
    }
};

export const subscribeToMessages = (conversationId: string, callback: (messages: ChatMessage[], partnerStatus?: { online: boolean, lastSeen: string | null }, partnerDetails?: any) => void) => {
    const fetch = async () => {
        try {
            const response = await api.get(`/chats/${conversationId}/messages`);
            // Check if response is the new format { messages, partnerStatus, partnerDetails }
            let messagesData = [];
            let statusData = { online: false, lastSeen: null };
            let detailsData = null;

            if (response.data.messages) {
                messagesData = response.data.messages;
                statusData = response.data.partnerStatus;
                detailsData = response.data.partnerDetails;
            } else if (Array.isArray(response.data)) {
                // Fallback
                messagesData = response.data;
            }

            const messages = messagesData.map((msg: any) => ({
                ...msg,
                createdAt: new Date(msg.createdAt),
            }));

            callback(messages, statusData, detailsData);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };
    fetch();
    const interval = setInterval(fetch, 2000); // Polling every 2s for "real-time" feel
    return () => clearInterval(interval);
};
