import { Stack } from "expo-router";
import { useEffect } from "react";
import { setStoredUser } from "../utils/authUtils";
import { ThemeProvider } from "../utils/ThemeContext";

export default function RootLayout() {
  // In dev mode, ensure there's a quick admin user available
  useEffect(() => {
    if (__DEV__) {
      (async () => {
        try {
          await setStoredUser({
            id: "dev-admin",
            name: "Admin (dev)",
            role: "admin",
          });
        } catch (e) {
          // ignore
        }
      })();
    }
  }, []);

  return (
    <ThemeProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
