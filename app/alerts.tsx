import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NoticeListSkeleton, StudentComplaintListSkeleton } from '../components/SkeletonLists';
import { useTheme } from '../utils/ThemeContext';
import { Complaint, subscribeToStudentComplaints } from '../utils/complaintsSyncUtils';
import { Notice, subscribeToNotices } from '../utils/noticesSyncUtils';

export default function Alerts() {
    const [activeTab, setActiveTab] = useState<'alerts' | 'complaints' | 'documents'>('alerts');
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [complaintsLoading, setComplaintsLoading] = useState(true);
    const [notices, setNotices] = useState<Notice[]>([]);
    const [noticesLoading, setNoticesLoading] = useState(true);
    const { colors, isDark } = useTheme();

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
                        <Text style={styles.headerTitle}>Notifications</Text>
                        <View style={styles.notificationBadge}>
                            <MaterialIcons name="notifications-none" size={24} color="#fff" />
                            {(notices.length > 0) && <View style={styles.dot} />}
                        </View>
                    </View>


                </SafeAreaView>
            </LinearGradient>

            {/* Custom Tab Bar - Moved Outside Header */}
            <View style={[styles.tabBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#E0E7FF' }]}>
                {(['alerts', 'complaints', 'documents'] as const).map((tab) => (
                    <Pressable
                        key={tab}
                        style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[
                            styles.tabText,
                            { color: isDark ? colors.textSecondary : '#64748B' },
                            activeTab === tab && styles.tabTextActive
                        ]}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </Text>
                    </Pressable>
                ))}
            </View>

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
                            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Hostel Notices</Text>
                            {notices.length > 0 && <View style={styles.countBadge}><Text style={styles.countText}>{notices.length}</Text></View>}
                        </View>

                        {noticesLoading ? (
                            <NoticeListSkeleton />
                        ) : notices.length > 0 ? (
                            notices.map((notice) => (
                                <View
                                    key={notice.id}
                                    style={[styles.card, styles.shadowProp, {
                                        backgroundColor: colors.card,
                                        borderColor: colors.border
                                    }]}
                                >
                                    <View style={[styles.priorityLine, { backgroundColor: getPriorityColor(notice.priority) }]} />
                                    <View style={styles.cardInner}>
                                        <View style={styles.cardHeaderRow}>
                                            <View style={[styles.iconBox, { backgroundColor: isDark ? '#172554' : '#EFF6FF' }]}>
                                                <MaterialCommunityIcons name="bullhorn" size={20} color={isDark ? '#60A5FA' : '#004e92'} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.cardTitle, { color: colors.text }]}>{notice.title}</Text>
                                                <Text style={[styles.cardDate, { color: colors.textSecondary }]}>{notice.date.toLocaleDateString()}</Text>
                                            </View>
                                            {notice.priority === 'emergency' && <MaterialIcons name="warning" size={20} color="#EF4444" />}
                                        </View>
                                        <Text style={[styles.cardBody, { color: colors.textSecondary }]}>{notice.body}</Text>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <MaterialCommunityIcons name="bell-sleep" size={48} color={isDark ? colors.secondary : "#CBD5E1"} />
                                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No new notices</Text>
                            </View>
                        )}

                        {/* Personal Alerts Section */}
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 24, marginBottom: 12 }]}>Personal Alerts</Text>
                        {/* 
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
            */}
                    </View>
                )}

                {/* Complaints Tab */}
                {activeTab === 'complaints' && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>My Complaints</Text>
                        {complaintsLoading ? (
                            <StudentComplaintListSkeleton />
                        ) : complaints.length > 0 ? (
                            complaints.map((complaint) => (
                                <View
                                    key={complaint.id}
                                    style={[styles.card, styles.shadowProp, { backgroundColor: colors.card, borderColor: colors.border }]}
                                >
                                    <View style={[styles.cardInner, { backgroundColor: colors.card }]}>
                                        <View style={styles.cardHeaderRow}>
                                            <Text style={[styles.cardTitle, { color: colors.text }]}>{complaint.title}</Text>
                                            <View style={[styles.statusTag, { backgroundColor: getPriorityColor(complaint.priority) + '20' }]}>
                                                <Text style={[styles.statusTagText, { color: getPriorityColor(complaint.priority) }]}>
                                                    {complaint.priority?.toUpperCase()}
                                                </Text>
                                            </View>
                                        </View>

                                        <Text style={[styles.cardBody, { marginTop: 8, color: colors.textSecondary }]}>{complaint.description}</Text>

                                        <View style={styles.divider} />

                                        <View style={styles.cardFooter}>
                                            <View style={styles.statusRow}>
                                                <MaterialCommunityIcons
                                                    name={getStatusIcon(complaint.status)}
                                                    size={16}
                                                    color={complaint.status === 'resolved' ? '#10B981' : colors.textSecondary}
                                                />
                                                <Text style={[
                                                    styles.statusText,
                                                    { color: complaint.status === 'resolved' ? '#10B981' : colors.textSecondary },
                                                    complaint.status === 'resolved' && { fontWeight: '600' }
                                                ]}>
                                                    {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                                                </Text>
                                            </View>
                                            <Text style={[styles.cardDate, { color: colors.textSecondary }]}>{formatDate(complaint.createdAt)}</Text>
                                        </View>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <MaterialCommunityIcons name="clipboard-check-outline" size={48} color={isDark ? colors.secondary : "#CBD5E1"} />
                                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No complaints history</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Documents Tab */}
                {activeTab === 'documents' && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>My Documents</Text>
                        <View style={[styles.card, styles.shadowProp, styles.emptyState, { height: 200, backgroundColor: colors.card, borderColor: colors.border }]}>
                            <MaterialCommunityIcons name="file-document-outline" size={48} color={isDark ? colors.secondary : "#CBD5E1"} />
                            <Text style={[styles.emptyText, { color: colors.text }]}>No documents available</Text>
                            <Text style={[styles.subEmptyText, { color: colors.textSecondary }]}>Hostel circulars and forms will appear here.</Text>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Styles for new TabBar placement */}
            {/* Note: In a real refactor, I would clean up the unused styles below, but I'll override them here for logic consistency first */}
        </View >
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
        zIndex: 10,
    },
    headerContent: {
        paddingHorizontal: 24,
        paddingTop: 10,
        paddingBottom: 10, // Reduced since tabs are gone
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
        marginTop: 20, // Add top margin to separate from headers
        marginBottom: 5, // Add bottom margin
        borderRadius: 14,
        padding: 6,
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
    },
    tabTextActive: {
        color: '#004e92',
        fontWeight: '700',
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
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#EFF6FF', // Premium Soft Blue Border
        padding: 2, // Inner spacing for premium look
    },
    cardInner: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
    },
    priorityLine: {
        width: 4,
        height: 24,
        position: 'absolute',
        left: 0,
        top: 24,
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
        display: 'none', // Removed side line for cleaner look, opt for badges/icons
    },
    cardHeaderRow: {
        flexDirection: 'row',
        gap: 14,
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    iconBox: {
        width: 42,
        height: 42,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F0F9FF', // Soft Blue background for icons
        borderWidth: 1,
        borderColor: '#E0F2FE',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E3A8A', // Deep Royal Blue
        marginBottom: 4,
        lineHeight: 22,
        flex: 1,
    },
    cardDate: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '600',
    },
    cardBody: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 22,
        fontWeight: '500',
    },
    statusTag: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    statusTagText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 14,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '600',
    },
    shadowProp: {
        shadowColor: "#1E40AF", // Blue shadow
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08, // Soft premium shadow
        shadowRadius: 16,
        elevation: 4,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        borderRadius: 24,
        borderWidth: 1,
        gap: 12,
        marginTop: 10,
    },
    emptyText: {
        color: '#64748B',
        fontSize: 15,
        fontWeight: '600',
    },
    subEmptyText: {
        color: '#94A3B8',
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 20,
    },
});
