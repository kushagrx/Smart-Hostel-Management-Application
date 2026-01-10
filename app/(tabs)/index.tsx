import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LaundrySettings, subscribeToLaundry } from '../../utils/laundrySyncUtils';
import { MenuItem, subscribeToMenu, WeekMenu } from '../../utils/messSyncUtils';
import { fetchUserData, getInitial, StudentData } from '../../utils/nameUtils';
import { useTheme } from '../../utils/ThemeContext';

export default function Index() {
  const router = useRouter();
  const { colors, theme } = useTheme();
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

      const unsubscribeLaundry = subscribeToLaundry((data) => {
        setLaundry(data);
      });

      const unsubscribeMenu = subscribeToMenu((data) => {
        setFullMenu(data);
      });

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
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getDynamicDinner = () => {
    const today = new Date().toLocaleString('en-US', { weekday: 'long' });
    // @ts-ignore
    const dinnerItems = fullMenu[today]?.dinner;
    if (!dinnerItems || dinnerItems.length === 0) return 'Loading...';

    // Find highlight or first item
    const highlight = dinnerItems.find((i: MenuItem) => i.highlight);
    return highlight ? highlight.dish : dinnerItems[0].dish;
  };

  if (!student) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={['#000428', '#004e92']}
          style={styles.loadingHeader}
        >
          <SafeAreaView edges={['top']}>
            <Text style={styles.title}>Loading...</Text>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#004e92']} tintColor="#004e92" />}
      >
        {/* Modern Header Section */}
        <View style={styles.headerWrapper}>
          <LinearGradient
            colors={['#000428', '#004e92']}
            style={styles.headerContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <SafeAreaView edges={['top']} style={styles.safeArea}>
              <View style={styles.headerContent}>
                <View>
                  <Text style={styles.greeting}>{getGreeting()},</Text>
                  <Text style={styles.userName}>{student.fullName}</Text>
                  <View style={styles.hostelBadge}>
                    <MaterialCommunityIcons name="office-building-marker" size={14} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.hostelName}>{student.hostelName || 'Smart Hostel'}</Text>
                  </View>
                </View>
                <Pressable onPress={() => router.push('/profile')} style={styles.profileBtn}>
                  <View style={styles.userInitialContainer}>
                    <Text style={styles.userInitial}>{getInitial(student.fullName)}</Text>
                  </View>
                </Pressable>
              </View>

              {/* Stat Cards */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Room</Text>
                  <Text style={styles.statValue}>{student.roomNo || '--'}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Status</Text>
                  <Text style={styles.statValue}>{student.status?.toUpperCase() || 'ACTIVE'}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>College</Text>
                  <Text style={styles.statValue} numberOfLines={1}>{student.collegeName || 'N/A'}</Text>
                </View>
              </View>

            </SafeAreaView>
          </LinearGradient>
        </View>

        <View style={styles.mainContent}>
          {/* Daily Highlights */}
          <Text style={styles.sectionTitle}>TODAY'S HIGHLIGHTS</Text>

          <View style={styles.highlightsContainer}>
            {/* Dinner Card */}
            <Pressable
              style={[styles.highlightCard, styles.shadowProp]}
              onPress={() => router.push('/mess')}
            >
              <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
                <MaterialCommunityIcons name="silverware-fork-knife" size={24} color="#004e92" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Tonight's Dinner</Text>
                <Text style={styles.cardValue} numberOfLines={1}>{getDynamicDinner()}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#94A3B8" />
            </Pressable>

            {/* Laundry Card */}
            <View style={[styles.highlightCard, styles.shadowProp, { alignItems: 'flex-start' }]}>
              <View style={[styles.iconBox, { backgroundColor: '#F0FDF4', marginTop: 4 }]}>
                <MaterialCommunityIcons name="washing-machine" size={24} color="#16A34A" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Laundry Service</Text>

                {laundry ? (
                  <View style={{ gap: 4, marginTop: 4 }}>
                    {/* Status Badge */}
                    <View style={{
                      alignSelf: 'flex-start',
                      backgroundColor: laundry.status === 'On Schedule' ? '#DCFCE7' : '#FEE2E2',
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 6,
                      marginBottom: 4
                    }}>
                      <Text style={{
                        color: laundry.status === 'On Schedule' ? '#166534' : '#991B1B',
                        fontSize: 10,
                        fontWeight: '700',
                        textTransform: 'uppercase'
                      }}>
                        {laundry.status}
                      </Text>
                    </View>

                    {/* Schedule Info */}
                    {laundry.status !== 'No Service' && laundry.status !== 'Holiday' ? (
                      <>
                        <Text style={{ fontSize: 13, color: '#334155' }}>
                          <Text style={{ fontWeight: '700' }}>Pickup:</Text> {laundry.pickupDay}, {laundry.pickupTime} {laundry.pickupPeriod}
                        </Text>
                        <Text style={{ fontSize: 13, color: '#334155' }}>
                          <Text style={{ fontWeight: '700' }}>Drop:</Text> {laundry.dropoffDay}, {laundry.dropoffTime} {laundry.dropoffPeriod}
                        </Text>
                      </>
                    ) : null}

                    {/* Message */}
                    {laundry.message ? (
                      <Text style={{ fontSize: 11, color: colors.textSecondary, fontStyle: 'italic', marginTop: 2 }}>
                        "{laundry.message}"
                      </Text>
                    ) : null}
                  </View>
                ) : (
                  <Text style={styles.cardValue}>Loading...</Text>
                )}
              </View>
            </View>
          </View>

          {/* Quick Actions Grid */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>QUICK ACCESS</Text>
          <View style={styles.gridContainer}>
            {[
              { icon: "bullhorn", label: "Notices", route: '/(tabs)/alerts', color: '#3B82F6', bg: '#EFF6FF' },
              { icon: "alert-circle", label: "Complaint", route: '/complaints', color: '#EF4444', bg: '#FEF2F2' },
              { icon: "broom", label: "Cleaning", route: '/roomservice', color: '#F59E0B', bg: '#FFFBEB' },
              { icon: "bus-clock", label: "Timings", route: '/bustimings', color: '#10B981', bg: '#ECFDF5' },
              { icon: "calendar-account-outline", label: "Leave", route: '/leave-request', color: '#7C3AED', bg: '#F5F3FF' }, // Added Leave
              { icon: "phone", label: "Support", route: '/(tabs)/emergency', color: '#EC4899', bg: '#FDF2F8' },
            ].map((item, index) => (
              <Pressable
                key={index}
                style={[styles.gridItem, styles.shadowProp]}
                onPress={() => router.push(item.route as any)}
              >
                <View style={[styles.gridIconBox, { backgroundColor: item.bg }]}>
                  <MaterialCommunityIcons name={item.icon as any} size={28} color={item.color} />
                </View>
                <Text style={styles.gridLabel}>{item.label}</Text>
              </Pressable>
            ))}
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingHeader: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerWrapper: {
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#004e92',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    marginBottom: 20, // Add space below header
  },
  headerContainer: {
    paddingBottom: 32, // More breathing room
    paddingTop: 10,
  },
  safeArea: {
    paddingHorizontal: 28,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 20,
    marginBottom: 32,
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase', // Professional touch
    letterSpacing: 1,
  },
  userName: {
    fontSize: 32, // Larger
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  hostelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)', // Slightly more visible
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100, // Pill shape
    alignSelf: 'flex-start',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  hostelName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  profileBtn: {
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  userInitialContainer: {
    width: 64, // Slightly larger
    height: 64,
    borderRadius: 24, // Squircle
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    backdropFilter: 'blur(10px)', // Note: This prop doesn't work in RN natively but style implies intent
  },
  userInitial: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  statDivider: {
    width: 1,
    height: 30, // Taller divider
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  mainContent: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 16,
    letterSpacing: 1,
  },
  highlightsContainer: {
    gap: 16,
  },
  highlightCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '700',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '30%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    aspectRatio: 1,
    justifyContent: 'center',
  },
  gridIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
  shadowProp: {
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
  },
});