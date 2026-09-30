import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons';
import * as Haptics from 'expo-haptics';
import Animated, {
    FadeInDown,
    FadeInUp,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import type { StudentsResponse, TeacherProfileResponse } from '../../types/api';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function TeacherDashboard() {
    const { logout } = useAuth();
    const studentsApi = useApi<StudentsResponse>('/api/teacher/students');
    const profileApi = useApi<TeacherProfileResponse>('/api/teacher/profile');

    if (studentsApi.loading || profileApi.loading) return <Loader />;

    const fullName = profileApi.data?.profile.fullName;
    const firstName = fullName ? fullName.split(' ')[0] : 'Teacher';
    const studentCount = studentsApi.data?.students.length ?? 0;

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 130 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={studentsApi.refreshing || profileApi.refreshing}
                        onRefresh={() => {
                            studentsApi.refetch();
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
                        <Pressable
                            onPress={() => {
                                Haptics.selectionAsync();
                                router.push('/teacher/profile');
                            }}
                            className="flex-row items-center"
                        >
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
                                    {fullName ? firstName : 'Teacher'}
                                </Text>
                                <View
                                    className="self-start mt-1.5 px-2 py-0.5 rounded-full"
                                    style={{ backgroundColor: 'rgba(0,0,0,0.12)' }}
                                >
                                    <Text className="text-[10px] font-bold text-ink tracking-wide">
                                        TEACHER
                                    </Text>
                                </View>
                            </View>

                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color="rgba(0,0,0,0.4)"
                            />
                        </Pressable>
                    </LinearGradient>
                </Animated.View>

                <View className="px-6 -mt-6">
                    {/* ─────── Total Students Card ─────── */}
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
                                        TOTAL STUDENTS
                                    </Text>
                                    {studentsApi.error ? (
                                        <Text className="text-danger text-sm">
                                            {studentsApi.error}
                                        </Text>
                                    ) : (
                                        <Text
                                            className="text-4xl font-bold"
                                            style={{ color: '#F58634' }}
                                        >
                                            {studentCount}
                                        </Text>
                                    )}
                                    <Text className="text-xs text-muted mt-2">
                                        {studentCount === 0
                                            ? 'No students have signed up yet.'
                                            : `Ready to mark attendance for ${studentCount} ${studentCount === 1 ? 'student' : 'students'}.`}
                                    </Text>
                                </View>

                                <View
                                    className="w-16 h-16 rounded-2xl items-center justify-center"
                                    style={{ backgroundColor: '#F5863415' }}
                                >
                                    <Ionicons name="people" size={28} color="#F58634" />
                                </View>
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
                                icon="checkmark-done-outline"
                                title="Mark"
                                subtitle="Take attendance"
                                onPress={() => router.push('/teacher/attendance')}
                            />
                            <QuickTile
                                icon="people-outline"
                                title="Students"
                                subtitle="View roster"
                                onPress={() => router.push('/teacher/students')}
                            />
                        </View>

                        <View className="flex-row gap-3 mb-5">
                            <QuickTile
                                icon="calendar-outline"
                                title="Timetable"
                                subtitle="Today's classes"
                                onPress={() => router.push('/teacher/timetable')}
                            />
                            <QuickTile
                                icon="megaphone-outline"
                                title="Notices"
                                subtitle="Post / view"
                                onPress={() => router.push('/teacher/notices')}
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