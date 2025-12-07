import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isAdmin, useUser } from '../../utils/authUtils';
import { ServiceRequest, subscribeToAllServiceRequests, updateServiceStatus } from '../../utils/serviceUtils';

export default function ServiceRequestsPage() {
    const user = useUser();
    const router = useRouter();
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReq, setSelectedReq] = useState<ServiceRequest | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [eta, setEta] = useState('');
    const [note, setNote] = useState('');
    const [actionType, setActionType] = useState<'approve' | 'deny' | null>(null);

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
            Alert.alert("Success", `Request ${status}.`);
        } catch (e) {
            Alert.alert("Error", "Failed to update request.");
        }
    };

    const markCompleted = async (id: string) => {
        try {
            await updateServiceStatus(id, 'completed');
            Alert.alert("Success", "Request marked as completed.");
        } catch (e) {
            Alert.alert("Error", "Failed to update.");
        }
    }

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
                <TouchableOpacity style={[styles.btn, styles.completeBtn]} onPress={() => markCompleted(item.id)}>
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
        <SafeAreaView style={styles.container} edges={['top']}>
            <LinearGradient colors={['#000428', '#004e92']} style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-left" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Service Requests</Text>
            </LinearGradient>

            {loading ? <ActivityIndicator size="large" color="#004e92" style={{ marginTop: 50 }} /> : (
                <FlatList
                    data={requests}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
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

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 10, paddingBottom: 20 },
    backBtn: { padding: 8, marginRight: 10 },
    headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff' },
    list: { padding: 16 },
    card: { backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    userInfo: { flex: 1 },
    serviceType: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
    roomNo: { fontSize: 13, color: '#64748B', marginTop: 2 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 11, fontWeight: '700' },
    date: { fontSize: 12, color: '#94A3B8', marginTop: 8 },
    eta: { fontSize: 13, color: '#004e92', fontWeight: '600', marginTop: 4 },
    actionRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
    btn: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    approveBtn: { backgroundColor: '#3B82F6' },
    denyBtn: { backgroundColor: '#EF4444' },
    completeBtn: { backgroundColor: '#10B981', marginTop: 12 },
    btnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
    empty: { textAlign: 'center', marginTop: 50, color: '#94A3B8' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 20 },
    modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6 },
    input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 12, fontSize: 14, backgroundColor: '#F8FAFC' },
    textArea: { height: 80, textAlignVertical: 'top' },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
    modalBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
    cancelBtn: { backgroundColor: '#F1F5F9' },
    confirmBtn: { backgroundColor: '#004e92' },
    cancelText: { color: '#64748B', fontWeight: '600' },
    confirmText: { color: '#fff', fontWeight: '600' }
});
