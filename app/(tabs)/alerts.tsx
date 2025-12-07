import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../utils/ThemeContext';
import { personalizedAlerts } from '../../utils/alertsUtils';
import { Complaint, subscribeToStudentComplaints } from '../../utils/complaintsSyncUtils';
import { Notice, subscribeToNotices } from '../../utils/noticesSyncUtils';

export default function Alerts() {
  const [activeTab, setActiveTab] = useState<'alerts' | 'complaints' | 'documents'>('alerts');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [complaintsLoading, setComplaintsLoading] = useState(true);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [noticesLoading, setNoticesLoading] = useState(true);
  const { colors } = useTheme();

  useFocusEffect(
    useCallback(() => {
      setComplaintsLoading(true);
      const unsubscribe = subscribeToStudentComplaints((data) => {
        setComplaints(data);
        setComplaintsLoading(false);
      });

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      setNoticesLoading(true);
      const unsubscribe = subscribeToNotices((data) => {
        setNotices(data);
        setNoticesLoading(false);
      });

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }, [])
  );

  const getPriorityColor = (priority?: string) => {
    const priorityColors: Record<string, string> = {
      low: '#10B981',      // Green
      medium: '#F59E0B',   // Yellow/Orange
      high: '#EF4444',     // Red
      emergency: '#7F1D1D', // Dark Red
    };
    return priorityColors[priority || 'low'] || '#3B82F6';
  };

  const getAlertIcon = (type: string) => {
    const icons: Record<string, string> = {
      mess: 'food-fork-drink',
      laundry: 'washing-machine',
      payment: 'credit-card',
      maintenance: 'wrench',
      event: 'calendar-event',
      announcement: 'bullhorn',
    };
    return icons[type] || 'bell-ring';
  };

  const getStatusIcon = (status: string): any => {
    const icons: Record<string, string> = {
      open: 'clock-outline',
      inProgress: 'progress-wrench',
      resolved: 'check-circle-outline',
      closed: 'close-circle-outline',
    };
    return icons[status] || 'help-circle-outline';
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <View style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
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
            <Text style={styles.headerTitle}>Notifications</Text>
            <View style={styles.notificationBadge}>
              <MaterialIcons name="notifications-none" size={24} color="#fff" />
              {(notices.length > 0) && <View style={styles.dot} />}
            </View>
          </View>

          {/* Custom Tab Bar */}
          <View style={styles.tabBar}>
            {(['alerts', 'complaints', 'documents'] as const).map((tab) => (
              <Pressable
                key={tab}
                style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <View style={styles.section}>

            {/* Hostel Notices Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Hostel Notices</Text>
              {notices.length > 0 && <View style={styles.countBadge}><Text style={styles.countText}>{notices.length}</Text></View>}
            </View>

            {noticesLoading ? (
              <ActivityIndicator size="large" color="#004e92" style={{ marginTop: 20 }} />
            ) : notices.length > 0 ? (
              notices.map((notice) => (
                <View
                  key={notice.id}
                  style={[styles.card, styles.shadowProp]}
                >
                  <View style={[styles.priorityLine, { backgroundColor: getPriorityColor(notice.priority) }]} />
                  <View style={styles.cardInner}>
                    <View style={styles.cardHeaderRow}>
                      <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
                        <MaterialCommunityIcons name="bullhorn" size={20} color="#004e92" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>{notice.title}</Text>
                        <Text style={styles.cardDate}>{notice.date.toLocaleDateString()}</Text>
                      </View>
                      {notice.priority === 'emergency' && <MaterialIcons name="warning" size={20} color="#EF4444" />}
                    </View>
                    <Text style={styles.cardBody}>{notice.body}</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="bell-sleep" size={48} color="#CBD5E1" />
                <Text style={styles.emptyText}>No new notices</Text>
              </View>
            )}

            {/* Personal Alerts Section */}
            <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 12 }]}>Personal Alerts</Text>
            {personalizedAlerts.map((alert) => (
              <Pressable
                key={alert.id}
                style={[styles.card, styles.shadowProp]}
              >
                <View style={[styles.priorityLine, { backgroundColor: getPriorityColor(alert.priority) }]} />
                <View style={styles.cardInner}>
                  <View style={styles.cardHeaderRow}>
                    <View style={[styles.iconBox, { backgroundColor: '#F0F9FF' }]}>
                      <MaterialCommunityIcons name={getAlertIcon(alert.type) as any} size={20} color="#0EA5E9" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{alert.title}</Text>
                      <Text style={styles.cardDate}>{alert.time}</Text>
                    </View>
                    {alert.actionable && <MaterialIcons name="chevron-right" size={24} color="#94A3B8" />}
                  </View>
                  <Text style={styles.cardBody}>{alert.message}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* Complaints Tab */}
        {activeTab === 'complaints' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Complaints</Text>
            {complaintsLoading ? (
              <ActivityIndicator size="large" color="#004e92" style={{ marginTop: 20 }} />
            ) : complaints.length > 0 ? (
              complaints.map((complaint) => (
                <View
                  key={complaint.id}
                  style={[styles.card, styles.shadowProp]}
                >
                  <View style={styles.cardInner}>
                    <View style={styles.cardHeaderRow}>
                      <Text style={styles.cardTitle}>{complaint.title}</Text>
                      <View style={[styles.statusTag, { backgroundColor: getPriorityColor(complaint.priority) + '20' }]}>
                        <Text style={[styles.statusTagText, { color: getPriorityColor(complaint.priority) }]}>
                          {complaint.priority?.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    <Text style={[styles.cardBody, { marginTop: 8 }]}>{complaint.description}</Text>

                    <View style={styles.divider} />

                    <View style={styles.cardFooter}>
                      <View style={styles.statusRow}>
                        <MaterialCommunityIcons
                          name={getStatusIcon(complaint.status)}
                          size={16}
                          color={complaint.status === 'resolved' ? '#10B981' : '#64748B'}
                        />
                        <Text style={[
                          styles.statusText,
                          complaint.status === 'resolved' && { color: '#10B981', fontWeight: '600' }
                        ]}>
                          {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                        </Text>
                      </View>
                      <Text style={styles.cardDate}>{formatDate(complaint.createdAt)}</Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="clipboard-check-outline" size={48} color="#CBD5E1" />
                <Text style={styles.emptyText}>No complaints history</Text>
              </View>
            )}
          </View>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Documents</Text>
            <View style={[styles.card, styles.shadowProp, styles.emptyState, { height: 200 }]}>
              <MaterialCommunityIcons name="file-document-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>No documents available</Text>
              <Text style={styles.subEmptyText}>Hostel circulars and forms will appear here.</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#004e92",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  notificationBadge: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    position: 'absolute',
    top: 10,
    right: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 4,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabItemActive: {
    backgroundColor: '#fff',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  tabTextActive: {
    color: '#004e92',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  countBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardInner: {
    padding: 16,
  },
  priorityLine: {
    width: 4,
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
    flex: 1,
  },
  cardDate: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  cardBody: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  shadowProp: {
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 12,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  subEmptyText: {
    color: '#CBD5E1',
    fontSize: 12,
    textAlign: 'center',
  },
});