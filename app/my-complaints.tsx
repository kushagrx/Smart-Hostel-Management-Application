import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StudentComplaintListSkeleton } from '../components/SkeletonLists';
import { Complaint, subscribeToStudentComplaints } from '../utils/complaintsSyncUtils';

export default function MyComplaints() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<'active' | 'resolved'>('active');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToStudentComplaints((data) => {
      setComplaints(data);
      setLoading(false);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const filteredComplaints = useMemo(() => {
    return complaints.filter(complaint => {
      if (selectedTab === 'active') {
        return ['open', 'inProgress'].includes(complaint.status);
      } else {
        return ['resolved', 'closed'].includes(complaint.status);
      }
    });
  }, [selectedTab, complaints]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: '#F59E0B',        // Amber
      inProgress: '#3B82F6',  // Blue
      resolved: '#10B981',    // Green
      closed: '#64748B',      // Slate
    };
    return colors[status] || colors.open;
  };

  const getStatusIcon = (status: string): any => {
    const icons: Record<string, string> = {
      open: 'clock-outline',
      inProgress: 'progress-wrench',
      resolved: 'check-circle',
      closed: 'close-circle-outline',
    };
    return icons[status] || 'help-circle-outline';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: '#10B981',
      medium: '#F59E0B',
      high: '#F97316',
      emergency: '#EF4444'
    };
    return colors[priority] || colors.low;
  };

  const formatDate = (date: Date) => {
    if (!date) return '';
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (diffDays === 0 && now.getDate() === date.getDate()) {
      return `Today, ${timeString}`;
    }
    if (diffDays === 0 || (diffDays === 1 && now.getDate() !== date.getDate())) {
      return `Yesterday, ${timeString}`;
    }
    if (diffDays < 7) {
      return `${diffDays} days ago`;
    }
    return date.toLocaleDateString() + ', ' + timeString;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <LinearGradient
        colors={['#000428', '#004e92']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView edges={['top', 'left', 'right']}>
          <View style={styles.headerContent}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <MaterialIcons name="arrow-back" size={24} color="#fff" />
            </Pressable>
            <View>
              <Text style={styles.headerTitle}>My Complaints</Text>
              <Text style={styles.headerSubtitle}>Track Status & History</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Tabs */}
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

      <ScrollView
        contentContainerStyle={styles.complaintsList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#004e92']} tintColor="#004e92" />}
      >
        {loading ? (
          <StudentComplaintListSkeleton />
        ) : filteredComplaints.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>
              No {selectedTab} complaints
            </Text>
            <Text style={styles.subEmptyText}>
              {selectedTab === 'active'
                ? "You don't have any open complaints."
                : "No closed or resolved complaints found."}
            </Text>
          </View>
        ) : (
          filteredComplaints.map((complaint) => (
            <View
              key={complaint.id}
              style={styles.complaintCard}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.complaintTitle}>{complaint.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(complaint.status) + '20' }]}>
                  <MaterialCommunityIcons name={getStatusIcon(complaint.status)} size={14} color={getStatusColor(complaint.status)} />
                  <Text style={[styles.statusText, { color: getStatusColor(complaint.status) }]}>
                    {complaint.status?.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.description}>
                {complaint.description}
              </Text>

              <View style={styles.divider} />

              <View style={styles.cardFooter}>
                <View style={styles.footerRow}>
                  <MaterialCommunityIcons name="calendar-clock" size={14} color="#94A3B8" />
                  <Text style={styles.date}>
                    {formatDate(complaint.createdAt)}
                  </Text>
                </View>

                <View style={[
                  styles.priorityBadge,
                  { borderColor: getPriorityColor(complaint.priority) }
                ]}>
                  <Text style={[
                    styles.priorityText,
                    { color: getPriorityColor(complaint.priority) }
                  ]}>
                    {complaint.priority?.toUpperCase()} PRIORITY
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* FAB to Add New */}
      <Pressable
        style={styles.fab}
        onPress={() => router.push('/new-complaint')}
      >
        <LinearGradient
          colors={['#000428', '#004e92']}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialIcons name="add" size={32} color="#fff" />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: "#004e92",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  headerContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeTab: {
    backgroundColor: '#004e92',
    borderColor: '#004e92',
  },
  tabText: {
    fontWeight: '600',
    color: '#64748B',
    fontSize: 13,
  },
  activeTabText: {
    color: 'white',
  },
  complaintsList: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 80,
  },
  complaintCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
  },
  complaintTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    lineHeight: 22,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  description: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  date: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#1E293B',
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  subEmptyText: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 200,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#004e92',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  fabGradient: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
});