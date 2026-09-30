import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useApi } from '../../hooks/useApi';
import type { SyllabusResponse } from '../../types/api';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

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

export default function SyllabusScreen() {
    const { data, loading, refreshing, error, refetch } = useApi<SyllabusResponse>(
        '/api/student/syllabus'
    );

    if (loading) return <Loader />;

    const count = data?.syllabus.length ?? 0;

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
                    <Text className="text-3xl font-bold text-ink">Syllabus</Text>
                    <Text className="text-sm text-muted mt-1">
                        {count > 0
                            ? `Course outline for ${count} ${count === 1 ? 'subject' : 'subjects'}`
                            : 'Your course outline'}
                    </Text>
                </Animated.View>

                {/* ─────── Count chip ─────── */}
                {count > 0 ? (
                    <Animated.View
                        entering={FadeInUp.delay(150).duration(400).springify()}
                        className="px-6 mt-4 mb-3 flex-row items-center justify-between"
                    >
                        <Text className="text-xs font-semibold text-muted tracking-widest ml-1">
                            SUBJECTS
                        </Text>
                        <View className="bg-surfaceAlt rounded-full px-3 py-1">
                            <Text className="text-xs font-semibold text-muted">{count}</Text>
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
                    ) : !data || data.syllabus.length === 0 ? (
                        <View className="mt-10">
                            <EmptyState
                                message="No syllabus uploaded yet"
                                hint="Check back once it's added for your course"
                            />
                        </View>
                    ) : (
                        data.syllabus.map((item, index) => {
                            const colors = colorForSubject(item.subject);
                            return (
                                <Animated.View
                                    key={item.id}
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
                                            borderLeftWidth: 3,
                                            borderLeftColor: colors.accent,
                                        }}
                                    >
                                        {/* Header row: icon chip + subject name */}
                                        <View className="flex-row items-center mb-3">
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
                                                    className="text-base font-bold text-ink"
                                                    numberOfLines={1}
                                                >
                                                    {item.subject}
                                                </Text>
                                                <Text className="text-xs text-muted mt-0.5">
                                                    Syllabus overview
                                                </Text>
                                            </View>
                                            <View
                                                className="w-7 h-7 rounded-full items-center justify-center"
                                                style={{ backgroundColor: colors.soft }}
                                            >
                                                <Ionicons
                                                    name="document-text-outline"
                                                    size={14}
                                                    color={colors.accent}
                                                />
                                            </View>
                                        </View>

                                        {/* Content */}
                                        <Text
                                            className="text-sm leading-6"
                                            style={{ color: '#4B4B4B' }}
                                        >
                                            {item.content}
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