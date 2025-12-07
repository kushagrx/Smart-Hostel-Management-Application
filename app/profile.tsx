import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { setStoredUser } from '../utils/authUtils';
import { getAuthSafe } from '../utils/firebase';
import { getInitial, userData } from '../utils/nameUtils';
import { useTheme } from '../utils/ThemeContext';

const Profile = () => {
  const { colors, theme } = useTheme();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const auth = getAuthSafe();
      if (auth) {
        await signOut(auth);
      }
      await setStoredUser(null);

      // Use replace to prevent going back
      router.replace('/login');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to logout: ' + error.message);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>

        <View style={styles.profileSection}>
          <View style={styles.profilePic}>
            <Text style={styles.profileInitial}>{getInitial(userData.fullName)}</Text>
          </View>
          <Text style={[styles.name, { color: colors.text }]}>{userData.fullName}</Text>
          <Text style={[styles.roomNo, { color: colors.secondary }]}>{userData.roomNo}</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Info</Text>
        <View style={[styles.infoCard, { backgroundColor: theme === 'dark' ? '#1e3a5f' : '#E3F2FD' }]}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="cash" size={24} color="#2196F3" />
            <View>
              <Text style={[styles.infoLabel, { color: colors.secondary }]}>Current Dues:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>₹1500</Text>
            </View>
            <Pressable style={styles.payButton}>
              <Text style={styles.payButtonText}>Pay Now</Text>
            </Pressable>
          </View>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="wifi" size={24} color="#2196F3" />
            <View>
              <Text style={[styles.infoLabel, { color: colors.secondary }]}>Wi-Fi:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>ENET_C11</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Details</Text>
        <View style={[styles.detailsCard, { backgroundColor: colors.cardBackground }]}>
          <Pressable style={[styles.detailItem, { borderBottomColor: colors.border }]}>
            <MaterialCommunityIcons name="phone-alert" size={24} color={colors.icon} />
            <Text style={[styles.detailText, { color: colors.text }]}>Emergency Contact</Text>
            <Text style={styles.viewEdit}>View/Edit</Text>
          </Pressable>
          <Pressable style={[styles.detailItem, { borderBottomColor: colors.border }]}>
            <MaterialCommunityIcons name="file-document" size={24} color={colors.icon} />
            <Text style={[styles.detailText, { color: colors.text }]}>Hostel Policies</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.icon} />
          </Pressable>
        </View>

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    marginBottom: 30,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profilePic: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileInitial: {
    color: 'white',
    fontSize: 32,
    fontWeight: '600' as const,
  },
  name: {
    fontSize: 24,
    fontWeight: '600' as const,
    marginBottom: 5,
  },
  roomNo: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 15,
  },
  infoCard: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 25,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 15,
  },
  infoLabel: {
    marginBottom: 2,
  },
  infoValue: {
    fontWeight: '500' as const,
  },
  payButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 'auto',
  },
  payButtonText: {
    color: 'white',
    fontWeight: '500' as const,
  },
  detailsCard: {
    borderRadius: 15,
    marginBottom: 25,
    overflow: 'hidden',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    gap: 15,
    borderBottomWidth: 1,
  },
  detailText: {
    flex: 1,
    fontSize: 16,
  },
  viewEdit: {
    color: '#2196F3',
  },
  logoutButton: {
    backgroundColor: '#FF5252',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});

export default Profile;