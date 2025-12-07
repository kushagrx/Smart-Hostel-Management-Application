import { Stack } from "expo-router";
import { ThemeProvider } from "../utils/ThemeContext";

export default function RootLayout() {
  // In dev mode, ensure there's a quick admin user available
  // Commented out to test login flow - uncomment if you want auto-login in dev
  // useEffect(() => {
  //   if (__DEV__) {
  //     (async () => {
  //       try {
  //         await setStoredUser({
  //           id: "dev-admin",
  //           name: "Admin (dev)",
  //           role: "admin",
  //         });
  //       } catch (e) {
  //         // ignore
  //       }
  //     })();
  //   }
  // }, []);

  return (
    <ThemeProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="admin" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
