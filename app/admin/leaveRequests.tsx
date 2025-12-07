import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isAdmin, useUser } from '../../utils/authUtils';
import { getAllLeaves, LeaveRequest, updateLeaveStatus } from '../../utils/leavesUtils';

export default function LeaveRequestsPage() {
  const user = useUser();
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await getAllLeaves();
      setRequests(data);
    } catch (error) {
      console.error("Failed to load leaves:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updateLeaveStatus(id, status);
      Alert.alert("Success", `Request ${status} successfully.`);
      loadRequests(); // Refresh
    } catch (error) {
      Alert.alert("Error", "Failed to update status.");
    }
  };

  if (!isAdmin(user))
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Access denied.</Text>
      </View>
    );

  const pendingCount = requests.filter((l) => l.status === 'pending').length;
  const approvedCount = requests.filter((l) => l.status === 'approved').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'approved': return '#10B981';
      case 'rejected': return '#EF4444';
      default: return '#64748B';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'clock-outline';
      case 'approved': return 'check-circle';
      case 'rejected': return 'close-circle';
      default: return 'help-circle';
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#D97706', '#F59E0B']} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="chevron-left" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Leave Requests</Text>
          </View>
          <TouchableOpacity onPress={loadRequests} style={styles.backBtn}>
            <MaterialIcons name="refresh" size={24} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialIcons name="calendar-clock" size={22} color="#D97706" />
            <Text style={styles.statValue}>{requests.length}</Text>
            <Text style={styles.statLabel}>Total Requests</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="clock-outline" size={22} color="#F59E0B" />
            <Text style={styles.statValue}>{pendingCount}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="check-circle" size={22} color="#10B981" />
            <Text style={styles.statValue}>{approvedCount}</Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>
        </View>

        <FlatList
          data={requests}
          scrollEnabled={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.requestCard,
                selectedId === item.id && styles.requestCardActive,
              ]}
              onPress={() => setSelectedId(selectedId === item.id ? null : item.id)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.studentInfo}>
                  <View
                    style={[
                      styles.studentAvatar,
                      { backgroundColor: getStatusColor(item.status) },
                    ]}
                  >
                    <Text style={styles.studentInitial}>
                      {item.studentName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.textInfo}>
                    <Text style={styles.studentName}>{item.studentName}</Text>
                    <Text style={styles.dateRange}>
                      {item.startDate} to {item.endDate}
                    </Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                  <MaterialIcons name={getStatusIcon(item.status) as any} size={14} color="#fff" />
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>

              {selectedId === item.id && (
                <View style={styles.expandedContent}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Room No:</Text>
                    <Text style={styles.detailValue}>{item.studentRoom}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Reason:</Text>
                    <Text style={[styles.detailValue, { flex: 1, textAlign: 'right' }]}>{item.reason}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Duration:</Text>
                    <Text style={styles.detailValue}>{item.days} days</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Current Status:</Text>
                    <Text style={[styles.detailValue, { color: getStatusColor(item.status) }]}>
                      {item.status.toUpperCase()}
                    </Text>
                  </View>

                  {item.status === 'pending' && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.approveBtn]}
                        onPress={() => handleStatusUpdate(item.id, 'approved')}
                      >
                        <MaterialIcons name="check" size={16} color="#fff" />
                        <Text style={styles.actionBtnText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.rejectBtn]}
                        onPress={() => handleStatusUpdate(item.id, 'rejected')}
                      >
                        <MaterialIcons name="close" size={16} color="#fff" />
                        <Text style={styles.actionBtnText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {item.status !== 'pending' && (
                    <View style={styles.statusMessage}>
                      <Text style={styles.statusMessageText}>
                        This request has already been{' '}
                        <Text style={{ fontWeight: '700' }}>{item.status}</Text>
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', padding: 40 }}>
              <Text style={{ color: '#94A3B8' }}>No leave requests found.</Text>
            </View>
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    paddingBottom: 20,
    minHeight: '100%',
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
    borderLeftColor: '#D97706',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#D97706',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 12,
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    borderLeftWidth: 4,
    borderLeftColor: '#D97706',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  requestCardActive: {
    shadowOpacity: 0.12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  studentAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentInitial: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  textInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  dateRange: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
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
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
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
  approveBtn: {
    backgroundColor: '#10B981',
  },
  rejectBtn: {
    backgroundColor: '#EF4444',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statusMessage: {
    backgroundColor: '#ECFDF5',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  statusMessageText: {
    color: '#047857',
    fontSize: 12,
    textAlign: 'center',
  },
});
