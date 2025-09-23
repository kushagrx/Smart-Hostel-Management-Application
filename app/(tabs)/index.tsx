import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native";
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Smart Hostel ⚡</Text>
        <View style={styles.headerRight}>
          <Text style={styles.userInitial}>S</Text>
          <Ionicons name="notifications-outline" size={24} color="black" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DAILY ALERTS</Text>
        <View style={styles.alertsContainer}>
          <View style={styles.alertCard}>
            <MaterialIcons name="restaurant" size={24} color="#4A90E2" />
            <View>
              <Text style={styles.alertTitle}>Mess Food:</Text>
              <Text style={styles.alertContent}>Chicken Biryani Tonight!</Text>
            </View>
          </View>
          <View style={styles.alertCard}>
            <MaterialIcons name="local-laundry-service" size={24} color="#4A90E2" />
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
          <Pressable style={styles.actionButton} onPress={()=>{
            router.push('/(tabs)/alerts');
          }} >
            <MaterialIcons name="announcement" size={24} color="#4A90E2" />
            <Text style={styles.actionText}>Imp Notices</Text>
          </Pressable>

          <Pressable style={styles.actionButton}>
            <MaterialIcons name="report-problem" size={24} color="#4A90E2" />
            <Text style={styles.actionText}>File Complaint</Text>
          </Pressable>

          <Pressable style={styles.actionButton}>
            <MaterialIcons name="cleaning-services" size={24} color="#4A90E2" />
            <Text style={styles.actionText}>Room Service</Text>
          </Pressable>

          <Pressable style={styles.actionButton}>
            <MaterialIcons name="directions-bus" size={24} color="#4A90E2" />
            <Text style={styles.actionText}>Bus Timings</Text>
          </Pressable>

        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  userInitial: {
    backgroundColor: '#E8F0FE',
    padding: 8,
    borderRadius: 20,
    color: '#4A90E2',
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    color: '#666',
  },
  alertsContainer: {
    backgroundColor: '#E8F0FE',
    borderRadius: 12,
    padding: 15,
    gap: 15,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  alertTitle: {
    fontWeight: '600',
    color: '#333',
  },
  alertContent: {
    color: '#666',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  actionButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    width: '47%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  actionText: {
    marginTop: 8,
    color: '#333',
    fontWeight: '500',
  },
});