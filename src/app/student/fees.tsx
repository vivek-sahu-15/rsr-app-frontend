import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useApi } from '../../hooks/useApi';
import type { FeesResponse } from '../../types/api';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

function formatDate(dateString: string): string {
    if (!dateString) return '—';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

// Format currency with Indian numbering (₹ 1,23,456)
function formatCurrency(value: number): string {
    return value.toLocaleString('en-IN');
}

export default function FeesScreen() {
    const { data, loading, refreshing, error, refetch } = useApi<FeesResponse>('/api/student/fees');

    if (loading) return <Loader />;

    const summary = data?.summary;
    const totalAmount = summary?.totalAmount ?? 0;
    const paidAmount = summary?.paid ?? 0;
    const pendingAmount = summary?.pending ?? 0;
    const paidPercent = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

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
                    <Text className="text-3xl font-bold text-ink">Fees</Text>
                    <Text className="text-sm text-muted mt-1">
                        Track your payments and dues
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
                        {/* ─────── Summary Card ─────── */}
                        <Animated.View entering={FadeInUp.delay(150).duration(500).springify()}>
                            <LinearGradient
                                colors={['#FFDD1F', '#F58634']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{
                                    borderRadius: 28,
                                    padding: 22,
                                    marginBottom: 24,
                                    shadowColor: '#F58634',
                                    shadowOffset: { width: 0, height: 10 },
                                    shadowOpacity: 0.35,
                                    shadowRadius: 22,
                                    elevation: 8,
                                }}
                            >
                                <View className="flex-row items-center justify-between mb-1">
                                    <Text className="text-xs font-semibold text-ink/70 tracking-widest">
                                        TOTAL FEES
                                    </Text>
                                    <View
                                        className="px-2.5 py-1 rounded-full"
                                        style={{ backgroundColor: 'rgba(0,0,0,0.12)' }}
                                    >
                                        <Text className="text-xs font-bold text-ink">
                                            {paidPercent}% paid
                                        </Text>
                                    </View>
                                </View>

                                <View className="flex-row items-end mb-5">
                                    <Text className="text-3xl font-bold text-ink">₹</Text>
                                    <Text className="text-5xl font-bold text-ink ml-1">
                                        {formatCurrency(totalAmount)}
                                    </Text>
                                </View>

                                {/* Progress bar */}
                                <View
                                    className="h-2.5 rounded-full overflow-hidden mb-5"
                                    style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}
                                >
                                    <View
                                        style={{
                                            width: `${Math.min(paidPercent, 100)}%`,
                                            height: '100%',
                                            backgroundColor: '#000000',
                                            borderRadius: 999,
                                        }}
                                    />
                                </View>

                                {/* Mini stats row */}
                                <View className="flex-row">
                                    <View className="flex-1">
                                        <View className="flex-row items-center mb-1">
                                            <View className="w-2 h-2 rounded-full bg-ink mr-1.5" />
                                            <Text className="text-xs font-semibold text-ink/70">
                                                PAID
                                            </Text>
                                        </View>
                                        <Text className="text-lg font-bold text-ink">
                                            ₹{formatCurrency(paidAmount)}
                                        </Text>
                                    </View>
                                    <View className="flex-1">
                                        <View className="flex-row items-center mb-1">
                                            <View className="w-2 h-2 rounded-full bg-ink/40 mr-1.5" />
                                            <Text className="text-xs font-semibold text-ink/70">
                                                PENDING
                                            </Text>
                                        </View>
                                        <Text className="text-lg font-bold text-ink">
                                            ₹{formatCurrency(pendingAmount)}
                                        </Text>
                                    </View>
                                </View>
                            </LinearGradient>
                        </Animated.View>

                        {/* ─────── Fee Records ─────── */}
                        {!data || data.fees.length === 0 ? (
                            <EmptyState message="No fee records yet" />
                        ) : (
                            <>
                                <View className="flex-row items-center justify-between mb-3 ml-1">
                                    <Text className="text-xs font-semibold text-muted tracking-widest">
                                        TRANSACTIONS
                                    </Text>
                                    <View className="bg-surfaceAlt rounded-full px-3 py-1">
                                        <Text className="text-xs font-semibold text-muted">
                                            {data.fees.length}
                                        </Text>
                                    </View>
                                </View>

                                {data.fees.map((fee, index) => {
                                    const isPaid = fee.status === 'paid';
                                    const accent = isPaid ? '#16a34a' : '#dc2626';
                                    const accentSoft = isPaid ? '#16a34a15' : '#dc262615';
                                    const icon = isPaid
                                        ? ('checkmark-circle' as const)
                                        : ('time' as const);

                                    return (
                                        <Animated.View
                                            key={fee.id}
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
                                                <View className="flex-row items-center">
                                                    <View
                                                        className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
                                                        style={{ backgroundColor: accentSoft }}
                                                    >
                                                        <Ionicons
                                                            name={icon}
                                                            size={22}
                                                            color={accent}
                                                        />
                                                    </View>

                                                    <View className="flex-1">
                                                        <Text className="text-lg font-bold text-ink">
                                                            ₹{formatCurrency(fee.amount)}
                                                        </Text>
                                                        <View className="flex-row items-center mt-1">
                                                            <Ionicons
                                                                name="calendar-outline"
                                                                size={12}
                                                                color="#8A8A8A"
                                                            />
                                                            <Text className="text-xs text-muted ml-1">
                                                                Due {formatDate(fee.due_date)}
                                                            </Text>
                                                        </View>
                                                    </View>

                                                    <View
                                                        className="rounded-full px-3 py-1.5 flex-row items-center"
                                                        style={{ backgroundColor: accentSoft }}
                                                    >
                                                        <View
                                                            className="w-1.5 h-1.5 rounded-full mr-1.5"
                                                            style={{ backgroundColor: accent }}
                                                        />
                                                        <Text
                                                            className="text-xs font-bold capitalize"
                                                            style={{ color: accent }}
                                                        >
                                                            {fee.status}
                                                        </Text>
                                                    </View>
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