import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlert } from '../../context/AlertContext';
import { useTheme } from '../../utils/ThemeContext';

export default function ChangePassword() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const { colors, theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showAlert('Error', 'Please fill in all fields', [], 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert('Error', 'New passwords do not match', [], 'error');
      return;
    }

    if (newPassword.length < 6) {
      showAlert('Error', 'Password must be at least 6 characters long', [], 'error');
      return;
    }

    setIsLoading(true);

    try {
      const { default: api } = await import('../../utils/api');
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });

      showAlert('Success', 'Password updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ], 'success');
    } catch (error: any) {
      console.error(error);
      let msg = 'Failed to update password.';
      if (error.response?.data?.error) {
        msg = error.response.data.error;
      }
      showAlert('Error', msg, [], 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (
    label: string,
    value: string,
    setValue: (val: string) => void,
    placeholder: string,
    showPassword: boolean,
    setShowPassword: (val: boolean) => void,
    icon: any = 'lock-outline'
  ) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{label}</Text>
      <View style={[styles.inputContainer, { backgroundColor: isDark ? '#1e293b' : '#f8fafc', borderColor: colors.border }]}>
        <MaterialIcons name={icon} size={20} color={colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={value}
          onChangeText={setValue}
          secureTextEntry={!showPassword}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary + '80'}
        />
        <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
          <MaterialIcons name={showPassword ? 'visibility-off' : 'visibility'} size={20} color={colors.textSecondary} />
        </Pressable>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* Premium Banner Header */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={['#000428', '#004e92']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.headerGradient, { paddingTop: insets.top + 20 }]}
          >
            <View style={styles.headerContent}>
              <Pressable onPress={() => router.back()} style={styles.backButton}>
                <MaterialIcons name="arrow-back" size={24} color="#fff" />
              </Pressable>
              <Text style={styles.headerTitle}>Change Password</Text>
              <View style={{ width: 40 }} />
            </View>

            {/* Centered Graphic/Icon for Security */}
            <View style={styles.securityIconContainer}>
              <View style={styles.securityIconHero}>
                <MaterialIcons name="shield" size={48} color="#004e92" />
              </View>
              <Text style={styles.securityTitle}>Secure Your Account</Text>
            </View>
          </LinearGradient>
          <View style={[styles.curveBlock, { backgroundColor: colors.background }]} />
        </View>

        {/* Main Content Area */}
        <View style={styles.scrollContent}>
          <View style={styles.section}>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={styles.helperText}>
                Create a strong password with at least 6 characters. Use a combination of letters, numbers, and symbols.
              </Text>

              {renderInput(
                "Current Password",
                currentPassword,
                setCurrentPassword,
                "Enter current password",
                showCurrent,
                setShowCurrent,
                "lock"
              )}

              {renderInput(
                "New Password",
                newPassword,
                setNewPassword,
                "Enter new password",
                showNew,
                setShowNew,
                "lock-reset"
              )}

              {renderInput(
                "Confirm New Password",
                confirmPassword,
                setConfirmPassword,
                "Confirm new password",
                showConfirm,
                setShowConfirm,
                "check-circle-outline"
              )}

            </View>
          </View>

          {/* Change Password Button */}
          <Pressable
            style={({ pressed }) => [
              styles.saveBtn,
              pressed && styles.saveBtnPressed,
              isLoading && styles.saveBtnDisabled
            ]}
            onPress={handleChangePassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialIcons name="update" size={24} color="#fff" />
                <Text style={styles.saveBtnText}>Update Password</Text>
              </>
            )}
          </Pressable>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  headerGradient: {
    paddingBottom: 50,
    alignItems: 'center',
  },
  headerContent: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  securityIconContainer: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  securityIconHero: {
    width: 100,
    height: 100,
    borderRadius: 32,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    transform: [{ rotate: '10deg' }]
  },
  securityTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
    marginTop: 8,
  },
  curveBlock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 28,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    gap: 20,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  helperText: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 4,
    fontWeight: '500',
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingLeft: 16,
    paddingRight: 8,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  eyeBtn: {
    padding: 8,
  },
  saveBtn: {
    backgroundColor: '#004e92',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 100,
    gap: 12,
    marginTop: 10,
    shadowColor: '#004e92',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  saveBtnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
