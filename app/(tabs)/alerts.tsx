import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../utils/ThemeContext';
import { personalizedAlerts, paymentReminders, hostelDocuments, AlertType } from '../../utils/alertsUtils';

export default function Alerts() {
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<'alerts' | 'payments' | 'documents'>('alerts');

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getAlertIcon = (type: AlertType | string) => {
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

  const getPriorityColor = (priority?: string) => {
    const priorityColors: Record<string, string> = {
      low: '#4CAF50',
      medium: '#FF8C00',
      high: '#f44336',
    };
    return priorityColors[priority || 'low'] || '#FF8C00';
  };

  const getDocumentIcon = (category: string) => {
    const icons: Record<string, string> = {
      rules: 'file-document-outline',
      policies: 'file-certificate-outline',
      forms: 'file-edit-outline',
      other: 'file-outline',
    };
    return icons[category] || 'file-outline';
  };

  const getPaymentStatus = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      pending: { color: '#FF8C00', text: 'Pending' },
      overdue: { color: '#f44336', text: 'Overdue' },
      paid: { color: '#4CAF50', text: 'Paid' },
    };
    return statusConfig[status] || statusConfig.pending;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
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
          {(['alerts', 'payments', 'documents'] as const).map((tab) => (
            <Pressable
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && styles.activeTab,
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab && { color: '#FF8C00' }
              ]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#FF8C00']}
              tintColor="#FF8C00"
            />
          }
        >
          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Personalized Alerts</Text>
              {personalizedAlerts.map((alert) => (
                <Pressable
                  key={alert.id}
                  style={[styles.alertCard, { backgroundColor: colors.cardBackground }]}
                >
                  <View style={[
                    styles.priorityIndicator,
                    { backgroundColor: getPriorityColor(alert.priority) }
                  ]} />
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

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Reminders</Text>
              {paymentReminders.map((reminder) => {
                const status = getPaymentStatus(reminder.status);
                return (
                  <Pressable
                    key={reminder.id}
                    style={[styles.paymentCard, { backgroundColor: colors.cardBackground }]}
                  >
                    <View style={styles.paymentLeft}>
                      <View style={[styles.paymentIconBox, { backgroundColor: '#FFF3E0' }]}>
                        <MaterialCommunityIcons name="credit-card" size={24} color="#FF8C00" />
                      </View>
                      <View style={styles.paymentInfo}>
                        <Text style={[styles.paymentTitle, { color: colors.text }]}>
                          {reminder.title}
                        </Text>
                        <Text style={[styles.paymentDescription, { color: colors.secondary }]}>
                          {reminder.description}
                        </Text>
                        <Text style={[styles.dueDate, { color: colors.icon }]}>
                          Due: {reminder.dueDate.toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.paymentRight}>
                      <Text style={styles.amount}>₹{reminder.amount}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
                        <Text style={[styles.statusText, { color: status.color }]}>
                          {status.text}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Important Documents</Text>
              {hostelDocuments.map((doc) => (
                <Pressable
                  key={doc.id}
                  style={[styles.documentCard, { backgroundColor: colors.cardBackground }]}
                >
                  <View style={[styles.docIconBox, { backgroundColor: '#E3F2FD' }]}>
                    <MaterialCommunityIcons
                      name={getDocumentIcon(doc.category)}
                      size={24}
                      color="#2196F3"
                    />
                  </View>
                  <View style={styles.documentInfo}>
                    <Text style={[styles.documentName, { color: colors.text }]}>
                      {doc.name}
                    </Text>
                    <Text style={[styles.documentCategory, { color: colors.secondary }]}>
                      {doc.category.charAt(0).toUpperCase() + doc.category.slice(1)}
                    </Text>
                    <View style={styles.docMetadata}>
                      <Text style={[styles.uploadDate, { color: colors.icon }]}>
                        {doc.uploadDate.toLocaleDateString()}
                      </Text>
                      <Text style={[styles.fileSize, { color: colors.icon }]}>
                        {doc.fileSize}
                      </Text>
                    </View>
                  </View>
                  <MaterialCommunityIcons name="download" size={24} color="#2196F3" />
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
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
  paymentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIconBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  paymentDescription: {
    fontSize: 12,
    marginBottom: 4,
  },
  dueDate: {
    fontSize: 11,
  },
  paymentRight: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FF8C00',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  documentCard: {
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
  docIconBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  documentCategory: {
    fontSize: 12,
    marginBottom: 4,
  },
  docMetadata: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadDate: {
    fontSize: 11,
  },
  fileSize: {
    fontSize: 11,
  },
});