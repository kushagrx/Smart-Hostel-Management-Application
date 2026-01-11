import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, FlatList, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AdminComplaintListSkeleton } from '../../components/SkeletonLists';
import { useAlert } from '../../context/AlertContext';
import { useTheme } from '../../utils/ThemeContext';
import { isAdmin, useUser } from '../../utils/authUtils';
import { Complaint, getAllComplaints, updateComplaintStatus } from '../../utils/complaintsSyncUtils';

export default function ComplaintsPage() {
  const { colors, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useUser();

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
    statsGrid: {
      paddingHorizontal: 20,
      marginBottom: 24,
      gap: 12,
    },
    statsRow: {
      flexDirection: 'row',
      gap: 12,
    },
    heroCard: {
      borderRadius: 24,
      padding: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: '#EF4444',
      shadowOpacity: 0.25,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
      overflow: 'hidden',
      height: 100,
    },
    miniCard: {
      flex: 1,
      borderRadius: 20,
      padding: 16,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
      overflow: 'hidden',
      height: 110,
      justifyContent: 'space-between',
    },
    cardWatermark: {
      position: 'absolute',
      right: -10,
      bottom: -10,
      opacity: 0.15,
      transform: [{ rotate: '-15deg' }, { scale: 1.5 }],
    },
    heroLabel: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 4,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    heroValue: {
      color: '#fff',
      fontSize: 36,
      fontWeight: '800',
      letterSpacing: -1,
    },
    miniLabel: {
      color: 'rgba(255,255,255,0.9)',
      fontSize: 12,
      fontWeight: '700',
      opacity: 0.9,
    },
    miniValue: {
      color: '#fff',
      fontSize: 28,
      fontWeight: '800',
      marginTop: 4,
    },
    miniHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 8,
    },
    filterContainer: {
      paddingHorizontal: 20,
      marginBottom: 24,
    },
    filterScroll: {
      flexDirection: 'row',
    },
    filterBtn: {
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 24,
      backgroundColor: colors.card,
      marginRight: 10,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.textSecondary,
      shadowOpacity: 0.05,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
    filterBtnActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      shadowColor: colors.primary,
      shadowOpacity: 0.2,
      elevation: 3,
    },
    filterBtnText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    filterBtnTextActive: {
      color: '#fff',
    },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    complaintCard: {
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
    complaintCardActive: {
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
      marginBottom: 4,
    },
    complaintPreview: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
      gap: 6,
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
      alignItems: 'center',
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
    priorityBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 12,
    },
    badgeText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    complaintText: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    complaintTextLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
    },
    complaintTextContent: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 22,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 10,
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
    progressBtn: {
      backgroundColor: '#F59E0B',
    },
    resolveBtn: {
      backgroundColor: '#10B981',
    },
    closeBtn: {
      backgroundColor: '#64748B',
    },
    actionBtnText: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '700',
    },
    resolvedMessage: {
      backgroundColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginTop: 12,
      borderWidth: 1,
      borderColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.3)' : '#D1FAE5',
    },
    resolvedMessageText: {
      color: theme === 'dark' ? '#34D399' : '#047857',
      fontSize: 13,
      fontWeight: '600',
    },
  }), [colors, theme]);
  const router = useRouter();
  const { showAlert } = useAlert();
  const { openId } = useLocalSearchParams();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadComplaints();
    setRefreshing(false);
  };

  // Ref to store Swipeable instances
  const swipeableRefs = useRef(new Map<string, Swipeable>());

  useEffect(() => {
    loadComplaints();
  }, []);

  // Auto-expand if openId is provided
  useEffect(() => {
    if (openId && complaints.length > 0) {
      if (complaints.some(c => c.id === openId)) {
        setSelectedId(openId as string);
      }
    }
  }, [openId, complaints]);

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

  const closeSwipeable = (id: string) => {
    const ref = swipeableRefs.current.get(id);
    if (ref) {
      ref.close();
    }
  };

  const handleUpdateStatus = (id: string, status: 'inProgress' | 'resolved' | 'closed') => {
    // If it's just 'inProgress', maybe don't show a full confirmation if not needed, 
    // or just show it for consistency. Let's show it for all major state changes.
    const actionText = status === 'resolved' ? 'resolve' : status === 'closed' ? 'close' : 'start working on';

    showAlert(
      'Confirm Action',
      `Are you sure you want to ${actionText} this complaint?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => closeSwipeable(id),
        },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await updateComplaintStatus(id, status);
              loadComplaints();
              showAlert("Success", `Complaint marked as ${status}.`, [], 'success');
            } catch (error) {
              console.error(error);
              showAlert("Error", "Failed to update status.", [], 'error');
            } finally {
              closeSwipeable(id);
            }
          },
        },
      ],
      'warning'
    );
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

  const renderLeftActions = (progress: any, dragX: any, item: Complaint) => {
    if (item.status === 'resolved' || item.status === 'closed') return null;
    const trans = dragX.interpolate({
      inputRange: [0, 50, 100],
      outputRange: [-20, 0, 0],
    });
    return (
      <View style={{ width: 80, marginBottom: 16 }}>
        <Animated.View style={{ flex: 1, transform: [{ translateX: trans }] }}>
          <View
            style={[styles.actionBtn, styles.resolveBtn, { borderRadius: 20, height: '100%', justifyContent: 'center' }]}
          >
            <MaterialIcons name="check" size={24} color="#fff" />
          </View>
        </Animated.View>
      </View>
    );
  };

  const renderRightActions = (progress: any, dragX: any, item: Complaint) => {
    if (item.status === 'resolved' || item.status === 'closed') return null;
    const trans = dragX.interpolate({
      inputRange: [-100, -50, 0],
      outputRange: [0, 0, 20],
    });
    return (
      <View style={{ width: 80, marginBottom: 16 }}>
        <Animated.View style={{ flex: 1, transform: [{ translateX: trans }] }}>
          <View
            style={[styles.actionBtn, styles.closeBtn, { borderRadius: 20, height: '100%', justifyContent: 'center' }]}
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
            <Text style={styles.headerTitle}>Manage Complaints</Text>
          </View>

        </LinearGradient>



        <View style={styles.statsGrid}>
          {/* Hero Card: Open Complaints */}
          <LinearGradient
            colors={['#DC2626', '#991B1B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View>
              <Text style={styles.heroLabel}>Open Issues</Text>
              <Text style={styles.heroValue}>{openCount}</Text>
            </View>
            <MaterialIcons name="alert-circle-outline" size={48} color="rgba(255,255,255,0.9)" />
            <View style={styles.cardWatermark}>
              <MaterialIcons name="alert-circle-outline" size={100} color="#fff" />
            </View>
          </LinearGradient>

          <View style={styles.statsRow}>
            {/* In Progress */}
            <LinearGradient
              colors={['#D97706', '#B45309']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.miniCard}
            >
              <View style={styles.miniHeader}>
                <MaterialIcons name="clock-outline" size={18} color="rgba(255,255,255,0.9)" />
                <Text style={styles.miniLabel}>In Progress</Text>
              </View>
              <Text style={styles.miniValue}>{inProgressCount}</Text>
              <View style={styles.cardWatermark}>
                <MaterialIcons name="clock-outline" size={80} color="#fff" />
              </View>
            </LinearGradient>

            {/* Resolved */}
            <LinearGradient
              colors={['#059669', '#064E3B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.miniCard}
            >
              <View style={styles.miniHeader}>
                <MaterialIcons name="check-circle-outline" size={18} color="rgba(255,255,255,0.9)" />
                <Text style={styles.miniLabel}>Resolved</Text>
              </View>
              <Text style={styles.miniValue}>{resolvedCount}</Text>
              <View style={styles.cardWatermark}>
                <MaterialIcons name="check-circle-outline" size={80} color="#fff" />
              </View>
            </LinearGradient>
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

        {(!filterStatus || filterStatus === 'open') && (
          <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
            <Text style={{ fontSize: 13, color: '#64748B', fontStyle: 'italic', textAlign: 'center' }}>
              Swipe Right <MaterialIcons name="arrow-right" size={14} /> to Resolve, Swipe Left <MaterialIcons name="arrow-left" size={14} /> to Deny/Close
            </Text>
          </View>
        )}

        {loading ? (
          <AdminComplaintListSkeleton />
        ) : (
          <FlatList
            data={filteredComplaints}
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
                onSwipeableLeftOpen={() => handleUpdateStatus(item.id, 'resolved')}
                onSwipeableRightOpen={() => handleUpdateStatus(item.id, 'closed')}
                enabled={item.status !== 'resolved' && item.status !== 'closed'}
              >
                <TouchableOpacity
                  style={[
                    styles.complaintCard,
                    selectedId === item.id && styles.complaintCardActive,
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
                      <Text style={styles.statusText}>
                        {item.status === 'inProgress' ? 'In Progress' : item.status}
                      </Text>
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
                              onPress={() => handleUpdateStatus(item.id, 'inProgress')}
                            >
                              <MaterialIcons name="progress-clock" size={16} color="#fff" />
                              <Text style={styles.actionBtnText}>In Progress</Text>
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity
                            style={[styles.actionBtn, styles.resolveBtn]}
                            onPress={() => handleUpdateStatus(item.id, 'resolved')}
                          >
                            <MaterialIcons name="check" size={16} color="#fff" />
                            <Text style={styles.actionBtnText}>Resolve</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.actionBtn, styles.closeBtn]}
                            onPress={() => handleUpdateStatus(item.id, 'closed')}
                          >
                            <MaterialIcons name="close" size={16} color="#fff" />
                            <Text style={styles.actionBtnText}>Deny/Close</Text>
                          </TouchableOpacity>
                        </View>
                      )}

                      {(item.status === 'resolved' || item.status === 'closed') && (
                        <View style={[styles.resolvedMessage, item.status === 'closed' && { backgroundColor: theme === 'dark' ? 'rgba(148, 163, 184, 0.1)' : '#F1F5F9', borderColor: theme === 'dark' ? 'rgba(148, 163, 184, 0.2)' : '#E2E8F0' }]}>
                          <MaterialIcons name={item.status === 'resolved' ? "check-circle" : "close-circle"} size={20} color={item.status === 'resolved' ? "#4CAF50" : "#94A3B8"} />
                          <Text style={[styles.resolvedMessageText, item.status === 'closed' && { color: theme === 'dark' ? '#94A3B8' : '#475569' }]}>
                            This complaint is {item.status}
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
                  source={require('../../assets/images/empty-complaints.png')}
                  style={{ width: 220, height: 220, resizeMode: 'contain', marginBottom: 16 }}
                />
                <Text style={{ color: '#94A3B8', fontSize: 16, fontWeight: '600' }}>No complaints found</Text>
              </View>
            }
          />
        )}
      </ScrollView>


    </SafeAreaView>
  );
}


