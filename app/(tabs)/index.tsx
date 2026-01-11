import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Dimensions, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LaundrySettings, subscribeToLaundry } from '../../utils/laundrySyncUtils';
import { MenuItem, subscribeToMenu, WeekMenu } from '../../utils/messSyncUtils';
import { fetchUserData, getInitial, StudentData } from '../../utils/nameUtils';
import { useTheme } from '../../utils/ThemeContext';

const { width } = Dimensions.get('window');
const SPACING = 20;

export default function Index() {
  const router = useRouter();
  const { colors } = useTheme();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [laundry, setLaundry] = useState<LaundrySettings | null>(null);
  const [fullMenu, setFullMenu] = useState<WeekMenu>({});

  const loadUserData = useCallback(async () => {
    try {
      const data = await fetchUserData();
      setStudent(data);
    } catch (error) {
      console.error('Failed to load user data:', error);
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
    const today = new Date().toLocaleString('en-US', { weekday: 'long' });
    // @ts-ignore
    const dinnerItems = fullMenu[today]?.dinner;
    if (!dinnerItems || dinnerItems.length === 0) return 'Not Available';
    const highlight = dinnerItems.find((i: MenuItem) => i.highlight);
    return highlight ? highlight.dish : dinnerItems[0].dish;
  };

  if (!student) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#004e92" />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  const QuickAction = ({ icon, label, route, color, bg }: any) => (
    <View style={styles.gridItemWrapper}>
      <Pressable
        style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
        onPress={() => router.push(route)}
      >
        <View style={[styles.actionIconBox, { backgroundColor: bg }]}>
          <MaterialCommunityIcons name={icon} size={26} color={color} />
        </View>
        <View style={styles.actionTextBox}>
          <Text style={styles.actionLabel}>{label}</Text>
          <Text style={styles.actionSubtext}>View Details</Text>
        </View>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
      >
        {/* TOP HERO SECTION */}
        <View style={styles.heroWrapper}>
          <LinearGradient
            colors={['#000428', '#004e92']}
            style={styles.heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <SafeAreaView edges={['top']} style={styles.safeArea}>
              <View style={styles.headerTop}>
                <View>
                  <Text style={styles.welcomeText}>{getGreeting()},</Text>
                  <Text style={styles.studentName}>{student.fullName?.split(' ')[0]}</Text>
                </View>
                <Pressable onPress={() => router.push('/profile')} style={styles.profileBox}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{getInitial(student.fullName)}</Text>
                  </View>
                </Pressable>
              </View>

              <View style={styles.hostelInfo}>
                <View style={styles.infoBadge}>
                  <MaterialCommunityIcons name="office-building" size={14} color="#E0F2FE" />
                  <Text style={styles.infoBadgeText}>{student.hostelName || 'Smart Hostel'}</Text>
                </View>
                <View style={[styles.infoBadge, { backgroundColor: 'rgba(52, 211, 153, 0.2)' }]}>
                  <View style={styles.onlineDot} />
                  <Text style={[styles.infoBadgeText, { color: '#6EE7B7' }]}>Active Resident</Text>
                </View>
              </View>
            </SafeAreaView>
          </LinearGradient>
          <View style={styles.curveOverlay} />
        </View>

        {/* LIVE STATUS CARDS */}
        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselScroll}
            snapToInterval={width * 0.7 + 16}
            decelerationRate="fast"
          >
            {/* ROOM STATUS */}
            <View style={styles.statusCard}>
              <View style={styles.cardTop}>
                <View style={[styles.cardIconBox, { backgroundColor: '#EFF6FF' }]}>
                  <MaterialCommunityIcons name="door-open" size={24} color="#3B82F6" />
                </View>
                <Text style={styles.cardTag}>Room Info</Text>
              </View>
              <View style={styles.cardMain}>
                <Text style={styles.cardTitle}>{student.roomNo || '--'}</Text>
                <Text style={styles.cardDesc}>Your assigned room</Text>
              </View>
            </View>

            {/* MESS STATUS */}
            <Pressable onPress={() => router.push('/mess')} style={styles.statusCard}>
              <View style={styles.cardTop}>
                <View style={[styles.cardIconBox, { backgroundColor: '#FFF7ED' }]}>
                  <MaterialCommunityIcons name="silverware-fork-knife" size={24} color="#EA580C" />
                </View>
                <Text style={[styles.cardTag, { color: '#EA580C' }]}>Next Meal</Text>
              </View>
              <View style={styles.cardMain}>
                <Text style={[styles.cardTitle, { fontSize: 22 }]} numberOfLines={1}>{getDynamicDinner()}</Text>
                <Text style={styles.cardDesc}>Tonight's Menu</Text>
              </View>
            </Pressable>

            {/* LAUNDRY STATUS */}
            <View style={styles.statusCard}>
              <View style={styles.cardTop}>
                <View style={[styles.cardIconBox, { backgroundColor: '#F0FDF4' }]}>
                  <MaterialCommunityIcons name="washing-machine" size={24} color="#16A34A" />
                </View>
                <Text style={[styles.cardTag, { color: '#16A34A' }]}>Laundry</Text>
              </View>
              <View style={styles.cardMain}>
                <Text style={styles.cardTitle}>{laundry?.status === 'On Schedule' ? 'On Time' : (laundry?.status || '--')}</Text>
                <Text style={styles.cardDesc}>{laundry?.pickupDay ? `Pickup: ${laundry.pickupDay}` : 'System Live'}</Text>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* SERVICES GRID (2 COLUMNS) */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Campus Services</Text>
          <View style={styles.gridContainer}>
            <QuickAction icon="bullhorn" label="Notices" route="/(tabs)/alerts" color="#3B82F6" bg="#EFF6FF" />
            <QuickAction icon="alert-circle" label="Complaints" route="/complaints" color="#EF4444" bg="#FEF2F2" />
            <QuickAction icon="broom" label="Room Service" route="/roomservice" color="#F59E0B" bg="#FFFBEB" />
            <QuickAction icon="bus-clock" label="Bus Timings" route="/bustimings" color="#10B981" bg="#ECFDF5" />
            <QuickAction icon="calendar-account" label="Leave App" route="/leave-request" color="#8B5CF6" bg="#F5F3FF" />
            <QuickAction icon="phone-in-talk" label="Support" route="/(tabs)/emergency" color="#EC4899" bg="#FDF2F8" />
          </View>
        </View>

        {/* PAYMENTS BANNER */}
        <View style={styles.bannerSection}>
          <Pressable onPress={() => router.push('/payments')}>
            <LinearGradient
              colors={['#1e293b', '#0f172a']}
              style={styles.financeBanner}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.bannerLeft}>
                <View style={styles.bannerIcon}>
                  <FontAwesome5 name="wallet" size={20} color="#38bdf8" />
                </View>
                <View>
                  <Text style={styles.bannerTitle}>Payments & Fees</Text>
                  <Text style={styles.bannerSub}>Manage your transactions</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward-circle" size={28} color="rgba(255,255,255,0.4)" />
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
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
  heroWrapper: {
    height: 280,
    backgroundColor: '#F8FAFC',
  },
  heroGradient: {
    height: 240,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  safeArea: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  studentName: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  profileBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  hostelInfo: {
    flexDirection: 'row',
    gap: 12,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  infoBadgeText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  curveOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 50,
  },

  // Carousel
  carouselContainer: {
    marginTop: -40,
    marginBottom: 24,
  },
  carouselScroll: {
    paddingHorizontal: 24,
    gap: 16,
    paddingBottom: 10,
  },
  statusCard: {
    width: width * 0.7,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTag: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B82F6',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardMain: {},
  cardTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },

  // Grid
  section: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItemWrapper: {
    width: '48%',
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  actionCardPressed: {
    backgroundColor: '#F8FAFC',
    transform: [{ scale: 0.98 }],
  },
  actionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTextBox: {},
  actionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  actionSubtext: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },

  // Banner
  bannerSection: {
    paddingHorizontal: 24,
    marginTop: 10,
  },
  financeBanner: {
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  bannerIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  bannerSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 2,
  },
});
