import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useRef, useState } from "react";
import { ActivityIndicator, DeviceEventEmitter, Dimensions, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  withSpring
} from 'react-native-reanimated';
import { useRefresh } from '../../hooks/useRefresh';
import api, { API_BASE_URL } from '../../utils/api';
import { fetchLaundrySettings, LaundrySettings, subscribeToLaundry } from '../../utils/laundrySyncUtils';
import { fetchMenu, subscribeToMenu, WeekMenu } from '../../utils/messSyncUtils';

import PagerView from 'react-native-pager-view';
import StudentNotificationOverlay from '../../components/StudentNotificationOverlay';
import { BusRoute, subscribeToBusTimings } from '../../utils/busTimingsSyncUtils';
import { fetchUserData, StudentData } from '../../utils/nameUtils';
import { useTheme } from '../../utils/ThemeContext';

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
        { rotate: `${rotate} deg` },
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
        <MaterialCommunityIcons
          name={isDark ? "weather-sunny" : "weather-night"}
          size={24}
          color={isDark ? "#fbbf24" : "#004e92"}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const { width } = Dimensions.get('window');
const SPACING = 20;

export default function Index() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const pagerRef = useRef<PagerView>(null);
  // const [refreshing, setRefreshing] = useState(false); // Managed by useRefresh
  const [laundry, setLaundry] = useState<LaundrySettings | null>(null);
  const [fullMenu, setFullMenu] = useState<WeekMenu>({});
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [busRoutes, setBusRoutes] = useState<BusRoute[]>([]);
  const [activeBusPage, setActiveBusPage] = useState(0);

  const [pendingComplaints, setPendingComplaints] = useState(0);
  const [pendingVisitors, setPendingVisitors] = useState(0);
  const [pendingRoomServices, setPendingRoomServices] = useState(0);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [totalFacilities, setTotalFacilities] = useState(0);

  const fetchDashboardCounts = useCallback(async () => {
    try {
      const res = await api.get('/students/dashboard/counts');
      const data = res.data;
      setPendingComplaints(data.complaints || 0);
      setPendingVisitors(data.visitors || 0);
      setPendingRoomServices(data.roomServices || 0);
      setPendingLeaves(data.leaves || 0);
      setTotalFacilities(data.facilities || 0);
    } catch (e) {
      console.error("Failed to fetch dashboard counts:", e);
    }
  }, []);

  const loadUserData = useCallback(async () => {
    try {
      const data = await fetchUserData();
      setStudent(data);
      fetchDashboardCounts();
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchDashboardCounts]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await api.get('/notifications/student');
      setUnreadCount(res.data.length);
    } catch (error) {
      console.error('Failed to fetch notification count:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
      fetchUnreadCount();
      const unsubscribeLaundry = subscribeToLaundry(setLaundry);
      const unsubscribeMenu = subscribeToMenu(setFullMenu);
      const unsubscribeBus = subscribeToBusTimings(setBusRoutes);

      const updateListener = DeviceEventEmitter.addListener('profileUpdated', () => {
        loadUserData();
      });

      return () => {
        unsubscribeLaundry();
        unsubscribeMenu();
        unsubscribeBus();
        updateListener.remove();
      };
    }, [loadUserData, fetchUnreadCount])
  );

  const { refreshing, onRefresh } = useRefresh(async () => {
    // Reload all data
    await Promise.all([
      loadUserData(),
      fetchLaundrySettings().then(setLaundry),
      fetchMenu().then(setFullMenu),
      fetchUnreadCount(),
      fetchDashboardCounts()
    ]);
  });

  const handleClearNotifications = async () => {
    try {
      const res = await api.post('/students/profile/notifications/clear');
      if (res.data.success) {
        setStudent(prev => prev ? ({ ...prev, lastNotificationsClearedAt: res.data.timestamp }) : null);
      }
    } catch (e) {
      console.error("Failed to clear notifications", e);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 5) return 'Good Night';
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getUpcomingMeal = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const dayMenu = fullMenu?.[today];

    if (!dayMenu) return { type: 'Menu', foodItems: [], soon: false, time: '' };

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Default timings if not provided by backend
    const defaultTimings: Record<string, string> = {
      breakfast: '8:00 AM - 9:30 AM',
      lunch: '12:30 PM - 2:30 PM',
      snacks: '5:30 PM - 6:30 PM',
      dinner: '8:30 PM - 9:30 PM'
    };

    const timings = dayMenu.timings || defaultTimings;

    const parseToMinutes = (timeStr: string) => {
      if (!timeStr) return 0;
      const [time, period] = timeStr.trim().split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      return hours * 60 + (minutes || 0);
    };

    const meals = [
      { type: 'Breakfast', key: 'breakfast', food: dayMenu.breakfast },
      { type: 'Lunch', key: 'lunch', food: dayMenu.lunch },
      { type: 'Snacks', key: 'snacks', food: dayMenu.snacks },
      { type: 'Dinner', key: 'dinner', food: dayMenu.dinner }
    ];

    for (const meal of meals) {
      const timingRange = (timings as any)[meal.key] || (defaultTimings as any)[meal.key];
      const [startStr, endStr] = timingRange.split('-').map((s: string) => s.trim());
      const endMinutes = parseToMinutes(endStr);
      const startMinutes = parseToMinutes(startStr);

      // If we haven't reached the end of this meal yet, it's the current/upcoming one
      if (currentMinutes < endMinutes) {
        return {
          type: meal.type,
          foodItems: meal.food || [],
          soon: currentMinutes >= startMinutes - 60 && currentMinutes < startMinutes,
          time: timingRange
        };
      }
    }

    // Default to Breakfast if all meals today are over
    return {
      type: 'Breakfast',
      foodItems: dayMenu.breakfast || [],
      soon: false,
      time: timings.breakfast || defaultTimings.breakfast
    };
  };

  const getNextDeparture = (times: string[]) => {
    if (!times || times.length === 0) return '--:--';
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const futureTimes = times
      .map(t => {
        const [h, m] = t.split(':').map(Number);
        return { original: t, minutes: h * 60 + m };
      })
      .filter(t => t.minutes > currentMinutes)
      .sort((a, b) => a.minutes - b.minutes);

    if (futureTimes.length > 0) return futureTimes[0].original;
    return times.sort()[0];
  };

  const getInitial = (name?: string) => name ? name.charAt(0).toUpperCase() : 'S';

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading Dashboard...</Text>
      </View>
    );
  }

  // Network Error State
  if (!student) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <MaterialCommunityIcons name="wifi-off" size={48} color={isDark ? '#94a3b8' : '#64748b'} />
        <Text style={[styles.loadingText, { color: colors.text, marginTop: 16, fontSize: 18, fontWeight: '600' }]}>
          Connection Failed
        </Text>
        <Text style={{ color: colors.textSecondary, marginBottom: 24, textAlign: 'center', maxWidth: '80%' }}>
          Could not reach the server. Please check your WiFi connection.
        </Text>
        <TouchableOpacity
          onPress={loadUserData}
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const QuickAction = ({ icon, label, route, desc, bg, iconColor, borderColor, count, countLabel = "PENDING", isDiamond = false, style }: any) => {
    const cardBgColor = isDark ? colors.card : '#FFFFFF';
    const gradientColors: [string, string] = isDark
      ? [iconColor + '15', 'transparent']
      : [iconColor + '12', 'transparent'];

    // Bolder Diamond size for maximum impact
    const diamondSize = (width - 40) / 3.4;
    const size = isDiamond ? diamondSize : (width - 66) / 3;

    // Helper to merge transforms correctly
    const getTransforms = (additional: any[] = []) => {
      const base = isDiamond ? [{ rotate: '45deg' }] : [];
      return [...base, ...additional];
    };

    const flatStyle = StyleSheet.flatten(style) || {};
    const externalTransforms = flatStyle.transform || [];

    return (
      <Pressable
        style={({ pressed }) => [
          {
            width: size,
            aspectRatio: 1,
            backgroundColor: cardBgColor,
            borderRadius: isDiamond ? 28 : 24,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0',
            overflow: 'hidden',
            elevation: 8,
            shadowColor: iconColor,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: isDark ? 0.25 : 0.12,
            shadowRadius: 15,
            ...(isDiamond && { transform: getTransforms(externalTransforms) })
          },
          style,
          isDiamond && { transform: getTransforms(externalTransforms) },
          pressed && {
            opacity: 0.9,
            transform: [
              ...getTransforms(externalTransforms),
              { scale: 0.96 }
            ]
          }
        ]}
        onPress={() => router.push(route)}
      >
        <LinearGradient
          colors={gradientColors}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        <MaterialCommunityIcons
          name={icon}
          size={isDiamond ? 82 : 84}
          color={iconColor}
          style={{
            position: 'absolute',
            opacity: isDark ? 0.08 : 0.05,
            right: isDiamond ? -10 : -15,
            bottom: isDiamond ? -10 : -15
          }}
        />

        <View style={{ flex: 1, transform: isDiamond ? [{ rotate: '-45deg' }] : [] }}>
          <View style={{
            flex: 1,
            padding: isDiamond ? 16 : 12,
            justifyContent: isDiamond ? 'center' : 'space-between',
            alignItems: isDiamond ? 'center' : 'flex-start'
          }}>
            <View style={{
              width: isDiamond ? 38 : 32,
              height: isDiamond ? 38 : 32,
              borderRadius: 12,
              backgroundColor: iconColor + '15',
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: iconColor + '25',
              marginBottom: isDiamond ? 8 : 0,
              elevation: 4,
              shadowColor: iconColor,
              shadowRadius: 6,
              shadowOpacity: 0.15
            }}>
              <MaterialCommunityIcons name={icon} size={isDiamond ? 20 : 18} color={iconColor} />
            </View>

            <View style={{ gap: isDiamond ? 2 : 4, alignItems: isDiamond ? 'center' : 'flex-start' }}>
              <Text style={{
                color: isDark ? '#F8FAFC' : '#0F172A',
                fontSize: isDiamond ? 11 : 12,
                fontWeight: '800',
                lineHeight: isDiamond ? 13 : 14,
                letterSpacing: -0.2,
                textAlign: isDiamond ? 'center' : 'left'
              }} numberOfLines={1} adjustsFontSizeToFit>{label}</Text>

              {count !== undefined ? (
                <View style={{
                  backgroundColor: count > 0 ? iconColor + '20' : (isDark ? '#1E293B' : '#F8FAFC'),
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 8,
                  alignSelf: isDiamond ? 'center' : 'flex-start',
                  borderWidth: 1,
                  borderColor: count > 0 ? iconColor + '35' : (isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0')
                }}>
                  <Text style={{
                    color: count > 0 ? iconColor : (isDark ? '#94A3B8' : '#64748B'),
                    fontSize: 9,
                    fontWeight: '900',
                    letterSpacing: 0.3
                  }} adjustsFontSizeToFit numberOfLines={1}>
                    {count > 0 ? `${count} ${countLabel}` : `${countLabel}`}
                  </Text>
                </View>
              ) : (
                <Text style={{
                  color: isDark ? colors.textSecondary : '#64748B',
                  fontSize: 10,
                  fontWeight: '700',
                  lineHeight: 12,
                  textAlign: isDiamond ? 'center' : 'left'
                }} numberOfLines={1} adjustsFontSizeToFit>{desc}</Text>
              )}
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={busRoutes.length > 0
          ? (isDark ? ['#1E293B', '#334155'] : ['#F8FAFC', '#F1F5F9'])
          : [colors.background, colors.background]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={isDark ? "#fff" : colors.primary} colors={[colors.primary]} />}
      >
        {/* TOP HERO SECTION */}
        {/* TOP HERO SECTION */}
        <View style={[styles.heroWrapper, { backgroundColor: isDark ? '#451A03' : '#FBBF24', paddingBottom: 0 }]}>
          <LinearGradient
            colors={['#000428', '#004e92']}
            style={[styles.heroGradient, { paddingBottom: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <SafeAreaView edges={['top']} style={styles.safeArea}>
              <View style={styles.headerTop}>
                <View style={styles.topRow}>
                  <View style={styles.headerLeft}>
                    <Pressable onPress={() => router.push('/profile')} style={styles.profileFrame}>
                      <View style={styles.avatar}>
                        {student?.profilePhoto ? (
                          <Image
                            source={{ uri: `${API_BASE_URL}${student.profilePhoto}` }}
                            style={{ width: '100%', height: '100%', borderRadius: 24 }}
                            contentFit="cover"
                            cachePolicy="none"
                          />
                        ) : (
                          <Text style={styles.avatarText}>{getInitial(student?.fullName)}</Text>
                        )}
                      </View>
                    </Pressable>
                    <View>
                      <Text style={styles.greetingText}>{getGreeting()},</Text>
                      <Text style={[styles.userNameText, { marginBottom: 0 }]} numberOfLines={1}>
                        {student?.fullName?.split(' ')[0]}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <AnimatedThemeToggle isDark={isDark} toggleTheme={toggleTheme} />

                    {/* Notification Bell */}
                    <Pressable style={styles.notificationBtn} onPress={() => setNotificationVisible(true)}>
                      <Ionicons name="notifications-outline" size={24} color="#fff" />
                      {unreadCount > 0 && (
                        <View style={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: '#EF4444',
                          borderWidth: 1.5,
                          borderColor: '#004e92'
                        }} />
                      )}
                    </Pressable>
                  </View>
                </View>

                {/* Bottom Details Section */}
                <View style={styles.headerBottomDetails}>
                  {/* Room & Status Row with Hostel Name */}
                  <View style={styles.statusRow}>
                    {/* Hostel Name */}
                    {student?.hostelName && (
                      <View style={styles.roomTag}>
                        <MaterialCommunityIcons name="office-building-marker" size={14} color="#E0F2FE" />
                        <Text style={styles.roomTagText} numberOfLines={1}>
                          {student.hostelName}
                        </Text>
                      </View>
                    )}

                    {student?.hostelName && <View style={styles.verticalLine} />}

                    {/* Room Number */}
                    <View style={styles.roomTag}>
                      <MaterialCommunityIcons name="door-sliding" size={14} color="#E0F2FE" />
                      <Text style={styles.roomTagText}>Room {student?.roomNo || '--'}</Text>
                    </View>

                    <View style={styles.verticalLine} />

                    {/* Status */}
                    <View style={styles.statusTag}>
                      <View style={[styles.statusDot, { backgroundColor: student?.status === 'active' ? '#4ADE80' : '#EF4444' }]} />
                      <Text style={[styles.statusText, { color: student?.status === 'active' ? '#86EFAC' : '#FCA5A5' }]}>
                        {student?.status === 'active' ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Cards moved to profile.tsx */}
            </SafeAreaView>
          </LinearGradient>
        </View>

        {/* LIVE STATUS CARDS */}
        {/* LIVE STATUS CARDS */}
        {/* DAILY ESSENTIALS - BLUE THEME */}
        <View style={[styles.essentialsSectionWrapper, { marginTop: 0 }]}>
          <View style={styles.essentialsGrid}>
            {/* BUS CARD - 3D Floating Interactive Card */}
            {busRoutes.length > 0 ? (() => {
              const loopedRoutes = busRoutes.length > 1
                ? [busRoutes[busRoutes.length - 1], ...busRoutes, busRoutes[0]]
                : busRoutes;

              return (
                <View style={{ marginHorizontal: -20, marginBottom: 16, position: 'relative', elevation: 12, shadowColor: isDark ? '#000000' : '#D97706', shadowOffset: { width: 0, height: 8 }, shadowOpacity: isDark ? 0.3 : 0.2, shadowRadius: 16, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, backgroundColor: isDark ? '#451A03' : '#FBBF24' }}>
                  <PagerView
                    ref={pagerRef}
                    style={{ height: 110 }}
                    initialPage={busRoutes.length > 1 ? 1 : 0}
                    onPageSelected={(e: any) => {
                      const position = e.nativeEvent.position;
                      if (busRoutes.length > 1) {
                        if (position === 0) {
                          setActiveBusPage(busRoutes.length - 1);
                        } else if (position === loopedRoutes.length - 1) {
                          setActiveBusPage(0);
                        } else {
                          setActiveBusPage(position - 1);
                        }
                      } else {
                        setActiveBusPage(position);
                      }
                    }}
                    onPageScrollStateChanged={(e: any) => {
                      if (e.nativeEvent.pageScrollState === 'idle' && busRoutes.length > 1) {
                        // Silent snap back to actual elements when hitting the cloned edges
                        if (activeBusPage === busRoutes.length - 1) {
                          pagerRef.current?.setPageWithoutAnimation(busRoutes.length);
                        } else if (activeBusPage === 0) {
                          pagerRef.current?.setPageWithoutAnimation(1);
                        }
                      }
                    }}
                  >
                    {loopedRoutes.map((route, index) => {
                      const todayStr = new Date().toLocaleDateString('en-CA');
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      const tomorrowStr = tomorrow.toLocaleDateString('en-CA');
                      const routeDateStr = route.valid_date ? new Date(route.valid_date).toLocaleDateString('en-CA') : null;
                      const isFuture = routeDateStr && routeDateStr > todayStr;

                      const now = new Date();
                      const currentMinutes = now.getHours() * 60 + now.getMinutes();
                      const sortedTimes = (route.times || []).sort();
                      const futureTimes = sortedTimes.filter((t: string) => {
                        const [h, m] = t.split(':').map(Number);
                        return (h * 60 + m) > currentMinutes;
                      });

                      const mainTime = isFuture ? sortedTimes[0] : (futureTimes[0] || sortedTimes[0]);

                      const frequencyLabel = route.schedule_type?.toLowerCase() === 'everyday' ? 'DAILY' : (routeDateStr === todayStr ? 'TODAY' : (routeDateStr === tomorrowStr ? 'TOMORROW' : (route.schedule_type ? route.schedule_type.toUpperCase() : 'SERVICE')));

                      return (
                        <View key={index} style={{ paddingHorizontal: 0, paddingVertical: 0 }}>
                          <Pressable
                            style={({ pressed }) => [
                              {
                                overflow: 'hidden',
                                borderBottomLeftRadius: 32,
                                borderBottomRightRadius: 32,
                              },
                              pressed && { opacity: 0.95 }
                            ]}
                            onPress={() => router.push('/bustimings')}
                          >
                            <View
                              style={{
                                paddingHorizontal: 46,
                                paddingVertical: 10,
                                height: 110,
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: 'transparent'
                              }}
                            >
                              <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 10, fontWeight: '900', color: isDark ? '#FCD34D' : '#92400E', letterSpacing: 1.2, marginBottom: 4 }}>BUS SCHEDULE</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                  <View style={{ backgroundColor: isDark ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.6)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                                    <Text style={{ fontSize: 9, fontWeight: '800', color: isDark ? '#FCD34D' : '#B45309', letterSpacing: 1 }}>
                                      {frequencyLabel}
                                    </Text>
                                  </View>
                                  {futureTimes.length === 0 && !isFuture && (
                                    <Text style={{ fontSize: 9, fontWeight: '700', color: '#DC2626' }}>ENDED</Text>
                                  )}
                                </View>
                                <Text style={{ fontSize: 18, fontWeight: '800', color: isDark ? '#FFFBEB' : '#78350F', lineHeight: 20 }}>
                                  {route.route}
                                </Text>
                                {!!route.message && (
                                  <Text style={{ fontSize: 10, fontWeight: '700', color: isDark ? '#FDE68A' : '#B45309', marginTop: 2, opacity: 0.9 }} numberOfLines={1}>
                                    <MaterialCommunityIcons name="information" size={10} /> {route.message}
                                  </Text>
                                )}
                              </View>

                              <View style={{ alignItems: 'flex-end', gap: 2, justifyContent: 'center' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', opacity: 0.6, marginBottom: 8 }}>
                                  <Text style={{ fontSize: 8, fontWeight: '800', color: isDark ? '#FFFBEB' : '#78350F', textTransform: 'uppercase' }}>Tap for Details </Text>
                                  <MaterialCommunityIcons name="gesture-tap" size={10} color={isDark ? '#FFFBEB' : '#78350F'} />
                                </View>
                                <Text style={{ fontSize: 9, fontWeight: '800', color: isDark ? '#FDE68A' : '#92400E', textTransform: 'uppercase', letterSpacing: 0.5 }}>Next Departure</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                  <MaterialCommunityIcons name="clock-outline" size={16} color={isDark ? '#FCD34D' : '#B45309'} />
                                  <Text style={{ fontSize: 24, fontWeight: '900', color: isDark ? '#FFFBEB' : '#78350F' }}>
                                    {mainTime || '--:--'}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          </Pressable>
                        </View>
                      );
                    })}
                  </PagerView>
                  {busRoutes.length > 1 && (
                    <>
                      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 4, marginBottom: 12 }}>
                        {busRoutes.map((_, i) => (
                          <View
                            key={i}
                            style={{
                              width: i === activeBusPage ? 14 : 6,
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: isDark ? '#FCD34D' : '#FFFBEB',
                              opacity: i === activeBusPage ? 1 : 0.4
                            }}
                          />
                        ))}
                      </View>

                      {/* Navigation Arrows (Cyclic) */}
                      {busRoutes.length > 1 && (
                        <Pressable
                          style={{ position: 'absolute', left: 4, top: 42, backgroundColor: isDark ? 'rgba(30,41,59,0.9)' : 'rgba(255,255,255,0.9)', borderRadius: 20, padding: 4, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 }}
                          onPress={() => {
                            const targetVisualPage = activeBusPage === 0 ? busRoutes.length : activeBusPage;
                            pagerRef.current?.setPage(targetVisualPage - 1);
                          }}
                        >
                          <MaterialCommunityIcons name="chevron-left" size={24} color={isDark ? '#FCD34D' : '#D97706'} />
                        </Pressable>
                      )}
                      {busRoutes.length > 1 && (
                        <Pressable
                          style={{ position: 'absolute', right: 4, top: 42, backgroundColor: isDark ? 'rgba(30,41,59,0.9)' : 'rgba(255,255,255,0.9)', borderRadius: 20, padding: 4, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 }}
                          onPress={() => {
                            const targetVisualPage = activeBusPage + 1;
                            pagerRef.current?.setPage(targetVisualPage + 1);
                          }}
                        >
                          <MaterialCommunityIcons name="chevron-right" size={24} color={isDark ? '#FCD34D' : '#D97706'} />
                        </Pressable>
                      )}
                    </>
                  )}
                </View>
              )
            })() : (
              <Pressable
                style={({ pressed }) => [
                  {
                    marginHorizontal: -20, marginBottom: 16, height: 110, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? '#451A03' : '#FBBF24', borderBottomLeftRadius: 32, borderBottomRightRadius: 32, elevation: 12, shadowColor: isDark ? '#000000' : '#D97706', shadowOffset: { width: 0, height: 8 }, shadowOpacity: isDark ? 0.3 : 0.2, shadowRadius: 16
                  },
                  pressed && { opacity: 0.95 }
                ]}
                onPress={() => router.push('/bustimings')}
              >
                <MaterialCommunityIcons name="bus-alert" size={36} color={isDark ? '#FCD34D' : '#92400E'} style={{ opacity: 0.7, marginBottom: 12 }} />
                <Text style={{ fontSize: 16, fontWeight: '900', color: isDark ? '#FDE68A' : '#92400E', letterSpacing: 0.5 }}>NO ROUTES ADDED</Text>
                <Text style={{ fontSize: 12, fontWeight: '600', color: isDark ? '#FCD34D' : '#B45309', opacity: 0.7, marginTop: 4 }}>Tap to view full bus schedule</Text>
              </Pressable>
            )}

            {/* GRID CONTROLS: MESS & LAUNDRY */}
            <View style={[styles.gridRow, { marginTop: -4 }]}>
              {/* MESS CARD - Grid Style */}
              <View style={styles.gridItemFlexible}>
                <Pressable
                  style={({ pressed }) => [
                    styles.premiumServiceCard,
                    { backgroundColor: isDark ? colors.card : '#FFFFFF', paddingHorizontal: 16, paddingVertical: 14, overflow: 'hidden' },
                    pressed && styles.premiumCardPressed
                  ]}
                  onPress={() => {
                    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                    router.push({
                      pathname: '/mess',
                      params: {
                        tab: 'menu',
                        day: today,
                        target: getUpcomingMeal().type.toLowerCase()
                      }
                    });
                  }}
                >
                  {/* Background Watermark Icon */}
                  <MaterialCommunityIcons
                    name="silverware-fork-knife"
                    size={90}
                    color={isDark ? '#FDBA74' : '#EA580C'}
                    style={{ position: 'absolute', right: -15, bottom: -15, opacity: isDark ? 0.08 : 0.06 }}
                  />
                  <View style={{ gap: 4 }}>
                    <Text style={[styles.serviceLabel, { color: isDark ? '#F1F5F9' : '#0F172A', fontSize: 17, marginBottom: 0 }]}>Mess Menu</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                      <Text style={[styles.modernBadgeText, { color: isDark ? '#FDBA74' : '#EA580C', fontSize: 10, fontWeight: '900' }]}>
                        {getUpcomingMeal().type.toUpperCase()}
                      </Text>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: isDark ? '#94A3B8' : '#64748B' }}>
                        • {getUpcomingMeal().time}
                      </Text>
                    </View>
                    <Text style={{ color: isDark ? '#CBD5E1' : '#475569', fontSize: 12, fontWeight: '600', lineHeight: 16 }} numberOfLines={2}>
                      {getUpcomingMeal().foodItems?.length > 0 ? (
                        getUpcomingMeal().foodItems.map((item: any, idx: number, arr: any[]) => (
                          <Text key={idx} style={item.highlight ? { color: isDark ? '#FDE047' : '#D97706', fontWeight: 'bold' } : {}}>
                            {item.dish}{idx < arr.length - 1 ? ', ' : ''}
                          </Text>
                        ))
                      ) : 'Not Available'}
                    </Text>
                  </View>
                </Pressable>
              </View>

              {/* LAUNDRY CARD - Grid Style */}
              <View style={styles.gridItemFlexible}>
                <Pressable
                  style={({ pressed }) => [
                    styles.premiumServiceCard,
                    { backgroundColor: isDark ? colors.card : '#FFFFFF', paddingHorizontal: 16, paddingVertical: 14, overflow: 'hidden' },
                    pressed && styles.premiumCardPressed
                  ]}
                  onPress={() => router.push('/laundry-request')}
                >
                  {/* Background Watermark Icon */}
                  <MaterialCommunityIcons
                    name="washing-machine"
                    size={90}
                    color={isDark ? '#67E8F9' : '#0891B2'}
                    style={{ position: 'absolute', right: -15, bottom: -15, opacity: isDark ? 0.08 : 0.06 }}
                  />
                  <View style={{ gap: 4 }}>
                    <Text style={[styles.serviceLabel, { color: isDark ? '#F1F5F9' : '#0F172A', fontSize: 17, marginBottom: 0 }]}>Laundry</Text>
                    <View style={{ gap: 2 }}>
                      <Text style={[styles.modernBadgeText, { color: isDark ? '#67E8F9' : '#0891B2', fontSize: 10, fontWeight: '900', alignSelf: 'flex-start' }]}>
                        {(laundry?.status === 'On Schedule' ? 'On Time' : (laundry?.status || 'Active')).toUpperCase()}
                      </Text>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: isDark ? '#94A3B8' : '#64748B' }}>
                        {laundry?.pickupTime ? `${laundry.pickupTime} ${laundry.pickupPeriod.slice(0, 2)} ` : '--:--'}
                      </Text>
                    </View>
                    <Text style={{ color: isDark ? '#CBD5E1' : '#475569', fontSize: 12, fontWeight: '600', lineHeight: 16 }} numberOfLines={2}>
                      Next: {laundry?.pickupDay || 'TBD'}
                    </Text>
                  </View>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* CAMPUS SERVICES - BLUE SPECTRUM */}
        <View style={styles.servicesSectionWrapper}>
          <View style={styles.sectionHeaderContainer}>
            <Text style={[styles.sectionHeader, {
              backgroundColor: isDark ? '#172554' : '#EFF6FF',
              color: isDark ? '#60A5FA' : '#1E40AF'
            }]}>Campus Services</Text>
          </View>

          <View style={{ alignItems: 'center', justifyContent: 'center', height: 440, marginTop: -60, marginBottom: 10 }}>
            {/* The Bolder Polished "Star" Side-to-Side Cross Container */}
            <View style={{ width: width, height: 400, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>

              {(() => {
                const s = (width - 40) / 3.4;
                const gap = 5;
                const D = s + gap;

                return (
                  <>
                    {/* CENTER: About Hostel */}
                    <QuickAction
                      icon="information-variant"
                      label="About Hostel"
                      route="/about"
                      desc="Facilities"
                      bg={isDark ? colors.card : "#FFFFFF"}
                      iconColor="#3B82F6"
                      borderColor={colors.border}
                      count={totalFacilities}
                      countLabel="FACILITIES"
                      isDiamond
                      style={{ position: 'absolute', zIndex: 10 }}
                    />

                    {/* TOP-LEFT Edge: Complaints */}
                    <QuickAction
                      icon="alert-circle-outline"
                      label="Complaints"
                      route="/complaints"
                      desc="Issues"
                      bg={isDark ? colors.card : "#FFFFFF"}
                      iconColor="#E11D48"
                      borderColor={colors.border}
                      count={pendingComplaints}
                      isDiamond
                      style={{
                        position: 'absolute',
                        transform: [{ translateY: -D }]
                      }}
                    />

                    {/* TOP-RIGHT Edge: Visitors */}
                    <QuickAction
                      icon="account-group-outline"
                      label="Visitors"
                      route="/my-visitors"
                      desc="Register"
                      bg={isDark ? colors.card : "#FFFFFF"}
                      iconColor="#8B5CF6"
                      borderColor={colors.border}
                      count={pendingVisitors}
                      isDiamond
                      style={{
                        position: 'absolute',
                        transform: [{ translateX: D }]
                      }}
                    />

                    {/* BOTTOM-LEFT Edge: Services */}
                    <QuickAction
                      icon="broom"
                      label="Services"
                      route="/roomservice"
                      desc="Cleanup"
                      bg={isDark ? colors.card : "#FFFFFF"}
                      iconColor="#D97706"
                      borderColor={colors.border}
                      count={pendingRoomServices}
                      isDiamond
                      style={{
                        position: 'absolute',
                        transform: [{ translateX: -D }]
                      }}
                    />

                    {/* BOTTOM-RIGHT Edge: Leave Pass */}
                    <QuickAction
                      icon="calendar-account-outline"
                      label="Leave Pass"
                      route="/leave-request"
                      desc="Gate Pass"
                      bg={isDark ? colors.card : "#FFFFFF"}
                      iconColor="#7C3AED"
                      borderColor={colors.border}
                      count={pendingLeaves}
                      isDiamond
                      style={{
                        position: 'absolute',
                        transform: [{ translateY: D }]
                      }}
                    />
                  </>
                );
              })()}
            </View>
          </View>
        </View>


      </ScrollView >



      <StudentNotificationOverlay
        visible={notificationVisible}
        onClose={() => setNotificationVisible(false)}
      />
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  heroWrapper: {
    paddingBottom: 40,
    backgroundColor: '#F8FAFC',
  },
  heroGradient: {
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  safeArea: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  headerTop: {
    marginBottom: 12,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerBottomDetails: {
    marginLeft: 4, // slight indent to align with content above
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  profileFrame: {
    borderRadius: 50,
    padding: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#004e92',
    fontSize: 20,
    fontWeight: '700',
  },
  greetingText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 0,
  },
  userNameText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  hostelNameText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  roomTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roomTagText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  verticalLine: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginTop: 8, // Reduced from 18
    shadowColor: '#004e92', // Brand Shadow
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    padding: 16, // Reduced from 24
    borderWidth: 1,
    borderColor: '#E6EEF5',
  },
  locationBlock: {
    position: 'relative',
  },
  connectorLine: {
    position: 'absolute',
    left: 20,
    top: 40,
    bottom: 40,
    width: 2,
    backgroundColor: '#D1E0F0', // Light tint of Royal Blue
    zIndex: -1,
  },
  locItem: {
    flexDirection: 'row',
    gap: 12, // Reduced from 16
    alignItems: 'flex-start',
  },
  locIcon: {
    width: 36, // Reduced from 40
    height: 36, // Reduced from 40
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  locContent: {
    flex: 1,
    paddingTop: 0,
    justifyContent: 'center',
    minHeight: 36, // Reduced
  },
  locLabel: {
    fontSize: 10, // Reduced from 11
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2, // Reduced
  },
  locValue: {
    fontSize: 14, // Reduced from 16
    color: '#0F172A',
    fontWeight: '700',
    lineHeight: 20, // Reduced from 22
  },
  curveOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -40,
  },
  essentialsSection: {
    paddingHorizontal: 24,
    marginTop: -20, // Overlap curve
    marginBottom: 24,
  },
  essentialsSectionWrapper: {
    paddingHorizontal: 20,
    marginTop: -28, // Aggressive pull up to header
    zIndex: 1,
  },
  servicesSectionWrapper: {
    paddingHorizontal: 20,
    marginTop: 24, // Clear separation from Essentials
    paddingBottom: 40, // Bottom padding for scroll
  },
  sectionHeaderContainer: {
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 0,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E40AF', // Royal Blue Text
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    backgroundColor: '#EFF6FF', // Soft Blue Background
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 100, // Pill shape
    overflow: 'hidden',
  },
  essentialsGrid: {
    flexDirection: 'column',
    gap: 8,
  },
  modernRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.5)', // Extremely subtle border
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  modernIconBox: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modernRowContent: {
    flex: 1,
    justifyContent: 'center',
  },
  modernRowTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  modernBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  modernBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modernRowValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  modernChevron: {
    paddingLeft: 4,
  },
  servicesGrid: {
    gap: 14,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 14,
  },
  gridItemFlexible: {
    flex: 1,
  },
  premiumServiceCard: {
    flex: 1,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0', // Visible border for white cards
    // Modern Soft Shadow
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    justifyContent: 'center',
    gap: 6,
  },
  premiumCardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  serviceLabel: {
    fontSize: 16, // Slightly smaller than Essentials Value to fit layout
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  serviceDesc: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  serviceIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  fullWidthCardWrapper: {
    width: '100%',
  },
  fullWidthCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  actionSubtext: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  bannerSection: {
    paddingHorizontal: 24,
    marginTop: 10,
  },
  financeBanner: {
    borderRadius: 28,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  }
});


