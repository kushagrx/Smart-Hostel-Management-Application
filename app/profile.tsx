import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { setStoredUser } from '../utils/authUtils';
import { getAuthSafe } from '../utils/firebase';
import { fetchUserData, getInitial, StudentData } from '../utils/nameUtils';
import { useTheme } from '../utils/ThemeContext';

const Profile = () => {
  const { colors, theme } = useTheme();
  const router = useRouter();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const data = await fetchUserData();
        setStudent(data);
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();

    // Set up real-time listener
    const interval = setInterval(loadUserData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      const auth = getAuthSafe();
      if (auth) {
        await signOut(auth);
      }
      await setStoredUser(null);
      router.replace('/login');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to logout: ' + error.message);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: colors.text }}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!student) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: colors.text }}>No profile data found</Text>
        </View>
      </SafeAreaView>
    );
  }

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
            <Text style={styles.profileInitial}>{getInitial(student.fullName)}</Text>
          </View>
          <Text style={[styles.name, { color: colors.text }]}>{student.fullName}</Text>
          <Text style={[styles.roomNo, { color: colors.secondary }]}>Room {student.roomNo}</Text>
          {student.rollNo && (
            <Text style={[styles.rollNo, { color: colors.secondary }]}>Roll No: {student.rollNo}</Text>
          )}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Info</Text>
        <View style={[styles.infoCard, { backgroundColor: theme === 'dark' ? '#1e3a5f' : '#E3F2FD' }]}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="cash" size={24} color="#2196F3" />
            <View>
              <Text style={[styles.infoLabel, { color: colors.secondary }]}>Current Dues:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>₹{student.dues || 0}</Text>
            </View>
            <Pressable style={styles.payButton}>
              <Text style={styles.payButtonText}>Pay Now</Text>
            </Pressable>
          </View>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="wifi" size={24} color="#2196F3" />
            <View>
              <Text style={[styles.infoLabel, { color: colors.secondary }]}>Wi-Fi:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{student.wifiSSID}</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Details</Text>
        <View style={[styles.detailsCard, { backgroundColor: colors.cardBackground }]}>
          {student.collegeName && (
            <Pressable style={[styles.detailItem, { borderBottomColor: colors.border }]}>
              <MaterialCommunityIcons name="school" size={24} color={colors.icon} />
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: colors.secondary }]}>College</Text>
                <Text style={[styles.detailText, { color: colors.text }]}>{student.collegeName}</Text>
              </View>
            </Pressable>
          )}
          {student.phone && (
            <Pressable style={[styles.detailItem, { borderBottomColor: colors.border }]}>
              <MaterialCommunityIcons name="phone" size={24} color={colors.icon} />
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: colors.secondary }]}>Phone</Text>
                <Text style={[styles.detailText, { color: colors.text }]}>{student.phone}</Text>
              </View>
            </Pressable>
          )}
          {student.age && (
            <Pressable style={[styles.detailItem, { borderBottomColor: colors.border }]}>
              <MaterialCommunityIcons name="calendar" size={24} color={colors.icon} />
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: colors.secondary }]}>Age</Text>
                <Text style={[styles.detailText, { color: colors.text }]}>{student.age}</Text>
              </View>
            </Pressable>
          )}
          {student.hostelName && (
            <Pressable style={[styles.detailItem, { borderBottomColor: colors.border }]}>
              <MaterialCommunityIcons name="home-city" size={24} color={colors.icon} />
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: colors.secondary }]}>Hostel Name</Text>
                <Text style={[styles.detailText, { color: colors.text }]}>{student.hostelName}</Text>
              </View>
            </Pressable>
          )}
          <Pressable style={[styles.detailItem, { borderBottomColor: colors.border }]}>
            <MaterialCommunityIcons name="email" size={24} color={colors.icon} />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.secondary }]}>Email</Text>
              <Text style={[styles.detailText, { color: colors.text }]}>{student.personalEmail}</Text>
            </View>
          </Pressable>
          <Pressable style={styles.detailItem}>
            <MaterialCommunityIcons name="check-circle" size={24} color={student.status === 'active' ? '#4CAF50' : '#FF5252'} />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.secondary }]}>Status</Text>
              <Text style={[styles.detailText, { color: colors.text }]}>
                {student.status?.charAt(0).toUpperCase() + student.status?.slice(1)}
              </Text>
            </View>
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
    marginBottom: 5,
  },
  rollNo: {
    fontSize: 14,
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
    fontSize: 12,
  },
  infoValue: {
    fontWeight: '500' as const,
    fontSize: 14,
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
    fontSize: 12,
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
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  detailText: {
    fontSize: 14,
    fontWeight: '500' as const,
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