import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, FlatList, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAlert } from '../../context/AlertContext';
import { useTheme } from '../../utils/ThemeContext';
import { isAdmin, useUser } from '../../utils/authUtils';
import { getAllLeaves, LeaveRequest, updateLeaveStatus } from '../../utils/leavesUtils';

export default function LeaveRequestsPage() {
  const { colors, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useUser();
  const router = useRouter();
  const { showAlert } = useAlert();
  const { openId } = useLocalSearchParams();

  const styles = React.useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      paddingBottom: 20,
      minHeight: '100%',
    },
    header: {
      paddingVertical: 24,
      paddingHorizontal: 24,
      marginBottom: 24,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: colors.primary,
      shadowOpacity: 0.25,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 12,
      elevation: 8,
    },
    headerContent: {
      flex: 1,
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: '#fff',
      letterSpacing: 0.5,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    statsContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      marginBottom: 24,
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 16,
      alignItems: 'center',
      shadowColor: colors.textSecondary,
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 16,
      elevation: 3,
    },
    statValue: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
      marginTop: 8,
    },
    statLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
      marginTop: 2,
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    requestCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      marginBottom: 16,
      overflow: 'hidden',
      shadowColor: colors.textSecondary,
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 16,
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.border,
    },
    requestCardActive: {
      borderColor: colors.primary,
      borderWidth: 1.5,
      shadowColor: colors.primary,
      shadowOpacity: 0.15,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 18,
    },
    studentInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 14,
    },
    studentAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    studentInitial: {
      color: '#fff',
      fontSize: 20,
      fontWeight: '700',
    },
    textInfo: {
      flex: 1,
    },
    studentName: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    dateRange: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
      fontWeight: '500',
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 12,
    },
    statusText: {
      color: '#fff',
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    expandedContent: {
      backgroundColor: theme === 'dark' ? colors.background : '#F8FAFC',
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    detailLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    detailValue: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    actionBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 12,
      gap: 8,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      elevation: 2,
    },
    approveBtn: {
      backgroundColor: '#10B981',
    },
    rejectBtn: {
      backgroundColor: '#EF4444',
    },
    actionBtnText: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '700',
    },
    statusMessage: {
      backgroundColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginTop: 12,
      borderWidth: 1,
      borderColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.3)' : '#D1FAE5',
    },
    statusMessageText: {
      color: theme === 'dark' ? '#34D399' : '#047857',
      fontSize: 13,
      textAlign: 'center',
      fontWeight: '600',
    },
    filterContainer: {
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    filterScroll: {
      flexDirection: 'row',
    },
    filterBtn: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: colors.card,
      marginRight: 10,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.textSecondary,
      shadowOpacity: 0.05,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      elevation: 2,
    },
    filterBtnActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterBtnText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    filterBtnTextActive: {
      color: '#fff',
      fontWeight: '700',
    },
  }), [colors, theme]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  // Ref to store Swipeable instances
  const swipeableRefs = useRef(new Map<string, Swipeable>());

  useEffect(() => {
    loadRequests();
  }, []);

  // Auto-expand if openId is provided
  useEffect(() => {
    if (openId && requests.length > 0) {
      if (requests.some(l => l.id === openId)) {
        setSelectedId(openId as string);
      }
    }
  }, [openId, requests]);

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

  const closeSwipeable = (id: string) => {
    const ref = swipeableRefs.current.get(id);
    if (ref) {
      ref.close();
    }
  };



  const handleUpdateStatus = (id: string, status: 'approved' | 'rejected') => {
    showAlert(
      'Confirm Action',
      `Mark leave request as ${status}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => closeSwipeable(id),
        },
        {
          text: "Confirm",
          style: status === 'rejected' ? "destructive" : "default",
          onPress: async () => {
            try {
              await updateLeaveStatus(id, status);
              loadRequests();
              showAlert("Success", `Request ${status} successfully.`, [], 'success');
            } catch (error) {
              console.error(error);
              showAlert("Error", "Failed to update status.", [], 'error');
            } finally {
              closeSwipeable(id);
            }
          },
        },
      ]
    );
  };

  if (!isAdmin(user))
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Access denied.</Text>
      </View>
    );

  const filteredRequests = filterStatus
    ? requests.filter((l) => l.status === filterStatus)
    : requests;

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

  const renderLeftActions = (progress: any, dragX: any, item: LeaveRequest) => {
    if (item.status !== 'pending') return null;
    const trans = dragX.interpolate({
      inputRange: [0, 50, 100],
      outputRange: [-20, 0, 0],
    });
    return (
      <View style={{ width: 80, marginBottom: 16 }}>
        <Animated.View style={{ flex: 1, transform: [{ translateX: trans }] }}>
          <View
            style={[styles.actionBtn, styles.approveBtn, { borderRadius: 20, height: '100%', justifyContent: 'center' }]}
          >
            <MaterialIcons name="check" size={28} color="#fff" />
          </View>
        </Animated.View>
      </View>
    );
  };

  const renderRightActions = (progress: any, dragX: any, item: LeaveRequest) => {
    if (item.status !== 'pending') return null;
    const trans = dragX.interpolate({
      inputRange: [-100, -50, 0],
      outputRange: [0, 0, 20],
    });
    return (
      <View style={{ width: 80, marginBottom: 16 }}>
        <Animated.View style={{ flex: 1, transform: [{ translateX: trans }] }}>
          <View
            style={[styles.actionBtn, styles.rejectBtn, { borderRadius: 20, height: '100%', justifyContent: 'center' }]}
          >
            <MaterialIcons name="close" size={28} color="#fff" />
          </View>
        </Animated.View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['left', 'right', 'bottom']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
      >
        <LinearGradient colors={['#000428', '#004e92']} style={[styles.header, { paddingTop: 24 + insets.top }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="chevron-left" size={32} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Leave Requests</Text>
          </View>

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

        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <TouchableOpacity
              style={[styles.filterBtn, !filterStatus && styles.filterBtnActive]}
              onPress={() => setFilterStatus(null)}
            >
              <Text style={[styles.filterBtnText, !filterStatus && styles.filterBtnTextActive]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterBtn, filterStatus === 'pending' && styles.filterBtnActive]}
              onPress={() => setFilterStatus('pending')}
            >
              <Text style={[styles.filterBtnText, filterStatus === 'pending' && styles.filterBtnTextActive]}>Pending</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterBtn, filterStatus === 'approved' && styles.filterBtnActive]}
              onPress={() => setFilterStatus('approved')}
            >
              <Text style={[styles.filterBtnText, filterStatus === 'approved' && styles.filterBtnTextActive]}>Approved</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterBtn, filterStatus === 'rejected' && styles.filterBtnActive]}
              onPress={() => setFilterStatus('rejected')}
            >
              <Text style={[styles.filterBtnText, filterStatus === 'rejected' && styles.filterBtnTextActive]}>Rejected</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {(!filterStatus || filterStatus === 'pending') && (
          <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
            <Text style={{ fontSize: 13, color: '#64748B', fontStyle: 'italic', textAlign: 'center' }}>
              Swipe Right <MaterialIcons name="arrow-right" size={14} /> to Approve, Swipe Left <MaterialIcons name="arrow-left" size={14} /> to Reject
            </Text>
          </View>
        )}

        <FlatList
          data={filteredRequests}
          scrollEnabled={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Swipeable
              ref={(ref) => {
                if (ref) {
                  swipeableRefs.current.set(item.id, ref);
                } else {
                  swipeableRefs.current.delete(item.id);
                }
              }}
              renderLeftActions={(p, d) => renderLeftActions(p, d, item)}
              renderRightActions={(p, d) => renderRightActions(p, d, item)}
              onSwipeableLeftOpen={() => handleUpdateStatus(item.id, 'approved')}
              onSwipeableRightOpen={() => handleUpdateStatus(item.id, 'rejected')}
              enabled={item.status === 'pending'}
            >
              <TouchableOpacity
                style={[
                  styles.requestCard,
                  selectedId === item.id && styles.requestCardActive,
                ]}
                activeOpacity={1}
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
                          onPress={() => handleUpdateStatus(item.id, 'approved')}
                        >
                          <MaterialIcons name="check" size={16} color="#fff" />
                          <Text style={styles.actionBtnText}>Approve</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.rejectBtn]}
                          onPress={() => handleUpdateStatus(item.id, 'rejected')}
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
            </Swipeable>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', padding: 40 }}>
              <Image
                source={require('../../assets/images/empty-leaves.png')}
                style={{ width: 200, height: 200, resizeMode: 'contain', marginBottom: 16 }}
              />
              <Text style={{ color: '#94A3B8', fontSize: 16, fontWeight: '600' }}>No pending leaves</Text>
            </View>
          }
        />
      </ScrollView>


    </SafeAreaView>
  );
}


