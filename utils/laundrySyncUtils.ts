import { DeviceEventEmitter } from 'react-native';
import api from './api';

const REFRESH_EVENT = 'REFRESH_LAUNDRY';

export interface LaundryRequestDisplay {
    id: string;
    roomNo: string;
    studentName: string;
    clothesDetails: string;
    totalClothes: number;
    status: string;
    createdAt: any;
}

export interface LaundrySettings {
    pickupDay: string;
    pickupTime: string;
    pickupPeriod: 'AM' | 'PM';
    dropoffDay: string;
    dropoffTime: string;
    dropoffPeriod: 'AM' | 'PM';
    status: 'On Schedule' | 'Delayed' | 'No Service' | 'Holiday';
    message: string;
    lastUpdated?: any;
}

/**
 * Fetch laundry settings
 */
export const fetchLaundrySettings = async (): Promise<LaundrySettings> => {
    try {
        // TODO: Implement /services/laundry/settings endpoint
        // Returning defaults for now to unblock
        const defaultSettings: LaundrySettings = {
            pickupDay: 'Monday',
            pickupTime: '09:00',
            pickupPeriod: 'AM',
            dropoffDay: 'Wednesday',
            dropoffTime: '05:00',
            dropoffPeriod: 'PM',
            status: 'On Schedule',
            message: 'Regular service available',
        };

        // Uncomment when endpoint exists
        const response = await api.get('/services/laundry/settings');
        return response.data;
    } catch (error) {
        console.error("Error fetching laundry settings:", error);
        return {
            pickupDay: 'Monday',
            pickupTime: '09:00',
            pickupPeriod: 'AM',
            dropoffDay: 'Wednesday',
            dropoffTime: '05:00',
            dropoffPeriod: 'PM',
            status: 'On Schedule',
            message: 'Regular service available',
        };
    }
};

/**
 * Subscribe to laundry settings (Polled)
 */
export const subscribeToLaundry = (onUpdate: (data: LaundrySettings) => void) => {
    const fetch = () => fetchLaundrySettings().then(onUpdate);
    fetch();
    const sub = DeviceEventEmitter.addListener(REFRESH_EVENT, fetch);
    // Poll infrequently
    const interval = setInterval(fetch, 60000);
    return () => {
        clearInterval(interval);
        sub.remove();
    };
};

/**
 * Update laundry settings
 */
export const updateLaundrySettings = async (settings: LaundrySettings) => {
    try {
        await api.post('/services/laundry/settings', settings);
        DeviceEventEmitter.emit(REFRESH_EVENT);
    } catch (error) {
        console.error("Error updating laundry settings:", error);
        throw error;
    }
};

/**
 * Subscribe to all laundry requests (Admin View)
 */
export const subscribeToAllLaundryRequests = (onUpdate: (data: LaundryRequestDisplay[]) => void) => {
    const fetch = async () => {
        try {
            const response = await api.get('/services/laundry/all');
            onUpdate(response.data);
        } catch (error) {
            console.error("Error fetching all laundry requests:", error);
        }
    };

    fetch();
    const sub = DeviceEventEmitter.addListener(REFRESH_EVENT, fetch);
    const interval = setInterval(fetch, 10000); // 10s poll for admin
    return () => {
        clearInterval(interval);
        sub.remove();
    };
};
// Student Fetch
export const fetchMyLaundryRequests = async (): Promise<LaundryRequestDisplay[]> => {
    try {
        const response = await api.get('/services/laundry');
        return response.data;
    } catch (error) {
        console.error("Error fetching my laundry requests:", error);
        return [];
    }
};

export const subscribeToMyLaundryRequests = (onUpdate: (data: LaundryRequestDisplay[]) => void) => {
    const fetch = () => fetchMyLaundryRequests().then(onUpdate);
    fetch();
    const sub = DeviceEventEmitter.addListener(REFRESH_EVENT, fetch);
    const interval = setInterval(fetch, 15000);
    return () => {
        clearInterval(interval);
        sub.remove();
    };
};
