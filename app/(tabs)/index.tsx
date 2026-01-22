import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from "react";
import { ActivityIndicator, Dimensions, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  withSpring
} from 'react-native-reanimated';
import NotificationOverlay from '../../components/NotificationOverlay';
import { LaundrySettings, subscribeToLaundry } from '../../utils/laundrySyncUtils';
import { subscribeToMenu, WeekMenu } from '../../utils/messSyncUtils';
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
  const [refreshing, setRefreshing] = useState(false);
  const [laundry, setLaundry] = useState<LaundrySettings | null>(null);
  const [fullMenu, setFullMenu] = useState<WeekMenu>({});
  const [notificationVisible, setNotificationVisible] = useState(false);

  const loadUserData = useCallback(async () => {
    try {
      const data = await fetchUserData();
      setStudent(data);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
      const unsubscribeLaundry = subscribeToLaundry(setLaundry);
      const unsubscribeMenu = subscribeToMenu(setFullMenu);
      return () => {
        unsubscribeLaundry();
        unsubscribeMenu();
      };
    }, [loadUserData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  }, [loadUserData]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 5) return 'Good Night';
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getDynamicDinner = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const dayMenu = fullMenu?.[today];
    if (!dayMenu?.dinner || dayMenu.dinner.length === 0) return 'Check Menu';
    // Return first 2 items to avoid overflow, or join all
    return dayMenu.dinner.map((m: any) => m.dish).join(', ');
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

  const QuickAction = ({ icon, label, route, desc, bg, iconColor, borderColor }: any) => (
    <View style={styles.gridItemFlexible}>
      <Pressable
        style={({ pressed }) => [
          styles.premiumServiceCard,
          {
            backgroundColor: bg,
            borderColor: borderColor || '#E2E8F0'
          },
          pressed && styles.premiumCardPressed
        ]}
        onPress={() => router.push(route)}
      >
        <View style={styles.serviceIconContainer}>
          <MaterialCommunityIcons name={icon} size={28} color={iconColor} />
        </View>
        <View style={{ gap: 2 }}>
          <Text style={[styles.serviceLabel, { color: isDark ? colors.text : '#0F172A' }]}>{label}</Text>
          <Text style={[styles.serviceDesc, { color: isDark ? colors.textSecondary : '#64748B' }]}>{desc}</Text>
        </View>
      </Pressable>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} tintColor="#fff" />}
      >
        {/* TOP HERO SECTION */}
        {/* TOP HERO SECTION */}
        <View style={[styles.heroWrapper, { backgroundColor: colors.background }]}>
          <LinearGradient
            colors={['#000428', '#004e92']}
            style={styles.heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <SafeAreaView edges={['top']} style={styles.safeArea}>
              {/* Header Top Row */}
              <View style={styles.headerTop}>
                <View style={styles.headerLeft}>
                  <Pressable onPress={() => router.push('/profile')} style={styles.profileFrame}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{getInitial(student?.fullName)}</Text>
                    </View>
                  </Pressable>
                  <View>
                    {/* Stacked Greeting + Name */}
                    <View>
                      <Text style={styles.greetingText}>{getGreeting()},</Text>
                      <Text style={styles.userNameText} numberOfLines={1}>
                        {student?.fullName?.split(' ')[0]}
                      </Text>
                    </View>

                    {/* Room & Status Row */}
                    <View style={styles.statusRow}>
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
                          {student?.status === 'active' ? 'Active Resident' : 'Inactive'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <AnimatedThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
                  <Pressable style={styles.notificationBtn} onPress={() => setNotificationVisible(true)}>
                    <Ionicons name="notifications-outline" size={24} color="#fff" />
                  </Pressable>
                </View>
              </View>

              {/* Beautiful Info Card - Unified Location Style */}
              <View style={[styles.glassCard, {
                backgroundColor: isDark ? colors.card : '#FFFFFF',
                borderColor: isDark ? colors.border : '#E6EEF5'
              }]}>
                <View style={styles.locationBlock}>
                  {/* Connector Line adjusted for smaller spacing */}
                  <View style={[styles.connectorLine, {
                    top: 30, bottom: 30, left: 18,
                    backgroundColor: isDark ? colors.border : '#D1E0F0'
                  }]} />

                  {/* College Section */}
                  <View style={styles.locItem}>
                    <View style={[styles.locIcon, {
                      backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                      borderColor: isDark ? colors.border : '#F1F5F9'
                    }]}>
                      <MaterialCommunityIcons name="school" size={20} color={isDark ? '#60A5FA' : '#004e92'} />
                    </View>
                    <View style={styles.locContent}>
                      <Text style={[styles.locLabel, { color: colors.textSecondary }]}>Studying At</Text>
                      <Text style={[styles.locValue, { color: colors.text }]} numberOfLines={2}>{student?.collegeName || 'Not Assigned'}</Text>
                    </View>
                  </View>

                  {/* Smaller Spacer */}
                  <View style={{ height: 12 }} />

                  {/* Hostel Section */}
                  <View style={styles.locItem}>
                    <View style={[styles.locIcon, {
                      backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                      borderColor: isDark ? colors.border : '#F1F5F9'
                    }]}>
                      <MaterialCommunityIcons name="office-building" size={20} color={isDark ? '#60A5FA' : '#2B6CB0'} />
                    </View>
                    <View style={styles.locContent}>
                      <Text style={[styles.locLabel, { color: colors.textSecondary }]}>Living At</Text>
                      <Text style={[styles.locValue, { color: colors.text }]} numberOfLines={2}>{student?.hostelName || 'Not Assigned'}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </SafeAreaView>
          </LinearGradient>
          <View style={[styles.curveOverlay, { backgroundColor: colors.background }]} />
        </View>

        {/* LIVE STATUS CARDS */}
        {/* LIVE STATUS CARDS */}
        {/* LIVE STATUS CARDS */}
        {/* DAILY ESSENTIALS - BLUE THEME */}
        <View style={styles.essentialsSectionWrapper}>
          <View style={styles.sectionHeaderContainer}>
            <Text style={[styles.sectionHeader, {
              backgroundColor: isDark ? '#172554' : '#EFF6FF',
              color: isDark ? '#60A5FA' : '#1E40AF'
            }]}>Daily Essentials</Text>
          </View>
          <View style={styles.essentialsGrid}>
            {/* MESS CARD - Rich Amber (Warmth) */}
            <Pressable onPress={() => router.push('/mess')} style={[styles.premiumCard, {
              backgroundColor: isDark ? '#451a03' : '#FFF7ED',
              borderColor: isDark ? '#78350f' : '#FFEDD5'
            }]}>
              <MaterialCommunityIcons name="silverware-fork-knife" size={26} color={isDark ? '#f97316' : '#EA580C'} style={{ marginBottom: 4 }} />
              <Text style={[styles.simpleCardTitle, { color: isDark ? '#fdba74' : '#9A3412' }]}>Mess Menu</Text>
              <Text style={[styles.simpleCardValue, { color: isDark ? '#fff7ed' : '#0F172A' }]} numberOfLines={1}>{getDynamicDinner()}</Text>
              <Text style={[styles.simpleCardSub, { color: isDark ? '#fed7aa' : '#64748B' }]}>Tap for menu</Text>
            </Pressable>

            {/* LAUNDRY CARD - Rich Azure (Clean) */}
            <Pressable onPress={() => router.push('/laundry-request')} style={[styles.premiumCard, {
              backgroundColor: isDark ? '#083344' : '#ECFEFF',
              borderColor: isDark ? '#155e75' : '#CFFAFE'
            }]}>
              <MaterialCommunityIcons name="washing-machine" size={26} color={isDark ? '#22d3ee' : '#0891B2'} style={{ marginBottom: 4 }} />
              <Text style={[styles.simpleCardTitle, { color: isDark ? '#67e8f9' : '#155E75' }]}>Laundry</Text>
              <Text style={[styles.simpleCardValue, { color: isDark ? '#ecfeff' : '#0F172A' }]}>{laundry?.status === 'On Schedule' ? 'On Time' : (laundry?.status || 'No Request')}</Text>
              <Text style={[styles.simpleCardSub, { color: isDark ? '#a5f3fc' : '#64748B' }]}>{laundry?.pickupDay ? `Next: ${laundry.pickupDay}` : 'Check Status'}</Text>
            </Pressable>
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

          <View style={styles.servicesGrid}>
            {/* Row 1 */}
            <View style={styles.gridRow}>
              <QuickAction
                icon="alert-circle-outline"
                label="Complaints"
                route="/complaints"
                desc="Report Issues"
                bg={isDark ? colors.card : "#FFFFFF"}
                iconColor="#E11D48" // Rose-600
                borderColor={colors.border}
              />
              <QuickAction
                icon="broom"
                label="Room Services"
                route="/roomservice"
                desc="Housekeeping"
                bg={isDark ? colors.card : "#FFFFFF"}
                iconColor="#D97706" // Amber-600
                borderColor={colors.border}
              />
            </View>

            {/* Row 2 */}
            <View style={styles.gridRow}>
              <QuickAction
                icon="calendar-account-outline"
                label="Leave Pass"
                route="/leave-request"
                desc="Gate Pass"
                bg={isDark ? colors.card : "#FFFFFF"}
                iconColor="#7C3AED" // Violet-600
                borderColor={colors.border}
              />
              <QuickAction
                icon="bus-clock"
                label="Bus Timings"
                route="/bustimings"
                desc="Schedule"
                bg={isDark ? colors.card : "#FFFFFF"}
                iconColor="#059669" // Emerald-600
                borderColor={colors.border}
              />
            </View>
          </View>
        </View>


      </ScrollView>
      <NotificationOverlay visible={notificationVisible} onClose={() => setNotificationVisible(false)} />
    </View>
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

  // Header / Hero
  heroWrapper: {
    // Height adjustable if needed
    paddingBottom: 40,
    backgroundColor: '#F8FAFC',
  },
  heroGradient: {
    paddingBottom: 24, // Standardized header size
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  safeArea: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12, // Reduced from 24
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
    letterSpacing: -0.5, // Tighter tracking for modern bold headers
    marginBottom: 6,
    // width: 250, // Removed to prevent overflow
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

  // Beautiful Info Card - Themed
  glassCard: {
    width: '100%',
    backgroundColor: '#FFFFFF', // Clean White to pop against the Royal Blue header
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

  // Essentials
  essentialsSection: {
    paddingHorizontal: 24,
    marginTop: -20, // Overlap curve
    marginBottom: 24,
  },
  // Content Sections
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

  // Premium Essentials Grid
  essentialsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  premiumCard: {
    flex: 1,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    // Shadow will be subtle
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    justifyContent: 'center',
    gap: 8,
  },
  simpleCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 8,
  },
  simpleCardValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A', // Darkest slate for high contrast
    letterSpacing: -0.5,
  },
  simpleCardSub: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },

  // Premium Colorful Services
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
  // Typography matches Essentials
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
  // Full Width Card (Support)
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

  // Banner
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
  },
  bannerIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  bannerSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    marginTop: 2,
  },
});
