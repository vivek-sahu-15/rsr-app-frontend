import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
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
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import type { AttendanceResponse, ProfileResponse } from '../../types/api';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function StudentDashboard() {
    const { logout } = useAuth();
    const attendanceApi = useApi<AttendanceResponse>('/api/student/attendance');
    const profileApi = useApi<ProfileResponse>('/api/student/profile');

    if (attendanceApi.loading || profileApi.loading) return <Loader />;

    const fullName = profileApi.data?.profile.fullName;
    const firstName = fullName ? fullName.split(' ')[0] : 'Student';
    const attendanceValue = attendanceApi.data?.overall ?? 0;

    const attendanceColor =
        attendanceValue >= 75 ? '#16a34a' : attendanceValue >= 50 ? '#F58634' : '#dc2626';

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 130 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={attendanceApi.refreshing || profileApi.refreshing}
                        onRefresh={() => {
                            attendanceApi.refetch();
                            profileApi.refetch();
                        }}
                        tintColor="#F58634"
                        colors={['#F58634']}
                    />
                }
            >
                {/* ─────── Hero Header ─────── */}
                <Animated.View entering={FadeInDown.duration(600).springify()}>
                    <LinearGradient
                        colors={['#FFDD1F', '#F58634']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                            paddingHorizontal: 24,
                            paddingTop: 20,
                            paddingBottom: 32,
                            borderBottomLeftRadius: 32,
                            borderBottomRightRadius: 32,
                            shadowColor: '#F58634',
                            shadowOffset: { width: 0, height: 10 },
                            shadowOpacity: 0.3,
                            shadowRadius: 20,
                            elevation: 8,
                        }}
                    >
                        <View className="flex-row items-center">
                            <View
                                style={{
                                    borderWidth: 2.5,
                                    borderColor: 'rgba(255,255,255,0.6)',
                                    borderRadius: 999,
                                    overflow: 'hidden',
                                }}
                            >
                                <Avatar
                                    uri={profileApi.data?.profile.profilePicture}
                                    name={fullName}
                                    size={56}
                                />
                            </View>

                            <View className="ml-4 flex-1">
                                <Text
                                    className="text-sm font-medium"
                                    style={{ color: 'rgba(0,0,0,0.6)' }}
                                >
                                    Welcome back 👋
                                </Text>
                                <Text
                                    className="text-2xl font-bold text-ink mt-0.5"
                                    numberOfLines={1}
                                >
                                    {fullName ? firstName : 'Student'}
                                </Text>
                                <View
                                    className="self-start mt-1.5 px-2 py-0.5 rounded-full"
                                    style={{ backgroundColor: 'rgba(0,0,0,0.12)' }}
                                >
                                    <Text className="text-[10px] font-bold text-ink tracking-wide">
                                        STUDENT
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>
                </Animated.View>

                <View className="px-6 -mt-6">
                    {/* ─────── Overall Attendance Card ─────── */}
                    <Animated.View entering={FadeInUp.delay(150).duration(500).springify()}>
                        <View
                            className="bg-white rounded-3xl p-5 mb-5"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 8 },
                                shadowOpacity: 0.1,
                                shadowRadius: 20,
                                elevation: 6,
                            }}
                        >
                            <View className="flex-row items-center justify-between">
                                <View className="flex-1">
                                    <Text className="text-xs font-semibold text-muted tracking-widest mb-2">
                                        OVERALL ATTENDANCE
                                    </Text>
                                    {attendanceApi.error ? (
                                        <Text className="text-danger text-sm">
                                            {attendanceApi.error}
                                        </Text>
                                    ) : (
                                        <View className="flex-row items-end">
                                            <Text
                                                className="text-4xl font-bold"
                                                style={{ color: attendanceColor }}
                                            >
                                                {attendanceValue}
                                            </Text>
                                            <Text
                                                className="text-xl font-bold mb-1 ml-0.5"
                                                style={{ color: attendanceColor }}
                                            >
                                                %
                                            </Text>
                                        </View>
                                    )}
                                    <Text className="text-xs text-muted mt-2">
                                        {attendanceValue >= 75
                                            ? 'Great! You are on track.'
                                            : attendanceValue >= 50
                                            ? 'Attend more classes to stay safe.'
                                            : 'Low attendance — please improve.'}
                                    </Text>
                                </View>

                                <View
                                    className="w-16 h-16 rounded-2xl items-center justify-center"
                                    style={{ backgroundColor: `${attendanceColor}15` }}
                                >
                                    <Ionicons
                                        name="stats-chart"
                                        size={28}
                                        color={attendanceColor}
                                    />
                                </View>
                            </View>

                            {/* Progress bar */}
                            <View className="mt-4 h-2 bg-surfaceAlt rounded-full overflow-hidden">
                                <Animated.View
                                    entering={FadeIn.delay(400).duration(700)}
                                    style={{
                                        width: `${attendanceValue}%`,
                                        height: '100%',
                                        backgroundColor: attendanceColor,
                                        borderRadius: 999,
                                    }}
                                />
                            </View>
                        </View>
                    </Animated.View>

                    {/* ─────── Quick Actions ─────── */}
                    <Animated.View entering={FadeInUp.delay(300).duration(500).springify()}>
                        <Text className="text-xs font-semibold text-muted tracking-widest mb-3 ml-1">
                            QUICK ACTIONS
                        </Text>

                        <View className="flex-row gap-3 mb-3">
                            <QuickTile
                                icon="book-outline"
                                title="Syllabus"
                                subtitle="View subjects"
                                onPress={() => router.push('/student/syllabus')}
                            />
                            <QuickTile
                                icon="card-outline"
                                title="Fees"
                                subtitle="Check dues"
                                onPress={() => router.push('/student/fees')}
                            />
                        </View>

                        <View className="flex-row gap-3 mb-5">
                            <QuickTile
                                icon="calendar-outline"
                                title="Timetable"
                                subtitle="Today's classes"
                                onPress={() => router.push('/student/timetable')}
                            />
                            <QuickTile
                                icon="megaphone-outline"
                                title="Notices"
                                subtitle="Announcements"
                                onPress={() => router.push('/student/notices')}
                            />
                        </View>
                    </Animated.View>

                    {/* ─────── Log Out ─────── */}
                    <Animated.View entering={FadeInUp.delay(400).duration(500).springify()}>
                        <Button
                            label="Log Out"
                            variant="secondary"
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                logout();
                            }}
                            className="mt-2"
                        />
                    </Animated.View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// ─────────────────────────────────────────────
// Quick action tile
// ─────────────────────────────────────────────
interface QuickTileProps {
    icon: string;
    title: string;
    subtitle: string;
    onPress: () => void;
}

function QuickTile({ icon, title, subtitle, onPress }: QuickTileProps) {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <AnimatedPressable
            onPress={() => {
                Haptics.selectionAsync();
                onPress();
            }}
            onPressIn={() => {
                scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
            }}
            onPressOut={() => {
                scale.value = withSpring(1, { damping: 15, stiffness: 400 });
            }}
            style={animatedStyle}
            className="flex-1"
        >
            <View
                className="bg-white rounded-2xl p-4"
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    elevation: 3,
                }}
            >
                <View
                    className="w-10 h-10 rounded-xl items-center justify-center mb-3"
                    style={{ backgroundColor: '#FFDD1F33' }}
                >
                    <Ionicons name={icon as any} size={20} color="#F58634" />
                </View>
                <Text className="font-bold text-ink text-sm">{title}</Text>
                <Text className="text-muted text-xs mt-0.5">{subtitle}</Text>
            </View>
        </AnimatedPressable>
    );
}