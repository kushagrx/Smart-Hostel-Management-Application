import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AlertProvider } from "../context/AlertContext";
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" backgroundColor="transparent" translucent={true} />
      <ThemeProvider>
        <AlertProvider>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="admin" options={{ headerShown: false }} />
          </Stack>
        </AlertProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
