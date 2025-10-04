import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as Application from 'expo-application';

const SettingItem = ({ icon, label, isSwitch, value, onValueChange, onPress, accessibilityHint }) => {
  return (
    <TouchableOpacity 
      style={styles.row} 
      onPress={onPress} 
      disabled={!onPress}
      accessible={true}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityRole={isSwitch ? 'switch' : (onPress ? 'button' : 'text')}
    >
      <View style={styles.labelContainer}>
        {icon && <MaterialIcons name={icon} size={24} color="#666" />}
        <Text style={styles.label}>{label}</Text>
      </View>
      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#ddd', true: '#FF8C00' }}
          thumbColor={value ? '#fff' : '#f4f3f4'}
        />
      ) : (
        onPress && <MaterialIcons name="chevron-right" size={24} color="#ccc" />
      )}
    </TouchableOpacity>
  );
};

export default function Settings() {
  const router = useRouter();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

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
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerStyle: { backgroundColor: '#FF8C00' },
          headerTintColor: '#fff',
          headerShadowVisible: false,
        }}
      />
      <ScrollView style={styles.container}>
        {/* Account Section */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <SettingItem 
            icon="person-outline" 
            label="Edit Profile" 
            onPress={() => router.push('/profile/edit')} 
            accessibilityHint="Navigates to the edit profile screen"
          />
          <SettingItem 
            icon="lock-outline" 
            label="Change Password" 
            onPress={() => router.push('/account/change-password')}
            accessibilityHint="Navigates to the change password screen"
          />
        </View>

        {/* Notifications Section */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.card}>
          <SettingItem 
            icon="notifications-none" 
            label="Push Notifications" 
            isSwitch 
            value={pushNotifications} 
            onValueChange={setPushNotifications}
            accessibilityHint="Toggle push notifications on or off"
          />
          <SettingItem 
            icon="mail-outline" 
            label="Email Notifications" 
            isSwitch 
            value={emailNotifications} 
            onValueChange={setEmailNotifications}
            accessibilityHint="Toggle email notifications on or off"
          />
        </View>

        {/* App Preferences Section */}
        <Text style={styles.sectionTitle}>App Preferences</Text>
        <View style={styles.card}>
          <SettingItem 
            icon="brightness-6" 
            label="Dark Mode" 
            isSwitch 
            value={darkMode} 
            onValueChange={setDarkMode}
            accessibilityHint="Toggle dark mode for the app"
          />
          <SettingItem 
            icon="language" 
            label="Language" 
            onPress={() => {}} // Placeholder for language selection
            accessibilityHint="Opens language selection options"
          />
        </View>

        {/* About Section */}
        <Text style={styles.sectionTitle}>About & Support</Text>
        <View style={styles.card}>
          <SettingItem 
            icon="support-agent" 
            label="Contact Support" 
            onPress={() => {}} // Placeholder
            accessibilityHint="Opens the contact support page"
          />
          <SettingItem 
            icon="help-outline" 
            label="FAQs" 
            onPress={() => {}} // Placeholder
            accessibilityHint="Navigates to the Frequently Asked Questions page"
          />
          <SettingItem 
            icon="policy" 
            label="Privacy Policy" 
            onPress={() => {}} // Placeholder
            accessibilityHint="Opens the privacy policy"
          />
          <View style={styles.row}>
            <View style={styles.labelContainer}>
                <MaterialIcons name="info-outline" size={24} color="#666" />
                <Text style={styles.label}>App Version</Text>
            </View>
            <Text style={styles.value}>{Application.nativeApplicationVersion}</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
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
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
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
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  label: {
    fontSize: 16,
    color: '#2d3436',
  },
  value: {
    fontSize: 16,
    color: '#999',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF3F3',
    borderRadius: 14,
    margin: 16,
    padding: 16,
    gap: 8,
    marginTop: 32,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF5252',
  },
});