import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAlert } from '../context/AlertContext';
import { useTheme } from '../utils/ThemeContext';
import { roomServices } from '../utils/busTimingsUtils';
import { fetchUserData } from '../utils/nameUtils';
import { requestService, ServiceRequest, subscribeToStudentRequests } from '../utils/serviceUtils';

export default function RoomService() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { showAlert } = useAlert();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    const unsubscribe = subscribeToStudentRequests((data) => {
      setRequests(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleServiceRequest = async (serviceName: string) => {
    showAlert(
      'Request Service',
      `Request ${serviceName}?`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => { } },
        {
          text: 'Request',
          onPress: async () => {
            try {
              setSubmitting(true);
              const userData = await fetchUserData();
              if (!userData) {
                showAlert("Error", "Could not fetch user profile.", [], 'error');
                return;
              }
              await requestService(serviceName, '', userData.fullName, userData.roomNo);
              showAlert('Success', `Your request for ${serviceName} has been submitted!`, [], 'success');
            } catch (error) {
              showAlert('Error', "Failed to submit request.", [], 'error');
            } finally {
              setSubmitting(false);
            }
          },
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'approved': return '#3B82F6';
      case 'completed': return '#10B981';
      case 'rejected': return '#EF4444';
      default: return '#999';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
              <Text style={styles.headerTitle}>Room Services</Text>
              <Text style={styles.headerSubtitle}>Housekeeping & Maintenance</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#004e92']} tintColor="#004e92" />}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>AVAILABLE SERVICES</Text>

        {submitting && <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: 20 }} />}

        <View style={styles.servicesGrid}>
          {roomServices.map((service) => (
            <Pressable
              key={service.id}
              style={[
                styles.serviceCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                !service.available && [styles.serviceCardDisabled, { backgroundColor: isDark ? '#1e293b' : '#F8FAFC', borderColor: isDark ? '#334155' : '#E2E8F0' }]
              ]}
              onPress={() => service.available && handleServiceRequest(service.name)}
              disabled={!service.available || submitting}
            >
              <LinearGradient
                colors={
                  service.available
                    ? (isDark ? ['#1e3a8a', '#172554'] : ['#e0f2fe', '#dbeafe'])
                    : (isDark ? ['#334155', '#1e293b'] : ['#f1f5f9', '#e2e8f0'])
                }
                style={[styles.iconBox]}
              >
                <MaterialCommunityIcons
                  name={service.icon as any}
                  size={32}
                  color={service.available ? (isDark ? '#60A5FA' : '#004e92') : (isDark ? '#64748B' : '#94A3B8')}
                />
              </LinearGradient>

              <View style={styles.cardContent}>
                <Text style={[
                  styles.serviceName,
                  { color: colors.text },
                  !service.available && [styles.serviceNameDisabled, { color: colors.textSecondary }]
                ]}>
                  {service.name}
                </Text>

                <Text style={[styles.serviceDescription, { color: colors.textSecondary }]}>
                  {service.description}
                </Text>

                {!service.available && (
                  <View style={[styles.unavailableBadge, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}>
                    <Text style={[styles.unavailableText, { color: colors.textSecondary }]}>Coming Soon</Text>
                  </View>
                )}
              </View>

              {service.available && (
                <View style={[styles.actionBtn, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#f0f9ff' }]}>
                  <MaterialIcons
                    name="arrow-forward"
                    size={20}
                    color={colors.primary}
                  />
                </View>
              )}
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>MY REQUESTS</Text>
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : requests.length === 0 ? (
          <Text style={{ textAlign: 'center', color: colors.textSecondary, marginBottom: 20 }}>No active requests</Text>
        ) : (
          <View style={styles.historyList}>
            {requests.map(req => (
              <View key={req.id} style={[styles.historyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.historyHeader}>
                  <Text style={[styles.historyTitle, { color: colors.text }]}>{req.serviceType}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(req.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(req.status) }]}>{req.status.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={[styles.historyDate, { color: colors.textSecondary }]}>{req.createdAt instanceof Date ? req.createdAt.toLocaleDateString() : ''}</Text>
                {req.estimatedTime && (
                  <Text style={[styles.etaText, { color: colors.primary }]}>ETA: {req.estimatedTime}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={[styles.infoCard, {
          backgroundColor: isDark ? '#172554' : '#EFF6FF',
          borderColor: isDark ? '#1e40af' : '#DBEAFE'
        }]}>
          <View style={[styles.infoIconBox, { backgroundColor: isDark ? '#1e40af' : '#3B82F6' }]}>
            <MaterialCommunityIcons name="phone-in-talk" size={20} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.infoTitle, { color: isDark ? '#93c5fd' : '#1E3A8A' }]}>Urgent Assistance</Text>
            <Text style={[styles.infoText, { color: isDark ? '#bfdbfe' : '#1E40AF' }]}>
              For emergencies, call hostel office directly at +91 98765 43210
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 16,
    marginTop: 8,
    letterSpacing: 1,
  },
  servicesGrid: {
    gap: 16,
    marginBottom: 24,
  },
  serviceCard: {
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  serviceCardDisabled: {
    opacity: 0.8,
    shadowOpacity: 0,
    elevation: 0,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBoxDisabled: {
    backgroundColor: '#E2E8F0',
  },
  cardContent: {
    flex: 1,
  },
  serviceName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  serviceNameDisabled: {
    color: '#64748B',
  },
  serviceDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  unavailableBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  unavailableText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginTop: 20,
  },
  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 2,
  },
  infoText: {
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 18,
  },
  historyList: {
    gap: 12,
  },
  historyCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyTitle: {
    fontWeight: '600',
    color: '#1E293B',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  historyDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  etaText: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '500',
    color: '#004e92',
  }
});