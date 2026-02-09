import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AdminNotificationOverlay from '../../components/AdminNotificationOverlay';
import AdminSidebar from '../../components/AdminSidebar';
import MessStatsBanner from '../../components/MessStatsBanner';

import AnimatedGradientHeader from '../../components/AnimatedGradientHeader';
import { useRefresh } from '../../hooks/useRefresh';
import { performGlobalSearch, SearchResult } from '../../utils/adminSearchUtils';
import { isAdmin, useUser } from '../../utils/authUtils';
import { Complaint, subscribeToAllComplaints } from '../../utils/complaintsSyncUtils';
import { LeaveRequest, subscribeToPendingLeaves } from '../../utils/leavesUtils';
import { subscribeToNotifications } from '../../utils/notificationUtils';
import { useTheme } from '../../utils/ThemeContext';

// debounce import moved to require to avoid type issues if needed, or keep as is.
const debounce = require('lodash.debounce');

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.8;

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
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Drawer Animation (Shared Value)
  const drawerProgress = useSharedValue(0);

  // Sync Shared Value with State to avoid closure staleness in worklets
  const isSidebarOpenSV = useSharedValue(sidebarOpen ? 1 : 0);
  useEffect(() => {
    isSidebarOpenSV.value = sidebarOpen ? 1 : 0;
  }, [sidebarOpen]);

  // Gesture Handler
  const panGesture = Gesture.Pan()
    // Require 20px horiz movement to start (filters out vertical scroll intentions)
    .activeOffsetX([-20, 20])
    // Fail if vertical movement exceeds 20px (let ScrollView have it)
    .failOffsetY([-20, 20])
    .onUpdate((e) => {
      // Use SharedValue for current state reference on UI thread
      const isOpen = isSidebarOpenSV.value === 1;

      const targetValue = isOpen
        ? 1 + (e.translationX / DRAWER_WIDTH)
        : (e.translationX / DRAWER_WIDTH);

      // Clamp between 0 and 1
      drawerProgress.value = Math.min(Math.max(targetValue, 0), 1);
    })
    .onEnd((e) => {
      const isOpen = isSidebarOpenSV.value === 1;
      let shouldOpen = isOpen;

      // If dragged significantly
      if (Math.abs(e.translationX) > 40) {
        // Swipe Velocity Check
        if (Math.abs(e.velocityX) > 500) {
          shouldOpen = e.velocityX > 0;
        } else {
          // Position check
          // If opening (was closed): > 0.5
          // If closing (was open): > 0.5
          // User requested "if half opened, just close it" - we use 0.5 as split
          shouldOpen = drawerProgress.value > 0.5;
        }
      } else {
        // If barely moved, revert to original state
        shouldOpen = isOpen;
      }

      // Important: Animate immediately on UI thread.
      // If we rely solely on useEffect, React might skip the update if state doesn't change (e.g. true -> true),
      // leaving the drawer stuck in the middle.
      drawerProgress.value = withSpring(shouldOpen ? 1 : 0, {
        damping: 20,
        stiffness: 90,
        mass: 0.5,
        overshootClamping: false
      });

      runOnJS(setSidebarOpen)(shouldOpen);
    });

  useEffect(() => {
    // Use spring for a natural, physical feeling
    drawerProgress.value = withSpring(sidebarOpen ? 1 : 0, {
      damping: 20,
      stiffness: 90,
      mass: 0.5,
      overshootClamping: false
    });
  }, [sidebarOpen]);

  // Derived style for the main content (Homepage)
  const contentStyle = useAnimatedStyle(() => {
    // Homepage slides right as sidebar opens
    const translateX = interpolate(drawerProgress.value, [0, 1], [0, DRAWER_WIDTH + 7]); // +7px Gap
    const borderRadius = interpolate(drawerProgress.value, [0, 1], [0, 20]); // Reduced Radius

    return {
      flex: 1,
      transform: [
        { translateX }
      ],
      borderRadius,
      overflow: 'hidden', // Ensure content clips to new radius
    };
  });

  // Deep dark navy for the gap (void look)
  const containerStyle = {
    flex: 1,
    backgroundColor: '#000212',
    position: 'relative' as 'relative',
  };

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  // const [refreshing, setRefreshing] = useState(false); // Managed by useRefresh
  const searchRef = React.useRef('');

  const { refreshing, onRefresh } = useRefresh(async () => {
    // Re-fetch all subscriptions/data
    // Since subscriptions are real-time, we might just want to trigger a visual refresh or re-sync if needed
    // But for "pull to refresh" usually expects an explicit fetch. 
    // Given the current architecture uses subscriptions, we'll simulate a fetch delay or re-trigger subscriptions if possible.
    // However, the user specifically asked: "reloads should get latest data". Subscriptions already do this.
    // So we will just add a visual delay to indicate "checking".
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

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

      // RACECONDITION FIX: Check if the search text still matches the current input
      if (searchRef.current !== text) {
        return;
      }

      setSearchResults(results);
      setIsSearching(false);
    }, 300), // Increased debounce slightly to reduce flicker
    []
  );

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    searchRef.current = text; // Update ref immediately

    if (!text) {
      setSearchResults([]);
      setIsSearching(false);
      debouncedSearch.cancel(); // Cancel any pending searches
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

    let unsubscribeComplaints: () => void;

    // Subscribe to complaints
    unsubscribeComplaints = subscribeToAllComplaints((data) => {
      setRecentComplaints(data.filter(c => c.status !== 'closed' && c.status !== 'resolved').slice(0, 3)); // Only show recent 3 non-closed/resolved
    });

    // Subscribe to pending leaves
    const unsubscribeLeaves = subscribeToPendingLeaves((data) => {
      setPendingLeaves(data.slice(0, 3)); // Only show top 3
    });

    // Subscribe to notifications count
    const unsubscribeNotifs = subscribeToNotifications((data) => {
      setUnreadCount(data.length);
    });

    return () => {
      if (unsubscribeComplaints) unsubscribeComplaints();
      unsubscribeLeaves();
      unsubscribeNotifs();
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
    <GestureDetector gesture={panGesture}>
      <View style={containerStyle}>
        <AdminSidebar
          onClose={() => setSidebarOpen(false)}
          activeNav={activeNav}
          drawerProgress={drawerProgress}
        />

        <AdminNotificationOverlay
          visible={notificationVisible}
          onClose={() => setNotificationVisible(false)}
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
                  <TouchableOpacity onPress={() => setNotificationVisible(true)}>
                    <View style={styles.headerIcon}>
                      <MaterialIcons name="bell-outline" size={24} color="#004e92" />
                      {unreadCount > 0 && (
                        <View style={{
                          position: 'absolute',
                          top: -2, right: -2,
                          backgroundColor: '#EF4444',
                          width: 16, height: 16,
                          borderRadius: 8,
                          justifyContent: 'center', alignItems: 'center',
                          borderWidth: 2, borderColor: '#fff'
                        }}>
                          <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#fff' }}>
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Search Bar */}
              <View style={styles.searchBarContainer}>
                <MaterialIcons name="magnify" size={20} color={isDark ? "rgba(255,255,255,0.7)" : "#004e92"} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search students, rooms..."
                  placeholderTextColor={isDark ? "rgba(255,255,255,0.5)" : "rgba(0, 78, 146, 0.6)"}
                  value={searchQuery}
                  onChangeText={handleSearch}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {isSearching && (
                  <ActivityIndicator size="small" color={isDark ? "#fff" : "#004e92"} style={{ marginRight: 10 }} />
                )}
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults([]); }}>
                    <MaterialIcons name="close-circle" size={20} color={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.3)"} />
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

              {/* Add Student Action Button */}
              {/* Add Student Text Link */}
              {/* Quick Actions (Text Only) */}
              <View style={{ marginBottom: 20, marginTop: -8 }}>
                {/* First Row: Add Student, Attendance, Messages */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: colors.card,
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      borderRadius: 12,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3,
                      alignItems: 'center',
                    }}
                    activeOpacity={0.6}
                    onPress={() => router.push({ pathname: '/admin/students', params: { action: 'allot' } })}
                  >
                    <Text style={{ fontSize: 10, fontWeight: '700', color: colors.text, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                      Add Student
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      backgroundColor: colors.card,
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      borderRadius: 12,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3,
                      alignItems: 'center',
                    }}
                    activeOpacity={0.6}
                    onPress={() => router.push('/admin/attendance')}
                  >
                    <Text style={{ fontSize: 10, fontWeight: '700', color: colors.text, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                      Attendance
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      backgroundColor: colors.card,
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      borderRadius: 12,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3,
                      alignItems: 'center',
                    }}
                    activeOpacity={0.6}
                    onPress={() => router.push('/chat')}
                  >
                    <Text style={{ fontSize: 10, fontWeight: '700', color: colors.text, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                      Messages
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Second Row: Analytics */}
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: colors.card,
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      borderRadius: 12,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3,
                      alignItems: 'center',
                    }}
                    activeOpacity={0.6}
                    onPress={() => router.push('/admin/analytics')}
                  >
                    <Text style={{ fontSize: 10, fontWeight: '700', color: colors.text, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                      Analytics
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Mess Headcount */}
              <MessStatsBanner compact />

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
                      onPress={() => router.push(`/admin/complaints?openId=${c.id}`)}
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
                      onPress={() => router.push(`/admin/leaveRequests?openId=${l.id}`)}
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


            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </GestureDetector>
  );
}
