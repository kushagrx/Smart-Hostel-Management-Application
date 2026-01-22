import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Animated, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../utils/ThemeContext';
import { Complaint, subscribeToStudentComplaints } from '../utils/complaintsSyncUtils';
import { Notice, subscribeToNotices } from '../utils/noticesSyncUtils';
import { NoticeListSkeleton, StudentComplaintListSkeleton } from './SkeletonLists';

interface NotificationOverlayProps {
    visible: boolean;
    onClose: () => void;
}

export default function NotificationOverlay({ visible, onClose }: NotificationOverlayProps) {
    const [activeTab, setActiveTab] = React.useState<'alerts' | 'complaints' | 'documents'>('alerts');
    const [complaints, setComplaints] = React.useState<Complaint[]>([]);
    const [complaintsLoading, setComplaintsLoading] = React.useState(true);
    const [notices, setNotices] = React.useState<Notice[]>([]);
    const [noticesLoading, setNoticesLoading] = React.useState(true);
    const { colors, isDark } = useTheme();

    const scale = React.useRef(new Animated.Value(0)).current;
    const opacity = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        let unsubscribeComplaints: (() => void) | undefined;
        let unsubscribeNotices: (() => void) | undefined;

        if (visible) {
            // Animate In
            Animated.parallel([
                Animated.spring(scale, {
                    toValue: 1,
                    useNativeDriver: true,
                    damping: 15,
                    stiffness: 150,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                })
            ]).start();

            setComplaintsLoading(true);
            unsubscribeComplaints = subscribeToStudentComplaints((data) => {
                setComplaints(data);
                setComplaintsLoading(false);
            });

            setNoticesLoading(true);
            unsubscribeNotices = subscribeToNotices((data) => {
                setNotices(data);
                setNoticesLoading(false);
            });
        } else {
            scale.setValue(0);
            opacity.setValue(0);
        }

        return () => {
            if (unsubscribeComplaints) unsubscribeComplaints();
            if (unsubscribeNotices) unsubscribeNotices();
        };
    }, [visible]);

    const handleClose = () => {
        Animated.parallel([
            Animated.timing(scale, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            })
        ]).start(() => onClose());
    };

    const getPriorityColor = (priority?: string) => {
        const priorityColors: Record<string, string> = {
            low: '#10B981',      // Green
            medium: '#F59E0B',   // Yellow/Orange
            high: '#EF4444',     // Red
            emergency: '#7F1D1D', // Dark Red
        };
        return priorityColors[priority || 'low'] || '#3B82F6';
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
        <Modal
            animationType="none"
            transparent={true}
            visible={visible}
            onRequestClose={handleClose}
        >
            <Pressable style={styles.backdrop} onPress={handleClose} />

            <Animated.View style={[
                styles.popoverContainer,
                {
                    opacity: opacity,
                    transform: [{ scale: scale }]
                }
            ]}>
                <View style={[styles.container, { backgroundColor: colors.background }]}>
                    <View style={styles.headerCompact}>
                        <View style={[styles.headerTitleContainer, { flex: 1 }]}>
                            <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
                            {(notices.length > 0) && (
                                <View style={styles.badgeSmall}>
                                    <Text style={styles.badgeText}>{notices.length}</Text>
                                </View>
                            )}
                        </View>
                        <Pressable onPress={handleClose} style={styles.closeButtonCompact}>
                            <MaterialIcons name="close" size={20} color={colors.text} />
                        </Pressable>
                    </View>

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
                        contentContainerStyle={{ paddingBottom: 20 }}
                        showsVerticalScrollIndicator={true}
                    >
                        {activeTab === 'alerts' && (
                            <View style={styles.section}>
                                {noticesLoading ? (
                                    <NoticeListSkeleton />
                                ) : notices.length > 0 ? (
                                    notices.map((notice) => (
                                        <View
                                            key={notice.id}
                                            style={[styles.card, {
                                                backgroundColor: colors.card,
                                                borderColor: colors.border
                                            }]}
                                        >
                                            <View style={[styles.priorityLine, { backgroundColor: getPriorityColor(notice.priority) }]} />
                                            <View style={styles.cardInner}>
                                                <View style={styles.cardHeaderRow}>
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={[styles.cardTitle, { color: colors.text }]}>{notice.title}</Text>
                                                        <Text style={[styles.cardDate, { color: colors.textSecondary }]}>{notice.date.toLocaleDateString()}</Text>
                                                    </View>
                                                    {notice.priority === 'emergency' && <MaterialIcons name="warning" size={16} color="#EF4444" />}
                                                </View>
                                                <Text style={[styles.cardBody, { color: colors.textSecondary }]} numberOfLines={3}>{notice.body}</Text>
                                            </View>
                                        </View>
                                    ))
                                ) : (
                                    <View style={styles.emptyStateCompact}>
                                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No new notices</Text>
                                    </View>
                                )}
                            </View>
                        )}

                        {activeTab === 'complaints' && (
                            <View style={styles.section}>
                                {complaintsLoading ? (
                                    <StudentComplaintListSkeleton />
                                ) : complaints.length > 0 ? (
                                    complaints.map((complaint) => (
                                        <View
                                            key={complaint.id}
                                            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                                        >
                                            <View style={[styles.cardInner, { backgroundColor: colors.card }]}>
                                                <View style={styles.cardHeaderRow}>
                                                    <Text style={[styles.cardTitle, { color: colors.text }]}>{complaint.title}</Text>
                                                    <View style={[styles.statusTag, { backgroundColor: getPriorityColor(complaint.priority) + '20' }]}>
                                                        <Text style={[styles.statusTagText, { color: getPriorityColor(complaint.priority) }]}>{complaint.priority?.slice(0, 3)}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.statusRow}>
                                                    <MaterialCommunityIcons
                                                        name={getStatusIcon(complaint.status)}
                                                        size={14}
                                                        color={complaint.status === 'resolved' ? '#10B981' : colors.textSecondary}
                                                    />
                                                    <Text style={[
                                                        styles.statusText,
                                                        { color: complaint.status === 'resolved' ? '#10B981' : colors.textSecondary }
                                                    ]}>
                                                        {complaint.status}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    ))
                                ) : (
                                    <View style={styles.emptyStateCompact}>
                                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No complaints</Text>
                                    </View>
                                )}
                            </View>
                        )}

                        {activeTab === 'documents' && (
                            <View style={styles.section}>
                                <View style={[styles.card, styles.emptyState, { height: 100, backgroundColor: colors.card, borderColor: colors.border }]}>
                                    <Text style={[styles.emptyText, { color: colors.text }]}>No documents</Text>
                                </View>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    popoverContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        // borderRadius: 0, // Full screen usually has no radius, or we can keep it if desired but 0 is safer for "whole page"
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 20,
    },
    arrow: {
        position: 'absolute',
        top: -10,
        right: 15,
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 10,
        borderRightWidth: 10,
        borderBottomWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        // borderBottomColor set inline dynamically based on theme
        borderBottomColor: '#FFFFFF',
        zIndex: 20,
    },
    container: {
        flex: 1,
        // borderRadius: 20, // Removed for full screen
        overflow: 'hidden',
    },
    headerCompact: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 40 : 50, // Increased for status bar
        paddingBottom: 10,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    badgeSmall: {
        backgroundColor: '#EF4444',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    closeButtonCompact: {
        padding: 4,
    },
    tabBar: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 8,
        borderRadius: 12,
        padding: 4,
    },
    tabItem: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 8,
    },
    tabItemActive: {
        backgroundColor: '#fff',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    tabText: {
        fontSize: 12,
        fontWeight: '600',
    },
    tabTextActive: {
        color: '#004e92',
        fontWeight: '700',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    section: {
        gap: 12,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#EFF6FF',
        padding: 2,
    },
    cardInner: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E3A8A',
        marginBottom: 2,
        flex: 1,
    },
    cardDate: {
        fontSize: 11,
        color: '#94A3B8',
        fontWeight: '500',
    },
    cardBody: {
        fontSize: 13,
        color: '#475569',
        lineHeight: 18,
        fontWeight: '500',
    },
    priorityLine: {
        width: 4,
        height: '60%',
        position: 'absolute',
        left: 0,
        top: '20%',
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
    },
    statusTag: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    statusTagText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    emptyStateCompact: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 14,
        fontWeight: '500',
    },
    // Keep unused styles for compatibility if needed or cleanup
    shadowProp: {},
    emptyState: { alignItems: 'center', justifyContent: 'center' },
    notificationBadge: { display: 'none' }, // legacy
    dot: { display: 'none' }, // legacy
    headerContent: { display: 'none' }, // legacy
    closeButton: { display: 'none' }, // legacy
    modalContainer: {},
    header: {},
    iconBox: {},
    countBadge: {},
    countText: {},
    subEmptyText: {},
    sectionHeader: {},
    sectionTitle: {},
    divider: {},
    cardFooter: {},
});
