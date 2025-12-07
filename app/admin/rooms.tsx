import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isAdmin, useUser } from '../../utils/authUtils';

const MOCK_ROOMS = [
  { id: 'r101', number: '101', occupant: 'Alice', status: 'occupied', capacity: 2, occupied: 1 },
  { id: 'r102', number: '102', occupant: 'Bob', status: 'occupied', capacity: 2, occupied: 2 },
  { id: 'r103', number: '103', occupant: null, status: 'vacant', capacity: 2, occupied: 0 },
  { id: 'r104', number: '104', occupant: 'Charlie', status: 'occupied', capacity: 2, occupied: 1 },
  { id: 'r105', number: '105', occupant: null, status: 'maintenance', capacity: 2, occupied: 0 },
];

export default function RoomsPage() {
  const user = useUser();
  const router = useRouter();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  if (!isAdmin(user))
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Access denied.</Text>
      </View>
    );

  const occupiedRooms = MOCK_ROOMS.filter((r) => r.status === 'occupied').length;
  const vacantRooms = MOCK_ROOMS.filter((r) => r.status === 'vacant').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied':
        return '#06B6D4';
      case 'vacant':
        return '#8B5CF6';
      case 'maintenance':
        return '#EC4899';
      default:
        return '#94A3B8';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'check-circle';
      case 'vacant':
        return 'home-outline';
      case 'maintenance':
        return 'wrench';
      default:
        return 'help-circle';
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#0891B2', '#06B6D4']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="chevron-left" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Manage Rooms</Text>
        </View>
      </LinearGradient>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialIcons name="door-closed" size={24} color="#0891B2" />
          <Text style={styles.statValue}>{MOCK_ROOMS.length}</Text>
          <Text style={styles.statLabel}>Total Rooms</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialIcons name="check-circle" size={24} color="#06B6D4" />
          <Text style={styles.statValue}>{occupiedRooms}</Text>
          <Text style={styles.statLabel}>Occupied</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialIcons name="home-outline" size={24} color="#14B8A6" />
          <Text style={styles.statValue}>{vacantRooms}</Text>
          <Text style={styles.statLabel}>Vacant</Text>
        </View>
      </View>

      {/* list header removed per UI request */}

      <FlatList
        data={MOCK_ROOMS}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.roomCard,
              selectedRoom === item.id && styles.roomCardActive,
            ]}
            onPress={() => setSelectedRoom(selectedRoom === item.id ? null : item.id)}
          >
            <View style={styles.roomHeader}>
              <View style={styles.roomNumber}>
                <Text style={styles.roomNumberText}>#{item.number}</Text>
              </View>
              <View style={styles.roomInfo}>
                <Text style={styles.roomTitle}>
                  {item.occupant ? item.occupant : 'Vacant'}
                </Text>
                <Text style={styles.roomCapacity}>
                  Capacity: {item.occupied}/{item.capacity}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <MaterialIcons name={getStatusIcon(item.status)} size={16} color="#fff" />
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>

            {selectedRoom === item.id && (
              <View style={styles.expandedContent}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Room Number:</Text>
                  <Text style={styles.detailValue}>{item.number}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Current Occupant:</Text>
                  <Text style={styles.detailValue}>
                    {item.occupant || 'No occupant'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Bed Usage:</Text>
                  <Text style={styles.detailValue}>
                    {item.occupied} of {item.capacity} beds
                  </Text>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity style={[styles.actionBtn, styles.primaryBtn]}>
                    <MaterialIcons name="pencil" size={16} color="#fff" />
                    <Text style={styles.actionBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, styles.dangerBtn]}>
                    <MaterialIcons name="delete" size={16} color="#fff" />
                    <Text style={styles.actionBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    paddingBottom: 20,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#0891B2',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0891B2',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  listHeader: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  listContent: {
    paddingHorizontal: 12,
  },
  roomCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    borderLeftWidth: 4,
    borderLeftColor: '#0891B2',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  roomCardActive: {
    borderLeftColor: '#0891B2',
    shadowOpacity: 0.15,
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    justifyContent: 'space-between',
  },
  roomNumber: {
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: '#0891B2',
  },
  roomNumberText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0891B2',
  },
  roomInfo: {
    flex: 1,
    marginLeft: 14,
  },
  roomTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  roomCapacity: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  expandedContent: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  primaryBtn: {
    backgroundColor: '#0891B2',
  },
  dangerBtn: {
    backgroundColor: '#EC4899',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
