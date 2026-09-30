import { useState } from 'react';
import { RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useApi } from '../../hooks/useApi';
import type { StudentsResponse } from '../../types/api';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

// Deterministic color per student name so avatars are distinct but stable
function colorForName(name: string): { bg: string; fg: string } {
    const palette = [
        { bg: '#FFDD1F33', fg: '#B07400' },
        { bg: '#F5863433', fg: '#B05500' },
        { bg: '#16a34a22', fg: '#16a34a' },
        { bg: '#0ea5e922', fg: '#0ea5e9' },
        { bg: '#8b5cf622', fg: '#7c3aed' },
        { bg: '#dc262622', fg: '#dc2626' },
    ];
    const hash = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return palette[hash % palette.length];
}

function initialsOf(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function StudentsScreen() {
    const [search, setSearch] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);

    // Changing `search` changes the URL, and useApi refetches automatically
    // since the url itself is in its dependency array — no manual "search"
    // button or debounce logic needed for a list this small.
    const url = search
        ? `/api/teacher/students?search=${encodeURIComponent(search)}`
        : '/api/teacher/students';

    const { data, loading, refreshing, error, refetch } = useApi<StudentsResponse>(url);

    const count = data?.students.length ?? 0;

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            {/* ─────── Header + Search (sticky above list) ─────── */}
            <Animated.View
                entering={FadeInDown.duration(500).springify()}
                className="px-6 pt-4 pb-3"
            >
                <Text className="text-3xl font-bold text-ink">Students</Text>
                <Text className="text-sm text-muted mt-1">
                    {count > 0
                        ? `${count} ${count === 1 ? 'student' : 'students'}${search ? ' found' : ''}`
                        : 'Search your student roster'}
                </Text>

              
            </Animated.View>

            {loading ? (
                <Loader />
            ) : (
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ paddingBottom: 130, paddingHorizontal: 24 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
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
                        <Animated.View
                            entering={FadeInUp.duration(400)}
                            className="bg-danger/10 rounded-2xl px-4 py-3 flex-row items-center mt-4"
                            style={{ borderWidth: 1, borderColor: '#dc262633' }}
                        >
                            <Ionicons name="alert-circle" size={18} color="#dc2626" />
                            <Text className="text-danger ml-2 flex-1">{error}</Text>
                        </Animated.View>
                    ) : !data || data.students.length === 0 ? (
                        <View className="mt-10">
                            <EmptyState
                                message={search ? 'No students match that search' : 'No students found'}
                            />
                        </View>
                    ) : (
                        data.students.map((student, index) => {
                            const chip = colorForName(student.fullName ?? student.email ?? '');
                            const initials = initialsOf(student.fullName ?? student.email ?? '?');

                            return (
                                <Animated.View
                                    key={student.id}
                                    entering={FadeInUp.delay(150 + index * 50)
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
                                        {/* Top row: avatar + name + email */}
                                        <View className="flex-row items-center mb-3">
                                            <View
                                                className="w-12 h-12 rounded-full items-center justify-center mr-3"
                                                style={{ backgroundColor: chip.bg }}
                                            >
                                                <Text
                                                    className="text-sm font-bold"
                                                    style={{ color: chip.fg }}
                                                >
                                                    {initials}
                                                </Text>
                                            </View>

                                            <View className="flex-1">
                                                <Text
                                                    className="text-base font-bold text-ink"
                                                    numberOfLines={1}
                                                >
                                                    {student.fullName}
                                                </Text>
                                                <View className="flex-row items-center mt-0.5">
                                                    <Ionicons
                                                        name="mail-outline"
                                                        size={11}
                                                        color="#8A8A8A"
                                                    />
                                                    <Text
                                                        className="text-xs text-muted ml-1 flex-1"
                                                        numberOfLines={1}
                                                    >
                                                        {student.email}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>

                                        {/* Meta chips */}
                                        <View className="flex-row flex-wrap gap-2">
                                            {student.course ? (
                                                <View
                                                    className="flex-row items-center px-2.5 py-1 rounded-full"
                                                    style={{ backgroundColor: '#FFDD1F22' }}
                                                >
                                                    <Ionicons
                                                        name="book-outline"
                                                        size={11}
                                                        color="#B07400"
                                                    />
                                                    <Text className="text-[11px] font-semibold ml-1 text-ink">
                                                        {student.course}
                                                    </Text>
                                                </View>
                                            ) : null}

                                            {student.semester ? (
                                                <View
                                                    className="flex-row items-center px-2.5 py-1 rounded-full"
                                                    style={{ backgroundColor: '#F5863422' }}
                                                >
                                                    <Ionicons
                                                        name="layers-outline"
                                                        size={11}
                                                        color="#B05500"
                                                    />
                                                    <Text className="text-[11px] font-semibold ml-1 text-ink">
                                                        Sem {student.semester}
                                                    </Text>
                                                </View>
                                            ) : null}

                                            {student.contactNumber ? (
                                                <View
                                                    className="flex-row items-center px-2.5 py-1 rounded-full"
                                                    style={{ backgroundColor: '#16a34a22' }}
                                                >
                                                    <Ionicons
                                                        name="call-outline"
                                                        size={11}
                                                        color="#16a34a"
                                                    />
                                                    <Text className="text-[11px] font-semibold ml-1 text-ink">
                                                        {student.contactNumber}
                                                    </Text>
                                                </View>
                                            ) : null}
                                        </View>
                                    </View>
                                </Animated.View>
                            );
                        })
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}