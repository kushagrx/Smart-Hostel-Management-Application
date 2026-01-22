import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlert } from '../context/AlertContext';
import { setStoredUser } from '../utils/authUtils';
import { getAuthSafe } from '../utils/firebase';
import { fetchUserData, getInitial, StudentData } from '../utils/nameUtils';
import { useTheme } from '../utils/ThemeContext';

export default function ProfilePage() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showAlert } = useAlert();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  // Fetch Pending Dues (Dynamic)
  const [pendingDues, setPendingDues] = useState<number>(0);

  useEffect(() => {
    if (student?.email) {
      loadPendingDues(student.email);
    }
  }, [student]);

  const loadPendingDues = async (email: string) => {
    try {
      const { getStudentRequests } = await import('../utils/financeUtils');
      const requests = await getStudentRequests(email);
      // Sum up amounts of requests that are 'pending' or 'overdue'
      const totalPending = requests
        .filter(r => r.status === 'pending' || r.status === 'overdue')
        .reduce((sum, r) => sum + r.amount, 0);
      setPendingDues(totalPending);
    } catch (err) {
      console.error("Failed to load pending dues:", err);
    }
  };

  const handleSignOut = () => {
    showAlert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => { } },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              const auth = getAuthSafe();
              if (auth) {
                await signOut(auth);
              }
              await setStoredUser(null);
              router.replace('/login');
            } catch (error: any) {
              console.error('Error signing out:', error);
              showAlert('Error', 'Failed to sign out: ' + error.message, [], 'error');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={{ color: colors.textSecondary }}>Loading Profile...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
        showsVerticalScrollIndicator={false}
      >
        {/* Modern Gradient Header */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={['#000428', '#004e92']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.headerGradient, { paddingTop: insets.top + 20 }]}
          >
            <View style={styles.headerContent}>
              <Pressable onPress={() => router.back()} style={styles.backButton}>
                <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
              </Pressable>
              <Text style={styles.headerTitle}>My Profile</Text>
              <Pressable style={styles.editButton}>
                {/* Placeholder for Edit or Settings action */}
                <MaterialCommunityIcons name="dots-vertical" size={24} color="rgba(255,255,255,0.8)" />
              </Pressable>
            </View>

            <View style={styles.profileCard}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{getInitial(student?.fullName || 'U')}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: student?.status === 'active' ? '#10B981' : '#EF4444' }]}>
                  <MaterialIcons name={student?.status === 'active' ? 'check-circle' : 'cancel'} size={12} color="#fff" />
                  <Text style={styles.statusText}>{student?.status === 'active' ? 'Active' : 'Inactive'}</Text>
                </View>
              </View>
              <Text style={styles.studentName}>{student?.fullName || 'Student Name'}</Text>
              <Text style={styles.studentRoll}>{student?.rollNo || 'Roll No. --'}</Text>

              <View style={styles.roomTag}>
                <MaterialCommunityIcons name="door-open" size={16} color="#fff" />
                <Text style={styles.roomText}>Room {student?.roomNo}</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={[styles.curveBlock, { backgroundColor: colors.background }]} />
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1e293b' : '#eff6ff', borderColor: isDark ? '#334155' : '#dbeafe' }]}>
            <View style={[styles.statIcon, { backgroundColor: '#3B82F6' }]}>
              <MaterialCommunityIcons name="wifi" size={20} color="#fff" />
            </View>
            <View>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>WiFi SSID</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{student?.wifiSSID || 'Hostel_WiFi'}</Text>
            </View>
          </View>

          <View style={[styles.statCard, { backgroundColor: isDark ? '#1e293b' : '#eff6ff', borderColor: isDark ? '#334155' : '#dbeafe' }]}>
            <View style={[styles.statIcon, { backgroundColor: pendingDues > 0 ? '#EF4444' : '#10B981' }]}>
              <MaterialCommunityIcons name="cash" size={20} color="#fff" />
            </View>
            <View>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending Dues</Text>
              <Text style={[styles.statValue, { color: pendingDues > 0 ? '#EF4444' : colors.text }]}>
                {pendingDues > 0 ? `₹${pendingDues}` : 'No Dues'}
              </Text>
            </View>
          </View>
        </View>


        {/* Detailed Info Section */}
        <View style={styles.detailsSection}>
          <Text style={[styles.sectionHeader, { color: colors.text }]}>Personal Details</Text>

          <View style={[styles.infoBlock, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <InfoRow icon="school" label="College" value={student?.collegeName} colors={colors} isLast={false} />
            <InfoRow icon="office-building" label="Hostel" value={student?.hostelName} colors={colors} isLast={false} />
            <InfoRow icon="email" label="Email" value={student?.personalEmail || student?.email} colors={colors} isLast={false} />
            <InfoRow icon="phone" label="Phone" value={student?.phone} colors={colors} isLast={false} />
            <InfoRow icon="map-marker" label="Address" value={student?.address} colors={colors} isLast={false} />
            <InfoRow icon="account-tie" label="Father Name" value={student?.fatherName} colors={colors} isLast={false} />
            <InfoRow icon="phone" label="Father Phone" value={student?.fatherPhone} colors={colors} isLast={false} />
            <InfoRow icon="face-woman" label="Mother Name" value={student?.motherName} colors={colors} isLast={false} />
            <InfoRow icon="phone" label="Mother Phone" value={student?.motherPhone} colors={colors} isLast={false} />
            <InfoRow icon="calendar-account" label="Date of Birth" value={student?.dob} colors={colors} isLast={false} />
            <InfoRow icon="wifi" label="WiFi Name" value={student?.wifiSSID} colors={colors} isLast={false} />
            <InfoRow icon="wifi-lock" label="WiFi Password" value={student?.wifiPassword || 'Not Set'} colors={colors} isLast={true} />
          </View>
        </View>

        {/* Medical & Emergency Section */}
        <View style={styles.detailsSection}>
          <Text style={[styles.sectionHeader, { color: colors.text, marginTop: 12 }]}>Medical & Emergency</Text>
          <View style={[styles.infoBlock, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <InfoRow icon="water" label="Blood Group" value={student?.bloodGroup} colors={colors} isLast={false} />
            <InfoRow icon="account-alert" label="Emergency Contact" value={student?.emergencyContactName} colors={colors} isLast={false} />
            <InfoRow icon="phone-alert" label="Emergency Phone" value={student?.emergencyContactPhone} colors={colors} isLast={false} />
            <InfoRow icon="medical-bag" label="Medical History" value={student?.medicalHistory} colors={colors} isLast={true} />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <Pressable
            style={({ pressed }) => [styles.signOutBtn, pressed && styles.btnPressed]}
            onPress={handleSignOut}
          >
            <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>

          <Text style={[styles.versionText, { color: colors.textSecondary }]}>App Version 1.0.2</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const InfoRow = ({ icon, label, value, colors, isLast }: any) => (
  <View style={[styles.infoRow, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
    <View style={styles.infoIconWrapper}>
      <MaterialCommunityIcons name={icon} size={22} color={colors.textSecondary} />
    </View>
    <View style={styles.infoTextWrapper}>
      <Text style={[styles.infoRowLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.infoRowValue, { color: colors.text }]}>{value || 'Not provided'}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    position: 'relative',
    marginBottom: 20,
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
    marginBottom: 24,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  editButton: {
    width: 40,
    alignItems: 'flex-end',
  },
  profileCard: {
    alignItems: 'center',
    gap: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#004e92',
  },
  statusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#004e92', // Matches gradient
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
  },
  studentName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  studentRoll: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  roomTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  roomText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  curveBlock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    gap: 12,
    borderWidth: 1,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
  },

  // Details
  detailsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  infoBlock: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  infoIconWrapper: {
    width: 36,
    alignItems: 'center',
  },
  infoTextWrapper: {
    flex: 1,
  },
  infoRowLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  infoRowValue: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Actions
  actionSection: {
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 20,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  btnPressed: {
    opacity: 0.7,
  },
  signOutText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '700',
  },
  versionText: {
    fontSize: 12,
  },
});
