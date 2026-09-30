import { Text, View } from 'react-native';

interface EmptyStateProps {
    message: string;
    /** Optional short sub-line, e.g. "Check back after your teacher posts one" */
    hint?: string;
}

export default function EmptyState({ message, hint }: EmptyStateProps) {
    return (
        <View className="flex-1 items-center justify-center px-8 py-16">
            <Text className="text-base font-medium text-muted text-center">{message}</Text>
            {hint ? (
                <Text className="mt-1 text-sm text-muted/70 text-center">{hint}</Text>
            ) : null}
        </View>
    );
}