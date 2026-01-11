import { Stack } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../utils/ThemeContext';

export default function AdminLayout() {
    const { colors } = useTheme();

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
                <Stack.Screen name="services" />
            </Stack>
        </View>
    );
}
