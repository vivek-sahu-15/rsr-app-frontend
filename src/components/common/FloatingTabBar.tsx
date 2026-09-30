import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import * as Haptics from 'expo-haptics';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ACTIVE_YELLOW = '#FFDD1F';
const INACTIVE_GRAY = '#9A9A9A';

export type IconName =
    | 'home'
    | 'checkmark-done'
    | 'calendar'
    | 'person'
    | 'people';

export interface TabMeta {
    icon: IconName;
    label: string;
}

interface TabButtonProps {
    focused: boolean;
    icon: IconName;
    label: string;
    onPress: () => void;
}

function TabButton({ focused, icon, label, onPress }: TabButtonProps) {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={() => {
                scale.value = withSpring(0.92, { damping: 15, stiffness: 400 });
            }}
            onPressOut={() => {
                scale.value = withSpring(1, { damping: 15, stiffness: 400 });
            }}
            style={animatedStyle}
            className="flex-1 items-center justify-center"
        >
            <View
                collapsable={false}
                className="items-center justify-center px-3 py-1 rounded-2xl"
                style={{
                    backgroundColor: focused ? ACTIVE_YELLOW : 'transparent',
                    shadowColor: focused ? ACTIVE_YELLOW : 'transparent',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: focused ? 0.5 : 0,
                    shadowRadius: 10,
                    elevation: focused ? 6 : 0,
                }}
            >
                <Ionicons
                    name={icon}
                    size={20}
                    color={focused ? '#000000' : INACTIVE_GRAY}
                />
                <Text
                    className={`text-[10px] mt-0.5 ${
                        focused ? 'text-ink font-bold' : 'text-muted font-medium'
                    }`}
                >
                    {label}
                </Text>
            </View>
        </AnimatedPressable>
    );
}

interface FloatingTabBarProps {
    state: any;
    navigation: any;
    tabMeta: Record<string, TabMeta>;
}

export default function FloatingTabBar({
    state,
    navigation,
    tabMeta,
}: FloatingTabBarProps) {
    const insets = useSafeAreaInsets();

    return (
        <View
            pointerEvents="box-none"
            style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: insets.bottom + 12,
                alignItems: 'center',
            }}
        >
            <View
                className="flex-row items-center bg-white"
                style={{
                    width: '88%',
                    height: 68,
                    borderRadius: 999,
                    paddingHorizontal: 6,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.15,
                    shadowRadius: 24,
                    elevation: 14,
                }}
            >
                {state.routes.map((route: any, index: number) => {
                    const meta = tabMeta[route.name];
                    if (!meta) return null;

                    const focused = state.index === index;

                    const onPress = () => {
                        Haptics.selectionAsync();
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });
                        if (!focused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    return (
                        <TabButton
                            key={route.key}
                            focused={focused}
                            icon={meta.icon}
                            label={meta.label}
                            onPress={onPress}
                        />
                    );
                })}
            </View>
        </View>
    );
}