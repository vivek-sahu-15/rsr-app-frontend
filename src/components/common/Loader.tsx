import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSequence,
    withTiming,
    withDelay,
    withRepeat,
    Easing,
    cancelAnimation,
} from 'react-native-reanimated';

// ─────────────────────────────────────────────
// Grid constants — map 1:1 to the CSS variables
// --square: 26px  → SQUARE
// --offset: 30px  → OFFSET
// --duration: 2.4s → DURATION_MS
// --delay: 0.2s    → DELAY_MS
// --in-duration: 0.4s → IN_DURATION_MS
// --in-delay: 0.1s    → IN_DELAY_MS
// ─────────────────────────────────────────────
const SQUARE = 26;
const OFFSET = 30;
const DURATION_MS = 2400;
const DELAY_MS = 200;
const IN_DURATION_MS = 400;
const IN_DELAY_MS = 100;

const STAGE_WIDTH = 3 * OFFSET + SQUARE; // 116
const STAGE_HEIGHT = 2 * OFFSET + SQUARE; // 86

// Grid position helper: left = col * OFFSET, top = row * OFFSET
const pos = (col: number, row: number) => ({
    x: col * OFFSET,
    y: row * OFFSET,
});

// Helper: build a keyframe sequence from an array of grid positions.
// Percentages are converted to milliseconds relative to DURATION_MS.
// `easing` is applied per step for a smooth slide.
function buildKeyframes(
    steps: Array<{ at: number; col: number; row: number }>,
    easing = Easing.inOut(Easing.ease)
) {
    // Start with the first step's position (from 0%)
    const [, ...rest] = steps;
    let seq: any[] = [];
    let lastTime = steps[0].at;

    for (const step of rest) {
        const duration = ((step.at - lastTime) / 100) * DURATION_MS;
        const target = pos(step.col, step.row);
        seq.push(withTiming(target.x, { duration, easing }));
        seq.push(withTiming(target.y, { duration, easing }));
        lastTime = step.at;
    }

    return seq;
}

// ─────────────────────────────────────────────
// One animated square
// ─────────────────────────────────────────────
function Square({
    initial,
    frames,
    fadeInDelay,
}: {
    initial: { x: number; y: number };
    frames: Array<{ at: number; col: number; row: number }>;
    fadeInDelay: number;
}) {
    const x = useSharedValue(initial.x);
    const y = useSharedValue(initial.y);
    const scale = useSharedValue(0.75);
    const opacity = useSharedValue(0);

    useEffect(() => {
        // Fade-in first
        opacity.value = withDelay(
            fadeInDelay,
            withTiming(1, { duration: IN_DURATION_MS, easing: Easing.out(Easing.ease) })
        );
        scale.value = withDelay(
            fadeInDelay,
            withTiming(1, { duration: IN_DURATION_MS, easing: Easing.out(Easing.ease) })
        );

        // Build & start the looped animation
        const seq = buildKeyframes(frames);

        // Seed to the first frame
        x.value = initial.x;
        y.value = initial.y;

        x.value = withDelay(DELAY_MS, withRepeat(withSequence(...seq), -1, false));
        y.value = withDelay(
            DELAY_MS,
            withRepeat(
                withSequence(...seq.map((s) => s)), // uses same duration stack
                -1,
                false
            )
        );

        return () => {
            cancelAnimation(x);
            cancelAnimation(y);
            cancelAnimation(scale);
            cancelAnimation(opacity);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: x.value },
            { translateY: y.value },
            { scale: scale.value },
        ],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                {
                    position: 'absolute',
                    width: SQUARE,
                    height: SQUARE,
                    borderRadius: 6,
                    backgroundColor: '#F58634',
                },
                animatedStyle,
            ]}
        />
    );
}

// ─────────────────────────────────────────────
// The Loader itself
// ─────────────────────────────────────────────
export default function Loader() {
    // We need to run X and Y on the same timing stack.
    // Reanimated doesn't easily support "same duration for X and Y per step",
    // so we combine both into a single shared value pair using useDerivedValue.
    //
    // Simpler approach: build ONE shared value that holds {x, y} and animate
    // the whole pair using withSequence of withTiming on separate shared values
    // via `useAnimatedReaction` — but that adds complexity.
    //
    // The cleanest path is to have each square run two parallel withRepeat loops
    // (one for X, one for Y) with identical timings. That's what Square does.
    //
    // Below, we simply declare the frame data for each square matching the
    // original CSS keyframes exactly.

    // Square 1 — 0%:(0,0) → 8.333%:(0,1) → hold to 100%
    const square1Frames = [
        { at: 0, col: 0, row: 0 },
        { at: 8.333, col: 0, row: 1 },
        { at: 100, col: 0, row: 1 },
    ];

    // Square 2 — (0,1) → (0,2) → (1,2) → (1,1) hold → (1,0) → (0,0)
    const square2Frames = [
        { at: 0, col: 0, row: 1 },
        { at: 8.333, col: 0, row: 2 },
        { at: 16.67, col: 1, row: 2 },
        { at: 25, col: 1, row: 1 },
        { at: 83.33, col: 1, row: 1 },
        { at: 91.67, col: 1, row: 0 },
        { at: 100, col: 0, row: 0 },
    ];

    // Square 3 — (1,1) → (1,0) → (2,0) → (2,1) hold → (2,2) → (1,2) → (1,1)
    const square3Frames = [
        { at: 0, col: 1, row: 1 },
        { at: 16.67, col: 1, row: 1 },
        { at: 25, col: 1, row: 0 },
        { at: 33.33, col: 2, row: 0 },
        { at: 41.67, col: 2, row: 1 },
        { at: 66.67, col: 2, row: 1 },
        { at: 75, col: 2, row: 2 },
        { at: 83.33, col: 1, row: 2 },
        { at: 91.67, col: 1, row: 1 },
        { at: 100, col: 1, row: 1 },
    ];

    // Square 4 — (2,1) hold → (2,2) → (3,2) → (3,1) hold
    const square4Frames = [
        { at: 0, col: 2, row: 1 },
        { at: 33.33, col: 2, row: 1 },
        { at: 41.67, col: 2, row: 2 },
        { at: 50, col: 3, row: 2 },
        { at: 58.33, col: 3, row: 1 },
        { at: 100, col: 3, row: 1 },
    ];

    // Square 5 — (3,1) hold → (3,0) → (2,0) → (2,1) hold
    const square5Frames = [
        { at: 0, col: 3, row: 1 },
        { at: 50, col: 3, row: 1 },
        { at: 58.33, col: 3, row: 0 },
        { at: 66.67, col: 2, row: 0 },
        { at: 75, col: 2, row: 1 },
        { at: 100, col: 2, row: 1 },
    ];

    return (
        <View
            style={{
                width: STAGE_WIDTH,
                height: STAGE_HEIGHT,
                position: 'relative',
                alignSelf: 'center',
                marginTop: 10,
                marginBottom: 30,
            }}
        >
            <Square initial={pos(0, 0)} frames={square1Frames} fadeInDelay={1 * IN_DELAY_MS} />
            <Square initial={pos(0, 1)} frames={square2Frames} fadeInDelay={1 * IN_DELAY_MS} />
            <Square initial={pos(1, 1)} frames={square3Frames} fadeInDelay={2 * IN_DELAY_MS} />
            <Square initial={pos(2, 1)} frames={square4Frames} fadeInDelay={3 * IN_DELAY_MS} />
            <Square initial={pos(3, 1)} frames={square5Frames} fadeInDelay={4 * IN_DELAY_MS} />
        </View>
    );
}