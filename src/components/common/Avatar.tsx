import { Image, Text, View } from 'react-native';

interface AvatarProps {
    uri?: string | null;
    name?: string;
    size?: number;
}

function getInitials(name?: string): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '');
    return initials.join('') || '?';
}

export default function Avatar({ uri, name, size = 72 }: AvatarProps) {
    const dimensions = { width: size, height: size, borderRadius: size / 2 };

    if (uri) {
        return <Image source={{ uri }} style={dimensions} />;
    }

    // No photo yet: colored circle with initials, so the UI never shows a
    // broken image icon for users who haven't uploaded one
    return (
        <View style={dimensions} className="bg-primary items-center justify-center">
            <Text style={{ fontSize: size * 0.36 }} className="text-white font-bold">
                {getInitials(name)}
            </Text>
        </View>
    );
}