import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import * as Application from 'expo-application';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  DeviceEventEmitter,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAlert } from '../../context/AlertContext';
import { useTheme } from '../../utils/ThemeContext';
import { fetchUserData, StudentData } from '../../utils/nameUtils';

const SettingItem = ({ icon, label, onPress, accessibilityHint, isLast, danger, themeColors, value, description }: any) => {
  return (
    <TouchableOpacity
      style={[
        styles.row,
        !isLast && [styles.rowBorder, { borderBottomColor: themeColors.border }]
      ]}
      onPress={onPress}
      disabled={!onPress}
      accessible={true}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
    >
      <View style={styles.labelContainer}>
        <View style={[styles.iconBox, { backgroundColor: danger ? 'rgba(239, 68, 68, 0.1)' : (themeColors?.isDark ? '#1e293b' : '#F1F5F9') }]}>
          <MaterialCommunityIcons name={icon} size={20} color={danger ? '#EF4444' : (themeColors?.isDark ? '#60A5FA' : '#004e92')} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: danger ? '#EF4444' : themeColors.text }]}>{label}</Text>
          {description && <Text style={[styles.itemDescription, { color: themeColors.textSecondary }]}>{description}</Text>}
        </View>
      </View>
      {value ? (
        <Text style={[styles.rowValue, { color: themeColors.textSecondary }]}>{value}</Text>
      ) : (
        onPress && <MaterialIcons name="chevron-right" size={20} color="#94A3B8" />
      )}
    </TouchableOpacity>
  );
};

export default function Settings() {
  const router = useRouter();
  const { theme, toggleTheme, colors, isDark } = useTheme();
  const { showAlert } = useAlert();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    loadUserData();
    const sub = DeviceEventEmitter.addListener('profileUpdated', loadUserData);
    return () => sub.remove();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await fetchUserData();
      setStudent(data);
    } catch (error) {
      console.error('Failed to load user data for settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    showAlert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => { } },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              const { setStoredUser } = await import('../../utils/authUtils');
              const { deregisterPushToken } = await import('../../utils/usePushNotifications');
              const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
              const { useAuthStore } = await import('../../store/useAuthStore');

              await deregisterPushToken();
              await setStoredUser(null);
              await AsyncStorage.removeItem('userToken');
              useAuthStore.getState().setUser(null);
              router.replace('/login');
            } catch (error) {
              console.error("Logout error:", error);
            }
          }
        }
      ]
    );
  };

  const clearCache = async () => {
    setClearing(true);
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      // Define keys to clear - avoiding auth token
      const keysToKeep = ['userToken', 'user', 'theme'];
      const allKeys = await AsyncStorage.getAllKeys();
      const keysToClear = allKeys.filter(key => !keysToKeep.includes(key));

      if (keysToClear.length > 0) {
        await AsyncStorage.multiRemove(keysToClear);
      }

      setTimeout(() => {
        setClearing(false);
        showAlert('Success', 'App cache cleared successfully! Temporary data has been reset.');
      }, 1000);
    } catch (error) {
      console.error('Failed to clear cache:', error);
      setClearing(false);
      showAlert('Error', 'Failed to clear cache.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#004e92" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={['#000428', '#004e92']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <SafeAreaView edges={['top', 'left', 'right']}>
            <View style={styles.headerContent}>
              <View>
                <Text style={styles.headerTitle}>Settings</Text>
                <Text style={styles.headerSubtitle}>Manage your account & app</Text>
              </View>
              <View style={styles.headerIcon}>
                <MaterialCommunityIcons name="cog" size={24} color="#fff" />
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View style={{ padding: 20 }}>
          {/* Account & Security Section */}
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Account & Security</Text>
          <View style={[styles.card, styles.shadowProp, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SettingItem
              icon="account-circle-outline"
              label="Edit Profile"
              description="Personal info, parent details"
              onPress={() => router.push('/edit-profile')}
              themeColors={{ ...colors, isDark }}
            />
            <SettingItem
              icon="lock-outline"
              label="Change Password"
              description="Update your account security"
              onPress={() => router.push('/account/change-password')}
              themeColors={{ ...colors, isDark }}
            />
            <SettingItem
              icon="shield-check-outline"
              label="Two-Factor Auth"
              description="Extra layer of protection (Coming soon)"
              themeColors={{ ...colors, isDark }}
            />
            <SettingItem
              icon="devices"
              label="Manage Devices"
              description="View and manage where you're logged in"
              themeColors={{ ...colors, isDark }}
              isLast={true}
            />
          </View>

          {/* Preferences Section */}
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Preferences</Text>
          <View style={[styles.card, styles.shadowProp, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SettingItem
              icon="bell-outline"
              label="Notification Preferences"
              description="Manage granular push alerts"
              onPress={() => router.push('/account/notification-settings')}
              themeColors={{ ...colors, isDark }}
            />
            <SettingItem
              icon="brightness-6"
              label="Theme Mode"
              description={isDark ? "Dark theme active" : "Light theme active"}
              onPress={toggleTheme}
              value={isDark ? "Dark" : "Light"}
              themeColors={{ ...colors, isDark }}
            />
            <SettingItem
              icon="translate"
              label="App Language"
              description="Choose your preferred language"
              value="English"
              themeColors={{ ...colors, isDark }}
              isLast={true}
            />
          </View>

          {/* Storage & Data Section */}
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>App Maintenance</Text>
          <View style={[styles.card, styles.shadowProp, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SettingItem
              icon="database-refresh-outline"
              label="Clear App Cache"
              description="Resets temporary data & photos"
              onPress={clearCache}
              themeColors={{ ...colors, isDark }}
            />
            <SettingItem
              icon="bug-outline"
              label="Report a Bug"
              onPress={() => showAlert('Support', 'Bug reporting feature will be available in the next update.')}
              themeColors={{ ...colors, isDark }}
              isLast={true}
            />
          </View>

          {/* About Section */}
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>About & Support</Text>
          <View style={[styles.card, styles.shadowProp, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SettingItem
              icon="help-circle-outline"
              label="Help Center"
              onPress={() => { }}
              themeColors={{ ...colors, isDark }}
            />
            <SettingItem
              icon="information-outline"
              label="Privacy Policy"
              onPress={() => { }}
              themeColors={{ ...colors, isDark }}
            />
            <SettingItem
              icon="text-box-check-outline"
              label="Terms of Service"
              onPress={() => { }}
              themeColors={{ ...colors, isDark }}
            />
            <View style={[styles.row, { paddingVertical: 12 }]}>
              <View style={styles.labelContainer}>
                <View style={[styles.iconBox, { backgroundColor: isDark ? '#1e293b' : '#F1F5F9' }]}>
                  <MaterialCommunityIcons name="tag-outline" size={20} color={colors.textSecondary} />
                </View>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Version</Text>
              </View>
              <Text style={styles.version}>{Application.nativeApplicationVersion} (1.02.4)</Text>
            </View>
          </View>

          {/* Logout Section */}
          <TouchableOpacity
            style={[styles.logoutButton, styles.shadowProp, { backgroundColor: isDark ? '#170a0a' : '#FFF5F5', borderColor: isDark ? '#451a1a' : '#FEE2E2' }]}
            onPress={handleLogout}
          >
            <MaterialCommunityIcons name="logout-variant" size={22} color="#EF4444" />
            <Text style={styles.logoutButtonText}>Log Out Session</Text>
          </TouchableOpacity>

          <Text style={[styles.footerText, { color: colors.textSecondary }]}>SmartStay Hostels © 2026 • Premium Experience</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 32,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  headerContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginTop: 4,
  },
  headerIcon: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 28,
    marginBottom: 12,
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    paddingRight: 16,
  },
  rowBorder: {
    borderBottomWidth: 1,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 14,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  itemDescription: {
    fontSize: 11,
    marginTop: 1,
    fontWeight: '400',
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  version: {
    fontSize: 13,
    color: '#94A3B8',
    marginRight: 4,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    padding: 16,
    gap: 10,
    marginTop: 36,
    marginBottom: 20,
    borderWidth: 1,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 11,
    marginTop: 10,
    marginBottom: 20,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  shadowProp: {
    shadowColor: '#004e92',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
});