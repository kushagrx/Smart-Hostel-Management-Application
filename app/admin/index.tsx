import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isAdmin, setStoredUser, useUser } from '../../utils/authUtils';
import { Complaint, subscribeToAllComplaints } from '../../utils/complaintsSyncUtils';
import { LeaveRequest, subscribeToPendingLeaves } from '../../utils/leavesUtils';

const MOCK_ROOMS = [{ id: 'r1', number: '101' }, { id: 'r2', number: '102' }];


const navItems = [
  { id: 'students', label: 'Students', icon: 'account-group', color: '#6366F1' },
  { id: 'rooms', label: 'Rooms', icon: 'door-closed', color: '#8B5CF6' },
  { id: 'complaints', label: 'Complaints', icon: 'alert-circle', color: '#EC4899' },
  { id: 'leaves', label: 'Leaves', icon: 'calendar-clock', color: '#06B6D4' },
  { id: 'services', label: 'Services', icon: 'room-service', color: '#10B981' },
  { id: 'notices', label: 'Notices', icon: 'bullhorn', color: '#3B82F6' },
];

export default function AdminDashboard() {
  const user = useUser();
  const router = useRouter();
  const [activeNav, setActiveNav] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recentNotices, setRecentNotices] = useState<any[]>([]);
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);

  useEffect(() => {
    let unsubscribeNotices: () => void;
    let unsubscribeComplaints: () => void;

    const fetchRecentNotices = async () => {
      try {
        const { getDbSafe } = await import('../../utils/firebase');
        const { collection, query, orderBy, limit, onSnapshot } = await import('firebase/firestore');
        const db = getDbSafe();
        if (!db) return;

        const q = query(collection(db, 'notices'), orderBy('date', 'desc'), limit(3));
        unsubscribeNotices = onSnapshot(q, (snapshot) => {
          setRecentNotices(snapshot.docs.map(doc => {
            const data = doc.data();
            let dateVal = data.date;
            if (dateVal?.toDate) dateVal = dateVal.toDate();
            else if (typeof dateVal === 'string') dateVal = new Date(dateVal);

            return {
              id: doc.id,
              ...data,
              date: dateVal instanceof Date ? dateVal.toISOString().split('T')[0] : 'Today'
            };
          }));
        });
      } catch (e) {
        console.error(e);
      }
    };

    fetchRecentNotices();

    // Subscribe to complaints
    unsubscribeComplaints = subscribeToAllComplaints((data) => {
      setRecentComplaints(data.filter(c => c.status !== 'closed' && c.status !== 'resolved').slice(0, 3)); // Only show recent 3 non-closed/resolved
    });

    // Subscribe to pending leaves
    const unsubscribeLeaves = subscribeToPendingLeaves((data) => {
      setPendingLeaves(data.slice(0, 3)); // Only show top 3
    });

    return () => {
      if (unsubscribeNotices) unsubscribeNotices();
      if (unsubscribeComplaints) unsubscribeComplaints();
      unsubscribeLeaves();
    };
  }, []);

  if (!isAdmin(user)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 16 }}>Access denied. Admins only.</Text>
      </View>
    );
  }

  const handleNavPress = (id: string) => {
    setActiveNav(id);
    setSidebarOpen(false);
    if (id === 'services') {
      router.push('/admin/services');
      return;
    }
    router.push(`/admin/${id === 'students' ? 'students' : id === 'rooms' ? 'rooms' : id === 'complaints' ? 'complaints' : id === 'leaves' ? 'leaveRequests' : 'notices'}`);
  };

  return (
    <SafeAreaView style={styles.mainContainer} edges={['top']}>
      {/* Header with Hamburger Menu */}
      <LinearGradient
        colors={['#000428', '#004e92']}
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
          <Text style={styles.headerBarTitle}>Admin Portal</Text>
          <Text style={styles.headerBarSubtitle}>Welcome back, Admin</Text>
        </View>
        <View style={styles.headerIcon}>
          <MaterialIcons name="shield-check" size={24} color="#004e92" />
        </View>
      </LinearGradient>

      {/* Side Sidebar Panel */}
      {sidebarOpen && (
        <View style={styles.sidebarOverlay}>
          <TouchableOpacity
            style={styles.overlayBackground}
            onPress={() => setSidebarOpen(false)}
          />
          <View style={styles.sidebarPanel}>
            <LinearGradient colors={['#000428', '#004e92']} style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>Smart Hostel</Text>
              <TouchableOpacity onPress={() => setSidebarOpen(false)}>
                <MaterialIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>

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
                  <View style={[styles.sidebarIconContainer, { backgroundColor: activeNav === item.id ? '#004e92' : '#F1F5F9' }]}>
                    <MaterialIcons name={item.icon as any} size={22} color={activeNav === item.id ? '#fff' : '#64748B'} />
                  </View>
                  <Text style={[styles.sidebarItemLabel, activeNav === item.id && styles.sidebarItemLabelActive]}>
                    {item.label}
                  </Text>
                  {activeNav === item.id && (
                    <MaterialIcons name="chevron-right" size={20} color="#004e92" />
                  )}
                </TouchableOpacity>
              ))}

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
                <View style={[styles.sidebarIconContainer, { backgroundColor: '#FEF2F2' }]}>
                  <MaterialIcons name="logout" size={22} color="#EF4444" />
                </View>
                <Text style={styles.sidebarLogoutLabel}>Log Out</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      )}

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Quick Stats / Overview could go here */}

        {/* Recent Complaints */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <MaterialIcons name="alert-circle-outline" size={20} color="#EC4899" />
              <Text style={styles.sectionTitle}>Recent Complaints</Text>
            </View>
            <TouchableOpacity onPress={() => handleNavPress('complaints')}>
              <Text style={styles.seeAllLink}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentComplaints.length > 0 ? (
            recentComplaints.map((c) => (
              <View key={c.id} style={styles.cardItem}>
                <View style={[styles.cardIcon, { backgroundColor: c.priority === 'high' ? '#FEE2E2' : '#FFF7ED' }]}>
                  <MaterialIcons
                    name={c.priority === 'high' ? 'alert' : 'information'}
                    size={20}
                    color={c.priority === 'high' ? '#EF4444' : '#F97316'}
                  />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{c.title}</Text>
                  <Text style={styles.cardSubtitle}>by {c.studentName || 'Student'}</Text>
                </View>
                <View style={[styles.statusBadge, {
                  backgroundColor: c.status === 'resolved' ? '#DCFCE7' : c.status === 'inProgress' ? '#DBEAFE' : '#FaFaFa'
                }]}>
                  <Text style={[styles.statusText, {
                    color: c.status === 'resolved' ? '#166534' : c.status === 'inProgress' ? '#1E40AF' : '#64748B'
                  }]}>
                    {c.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No recent complaints.</Text>
            </View>
          )}
        </View>

        {/* Pending Leaves */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <MaterialIcons name="calendar-clock-outline" size={20} color="#06B6D4" />
              <Text style={styles.sectionTitle}>Pending Leaves</Text>
            </View>
            <TouchableOpacity onPress={() => handleNavPress('leaves')}>
              <Text style={styles.seeAllLink}>See All</Text>
            </TouchableOpacity>
          </View>

          {pendingLeaves.length > 0 ? (
            pendingLeaves.map((l) => (
              <View key={l.id} style={styles.cardItem}>
                <View style={[styles.cardIcon, { backgroundColor: '#ECFEFF' }]}>
                  <MaterialIcons name="calendar-clock" size={20} color="#06B6D4" />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{l.studentName || 'Student'}</Text>
                  <Text style={styles.cardSubtitle}>{l.days} days • Room {l.studentRoom}</Text>
                </View>
                <TouchableOpacity
                  style={styles.reviewBtn}
                  onPress={() => handleNavPress('leaves')}
                >
                  <Text style={styles.reviewBtnText}>Review</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No pending leaves.</Text>
            </View>
          )}
        </View>

        {/* Announcements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <MaterialIcons name="bullhorn-outline" size={20} color="#3B82F6" />
              <Text style={styles.sectionTitle}>Announcements</Text>
            </View>
            <TouchableOpacity onPress={() => handleNavPress('notices')}>
              <Text style={styles.seeAllLink}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentNotices.length > 0 ? (
            recentNotices.map((n) => (
              <View key={n.id} style={styles.cardItem}>
                <View style={[styles.cardIcon, { backgroundColor: '#EFF6FF' }]}>
                  <MaterialIcons name="bullhorn" size={20} color="#3B82F6" />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{n.title}</Text>
                  <Text style={styles.cardSubtitle}>{n.date}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No announcements yet.</Text>
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  headerBar: {
    paddingTop: 10,
    paddingBottom: 25,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#004e92',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  hamburgerBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerBarTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CBD5E1',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerBarSubtitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginTop: 2,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sidebarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    flexDirection: 'row',
  },
  overlayBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sidebarPanel: {
    width: 280,
    backgroundColor: '#fff',
    height: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  sidebarHeader: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sidebarTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  sidebarScrollView: {
    flex: 1,
    paddingVertical: 10,
  },
  sidebarScrollContent: {
    paddingBottom: 30,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  sidebarItemActive: {
    backgroundColor: '#EFF6FF',
  },
  sidebarIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  sidebarItemLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
  },
  sidebarItemLabelActive: {
    color: '#004e92',
    fontWeight: '700',
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 24,
    marginVertical: 16,
  },
  sidebarLogoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
  },
  sidebarLogoutLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#fff', // Removed default background from section unless needed
    borderRadius: 0,
    padding: 0,
    marginBottom: 24,
    shadowColor: 'transparent',
    elevation: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  seeAllLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#004e92',
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 18,
    marginBottom: 14,
    borderRadius: 24,
    shadowColor: '#94A3B8',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F8FAFC',
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  reviewBtn: {
    backgroundColor: '#004e92',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#004e92',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  reviewBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  emptyState: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  emptyStateText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
    fontStyle: 'italic',
  },
});
