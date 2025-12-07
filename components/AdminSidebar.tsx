import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Item = { to: string; label: string; icon?: string };

const items: Item[] = [
  { to: '.', label: 'Dashboard', icon: 'view-dashboard' },
  { to: 'students', label: 'Students', icon: 'account-group' },
  { to: 'rooms', label: 'Rooms', icon: 'door-closed' },
  { to: 'complaints', label: 'Complaints', icon: 'alert-circle' },
  { to: 'leaveRequests', label: 'Leave Requests', icon: 'calendar-clock' },
  { to: 'notices', label: 'Notices', icon: 'bullhorn' },
];

export default function AdminSidebar() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      {items.map((i) => (
        <TouchableOpacity
          key={i.to}
          style={styles.item}
          onPress={() => router.replace(`/admin/${i.to}`)}
          accessibilityRole="button"
        >
          <MaterialIcons name={i.icon || 'circle'} size={18} color="#FF8C00" />
          <Text style={styles.text}>{i.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 2,
    borderBottomColor: '#FF8C00',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  item: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF8F0',
    borderRadius: 8,
  },
  text: {
    fontWeight: '700',
    marginLeft: 6,
    color: '#333'
  }
});
