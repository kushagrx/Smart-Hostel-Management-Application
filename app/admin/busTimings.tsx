
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import InputField from '../../components/InputField';
import { useAlert } from '../../context/AlertContext';
import { useTheme } from '../../utils/ThemeContext';
import { isAdmin, useUser } from '../../utils/authUtils';
import { addBusRoute, BusRoute, deleteBusRoute, subscribeToBusTimings } from '../../utils/busTimingsSyncUtils';

export default function ManageBusTimingsPage() {
    const { colors, theme } = useTheme();
    const insets = useSafeAreaInsets();
    const user = useUser();
    const router = useRouter();
    const { showAlert } = useAlert();

    const [routes, setRoutes] = useState<BusRoute[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [newRouteName, setNewRouteName] = useState('');
    const [newTimes, setNewTimes] = useState<{ time: string, period: 'AM' | 'PM' }[]>([{ time: '', period: 'AM' }]);

    useEffect(() => {
        if (!isAdmin(user)) return;
        const unsubscribe = subscribeToBusTimings((data) => {
            setRoutes(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    const onRefresh = () => {
        setRefreshing(true);
        // Real-time listener handles updates, just sim delay
        setTimeout(() => setRefreshing(false), 1000);
    };

    const handleAddTimeSlot = () => {
        setNewTimes([...newTimes, { time: '', period: 'AM' }]);
    };

    const handleTimeChange = (text: string, index: number) => {
        const updatedTimes = [...newTimes];
        updatedTimes[index].time = text;
        setNewTimes(updatedTimes);
    };

    const setPeriod = (index: number, period: 'AM' | 'PM') => {
        const updatedTimes = [...newTimes];
        updatedTimes[index].period = period;
        setNewTimes(updatedTimes);
    };

    const handleRemoveTimeSlot = (index: number) => {
        const updatedTimes = newTimes.filter((_, i) => i !== index);
        setNewTimes(updatedTimes);
    };

    const handleCreate = async () => {
        if (!newRouteName.trim()) {
            showAlert("Error", "Route name is required");
            return;
        }
        const validTimes = newTimes
            .filter(t => t.time.trim().length > 0)
            .map(t => `${t.time.trim()} ${t.period}`);

        if (validTimes.length === 0) {
            showAlert("Error", "At least one time is required");
            return;
        }

        try {
            await addBusRoute(newRouteName, validTimes);
            setModalVisible(false);
            setNewRouteName('');
            setNewTimes([{ time: '', period: 'AM' }]);
            showAlert("Success", "Bus route added successfully");
        } catch (error) {
            console.error(error);
            showAlert("Error", "Failed to add route");
        }
    };

    const handleDelete = (id: string) => {
        showAlert(
            "Confirm Delete",
            "Are you sure you want to delete this route?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteBusRoute(id);
                        } catch (error) {
                            console.error(error);
                            showAlert("Error", "Failed to delete route");
                        }
                    }
                }
            ]
        );
    };

    const styles = React.useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            paddingVertical: 24,
            paddingHorizontal: 24,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        backBtn: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.2)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        headerContent: {
            flex: 1,
        },
        headerTitle: {
            fontSize: 22,
            fontWeight: '800',
            color: '#fff',
            letterSpacing: 0.5,
        },
        createBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.primary,
            marginHorizontal: 20,
            marginTop: 20,
            paddingVertical: 16,
            borderRadius: 16,
            gap: 8,
            marginBottom: 20,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
        },
        createBtnText: {
            color: '#fff',
            fontSize: 16,
            fontWeight: '700',
        },
        list: {
            padding: 20,
            paddingBottom: 100,
        },
        card: {
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
        },
        cardIcon: {
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: theme === 'dark' ? 'rgba(59,130,246,0.2)' : '#EFF6FF',
            justifyContent: 'center',
            alignItems: 'center',
        },
        cardContent: {
            flex: 1,
        },
        routeTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 8,
        },
        timesContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
        },
        timeBadge: {
            backgroundColor: theme === 'dark' ? '#334155' : '#F1F5F9',
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 8,
        },
        timeText: {
            fontSize: 13,
            color: colors.textSecondary,
            fontWeight: '600',
        },
        deleteBtn: {
            padding: 8,
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
        },
        modalContent: {
            backgroundColor: colors.card,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            maxHeight: '80%',
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: '700',
            color: colors.text,
        },
        modalScroll: {
            marginBottom: 24,
        },
        label: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.textSecondary,
            marginBottom: 8,
            marginTop: 16,
        },
        timeInputRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12,
        },
        timeInput: {
            flex: 1,
            height: 50,
            backgroundColor: colors.background,
            borderRadius: 12,
            paddingHorizontal: 16,
            color: colors.text,
            borderWidth: 1,
            borderColor: colors.border,
        },
        removeTimeBtn: {
            width: 40,
            height: 50,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.2)' : '#FEF2F2',
            borderRadius: 12,
        },
        addTimeBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 12,
            borderWidth: 1,
            borderColor: colors.primary,
            borderRadius: 12,
            borderStyle: 'dashed',
            marginTop: 8,
            gap: 8,
        },
        addTimeText: {
            color: colors.primary,
            fontWeight: '600',
        },
        submitBtn: {
            backgroundColor: colors.primary,
            paddingVertical: 16,
            borderRadius: 16,
            alignItems: 'center',
            marginBottom: 12,
        },
        submitBtnText: {
            color: '#fff',
            fontSize: 16,
            fontWeight: '700',
        },
        periodToggleContainer: {
            flexDirection: 'row',
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            height: 50,
            padding: 4,
            gap: 4,
        },
        periodOption: {
            paddingHorizontal: 12,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 8,
        },
        periodText: {
            fontSize: 14,
            fontWeight: '700',
        },
    }), [colors, theme]);

    if (!isAdmin(user)) return null;

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#000428', '#004e92']} style={[styles.header, { paddingTop: 24 + insets.top }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="chevron-left" size={32} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Manage Bus Timings</Text>
                </View>
            </LinearGradient>

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={routes}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
                    ListHeaderComponent={
                        <TouchableOpacity style={styles.createBtn} onPress={() => setModalVisible(true)}>
                            <MaterialCommunityIcons name="plus" size={24} color="#fff" />
                            <Text style={styles.createBtnText}>Add New Route</Text>
                        </TouchableOpacity>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.cardIcon}>
                                <MaterialCommunityIcons name="bus" size={24} color={colors.primary} />
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={styles.routeTitle}>{item.route}</Text>
                                <View style={styles.timesContainer}>
                                    {item.times.map((time, idx) => (
                                        <View key={idx} style={styles.timeBadge}>
                                            <Text style={styles.timeText}>{time}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                                <MaterialCommunityIcons name="trash-can-outline" size={24} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    )}
                    ListEmptyComponent={
                        <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 40 }}>
                            No bus routes found. Add one above.
                        </Text>
                    }
                />
            )}

            {/* Create Modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add Bus Route</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalScroll}>
                            <Text style={styles.label}>Route Name</Text>
                            <InputField
                                icon="bus"
                                placeholder="e.g. Hostel -> College"
                                value={newRouteName}
                                onChangeText={setNewRouteName}
                            />

                            <Text style={styles.label}>Timings</Text>
                            {newTimes.map((item, index) => (
                                <View key={index} style={styles.timeInputRow}>
                                    <View style={{ flex: 1, flexDirection: 'row', gap: 8 }}>
                                        <TextInput
                                            style={styles.timeInput}
                                            placeholder="e.g. 08:30"
                                            placeholderTextColor={colors.textSecondary}
                                            value={item.time}
                                            onChangeText={(text) => handleTimeChange(text, index)}
                                            keyboardType="numbers-and-punctuation"
                                        />
                                        <View style={styles.periodToggleContainer}>
                                            <TouchableOpacity
                                                style={[styles.periodOption, item.period === 'AM' && { backgroundColor: colors.primary }]}
                                                onPress={() => setPeriod(index, 'AM')}
                                            >
                                                <Text style={[styles.periodText, { color: item.period === 'AM' ? '#fff' : colors.textSecondary }]}>AM</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.periodOption, item.period === 'PM' && { backgroundColor: colors.primary }]}
                                                onPress={() => setPeriod(index, 'PM')}
                                            >
                                                <Text style={[styles.periodText, { color: item.period === 'PM' ? '#fff' : colors.textSecondary }]}>PM</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {newTimes.length > 1 && (
                                        <TouchableOpacity onPress={() => handleRemoveTimeSlot(index)} style={styles.removeTimeBtn}>
                                            <MaterialCommunityIcons name="minus" size={20} color="#EF4444" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}

                            <TouchableOpacity onPress={handleAddTimeSlot} style={styles.addTimeBtn}>
                                <MaterialCommunityIcons name="plus" size={20} color={colors.primary} />
                                <Text style={styles.addTimeText}>Add Another Time</Text>
                            </TouchableOpacity>
                        </ScrollView>

                        <TouchableOpacity onPress={handleCreate} style={styles.submitBtn}>
                            <Text style={styles.submitBtnText}>Create Route</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
