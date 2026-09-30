import { ActivityIndicator, StatusBar, View } from 'react-native';
import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import LottieSplashScreen from "@attarchi/react-native-lottie-splash-screen";
import '../../global.css';
import { useEffect } from 'react';

function RootNavigator() {

    useEffect(() => {
        LottieSplashScreen?.hide();
    }, []);
    const { user, loading } = useAuth();

    // Wait for the saved-session check, otherwise a logged-in user would
    // briefly see the login screen on every app start
    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            {/* Logged out: only the login screen exists */}
            <Stack.Protected guard={!user}>
                <Stack.Screen name="login" />
                <Stack.Screen name="signup" />
            </Stack.Protected>

            {/* Students can only reach app/student/* */}
            <Stack.Protected guard={user?.role === 'student'}>
                <Stack.Screen name="student" />
            </Stack.Protected>

            {/* Teachers can only reach app/teacher/* */}
            <Stack.Protected guard={user?.role === 'teacher'}>
                <Stack.Screen name="teacher" />
            </Stack.Protected>
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <StatusBar
                barStyle="dark-content" backgroundColor="#6200EE" translucent={false} />
            <RootNavigator />
        </AuthProvider>
    );
}