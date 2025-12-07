import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isAdmin, useUser } from '../../utils/authUtils';
import { Complaint, getAllComplaints, updateComplaintStatus } from '../../utils/complaintsSyncUtils';

export default function ComplaintsPage() {
  const user = useUser();
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      const data = await getAllComplaints();
      setComplaints(data);
    } catch (error) {
      console.error("Failed to load complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: 'inProgress' | 'resolved' | 'closed') => {
    try {
      await updateComplaintStatus(id, status);
      Alert.alert("Success", `Complaint marked as ${status}.`);
      loadComplaints();
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

  const filteredComplaints = filterStatus
    ? complaints.filter((c) => c.status === filterStatus)
    : complaints;

  const openCount = complaints.filter((c) => c.status === 'open').length;
  const inProgressCount = complaints.filter((c) => c.status === 'inProgress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'resolved').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#FF6B6B';
      case 'inProgress': return '#FF9800';
      case 'resolved': return '#4CAF50';
      case 'closed': return '#94A3B8';
      default: return '#999';
    }
  };

  const getStatusIcon = (status: string): any => {
    switch (status) {
      case 'open': return 'alert-circle';
      case 'inProgress': return 'clock-outline';
      case 'resolved': return 'check-circle';
      case 'closed': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      case 'emergency': return '#B91C1C';
      default: return '#999';
    }
  };

  const getPriorityIcon = (priority: string): any => {
    switch (priority) {
      case 'high': return 'alert';
      case 'medium': return 'minus-circle';
      case 'low': return 'check-circle';
      case 'emergency': return 'alert-decagram';
      default: return 'help-circle';
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#E11D48', '#F472B6']} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="chevron-left" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Manage Complaints</Text>
          </View>
          <TouchableOpacity onPress={loadComplaints} style={styles.backBtn}>
            <MaterialIcons name="refresh" size={24} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialIcons name="alert-circle" size={22} color="#E11D48" />
            <Text style={styles.statValue}>{openCount}</Text>
            <Text style={styles.statLabel}>Open</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="clock-outline" size={22} color="#F59E0B" />
            <Text style={styles.statValue}>{inProgressCount}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="check-circle" size={22} color="#10B981" />
            <Text style={styles.statValue}>{resolvedCount}</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
        </View>

        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <TouchableOpacity
              style={[styles.filterBtn, !filterStatus && styles.filterBtnActive]}
              onPress={() => setFilterStatus(null)}
            >
              <Text style={[styles.filterBtnText, !filterStatus && styles.filterBtnTextActive]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterBtn, filterStatus === 'open' && styles.filterBtnActive]}
              onPress={() => setFilterStatus('open')}
            >
              <Text style={[styles.filterBtnText, filterStatus === 'open' && styles.filterBtnTextActive]}>Open</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterBtn, filterStatus === 'inProgress' && styles.filterBtnActive]}
              onPress={() => setFilterStatus('inProgress')}
            >
              <Text style={[styles.filterBtnText, filterStatus === 'inProgress' && styles.filterBtnTextActive]}>In Progress</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterBtn, filterStatus === 'resolved' && styles.filterBtnActive]}
              onPress={() => setFilterStatus('resolved')}
            >
              <Text style={[styles.filterBtnText, filterStatus === 'resolved' && styles.filterBtnTextActive]}>Resolved</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#E11D48" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={filteredComplaints}
            scrollEnabled={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.complaintCard,
                  selectedId === item.id && styles.complaintCardActive,
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
                        {item.studentName?.charAt(0).toUpperCase() || '?'}
                      </Text>
                    </View>
                    <View style={styles.textInfo}>
                      <Text style={styles.studentName}>{item.studentName || 'Unknown Student'}</Text>
                      <Text style={styles.complaintPreview} numberOfLines={1}>
                        {item.title}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(item.status) },
                    ]}
                  >
                    <MaterialIcons name={getStatusIcon(item.status)} size={14} color="#fff" />
                  </View>
                </View>

                {selectedId === item.id && (
                  <View style={styles.expandedContent}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Email:</Text>
                      <Text style={styles.detailValue}>{item.studentEmail}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Date:</Text>
                      <Text style={styles.detailValue}>
                        {item.createdAt instanceof Date
                          ? item.createdAt.toLocaleDateString() + ', ' + item.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Status:</Text>
                      <View style={[styles.priorityBadge, { backgroundColor: getStatusColor(item.status) }]}>
                        <MaterialIcons name={getStatusIcon(item.status)} size={12} color="#fff" />
                        <Text style={styles.badgeText}>{item.status}</Text>
                      </View>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Priority:</Text>
                      <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
                        <MaterialIcons name={getPriorityIcon(item.priority)} size={12} color="#fff" />
                        <Text style={styles.badgeText}>{item.priority}</Text>
                      </View>
                    </View>

                    <View style={styles.complaintText}>
                      <Text style={styles.complaintTextLabel}>Complaint Details:</Text>
                      <Text style={styles.complaintTextContent}>{item.description}</Text>
                    </View>

                    {item.status !== 'resolved' && item.status !== 'closed' && (
                      <View style={styles.actionButtons}>
                        {item.status !== 'inProgress' && (
                          <TouchableOpacity
                            style={[styles.actionBtn, styles.progressBtn]}
                            onPress={() => handleStatusUpdate(item.id, 'inProgress')}
                          >
                            <MaterialIcons name="progress-clock" size={16} color="#fff" />
                            <Text style={styles.actionBtnText}>In Progress</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.resolveBtn]}
                          onPress={() => handleStatusUpdate(item.id, 'resolved')}
                        >
                          <MaterialIcons name="check" size={16} color="#fff" />
                          <Text style={styles.actionBtnText}>Resolve</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.closeBtn]}
                          onPress={() => handleStatusUpdate(item.id, 'closed')}
                        >
                          <MaterialIcons name="close" size={16} color="#fff" />
                          <Text style={styles.actionBtnText}>Deny/Close</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {(item.status === 'resolved' || item.status === 'closed') && (
                      <View style={[styles.resolvedMessage, item.status === 'closed' && { backgroundColor: '#F1F5F9' }]}>
                        <MaterialIcons name={item.status === 'resolved' ? "check-circle" : "close-circle"} size={20} color={item.status === 'resolved' ? "#4CAF50" : "#64748B"} />
                        <Text style={[styles.resolvedMessageText, item.status === 'closed' && { color: '#475569' }]}>
                          This complaint is {item.status}
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
                <Text style={{ color: '#94A3B8' }}>No complaints found.</Text>
              </View>
            }
          />
        )}
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
    borderLeftColor: '#E11D48',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#E11D48',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  filterContainer: {
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterBtnActive: {
    backgroundColor: '#E11D48',
    borderColor: '#E11D48',
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  filterBtnTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 12,
  },
  complaintCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    borderLeftWidth: 4,
    borderLeftColor: '#E11D48',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  complaintCardActive: {
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
    marginBottom: 2,
  },
  complaintPreview: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
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
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
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
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  complaintText: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  complaintTextLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  complaintTextContent: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
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
  progressBtn: {
    backgroundColor: '#F59E0B',
  },
  resolveBtn: {
    backgroundColor: '#10B981',
  },
  closeBtn: {
    backgroundColor: '#94A3B8',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  resolvedMessage: {
    backgroundColor: '#ECFDF5',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  resolvedMessageText: {
    color: '#047857',
    fontSize: 12,
    fontWeight: '600',
  },
});
