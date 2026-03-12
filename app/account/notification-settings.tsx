import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAlert } from '../../context/AlertContext';
import { useTheme } from '../../utils/ThemeContext';
import api from '../../utils/api';

const PreferenceItem = ({ icon, label, description, value, onValueChange, colors, isDark, isLast }: any) => {
    return (
        <View style={[
            styles.preferenceRow,
            { borderBottomColor: colors.border },
            isLast && { borderBottomWidth: 0 }
        ]}>
            <View style={styles.labelContainer}>
                <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(96, 165, 250, 0.1)' : '#F1F5F9' }]}>
                    <MaterialIcons name={icon} size={22} color={isDark ? '#60A5FA' : '#004e92'} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={[styles.preferenceLabel, { color: colors.text }]}>{label}</Text>
                    <Text style={[styles.preferenceDescription, { color: colors.textSecondary }]}>{description}</Text>
                </View>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: '#CBD5E1', true: '#004e92' }}
                thumbColor={'#fff'}
                ios_backgroundColor="#CBD5E1"
            />
        </View>
    );
};

export default function NotificationSettings() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const { showAlert } = useAlert();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [prefs, setPrefs] = useState<any>({
        master: true,
        notices: true,
        complaints: true,
        leaves: true,
        services: true,
        payments: true,
        mess: true,
        laundry: true,
        bus: true,
        visitors: true,
        messages: true,
    });

    useEffect(() => {
        fetchPreferences();
    }, []);

    const fetchPreferences = async () => {
        try {
            const response = await api.get('/notifications/preferences');
            if (response.data) {
                setPrefs((current: any) => ({ ...current, ...response.data }));
            }
        } catch (error) {
            console.error('Error fetching preferences:', error);
        } finally {
            setLoading(false);
        }
    };

    const savePreferences = async (updatedPrefs: any) => {
        setSaving(true);
        try {
            await api.post('/notifications/preferences', { preferences: updatedPrefs });
            // Silent save - no alert needed
        } catch (error) {
            console.error('Error saving preferences:', error);
            showAlert('Error', 'Failed to save preferences. Please check your connection.');
        } finally {
            setSaving(false);
        }
    };

    const togglePreference = (key: string) => {
        const newPrefs = { ...prefs, [key]: !prefs[key] };
        setPrefs(newPrefs);
        savePreferences(newPrefs);
    };

    const bulkUpdate = (value: boolean) => {
        const newPrefs = { ...prefs };
        Object.keys(newPrefs).forEach(key => newPrefs[key] = value);
        setPrefs(newPrefs);
        savePreferences(newPrefs);
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color="#004e92" />
            </View>
        );
    }

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
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <MaterialIcons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View>
                                <Text style={styles.headerTitle}>Push Notifications</Text>
                                <Text style={styles.headerSubtitle}>Changes save automatically</Text>
                            </View>
                            {saving && <ActivityIndicator color="#fff" size="small" />}
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.section}>
                    {/* Master Toggle Card */}
                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: 24 }]}>
                        <PreferenceItem
                            icon="notifications-active"
                            label="Allow Notifications"
                            description="Toggle all push alerts on or off"
                            value={prefs.master !== false}
                            onValueChange={() => togglePreference('master')}
                            colors={colors}
                            isDark={isDark}
                            isLast={true}
                        />
                    </View>

                    {/* Granular Preferences - Only shown if master is ON */}
                    {prefs.master !== false && (
                        <>
                            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Granular Preferences</Text>
                            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <PreferenceItem
                                    icon="announcement"
                                    label="Hostel Notices"
                                    description="New announcements, events, and important news"
                                    value={prefs.notices}
                                    onValueChange={() => togglePreference('notices')}
                                    colors={colors}
                                    isDark={isDark}
                                />
                                <PreferenceItem
                                    icon="assignment"
                                    label="Complaints"
                                    description="Updates on status changes of your filed complaints"
                                    value={prefs.complaints}
                                    onValueChange={() => togglePreference('complaints')}
                                    colors={colors}
                                    isDark={isDark}
                                />
                                <PreferenceItem
                                    icon="home"
                                    label="Leave Requests"
                                    description="Approval or rejection updates for your leave applications"
                                    value={prefs.leaves}
                                    onValueChange={() => togglePreference('leaves')}
                                    colors={colors}
                                    isDark={isDark}
                                />
                                <PreferenceItem
                                    icon="build"
                                    label="Service Requests"
                                    description="Technician assignment and completion updates"
                                    value={prefs.services}
                                    onValueChange={() => togglePreference('services')}
                                    colors={colors}
                                    isDark={isDark}
                                />
                                <PreferenceItem
                                    icon="payment"
                                    label="Payments & Fees"
                                    description="New fee requests and successful payment confirmations"
                                    value={prefs.payments}
                                    onValueChange={() => togglePreference('payments')}
                                    colors={colors}
                                    isDark={isDark}
                                />
                                <PreferenceItem
                                    icon="restaurant"
                                    label="Mess Menu"
                                    description="Notifications when the mess menu is updated"
                                    value={prefs.mess}
                                    onValueChange={() => togglePreference('mess')}
                                    colors={colors}
                                    isDark={isDark}
                                />
                                <PreferenceItem
                                    icon="local-laundry-service"
                                    label="Laundry"
                                    description="Status updates for your laundry pickup and dropoff"
                                    value={prefs.laundry}
                                    onValueChange={() => togglePreference('laundry')}
                                    colors={colors}
                                    isDark={isDark}
                                />
                                <PreferenceItem
                                    icon="directions-bus"
                                    label="Bus Schedule"
                                    description="Alerts for new bus routes or timing changes"
                                    value={prefs.bus}
                                    onValueChange={() => togglePreference('bus')}
                                    colors={colors}
                                    isDark={isDark}
                                />
                                <PreferenceItem
                                    icon="people"
                                    label="Visitor Requests"
                                    description="Status updates for your registered visitors"
                                    value={prefs.visitors}
                                    onValueChange={() => togglePreference('visitors')}
                                    colors={colors}
                                    isDark={isDark}
                                />
                                <PreferenceItem
                                    icon="chat"
                                    label="Direct Messages"
                                    description="Instant alerts when an admin sends you a message"
                                    value={prefs.messages}
                                    onValueChange={() => togglePreference('messages')}
                                    isLast={true}
                                    colors={colors}
                                    isDark={isDark}
                                />
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>
        </View>
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
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    headerContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    content: {
        flex: 1,
    },
    section: {
        padding: 20,
    },
    card: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
    },
    preferenceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    iconBox: {
        width: 42,
        height: 42,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
    },
    preferenceLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    preferenceDescription: {
        fontSize: 12,
        marginTop: 2,
        lineHeight: 16,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#94A3B8',
        marginBottom: 12,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    }
});
