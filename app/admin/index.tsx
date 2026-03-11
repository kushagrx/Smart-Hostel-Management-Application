import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
import { API_BASE_URL } from '../../utils/api';
import { isAdmin, useUser } from '../../utils/authUtils';
import { Complaint, subscribeToAllComplaints, updateComplaintStatus } from '../../utils/complaintsSyncUtils';
import { LeaveRequest, subscribeToPendingLeaves, updateLeaveStatus } from '../../utils/leavesUtils';
import { subscribeToNotifications } from '../../utils/notificationUtils';
import { useTheme } from '../../utils/ThemeContext';

// debounce import moved to require to avoid type issues if needed, or keep as is.
const debounce = require('lodash.debounce');

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.8;

const toggleStyles = StyleSheet.create({
  toggleBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
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
        { backgroundColor: 'rgba(255,255,255,0.12)' }
      ]}
      onPress={toggleTheme}
      activeOpacity={0.8}
    >
      <Animated.View style={rStyle}>
        <MaterialIcons
          name={isDark ? "weather-sunny" : "weather-night"}
          size={24}
          color={isDark ? "#fbbf24" : "#fff"}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

interface GridActionProps {
  icon: any;
  label: string;
  route: any;
  iconColor: string;
  isDark: boolean;
  onPress?: () => void;
}

const GridAction = ({ icon, label, route, iconColor, isDark, onPress }: GridActionProps) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (route) {
      router.push(route);
    }
  };

  return (
    <View style={{ width: '25%', alignItems: 'center', marginBottom: 20 }}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handlePress}
        style={{ alignItems: 'center', gap: 8 }}
      >
        <View style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9', // Soft background
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.03)',
        }}>
          <MaterialIcons name={icon} size={28} color={iconColor} />
        </View>
        <Text style={{
          color: isDark ? 'rgba(255,255,255,0.9)' : '#334155',
          fontSize: 11,
          fontWeight: '700',
          textAlign: 'center',
          marginTop: 2,
        }} numberOfLines={2}>
          {label}
        </Text>
      </TouchableOpacity>
    </View>
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
    headerBar: {
      paddingTop: 20,
      paddingBottom: 28,
      paddingHorizontal: 20,
      borderBottomLeftRadius: 32,
      borderBottomRightRadius: 32,
    },
    headerContentInner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    hamburgerBtn: {
      width: 46,
      height: 46,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    headerTextContainer: {
      flex: 1,
      paddingHorizontal: 14,
    },
    headerBarTitle: {
      fontSize: 11,
      fontWeight: '700',
      color: 'rgba(255,255,255,0.55)',
      letterSpacing: 3,
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    headerBarSubtitle: {
      fontSize: 20,
      fontWeight: '800',
      color: '#fff',
      letterSpacing: -0.3,
    },
    headerIcon: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor: 'rgba(255,255,255,0.12)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
    },

    container: {
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: 60,
    },
    section: {
      marginBottom: 24,
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
    emptyStateContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      backgroundColor: colors.card,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: 'dashed',
    },
    emptyStateText: {
      color: colors.textSecondary,
      fontSize: 15,
      fontWeight: '600',
    },
    cardItem: {
      width: SCREEN_WIDTH * 0.85,
      marginRight: 16,
      backgroundColor: isDark ? 'rgba(30, 41, 59, 0.5)' : colors.card,
      borderRadius: 20,
      padding: 14,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 10,
    },
    studentInfoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 12,
    },
    studentAvatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: isDark ? '#334155' : '#F1F5F9',
      marginRight: 10,
    },
    studentName: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 1,
    },
    studentRoomText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    cardContentDetailed: {
      marginBottom: 10,
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 4,
      letterSpacing: -0.3,
    },
    cardSubtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    cardFooterRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
      paddingTop: 16,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    statusText: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    leaveCardItem: {
      width: SCREEN_WIDTH * 0.85,
      marginRight: 16,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      gap: 12,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
      shadowColor: '#000',
      shadowOpacity: isDark ? 0.2 : 0.05,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
      elevation: 2,
    },
    leaveCardIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    leaveCardContent: {
      flex: 1,
      justifyContent: 'center',
      gap: 2,
    },
    leaveCardTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 2,
    },
    leaveCardSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    searchBarContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: 16,
      paddingHorizontal: 16,
      height: 48,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.15)',
    },
    searchIcon: {
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      height: '100%',
      fontSize: 15,
      fontWeight: '600',
      color: '#fff',
    },
    resultsDropdown: {
      marginTop: 12,
      backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(0, 40, 80, 0.92)',
      borderRadius: 20,
      paddingVertical: 8,
      zIndex: 1000,
      maxHeight: 400,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
    },
    resultItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    resultIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
    },
    resultInfo: {
      flex: 1,
      gap: 2,
    },
    resultTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.3,
    },
    resultSubtitle: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
    },
  }), [colors, theme, isDark]);
  const router = useRouter();
  const [activeNav, setActiveNav] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
  const [activePagingIndex, setActivePagingIndex] = useState(0);
  const [loadingActions, setLoadingActions] = useState<Record<string, string>>({});
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

  // Action Handlers with loading states

  // Action Handlers with loading states
  const handleComplaintAction = async (id: string, status: 'inProgress' | 'resolved') => {
    const actionKey = `complaint-${id}`;
    console.log(`[DEBUG] Starting complaint action: ${actionKey} -> ${status}`);
    setLoadingActions(prev => ({ ...prev, [actionKey]: status }));
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      await updateComplaintStatus(id, status);
      console.log(`[DEBUG] Complaint action success: ${actionKey}`);
      Alert.alert('Success', `Complaint marked as ${status}`);
    } catch (e) {
      console.error(`[DEBUG] Complaint action failed: ${actionKey}`, e);
      Alert.alert('Error', 'Failed to update complaint.');
    } finally {
      setLoadingActions(prev => {
        const next = { ...prev };
        delete next[actionKey];
        return next;
      });
    }
  };

  const handleLeaveAction = async (id: string, status: 'approved' | 'rejected') => {
    const actionKey = `leave-${id}`;
    console.log(`[DEBUG] Starting leave action: ${actionKey} -> ${status}`);
    setLoadingActions(prev => ({ ...prev, [actionKey]: status }));
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      await updateLeaveStatus(id, status);
      console.log(`[DEBUG] Leave action success: ${actionKey}`);
      Alert.alert('Success', `Leave ${status}`);
    } catch (e) {
      console.error(`[DEBUG] Leave action failed: ${actionKey}`, e);
      Alert.alert('Error', 'Failed to update leave.');
    } finally {
      setLoadingActions(prev => {
        const next = { ...prev };
        delete next[actionKey];
        return next;
      });
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

        <Animated.View style={[contentStyle, { flex: 1 }]}>
          <LinearGradient
            colors={isDark ? ['#020617', '#0f172a'] : [colors.background, colors.background]}
            style={StyleSheet.absoluteFill}
          />

          {isDark && (
            <View style={StyleSheet.absoluteFill}>
              <View style={{
                position: 'absolute',
                top: -100,
                left: -50,
                width: 300,
                height: 300,
                borderRadius: 150,
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                filter: [{ blur: 80 }]
              }} />
              <View style={{
                position: 'absolute',
                bottom: 100,
                right: -100,
                width: 400,
                height: 400,
                borderRadius: 200,
                backgroundColor: 'rgba(139, 92, 246, 0.12)',
                filter: [{ blur: 100 }]
              }} />
            </View>
          )}

          <SafeAreaView style={{ flex: 1 }} edges={['left', 'right', 'bottom']}>

            {/* Main Content - Header scrolls with page */}
            <ScrollView
              contentContainerStyle={{ paddingBottom: 60 }}
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
            >
              {/* Animated Header (scrolls with content) */}
              <AnimatedGradientHeader style={[styles.headerBar, { paddingTop: insets.top + 16 }]}>
                <View style={styles.headerContentInner}>
                  <TouchableOpacity
                    style={styles.hamburgerBtn}
                    onPress={() => setSidebarOpen(!sidebarOpen)}
                  >
                    <MaterialIcons name="menu" size={24} color="#fff" />
                  </TouchableOpacity>
                  <View style={styles.headerTextContainer}>
                    <Text style={styles.headerBarTitle}>Admin Portal</Text>
                    <Text style={styles.headerBarSubtitle}>
                      {user?.name ? `Hi, ${user.name.split(' ')[0]}` : 'Welcome back'}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <AnimatedThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
                    <TouchableOpacity onPress={() => setNotificationVisible(true)}>
                      <View style={styles.headerIcon}>
                        <MaterialIcons name="bell-outline" size={22} color="#fff" />
                        {unreadCount > 0 && (
                          <View style={{
                            position: 'absolute',
                            top: -4, right: -4,
                            backgroundColor: '#EF4444',
                            minWidth: 18, height: 18,
                            borderRadius: 9,
                            justifyContent: 'center', alignItems: 'center',
                            borderWidth: 2, borderColor: '#004e92',
                            paddingHorizontal: 4,
                          }}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#fff' }}>
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
                  <MaterialIcons name="magnify" size={20} color="rgba(255,255,255,0.6)" style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search students, rooms..."
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={searchQuery}
                    onChangeText={handleSearch}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {isSearching && (
                    <ActivityIndicator size="small" color="#fff" style={{ marginRight: 10 }} />
                  )}
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults([]); }}>
                      <MaterialIcons name="close-circle" size={20} color="rgba(255,255,255,0.5)" />
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
                        <View style={[styles.resultIcon, { backgroundColor: result.type === 'student' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(147, 51, 234, 0.15)' }]}>
                          <MaterialIcons
                            name={result.type === 'student' ? 'account' : 'door-closed'}
                            size={20}
                            color={result.type === 'student' ? '#818CF8' : '#A855F7'}
                          />
                        </View>
                        <View style={styles.resultInfo}>
                          <Text style={styles.resultTitle}>{result.title}</Text>
                          <Text style={styles.resultSubtitle}>{result.subtitle}</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={20} color="rgba(255,255,255,0.3)" />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </AnimatedGradientHeader>

              {/* Dashboard Content */}
              <View style={{ paddingHorizontal: 24 }}>

                {/* Quick Actions */}
                <View style={[styles.section, { marginBottom: 16, marginTop: 0, marginHorizontal: -24 }]}>
                  <View style={[styles.sectionHeader, { paddingHorizontal: 28, marginTop: 22, marginBottom: 22 }]}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                  </View>
                  <View style={{
                    paddingVertical: 12,
                    paddingTop: 0,
                  }}>
                    <ScrollView
                      horizontal
                      pagingEnabled
                      showsHorizontalScrollIndicator={false}
                      decelerationRate="fast"
                      contentContainerStyle={{ alignItems: 'flex-start' }}
                      onScroll={(e) => {
                        const offset = e.nativeEvent.contentOffset.x;
                        const index = Math.round(offset / SCREEN_WIDTH);
                        if (index !== activePagingIndex) setActivePagingIndex(index);
                      }}
                      scrollEventThrottle={16}
                    >
                      {/* Page 1 (Primary Tools) */}
                      <View style={{ width: SCREEN_WIDTH, flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 }}>
                        <GridAction icon="account-plus-outline" label="Admissions" route={{ pathname: '/admin/students', params: { action: 'allot' } }} iconColor={colors.primary} isDark={isDark} />
                        <GridAction icon="calendar-check-outline" label="Attendance" route="/admin/attendance" iconColor={colors.primary} isDark={isDark} />
                        <GridAction icon="message-text-outline" label="Messages" route="/chat" iconColor={colors.primary} isDark={isDark} />
                        <GridAction icon="silverware-fork-knife" label="Menu" route="/admin/messMenu" iconColor={colors.primary} isDark={isDark} />

                        <GridAction icon="bus" label="Bus Timing" route="/admin/busTimings" iconColor={colors.primary} isDark={isDark} />
                        <GridAction icon="cash-multiple" label="Finance" route="/admin/finance" iconColor={colors.primary} isDark={isDark} />
                        <GridAction icon="google-analytics" label="Analytics" route="/admin/analytics" iconColor={colors.primary} isDark={isDark} />
                        <GridAction icon="calendar-clock" label="Leaves" route="/admin/leaveRequests" iconColor={colors.primary} isDark={isDark} />
                      </View>

                      {/* Page 2 (Secondary Tools) */}
                      <View style={{ width: SCREEN_WIDTH, flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 }}>
                        <GridAction icon="bullhorn-outline" label="Notice" route="/admin/notices" iconColor={colors.primary} isDark={isDark} />
                        <GridAction icon="door-closed" label="Rooms" route="/admin/rooms" iconColor={colors.primary} isDark={isDark} />
                        <GridAction icon="alert-circle-outline" label="Complaints" route="/admin/complaints" iconColor={colors.primary} isDark={isDark} />
                        <GridAction icon="tshirt-crew" label="Laundry" route="/admin/laundry" iconColor={colors.primary} isDark={isDark} />

                        <GridAction icon="bell-ring-outline" label="Emergency" route="/admin/emergency" iconColor={colors.primary} isDark={isDark} />
                        <GridAction icon="account-clock" label="Visitors" route="/admin/visitors" iconColor={colors.primary} isDark={isDark} />
                        <GridAction icon="office-building" label="About Hostel" route="/admin/facilities" iconColor={colors.primary} isDark={isDark} />
                        <GridAction icon="file-document-outline" label="Reports" route={{ pathname: '/admin/students', params: { action: 'export' } }} iconColor={colors.primary} isDark={isDark} />
                      </View>
                    </ScrollView>

                    {/* Tiny Pagination Dots */}
                    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 4 }}>
                      <View style={{
                        width: activePagingIndex === 0 ? 12 : 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: activePagingIndex === 0
                          ? colors.primary
                          : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'),
                        opacity: activePagingIndex === 0 ? 1 : 0.5
                      }} />
                      <View style={{
                        width: activePagingIndex === 1 ? 12 : 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: activePagingIndex === 1
                          ? colors.primary
                          : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'),
                        opacity: activePagingIndex === 1 ? 1 : 0.5
                      }} />
                    </View>
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
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      snapToInterval={(SCREEN_WIDTH * 0.85) + 16}
                      decelerationRate="fast"
                      style={{ marginHorizontal: -24 }}
                      contentContainerStyle={{ paddingLeft: 24, paddingBottom: 8, paddingRight: 24 }}
                    >
                      {recentComplaints.map((c) => (
                        <View
                          key={c.id}
                          style={[styles.cardItem, { width: SCREEN_WIDTH * 0.85 }]}
                        >
                          <TouchableOpacity
                            onPress={() => router.push(`/admin/complaints?openId=${c.id}`)}
                            activeOpacity={0.7}
                          >
                            {/* Student Info Header */}
                            <View style={styles.cardHeader}>
                              <View style={styles.studentInfoRow}>
                                <Image
                                  source={{ uri: c.studentProfilePhoto ? `${API_BASE_URL}${c.studentProfilePhoto}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(c.studentName || 'S')}&background=E2E8F0&color=64748B` }}
                                  style={styles.studentAvatar}
                                  contentFit="cover"
                                />
                                <View>
                                  <Text style={styles.studentName} numberOfLines={1}>{c.studentName || 'Unknown Student'}</Text>
                                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <Text style={styles.studentRoomText}>Room {c.studentRoom || (c as any).roomNo || (c as any).room_number || (c as any).room || 'N/A'}</Text>
                                    {c.priority && (
                                      <View style={[styles.statusBadge, {
                                        backgroundColor: c.priority === 'high' || c.priority === 'emergency' ? '#FEF2F2' : (c.priority === 'medium' ? '#FFF7ED' : isDark ? 'rgba(56, 189, 248, 0.1)' : '#E0F2FE'),
                                        paddingHorizontal: 6,
                                        paddingVertical: 2
                                      }]}>
                                        <Text style={[styles.statusText, {
                                          fontSize: 10,
                                          color: c.priority === 'high' || c.priority === 'emergency' ? '#EF4444' : (c.priority === 'medium' ? '#F97316' : isDark ? '#38BDF8' : '#0284C7')
                                        }]}>
                                          Priority: {c.priority.toUpperCase()}
                                        </Text>
                                      </View>
                                    )}
                                  </View>
                                </View>
                              </View>
                              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                                {/* Status in top right */}
                                <View style={[styles.statusBadge, {
                                  backgroundColor: c.status === 'resolved' ? '#DCFCE7' : c.status === 'inProgress' ? '#DBEAFE' : c.status === 'open' ? '#FEF9C3' : (isDark ? 'rgba(255,255,255,0.1)' : '#F1F5F9')
                                }]}>
                                  <Text style={[styles.statusText, {
                                    color: c.status === 'resolved' ? '#166534' : c.status === 'inProgress' ? '#1E40AF' : c.status === 'open' ? '#854D0E' : (isDark ? '#E2E8F0' : '#475569')
                                  }]}>
                                    {c.status?.toUpperCase() || 'OPEN'}
                                  </Text>
                                </View>
                                <Text style={{ fontSize: 11, color: colors.textSecondary, fontWeight: '700' }}>
                                  {c.createdAt ? new Date(c.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : ''}
                                </Text>
                              </View>
                            </View>

                            {/* Massive Details Block */}
                            <View style={styles.cardContentDetailed}>
                              <Text style={styles.cardTitle} numberOfLines={2}>
                                {c.status === 'resolved' ? <Text style={{ textDecorationLine: 'line-through' }}>{c.title}</Text> : c.title}
                              </Text>
                              <Text style={styles.cardSubtitle} numberOfLines={3}>{c.description || 'No additional details provided.'}</Text>
                            </View>
                          </TouchableOpacity>

                          {/* Action Buttons Row */}
                          {c.status !== 'resolved' && (
                            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                              {c.status === 'open' && (
                                <TouchableOpacity
                                  style={{
                                    flex: 1,
                                    backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
                                    borderRadius: 12,
                                    paddingVertical: 10,
                                    alignItems: 'center',
                                    opacity: loadingActions[`complaint-${c.id}`] ? 0.6 : 1
                                  }}
                                  disabled={!!loadingActions[`complaint-${c.id}`]}
                                  onPress={() => handleComplaintAction(c.id, 'inProgress')}
                                >
                                  <Text style={{ color: '#3B82F6', fontWeight: '700', fontSize: 13 }}>
                                    {loadingActions[`complaint-${c.id}`] === 'inProgress' ? 'Marking...' : 'Mark In-Progress'}
                                  </Text>
                                </TouchableOpacity>
                              )}
                              <TouchableOpacity
                                style={{
                                  flex: 1,
                                  backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : '#F0FDF4',
                                  borderRadius: 12,
                                  paddingVertical: 10,
                                  alignItems: 'center',
                                  opacity: loadingActions[`complaint-${c.id}`] ? 0.6 : 1
                                }}
                                disabled={!!loadingActions[`complaint-${c.id}`]}
                                onPress={() => handleComplaintAction(c.id, 'resolved')}
                              >
                                <Text style={{ color: '#22C55E', fontWeight: '700', fontSize: 13 }}>
                                  {loadingActions[`complaint-${c.id}`] === 'resolved' ? 'Resolving...' : 'Resolve Issue'}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      ))}
                    </ScrollView>
                  ) : (
                    <View style={styles.emptyStateContainer}>
                      <Text style={styles.emptyStateText}>No recent complaints.</Text>
                    </View>
                  )}
                </View>

                {/* Pending Leaves */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Leaves</Text>
                    <TouchableOpacity onPress={() => handleNavPress('leaves')}>
                      <Text style={styles.seeAllLink}>See All</Text>
                    </TouchableOpacity>
                  </View>

                  {pendingLeaves.length > 0 ? (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      snapToInterval={(SCREEN_WIDTH * 0.85) + 16}
                      decelerationRate="fast"
                      style={{ marginHorizontal: -24 }}
                      contentContainerStyle={{ paddingLeft: 24, paddingBottom: 8, paddingRight: 24 }}
                    >
                      {pendingLeaves.map((l) => (
                        <View
                          key={l.id}
                          style={[styles.cardItem, { width: SCREEN_WIDTH * 0.85 }]}
                        >
                          <TouchableOpacity
                            onPress={() => router.push(`/admin/leaveRequests?openId=${l.id}`)}
                            activeOpacity={0.7}
                          >
                            {/* Student Info Header */}
                            <View style={styles.cardHeader}>
                              <View style={styles.studentInfoRow}>
                                <Image
                                  source={{ uri: l.studentProfilePhoto ? `${API_BASE_URL}${l.studentProfilePhoto}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(l.studentName || 'S')}&background=E2E8F0&color=64748B` }}
                                  style={styles.studentAvatar}
                                  contentFit="cover"
                                />
                                <View>
                                  <Text style={styles.studentName} numberOfLines={1}>{l.studentName || 'Student'}</Text>
                                  <Text style={styles.studentRoomText}>Room {l.studentRoom || (l as any).roomNo || (l as any).room_number || 'N/A'}</Text>
                                </View>
                              </View>
                              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                                <View style={[styles.statusBadge, {
                                  backgroundColor: l.status === 'approved' ? '#DCFCE7' : l.status === 'rejected' ? '#FEF2F2' : '#FEF9C3'
                                }]}>
                                  <Text style={[styles.statusText, {
                                    color: l.status === 'approved' ? '#166534' : l.status === 'rejected' ? '#DC2626' : '#854D0E'
                                  }]}>
                                    {l.status?.toUpperCase() || 'PENDING'}
                                  </Text>
                                </View>
                                <Text style={{ fontSize: 11, color: colors.textSecondary, fontWeight: '700' }}>
                                  {l.createdAt ? new Date(l.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : ''}
                                </Text>
                              </View>
                            </View>

                            {/* Leave Details */}
                            <View style={styles.cardContentDetailed}>
                              <Text style={styles.cardTitle} numberOfLines={1}>{l.reason || 'Leave Request'}</Text>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                <MaterialIcons name="calendar-range" size={14} color={colors.textSecondary} />
                                <Text style={{ fontSize: 12, color: colors.textSecondary, fontWeight: '600' }}>
                                  {l.startDate ? new Date(l.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'} → {l.endDate ? new Date(l.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}  •  {l.days} day{l.days !== 1 ? 's' : ''}
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>

                          {/* Action Buttons Row */}
                          {l.status === 'pending' && (
                            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                              <TouchableOpacity
                                style={{
                                  flex: 1,
                                  backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : '#FEF2F2',
                                  borderRadius: 12,
                                  paddingVertical: 10,
                                  alignItems: 'center',
                                  opacity: loadingActions[`leave-${l.id}`] ? 0.6 : 1
                                }}
                                disabled={!!loadingActions[`leave-${l.id}`]}
                                onPress={() => handleLeaveAction(l.id, 'rejected')}
                              >
                                <Text style={{ color: '#EF4444', fontWeight: '700', fontSize: 13 }}>
                                  {loadingActions[`leave-${l.id}`] === 'rejected' ? 'Rejecting...' : 'Reject'}
                                </Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={{
                                  flex: 1,
                                  backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : '#F0FDF4',
                                  borderRadius: 12,
                                  paddingVertical: 10,
                                  alignItems: 'center',
                                  opacity: loadingActions[`leave-${l.id}`] ? 0.6 : 1
                                }}
                                disabled={!!loadingActions[`leave-${l.id}`]}
                                onPress={() => handleLeaveAction(l.id, 'approved')}
                              >
                                <Text style={{ color: '#22C55E', fontWeight: '700', fontSize: 13 }}>
                                  {loadingActions[`leave-${l.id}`] === 'approved' ? 'Approving...' : 'Approve'}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      ))}
                    </ScrollView>
                  ) : (
                    <View style={styles.emptyStateContainer}>
                      <Text style={styles.emptyStateText}>No pending leaves.</Text>
                    </View>
                  )}
                </View>



              </View>{/* End Dashboard Content */}
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </GestureDetector >
  );
}
