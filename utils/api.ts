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
    // 2. Read from .env (set EXPO_PUBLIC_API_URL in root .env)
    //    - Emulator: http://10.0.2.2:5000
    //    - Physical device: http://<your-lan-ip>:5000
    return process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:5000";
};

export const API_BASE_URL = getApiUrl();
export const API_URL = `${API_BASE_URL}/api`;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Bypass-Tunnel-Reminder': 'true',
    },
    timeout: 20000,
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
        const { useAlertStore } = require('../store/useAlertStore');
        
        if (error.code === 'ECONNABORTED') {
            // Timeout — just show popup, no noisy log
            useAlertStore.getState().showAlert('Connection Timeout', 'The server took too long to respond. Please check your connection.', [], 'warning');
        } else if (error.response) {
            // Server responded with error status
            if (error.response.status >= 500) {
                useAlertStore.getState().showAlert('Server Error', 'Our servers are having a moment. Please try again later.', [], 'error');
            }
            // 400/401/403/404 are handled silently by calling pages
        } else if (error.request) {
            // No response at all (network unreachable)
            useAlertStore.getState().showAlert('Network Error', 'Could not reach the server. Please check your internet connection.', [], 'error');
        }
        // Silently reject — no console.error (prevents noisy call stacks in Metro)
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
            
            // In React Native + Axios >= 1.0, do NOT delete the Content-Type.
            // Axios will automatically set the boundary.
            if (!config.headers.get('Content-Type')) {
                config.headers.set('Content-Type', 'multipart/form-data');
            }

            config.timeout = 120000; // Increase timeout for large uploads
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
