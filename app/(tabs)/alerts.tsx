import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// Dummy alert data example
const MOCK_ALERTS = [
  {
    id: '1',
    type: 'mess',
    icon: <MaterialCommunityIcons name="food-fork-drink" size={28} color="#FF8C00" />,
    title: 'Mess Food',
    message: 'Chicken Biryani Tonight!',
    time: 'Today, 1:00 PM'
  },
  {
    id: '2',
    type: 'laundry',
    icon: <MaterialCommunityIcons name="washing-machine" size={28} color="#FF8C00" />,
    title: 'Laundry',
    message: 'Pickup today @5:00 PM',
    time: 'Today, 11:00 AM'
  },
  // Additional alerts can be added here
];

export default function Alerts() {
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const [refreshing, setRefreshing] = useState(false);

  // Pull-to-refresh for later API integration
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setAlerts(MOCK_ALERTS);
      setRefreshing(false);
    }, 1000);
  };

  const renderItem = ({ item }: { item: typeof MOCK_ALERTS[0] }) => (
    <View style={styles.card}>
      <View style={styles.iconContainer}>{item.icon}</View>
      <View>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardMessage}>{item.message}</Text>
        <Text style={styles.cardTime}>{item.time}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Alerts',
            headerStyle: { backgroundColor: '#FF8C00' },
            headerTintColor: '#fff',
            headerShadowVisible: false,
          }}
        />
        <Text style={styles.header}>Latest Alerts</Text>
        <FlatList
          data={alerts}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#FF8C00']}
              tintColor="#FF8C00"
            />
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d3436',
    margin: 20,
    marginBottom: 10,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#e0e0e0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF8C00',
  },
  cardMessage: {
    fontSize: 15,
    color: '#2d3436',
    marginBottom: 4,
  },
  cardTime: {
    fontSize: 13,
    color: '#999',
  }
});