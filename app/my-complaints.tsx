import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';

const mockComplaints = [
  {
    id: '1',
    title: 'Bathroom Tap Leaking',
    category: 'maintenance',
    priority: 'medium',
    status: 'inProgress',
    createdAt: new Date('2024-02-20'),
    description: 'The tap in bathroom 2 is continuously leaking',
  },
  {
    id: '2',
    title: 'Room Cleaning Required',
    category: 'cleanliness',
    priority: 'low',
    status: 'open',
    createdAt: new Date('2024-02-19'),
    description: 'Need room cleaning service',
  },
];

export default function MyComplaints() {
  const [selectedTab, setSelectedTab] = useState<'active' | 'resolved'>('active');

  const getStatusColor = (status: string) => {
    const colors = {
      open: '#FF8C00',
      inProgress: '#2196F3',
      resolved: '#4CAF50',
      closed: '#9E9E9E',
    };
    return colors[status] || colors.open;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      open: 'fiber-new',
      inProgress: 'pending-actions',
      resolved: 'check-circle',
      closed: 'cancel',
    };
    return icons[status] || icons.open;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: "My Complaints",
          headerStyle: { backgroundColor: '#FF8C00' },
          headerTintColor: '#fff',
        }} 
      />

      <View style={styles.tabContainer}>
        <Pressable 
          style={[styles.tab, selectedTab === 'active' && styles.activeTab]}
          onPress={() => setSelectedTab('active')}
        >
          <Text style={[styles.tabText, selectedTab === 'active' && styles.activeTabText]}>
            Active
          </Text>
        </Pressable>
        <Pressable 
          style={[styles.tab, selectedTab === 'resolved' && styles.activeTab]}
          onPress={() => setSelectedTab('resolved')}
        >
          <Text style={[styles.tabText, selectedTab === 'resolved' && styles.activeTabText]}>
            Resolved
          </Text>
        </Pressable>
      </View>

      <ScrollView style={styles.complaintsList}>
        {mockComplaints.map((complaint) => (
          <Pressable key={complaint.id} style={[styles.complaintCard, styles.shadowProp]}>
            <View style={styles.cardHeader}>
              <Text style={styles.complaintTitle}>{complaint.title}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(complaint.status) }]}>
                <MaterialIcons 
                  name={getStatusIcon(complaint.status)} 
                  size={16} 
                  color="white" 
                />
                <Text style={styles.statusText}>
                  {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                </Text>
              </View>
            </View>
            
            <Text style={styles.description}>{complaint.description}</Text>
            
            <View style={styles.cardFooter}>
              <Text style={styles.date}>
                {complaint.createdAt.toLocaleDateString()}
              </Text>
              <View style={styles.priorityBadge}>
                <Text style={styles.priorityText}>{complaint.priority}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  tab: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#FF8C00',
  },
  tabText: {
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: 'white',
  },
  complaintsList: {
    padding: 15,
  },
  complaintCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  complaintTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    color: '#636e72',
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    color: '#666',
    fontSize: 12,
  },
  priorityBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
  },
  shadowProp: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
});