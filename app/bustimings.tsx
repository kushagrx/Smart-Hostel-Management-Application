import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../utils/ThemeContext';
import { busTimings } from '../utils/busTimingsUtils';

export default function BusTimings() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen
          options={{
            title: 'Bus Timings',
            headerStyle: { backgroundColor: '#FF8C00' },
            headerTintColor: '#fff',
            headerShadowVisible: false,
          }}
        />

        {busTimings.map((route) => (
          <View key={route.id} style={styles.section}>
            <View style={styles.routeHeader}>
              <MaterialCommunityIcons 
                name="bus" 
                size={24} 
                color="#FF8C00" 
                style={styles.busIcon}
              />
              <Text style={[styles.routeTitle, { color: colors.text }]}>
                {route.route}
              </Text>
            </View>

            <View style={[styles.timingsCard, { backgroundColor: colors.cardBackground }]}>
              <FlatList
                data={route.times}
                renderItem={({ item, index }) => (
                  <View style={[
                    styles.timeItem,
                    index !== route.times.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }
                  ]}>
                    <MaterialCommunityIcons 
                      name="clock-outline" 
                      size={20} 
                      color="#FF8C00" 
                    />
                    <Text style={[styles.timeText, { color: colors.text }]}>
                      {item}
                    </Text>
                  </View>
                )}
                keyExtractor={(item, index) => index.toString()}
                scrollEnabled={false}
              />
            </View>
          </View>
        ))}

        <View style={[styles.infoCard, { backgroundColor: colors.theme === 'dark' ? '#4d2e0a' : '#FFF3E0' }]}>
          <MaterialCommunityIcons name="information-outline" size={20} color="#FF8C00" />
          <Text style={[styles.infoText, { color: colors.theme === 'dark' ? '#FFB84D' : '#FF8C00' }]}>
            Please arrive 5 minutes before the scheduled time at the pickup point
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  busIcon: {
    marginRight: 10,
  },
  routeTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  timingsCard: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    gap: 12,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 12,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500' as const,
  },
});