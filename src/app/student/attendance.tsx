import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useApi } from '../../hooks/useApi';
import type { AttendanceResponse } from '../../types/api';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

// Returns a color hex + soft bg for the given attendance %
function getPctStyle(pct: number) {
    if (pct >= 75) {
        return {
            color: '#16a34a',
            soft: '#16a34a15',
            label: 'Safe',
            icon: 'checkmark-circle' as const,
        };
    }
    if (pct >= 50) {
        return {
            color: '#F58634',
            soft: '#F5863415',
            label: 'Warning',
            icon: 'alert-circle' as const,
        };
    }
    return {
        color: '#dc2626',
        soft: '#dc262615',
        label: 'Low',
        icon: 'warning' as const,
    };
}

export default function AttendanceScreen() {
    const { data, loading, refreshing, error, refetch } = useApi<AttendanceResponse>(
        '/api/student/attendance'
    );

    if (loading) return <Loader />;

    const overall = data?.overall ?? 0;
    const overallStyle = getPctStyle(overall);

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 130 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={refetch}
                        tintColor="#F58634"
                        colors={['#F58634']}
                    />
                }
            >
                {/* ─────── Header ─────── */}
                <Animated.View
                    entering={FadeInDown.duration(500).springify()}
                    className="px-6 pt-4 pb-2"
                >
                    <Text className="text-3xl font-bold text-ink">Attendance</Text>
                    <Text className="text-sm text-muted mt-1">
                        Your overall performance across subjects
                    </Text>
                </Animated.View>

                {error && !data ? (
                    <Animated.View entering={FadeInUp.duration(400)} className="px-6 mt-6">
                        <View
                            className="bg-danger/10 rounded-2xl px-4 py-3 flex-row items-center"
                            style={{ borderWidth: 1, borderColor: '#dc262633' }}
                        >
                            <Ionicons name="alert-circle" size={18} color="#dc2626" />
                            <Text className="text-danger ml-2 flex-1">{error}</Text>
                        </View>
                    </Animated.View>
                ) : (
                    <View className="px-6 mt-4">
                        {/* ─────── Overall Card ─────── */}
                        <Animated.View entering={FadeInUp.delay(150).duration(500).springify()}>
                            <LinearGradient
                                colors={['#FFFFFF', '#FAFAFA']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{
                                    borderRadius: 28,
                                    padding: 22,
                                    marginBottom: 24,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 8 },
                                    shadowOpacity: 0.08,
                                    shadowRadius: 20,
                                    elevation: 6,
                                }}
                            >
                                <View className="flex-row items-center justify-between mb-4">
                                    <View>
                                        <Text className="text-xs font-semibold text-muted tracking-widest">
                                            OVERALL ATTENDANCE
                                        </Text>
                                        <View className="flex-row items-end mt-2">
                                            <Text
                                                className="text-5xl font-bold"
                                                style={{ color: overallStyle.color }}
                                            >
                                                {overall}
                                            </Text>
                                            <Text
                                                className="text-2xl font-bold ml-1 mb-1.5"
                                                style={{ color: overallStyle.color }}
                                            >
                                                %
                                            </Text>
                                        </View>
                                    </View>

                                    <View
                                        className="w-16 h-16 rounded-3xl items-center justify-center"
                                        style={{ backgroundColor: overallStyle.soft }}
                                    >
                                        <Ionicons
                                            name={overallStyle.icon}
                                            size={30}
                                            color={overallStyle.color}
                                        />
                                    </View>
                                </View>

                                {/* Progress bar */}
                                <View className="h-3 bg-surfaceAlt rounded-full overflow-hidden">
                                    <View
                                        style={{
                                            width: `${Math.min(overall, 100)}%`,
                                            height: '100%',
                                            backgroundColor: overallStyle.color,
                                            borderRadius: 999,
                                        }}
                                    />
                                </View>

                                <View className="flex-row items-center justify-between mt-3">
                                    <Text
                                        className="text-xs font-semibold"
                                        style={{ color: overallStyle.color }}
                                    >
                                        {overallStyle.label}
                                    </Text>
                                    <Text className="text-xs text-muted">
                                        {overall >= 75
                                            ? 'Keep it up!'
                                            : overall >= 50
                                            ? 'Improve to 75% to be safe'
                                            : 'Urgent — attend more classes'}
                                    </Text>
                                </View>
                            </LinearGradient>
                        </Animated.View>

                        {/* ─────── Subjects ─────── */}
                        {!data || data.subjects.length === 0 ? (
                            <EmptyState
                                message="No attendance records yet"
                                hint="Records will appear here once a teacher marks attendance"
                            />
                        ) : (
                            <>
                                <View className="flex-row items-center justify-between mb-3 ml-1">
                                    <Text className="text-xs font-semibold text-muted tracking-widest">
                                        SUBJECTS
                                    </Text>
                                    <View className="bg-surfaceAlt rounded-full px-3 py-1">
                                        <Text className="text-xs font-semibold text-muted">
                                            {data.subjects.length}
                                        </Text>
                                    </View>
                                </View>

                                {data.subjects.map((subject, index) => {
                                    const style = getPctStyle(subject.percentage);
                                    return (
                                        <Animated.View
                                            key={subject.subject}
                                            entering={FadeInUp.delay(200 + index * 60)
                                                .duration(450)
                                                .springify()}
                                        >
                                            <View
                                                className="bg-white rounded-2xl p-4 mb-3"
                                                style={{
                                                    shadowColor: '#000',
                                                    shadowOffset: { width: 0, height: 4 },
                                                    shadowOpacity: 0.06,
                                                    shadowRadius: 12,
                                                    elevation: 2,
                                                }}
                                            >
                                                <View className="flex-row items-center justify-between mb-3">
                                                    <View className="flex-row items-center flex-1">
                                                        <View
                                                            className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                                                            style={{ backgroundColor: style.soft }}
                                                        >
                                                            <Ionicons
                                                                name="book-outline"
                                                                size={18}
                                                                color={style.color}
                                                            />
                                                        </View>
                                                        <View className="flex-1">
                                                            <Text className="font-bold text-ink text-base" numberOfLines={1}>
                                                                {subject.subject}
                                                            </Text>
                                                            <Text className="text-xs text-muted mt-0.5">
                                                                {subject.present} present · {subject.absent} absent · {subject.total} total
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    <View
                                                        className="rounded-full px-3 py-1"
                                                        style={{ backgroundColor: style.soft }}
                                                    >
                                                        <Text
                                                            className="text-sm font-bold"
                                                            style={{ color: style.color }}
                                                        >
                                                            {subject.percentage}%
                                                        </Text>
                                                    </View>
                                                </View>

                                                {/* Mini progress bar */}
                                                <View className="h-1.5 bg-surfaceAlt rounded-full overflow-hidden">
                                                    <View
                                                        style={{
                                                            width: `${Math.min(subject.percentage, 100)}%`,
                                                            height: '100%',
                                                            backgroundColor: style.color,
                                                            borderRadius: 999,
                                                        }}
                                                    />
                                                </View>
                                            </View>
                                        </Animated.View>
                                    );
                                })}
                            </>
                        )}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}