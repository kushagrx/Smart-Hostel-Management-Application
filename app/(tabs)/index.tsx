import { Pressable, Text, View, ScrollView } from "react-native";
import { StyleSheet } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import { getInitial, userData } from '../../utils/nameUtils';
import { getTodaysDinner } from '../../utils/messUtils';
import { useTheme } from '../../utils/ThemeContext';

export default function Index() {
  const router = useRouter();
  const { colors, theme } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#FF8C00', '#FFA500']} 
        style={styles.headerContainer}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Smart Hostel ⚡</Text>
          <Text style={styles.hostelName}>Aashiyana Grand Hostel for Boys</Text>
        </View>
        <Pressable onPress={() => router.push('/profile')}>
          <View style={styles.userInitialContainer}>
            <Text style={styles.userInitial}>{getInitial(userData.fullName)}</Text>
          </View>
        </Pressable>
      </LinearGradient>

      <View style={styles.mainContent}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>DAILY ALERTS</Text>
          <View style={styles.alertsContainer}>
            <Pressable 
              style={[styles.alertCard, styles.shadowProp, { backgroundColor: colors.cardBackground }]}
              onPress={() => router.push('/mess')}
            >
              <View style={[styles.iconContainer, { backgroundColor: theme === 'dark' ? '#4d2e0a' : '#FFF5E6' }]}>
                <MaterialIcons name="restaurant" size={24} color="#FF8C00" />
              </View>
              <View>
                <Text style={[styles.alertTitle, { color: colors.text }]}>Today's Dinner:</Text>
                <Text style={[styles.alertContent, { color: colors.secondary }]}>{getTodaysDinner()}</Text>
              </View>
              <MaterialIcons 
                name="chevron-right" 
                size={24} 
                color={colors.icon}
                style={styles.chevronIcon}
              />
            </Pressable>
            <View style={[styles.alertCard, styles.shadowProp, { backgroundColor: colors.cardBackground }]}>
              <View style={[styles.iconContainer, { backgroundColor: theme === 'dark' ? '#4d2e0a' : '#FFF5E6' }]}>
                <MaterialIcons name="local-laundry-service" size={24} color="#FF8C00" />
              </View>
              <View>
                <Text style={[styles.alertTitle, { color: colors.text }]}>Laundry:</Text>
                <Text style={[styles.alertContent, { color: colors.secondary }]}>Pickup today @5:00 PM</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>QUICK ACTIONS</Text>
          <View style={styles.quickActionsGrid}>
            {[
              { icon: "announcement", text: "Imp Notices", onPress: () => router.push('/(tabs)/alerts') },
              { icon: "report-problem", text: "File Complaint", onPress: () => router.push('/complaints') },
              { icon: "cleaning-services", text: "Room Service", onPress: () => {} },
              { icon: "directions-bus", text: "Bus Timings", onPress: () => {} },
            ].map((item, index) => (
              <Pressable 
                key={index}
                style={[styles.actionButton, styles.shadowProp, { backgroundColor: colors.cardBackground }]} 
                onPress={item.onPress}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: theme === 'dark' ? '#4d2e0a' : '#FFF5E6' }]}>
                  <MaterialIcons name={item.icon as any} size={24} color="#FF8C00" />
                </View>
                <Text style={[styles.actionText, { color: colors.text }]}>{item.text}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    marginBottom: 10, 
  },
  headerLeft: {
    flex: 1,
  },
  userInitialContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: 55,  
    height: 55, 
    borderRadius: 28, 
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2, 
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  userInitial: {
    color: 'white',
    fontSize: 28,
    fontWeight: '600',
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  hostelName: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '400',
    marginTop: 2,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 15,
    letterSpacing: 1,
  },
  alertsContainer: {
    gap: 15,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    padding: 15,
    borderRadius: 16,
  },
  iconContainer: {
    padding: 10,
    borderRadius: 12,
  },
  actionIconContainer: {
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
  },
  alertTitle: {
    fontWeight: '600',
    fontSize: 16,
  },
  alertContent: {
    fontSize: 14,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  actionButton: {
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    width: '47%',
  },
  actionText: {
    fontWeight: '600',
    fontSize: 14,
  },
  shadowProp: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  chevronIcon: {
    marginLeft: 'auto',
  },
});