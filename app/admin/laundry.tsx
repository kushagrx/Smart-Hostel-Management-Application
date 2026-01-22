import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import InputField from '../../components/InputField';
import { useAlert } from '../../context/AlertContext';
import { useTheme } from '../../utils/ThemeContext';
import { isAdmin, useUser } from '../../utils/authUtils';
import { LaundryRequestDisplay, LaundrySettings, subscribeToAllLaundryRequests, subscribeToLaundry, updateLaundrySettings } from '../../utils/laundrySyncUtils';

const STATUS_OPTIONS = ['On Schedule', 'Delayed', 'No Service', 'Holiday'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function LaundryManagementPage() {
    const { colors, theme, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const user = useUser();
    const { showAlert } = useAlert();

    const [activeTab, setActiveTab] = useState<'requests' | 'timings'>('timings'); // Default to timings as it's first

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<LaundrySettings>({
        pickupDay: 'Monday',
        pickupTime: '',
        pickupPeriod: 'AM',
        dropoffDay: 'Wednesday',
        dropoffTime: '',
        dropoffPeriod: 'PM',
        status: 'On Schedule',
        message: ''
    });
    const [requests, setRequests] = useState<LaundryRequestDisplay[]>([]);

    useEffect(() => {
        if (!isAdmin(user)) return;

        const unsubscribeSettings = subscribeToLaundry((data) => {
            setSettings(data);
            if (loading) setLoading(false);
        });

        const unsubscribeRequests = subscribeToAllLaundryRequests((data) => {
            setRequests(data);
        });

        return () => {
            unsubscribeSettings();
            unsubscribeRequests();
        };
    }, [user]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateLaundrySettings(settings);
            showAlert("Success", "Laundry settings updated successfully!");
        } catch (error) {
            console.error(error);
            showAlert("Error", "Failed to update settings");
        } finally {
            setSaving(false);
        }
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
        headerTitle: {
            fontSize: 22,
            fontWeight: '800',
            color: '#fff',
            letterSpacing: 0.5,
        },
        // Tab Bar Styles
        navBar: {
            flexDirection: 'row',
            backgroundColor: colors.card,
            marginHorizontal: 16,
            marginTop: 20,
            marginBottom: 20,
            borderRadius: 16,
            padding: 6,
            shadowColor: colors.textSecondary,
            shadowOpacity: 0.08,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: 3,
        },
        navItem: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: 12,
            borderRadius: 12,
        },
        navItemActive: {
            backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF',
        },
        navItemLabel: {
            fontSize: 13,
            fontWeight: '600',
            color: colors.textSecondary,
        },
        navItemLabelActive: {
            color: colors.primary,
            fontWeight: '700',
        },
        content: {
            flex: 1,
            paddingHorizontal: 20,
            paddingBottom: 40,
        },
        section: {
            backgroundColor: colors.card,
            padding: 20,
            borderRadius: 20,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: colors.border,
        },
        label: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.textSecondary,
            marginBottom: 8,
            marginTop: 16,
        },
        statusContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
            marginTop: 8,
        },
        statusBtn: {
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.background,
        },
        statusBtnActive: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        statusText: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.textSecondary,
        },
        statusTextActive: {
            color: '#fff',
        },
        saveBtn: {
            backgroundColor: colors.primary,
            marginVertical: 24,
            paddingVertical: 16,
            borderRadius: 16,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
        },
        saveBtnText: {
            color: '#fff',
            fontSize: 18,
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
        daySelector: {
            flexDirection: 'row',
            marginBottom: 12,
        },
        dayBtn: {
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 12,
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: colors.border,
            marginRight: 8,
        },
        dayBtnActive: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        dayBtnText: {
            fontSize: 13,
            fontWeight: '600',
            color: colors.textSecondary,
        },
        dayBtnTextActive: {
            color: '#fff',
        },
        timeRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        textArea: {
            backgroundColor: colors.background,
            borderRadius: 12,
            padding: 12,
            minHeight: 80,
            textAlignVertical: 'top',
            borderWidth: 1,
            borderColor: colors.border,
            color: colors.text,
            fontSize: 16,
        },
        // Request Item Styles
        requestItem: {
            backgroundColor: colors.card,
            borderRadius: 20,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: colors.border,
            // Premium Card Shadow
            shadowColor: colors.textSecondary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3,
        },
        reqHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 12,
        },
        reqProfile: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        reqAvatar: {
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: isDark ? '#172554' : '#EFF6FF',
            justifyContent: 'center',
            alignItems: 'center',
        },
        reqNameBlock: {
            gap: 2,
        },
        reqName: {
            fontSize: 16,
            fontWeight: '700',
            color: colors.text,
        },
        reqRoomBadge: {
            backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#DBEAFE',
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 6,
            alignSelf: 'flex-start',
        },
        reqRoomText: {
            fontSize: 11,
            fontWeight: '600',
            color: colors.primary,
        },
        reqTime: {
            fontSize: 11,
            fontWeight: '600',
            color: colors.textSecondary,
        },
        reqDivider: {
            height: 1,
            backgroundColor: colors.border,
            marginVertical: 12,
        },
        reqDetailsBlock: {
            gap: 8,
        },
        reqLabel: {
            fontSize: 11,
            fontWeight: '700',
            color: colors.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
        },
        reqText: {
            fontSize: 15,
            color: colors.text,
            lineHeight: 22,
        },
        reqFooter: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginTop: 12,
            gap: 12,
        },
        totalBadge: {
            backgroundColor: isDark ? '#334155' : '#F1F5F9',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        totalText: {
            fontSize: 13,
            fontWeight: '700',
            color: colors.text,
        }
    }), [colors, theme, isDark]);

    if (!isAdmin(user)) return null;

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#000428', '#004e92']} style={[styles.header, { paddingTop: 24 + insets.top }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="chevron-left" size={32} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Laundry Management</Text>
            </LinearGradient>

            {/* Tab Bar */}
            <View style={styles.navBar}>
                <TouchableOpacity
                    style={[styles.navItem, activeTab === 'timings' && styles.navItemActive]}
                    onPress={() => setActiveTab('timings')}
                >
                    <MaterialCommunityIcons
                        name="clock-outline"
                        size={20}
                        color={activeTab === 'timings' ? colors.primary : colors.textSecondary}
                    />
                    <Text style={[styles.navItemLabel, activeTab === 'timings' && styles.navItemLabelActive]}>
                        Laundry Timings
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.navItem, activeTab === 'requests' && styles.navItemActive]}
                    onPress={() => setActiveTab('requests')}
                >
                    <MaterialCommunityIcons
                        name="clipboard-list-outline"
                        size={20}
                        color={activeTab === 'requests' ? colors.primary : colors.textSecondary}
                    />
                    <Text style={[styles.navItemLabel, activeTab === 'requests' && styles.navItemLabelActive]}>
                        Clothes Details
                    </Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
            ) : (
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                    <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

                        {/* REQUESTS LIST TAB */}
                        {activeTab === 'requests' && (
                            <View>
                                {requests.length === 0 ? (
                                    <View style={[styles.section, { alignItems: 'center', padding: 40 }]}>
                                        <MaterialCommunityIcons name="washing-machine-off" size={48} color={colors.textSecondary} />
                                        <Text style={{ color: colors.textSecondary, marginTop: 12 }}>No laundry requests found</Text>
                                    </View>
                                ) : (
                                    requests.map(req => (
                                        <View key={req.id} style={styles.requestItem}>
                                            <View style={styles.reqHeader}>
                                                <View style={styles.reqProfile}>
                                                    <View style={styles.reqAvatar}>
                                                        <MaterialCommunityIcons name="account" size={24} color={colors.primary} />
                                                    </View>
                                                    <View style={styles.reqNameBlock}>
                                                        <Text style={styles.reqName}>{req.studentName || 'Unknown'}</Text>
                                                        <View style={styles.reqRoomBadge}>
                                                            <Text style={styles.reqRoomText}>Room {req.roomNo}</Text>
                                                        </View>
                                                    </View>
                                                </View>
                                                <Text style={styles.reqTime}>
                                                    {req.createdAt?.toDate ? req.createdAt.toDate().toLocaleDateString() : 'Just now'}
                                                </Text>
                                            </View>

                                            <View style={styles.reqDetailsBlock}>
                                                <Text style={styles.reqLabel}>CLOTHES DETAILS</Text>
                                                <Text style={styles.reqText}>{req.clothesDetails}</Text>
                                            </View>

                                            <View style={styles.reqFooter}>
                                                <View style={styles.totalBadge}>
                                                    <MaterialCommunityIcons name="tshirt-crew" size={16} color={colors.textSecondary} />
                                                    <Text style={styles.totalText}>Total: {req.totalClothes}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    ))
                                )}
                            </View>
                        )}


                        {/* SETTINGS FORM TAB */}
                        {activeTab === 'timings' && (
                            <>
                                <View style={styles.section}>
                                    <Text style={[styles.label, { marginTop: 0 }]}>Service Status</Text>
                                    <View style={styles.statusContainer}>
                                        {STATUS_OPTIONS.map((status) => (
                                            <TouchableOpacity
                                                key={status}
                                                style={[styles.statusBtn, settings.status === status && styles.statusBtnActive]}
                                                onPress={() => setSettings({ ...settings, status: status as any })}
                                            >
                                                <Text style={[styles.statusText, settings.status === status && styles.statusTextActive]}>
                                                    {status}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    <Text style={styles.label}>Pickup Schedule</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelector}>
                                        {DAYS.map(day => (
                                            <TouchableOpacity
                                                key={`pickup-${day}`}
                                                style={[styles.dayBtn, settings.pickupDay === day && styles.dayBtnActive]}
                                                onPress={() => setSettings({ ...settings, pickupDay: day })}
                                            >
                                                <Text style={[styles.dayBtnText, settings.pickupDay === day && styles.dayBtnTextActive]}>{day}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>

                                    <View style={styles.timeRow}>
                                        <View style={{ flex: 1 }}>
                                            <InputField
                                                icon="clock-time-four-outline"
                                                placeholder="09:00"
                                                value={settings.pickupTime}
                                                onChangeText={(text) => setSettings({ ...settings, pickupTime: text })}
                                            />
                                        </View>
                                        <View style={styles.periodToggleContainer}>
                                            <TouchableOpacity
                                                style={[styles.periodOption, settings.pickupPeriod === 'AM' && { backgroundColor: colors.primary }]}
                                                onPress={() => setSettings({ ...settings, pickupPeriod: 'AM' })}
                                            >
                                                <Text style={[styles.periodText, { color: settings.pickupPeriod === 'AM' ? '#fff' : colors.textSecondary }]}>AM</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.periodOption, settings.pickupPeriod === 'PM' && { backgroundColor: colors.primary }]}
                                                onPress={() => setSettings({ ...settings, pickupPeriod: 'PM' })}
                                            >
                                                <Text style={[styles.periodText, { color: settings.pickupPeriod === 'PM' ? '#fff' : colors.textSecondary }]}>PM</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <Text style={styles.label}>Drop-off Schedule</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelector}>
                                        {DAYS.map(day => (
                                            <TouchableOpacity
                                                key={`dropoff-${day}`}
                                                style={[styles.dayBtn, settings.dropoffDay === day && styles.dayBtnActive]}
                                                onPress={() => setSettings({ ...settings, dropoffDay: day })}
                                            >
                                                <Text style={[styles.dayBtnText, settings.dropoffDay === day && styles.dayBtnTextActive]}>{day}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>

                                    <View style={styles.timeRow}>
                                        <View style={{ flex: 1 }}>
                                            <InputField
                                                icon="truck-delivery-outline"
                                                placeholder="05:00"
                                                value={settings.dropoffTime}
                                                onChangeText={(text) => setSettings({ ...settings, dropoffTime: text })}
                                            />
                                        </View>
                                        <View style={styles.periodToggleContainer}>
                                            <TouchableOpacity
                                                style={[styles.periodOption, settings.dropoffPeriod === 'AM' && { backgroundColor: colors.primary }]}
                                                onPress={() => setSettings({ ...settings, dropoffPeriod: 'AM' })}
                                            >
                                                <Text style={[styles.periodText, { color: settings.dropoffPeriod === 'AM' ? '#fff' : colors.textSecondary }]}>AM</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.periodOption, settings.dropoffPeriod === 'PM' && { backgroundColor: colors.primary }]}
                                                onPress={() => setSettings({ ...settings, dropoffPeriod: 'PM' })}
                                            >
                                                <Text style={[styles.periodText, { color: settings.dropoffPeriod === 'PM' ? '#fff' : colors.textSecondary }]}>PM</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <Text style={styles.label}>Custom Message</Text>
                                    <TextInput
                                        style={styles.textArea}
                                        placeholder="Any special announcements? (Optional)"
                                        placeholderTextColor={colors.textSecondary}
                                        value={settings.message}
                                        onChangeText={(text) => setSettings({ ...settings, message: text })}
                                        multiline
                                    />
                                </View>

                                <TouchableOpacity
                                    style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                                    onPress={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <>
                                            <MaterialCommunityIcons name="content-save" size={24} color="#fff" />
                                            <Text style={styles.saveBtnText}>Save Settings</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </>
                        )}

                    </ScrollView>
                </KeyboardAvoidingView>
            )
            }
        </View >
    );
}
