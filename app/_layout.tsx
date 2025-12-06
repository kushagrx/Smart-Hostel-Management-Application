import { Stack } from "expo-router";
import { useEffect } from 'react';
import { setStoredUser } from '../utils/authUtils';

export default function RootLayout() {
  // In dev mode, ensure there's a quick admin user available (non-persistent if AsyncStorage not registered)
  useEffect(() => {
    if (__DEV__) {
      (async () => {
        try {
          await setStoredUser({ id: 'dev-admin', name: 'Admin (dev)', role: 'admin' });
        } catch (e) {
          // ignore
        }
      })();
    }
  }, []);

  return <Stack>
    <Stack.Screen name="(tabs)" 
    options={{ headerShown: false }} />
  </Stack>;
}
