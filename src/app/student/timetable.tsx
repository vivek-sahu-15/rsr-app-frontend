import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useApi } from '../../hooks/useApi';
import type { TimetableResponse, TimetableSlot } from '../../types/api';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// The API returns one flat, already-sorted list (see the backend's ORDER_CLAUSE).
// Grouping by day here avoids a second query and keeps the sort logic in one place.
function groupByDay(slots: TimetableSlot[]): Array<[string, TimetableSlot[]]> {
    const groups: Record<string, TimetableSlot[]> = {};
    for (const slot of slots) {
        if (!groups[slot.day]) groups[slot.day] = [];
        groups[slot.day].push(slot);
    }
    return DAY_ORDER.filter((day) => groups[day]?.length).map((day) => [day, groups[day]]);
}

// Short day abbreviation for the chip
function dayShort(day: string): string {
    return day.slice(0, 3).toUpperCase();
}

// Pick a stable accent color per subject so each subject feels distinct
function colorForSubject(subject: string): { accent: string; soft: string } {
    const palette = [
        { accent: '#F58634', soft: '#F5863420' },
        { accent: '#0ea5e9', soft: '#0ea5e920' },
        { accent: '#16a34a', soft: '#16a34a20' },
        { accent: '#7c3aed', soft: '#7c3aed20' },
        { accent: '#dc2626', soft: '#dc262620' },
        { accent: '#B07400', soft: '#FFDD1F30' },
    ];
    const hash = subject.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return palette[hash % palette.length];
}

export default function TimetableScreen() {
    const { data, loading, refreshing, error, refetch } = useApi<TimetableResponse>('/api/timetable');

    if (loading) return <Loader />;

    const groupedDays = data ? groupByDay(data.timetable) : [];
    const totalSlots = data?.timetable.length ?? 0;

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
                    <Text className="text-3xl font-bold text-ink">Timetable</Text>
                    <Text className="text-sm text-muted mt-1">
                        {totalSlots > 0
                            ? `${totalSlots} ${totalSlots === 1 ? 'class' : 'classes'} this week`
                            : 'Your weekly class schedule'}
                    </Text>
                </Animated.View>

                <View className="px-6 mt-4">
                    {error && !data ? (
                        <Animated.View
                            entering={FadeInUp.duration(400)}
                            className="bg-danger/10 rounded-2xl px-4 py-3 flex-row items-center mt-4"
                            style={{ borderWidth: 1, borderColor: '#dc262633' }}
                        >
                            <Ionicons name="alert-circle" size={18} color="#dc2626" />
                            <Text className="text-danger ml-2 flex-1">{error}</Text>
                        </Animated.View>
                    ) : groupedDays.length === 0 ? (
                        <View className="mt-10">
                            <EmptyState
                                message="No timetable set yet"
                                hint="Check back once your teacher adds the schedule"
                            />
                        </View>
                    ) : (
                        groupedDays.map(([day, slots], dayIndex) => (
                            <Animated.View
                                key={day}
                                entering={FadeInUp.delay(150 + dayIndex * 80)
                                    .duration(500)
                                    .springify()}
                                className="mb-6"
                            >
                                {/* ─────── Day header ─────── */}
                                <View className="flex-row items-center mb-3">
                                    <View
                                        className="px-2.5 py-1 rounded-lg mr-2.5"
                                        style={{ backgroundColor: '#FFDD1F' }}
                                    >
                                        <Text
                                            className="text-[10px] font-bold tracking-widest"
                                            style={{ color: '#000000' }}
                                        >
                                            {dayShort(day)}
                                        </Text>
                                    </View>
                                    <Text className="text-base font-bold text-ink flex-1">
                                        {day}
                                    </Text>
                                    <View className="bg-surfaceAlt rounded-full px-2.5 py-0.5">
                                        <Text className="text-[11px] font-semibold text-muted">
                                            {slots.length}
                                        </Text>
                                    </View>
                                </View>

                                {/* ─────── Slot cards ─────── */}
                                <View className="gap-2">
                                    {slots.map((slot, slotIndex) => {
                                        const colors = colorForSubject(slot.subject);
                                        return (
                                            <Animated.View
                                                key={slot.id}
                                                entering={FadeInUp.delay(
                                                    250 + dayIndex * 80 + slotIndex * 40
                                                )
                                                    .duration(400)
                                                    .springify()}
                                            >
                                                <View
                                                    className="bg-white rounded-2xl p-4 flex-row items-center"
                                                    style={{
                                                        shadowColor: '#000',
                                                        shadowOffset: { width: 0, height: 4 },
                                                        shadowOpacity: 0.06,
                                                        shadowRadius: 12,
                                                        elevation: 2,
                                                        borderLeftWidth: 3,
                                                        borderLeftColor: colors.accent,
                                                    }}
                                                >
                                                    {/* Subject icon chip */}
                                                    <View
                                                        className="w-11 h-11 rounded-xl items-center justify-center mr-3"
                                                        style={{ backgroundColor: colors.soft }}
                                                    >
                                                        <Ionicons
                                                            name="book-outline"
                                                            size={20}
                                                            color={colors.accent}
                                                        />
                                                    </View>

                                                    {/* Subject + teacher */}
                                                    <View className="flex-1">
                                                        <Text
                                                            className="font-bold text-ink text-base"
                                                            numberOfLines={1}
                                                        >
                                                            {slot.subject}
                                                        </Text>
                                                        {slot.teacherName ? (
                                                            <View className="flex-row items-center mt-1">
                                                                <Ionicons
                                                                    name="person-outline"
                                                                    size={11}
                                                                    color="#8A8A8A"
                                                                />
                                                                <Text
                                                                    className="text-xs text-muted ml-1"
                                                                    numberOfLines={1}
                                                                >
                                                                    {slot.teacherName}
                                                                </Text>
                                                            </View>
                                                        ) : null}
                                                    </View>

                                                    {/* Period pill */}
                                                    <View
                                                        className="rounded-full px-3 py-1.5 flex-row items-center"
                                                        style={{ backgroundColor: colors.soft }}
                                                    >
                                                        <Ionicons
                                                            name="time-outline"
                                                            size={12}
                                                            color={colors.accent}
                                                        />
                                                        <Text
                                                            className="text-xs font-bold ml-1"
                                                            style={{ color: colors.accent }}
                                                        >
                                                            {slot.period}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </Animated.View>
                                        );
                                    })}
                                </View>
                            </Animated.View>
                        ))
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}