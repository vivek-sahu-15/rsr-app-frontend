import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface DateFieldProps {
    label: string;
    value: string; // 'YYYY-MM-DD' or ''
    onChange: (isoDate: string) => void;
    maximumDate?: Date;
    minimumDate?: Date;
}

// Formats as YYYY-MM-DD using LOCAL date parts, not toISOString(). toISOString()
// converts to UTC first, which can silently shift the date by a day depending
// on the device's timezone — exactly the kind of bug that's hard to notice
// while testing and shows up later as a wrong date in the database.
function toDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDisplay(dateString: string): string {
    if (!dateString) return 'Select date';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

export default function DateField({ label, value, onChange, maximumDate, minimumDate }: DateFieldProps) {
    const [showPicker, setShowPicker] = useState(false);

    const dateValue = value ? new Date(`${value}T00:00:00`) : new Date();

    function handleChange(event: DateTimePickerEvent, selectedDate?: Date) {
        // Android's picker is a dialog that closes itself; iOS's is inline
        // and stays open, so only auto-hide on Android
        if (Platform.OS === 'android') {
            setShowPicker(false);
        }
        if (event.type === 'set' && selectedDate) {
            onChange(toDateString(selectedDate));
        }
    }

    return (
        <View className="mb-4">
            <Text className="text-sm text-muted mb-1">{label}</Text>

            <Pressable
                onPress={() => setShowPicker(true)}
                className="border border-border rounded-xl px-4 py-3"
            >
                <Text className={value ? 'text-black' : 'text-muted'}>{formatDisplay(value)}</Text>
            </Pressable>

            {showPicker && (
                <DateTimePicker
                    value={dateValue}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleChange}
                    maximumDate={maximumDate}
                    minimumDate={minimumDate}
                     onDismiss={() => {
       
    }}
                />
            )}

            {/* iOS's spinner has no built-in confirm button when used inline,
                so give it one explicitly */}
            {Platform.OS === 'ios' && showPicker && (
                <Pressable onPress={() => setShowPicker(false)} className="self-end mt-2">
                    <Text className="text-primary font-semibold">Done</Text>
                </Pressable>
            )}
        </View>
    );
}