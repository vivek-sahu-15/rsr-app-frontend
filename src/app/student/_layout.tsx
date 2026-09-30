import { Tabs } from 'expo-router';
import FloatingTabBar, { type TabMeta } from '../../components/common/FloatingTabBar';

const STUDENT_TABS: Record<string, TabMeta> = {
    dashboard: { icon: 'home', label: 'Home' },
    attendance: { icon: 'checkmark-done', label: 'Attend' },
    timetable: { icon: 'calendar', label: 'Schedule' },
    profile: { icon: 'person', label: 'Profile' },
};

export default function StudentLayout() {
    return (
        <Tabs
            tabBar={(props) => <FloatingTabBar {...props} tabMeta={STUDENT_TABS} />}
            screenOptions={{ headerShown: false }}
        >
            <Tabs.Screen name="dashboard" options={{ title: 'Home' }} />
            <Tabs.Screen name="attendance" options={{ title: 'Attendance' }} />
            <Tabs.Screen name="timetable" options={{ title: 'Timetable' }} />
            <Tabs.Screen name="profile" options={{ title: 'Profile' }} />

            {/* These screens exist as routes (opened from the dashboard) but
                don't get their own tab — href: null removes them from the bar */}
            <Tabs.Screen name="syllabus" options={{ href: null }} />
            <Tabs.Screen name="fees" options={{ href: null }} />
            <Tabs.Screen name="notices" options={{ href: null }} />
        </Tabs>
    );
}