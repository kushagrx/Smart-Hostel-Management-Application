import http from 'http';
import { Server } from 'socket.io';

let io: Server;

export const initSocket = (server: http.Server) => {
    io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    console.log('📡 Socket.IO initialized');

    io.on('connection', (socket) => {
        console.log(`🔌 New client connected: ${socket.id}`);

        // Join a specific chat room
        socket.on('joinChat', (conversationId) => {
            socket.join(conversationId.toString());
            console.log(`User ${socket.id} joined conversation: ${conversationId}`);
        });

        // Join global admin conversations list for updates
        socket.on('joinAdminChatList', () => {
            socket.join('admin:conversations');
            console.log(`Admin ${socket.id} joined global chat list updates`);
        });

        // Handle Typing indicators
        socket.on('typing', ({ conversationId, user }) => {
            socket.to(conversationId.toString()).emit('typing', { user });
        });

        socket.on('stopTyping', ({ conversationId }) => {
            socket.to(conversationId.toString()).emit('stopTyping');
        });

        socket.on('disconnect', () => {
            console.log(`🔌 Client disconnected: ${socket.id}`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};
