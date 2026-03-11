import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../utils/ThemeContext';


export default function AdminLayout() {
    const { colors } = useTheme();
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        if (!isLoading) {
            // Check if we are trying to access admin
            const inAdminTab = segments[0] === 'admin';
            if (inAdminTab && (!user || user.role !== 'admin')) {
                router.replace('/login');
            }
        }
    }, [user, isLoading, segments, router]);

    if (isLoading || (!user || user.role !== 'admin')) {
        return <View style={{ flex: 1, backgroundColor: colors.background }} />;
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <Stack
                screenOptions={{
                    headerShown: false,
                    gestureEnabled: true,
                    animation: 'slide_from_right',
                    contentStyle: { backgroundColor: colors.background },
                }}
            >
                <Stack.Screen name="index" />
                <Stack.Screen name="students" />
                <Stack.Screen name="rooms" />
                <Stack.Screen name="complaints" />
                <Stack.Screen name="leaveRequests" />
                <Stack.Screen name="notices" />
                <Stack.Screen name="busTimings" />
                <Stack.Screen name="messMenu" />
                <Stack.Screen name="laundry" />
                <Stack.Screen name="visitors" />
                <Stack.Screen name="facilities" />
                <Stack.Screen name="services" />
                <Stack.Screen
                    name="notifications"
                    options={{
                        presentation: 'transparentModal',
                        animation: 'fade',
                        headerShown: false
                    }}
                />
            </Stack>
        </View>
    );
}
