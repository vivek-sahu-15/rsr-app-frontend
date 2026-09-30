import { useState } from 'react';
import { RefreshControl, ScrollView, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import axiosInstance from '../../api/axiosInstance';
import { uploadImageToCloudinary } from '../../api/cloudinary';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import type { ProfileResponse } from '../../types/api';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';

function formatDate(dateString: string): string {
    if (!dateString) return '—';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

// One info row with an icon, label, and value
function InfoRow({
    icon,
    label,
    value,
}: {
    icon: string;
    label: string;
    value: string;
}) {
    return (
        <View className="flex-row items-center py-3">
            <View
                className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: '#FFDD1F22' }}
            >
                <Ionicons name={icon as any} size={16} color="#F58634" />
            </View>
            <View className="flex-1">
                <Text className="text-xs text-muted mb-0.5">{label}</Text>
                <Text className="text-sm font-semibold text-ink" numberOfLines={1}>
                    {value || '—'}
                </Text>
            </View>
        </View>
    );
}

// Card wrapper for grouping rows
function Section({
    title,
    children,
    delay = 0,
}: {
    title: string;
    children: React.ReactNode;
    delay?: number;
}) {
    return (
        <Animated.View
            entering={FadeInUp.delay(delay).duration(500).springify()}
            className="bg-white rounded-3xl px-5 py-2 mb-4"
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.07,
                shadowRadius: 16,
                elevation: 3,
            }}
        >
            <Text className="text-xs font-semibold text-muted tracking-widest mt-3 mb-1 ml-1">
                {title}
            </Text>
            {children}
        </Animated.View>
    );
}

export default function ProfileScreen() {
    const { logout } = useAuth();
    const { data, loading, refreshing, error, refetch } = useApi<ProfileResponse>(
        '/api/student/profile'
    );

    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

    async function handlePickImage() {
        setUploadError('');
        Haptics.selectionAsync();

        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            setUploadError('Photo library permission is required to change your picture');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1], // square crop, matches the circular avatar display
            quality: 0.7,   // compress before upload — faster on mobile data
        });

        if (result.canceled) return;

        const localUri = result.assets[0].uri;

        setUploading(true);
        try {
            const cloudinaryUrl = await uploadImageToCloudinary(localUri);
            await axiosInstance.patch('/api/student/profile-picture', { url: cloudinaryUrl });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await refetch(); // pulls the new profilePicture into `data`
        } catch (err) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            if (axios.isAxiosError(err) && err.response) {
                setUploadError(err.response.data?.message || 'Failed to save photo');
            } else if (err instanceof Error) {
                setUploadError(err.message);
            } else {
                setUploadError('Failed to upload photo');
            }
        } finally {
            setUploading(false);
        }
    }

    if (loading) return <Loader />;

    const profile = data?.profile;
    const initial = (profile?.fullName?.[0] ?? 'S').toUpperCase();
    const displayName = profile?.fullName ?? 'Student';

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
                    <Text className="text-3xl font-bold text-ink">Profile</Text>
                    <Text className="text-sm text-muted mt-1">
                        Your personal information
                    </Text>
                </Animated.View>

                {error && !profile ? (
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
                        {/* ─────── Avatar Hero Card ─────── */}
                        <Animated.View entering={FadeInUp.delay(150).duration(500).springify()}>
                            <LinearGradient
                                colors={['#FFDD1F', '#F58634']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{
                                    borderRadius: 28,
                                    paddingTop: 24,
                                    paddingBottom: 22,
                                    paddingHorizontal: 22,
                                    marginBottom: 20,
                                    alignItems: 'center',
                                    shadowColor: '#F58634',
                                    shadowOffset: { width: 0, height: 10 },
                                    shadowOpacity: 0.35,
                                    shadowRadius: 22,
                                    elevation: 8,
                                }}
                            >
                                {/* Avatar with white ring */}
                                <View
                                    style={{
                                        borderWidth: 3,
                                        borderColor: 'rgba(255,255,255,0.7)',
                                        borderRadius: 999,
                                        overflow: 'hidden',
                                        marginBottom: 12,
                                    }}
                                >
                                    <Avatar
                                        uri={profile?.profilePicture}
                                        name={profile?.fullName}
                                        size={96}
                                    />
                                </View>

                                {/* Camera button (floating) */}
                                <Pressable
                                    onPress={handlePickImage}
                                    disabled={uploading}
                                    hitSlop={10}
                                    className="-mt-9 mb-3 self-end"
                                    style={{
                                        marginRight: 90,
                                        width: 34,
                                        height: 34,
                                        borderRadius: 999,
                                        backgroundColor: '#000000',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderWidth: 2,
                                        borderColor: '#FFFFFF',
                                        opacity: uploading ? 0.5 : 1,
                                    }}
                                >
                                    <Ionicons
                                        name={uploading ? 'cloud-upload-outline' : 'camera'}
                                        size={16}
                                        color="#FFFFFF"
                                    />
                                </Pressable>

                                <Text className="text-xl font-bold text-ink">
                                    {displayName}
                                </Text>
                                <Text
                                    className="text-xs text-ink/70 mt-1"
                                    numberOfLines={1}
                                >
                                    {profile?.email ?? ''}
                                </Text>

                                {profile?.course ? (
                                    <View
                                        className="mt-3 px-3 py-1 rounded-full flex-row items-center"
                                        style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}
                                    >
                                        <Ionicons
                                            name="school-outline"
                                            size={12}
                                            color="#000000"
                                        />
                                        <Text className="text-xs font-semibold text-ink ml-1.5">
                                            {profile.course}
                                            {profile.semester ? ` · Sem ${profile.semester}` : ''}
                                        </Text>
                                    </View>
                                ) : null}
                            </LinearGradient>

                            {/* Upload error pill */}
                            {uploadError ? (
                                <Animated.View
                                    entering={FadeInUp.duration(300)}
                                    className="flex-row items-center bg-danger/10 rounded-lg px-3 py-2 mb-4"
                                >
                                    <Ionicons name="alert-circle" size={16} color="#dc2626" />
                                    <Text className="text-danger text-sm ml-2 flex-1">
                                        {uploadError}
                                    </Text>
                                </Animated.View>
                            ) : null}
                        </Animated.View>

                        {/* ─────── Personal Info ─────── */}
                        <Section title="PERSONAL" delay={250}>
                            <InfoRow
                                icon="person-outline"
                                label="Full Name"
                                value={profile?.fullName ?? ''}
                            />
                            <InfoRow
                                icon="mail-outline"
                                label="Email"
                                value={profile?.email ?? ''}
                            />
                            <InfoRow
                                icon="call-outline"
                                label="Contact Number"
                                value={profile?.contactNumber ?? ''}
                            />
                            <InfoRow
                                icon="male-female-outline"
                                label="Gender"
                                value={profile?.gender ?? ''}
                            />
                            <InfoRow
                                icon="calendar-outline"
                                label="Date of Birth"
                                value={formatDate(profile?.dateOFBirth ?? '')}
                            />
                        </Section>

                        {/* ─────── Academic Info ─────── */}
                        <Section title="ACADEMIC" delay={350}>
                            <InfoRow
                                icon="book-outline"
                                label="Course"
                                value={profile?.course ?? ''}
                            />
                            <InfoRow
                                icon="layers-outline"
                                label="Semester"
                                value={profile?.semester ?? ''}
                            />
                            <InfoRow
                                icon="calendar-number-outline"
                                label="Admission Date"
                                value={formatDate(profile?.admissionDate ?? '')}
                            />
                        </Section>

                        {/* ─────── Family Info ─────── */}
                        <Section title="FAMILY" delay={450}>
                            <InfoRow
                                icon="heart-outline"
                                label="Mother's Name"
                                value={profile?.motherName ?? ''}
                            />
                            <InfoRow
                                icon="person-add-outline"
                                label="Father's Name"
                                value={profile?.fatherName ?? ''}
                            />
                        </Section>

                        {/* ─────── Log Out ─────── */}
                        <Animated.View entering={FadeInUp.delay(550).duration(500).springify()}>
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
                )}
            </ScrollView>
        </SafeAreaView>
    );
}