import { MaterialIcons } from '@expo/vector-icons';
import * as Application from 'expo-application';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { setStoredUser } from '../../utils/authUtils';
import { useTheme } from '../../utils/ThemeContext';

const SettingItem = ({ icon, label, isSwitch, value, onValueChange, onPress, accessibilityHint, isLast, danger }: any) => {
  return (
    <TouchableOpacity
      style={[
        styles.row,
        !isLast && styles.rowBorder
      ]}
      onPress={onPress}
      disabled={!onPress && !isSwitch}
      accessible={true}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityRole={isSwitch ? 'switch' : (onPress ? 'button' : 'text')}
    >
      <View style={styles.labelContainer}>
        <View style={[styles.iconBox, { backgroundColor: danger ? '#FEF2F2' : '#EFF6FF' }]}>
          <MaterialIcons name={icon} size={20} color={danger ? '#EF4444' : '#004e92'} />
        </View>
        <Text style={[styles.label, { color: danger ? '#EF4444' : '#1E293B' }]}>{label}</Text>
      </View>
      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#E2E8F0', true: '#004e92' }}
          thumbColor={'#fff'}
          ios_backgroundColor="#E2E8F0"
        />
      ) : (
        onPress && <MaterialIcons name="chevron-right" size={20} color="#94A3B8" />
      )}
    </TouchableOpacity>
  );
};

export default function Settings() {
  const router = useRouter();
  const { theme, toggleTheme, colors } = useTheme();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const handleLogout = async () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of your account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          onPress: async () => {
            const { getAuthSafe } = await import('../../utils/firebase');
            const { signOut } = await import('firebase/auth');
            const auth = getAuthSafe();
            if (auth) await signOut(auth);

            await setStoredUser(null);
            router.replace('/login');
          },
          style: "destructive"
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
      <Stack.Screen options={{ headerShown: false }} />

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
              <Text style={styles.headerSubtitle}>Preferences & Account</Text>
            </View>
            <View style={styles.headerIcon}>
              <MaterialIcons name="settings" size={24} color="#fff" />
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >

        {/* Account Section */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={[styles.card, styles.shadowProp]}>
          <SettingItem
            icon="person"
            label="Edit Profile"
            onPress={() => router.push('/profile/edit')}
            accessibilityHint="Navigates to the edit profile screen"
            isLast={false}
          />
          <SettingItem
            icon="lock"
            label="Change Password"
            onPress={() => router.push('/account/change-password')}
            accessibilityHint="Navigates to the change password screen"
            isLast={true}
          />
        </View>

        {/* Notifications Section */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={[styles.card, styles.shadowProp]}>
          <SettingItem
            icon="notifications"
            label="Push Notifications"
            isSwitch
            value={pushNotifications}
            onValueChange={setPushNotifications}
            accessibilityHint="Toggle push notifications on or off"
            isLast={false}
          />
          <SettingItem
            icon="mail"
            label="Email Updates"
            isSwitch
            value={emailNotifications}
            onValueChange={setEmailNotifications}
            accessibilityHint="Toggle email notifications on or off"
            isLast={true}
          />
        </View>

        {/* App Preferences Section */}
        <Text style={styles.sectionTitle}>App Preferences</Text>
        <View style={[styles.card, styles.shadowProp]}>
          <SettingItem
            icon="brightness-6"
            label="Dark Mode"
            isSwitch
            value={theme === 'dark'}
            onValueChange={toggleTheme}
            accessibilityHint="Toggle dark mode for the app"
            isLast={false}
          />
          <SettingItem
            icon="language"
            label="Language"
            onPress={() => { }}
            accessibilityHint="Opens language selection options"
            isLast={true}
          />
        </View>

        {/* About Section */}
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={[styles.card, styles.shadowProp]}>
          <SettingItem
            icon="support-agent"
            label="Contact Support"
            onPress={() => { }}
            accessibilityHint="Opens the contact support page"
            isLast={false}
          />
          <SettingItem
            icon="help-outline"
            label="FAQs"
            onPress={() => { }}
            accessibilityHint="Navigates to the Frequently Asked Questions page"
            isLast={false}
          />
          <SettingItem
            icon="privacy-tip"
            label="Privacy Policy"
            onPress={() => { }}
            accessibilityHint="Opens the privacy policy"
            isLast={false}
          />

          {/* Version Info */}
          <View style={[styles.row, { paddingVertical: 12 }]}>
            <View style={styles.labelContainer}>
              <View style={[styles.iconBox, { backgroundColor: '#F1F5F9' }]}>
                <MaterialIcons name="info" size={20} color="#64748B" />
              </View>
              <Text style={[styles.label, { color: '#64748B' }]}>App Version</Text>
            </View>
            <Text style={styles.version}>{Application.nativeApplicationVersion}</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={[styles.logoutButton, styles.shadowProp]} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color="#EF4444" />
          <Text style={styles.logoutButtonText}>Log Out Session</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>Smart Hostel © 2026</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: "#004e92",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  headerContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
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
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 24,
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    paddingRight: 16,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
  },
  version: {
    fontSize: 14,
    color: '#94A3B8',
    marginRight: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 10,
    marginTop: 32,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  footerText: {
    textAlign: 'center',
    color: '#CBD5E1',
    fontSize: 12,
    marginBottom: 20,
  },
  shadowProp: {
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
});