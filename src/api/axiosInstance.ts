import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Must match the key AuthContext uses when saving the token after login
export const TOKEN_KEY = 'token';

const axiosInstance = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL,
    // Render's free tier can take up to a minute to wake from sleep,
    // so a short timeout would fail on the first request after idle
    timeout: 60000,
    headers: { 'Content-Type': 'application/json' },
});

// Attach the JWT to every request so no screen has to handle tokens itself
axiosInstance.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// AuthContext registers a function here that runs when the server rejects
// the token (expired or invalid), so the app can log the user out.
type UnauthorizedHandler = (() => void) | null;
let onUnauthorized: UnauthorizedHandler = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler): void {
    onUnauthorized = handler;
}

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Skip the login request itself: a 401 there just means wrong password
        const isLoginRequest = error.config?.url?.includes('/auth/login');
        if (error.response?.status === 401 && !isLoginRequest && onUnauthorized) {
            onUnauthorized();
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;