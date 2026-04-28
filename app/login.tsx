import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Modal } from 'react-native';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomAlert, { AlertType } from '../components/CustomAlert';
import { useAuth } from '../context/AuthContext';
import { setStoredUser } from '../utils/authUtils';



export default function Login() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [twoFactorMethod, setTwoFactorMethod] = useState<'app' | 'sms' | 'both'>('app');
  const [twoFactorCode, setTwoFactorCode] = useState('');

  // Custom Alert State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<AlertType>('info');

  const showAlert = (title: string, message: string, type: AlertType = 'error') => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  const [isBiometricSupported, setIsBiometricSupported] = useState(false);

  useEffect(() => {
    console.log('📡 Google Sign-In Config:', process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ? 'Loaded' : 'MISSING');
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
    });
    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    try {
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      const enabled = await AsyncStorage.getItem('biometric_enabled');
      if (enabled === 'true') {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        if (hasHardware && isEnrolled) {
          setIsBiometricSupported(true);
        }
      }
    } catch (e) {
      console.log('Biometric check failed', e);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login with Biometrics',
      });
      if (result.success) {
        const savedEmail = await SecureStore.getItemAsync('saved_email');
        const savedPassword = await SecureStore.getItemAsync('saved_password');
        if (savedEmail && savedPassword) {
          setEmail(savedEmail);
          setPassword(savedPassword);
          handleLogin(savedEmail, savedPassword);
        } else {
          showAlert('Error', 'No saved credentials found. Please login with password first.', 'warning');
        }
      }
    } catch (e) {
      console.log('Biometric login error', e);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await GoogleSignin.hasPlayServices();
      const userInfo: any = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken || userInfo.idToken;

      if (idToken) {
        console.log('Authenticating with backend...');

        // Call Backend API
        const { default: api } = await import('../utils/api');
        const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');

        const response = await api.post('/auth/google', { 
          token: idToken,
          deviceName: Device.deviceName || Device.modelName || Platform.OS,
          appVersion: Application.nativeApplicationVersion || '1.0.0'
        });

        if (response.data.requiresTwoFactor) {
          setTempToken(response.data.tempToken);
          setTwoFactorMethod(response.data.method || 'app');
          setShow2FA(true);
          return;
        }

        const { user, token, refreshToken } = response.data;

        // Store Token
        await AsyncStorage.setItem('userToken', token);
        if (refreshToken) await AsyncStorage.setItem('refreshToken', refreshToken);

        // Store User Info
        await setStoredUser({
          id: user.id.toString(),
          name: user.fullName,
          role: user.role
        });

        await refreshUser();

        // Check Onboarding
        const { useSettingsStore } = await import('../store/useSettingsStore');
        await useSettingsStore.getState().loadSettings();
        const { onboardingCompleted } = useSettingsStore.getState();

        if (!onboardingCompleted) {
          router.replace('/onboarding');
          return;
        }

        // Navigate based on role
        if (user.role === 'admin') {
          router.replace('/admin');
        } else {
          router.replace('/(tabs)');
        }
      } else {
        showAlert('Google Sign-In', 'No account selected', 'warning');
      }
    } catch (e: any) {
      if (e.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
        console.log('User cancelled login');
        showAlert('Login Cancelled', 'Google Sign-In was cancelled.', 'warning');
      } else if (e.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
        console.log('Login in progress');
      } else if (e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
        showAlert('Error', 'Google Play Services not available', 'error');
      } else {
        console.error('Login Error:', e);
        const message = e.response?.data?.error || e.message || 'Login failed';
        showAlert('Error', message, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (loginEmail = email, loginPassword = password) => {
    if (!loginEmail.trim() || !loginPassword.trim()) {
      showAlert('Error', 'Please enter both email and password', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      // Dynamic imports
      const { default: api } = await import('../utils/api');
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      const { setStoredUser } = await import('../utils/authUtils');
      const { getRoleFromEmail } = await import('../utils/roleUtils');

      console.log('Attempting login with:', loginEmail);
      const response = await api.post('/auth/login', {
        email: loginEmail.trim().toLowerCase(),
        password: loginPassword.trim(),
        deviceName: Device.deviceName || Device.modelName || Platform.OS,
        appVersion: Application.nativeApplicationVersion || '1.0.0'
      });

      if (response.data.requiresTwoFactor) {
        setTempToken(response.data.tempToken);
        setTwoFactorMethod(response.data.method || 'app');
        setShow2FA(true);
        return;
      }

      const { user, token, refreshToken } = response.data;

      // Store Token
      await AsyncStorage.setItem('userToken', token);
      if (refreshToken) await AsyncStorage.setItem('refreshToken', refreshToken);

      // Store User
      await setStoredUser({
        id: user.id.toString(),
        name: user.fullName || user.email,
        role: user.role
      });

      // Save credentials for Biometrics
      await SecureStore.setItemAsync('saved_email', loginEmail.trim().toLowerCase());
      await SecureStore.setItemAsync('saved_password', loginPassword.trim());

      await refreshUser();

      // Check Onboarding
      const { useSettingsStore } = await import('../store/useSettingsStore');
      await useSettingsStore.getState().loadSettings();
      const { onboardingCompleted } = useSettingsStore.getState();

      if (!onboardingCompleted) {
        router.replace('/onboarding');
        return;
      }

      // Navigate
      if (user.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/(tabs)');
      }

    } catch (e: any) {
      console.error('Login Error:', e);
      const message = e.response?.data?.error || e.message || 'Login failed';
      showAlert('Error', message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!twoFactorCode || twoFactorCode.length < 6) {
      showAlert('Error', 'Please enter a valid 6-digit code', 'warning');
      return;
    }
    setIsLoading(true);
    try {
      const { default: api } = await import('../utils/api');
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      
      const response = await api.post('/auth/login/verify-2fa', {
        tempToken,
        token: twoFactorCode,
        deviceName: Device.deviceName || Device.modelName || Platform.OS,
        appVersion: Application.nativeApplicationVersion || '1.0.0'
      });

      const { user, token, refreshToken } = response.data;

      await AsyncStorage.setItem('userToken', token);
      if (refreshToken) await AsyncStorage.setItem('refreshToken', refreshToken);

      await setStoredUser({
        id: user.id.toString(),
        name: user.fullName || user.email,
        role: user.role
      });
      
      // Save credentials for Biometrics
      await SecureStore.setItemAsync('saved_email', email.trim().toLowerCase());
      await SecureStore.setItemAsync('saved_password', password.trim());

      await refreshUser();

      const { useSettingsStore } = await import('../store/useSettingsStore');
      await useSettingsStore.getState().loadSettings();
      const { onboardingCompleted } = useSettingsStore.getState();

      setShow2FA(false);

      if (!onboardingCompleted) {
        router.replace('/onboarding');
        return;
      }

      if (user.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/(tabs)');
      }
    } catch (e: any) {
      console.error('2FA Verify Error:', e);
      showAlert('Error', e.response?.data?.error || 'Invalid 2FA Code', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertVisible(false)}
      />

      {/* Deep Dark Navy Background */}
      <View style={styles.bgContainer}>
        <LinearGradient
          colors={['#0F172A', '#0B1121']} // Very dark navy matching the image
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        {/* Top Left Glow (Cyan) */}
        <View style={[styles.glowOrb, styles.glowOrbTop]} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Section */}
          <View style={styles.header}>
            <View style={styles.logoIconContainer}>
              {/* Cyan building icon matching the design */}
              <MaterialCommunityIcons name="domain" size={32} color="#fff" />
            </View>
            <View style={styles.logoTextRow}>
              <Text style={styles.logoTextWhite}>Smart </Text>
              <Text style={styles.logoTextCyan}>Hostel</Text>
            </View>
            <Text style={styles.logoSubtitle}>PREMIUM LIVING</Text>
          </View>

          {/* Login Card */}
          <View style={styles.glassCard}>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subtitleText}>Access your premium hostel dashboard</Text>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="email-outline" size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor="#64748B"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <View style={styles.passwordHeader}>
                <Text style={styles.inputLabel}>Password</Text>
              </View>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="lock-outline" size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#64748B"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <MaterialCommunityIcons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Primary Login Button + Biometric */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={[styles.loginBtnContainer, { flex: 1 }]}
                onPress={() => handleLogin()}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#2CB4FF', '#2563EB']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.loginBtn}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.loginBtnText}>Log In</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {isBiometricSupported && (
                <TouchableOpacity style={styles.biometricBtn} onPress={handleBiometricLogin} activeOpacity={0.7}>
                  <MaterialCommunityIcons name="fingerprint" size={30} color="#2CB4FF" />
                </TouchableOpacity>
              )}
            </View>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Sign In logic implemented here directly without separate component to match design perfectly */}
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={handleGoogleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="google" size={20} color="#EA4335" style={{ marginRight: 12 }} />
              <Text style={styles.googleBtnText}>Sign in with Google</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 2FA Modal */}
      <Modal visible={show2FA} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <MaterialCommunityIcons name={twoFactorMethod === 'sms' ? "message-processing-outline" : "shield-lock-outline"} size={48} color="#2CB4FF" style={{ marginBottom: 16 }} />
            <Text style={styles.modalTitle}>Two-Factor Auth</Text>
            <Text style={styles.modalDesc}>
              {twoFactorMethod === 'sms' 
                ? 'Enter the 6-digit code sent to your phone.' 
                : twoFactorMethod === 'both' 
                  ? 'Enter the 6-digit code from your authenticator app or phone.' 
                  : 'Enter the 6-digit code from your authenticator app.'}
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="000000"
              placeholderTextColor="#64748B"
              keyboardType="number-pad"
              maxLength={6}
              value={twoFactorCode}
              onChangeText={setTwoFactorCode}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setShow2FA(false)}>
                <Text style={styles.modalBtnTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnPrimary} onPress={handleVerify2FA} disabled={isLoading}>
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnTextPrimary}>Verify</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  bgContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  glowOrb: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  glowOrbTop: {
    backgroundColor: 'rgba(37, 192, 244, 0.15)', // Neon Cyan glow
    top: -100,
    left: '50%',
    transform: [{ translateX: -150 }],
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logoIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#2CB4FF', // Cyan building background
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#2CB4FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  logoTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoTextWhite: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  logoTextCyan: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2CB4FF', // High-contrast cyan
    letterSpacing: -0.5,
  },
  logoSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    letterSpacing: 1.5,
    marginTop: 6,
    fontWeight: '600',
  },
  glassCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)', // Dark frosted glass
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 6,
  },
  subtitleText: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F1F5F9',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)', // Very dark input background
    borderRadius: 16,
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  inputIcon: {
    marginLeft: 16,
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 15,
    height: '100%',
  },
  eyeIcon: {
    paddingHorizontal: 16,
    height: '100%',
    justifyContent: 'center',
  },
  loginBtnContainer: {
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  loginBtn: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  dividerText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 12,
    letterSpacing: 0.5,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  googleBtnText: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
  },
  biometricBtn: {
    height: 56,
    width: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalInput: {
    width: '100%',
    height: 56,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    color: '#FFF',
    fontSize: 24,
    letterSpacing: 8,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtnCancel: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  modalBtnTextCancel: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '600',
  },
  modalBtnPrimary: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2563EB',
  },
  modalBtnTextPrimary: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  }
});
