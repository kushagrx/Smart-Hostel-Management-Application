import { DeviceEventEmitter } from 'react-native';
import api from './api';

const REFRESH_EVENT = 'REFRESH_SERVICE_REQUESTS';

export type ServiceRequest = {
    id: string;
    studentName: string;
    studentEmail: string;
    roomNo: string;
    serviceType: string;
    description?: string;
    status: 'pending' | 'approved' | 'completed' | 'rejected';
    estimatedTime?: string;
    adminNote?: string;
    createdAt: Date;
    updatedAt: Date;
};

// Student: Request a service
export const requestService = async (
    serviceType: string,
    description: string = '',
    studentName: string,
    roomNo: string
) => {
    try {
        await api.post('/services/requests', { serviceType, description });
        DeviceEventEmitter.emit(REFRESH_EVENT);
        return true;
    } catch (error) {
        console.error("Error requesting service:", error);
        throw error;
    }
};

// Student: Subscribe to their own requests
export const subscribeToStudentRequests = (
    callback: (requests: ServiceRequest[]) => void
) => {
    const fetch = async () => {
        try {
            const response = await api.get('/services/requests');
            const data = response.data.map((r: any) => ({
                id: r.id.toString(),
                serviceType: r.serviceType,
                description: r.description,
                status: r.status,
                estimatedTime: r.estimatedTime,
                adminNote: r.adminNote,
                createdAt: new Date(r.createdAt),
                updatedAt: new Date(r.updatedAt),
                studentName: '', // Backend doesn't return name for student view (redundant)
                studentEmail: '',
                roomNo: ''
            }));
            callback(data);
        } catch (error) {
            console.error("Error fetching service requests:", error);
            callback([]);
        }
    };
    fetch();
    const sub = DeviceEventEmitter.addListener(REFRESH_EVENT, fetch);
    const interval = setInterval(fetch, 10000);
    return () => {
        clearInterval(interval);
        sub.remove();
    };
};

// Admin: Subscribe to ALL requests
export const subscribeToAllServiceRequests = (
    callback: (requests: ServiceRequest[]) => void
) => {
    const fetch = async () => {
        try {
            const response = await api.get('/services/requests/all');
            const data = response.data.map((r: any) => ({
                id: r.id.toString(),
                serviceType: r.serviceType,
                description: r.description,
                status: r.status,
                estimatedTime: r.estimatedTime,
                adminNote: r.adminNote,
                createdAt: new Date(r.createdAt),
                updatedAt: new Date(r.updatedAt),
                studentName: r.studentName,
                roomNo: r.roomNo
            }));
            callback(data);
        } catch (error) {
            console.error("Error fetching all service requests:", error);
            callback([]);
        }
    };
    fetch();
    const sub = DeviceEventEmitter.addListener(REFRESH_EVENT, fetch);
    const interval = setInterval(fetch, 10000);
    return () => {
        clearInterval(interval);
        sub.remove();
    };
};

// Admin: Update Status (Approve/Deny)
export const updateServiceStatus = async (
    id: string,
    status: 'pending' | 'approved' | 'completed' | 'rejected',
    estimatedTime?: string,
    adminNote?: string
) => {
    try {
        await api.put(`/services/requests/${id}`, { status, estimatedTime, adminNote });
        DeviceEventEmitter.emit(REFRESH_EVENT);
    } catch (error) {
        console.error("Error updating service status:", error);
        throw error;
    }
};
