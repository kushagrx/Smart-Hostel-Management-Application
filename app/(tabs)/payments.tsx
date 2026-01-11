import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAlert } from '../../context/AlertContext';
import { useUser } from '../../utils/authUtils';
import { getPaymentSettings, getStudentRequests, markRequestAsPaid, PaymentRequest } from '../../utils/financeUtils';
import { fetchUserData } from '../../utils/nameUtils';

export default function PaymentsPage() {
    const router = useRouter();
    const user = useUser();
    const { showAlert } = useAlert();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [requests, setRequests] = useState<PaymentRequest[]>([]);
    const [upiSettings, setUpiSettings] = useState<{ upiId: string, payeeName: string } | null>(null);
    const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

    // Verify Modal State
    const [verifyModalVisible, setVerifyModalVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
    const [transactionId, setTransactionId] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const studentData = await fetchUserData();
            if (studentData?.email) {
                const [reqs, settings] = await Promise.all([
                    getStudentRequests(studentData.email),
                    getPaymentSettings()
                ]);
                setRequests(reqs);
                setUpiSettings(settings);
            }
        } catch (error) {
            console.error("Error loading payments:", error);
            showAlert('Error', 'Failed to load payment info', [], 'error');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handlePayNow = async (req: PaymentRequest) => {
        Alert.alert(
            "Confirm Payment",
            "Do you want to pay ₹" + req.amount + " now?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Pay Now",
                    onPress: async () => {
                        try {
                            // GENERATE DUMMY TRANSACTION ID
                            const dummyId = "SIM-" + Date.now();
                            await markRequestAsPaid(req.id, dummyId);
                            loadData(); // Refresh list
                            showAlert('Success', 'Payment Successful! Waiting for admin verification.', [], 'success');
                        } catch (error) {
                            console.error("Payment Simulation Error:", error);
                            showAlert('Error', 'Failed to process payment', [], 'error');
                        }
                    }
                }
            ]
        );
    };

    const filteredRequests = requests.filter(r => {
        if (activeTab === 'pending') return r.status === 'pending' || r.status === 'overdue';
        return r.status === 'paid_unverified' || r.status === 'verified';
    });

    const renderItem = ({ item }: { item: PaymentRequest }) => {
        const isHistory = activeTab === 'history';

        return (
            <View style={[styles.card, isHistory && styles.cardHistory]}>
                <View style={styles.cardHeader}>
                    <View style={[
                        styles.iconBox,
                        { backgroundColor: item.type === 'Hostel Fee' ? '#E0F2FE' : '#F0FDF4' }
                    ]}>
                        <MaterialIcons
                            name={item.type === 'Hostel Fee' ? 'home' : 'restaurant'}
                            size={24}
                            color={item.type === 'Hostel Fee' ? '#0284C7' : '#16A34A'}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>{item.type}</Text>
                        <Text style={styles.cardDate}>
                            Due: {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'N/A'}
                        </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.amount}>₹{item.amount}</Text>
                        <Text style={[
                            styles.statusBadge,
                            {
                                color: item.status === 'verified' ? '#16A34A' :
                                    item.status === 'paid_unverified' ? '#CA8A04' :
                                        item.status === 'overdue' ? '#DC2626' : '#2563EB'
                            }
                        ]}>
                            {item.status.replace('_', ' ').toUpperCase()}
                        </Text>
                    </View>
                </View>

                {item.description ? (
                    <Text style={styles.description}>{item.description}</Text>
                ) : null}

                {!isHistory && (
                    <TouchableOpacity
                        style={styles.payButton}
                        onPress={() => handlePayNow(item)}
                    >
                        <LinearGradient
                            colors={['#16A34A', '#15803D']}
                            style={styles.payGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.payText}>PAY NOW</Text>
                            <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                        </LinearGradient>
                    </TouchableOpacity>
                )}

                {isHistory && item.receiptNumber && (
                    <View style={styles.receiptContainer}>
                        <MaterialIcons name="receipt" size={16} color="#64748B" />
                        <Text style={styles.receiptText}>Receipt: {item.receiptNumber}</Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#000428', '#004e92']}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Payments</Text>
                        <View style={styles.summaryBox}>
                            <View>
                                <Text style={styles.summaryLabel}>PENDING</Text>
                                <Text style={styles.summaryValue}>
                                    ₹{requests.filter(r => r.status === 'pending' || r.status === 'overdue')
                                        .reduce((sum, r) => sum + r.amount, 0)}
                                </Text>
                            </View>
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <View style={styles.contentContainer}>
                <View style={styles.tabs}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
                        onPress={() => setActiveTab('pending')}
                    >
                        <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>Pending</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'history' && styles.activeTab]}
                        onPress={() => setActiveTab('history')}
                    >
                        <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>History</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={filteredRequests}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} colors={['#004e92']} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <MaterialIcons name="check-circle-outline" size={64} color="#CBD5E1" />
                            <Text style={styles.emptyText}>No {activeTab} requests</Text>
                        </View>
                    }
                />
            </View>

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
    },
    headerContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
    },
    summaryBox: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    summaryLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 1,
    },
    summaryValue: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 20,
        marginTop: -20, // Overlap header
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 6,
        marginBottom: 16,
        shadowColor: '#64748B',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 12,
    },
    activeTab: {
        backgroundColor: '#EFF6FF',
    },
    tabText: {
        fontWeight: '600',
        color: '#64748B',
    },
    activeTabText: {
        color: '#004e92',
        fontWeight: '700',
    },
    listContent: {
        paddingBottom: 20,
        gap: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        shadowColor: '#64748B',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    cardHistory: {
        opacity: 0.8,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 12,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 2,
    },
    cardDate: {
        fontSize: 12,
        color: '#64748B',
    },
    amount: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
    },
    statusBadge: {
        fontSize: 10,
        fontWeight: '700',
        marginTop: 2,
    },
    description: {
        fontSize: 13,
        color: '#475569',
        marginBottom: 16,
        backgroundColor: '#F8FAFC',
        padding: 10,
        borderRadius: 8,
    },
    payButton: {
        marginTop: 8,
        borderRadius: 12,
        overflow: 'hidden',
    },
    payGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 8,
    },
    payText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
        letterSpacing: 0.5,
    },
    receiptContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        gap: 6,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    receiptText: {
        fontSize: 12,
        color: '#64748B',
        fontFamily: 'Monospace',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        gap: 12,
    },
    emptyText: {
        color: '#94A3B8',
        fontSize: 16,
        fontWeight: '500',
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 12,
    },
    modalText: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#1E293B',
        marginBottom: 24,
        backgroundColor: '#F8FAFC',
    },
    modalButtons: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
    },
    modalBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelBtn: {
        backgroundColor: '#F1F5F9',
    },
    confirmBtn: {
        backgroundColor: '#004e92',
    },
    cancelText: {
        color: '#64748B',
        fontWeight: '600',
    },
    confirmText: {
        color: '#fff',
        fontWeight: '700',
    },
});
