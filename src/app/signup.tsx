import { ScrollView, Text, TextInput, View, Pressable, Platform } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons';
import * as Haptics from 'expo-haptics';
import Animated, {
    FadeInDown,
    FadeInUp,
    FadeIn,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import { useAuth, type Role, type SignupPayload } from '../context/AuthContext';
import Button from '../components/common/Button';
import DateField from '../components/common/DateField';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Signup() {
    const { signup } = useAuth();

    const [role, setRole] = useState<Role>('student');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Shared fields
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [contactNumber, setContactNumber] = useState('');

    // Student-only fields
    const [course, setCourse] = useState('');
    const [semester, setSemester] = useState('');
    const [admissionDate, setAdmissionDate] = useState('');
    const [dateOFBirth, setDateOFBirth] = useState('');
    const [gender, setGender] = useState('');
    const [motherName, setMotherName] = useState('');
    const [fatherName, setFatherName] = useState('');

    // Teacher-only field
    const [subject, setSubject] = useState('');

    // Press animation for link
    const linkScale = useSharedValue(1);
    const linkAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: linkScale.value }],
    }));

    async function handleSignup() {
        if (!fullName || !email || !password) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            setError('Name, email and password are required');
            return;
        }

        const payload: SignupPayload = {
            email,
            password,
            role,
            fullName,
            contactNumber,
            ...(role === 'student'
                ? { course, semester, admissionDate, dateOFBirth, gender, motherName, fatherName }
                : { subject }),
        };

        setError('');
        setSubmitting(true);
        try {
            await signup(payload);
            // No navigation call here — _layout.tsx's guards react to `user`
            // changing and switch to the student/teacher section automatically.
        } catch (err) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setError(err instanceof Error ? err.message : 'Signup failed');
        } finally {
            setSubmitting(false);
        }
    }

    function handleRoleChange(nextRole: Role) {
        if (nextRole !== role) {
            Haptics.selectionAsync();
            setRole(nextRole);
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Soft branded glow at the top */}
            <View className="absolute top-0 left-0 right-0 h-80 overflow-hidden">
                <LinearGradient
                    colors={['#FFDD1F33', '#F5863411', '#FFFFFF00']}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={{ flex: 1 }}
                />
            </View>

            <ScrollView
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
                className="bg-transparent"
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}
                automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
            >
                <View className="flex-1 px-6 pt-8 pb-10">
                    {/* ───── Logo ───── */}
                    <Animated.View
                        entering={FadeInDown.duration(600).springify()}
                        className="items-center mb-4"
                    >
                        <View
                            className="w-20 h-20 rounded-3xl items-center justify-center mb-3"
                            style={{
                                backgroundColor: '#FFFFFF',
                                shadowColor: '#F58634',
                                shadowOffset: { width: 0, height: 10 },
                                shadowOpacity: 0.25,
                                shadowRadius: 20,
                                elevation: 10,
                            }}
                        >
                            <Image
                                source={require('../../assets/images/logo.png')}
                                style={{ width: 52, height: 52 }}
                                contentFit="contain"
                                transition={300}
                            />
                        </View>
                    </Animated.View>

                    {/* ───── Heading ───── */}
                    <Animated.View entering={FadeInDown.delay(100).duration(600).springify()}>
                        <Text className="text-3xl font-bold text-center text-ink mb-2">
                            Create Account
                        </Text>
                        <Text className="text-sm text-muted text-center mb-6">
                            Sign up as a student or teacher
                        </Text>
                    </Animated.View>

                    {/* ───── Role toggle ───── */}
                    <Animated.View entering={FadeInUp.delay(200).duration(500).springify()}>
                        <View
                            collapsable={false}
                            className="flex-row mb-6 p-1 rounded-2xl"
                            style={{
                                backgroundColor: '#F5F5F5',
                                borderWidth: 1,
                                borderColor: '#EAEAEA',
                            }}
                        >
                            <RoleTab
                                label="Student"
                                icon="school-outline"
                                active={role === 'student'}
                                onPress={() => handleRoleChange('student')}
                            />
                            <RoleTab
                                label="Teacher"
                                icon="briefcase-outline"
                                active={role === 'teacher'}
                                onPress={() => handleRoleChange('teacher')}
                            />
                        </View>
                    </Animated.View>

                    {/* ───── Shared fields ───── */}
                    <Animated.View entering={FadeInUp.delay(300).duration(500).springify()}>
                        <Field
                            label="FULL NAME"
                            icon="person-outline"
                            value={fullName}
                            onChangeText={setFullName}
                            placeholder="Vivek Kumar Sahu"
                            autoCapitalize="words"
                        />
                        <Field
                            label="EMAIL"
                            icon="mail-outline"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="you@rungtacolleges.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <Field
                            label="PASSWORD"
                            icon="lock-closed-outline"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="••••••••"
                            secureTextEntry
                            autoCapitalize="none"
                        />
                        <Field
                            label="CONTACT NUMBER"
                            icon="call-outline"
                            value={contactNumber}
                            onChangeText={setContactNumber}
                            placeholder="1234567890"
                            keyboardType="phone-pad"
                        />
                    </Animated.View>

                    {/* ───── Role-specific fields ───── */}
                    {role === 'student' ? (
                        <Animated.View entering={FadeInUp.duration(400).springify()}>
                            <Field
                                label="COURSE"
                                icon="book-outline"
                                value={course}
                                onChangeText={setCourse}
                                placeholder="CS"
                            />
                            <Field
                                label="SEMESTER"
                                icon="layers-outline"
                                value={semester}
                                onChangeText={setSemester}
                                placeholder="7"
                                keyboardType="phone-pad"
                            />
                            <DateField
                                label="Admission Date"
                                value={admissionDate}
                                onChange={setAdmissionDate}
                                maximumDate={new Date()}
                            />
                            <DateField
                                label="Date of Birth"
                                value={dateOFBirth}
                                onChange={setDateOFBirth}
                                maximumDate={new Date()}
                                minimumDate={new Date(1970, 0, 1)}
                            />
                            <Field
                                label="GENDER"
                                icon="male-female-outline"
                                value={gender}
                                onChangeText={setGender}
                                placeholder="Male"
                                autoCapitalize="words"
                            />
                            <Field
                                label="MOTHER'S NAME"
                                icon="heart-outline"
                                value={motherName}
                                onChangeText={setMotherName}
                                placeholder="Optional"
                                autoCapitalize="words"
                            />
                            <Field
                                label="FATHER'S NAME"
                                icon="person-add-outline"
                                value={fatherName}
                                onChangeText={setFatherName}
                                placeholder="Optional"
                                autoCapitalize="words"
                            />
                        </Animated.View>
                    ) : (
                        <Animated.View entering={FadeInUp.duration(400).springify()}>
                            <Field
                                label="SUBJECT"
                                icon="library-outline"
                                value={subject}
                                onChangeText={setSubject}
                                placeholder="DBMS"
                            />
                        </Animated.View>
                    )}

                    {/* ───── Error ───── */}
                    {error ? (
                        <Animated.View
                            entering={FadeIn.duration(300)}
                            className="flex-row items-center bg-danger/10 rounded-lg px-3 py-2 mb-3 mt-1"
                        >
                            <Ionicons name="alert-circle" size={16} color="#dc2626" />
                            <Text className="text-danger text-sm ml-2 flex-1">{error}</Text>
                        </Animated.View>
                    ) : null}

                    {/* ───── Button ───── */}
                    <Animated.View entering={FadeInUp.delay(400).duration(500).springify()}>
                        <Button
                            label="Sign Up"
                            loading={submitting}
                            onPress={handleSignup}
                            className="mt-2"
                        />
                    </Animated.View>

                    {/* ───── Login link ───── */}
                    <Animated.View
                        entering={FadeInUp.delay(500).duration(500).springify()}
                        className="mt-8 items-center"
                    >
                        <View className="flex-row items-center">
                            <Text className="text-sm text-muted">Already have an account? </Text>
                            <Link href="/login" asChild>
                                <AnimatedPressable
                                    onPressIn={() => {
                                        linkScale.value = withSpring(0.94);
                                        Haptics.selectionAsync();
                                    }}
                                    onPressOut={() => {
                                        linkScale.value = withSpring(1);
                                    }}
                                    style={linkAnimatedStyle}
                                >
                                    <Text className="text-sm font-bold text-secondary">
                                        Log in
                                    </Text>
                                </AnimatedPressable>
                            </Link>
                        </View>
                    </Animated.View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// ─────────────────────────────────────────────
// Role tab button
// ─────────────────────────────────────────────
interface RoleTabProps {
    label: string;
    icon: string;
    active: boolean;
    onPress: () => void;
}

function RoleTab({ label, icon, active, onPress }: RoleTabProps) {
    return (
        <Pressable
            onPress={onPress}
            className="flex-1 py-3 items-center rounded-xl flex-row justify-center"
            style={{
                backgroundColor: active ? '#FFDD1F' : 'transparent',
                shadowColor: active ? '#FFDD1F' : 'transparent',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: active ? 0.4 : 0,
                shadowRadius: 10,
                elevation: active ? 4 : 0,
            }}
        >
            <Ionicons
                name={icon as any}
                size={16}
                color={active ? '#000000' : '#8A8A8A'}
            />
            <Text
                className={`ml-2 ${active ? 'text-ink font-bold' : 'text-muted font-medium'}`}
                style={{ fontSize: 14 }}
            >
                {label}
            </Text>
        </Pressable>
    );
}

// ─────────────────────────────────────────────
// Input field with icon, label & animated focus
// ─────────────────────────────────────────────
interface FieldProps {
    label: string;
    icon: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address' | 'phone-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words';
}

function Field({
    label,
    icon,
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    keyboardType,
    autoCapitalize,
}: FieldProps) {
    const [focused, setFocused] = useState(false);
    const [visible, setVisible] = useState(false);

    return (
        <View className="mb-4">
            <Text className="text-xs font-semibold text-muted mb-2 ml-1 tracking-wide">
                {label}
            </Text>
            <View
                collapsable={false}
                className="flex-row items-center bg-surfaceAlt rounded-xl px-4"
                style={{
                    borderWidth: 1.5,
                    borderColor: focused ? '#F58634' : '#EAEAEA',
                    shadowColor: focused ? '#F58634' : 'transparent',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: focused ? 0.15 : 0,
                    shadowRadius: 8,
                    elevation: focused ? 3 : 0,
                }}
            >
                <Ionicons
                    name={icon as any}
                    size={18}
                    color={focused ? '#F58634' : '#8A8A8A'}
                />
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    secureTextEntry={secureTextEntry && !visible}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholderTextColor="#B0B0B0"
                    className="flex-1 py-3.5 ml-3 text-ink"
                    style={{ fontSize: 15 }}
                />
                {secureTextEntry ? (
                    <Pressable onPress={() => setVisible((v) => !v)} hitSlop={10}>
                        <Ionicons
                            name={visible ? 'eye-off-outline' : 'eye-outline'}
                            size={18}
                            color="#8A8A8A"
                        />
                    </Pressable>
                ) : null}
            </View>
        </View>
    );
}