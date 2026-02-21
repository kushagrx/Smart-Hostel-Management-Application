import api from './api';

export interface AdminNotification {
    id: string;
    type: 'message' | 'complaint' | 'service' | 'laundry' | 'leave' | 'visitor' | 'payment';
    title: string;
    subtitle: string;
    time: string;
    data: any;
    read: boolean;
}

export interface StudentNotification {
    id: string;
    type: 'bus' | 'emergency' | 'message' | 'leave' | 'complaint' | 'service' | 'notice' | 'mess' | 'payment' | 'laundry' | 'visitor';
    title: string;
    subtitle: string;
    time: string;
    read: boolean;
}

// ─── Admin ───────────────────────────────────────────
export const getAdminNotifications = async (): Promise<AdminNotification[]> => {
    try {
        const response = await api.get('/notifications/admin');
        return response.data;
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return [];
    }
};

export const subscribeToNotifications = (callback: (data: AdminNotification[]) => void) => {
    const fetch = async () => {
        const data = await getAdminNotifications();
        callback(data);
    };
    fetch();
    const interval = setInterval(fetch, 10000); // Poll every 10s
    return () => clearInterval(interval);
};

export const clearNotifications = async () => {
    try {
        await api.post('/notifications/admin/clear');
        return true;
    } catch (error) {
        console.error("Error clearing notifications:", error);
        return false;
    }
};

// ─── Student ─────────────────────────────────────────
export const getStudentNotifications = async (): Promise<StudentNotification[]> => {
    try {
        const response = await api.get('/notifications/student');
        return response.data;
    } catch (error) {
        console.error("Error fetching student notifications:", error);
        return [];
    }
};

export const subscribeToStudentNotifications = (callback: (data: StudentNotification[]) => void) => {
    const fetch = async () => {
        const data = await getStudentNotifications();
        callback(data);
    };
    fetch();
    const interval = setInterval(fetch, 10000); // Poll every 10s
    return () => clearInterval(interval);
};

export const clearStudentNotifications = async () => {
    try {
        await api.post('/notifications/student/clear');
        return true;
    } catch (error) {
        console.error("Error clearing student notifications:", error);
        return false;
    }
};
