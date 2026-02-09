import api from './api';

export interface Room {
    id: string;
    number: string;
    capacity: number;
    status: 'vacant' | 'occupied' | 'full' | 'maintenance';
    occupantDetails?: { name: string; rollNo?: string }[];
    wifiSSID?: string;
    wifiPassword?: string;
}

export const getAllRooms = async (): Promise<Room[]> => {
    try {
        const response = await api.get('/rooms/all');
        return response.data;
    } catch (error) {
        console.error("Error fetching rooms:", error);
        return [];
    }
};

export const deleteRoom = async (roomId: string) => {
    try {
        await api.delete(`/rooms/${roomId}`);
    } catch (error) {
        console.error("Error deleting room:", error);
        throw error;
    }
};

// Deprecated: allocateRoom and deallocateRoom are now handled by studentController (createStudent)
// or dedicated endpoint if needed. For now keeping them as placeholders if needed,
// but logic should be strictly API based.

export const subscribeToRooms = (callback: (rooms: Room[]) => void) => {
    const fetch = async () => {
        const data = await getAllRooms();
        callback(data);
    };
    fetch(); // Initial fetch
    const interval = setInterval(fetch, 10000); // Poll every 10s
    return () => clearInterval(interval);
};
