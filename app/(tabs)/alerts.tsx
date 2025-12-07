import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Stack, useFocusEffect } from 'expo-router';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../utils/ThemeContext';
import { subscribeToStudentComplaints, Complaint } from '../../utils/complaintsSyncUtils';
import { subscribeToNotices, Notice } from '../../utils/noticesSyncUtils';
import { personalizedAlerts } from '../../utils/alertsUtils';

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
      low: '#4CAF50',
      medium: '#FF8C00',
      high: '#f44336',
      emergency: '#d32f2f',
    };
    return priorityColors[priority || 'low'] || '#FF8C00';
  };

  const getAlertIcon = (type: string) => {
    const icons: Record<string, string> = {
      mess: 'food-fork-drink',
      laundry: 'washing-machine',
      payment: 'credit-card',
      maintenance: 'wrench',
      event: 'calendar-event',
      announcement: 'megaphone',
    };
    return icons[type] || 'bell';
  };

  const getStatusIcon = (status: string): any => {
    const icons: Record<string, string> = {
      open: 'fiber-new',
      inProgress: 'pending-actions',
      resolved: 'check-circle',
      closed: 'cancel',
    };
    return icons[status] || 'help-circle';
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen
        options={{
          title: 'Alerts & Notifications',
          headerStyle: { backgroundColor: '#FF8C00' },
          headerTintColor: '#fff',
          headerShadowVisible: false,
        }}
      />

      {/* Tab Navigation */}
      <View style={[styles.tabContainer, { backgroundColor: colors.cardBackground }]}>
        {(['alerts', 'complaints', 'documents'] as const).map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && { color: '#FF8C00' },
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView style={[styles.content, { backgroundColor: colors.background }]}>
        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Hostel Notices</Text>
            {noticesLoading ? (
              <ActivityIndicator size="large" color="#FF8C00" />
            ) : notices.length > 0 ? (
              notices.map((notice) => (
                <Pressable
                  key={notice.id}
                  style={[styles.alertCard, { backgroundColor: colors.cardBackground }]}
                >
                  <View
                    style={[
                      styles.priorityIndicator,
                      { backgroundColor: getPriorityColor(notice.priority) },
                    ]}
                  />
                  <MaterialCommunityIcons
                    name="bullhorn"
                    size={28}
                    color="#FF8C00"
                    style={styles.alertIcon}
                  />
                  <View style={styles.alertContent}>
                    <Text style={[styles.alertTitle, { color: colors.text }]}>
                      {notice.title}
                    </Text>
                    <Text style={[styles.alertMessage, { color: colors.secondary }]}>
                      {notice.body}
                    </Text>
                    <Text style={[styles.alertTime, { color: colors.icon }]}>
                      {notice.date.toLocaleDateString()}
                    </Text>
                  </View>
                </Pressable>
              ))
            ) : (
              <Text style={[styles.emptyText, { color: colors.secondary }]}>No notices</Text>
            )}

            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>Personal Alerts</Text>
            {personalizedAlerts.map((alert) => (
              <Pressable
                key={alert.id}
                style={[styles.alertCard, { backgroundColor: colors.cardBackground }]}
              >
                <View
                  style={[
                    styles.priorityIndicator,
                    { backgroundColor: getPriorityColor(alert.priority) },
                  ]}
                />
                <MaterialCommunityIcons
                  name={getAlertIcon(alert.type)}
                  size={28}
                  color="#FF8C00"
                  style={styles.alertIcon}
                />
                <View style={styles.alertContent}>
                  <Text style={[styles.alertTitle, { color: colors.text }]}>
                    {alert.title}
                  </Text>
                  <Text style={[styles.alertMessage, { color: colors.secondary }]}>
                    {alert.message}
                  </Text>
                  <Text style={[styles.alertTime, { color: colors.icon }]}>
                    {alert.time}
                  </Text>
                </View>
                {alert.actionable && (
                  <MaterialIcons name="arrow-forward" size={20} color="#FF8C00" />
                )}
              </Pressable>
            ))}
          </View>
        )}

        {/* Complaints Tab */}
        {activeTab === 'complaints' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>My Complaints</Text>
            {complaintsLoading ? (
              <ActivityIndicator size="large" color="#FF8C00" />
            ) : complaints.length > 0 ? (
              complaints.map((complaint) => (
                <Pressable
                  key={complaint.id}
                  style={[styles.complaintCard, styles.shadowProp, { backgroundColor: colors.cardBackground }]}
                >
                  <View style={styles.cardHeader}>
                    <Text style={[styles.complaintTitle, { color: colors.text }]}>
                      {complaint.title}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getPriorityColor(complaint.priority) },
                      ]}
                    >
                      <MaterialIcons
                        name={getStatusIcon(complaint.status)}
                        size={14}
                        color="white"
                      />
                      <Text style={styles.statusText}>
                        {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.description, { color: colors.secondary }]} numberOfLines={2}>
                    {complaint.description}
                  </Text>

                  <View style={styles.cardFooter}>
                    <Text style={[styles.date, { color: colors.icon }]}>
                      {formatDate(complaint.createdAt)}
                    </Text>
                  </View>
                </Pressable>
              ))
            ) : (
              <Text style={[styles.emptyText, { color: colors.secondary }]}>
                No complaints submitted yet
              </Text>
            )}
          </View>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Important Documents</Text>
            <Text style={[styles.emptyText, { color: colors.secondary }]}>
              Documents feature coming soon
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#FF8C00',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#999',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 12,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  priorityIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 4,
    marginRight: 12,
    position: 'absolute',
    left: 0,
  },
  alertIcon: {
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
    marginLeft: 8,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  alertMessage: {
    fontSize: 13,
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 12,
  },
  complaintCard: {
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
    fontWeight: '600' as const,
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
    fontWeight: '500' as const,
  },
  description: {
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
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
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
});