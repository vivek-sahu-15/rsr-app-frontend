import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function Index() {
    const { user } = useAuth();

    // If not logged in, send to login
    if (!user) {
        return <Redirect href="/login" />;
    }

    // If logged in, send to the correct dashboard based on role
    if (user.role === 'teacher') {
        return <Redirect href="/teacher/dashboard" />;
    }

    return <Redirect href="/student/dashboard" />;
}