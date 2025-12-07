import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { busTimings } from '../utils/busTimingsUtils';

export default function BusTimings() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <LinearGradient
        colors={['#000428', '#004e92']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView edges={['top', 'left', 'right']}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Bus Schedule</Text>
              <Text style={styles.headerSubtitle}>Campus Shuttle Timings</Text>
            </View>
            <View style={styles.headerIcon}>
              <MaterialCommunityIcons name="bus-clock" size={28} color="#fff" />
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {busTimings.map((route, index) => (
          <View key={route.id || index} style={styles.section}>
            <View style={styles.routeHeader}>
              <View style={styles.routeIconBox}>
                <MaterialCommunityIcons name="bus-stop" size={22} color="#004e92" />
              </View>
              <Text style={styles.routeTitle}>{route.route}</Text>
            </View>

            <View style={[styles.timingsCard, styles.shadowProp]}>
              {route.times.map((item, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.timeItem,
                    idx !== route.times.length - 1 && styles.borderBottom
                  ]}
                >
                  <View style={styles.timeIconBox}>
                    <MaterialCommunityIcons name="clock-time-four-outline" size={18} color="#64748B" />
                  </View>
                  <Text style={styles.timeText}>{item}</Text>
                  {idx === 0 && (
                    <View style={styles.nextBadge}>
                      <Text style={styles.nextBadgeText}>Next</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="information" size={24} color="#004e92" />
          <Text style={styles.infoText}>
            Please arrive 5 minutes before the scheduled time at the pickup point. Timings may vary slightly due to traffic.
          </Text>
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
  header: {
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: "#004e92",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  headerContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginTop: 4,
  },
  headerIcon: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
    paddingLeft: 4,
  },
  routeIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: 0.5,
  },
  timingsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 16,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  timeIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
  nextBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  nextBadgeText: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '700',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#1E40AF',
    lineHeight: 20,
  },
  shadowProp: {
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
});