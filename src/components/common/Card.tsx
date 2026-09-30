import { View, type ViewProps } from 'react-native';
import { twMerge } from 'tailwind-merge';

interface CardProps extends ViewProps {
    className?: string;
    variant?: 'default' | 'outlined' | 'elevated';
}

// twMerge lets a screen override defaults (e.g. pass className="p-2") without
// the default "p-4" fighting it — plain string concatenation can't do that.
export default function Card({
    className,
    children,
    variant = 'default',
    style,
    ...rest
}: CardProps) {
    // Base visual classes — rounded, white, padded
    const base = 'rounded-2xl bg-white p-4';

    // Variant-specific classes
    const variants = {
        default: 'border border-border',
        outlined: 'border border-border bg-transparent',
        elevated: 'border border-transparent',
    };

    // Shadow applied via style (NativeWind v4 boxShadow support varies across
    // RN versions, so we set it explicitly here for cross-platform consistency)
    const shadowStyle =
        variant === 'elevated'
            ? {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.1,
                  shadowRadius: 20,
                  elevation: 6,
              }
            : variant === 'default'
            ? {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.06,
                  shadowRadius: 12,
                  elevation: 2,
              }
            : undefined; // outlined → no shadow

    return (
        <View
            className={twMerge(base, variants[variant], className)}
            style={[shadowStyle, style]}
            {...rest}
        >
            {children}
        </View>
    );
}