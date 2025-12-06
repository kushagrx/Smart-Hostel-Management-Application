import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../utils/ThemeContext';
import { roomServices } from '../utils/busTimingsUtils';

export default function RoomService() {
  const { colors } = useTheme();

  const handleServiceRequest = (serviceName: string) => {
    Alert.alert(
      'Request Service',
      `Request ${serviceName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request',
          onPress: () => Alert.alert('Success', `Your request for ${serviceName} has been submitted!`),
          style: 'default'
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen
          options={{
            title: 'Room Services',
            headerStyle: { backgroundColor: '#FF8C00' },
            headerTintColor: '#fff',
            headerShadowVisible: false,
          }}
        />

        <Text style={[styles.header, { color: colors.text }]}>
          Available Services
        </Text>

        <View style={styles.servicesGrid}>
          {roomServices.map((service) => (
            <Pressable
              key={service.id}
              style={[
                styles.serviceCard,
                { backgroundColor: colors.cardBackground },
                !service.available && styles.serviceCardDisabled
              ]}
              onPress={() => service.available && handleServiceRequest(service.name)}
              disabled={!service.available}
            >
              <View style={[
                styles.iconBox,
                {
                  backgroundColor: service.available
                    ? colors.theme === 'dark' ? '#4d2e0a' : '#FFF5E6'
                    : colors.theme === 'dark' ? '#333' : '#f0f0f0'
                }
              ]}>
                <MaterialCommunityIcons
                  name={service.icon as any}
                  size={28}
                  color={service.available ? '#FF8C00' : '#999'}
                />
              </View>

              <Text style={[
                styles.serviceName,
                { color: colors.text },
                !service.available && styles.serviceNameDisabled
              ]}>
                {service.name}
              </Text>

              <Text style={[
                styles.serviceDescription,
                { color: colors.secondary }
              ]}>
                {service.description}
              </Text>

              {!service.available && (
                <View style={styles.unavailableBadge}>
                  <Text style={styles.unavailableText}>Coming Soon</Text>
                </View>
              )}

              {service.available && (
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={20}
                  color="#FF8C00"
                  style={styles.arrowIcon}
                />
              )}
            </Pressable>
          ))}
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.theme === 'dark' ? '#4d2e0a' : '#FFF3E0' }]}>
          <MaterialCommunityIcons name="phone" size={20} color="#FF8C00" />
          <Text style={[styles.infoText, { color: colors.theme === 'dark' ? '#FFB84D' : '#FF8C00' }]}>
            For urgent issues, call hostel office: +91 98765 43210
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
  header: {
    fontSize: 22,
    fontWeight: '700' as const,
    marginBottom: 20,
  },
  servicesGrid: {
    gap: 15,
    marginBottom: 20,
  },
  serviceCard: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  serviceCardDisabled: {
    opacity: 0.6,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  serviceNameDisabled: {
    color: '#999',
  },
  serviceDescription: {
    fontSize: 13,
    marginBottom: 8,
  },
  unavailableBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  unavailableText: {
    color: '#999',
    fontSize: 12,
    fontWeight: '500' as const,
  },
  arrowIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
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