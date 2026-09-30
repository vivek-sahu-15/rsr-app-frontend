import {
    ActivityIndicator,
    Pressable,
    Text,
    View,
    type PressableProps,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { twMerge } from 'tailwind-merge';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ButtonProps extends Omit<PressableProps, 'disabled'> {
    label: string;
    loading?: boolean;
    disabled?: boolean;
    variant?: 'primary' | 'secondary';
    className?: string;
    icon?: string;
    iconPosition?: 'left' | 'right';
}

export default function Button({
    label,
    loading = false,
    disabled = false,
    variant = 'primary',
    className,
    icon,
    iconPosition = 'left',
    onPress,
    ...rest
}: ButtonProps) {
    const isDisabled = loading || disabled;

    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        if (isDisabled) return;
        scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    };

    const handlePress = (e: any) => {
        if (isDisabled) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.(e);
    };

    // Shared classes
    const base =
        'flex-row items-center justify-center rounded-2xl py-3.5 px-5';

    // Variant-specific classes
    const variantClass = {
        primary: '',
        secondary: 'bg-white',
    };

    // Shadow styles applied inline so they sit under the gradient
    const shadowStyle =
        variant === 'primary'
            ? {
                  shadowColor: '#F58634',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.35,
                  shadowRadius: 16,
                  elevation: 8,
              }
            : {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.06,
                  shadowRadius: 10,
                  elevation: 2,
              };

    // Content (icon + label) rendered the same regardless of variant
    const content = loading ? (
        <ActivityIndicator
            color={variant === 'primary' ? '#000000' : '#F58634'}
        />
    ) : (
        <View className="flex-row items-center justify-center">
            {icon && iconPosition === 'left' ? (
                <Ionicons
                    name={icon as any}
                    size={18}
                    color={variant === 'primary' ? '#000000' : '#F58634'}
                    style={{ marginRight: 8 }}
                />
            ) : null}
            <Text
                className={twMerge(
                    'font-bold text-base',
                    variant === 'primary' ? 'text-ink' : 'text-secondary'
                )}
            >
                {label}
            </Text>
            {icon && iconPosition === 'right' ? (
                <Ionicons
                    name={icon as any}
                    size={18}
                    color={variant === 'primary' ? '#000000' : '#F58634'}
                    style={{ marginLeft: 8 }}
                />
            ) : null}
        </View>
    );

    // Secondary renders a plain Pressable with border; primary wraps in gradient
    if (variant === 'secondary') {
        return (
            <AnimatedPressable
                disabled={isDisabled}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={handlePress}
                style={[animatedStyle, shadowStyle]}
                className={twMerge(
                    base,
                    variantClass.secondary,
                    'border border-secondary',
                    isDisabled && 'opacity-50',
                    className
                )}
                {...rest}
            >
                {content}
            </AnimatedPressable>
        );
    }

    return (
        <AnimatedPressable
            disabled={isDisabled}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            style={[animatedStyle, shadowStyle]}
            className={twMerge(
                base,
                isDisabled && 'opacity-50',
                className
            )}
            {...rest}
        >
            {/* Gradient background inside the pressable */}
            <LinearGradient
                colors={['#FFDD1F', '#F58634']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: 16,
                }}
            />
            {content}
        </AnimatedPressable>
    );
}