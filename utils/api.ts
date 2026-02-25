import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';

const getApiUrl = () => {
    // 1. Try to auto-detect from debuggerHost (works best during development)
    const debuggerHost = Constants.expoConfig?.hostUri;
    if (debuggerHost) {
        const ip = debuggerHost.split(':')[0];
        return `http://${ip}:5000`;
    }
    // 2. Fallback to the last known working IP
    return "http://10.102.116.195:5000";
};

export const API_BASE_URL = getApiUrl();
export const API_URL = `${API_BASE_URL}/api`;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Bypass-Tunnel-Reminder': 'true',
    },
    timeout: 10000,
});


// ================= REQUEST LOG =================
api.interceptors.request.use(request => {
    console.log('Starting Request:', request.method?.toUpperCase(), request.url);
    return request;
});


// ================= RESPONSE LOG =================
api.interceptors.response.use(
    response => {
        console.log('Response:', response.status, response.config.url);
        return response;
    },
    error => {
        if (error.code === 'ECONNABORTED') {
            console.error('Request Timed Out:', error.config.url);
        } else if (error.response) {
            console.error('API Error Response:', error.response.status, error.response.data);
        } else if (error.request) {
            console.error('Network Error (No Response):', error.message);
            console.error('Target URL:', error.config.url);
        } else {
            console.error('API Setup Error:', error.message);
        }
        return Promise.reject(error);
    }
);


// ================= TOKEN + FORM DATA =================
api.interceptors.request.use(
    async (config) => {

        const token = await AsyncStorage.getItem('userToken');

        if (!config.headers) {
            config.headers = new axios.AxiosHeaders();
        }

        if (token) {
            config.headers.set('Authorization', `Bearer ${token}`);
        } else {
            // No token found, proceed without it
        }

        // Handle FormData uploads
        if (
            config.data &&
            (
                config.data instanceof FormData ||
                config.data.constructor?.name === 'FormData' ||
                (config.data._parts && Array.isArray(config.data._parts))
            )
        ) {

            console.log('📸 Uploading FormData with file');

            if (config.headers instanceof axios.AxiosHeaders) {
                config.headers.delete('Content-Type');
            } else {
                delete (config.headers as any)['Content-Type'];
            }

            config.timeout = 80000;
            config.transformRequest = (data) => data;
        }

        return config;
    },
    (error) => Promise.reject(error)
);


// ================= HANDLE 401 =================
api.interceptors.response.use(
    (response) => response,
    async (error) => {

        if (error.response?.status === 401 || error.response?.status === 403) {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('user');
        }

        return Promise.reject(error);
    }
);

console.log('API Client initialized with URL:', API_URL);

export default api;
