import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as Application from 'expo-application';
import { useTheme } from '../../utils/ThemeContext';

const SettingItem = ({ icon, label, isSwitch, value, onValueChange, onPress, accessibilityHint, colors, isLast }: any) => {
  return (
    <TouchableOpacity 
      style={[
        styles.row, 
        { 
          borderBottomColor: colors.border,
          borderBottomWidth: isLast ? 0 : 1,
        }
      ]} 
      onPress={onPress} 
      disabled={!onPress}
      accessible={true}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityRole={isSwitch ? 'switch' : (onPress ? 'button' : 'text')}
    >
      <View style={styles.labelContainer}>
        {icon && <MaterialIcons name={icon} size={24} color={colors.icon} />}
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      </View>
      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#ddd', true: '#FF8C00' }}
          thumbColor={value ? '#fff' : '#f4f3f4'}
        />
      ) : (
        onPress && <MaterialIcons name="chevron-right" size={24} color={colors.icon} />
      )}
    </TouchableOpacity>
  );
};

export default function Settings() {
  const router = useRouter();
  const { theme, toggleTheme, colors } = useTheme();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Log Out", onPress: () => router.replace('/login'), style: "destructive" }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerStyle: { backgroundColor: '#FF8C00' },
          headerTintColor: '#fff',
          headerShadowVisible: false,
        }}
      />
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Account Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <SettingItem 
            icon="person-outline" 
            label="Edit Profile" 
            onPress={() => router.push('/profile/edit')} 
            accessibilityHint="Navigates to the edit profile screen"
            colors={colors}
            isLast={false}
          />
          <SettingItem 
            icon="lock-outline" 
            label="Change Password" 
            onPress={() => router.push('/account/change-password')}
            accessibilityHint="Navigates to the change password screen"
            colors={colors}
            isLast={true}
          />
        </View>

        {/* Notifications Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <SettingItem 
            icon="notifications-none" 
            label="Push Notifications" 
            isSwitch 
            value={pushNotifications} 
            onValueChange={setPushNotifications}
            accessibilityHint="Toggle push notifications on or off"
            colors={colors}
            isLast={false}
          />
          <SettingItem 
            icon="mail-outline" 
            label="Email Notifications" 
            isSwitch 
            value={emailNotifications} 
            onValueChange={setEmailNotifications}
            accessibilityHint="Toggle email notifications on or off"
            colors={colors}
            isLast={true}
          />
        </View>

        {/* App Preferences Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>App Preferences</Text>
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <SettingItem 
            icon="brightness-6" 
            label="Dark Mode" 
            isSwitch 
            value={theme === 'dark'} 
            onValueChange={toggleTheme}
            accessibilityHint="Toggle dark mode for the app"
            colors={colors}
            isLast={false}
          />
          <SettingItem 
            icon="language" 
            label="Language" 
            onPress={() => {}} 
            accessibilityHint="Opens language selection options"
            colors={colors}
            isLast={true}
          />
        </View>

        {/* About Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>About & Support</Text>
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <SettingItem 
            icon="support-agent" 
            label="Contact Support" 
            onPress={() => {}} 
            accessibilityHint="Opens the contact support page"
            colors={colors}
            isLast={false}
          />
          <SettingItem 
            icon="help-outline" 
            label="FAQs" 
            onPress={() => {}} 
            accessibilityHint="Navigates to the Frequently Asked Questions page"
            colors={colors}
            isLast={false}
          />
          <SettingItem 
            icon="policy" 
            label="Privacy Policy" 
            onPress={() => {}} 
            accessibilityHint="Opens the privacy policy"
            colors={colors}
            isLast={false}
          />
          <View style={[styles.row, { borderBottomWidth: 0, borderBottomColor: colors.border }]}>
            <View style={styles.labelContainer}>
                <MaterialIcons name="info-outline" size={24} color={colors.icon} />
                <Text style={[styles.label, { color: colors.text }]}>App Version</Text>
            </View>
            <Text style={[styles.value, { color: colors.secondary }]}>{Application.nativeApplicationVersion}</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: theme === 'dark' ? '#4d1f1f' : '#FFF3F3' }]} onPress={handleLogout}>
          <MaterialIcons name="logout" size={22} color="#FF5252" />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 8,
  },
  card: {
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 0,
    paddingHorizontal: 0,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    margin: 16,
    padding: 16,
    gap: 8,
    marginTop: 32,
    marginBottom: 40,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF5252',
  },
});