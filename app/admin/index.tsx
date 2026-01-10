import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AdminSidebar from '../../components/AdminSidebar';
import AnimatedGradientHeader from '../../components/AnimatedGradientHeader';
import { performGlobalSearch, SearchResult } from '../../utils/adminSearchUtils';
import { isAdmin, useUser } from '../../utils/authUtils';
import { Complaint, subscribeToAllComplaints } from '../../utils/complaintsSyncUtils';
import { LeaveRequest, subscribeToPendingLeaves } from '../../utils/leavesUtils';
import { useTheme } from '../../utils/ThemeContext';

// debounce import moved to require to avoid type issues if needed, or keep as is.
const debounce = require('lodash.debounce');

const toggleStyles = StyleSheet.create({
  toggleBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  }
});

const AnimatedThemeToggle = ({ isDark, toggleTheme }: { isDark: boolean, toggleTheme: () => void }) => {
  // 0 = Light, 1 = Dark
  const progress = useDerivedValue(() => {
    return isDark ? withSpring(1) : withSpring(0);
  }, [isDark]);

  const rStyle = useAnimatedStyle(() => {
    const rotate = interpolate(progress.value, [0, 1], [0, 360], Extrapolate.CLAMP);
    const scale = interpolate(progress.value, [0, 0.5, 1], [1, 0.8, 1], Extrapolate.CLAMP);

    return {
      transform: [
        { rotate: `${rotate}deg` },
        { scale: scale }
      ]
    };
  });

  return (
    <TouchableOpacity
      style={[
        toggleStyles.toggleBtn,
        { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)' }
      ]}
      onPress={toggleTheme}
      activeOpacity={0.8}
    >
      <Animated.View style={rStyle}>
        <MaterialIcons
          name={isDark ? "weather-sunny" : "weather-night"}
          size={24}
          color={isDark ? "#fbbf24" : "#004e92"}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function AdminDashboard() {
  const { colors, theme, toggleTheme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useUser();

  const styles = React.useMemo(() => StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: colors.background,
      position: 'relative',
    },
    blob: {
      position: 'absolute',
      width: 300,
      height: 300,
      borderRadius: 150,
    },
    headerBar: {
      paddingTop: 20,
      paddingBottom: 30,
      paddingHorizontal: 24,
      borderBottomLeftRadius: 40,
      borderBottomRightRadius: 40,
      shadowColor: colors.primary,
      shadowOpacity: 0.3,
      shadowOffset: { width: 0, height: 12 },
      shadowRadius: 24,
      elevation: 12,
    },
    headerContentInner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    hamburgerBtn: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 22,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.25)',
    },
    headerTextContainer: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: 12,
    },
    headerBarTitle: {
      fontSize: 12,
      fontWeight: '800',
      color: 'rgba(255,255,255,0.8)',
      letterSpacing: 2,
      textTransform: 'uppercase',
      marginBottom: 6,
      textAlign: 'center',
    },
    headerBarSubtitle: {
      fontSize: 22,
      fontWeight: '800',
      color: '#fff',
      letterSpacing: 0.5,
      textAlign: 'center',
    },
    headerIcon: {
      width: 44,
      height: 44,
      borderRadius: 16,
      backgroundColor: 'rgba(255,255,255,0.9)',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },

    container: {
      padding: 24,
      paddingBottom: 60,
    },
    section: {
      marginBottom: 32,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.5,
    },
    seeAllLink: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primary,
    },
    cardItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 20,
      marginBottom: 12,
      padding: 16,
      gap: 16,
      shadowColor: colors.textSecondary,
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 12,
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardContent: {
      flex: 1,
      justifyContent: 'center',
      gap: 4,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.3,
    },
    cardSubtitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
      minWidth: 80,
      alignItems: 'center',
    },
    statusText: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    reviewBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
      shadowColor: colors.primary,
      shadowOpacity: 0.2,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    reviewBtnText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    emptyStateContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      backgroundColor: colors.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: 'dashed',
    },
    emptyStateText: {
      color: colors.textSecondary,
      fontSize: 15,
      fontWeight: '600',
    },
    searchBarContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      marginHorizontal: 20,
      marginTop: 20,
      borderRadius: 16,
      paddingHorizontal: 16,
      height: 50,
      shadowColor: colors.primary,
      shadowOpacity: 0.15,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
      elevation: 4,
    },
    searchIcon: {
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      height: '100%',
      fontSize: 16,
      color: colors.text,
    },
    resultsDropdown: {
      position: 'absolute',
      top: 150,
      left: 20,
      right: 20,
      backgroundColor: colors.card,
      borderRadius: 16,
      paddingVertical: 8,
      shadowColor: colors.textSecondary,
      shadowOpacity: 0.2,
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 24,
      elevation: 10,
      zIndex: 1000,
      maxHeight: 300,
    },
    resultItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    resultIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    resultInfo: {
      flex: 1,
    },
    resultTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    resultSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
    },
  }), [colors, theme]);
  const router = useRouter();
  const [activeNav, setActiveNav] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recentNotices, setRecentNotices] = useState<any[]>([]);
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);

  // Drawer Animation (Shared Value)
  const drawerProgress = useSharedValue(0);

  useEffect(() => {
    drawerProgress.value = sidebarOpen
      ? withTiming(1, { duration: 300 })
      : withTiming(0, { duration: 250 });
  }, [sidebarOpen]);

  const contentStyle = useAnimatedStyle(() => {
    // Slide content to the right by the width of the sidebar (280px)
    const translateX = interpolate(drawerProgress.value, [0, 1], [0, 280]);

    return {
      flex: 1,
      transform: [
        { translateX }
      ],
    };
  });

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // Debounced Search Handler
  const debouncedSearch = useCallback(
    debounce(async (text: string) => {
      if (text.length < 1) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      const results = await performGlobalSearch(text);
      setSearchResults(results);
      setIsSearching(false);
    }, 100),
    []
  );

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (!text) {
      setSearchResults([]);
      return;
    }
    debouncedSearch(text);
  };

  const handleSearchResultPress = (result: SearchResult) => {
    // Clear search interaction
    setSearchQuery('');
    setSearchResults([]);

    // Navigate based on type
    if (result.type === 'student') {
      router.push({ pathname: '/admin/students', params: { search: result.title, openId: result.id } });
    } else if (result.type === 'room') {
      const roomNum = result.title.replace('Room ', '');
      router.push({ pathname: '/admin/rooms', params: { search: roomNum, openRoomId: result.id } });
    } else if (result.type === 'complaint') {
      router.push('/admin/complaints');
    }
  };

  useEffect(() => {
    // Wait for user to be loaded and verified as admin before subscribing
    if (!isAdmin(user)) return;

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
        }, (error) => {
          console.error("Error subscribing to notices:", error);
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
  }, [user]);

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
    <View style={styles.mainContainer}>
      <AdminSidebar
        onClose={() => setSidebarOpen(false)}
        activeNav={activeNav}
        drawerProgress={drawerProgress}
      />

      <Animated.View style={[contentStyle, { backgroundColor: colors.background }]}>
        {/* ... blobs ... */}

        <SafeAreaView style={{ flex: 1 }} edges={['left', 'right', 'bottom']}>
          {/* Animated Header */}
          <AnimatedGradientHeader style={[styles.headerBar, { paddingTop: insets.top + 20 }]}>
            <View style={styles.headerContentInner}>
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
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <AnimatedThemeToggle isDark={isDark} toggleTheme={toggleTheme} />

              </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchBarContainer}>
              <MaterialIcons name="magnify" size={20} color="#004e92" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search students, rooms..."
                placeholderTextColor="rgba(0, 78, 146, 0.6)"
                value={searchQuery}
                onChangeText={handleSearch}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {isSearching && (
                <ActivityIndicator size="small" color="#004e92" style={{ marginRight: 10 }} />
              )}
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults([]); }}>
                  <MaterialIcons name="close-circle" size={20} color="rgba(0,0,0,0.3)" />
                </TouchableOpacity>
              )}
            </View>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <View style={styles.resultsDropdown}>
                {searchResults.map((result) => (
                  <TouchableOpacity
                    key={`${result.type}-${result.id}`}
                    style={styles.resultItem}
                    onPress={() => handleSearchResultPress(result)}
                  >
                    <View style={[styles.resultIcon, { backgroundColor: result.type === 'student' ? '#E0E7FF' : '#F3E8FF' }]}>
                      <MaterialIcons
                        name={result.type === 'student' ? 'account' : 'door-closed'}
                        size={20}
                        color={result.type === 'student' ? '#4F46E5' : '#9333EA'}
                      />
                    </View>
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultTitle}>{result.title}</Text>
                      <Text style={styles.resultSubtitle}>{result.subtitle}</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={20} color="#CBD5E1" />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </AnimatedGradientHeader>

          {/* Side Sidebar Panel - Moved outside content wrapper */}


          {/* Main Content */}
          <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
          >

            {/* Recent Complaints */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Complaints</Text>
                <TouchableOpacity onPress={() => handleNavPress('complaints')}>
                  <Text style={styles.seeAllLink}>See All</Text>
                </TouchableOpacity>
              </View>

              {recentComplaints.length > 0 ? (
                recentComplaints.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={styles.cardItem}
                    onPress={() => router.push({ pathname: '/admin/complaints', params: { openId: c.id } })}
                  >
                    <View style={[styles.cardIcon, { backgroundColor: c.priority === 'high' ? '#FEF2F2' : '#FFF7ED' }]}>
                      <MaterialIcons
                        name={c.priority === 'high' ? 'alert' : 'information'}
                        size={24}
                        color={c.priority === 'high' ? '#EF4444' : '#F97316'}
                      />
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle} numberOfLines={1}>{c.title}</Text>
                      <Text style={styles.cardSubtitle}>by {c.studentName || 'Student'}</Text>
                    </View>
                    <View style={[styles.statusBadge, {
                      backgroundColor: c.status === 'resolved' ? '#DCFCE7' : c.status === 'inProgress' ? '#DBEAFE' : '#F1F5F9'
                    }]}>
                      <Text style={[styles.statusText, {
                        color: c.status === 'resolved' ? '#166534' : c.status === 'inProgress' ? '#1E40AF' : '#475569'
                      }]}>
                        {c.status.toUpperCase()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyStateContainer}>
                  <Text style={styles.emptyStateText}>No recent complaints.</Text>
                </View>
              )}
            </View>

            {/* Pending Leaves */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Pending Leaves</Text>
                <TouchableOpacity onPress={() => handleNavPress('leaves')}>
                  <Text style={styles.seeAllLink}>See All</Text>
                </TouchableOpacity>
              </View>

              {pendingLeaves.length > 0 ? (
                pendingLeaves.map((l) => (
                  <TouchableOpacity
                    key={l.id}
                    style={styles.cardItem}
                    onPress={() => router.push({ pathname: '/admin/leaveRequests', params: { openId: l.id } })}
                  >
                    <View style={[styles.cardIcon, { backgroundColor: '#ECFEFF' }]}>
                      <MaterialIcons name="calendar-clock" size={24} color="#06B6D4" />
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle} numberOfLines={1}>{l.studentName || 'Student'}</Text>
                      <Text style={styles.cardSubtitle}>{l.days} days • Room {l.studentRoom}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyStateContainer}>
                  <Text style={styles.emptyStateText}>No pending leaves.</Text>
                </View>
              )}
            </View>

            {/* Announcements */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Announcements</Text>
                <TouchableOpacity onPress={() => handleNavPress('notices')}>
                  <Text style={styles.seeAllLink}>See All</Text>
                </TouchableOpacity>
              </View>

              {recentNotices.length > 0 ? (
                recentNotices.map((n) => (
                  <TouchableOpacity
                    key={n.id}
                    style={styles.cardItem}
                    onPress={() => router.push({ pathname: '/admin/notices', params: { openId: n.id } })}
                  >
                    <View style={[styles.cardIcon, { backgroundColor: '#EFF6FF' }]}>
                      <MaterialIcons name="bullhorn" size={24} color="#3B82F6" />
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle} numberOfLines={1}>{n.title}</Text>
                      <Text style={styles.cardSubtitle}>{n.date}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyStateContainer}>
                  <Text style={styles.emptyStateText}>No announcements yet.</Text>
                </View>
              )}
            </View>


          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}



