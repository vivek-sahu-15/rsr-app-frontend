import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import * as Haptics from 'expo-haptics';
import axios from 'axios';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import axiosInstance from '../../api/axiosInstance';
import { useApi } from '../../hooks/useApi';
import type { NoticesResponse } from '../../types/api';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';

function formatDate(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function TeacherNoticesScreen() {
    const { data, loading, refreshing, error, refetch } = useApi<NoticesResponse>('/api/notices');

    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [titleFocused, setTitleFocused] = useState(false);
    const [messageFocused, setMessageFocused] = useState(false);

    async function handlePost() {
        const trimmedTitle = title.trim();
        const trimmedMessage = message.trim();

        if (!trimmedTitle || !trimmedMessage) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            setSubmitError('Title and message are required');
            return;
        }

        setSubmitError('');
        setSubmitting(true);
        try {
            await axiosInstance.post('/api/notices', {
                title: trimmedTitle,
                message: trimmedMessage,
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setTitle('');
            setMessage('');
            refetch(); // pulls the new notice into the list below immediately
        } catch (err) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            if (axios.isAxiosError(err) && err.response) {
                setSubmitError(err.response.data?.message || 'Failed to post notice');
            } else {
                setSubmitError('Cannot reach the server. Check your connection and try again.');
            }
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) return <Loader />;

    const noticeCount = data?.notices.length ?? 0;

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 130 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
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
                        Post announcements for your students
                    </Text>
                </Animated.View>

                <View className="px-6 mt-4">
                    {/* ─────── Post Form ─────── */}
                    <Animated.View entering={FadeInUp.delay(150).duration(500).springify()}>
                        <View
                            className="bg-white rounded-3xl p-5 mb-6"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 6 },
                                shadowOpacity: 0.08,
                                shadowRadius: 16,
                                elevation: 4,
                            }}
                        >
                            {/* Form header */}
                            <View className="flex-row items-center mb-4">
                                <View
                                    className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                                    style={{ backgroundColor: '#FFDD1F33' }}
                                >
                                    <Ionicons
                                        name="megaphone-outline"
                                        size={20}
                                        color="#F58634"
                                    />
                                </View>
                                <View>
                                    <Text className="text-base font-bold text-ink">
                                        New Notice
                                    </Text>
                                    <Text className="text-xs text-muted mt-0.5">
                                        Visible to all your students
                                    </Text>
                                </View>
                            </View>

                            {/* Title */}
                            <Text className="text-xs font-semibold text-muted tracking-widest mb-2 ml-1">
                                TITLE
                            </Text>
                            <View
                                collapsable={false}
                                className="flex-row items-center bg-surfaceAlt rounded-xl px-4 mb-4"
                                style={{
                                    borderWidth: 1.5,
                                    borderColor: titleFocused ? '#F58634' : '#EAEAEA',
                                    shadowColor: titleFocused ? '#F58634' : 'transparent',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: titleFocused ? 0.15 : 0,
                                    shadowRadius: 8,
                                    elevation: titleFocused ? 3 : 0,
                                }}
                            >
                                <Ionicons
                                    name="create-outline"
                                    size={18}
                                    color={titleFocused ? '#F58634' : '#8A8A8A'}
                                />
                                <TextInput
                                    value={title}
                                    onChangeText={setTitle}
                                    onFocus={() => setTitleFocused(true)}
                                    onBlur={() => setTitleFocused(false)}
                                    placeholder="e.g. Holiday Notice"
                                    placeholderTextColor="#B0B0B0"
                                    maxLength={100}
                                    className="flex-1 py-3.5 ml-3 text-ink"
                                    style={{ fontSize: 15 }}
                                />
                            </View>

                            {/* Message */}
                            <View className="flex-row items-center justify-between mb-2 ml-1">
                                <Text className="text-xs font-semibold text-muted tracking-widest">
                                    MESSAGE
                                </Text>
                                <Text className="text-[10px] text-muted">
                                    {message.length}/500
                                </Text>
                            </View>
                            <View
                                collapsable={false}
                                className="flex-row items-start bg-surfaceAlt rounded-xl px-4 py-3 mb-2"
                                style={{
                                    borderWidth: 1.5,
                                    borderColor: messageFocused ? '#F58634' : '#EAEAEA',
                                    shadowColor: messageFocused ? '#F58634' : 'transparent',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: messageFocused ? 0.15 : 0,
                                    shadowRadius: 8,
                                    elevation: messageFocused ? 3 : 0,
                                    minHeight: 100,
                                }}
                            >
                                <Ionicons
                                    name="chatbox-ellipses-outline"
                                    size={18}
                                    color={messageFocused ? '#F58634' : '#8A8A8A'}
                                    style={{ marginTop: 2 }}
                                />
                                <TextInput
                                    value={message}
                                    onChangeText={setMessage}
                                    onFocus={() => setMessageFocused(true)}
                                    onBlur={() => setMessageFocused(false)}
                                    placeholder="Write the announcement..."
                                    placeholderTextColor="#B0B0B0"
                                    multiline
                                    numberOfLines={4}
                                    maxLength={500}
                                    textAlignVertical="top"
                                    className="flex-1 ml-3 text-ink"
                                    style={{ fontSize: 15, minHeight: 80 }}
                                />
                            </View>

                            {/* Submit error */}
                            {submitError ? (
                                <Animated.View
                                    entering={FadeInUp.duration(300)}
                                    className="flex-row items-center bg-danger/10 rounded-lg px-3 py-2 mb-3"
                                >
                                    <Ionicons name="alert-circle" size={16} color="#dc2626" />
                                    <Text className="text-danger text-sm ml-2 flex-1">
                                        {submitError}
                                    </Text>
                                </Animated.View>
                            ) : null}

                            <Button
                                label="Post Notice"
                                loading={submitting}
                                onPress={handlePost}
                                className="mt-1"
                            />
                        </View>
                    </Animated.View>

                    {/* ─────── Existing Notices ─────── */}
                    <Animated.View entering={FadeInUp.delay(300).duration(500).springify()}>
                        <View className="flex-row items-center justify-between mb-3 ml-1">
                            <Text className="text-xs font-semibold text-muted tracking-widest">
                                ALL NOTICES
                            </Text>
                            {noticeCount > 0 ? (
                                <View className="bg-surfaceAlt rounded-full px-3 py-1">
                                    <Text className="text-xs font-semibold text-muted">
                                        {noticeCount}
                                    </Text>
                                </View>
                            ) : null}
                        </View>

                        {error && !data ? (
                            <Animated.View
                                entering={FadeInUp.duration(400)}
                                className="bg-danger/10 rounded-2xl px-4 py-3 flex-row items-center"
                                style={{ borderWidth: 1, borderColor: '#dc262633' }}
                            >
                                <Ionicons name="alert-circle" size={18} color="#dc2626" />
                                <Text className="text-danger ml-2 flex-1">{error}</Text>
                            </Animated.View>
                        ) : !data || data.notices.length === 0 ? (
                            <View className="mt-6">
                                <EmptyState message="No notices posted yet" />
                            </View>
                        ) : (
                            data.notices.map((notice, index) => (
                                <Animated.View
                                    key={notice.id}
                                    entering={FadeInUp.delay(400 + index * 60)
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
                                        <View className="flex-row items-center justify-between mb-2">
                                            <View className="flex-row items-center flex-1">
                                                <View
                                                    className="w-9 h-9 rounded-full items-center justify-center mr-2.5"
                                                    style={{ backgroundColor: '#FFDD1F33' }}
                                                >
                                                    <Ionicons
                                                        name="megaphone"
                                                        size={16}
                                                        color="#F58634"
                                                    />
                                                </View>
                                                <Text
                                                    className="text-xs font-semibold text-muted"
                                                    numberOfLines={1}
                                                >
                                                    Posted
                                                </Text>
                                            </View>
                                            <View className="flex-row items-center">
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

                                        <Text className="text-base font-bold text-ink mb-1.5">
                                            {notice.title}
                                        </Text>
                                        <Text className="text-sm text-muted leading-5">
                                            {notice.message}
                                        </Text>
                                    </View>
                                </Animated.View>
                            ))
                        )}
                    </Animated.View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}