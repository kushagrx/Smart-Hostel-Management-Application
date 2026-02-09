import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";
// import OfflineIndicator from "../components/OfflineIndicator";
import { AlertProvider } from "../context/AlertContext";
// import { OfflineProvider } from "../context/OfflineContext";
import { ThemeProvider, useTheme } from "../utils/ThemeContext";

function AppNavigator() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* <OfflineIndicator /> */}
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="login" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="admin" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="alerts" options={{ animation: 'slide_from_right' }} />

        {/* Student Feature Pages - Smooth Transitions */}
        <Stack.Screen name="mess" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="laundry-request" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="roomservice" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="bustimings" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="leave-request" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="complaints" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="new-complaint" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="my-complaints" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="profile" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" backgroundColor="transparent" translucent={true} />
      <ThemeProvider>
        {/* <OfflineProvider> */}
        <AlertProvider>
          <AppNavigator />
        </AlertProvider>
        {/* </OfflineProvider>  */}
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

