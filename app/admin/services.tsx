import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAlert } from '../../context/AlertContext';
import { useTheme } from '../../utils/ThemeContext';
import { isAdmin, useUser } from '../../utils/authUtils';
import { ServiceRequest, subscribeToAllServiceRequests, updateServiceStatus } from '../../utils/serviceUtils';

export default function ServiceRequestsPage() {
    const { colors, theme } = useTheme();
    const insets = useSafeAreaInsets();
    const user = useUser();
    const router = useRouter();
    const { showAlert } = useAlert();

    const styles = React.useMemo(() => StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 24, paddingHorizontal: 24 },
        backBtn: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.2)',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 10,
        },
        headerTitle: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: 0.5, marginRight: 38 },
        list: { padding: 16 },
        card: {
            backgroundColor: colors.card,
            padding: 16,
            borderRadius: 16,
            marginBottom: 16,
            elevation: 2,
            shadowColor: colors.textSecondary,
            shadowOpacity: 0.05,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 }
        },
        cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
        userInfo: { flex: 1 },
        serviceType: { fontSize: 16, fontWeight: '700', color: colors.text },
        roomNo: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
        statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
        statusText: { fontSize: 11, fontWeight: '700' },
        date: { fontSize: 12, color: colors.textSecondary, marginTop: 8 },
        eta: { fontSize: 13, color: colors.primary, fontWeight: '600', marginTop: 4 },
        actionRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
        btn: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
        approveBtn: { backgroundColor: '#3B82F6' },
        denyBtn: { backgroundColor: '#EF4444' },
        completeBtn: { backgroundColor: '#10B981', marginTop: 12 },
        btnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
        empty: { textAlign: 'center', marginTop: 50, color: colors.textSecondary },
        modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
        modalContent: { backgroundColor: colors.card, borderRadius: 20, padding: 20 },
        modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 20, textAlign: 'center', color: colors.text },
        inputGroup: { marginBottom: 16 },
        label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 },
        input: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 10,
            padding: 12,
            fontSize: 14,
            backgroundColor: theme === 'dark' ? '#1E293B' : '#F8FAFC',
            color: colors.text
        },
        textArea: { height: 80, textAlignVertical: 'top' },
        modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
        modalBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
        cancelBtn: { backgroundColor: theme === 'dark' ? '#334155' : '#F1F5F9' },
        confirmBtn: { backgroundColor: colors.primary },
        cancelText: { color: colors.textSecondary, fontWeight: '600' },
        confirmText: { color: '#fff', fontWeight: '600' }
    }), [colors, theme]);
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReq, setSelectedReq] = useState<ServiceRequest | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [eta, setEta] = useState('');
    const [note, setNote] = useState('');
    const [actionType, setActionType] = useState<'approve' | 'deny' | null>(null);

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    }, []);

    useEffect(() => {
        const unsubscribe = subscribeToAllServiceRequests((data) => {
            setRequests(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleAction = (req: ServiceRequest, type: 'approve' | 'deny') => {
        setSelectedReq(req);
        setActionType(type);
        setEta('');
        setNote('');
        setModalVisible(true);
    };

    const submitAction = async () => {
        if (!selectedReq || !actionType) return;
        try {
            const status = actionType === 'approve' ? 'approved' : 'rejected';
            await updateServiceStatus(selectedReq.id, status, eta, note);
            setModalVisible(false);
            showAlert("Success", `Request ${status}.`, [], 'success');
        } catch (e) {
            showAlert("Error", "Failed to update request.", [], 'error');
        }
    };

    const handleStatusUpdate = (id: string, currentStatus: string, newStatus: string) => {
        showAlert(
            'Update Status',
            `Mark request as ${newStatus}?`,
            [
                { text: 'Cancel', style: 'cancel', onPress: () => { } },
                {
                    text: 'Update',
                    onPress: async () => {
                        try {
                            await updateServiceStatus(id, newStatus as any);
                            showAlert('Success', `Request marked as ${newStatus}`, [], 'success');
                        } catch (error) {
                            showAlert('Error', "Failed to update status", [], 'error');
                        }
                    }
                }
            ]
        );
    };

    if (!isAdmin(user)) return <View style={styles.center}><Text>Access Denied</Text></View>;

    const renderItem = ({ item }: { item: ServiceRequest }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.userInfo}>
                    <Text style={styles.serviceType}>{item.serviceType}</Text>
                    <Text style={styles.roomNo}>Room {item.roomNo} • {item.studentName}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status.toUpperCase()}</Text>
                </View>
            </View>

            {/* Timestamps */}
            <Text style={styles.date}>Requested: {item.createdAt instanceof Date ? item.createdAt.toLocaleString() : ''}</Text>
            {item.estimatedTime && <Text style={styles.eta}>ETA: {item.estimatedTime}</Text>}

            {/* Actions */}
            {item.status === 'pending' && (
                <View style={styles.actionRow}>
                    <TouchableOpacity style={[styles.btn, styles.approveBtn]} onPress={() => handleAction(item, 'approve')}>
                        <Text style={styles.btnText}>Approve & Set ETA</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, styles.denyBtn]} onPress={() => handleAction(item, 'deny')}>
                        <Text style={styles.btnText}>Deny</Text>
                    </TouchableOpacity>
                </View>
            )}
            {item.status === 'approved' && (
                <TouchableOpacity style={[styles.btn, styles.completeBtn]} onPress={() => handleStatusUpdate(item.id, item.status, 'completed')}>
                    <Text style={styles.btnText}>Mark Completed</Text>
                </TouchableOpacity>
            )}
        </View>
    );

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
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            <LinearGradient colors={['#000428', '#004e92']} style={[styles.header, { paddingTop: insets.top + 18 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialIcons name="chevron-left" size={32} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Service Requests</Text>
            </LinearGradient>

            {loading ? <ActivityIndicator size="large" color="#004e92" style={{ marginTop: 50 }} /> : (
                <FlatList
                    data={requests}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
                    ListEmptyComponent={<Text style={styles.empty}>No requests found.</Text>}
                />
            )}

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{actionType === 'approve' ? 'Approve Request' : 'Deny Request'}</Text>

                        {actionType === 'approve' && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Estimated Completion Time</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. Today 5:00 PM"
                                    value={eta}
                                    onChangeText={setEta}
                                />
                            </View>
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Admin Note (Optional)</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Add a note..."
                                value={note}
                                onChangeText={setNote}
                                multiline
                            />
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn]} onPress={submitAction}>
                                <Text style={styles.confirmText}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>


        </SafeAreaView>
    );
}


