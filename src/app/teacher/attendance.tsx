import { useEffect, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import Ionicons from '@react-native-vector-icons/ionicons';
import * as Haptics from 'expo-haptics';
import Animated, {
    FadeInDown,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import axiosInstance from '../../api/axiosInstance';
import { useApi } from '../../hooks/useApi';
import type { StudentsResponse } from '../../types/api';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import DateField from '../../components/common/DateField';

type Status = 'present' | 'absent';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function toDateString(date: Date): string {
    // Local date parts, not toISOString() — see DateField.tsx for why
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export default function MarkAttendanceScreen() {
    const { data, loading, refreshing, error, refetch } = useApi<StudentsResponse>(
        '/api/teacher/students'
    );

    const [subject, setSubject] = useState('');
    const [date, setDate] = useState(toDateString(new Date()));
    const [statuses, setStatuses] = useState<Record<number, Status>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [subjectFocused, setSubjectFocused] = useState(false);

    // Default every student to "present" once the list loads, without
    // wiping out taps the teacher already made on a previous load
    useEffect(() => {
        if (!data) return;
        setStatuses((prev) => {
            const next = { ...prev };
            for (const student of data.students) {
                if (!(student.id in next)) next[student.id] = 'present';
            }
            return next;
        });
    }, [data]);

    function toggleStatus(studentId: number) {
        Haptics.selectionAsync();
        setStatuses((prev) => ({
            ...prev,
            [studentId]: prev[studentId] === 'present' ? 'absent' : 'present',
        }));
    }

    async function handleSubmit() {
        if (!subject.trim()) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            setSubmitError('Enter a subject before submitting');
            return;
        }
        if (!data || data.students.length === 0) {
            setSubmitError('No students to mark');
            return;
        }

        const records = data.students.map((student) => ({
            studentId: student.id,
            status: statuses[student.id] ?? 'present',
        }));

        setSubmitError('');
        setSubmitting(true);
        try {
            await axiosInstance.post('/api/teacher/attendance', {
                subject: subject.trim(),
                date,
                records,
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Saved', `Attendance saved for ${records.length} students.`);
        } catch (err) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            if (axios.isAxiosError(err) && err.response) {
                setSubmitError(err.response.data?.message || 'Failed to save attendance');
            } else {
                setSubmitError('Cannot reach the server. Check your connection and try again.');
            }
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) return <Loader />;

    const presentCount = data?.students.filter(
        (s) => (statuses[s.id] ?? 'present') === 'present'
    ).length ?? 0;
    const totalCount = data?.students.length ?? 0;
    const absentCount = totalCount - presentCount;

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            {/* ─────── Header (sticky-ish) ─────── */}
            <Animated.View
                entering={FadeInDown.duration(500).springify()}
                className="px-6 pt-4 pb-3"
            >
                <Text className="text-3xl font-bold text-ink">Mark Attendance</Text>
                <Text className="text-sm text-muted mt-1">
                    Set the subject, date, and tap to toggle
                </Text>

                {/* Subject input */}
                <Text className="text-xs font-semibold text-muted tracking-widest mb-2 mt-5 ml-1">
                    SUBJECT
                </Text>
                <View
                    collapsable={false}
                    className="flex-row items-center bg-surfaceAlt rounded-xl px-4 mb-3"
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
                        placeholder="e.g. DBMS"
                        placeholderTextColor="#B0B0B0"
                        className="flex-1 py-3.5 ml-3 text-ink"
                        style={{ fontSize: 15 }}
                    />
                </View>

                {/* Date field */}
                <DateField label="Date" value={date} onChange={setDate} maximumDate={new Date()} />
            </Animated.View>

            {/* ─────── Present / Absent counter bar ─────── */}
            {data && data.students.length > 0 ? (
                <Animated.View
                    entering={FadeInUp.delay(150).duration(400).springify()}
                    className="px-6 pb-3"
                >
                    <View className="flex-row gap-3">
                        <View
                            className="flex-1 rounded-2xl px-4 py-2.5 flex-row items-center"
                            style={{ backgroundColor: '#16a34a15' }}
                        >
                            <View className="w-2 h-2 rounded-full bg-success mr-2" />
                            <Text className="text-xs font-semibold text-success">
                                {presentCount} Present
                            </Text>
                        </View>
                        <View
                            className="flex-1 rounded-2xl px-4 py-2.5 flex-row items-center"
                            style={{ backgroundColor: '#dc262615' }}
                        >
                            <View className="w-2 h-2 rounded-full bg-danger mr-2" />
                            <Text className="text-xs font-semibold text-danger">
                                {absentCount} Absent
                            </Text>
                        </View>
                    </View>
                </Animated.View>
            ) : null}

            {/* ─────── Student list ─────── */}
            <ScrollView
                className="flex-1 px-6"
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
                {error && !data ? (
                    <View
                        className="bg-danger/10 rounded-2xl px-4 py-3 flex-row items-center mt-4"
                        style={{ borderWidth: 1, borderColor: '#dc262633' }}
                    >
                        <Ionicons name="alert-circle" size={18} color="#dc2626" />
                        <Text className="text-danger ml-2 flex-1">{error}</Text>
                    </View>
                ) : !data || data.students.length === 0 ? (
                    <View className="items-center mt-16">
                        <View
                            className="w-20 h-20 rounded-3xl items-center justify-center mb-4"
                            style={{ backgroundColor: '#FFDD1F33' }}
                        >
                            <Ionicons name="people-outline" size={36} color="#F58634" />
                        </View>
                        <Text className="text-ink font-semibold text-base">
                            No students found
                        </Text>
                        <Text className="text-muted text-sm mt-1 text-center px-8">
                            Students will appear here once they sign up
                        </Text>
                    </View>
                ) : (
                    data.students.map((student, index) => {
                        const status = statuses[student.id] ?? 'present';
                        const isPresent = status === 'present';
                        return (
                            <StudentRow
                                key={student.id}
                                name={student.fullName}
                                subtitle={`${student.course} · Sem ${student.semester}`}
                                isPresent={isPresent}
                                delay={Math.min(index * 40, 400)}
                                onPress={() => toggleStatus(student.id)}
                            />
                        );
                    })
                )}

                {submitError ? (
                    <Animated.View
                        entering={FadeInUp.duration(300)}
                        className="flex-row items-center bg-danger/10 rounded-lg px-3 py-2 mb-3 mt-1"
                    >
                        <Ionicons name="alert-circle" size={16} color="#dc2626" />
                        <Text className="text-danger text-sm ml-2 flex-1">{submitError}</Text>
                    </Animated.View>
                ) : null}

                <Button
                    label="Save Attendance"
                    loading={submitting}
                    onPress={handleSubmit}
                    className="mt-2"
                />
            </ScrollView>
        </SafeAreaView>
    );
}

// ─────────────────────────────────────────────
// Student row — tappable, animated, haptic
// ─────────────────────────────────────────────
interface StudentRowProps {
    name: string;
    subtitle: string;
    isPresent: boolean;
    delay: number;
    onPress: () => void;
}

function StudentRow({ name, subtitle, isPresent, delay, onPress }: StudentRowProps) {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const accent = isPresent ? '#16a34a' : '#dc2626';
    const accentSoft = isPresent ? '#16a34a15' : '#dc262615';

    return (
        <Animated.View
            entering={FadeInUp.delay(delay).duration(400).springify()}
        >
            <AnimatedPressable
                onPress={onPress}
                onPressIn={() => {
                    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
                }}
                onPressOut={() => {
                    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
                }}
                style={animatedStyle}
            >
                <View
                    className="bg-white rounded-2xl p-4 mb-3 flex-row items-center"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.06,
                        shadowRadius: 12,
                        elevation: 2,
                        borderWidth: 1.5,
                        borderColor: isPresent ? '#16a34a25' : '#dc262625',
                    }}
                >
                    {/* Status indicator circle */}
                    <View
                        className="w-11 h-11 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: accentSoft }}
                    >
                        <Ionicons
                            name={isPresent ? 'checkmark' : 'close'}
                            size={22}
                            color={accent}
                        />
                    </View>

                    <View className="flex-1">
                        <Text className="font-bold text-ink text-base" numberOfLines={1}>
                            {name}
                        </Text>
                        <Text className="text-muted text-xs mt-0.5" numberOfLines={1}>
                            {subtitle}
                        </Text>
                    </View>

                    <View
                        className="px-3 py-1.5 rounded-full"
                        style={{ backgroundColor: accentSoft }}
                    >
                        <Text
                            className="text-xs font-bold capitalize"
                            style={{ color: accent }}
                        >
                            {isPresent ? 'Present' : 'Absent'}
                        </Text>
                    </View>
                </View>
            </AnimatedPressable>
        </Animated.View>
    );
}