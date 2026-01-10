import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAlert } from '../context/AlertContext';
import { createLeaveRequest, getStudentLeaves, LeaveRequest } from '../utils/leavesUtils';
import { fetchUserData } from '../utils/nameUtils';

export default function LeaveRequestPage() {
    const router = useRouter();
    const { showAlert } = useAlert();
    const [reason, setReason] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<LeaveRequest[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadHistory();
        setRefreshing(false);
    };

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const user = await fetchUserData();
            if (user && user.email) {
                const leaves = await getStudentLeaves(user.email);
                setHistory(leaves);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async () => {
        if (!reason.trim()) {
            showAlert('Error', 'Please provide a reason for your leave.', [], 'error');
            return;
        }

        if (endDate < startDate) {
            showAlert('Error', 'End date cannot be before start date.', [], 'error');
            return;
        }

        setLoading(true);
        try {
            const user = await fetchUserData();
            if (!user) throw new Error("User not found");

            const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include start day

            await createLeaveRequest({
                studentName: user.fullName,
                studentRoom: user.roomNo || 'N/A',
                studentEmail: user.email || '',
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                reason: reason,
                days: diffDays,
            });

            showAlert('Success', 'Leave request submitted successfully!', [], 'success');
            setReason('');
            loadHistory();
        } catch (error) {
            showAlert('Error', 'Failed to submit leave request. Please try again.', [], 'error');
        } finally {
            setLoading(false);
        }
    };

    const onChangeStart = (event: any, selectedDate?: Date) => {
        setShowStartPicker(Platform.OS === 'ios');
        if (selectedDate) setStartDate(selectedDate);
    };

    const onChangeEnd = (event: any, selectedDate?: Date) => {
        setShowEndPicker(Platform.OS === 'ios');
        if (selectedDate) setEndDate(selectedDate);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadHistory();
        setRefreshing(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return '#10B981';
            case 'rejected': return '#EF4444';
            default: return '#F59E0B';
        }
    };

    return (
        <View style={styles.container}>
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
                        <View style={{ flex: 1 }}>
                            <Text style={styles.headerTitle}>Apply for Leave</Text>
                            <Text style={styles.headerSubtitle}>Request Time Off</Text>
                        </View>

                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Form Section */}
                <View style={styles.formCard}>
                    <Text style={styles.sectionTitle}>NEW REQUEST</Text>

                    <View style={styles.dateRow}>
                        <View style={styles.dateField}>
                            <Text style={styles.label}>From Date</Text>
                            <Pressable onPress={() => setShowStartPicker(true)} style={styles.dateInput}>
                                <MaterialCommunityIcons name="calendar" size={20} color="#64748B" />
                                <Text style={styles.dateText}>{startDate.toLocaleDateString()}</Text>
                            </Pressable>
                            {showStartPicker && (
                                <DateTimePicker
                                    value={startDate}
                                    mode="date"
                                    display="default"
                                    onChange={onChangeStart}
                                    minimumDate={new Date()}
                                />
                            )}
                        </View>

                        <View style={styles.dateField}>
                            <Text style={styles.label}>To Date</Text>
                            <Pressable onPress={() => setShowEndPicker(true)} style={styles.dateInput}>
                                <MaterialCommunityIcons name="calendar" size={20} color="#64748B" />
                                <Text style={styles.dateText}>{endDate.toLocaleDateString()}</Text>
                            </Pressable>
                            {showEndPicker && (
                                <DateTimePicker
                                    value={endDate}
                                    mode="date"
                                    display="default"
                                    onChange={onChangeEnd}
                                    minimumDate={startDate}
                                />
                            )}
                        </View>
                    </View>

                    <Text style={[styles.label, { marginTop: 16 }]}>Reason</Text>
                    <TextInput
                        style={styles.textArea}
                        placeholder="e.g. Visiting home for festival..."
                        placeholderTextColor="#94A3B8"
                        multiline
                        numberOfLines={3}
                        value={reason}
                        onChangeText={setReason}
                        textAlignVertical="top"
                    />

                    <Pressable
                        style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={['#7C3AED', '#6D28D9']}
                            style={styles.btnGradient}
                        >
                            {loading ? (
                                <Text style={styles.btnText}>Submitting...</Text>
                            ) : (
                                <Text style={styles.btnText}>Submit Request</Text>
                            )}
                        </LinearGradient>
                    </Pressable>
                </View>

                {/* History Section */}
                <Text style={[styles.sectionTitle, { marginTop: 24, marginLeft: 4 }]}>PAST REQUESTS</Text>
                {history.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="calendar-blank-outline" size={48} color="#CBD5E1" />
                        <Text style={styles.emptyText}>No leave history found</Text>
                    </View>
                ) : (
                    <View style={styles.historyList}>
                        {history.map((item) => (
                            <View key={item.id} style={styles.historyCard}>
                                <View style={styles.historyHeader}>
                                    <View style={styles.dateInfo}>
                                        <Text style={styles.historyDate}>{item.startDate}</Text>
                                        <MaterialCommunityIcons name="arrow-right" size={16} color="#94A3B8" />
                                        <Text style={styles.historyDate}>{item.endDate}</Text>
                                    </View>
                                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                                            {item.status.toUpperCase()}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.historyReason}>{item.reason}</Text>
                                <Text style={styles.durationText}>{item.days} days</Text>
                            </View>
                        ))}
                    </View>
                )}

            </ScrollView>
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
    formCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#64748B',
        marginBottom: 16,
        letterSpacing: 1,
    },
    dateRow: {
        flexDirection: 'row',
        gap: 16,
    },
    dateField: {
        flex: 1,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 8,
    },
    dateInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 12,
        gap: 8,
    },
    dateText: {
        color: '#1E293B',
        fontWeight: '500',
    },
    textArea: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 12,
        height: 80,
        color: '#1E293B',
        marginBottom: 20,
    },
    submitBtn: {
        borderRadius: 14,
        overflow: 'hidden',
    },
    btnGradient: {
        paddingVertical: 14,
        alignItems: 'center',
    },
    btnText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
    historyList: {
        gap: 12,
    },
    historyCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    dateInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    historyDate: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
    },
    historyReason: {
        color: '#64748B',
        fontSize: 13,
        marginBottom: 4,
    },
    durationText: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '500',
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        color: '#94A3B8',
        marginTop: 12,
        fontWeight: '500',
    }
});
