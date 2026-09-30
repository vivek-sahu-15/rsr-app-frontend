import { useState } from 'react';
import {
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import * as Haptics from 'expo-haptics';
import axios from 'axios';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import axiosInstance from '../../api/axiosInstance';
import { useApi } from '../../hooks/useApi';
import type { TimetableResponse, TimetableSlot } from '../../types/api';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function groupByDay(slots: TimetableSlot[]): Array<[string, TimetableSlot[]]> {
    const groups: Record<string, TimetableSlot[]> = {};
    for (const slot of slots) {
        if (!groups[slot.day]) groups[slot.day] = [];
        groups[slot.day].push(slot);
    }
    return DAY_ORDER.filter((day) => groups[day]?.length).map((day) => [day, groups[day]]);
}

function dayShort(day: string): string {
    return day.slice(0, 3).toUpperCase();
}

// Stable color per subject (matches student timetable)
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

export default function TeacherTimetableScreen() {
    const { data, loading, refreshing, error, refetch } = useApi<TimetableResponse>('/api/timetable');

    const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
    const [day, setDay] = useState('');
    const [period, setPeriod] = useState('');
    const [subject, setSubject] = useState('');
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [periodFocused, setPeriodFocused] = useState(false);
    const [subjectFocused, setSubjectFocused] = useState(false);

    function openEditor(slot: TimetableSlot) {
        Haptics.selectionAsync();
        setEditingSlot(slot);
        setDay(slot.day);
        setPeriod(slot.period);
        setSubject(slot.subject);
        setSaveError('');
    }

    function closeEditor() {
        setEditingSlot(null);
    }

    async function handleSave() {
        if (!editingSlot) return;
        if (!DAY_ORDER.includes(day)) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            setSaveError('Day must be Monday to Saturday');
            return;
        }

        setSaveError('');
        setSaving(true);
        try {
            await axiosInstance.put(`/api/teacher/timetable/${editingSlot.id}`, {
                day,
                period,
                subject,
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            closeEditor();
            refetch();
        } catch (err) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            if (axios.isAxiosError(err) && err.response) {
                setSaveError(err.response.data?.message || 'Failed to update slot');
            } else {
                setSaveError('Cannot reach the server. Check your connection and try again.');
            }
        } finally {
            setSaving(false);
        }
    }

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
                    <Text className="text-3xl font-bold text-ink">My Timetable</Text>
                    <Text className="text-sm text-muted mt-1">
                        {totalSlots > 0
                            ? `${totalSlots} ${totalSlots === 1 ? 'slot' : 'slots'} · Tap any to edit`
                            : 'Your teaching schedule'}
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
                            <EmptyState message="No slots assigned to you yet" />
                        </View>
                    ) : (
                        groupedDays.map(([dayName, slots], dayIndex) => (
                            <Animated.View
                                key={dayName}
                                entering={FadeInUp.delay(150 + dayIndex * 80)
                                    .duration(500)
                                    .springify()}
                                className="mb-6"
                            >
                                {/* Day header */}
                                <View className="flex-row items-center mb-3">
                                    <View
                                        className="px-2.5 py-1 rounded-lg mr-2.5"
                                        style={{ backgroundColor: '#FFDD1F' }}
                                    >
                                        <Text
                                            className="text-[10px] font-bold tracking-widest"
                                            style={{ color: '#000000' }}
                                        >
                                            {dayShort(dayName)}
                                        </Text>
                                    </View>
                                    <Text className="text-base font-bold text-ink flex-1">
                                        {dayName}
                                    </Text>
                                    <View className="bg-surfaceAlt rounded-full px-2.5 py-0.5">
                                        <Text className="text-[11px] font-semibold text-muted">
                                            {slots.length}
                                        </Text>
                                    </View>
                                </View>

                                {/* Slot cards */}
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
                                                <Pressable
                                                    onPress={() => openEditor(slot)}
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

                                                        <View className="flex-1">
                                                            <Text
                                                                className="font-bold text-ink text-base"
                                                                numberOfLines={1}
                                                            >
                                                                {slot.subject}
                                                            </Text>
                                                            <View className="flex-row items-center mt-1">
                                                                <Ionicons
                                                                    name="school-outline"
                                                                    size={11}
                                                                    color="#8A8A8A"
                                                                />
                                                                <Text
                                                                    className="text-xs text-muted ml-1"
                                                                    numberOfLines={1}
                                                                >
                                                                    {slot.course} · Sem {slot.semester}
                                                                </Text>
                                                            </View>
                                                        </View>

                                                        <View
                                                            className="rounded-full px-3 py-1.5 flex-row items-center mr-2"
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

                                                        <Ionicons
                                                            name="chevron-forward"
                                                            size={16}
                                                            color="#B0B0B0"
                                                        />
                                                    </View>
                                                </Pressable>
                                            </Animated.View>
                                        );
                                    })}
                                </View>
                            </Animated.View>
                        ))
                    )}
                </View>
            </ScrollView>

            {/* ─────── Edit Modal (bottom sheet) ─────── */}
            <Modal
                visible={editingSlot !== null}
                animationType="slide"
                transparent
                onRequestClose={closeEditor}
            >
                <Pressable
                    className="flex-1 justify-end"
                    style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
                    onPress={closeEditor}
                >
                    <Pressable
                        className="bg-white rounded-t-3xl p-6"
                        onPress={(e) => e.stopPropagation()}
                    >
                        {/* Sheet handle */}
                        <View className="items-center mb-4">
                            <View
                                className="rounded-full"
                                style={{
                                    width: 40,
                                    height: 4,
                                    backgroundColor: '#E0E0E0',
                                }}
                            />
                        </View>

                        {/* Header */}
                        <View className="flex-row items-center mb-5">
                            <View
                                className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
                                style={{ backgroundColor: '#FFDD1F33' }}
                            >
                                <Ionicons name="create-outline" size={22} color="#F58634" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-lg font-bold text-ink">Edit Slot</Text>
                                <Text className="text-xs text-muted mt-0.5">
                                    Update day, period, or subject
                                </Text>
                            </View>
                            <Pressable
                                onPress={closeEditor}
                                hitSlop={10}
                                className="w-9 h-9 rounded-full items-center justify-center"
                                style={{ backgroundColor: '#F5F5F5' }}
                            >
                                <Ionicons name="close" size={18} color="#8A8A8A" />
                            </Pressable>
                        </View>

                        {/* Day selector */}
                        <Text className="text-xs font-semibold text-muted tracking-widest mb-2 ml-1">
                            DAY
                        </Text>
                        <View className="flex-row flex-wrap gap-2 mb-4">
                            {DAY_ORDER.map((d) => {
                                const isActive = day === d;
                                return (
                                    <Pressable
                                        key={d}
                                        onPress={() => {
                                            Haptics.selectionAsync();
                                            setDay(d);
                                        }}
                                        className="px-3 py-2 rounded-xl"
                                        style={{
                                            backgroundColor: isActive ? '#FFDD1F' : '#F5F5F5',
                                            shadowColor: isActive ? '#FFDD1F' : 'transparent',
                                            shadowOffset: { width: 0, height: 4 },
                                            shadowOpacity: isActive ? 0.45 : 0,
                                            shadowRadius: 10,
                                            elevation: isActive ? 4 : 0,
                                        }}
                                    >
                                        <Text
                                            className="text-xs font-bold"
                                            style={{
                                                color: isActive ? '#000000' : '#8A8A8A',
                                            }}
                                        >
                                            {d.slice(0, 3)}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>

                        {/* Period input */}
                        <Text className="text-xs font-semibold text-muted tracking-widest mb-2 ml-1">
                            PERIOD
                        </Text>
                        <View
                            collapsable={false}
                            className="flex-row items-center bg-surfaceAlt rounded-xl px-4 mb-4"
                            style={{
                                borderWidth: 1.5,
                                borderColor: periodFocused ? '#F58634' : '#EAEAEA',
                                shadowColor: periodFocused ? '#F58634' : 'transparent',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: periodFocused ? 0.15 : 0,
                                shadowRadius: 8,
                                elevation: periodFocused ? 3 : 0,
                            }}
                        >
                            <Ionicons
                                name="time-outline"
                                size={18}
                                color={periodFocused ? '#F58634' : '#8A8A8A'}
                            />
                            <TextInput
                                value={period}
                                onChangeText={setPeriod}
                                onFocus={() => setPeriodFocused(true)}
                                onBlur={() => setPeriodFocused(false)}
                                placeholder="09:00-10:00"
                                placeholderTextColor="#B0B0B0"
                                className="flex-1 py-3.5 ml-3 text-ink"
                                style={{ fontSize: 15 }}
                            />
                        </View>

                        {/* Subject input */}
                        <Text className="text-xs font-semibold text-muted tracking-widest mb-2 ml-1">
                            SUBJECT
                        </Text>
                        <View
                            collapsable={false}
                            className="flex-row items-center bg-surfaceAlt rounded-xl px-4 mb-4"
                            style={{
                                borderWidth: 1.5,
                                borderColor: subjectFocused ? '#F58634' : '#EAEAEA',
                                shadowColor: subjectFocused ? '#F58634' : 'transparent',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: subjectFocused ? 0.15 : 0,
                                shadowRadius: 8,
                                elevation: subjectFocused ? 3 : 0,
                            }}
                        >
                            <Ionicons
                                name="book-outline"
                                size={18}
                                color={subjectFocused ? '#F58634' : '#8A8A8A'}
                            />
                            <TextInput
                                value={subject}
                                onChangeText={setSubject}
                                onFocus={() => setSubjectFocused(true)}
                                onBlur={() => setSubjectFocused(false)}
                                placeholder="DBMS"
                                placeholderTextColor="#B0B0B0"
                                className="flex-1 py-3.5 ml-3 text-ink"
                                style={{ fontSize: 15 }}
                            />
                        </View>

                        {/* Error pill */}
                        {saveError ? (
                            <Animated.View
                                entering={FadeInUp.duration(300)}
                                className="flex-row items-center bg-danger/10 rounded-lg px-3 py-2 mb-3"
                            >
                                <Ionicons name="alert-circle" size={16} color="#dc2626" />
                                <Text className="text-danger text-sm ml-2 flex-1">
                                    {saveError}
                                </Text>
                            </Animated.View>
                        ) : null}

                        <Button
                            label="Save Changes"
                            loading={saving}
                            onPress={handleSave}
                            className="mt-1"
                        />
                        <Button
                            label="Cancel"
                            variant="secondary"
                            onPress={closeEditor}
                            className="mt-2 mb-2"
                        />
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}