import { Stack } from 'expo-router';
import React from 'react';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="students" options={{ headerShown: false }} />
      <Stack.Screen name="rooms" options={{ headerShown: false }} />
      <Stack.Screen name="complaints" options={{ headerShown: false }} />
      <Stack.Screen name="leaveRequests" options={{ headerShown: false }} />
      <Stack.Screen name="notices" options={{ headerShown: false }} />
      <Stack.Screen name="busTimings" options={{ headerShown: false }} />
      <Stack.Screen name="messMenu" options={{ headerShown: false }} />
    </Stack>
  );
}
