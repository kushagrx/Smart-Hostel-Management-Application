import { Pressable, Text, View, ScrollView } from "react-native";
import { StyleSheet } from "react-native";
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';

export default function Index() {
  const router = useRouter();
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#FF8C00', '#FFA500']} // Changed gradient to stay in orange family
        style={styles.headerContainer}
      >
        <Text style={styles.title}>Smart Hostel ⚡</Text>
        <View style={styles.headerRight}>
          <Pressable onPress={() => router.push('/(tabs)/profile')}>
            <View style={styles.userInitialContainer}>
              <Text style={styles.userInitial}>S</Text>
            </View>
          </Pressable>
        </View>
      </LinearGradient>

      <View style={styles.mainContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DAILY ALERTS</Text>
          <View style={styles.alertsContainer}>
            <View style={[styles.alertCard, styles.shadowProp]}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="restaurant" size={24} color="#FF8C00" />
              </View>
              <View>
                <Text style={styles.alertTitle}>Mess Food:</Text>
                <Text style={styles.alertContent}>Chicken Biryani Tonight!</Text>
              </View>
            </View>
            <View style={[styles.alertCard, styles.shadowProp]}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="local-laundry-service" size={24} color="#FF8C00" />
              </View>
              <View>
                <Text style={styles.alertTitle}>Laundry:</Text>
                <Text style={styles.alertContent}>Pickup today @5:00 PM</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
          <View style={styles.quickActionsGrid}>
            {([
              { icon: "announcement", text: "Imp Notices", onPress: () => router.push('/(tabs)/alerts') },
              { icon: "report-problem", text: "File Complaint" },
              { icon: "cleaning-services", text: "Room Service" },
              { icon: "directions-bus", text: "Bus Timings" },
            ] as { icon: React.ComponentProps<typeof MaterialIcons>["name"], text: string, onPress?: () => void }[]).map((item, index) => (
              <Pressable 
                key={index}
                style={[styles.actionButton, styles.shadowProp]} 
                onPress={item.onPress}
              >
                <View style={styles.actionIconContainer}>
                  <MaterialIcons name={item.icon} size={24} color="#FF8C00" />
                </View>
                <Text style={styles.actionText}>{item.text}</Text>
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
    backgroundColor: '#f8f9fa',
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  userInitialContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: 55,  
    height: 55, 
    borderRadius: 28, 
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2, // Added border
    borderColor: 'rgba(255, 255, 255, 0.5)', // Semi-transparent white border
  },
  userInitial: {
    color: 'white',
    fontSize: 28, // Increased font size
    fontWeight: '600',
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "white",
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 15,
    color: '#2d3436',
    letterSpacing: 1,
  },
  alertsContainer: {
    gap: 15,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 16,
  },
  iconContainer: {
    backgroundColor: '#FFF5E6',
    padding: 10,
    borderRadius: 12,
  },
  actionIconContainer: {
    backgroundColor: '#FFF5E6',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
  },
  alertTitle: {
    fontWeight: '600',
    color: '#2d3436',
    fontSize: 16,
  },
  alertContent: {
    color: '#636e72',
    fontSize: 14,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  actionButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    width: '47%',
  },
  actionText: {
    color: '#2d3436',
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
});