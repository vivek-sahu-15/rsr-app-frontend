import { ScrollView, Text, TextInput, View, Pressable, Platform } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons';
import * as Haptics from 'expo-haptics';
import Animated, {
    FadeInDown,
    FadeInUp,
    FadeIn,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Login() {
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Focus states for input highlight
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);

    // Press animation for the link
    const linkScale = useSharedValue(1);
    const linkAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: linkScale.value }],
    }));

    async function handleLogin() {
        if (!email || !password) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            setError('Email and password are required');
            return;
        }

        setError('');
        setSubmitting(true);
        try {
            await login(email, password);
            // No navigation call here on purpose — _layout.tsx's Stack.Protected
            // guards watch `user` from context and switch sections automatically
            // once login() updates it. Navigating manually here would fight that.
        } catch (err) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Soft branded glow at the top */}
            <View className="absolute top-0 left-0 right-0 h-72 overflow-hidden">
                <LinearGradient
                    colors={['#FFDD1F33', '#F5863411', '#FFFFFF00']}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={{ flex: 1 }}
                />
            </View>

            <ScrollView
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
                className="bg-transparent"
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}
                automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
            >
                <View className="flex-1 justify-center px-6 pt-10 pb-8">
                    {/* ───── Logo ───── */}
                    <Animated.View
                        entering={FadeInDown.duration(600).springify()}
                        className="items-center mb-6"
                    >
                        <View
                            className="w-24 h-24 rounded-3xl items-center justify-center mb-4"
                            style={{
                                backgroundColor: '#FFFFFF',
                                shadowColor: '#F58634',
                                shadowOffset: { width: 0, height: 10 },
                                shadowOpacity: 0.25,
                                shadowRadius: 20,
                                elevation: 10,
                            }}
                        >
                            <Image
                                source={require('../../assets/images/logo.png')}
                                style={{ width: 64, height: 64 }}
                                contentFit="contain"
                                transition={300}
                            />
                        </View>
                    </Animated.View>

                    {/* ───── Heading ───── */}
                    <Animated.View entering={FadeInDown.delay(100).duration(600).springify()}>
                        <Text className="text-3xl font-bold text-center text-ink mb-2">
                            Welcome Back
                        </Text>
                        <Text className="text-sm text-muted text-center mb-10">
                            Log in to your college account
                        </Text>
                    </Animated.View>

                    {/* ───── Email ───── */}
                    <Animated.View entering={FadeInUp.delay(200).duration(500).springify()}>
                        <Text className="text-xs font-semibold text-muted mb-2 ml-1 tracking-wide">
                            EMAIL
                        </Text>
                        <View
                            collapsable={false}
                            className="flex-row items-center bg-surfaceAlt rounded-xl px-4 mb-4"
                            style={{
                                borderWidth: 1.5,
                                borderColor: emailFocused ? '#F58634' : '#EAEAEA',
                                shadowColor: emailFocused ? '#F58634' : 'transparent',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: emailFocused ? 0.15 : 0,
                                shadowRadius: 8,
                                elevation: emailFocused ? 3 : 0,
                            }}
                        >
                            <Ionicons
                                name="mail-outline"
                                size={18}
                                color={emailFocused ? '#F58634' : '#8A8A8A'}
                            />
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                onFocus={() => setEmailFocused(true)}
                                onBlur={() => setEmailFocused(false)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                placeholder="you@rungtacolleges.com"
                                placeholderTextColor="#B0B0B0"
                                className="flex-1 py-3.5 ml-3 text-ink"
                                style={{ fontSize: 15 }}
                            />
                        </View>
                    </Animated.View>

                    {/* ───── Password ───── */}
                    <Animated.View entering={FadeInUp.delay(300).duration(500).springify()}>
                        <Text className="text-xs font-semibold text-muted mb-2 ml-1 tracking-wide">
                            PASSWORD
                        </Text>
                        <View
                            collapsable={false}
                            className="flex-row items-center bg-surfaceAlt rounded-xl px-4 mb-2"
                            style={{
                                borderWidth: 1.5,
                                borderColor: passwordFocused ? '#F58634' : '#EAEAEA',
                                shadowColor: passwordFocused ? '#F58634' : 'transparent',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: passwordFocused ? 0.15 : 0,
                                shadowRadius: 8,
                                elevation: passwordFocused ? 3 : 0,
                            }}
                        >
                            <Ionicons
                                name="lock-closed-outline"
                                size={18}
                                color={passwordFocused ? '#F58634' : '#8A8A8A'}
                            />
                            <TextInput
                                value={password}
                                onChangeText={setPassword}
                                onFocus={() => setPasswordFocused(true)}
                                onBlur={() => setPasswordFocused(false)}
                                secureTextEntry={!passwordVisible}
                                autoCapitalize="none"
                                placeholder="••••••••"
                                placeholderTextColor="#B0B0B0"
                                className="flex-1 py-3.5 ml-3 text-ink"
                                style={{ fontSize: 15 }}
                            />
                            <Pressable
                                onPress={() => setPasswordVisible((v) => !v)}
                                hitSlop={10}
                            >
                                <Ionicons
                                    name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
                                    size={18}
                                    color="#8A8A8A"
                                />
                            </Pressable>
                        </View>
                    </Animated.View>

                    {/* ───── Error ───── */}
                    {error ? (
                        <Animated.View
                            entering={FadeIn.duration(300)}
                            className="flex-row items-center bg-danger/10 rounded-lg px-3 py-2 mb-2 mt-1"
                        >
                            <Ionicons name="alert-circle" size={16} color="#dc2626" />
                            <Text className="text-danger text-sm ml-2 flex-1">{error}</Text>
                        </Animated.View>
                    ) : null}

                    {/* ───── Button ───── */}
                    <Animated.View
                        entering={FadeInUp.delay(400).duration(500).springify()}
                        className="mt-6"
                    >
                        <Button label="Log In" loading={submitting} onPress={handleLogin} />
                    </Animated.View>

                    {/* ───── Sign up link ───── */}
                    <Animated.View
                        entering={FadeInUp.delay(500).duration(500).springify()}
                        className="mt-8 items-center"
                    >
                        <View className="flex-row items-center">
                            <Text className="text-sm text-muted">New here? </Text>
                            <Link href="/signup" asChild>
                                <AnimatedPressable
                                    onPressIn={() => {
                                        linkScale.value = withSpring(0.94);
                                        Haptics.selectionAsync();
                                    }}
                                    onPressOut={() => {
                                        linkScale.value = withSpring(1);
                                    }}
                                    style={linkAnimatedStyle}
                                >
                                    <Text className="text-sm font-bold text-secondary">
                                        Create an account
                                    </Text>
                                </AnimatedPressable>
                            </Link>
                        </View>
                    </Animated.View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}