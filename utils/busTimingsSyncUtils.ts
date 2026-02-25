import { DeviceEventEmitter } from 'react-native';
import api from './api';

const REFRESH_EVENT = 'REFRESH_BUS_TIMINGS';

export interface BusRoute {
    id: string;
    route: string;
    times: string[];
    createdAt?: any;
    message?: string;
    schedule_type?: string;
    valid_date?: string;
}

export const subscribeToBusTimings = (onUpdate: (timings: BusRoute[]) => void) => {
    const fetch = async () => {
        try {
            const response = await api.get('/services/bus');
            const rawData = response.data;
            const grouped: { [key: string]: BusRoute } = {};

            rawData.forEach((item: any) => {
                const dateKey = item.valid_date ? new Date(item.valid_date).toLocaleDateString('en-CA') : 'everday';
                const groupKey = `${item.route}|${item.schedule_type}|${dateKey}`;

                if (!grouped[groupKey]) {
                    grouped[groupKey] = {
                        id: item.id.toString(),
                        route: item.route,
                        times: [],
                        message: item.message || '',
                        schedule_type: item.schedule_type,
                        valid_date: item.valid_date
                    };
                }
                grouped[groupKey].times.push(item.time.substring(0, 5));
            });

            onUpdate(Object.values(grouped));
        } catch (error) {
            console.error("Error fetching bus timings:", error);
        }
    };
    fetch();
    const sub = DeviceEventEmitter.addListener(REFRESH_EVENT, fetch);
    const interval = setInterval(fetch, 60000);
    return () => {
        clearInterval(interval);
        sub.remove();
    };
};

const convertTo24Hour = (timeStr: string) => {
    try {
        const [timePart, period] = timeStr.trim().split(' ');
        let [hoursStr, minutesStr] = timePart.split(':');
        if (!minutesStr) minutesStr = '00';
        let hours = parseInt(hoursStr, 10);
        if (period === 'PM' && hours !== 12) hours += 12;
        else if (period === 'AM' && hours === 12) hours = 0;
        return `${hours.toString().padStart(2, '0')}:${minutesStr}:00`;
    } catch (e) {
        return timeStr;
    }
};

export const addBusRoute = async (route: string, times: string[], message?: string, scheduleType: string = 'everyday') => {
    try {
        const promises = times.map(time => {
            const formattedTime = convertTo24Hour(time);
            return api.post('/bus', {
                route_name: route,
                departure_time: formattedTime,
                destination: route,
                message: message,
                schedule_type: scheduleType
            });
        });
        await Promise.all(promises);
        DeviceEventEmitter.emit(REFRESH_EVENT);
    } catch (error) {
        console.error("Error adding bus route:", error);
        throw error;
    }
};

export const updateBusRoute = async (id: string, route: string, time: string, message?: string, scheduleType?: string) => {
    try {
        const formattedTime = convertTo24Hour(time);
        await api.put(`/bus/${id}`, {
            route_name: route,
            departure_time: formattedTime,
            destination: route,
            message: message,
            schedule_type: scheduleType
        });
        DeviceEventEmitter.emit(REFRESH_EVENT);
    } catch (error) {
        console.error("Error updating bus route:", error);
        throw error;
    }
};

export const deleteBusRoute = async (id: string) => {
    try {
        await api.delete(`/bus/${id}`);
        DeviceEventEmitter.emit(REFRESH_EVENT);
    } catch (error) {
        console.error("Error deleting bus route:", error);
        throw error;
    }
};
