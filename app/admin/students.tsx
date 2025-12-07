import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { isAdmin, useUser } from '../../utils/authUtils';

const MOCK_STUDENTS = [
  { id: 's1', name: 'Alice Johnson', room: '101', email: 'alice@hostel.edu', phone: '9876543210', rollNo: 'B001', status: 'active' },
  { id: 's2', name: 'Bob Smith', room: '102', email: 'bob@hostel.edu', phone: '9876543211', rollNo: 'B002', status: 'active' },
  { id: 's3', name: 'Charlie Brown', room: '103', email: 'charlie@hostel.edu', phone: '9876543212', rollNo: 'B003', status: 'inactive' },
  { id: 's4', name: 'Diana Prince', room: '104', email: 'diana@hostel.edu', phone: '9876543213', rollNo: 'B004', status: 'active' },
  { id: 's5', name: 'Eve White', room: '105', email: 'eve@hostel.edu', phone: '9876543214', rollNo: 'B005', status: 'active' },
];

export default function StudentsPage() {
  const user = useUser();
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isAdmin(user))
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Access denied.</Text>
      </View>
    );

  const filteredStudents = MOCK_STUDENTS.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.room.includes(searchQuery) ||
      s.rollNo.includes(searchQuery)
  );

  const activeStudents = MOCK_STUDENTS.filter((s) => s.status === 'active').length;

  const getStatusColor = (status: string) => {
    return status === 'active' ? '#4CAF50' : '#F44336';
  };

  const getStatusIcon = (status: string) => {
    return status === 'active' ? 'check-circle' : 'alert-circle';
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="chevron-left" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Manage Students</Text>
        </View>
      </LinearGradient>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialIcons name="account-group" size={22} color="#6366F1" />
          <Text style={styles.statValue}>{MOCK_STUDENTS.length}</Text>
          <Text style={styles.statLabel}>Total Students</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialIcons name="check-circle" size={22} color="#06B6D4" />
          <Text style={styles.statValue}>{activeStudents}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialIcons name="door-closed" size={22} color="#8B5CF6" />
          <Text style={styles.statValue}>{MOCK_STUDENTS.length}</Text>
          <Text style={styles.statLabel}>Rooms</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <MaterialIcons name="magnify" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, room, or roll no..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>
          {filteredStudents.length} Student{filteredStudents.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={filteredStudents}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.studentCard,
              selectedId === item.id && styles.studentCardActive,
            ]}
            onPress={() => setSelectedId(selectedId === item.id ? null : item.id)}
          >
            <View style={styles.cardHeader}>
              <View style={styles.studentAvatarContainer}>
                <View style={styles.studentAvatar}>
                  <Text style={styles.studentInitial}>
                    {item.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </Text>
                </View>
              </View>
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{item.name}</Text>
                <View style={styles.roomRollContainer}>
                  <Text style={styles.detailSmall}>Room {item.room}</Text>
                  <Text style={styles.detailSmall}>• {item.rollNo}</Text>
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <MaterialIcons name={getStatusIcon(item.status)} size={14} color="#fff" />
              </View>
            </View>

            {selectedId === item.id && (
              <View style={styles.expandedContent}>
                <View style={styles.infoSection}>
                  <View style={styles.detailRow}>
                    <View style={styles.detailLeft}>
                      <MaterialIcons name="account" size={16} color="#6366F1" />
                      <Text style={styles.detailLabel}>Full Name</Text>
                    </View>
                    <Text style={styles.detailValue}>{item.name}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <View style={styles.detailLeft}>
                      <MaterialIcons name="card-account-details" size={16} color="#6366F1" />
                      <Text style={styles.detailLabel}>Roll No</Text>
                    </View>
                    <Text style={styles.detailValue}>{item.rollNo}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <View style={styles.detailLeft}>
                      <MaterialIcons name="door-closed" size={16} color="#8B5CF6" />
                      <Text style={styles.detailLabel}>Room</Text>
                    </View>
                    <Text style={styles.detailValue}>{item.room}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <View style={styles.detailLeft}>
                      <MaterialIcons name="email" size={16} color="#06B6D4" />
                      <Text style={styles.detailLabel}>Email</Text>
                    </View>
                    <Text style={styles.detailValue}>{item.email}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <View style={styles.detailLeft}>
                      <MaterialIcons name="phone" size={16} color="#EC4899" />
                      <Text style={styles.detailLabel}>Phone</Text>
                    </View>
                    <Text style={styles.detailValue}>{item.phone}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <View style={styles.detailLeft}>
                      <MaterialIcons name="check-circle" size={16} color={getStatusColor(item.status)} />
                      <Text style={styles.detailLabel}>Status</Text>
                    </View>
                    <Text style={[styles.detailValue, { color: getStatusColor(item.status), fontWeight: '700' }]}>
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity style={[styles.actionBtn, styles.editBtn]}>
                    <MaterialIcons name="pencil" size={16} color="#fff" />
                    <Text style={styles.actionBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, styles.viewBtn]}>
                    <MaterialIcons name="eye" size={16} color="#fff" />
                    <Text style={styles.actionBtnText}>View Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]}>
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
    borderLeftColor: '#6366F1',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6366F1',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
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
  studentCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    borderLeftWidth: 0,
    shadowColor: '#6366F1',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderTopWidth: 3,
    borderTopColor: '#6366F1',
  },
  studentCardActive: {
    shadowOpacity: 0.18,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    backgroundColor: '#FAFBFF',
    borderBottomWidth: 0,
  },
  studentAvatarContainer: {
    marginRight: 12,
  },
  studentAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  studentInitial: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 3,
    letterSpacing: -0.3,
  },
  roomRollContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailSmall: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  statusBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandedContent: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  infoSection: {
    marginBottom: 12,
    gap: 0,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    fontWeight: '600',
  },
  editBtn: {
    backgroundColor: '#6366F1',
  },
  viewBtn: {
    backgroundColor: '#06B6D4',
  },
  deleteBtn: {
    backgroundColor: '#EC4899',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
});
