import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance, { TOKEN_KEY, setUnauthorizedHandler } from '../api/axiosInstance';

const USER_KEY = 'user';

export type Role = 'student' | 'teacher';

export interface AuthUser {
    id: number;
    email: string;
    role: Role;
}

export interface SignupPayload {
    email: string;
    password: string;
    role: Role;
    fullName: string;
    contactNumber: string;
    // student-only fields — ignored by the backend when role is 'teacher'
    admissionDate?: string;
    dateOFBirth?: string;
    gender?: string;
    course?: string;
    semester?: string;
    motherName?: string;
    fatherName?: string;
    // teacher-only field
    subject?: string;
}

interface AuthContextValue {
    user: AuthUser | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (payload: SignupPayload) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    // True until we've checked AsyncStorage for a saved session, so the app
    // shows a spinner instead of flashing the login screen for a logged-in user
    const [loading, setLoading] = useState(true);

    const logout = useCallback(async () => {
        await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
        setToken(null);
        setUser(null);
    }, []);

    // Restore the session on app start (auto-login)
    useEffect(() => {
        async function restoreSession() {
            try {
                const [[, savedToken], [, savedUser]] = await AsyncStorage.multiGet([TOKEN_KEY, USER_KEY]);
                if (savedToken && savedUser) {
                    setToken(savedToken);
                    setUser(JSON.parse(savedUser) as AuthUser);
                }
            } catch {
                // Corrupt or unreadable storage: start logged out
                await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
            } finally {
                setLoading(false);
            }
        }
        restoreSession();
    }, []);

    // If the server ever rejects our token (expired/invalid), log the user out
    useEffect(() => {
        setUnauthorizedHandler(logout);
        return () => setUnauthorizedHandler(null);
    }, [logout]);

    // Throws an Error with a readable message so the login screen can display it
    const login = useCallback(async (email: string, password: string) => {
        let newToken: string;
        let newUser: AuthUser;

        try {
            const response = await axiosInstance.post('/api/auth/login', { email, password });
            newToken = response.data.token;
            newUser = response.data.user;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                // Server answered with an error (e.g. 401 wrong password)
                throw new Error(error.response.data?.message || 'Login failed');
            }
            // No response at all: network down, wrong URL, or server timed out
            throw new Error('Cannot reach the server. Check your connection and try again.');
        }

        // Save BEFORE updating state: the axios interceptor reads the token
        // from storage, and the first screen's requests fire right after state changes
        await AsyncStorage.multiSet([
            [TOKEN_KEY, newToken],
            [USER_KEY, JSON.stringify(newUser)],
        ]);

        setToken(newToken);
        setUser(newUser);
    }, []);

    // Your backend returns a token on signup too, so a successful signup
    // logs the user straight in — no separate "please log in now" step.
    const signup = useCallback(async (payload: SignupPayload) => {
        let newToken: string;
        let newUser: AuthUser;

        try {
            const response = await axiosInstance.post('/api/auth/signup', payload);
            newToken = response.data.token;
            newUser = response.data.user;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                // e.g. 409 "Email already registered", or 400 validation errors
                throw new Error(error.response.data?.message || 'Signup failed');
            }
            throw new Error('Cannot reach the server. Check your connection and try again.');
        }

        await AsyncStorage.multiSet([
            [TOKEN_KEY, newToken],
            [USER_KEY, JSON.stringify(newUser)],
        ]);

        setToken(newToken);
        setUser(newUser);
    }, []);

    const value = useMemo(
        () => ({ user, token, loading, login, signup, logout }),
        [user, token, loading, login, signup, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used inside an <AuthProvider>');
    }
    return context;
}