import { Tabs } from 'expo-router';
import FloatingTabBar, { type TabMeta } from '../../components/common/FloatingTabBar';

const TEACHER_TABS: Record<string, TabMeta> = {
    dashboard: { icon: 'home', label: 'Home' },
    attendance: { icon: 'checkmark-done', label: 'Attend' },
    timetable: { icon: 'calendar', label: 'Schedule' },
    students: { icon: 'people', label: 'Students' },
};

export default function TeacherLayout() {
    return (
        <Tabs
            tabBar={(props) => <FloatingTabBar {...props} tabMeta={TEACHER_TABS} />}
            screenOptions={{ headerShown: false }}
        >
            <Tabs.Screen name="dashboard" options={{ title: 'Home' }} />
            <Tabs.Screen name="attendance" options={{ title: 'Attendance' }} />
            <Tabs.Screen name="timetable" options={{ title: 'Timetable' }} />
            <Tabs.Screen name="students" options={{ title: 'Students' }} />

            {/* Hidden routes — reachable via router.push, no tab shown */}
            <Tabs.Screen name="notices" options={{ href: null }} />
            <Tabs.Screen name="profile" options={{ href: null }} />
        </Tabs>
    );
}