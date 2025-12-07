import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getStoredUser } from '../utils/authUtils';

export default function Index() {
  const router = useRouter();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    // Professional Smooth Easing (No Spring)
    opacity.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.exp) });
    scale.value = withTiming(1, { duration: 1200, easing: Easing.out(Easing.back(1.0)) });

    textOpacity.value = withDelay(300, withTiming(1, { duration: 800 }));

    // 2. Check Auth in Parallel
    const checkAuthAndNavigate = async () => {
      // Extended wait time for the premium feel
      await new Promise((resolve) => setTimeout(resolve, 3000));

      try {
        const user = await getStoredUser();
        if (!user) {
          router.replace('/login');
        } else {
          if (user.role === 'admin') {
            router.replace('/admin');
          } else {
            router.replace('/(tabs)');
          }
        }
      } catch (error) {
        router.replace('/login');
      }
    };

    checkAuthAndNavigate();
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: (1 - opacity.value) * -50 } // Slide down slightly
    ],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [
      { translateY: (1 - textOpacity.value) * 20 } // Slide up
    ],
  }));

  return (
    <LinearGradient
      colors={['#000428', '#004e92']} // Deep Royal Blue / Night Sky
      style={styles.container}
    >
      <SafeAreaView style={styles.content}>
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <MaterialCommunityIcons name="shield-home" size={90} color="#fff" />
        </Animated.View>
        <Animated.View style={[styles.textContainer, textStyle]}>
          <Text style={styles.title}>SMART HOSTEL</Text>
          <Text style={styles.subtitle}>Secure • Modern • Efficient</Text>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 30,
    padding: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 3,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
    fontWeight: '400',
  },
});






