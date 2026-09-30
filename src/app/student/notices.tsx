import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useApi } from '../../hooks/useApi';
import type { NoticesResponse } from '../../types/api';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

function formatDate(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

// Pick a stable color per poster name so chips feel distinct
function colorForName(name: string): { bg: string; fg: string } {
    const palette = [
        { bg: '#FFDD1F33', fg: '#B07400' },
        { bg: '#F5863433', fg: '#B05500' },
        { bg: '#16a34a22', fg: '#16a34a' },
        { bg: '#0ea5e922', fg: '#0ea5e9' },
        { bg: '#8b5cf622', fg: '#7c3aed' },
    ];
    const hash = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return palette[hash % palette.length];
}

export default function NoticesScreen() {
    const { data, loading, refreshing, error, refetch } = useApi<NoticesResponse>('/api/notices');

    if (loading) return <Loader />;

    const noticeCount = data?.notices.length ?? 0;

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
                    <Text className="text-3xl font-bold text-ink">Notices</Text>
                    <Text className="text-sm text-muted mt-1">
                        Announcements from your teachers
                    </Text>
                </Animated.View>

                {/* ─────── Count chip ─────── */}
                {noticeCount > 0 ? (
                    <Animated.View
                        entering={FadeInUp.delay(150).duration(400).springify()}
                        className="px-6 mt-4 mb-3 flex-row items-center justify-between"
                    >
                        <Text className="text-xs font-semibold text-muted tracking-widest ml-1">
                            ALL NOTICES
                        </Text>
                        <View className="bg-surfaceAlt rounded-full px-3 py-1">
                            <Text className="text-xs font-semibold text-muted">
                                {noticeCount}
                            </Text>
                        </View>
                    </Animated.View>
                ) : null}

                <View className="px-6">
                    {error && !data ? (
                        <Animated.View
                            entering={FadeInUp.duration(400)}
                            className="bg-danger/10 rounded-2xl px-4 py-3 flex-row items-center mt-4"
                            style={{ borderWidth: 1, borderColor: '#dc262633' }}
                        >
                            <Ionicons name="alert-circle" size={18} color="#dc2626" />
                            <Text className="text-danger ml-2 flex-1">{error}</Text>
                        </Animated.View>
                    ) : !data || data.notices.length === 0 ? (
                        <View className="mt-10">
                            <EmptyState
                                message="No notices yet"
                                hint="Announcements from your teachers will show up here"
                            />
                        </View>
                    ) : (
                        data.notices.map((notice, index) => {
                            const chip = colorForName(notice.postedBy ?? 'System');
                            const initial = (notice.postedBy?.[0] ?? 'S').toUpperCase();
                            return (
                                <Animated.View
                                    key={notice.id}
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
                                        {/* Poster + date row */}
                                        <View className="flex-row items-center mb-3">
                                            <View
                                                className="w-9 h-9 rounded-full items-center justify-center mr-2.5"
                                                style={{ backgroundColor: chip.bg }}
                                            >
                                                <Text
                                                    className="text-xs font-bold"
                                                    style={{ color: chip.fg }}
                                                >
                                                    {initial}
                                                </Text>
                                            </View>
                                            <View className="flex-1">
                                                <Text
                                                    className="text-xs font-semibold text-ink"
                                                    numberOfLines={1}
                                                >
                                                    {notice.postedBy ?? 'System'}
                                                </Text>
                                                <View className="flex-row items-center mt-0.5">
                                                    <Ionicons
                                                        name="time-outline"
                                                        size={11}
                                                        color="#8A8A8A"
                                                    />
                                                    <Text className="text-[11px] text-muted ml-1">
                                                        {formatDate(notice.createdAt)}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>

                                        {/* Title */}
                                        <Text className="text-base font-bold text-ink mb-1.5">
                                            {notice.title}
                                        </Text>

                                        {/* Message */}
                                        <Text className="text-sm text-muted leading-5">
                                            {notice.message}
                                        </Text>
                                    </View>
                                </Animated.View>
                            );
                        })
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}