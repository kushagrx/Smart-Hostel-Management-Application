import api from './api';

export interface ChatMessage {
    id: string;
    text: string;
    role: 'user' | 'assistant';
    timestamp: Date;
    isError?: boolean;
}

export const sendChatMessage = async (
    message: string,
    history: { role: string; content: string }[]
): Promise<string> => {
    try {
        const response = await api.post('/ai/chat', {
            message,
            chatHistory: history,
        }, {
            timeout: 60000, // AI responses can take 30+ seconds
        });
        return response.data.reply;
    } catch (error) {
        console.error('Error sending message to AI:', error);
        throw error;
    }
};
