import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isAdmin, setStoredUser, useUser } from '../../utils/authUtils';

const MOCK_STUDENTS = [{ id: 's1', name: 'Alice' }, { id: 's2', name: 'Bob' }, { id: 's3', name: 'Charlie' }];
const MOCK_ROOMS = [{ id: 'r1', number: '101' }, { id: 'r2', number: '102' }];
const MOCK_COMPLAINTS = [
  { id: 'c1', text: 'WiFi not working', student: 'Alice', status: 'open', priority: 'high' },
  { id: 'c2', text: 'Mess food quality', student: 'Bob', status: 'open', priority: 'medium' },
];
const MOCK_LEAVES = [{ id: 'l1', student: 'Charlie', status: 'pending', days: 6 }];
const MOCK_NOTICES = [
  { id: 'n1', title: 'Water outage', date: '2025-12-06' },
  { id: 'n2', title: 'Maintenance work', date: '2025-12-05' },
];

const navItems = [
  { id: 'students', label: 'Students', icon: 'account-group', color: '#6366F1' },
  { id: 'rooms', label: 'Rooms', icon: 'door-closed', color: '#8B5CF6' },
  { id: 'complaints', label: 'Complaints', icon: 'alert-circle', color: '#EC4899' },
  { id: 'leaves', label: 'Leaves', icon: 'calendar-clock', color: '#06B6D4' },
  { id: 'notices', label: 'Notices', icon: 'bullhorn', color: '#3B82F6' },
];

export default function AdminDashboard() {
  const user = useUser();
  const router = useRouter();
  const [activeNav, setActiveNav] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAdmin(user)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 16 }}>Access denied. Admins only.</Text>
      </View>
    );
  }

  const openComplaints = MOCK_COMPLAINTS.filter((c) => c.status === 'open').length;

  const handleNavPress = (id: string) => {
    setActiveNav(id);
    setSidebarOpen(false);
    router.push(`/admin/${id === 'students' ? 'students' : id === 'rooms' ? 'rooms' : id === 'complaints' ? 'complaints' : id === 'leaves' ? 'leaveRequests' : 'notices'}`);
  };

  return (
    <SafeAreaView style={styles.mainContainer} edges={['top']}>
      {/* Header with Hamburger Menu */}
      <LinearGradient
        colors={['#FF8C00', '#FFA500']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerBar}
      >
        <TouchableOpacity
          style={styles.hamburgerBtn}
          onPress={() => setSidebarOpen(!sidebarOpen)}
        >
          <MaterialIcons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerBarTitle}>Welcome back, Admin</Text>
        </View>
        <View style={styles.headerIcon}>
          <MaterialIcons name="shield-check" size={24} color="#fff" />
        </View>
      </LinearGradient>

      {/* Header Bottom Accent Bar */}
      <View style={styles.headerAccent} />

      {/* Side Sidebar Panel */}
      {sidebarOpen && (
        <View style={styles.sidebarOverlay}>
          <TouchableOpacity
            style={styles.overlayBackground}
            onPress={() => setSidebarOpen(false)}
          />
          <View style={styles.sidebarPanel}>
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>Management</Text>
              <TouchableOpacity onPress={() => setSidebarOpen(false)}>
                <MaterialIcons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.sidebarScrollView}
              contentContainerStyle={styles.sidebarScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {navItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.sidebarItem, activeNav === item.id && styles.sidebarItemActive]}
                  onPress={() => handleNavPress(item.id)}
                >
                  <View style={[styles.sidebarIconContainer, { backgroundColor: item.color + '20' }]}>
                    <MaterialIcons name={item.icon as any} size={24} color={item.color} />
                  </View>
                  <View style={styles.sidebarItemContent}>
                    <Text style={[styles.sidebarItemLabel, activeNav === item.id && styles.sidebarItemLabelActive]}>
                      {item.label}
                    </Text>
                  </View>
                  {activeNav === item.id && (
                    <MaterialIcons name="check-circle" size={20} color={item.color} />
                  )}
                </TouchableOpacity>
              ))}

              {/* Logout Button */}
              <View style={styles.sidebarDivider} />
              <TouchableOpacity
                style={styles.sidebarLogoutItem}
                onPress={async () => {
                  Alert.alert(
                    "Log Out",
                    "Are you sure you want to log out?",
                    [
                      { text: "Cancel", style: "cancel", onPress: () => setSidebarOpen(false) },
                      {
                        text: "Log Out",
                        style: "destructive",
                        onPress: async () => {
                          const { getAuthSafe } = await import('../../utils/firebase');
                          const { signOut } = await import('firebase/auth');
                          const auth = getAuthSafe();
                          if (auth) await signOut(auth);

                          await setStoredUser(null);
                          setSidebarOpen(false);
                          router.replace('/login');
                        },
                      },
                    ]
                  );
                }}
              >
                <View style={[styles.sidebarIconContainer, { backgroundColor: '#FF525220' }]}>
                  <MaterialIcons name="logout" size={24} color="#FF5252" />
                </View>
                <View style={styles.sidebarItemContent}>
                  <Text style={styles.sidebarLogoutLabel}>Log Out</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      )}

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Recent Complaints */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="alert-circle" size={20} color="#EC4899" />
            <Text style={styles.sectionTitle}>Recent Complaints</Text>
            <TouchableOpacity onPress={() => handleNavPress('complaints')}>
              <Text style={styles.seeAllLink}>See all</Text>
            </TouchableOpacity>
          </View>
          {MOCK_COMPLAINTS.map((c) => (
            <View key={c.id} style={styles.listItem}>
              <View style={styles.itemIconContainer}>
                <MaterialIcons
                  name={c.priority === 'high' ? 'alert' : 'information'}
                  size={16}
                  color={c.priority === 'high' ? '#F44336' : '#FF9800'}
                />
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{c.text}</Text>
                <Text style={styles.itemSubtitle}>by {c.student}</Text>
              </View>
              <View style={[styles.priorityBadge, { backgroundColor: c.priority === 'high' ? '#FFEBEE' : '#FFF3E0' }]}>
                <Text style={[styles.priorityText, { color: c.priority === 'high' ? '#F44336' : '#FF9800' }]}>
                  {c.priority}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Announcements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="bullhorn" size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Announcements</Text>
            <TouchableOpacity onPress={() => handleNavPress('notices')}>
              <Text style={styles.seeAllLink}>See all</Text>
            </TouchableOpacity>
          </View>
          {MOCK_NOTICES.map((n) => (
            <View key={n.id} style={styles.listItem}>
              <View style={styles.itemIconContainer}>
                <MaterialIcons name="bullhorn" size={16} color="#3B82F6" />
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{n.title}</Text>
                <Text style={styles.itemSubtitle}>{n.date}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={18} color="#ccc" />
            </View>
          ))}
        </View>

        {/* Pending Leaves */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="calendar-clock" size={20} color="#06B6D4" />
            <Text style={styles.sectionTitle}>Pending Leaves</Text>
            <TouchableOpacity onPress={() => handleNavPress('leaves')}>
              <Text style={styles.seeAllLink}>See all</Text>
            </TouchableOpacity>
          </View>
          {MOCK_LEAVES.map((l) => (
            <View key={l.id} style={styles.listItem}>
              <View style={styles.itemIconContainer}>
                <MaterialIcons name="calendar-clock" size={16} color="#06B6D4" />
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{l.student}</Text>
                <Text style={styles.itemSubtitle}>{l.days} days leave</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: '#CFFAFE' }]}>
                <Text style={[styles.statusText, { color: '#06B6D4' }]}>Pending</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerBar: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#FF8C00',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  hamburgerBtn: {
    padding: 10,
    marginRight: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerBarTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAccent: {
    height: 16,
    backgroundColor: '#FFF9F5',
  },
  sidebarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10, // Lower zIndex to stay below system UI elements
    flexDirection: 'row-reverse',
    // Add safe area insets to prevent covering system UI
    paddingTop: 30, // Space for status bar
  },
  overlayBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebarPanel: {
    width: 280,
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 2, height: 0 },
    elevation: 10,
    // Ensure panel respects safe area
    marginTop: -30, // Compensate for the paddingTop in parent
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sidebarScrollView: {
    flex: 1,
  },
  sidebarScrollContent: {
    paddingBottom: 20,
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#333',
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 12,
    gap: 12,
  },
  sidebarItemActive: {
    backgroundColor: '#E0E7FF',
  },
  sidebarIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebarItemContent: {
    flex: 1,
  },
  sidebarItemLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  sidebarItemLabelActive: {
    color: '#6366F1',
    fontWeight: '800',
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 20,
    marginVertical: 12,
  },
  sidebarLogoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 12,
    gap: 12,
    backgroundColor: '#FFF5F5',
  },
  sidebarLogoutLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF5252',
  },
  container: {
    paddingBottom: 20,
    paddingTop: 8,
  },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginHorizontal: 12,
    marginTop: 16,
    marginBottom: 20,
    borderRadius: 18,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerGreeting: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.92,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  headerBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    borderLeftWidth: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    flex: 1,
    letterSpacing: 0.3,
  },
  seeAllLink: {
    fontSize: 13,
    color: '#6366F1',
    fontWeight: '700',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  itemIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f7fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 3,
  },
  priorityBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
});
