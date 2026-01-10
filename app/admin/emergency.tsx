import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import InputField from '../../components/InputField';
import { useAlert } from '../../context/AlertContext';
import { useTheme } from '../../utils/ThemeContext';
import { isAdmin, useUser } from '../../utils/authUtils';
import { addContact, deleteContact, EmergencyContact, subscribeToContacts } from '../../utils/emergencySyncUtils';

const HOSTEL_ICONS = [
    { name: 'phone-in-talk', label: 'General' },
    { name: 'account-tie', label: 'Warden' },
    { name: 'shield-account', label: 'Guard' },
    { name: 'washing-machine', label: 'Laundry' },
    { name: 'broom', label: 'Cleaning' },
    { name: 'wrench', label: 'Maintenance' },
    { name: 'wifi', label: 'Wi-Fi' },
    { name: 'chef-hat', label: 'Mess Staff' },
];


const EMERGENCY_ICONS = [
    { name: 'police-badge', label: 'Police' },
    { name: 'hospital-box', label: 'Hospital' },
    { name: 'ambulance', label: 'Ambulance' },
    { name: 'fire-truck', label: 'Fire' },
];

export default function ManageEmergencyPage() {
    const { colors, theme } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const user = useUser();
    const { showAlert } = useAlert();

    const [contacts, setContacts] = useState<EmergencyContact[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    // const [newTitle, setNewTitle] = useState(''); // Removed as per request
    const [newName, setNewName] = useState('');
    const [newNumber, setNewNumber] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('phone-in-talk');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isAdmin(user)) return;

        const unsubscribe = subscribeToContacts((data) => {
            setContacts(data);
            if (loading) setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const handleCreate = async () => {
        if (!newNumber.trim()) {
            showAlert("Error", "Phone Number is required");
            return;
        }

        // Find label for selected icon
        const hostelIcon = HOSTEL_ICONS.find(i => i.name === selectedIcon);
        const emergencyIcon = EMERGENCY_ICONS.find(i => i.name === selectedIcon);
        const title = hostelIcon?.label || emergencyIcon?.label || 'Emergency Contact';

        setSaving(true);
        try {
            await addContact({
                title: title,
                name: newName,
                number: newNumber,
                icon: selectedIcon
            });
            setModalVisible(false);
            // setNewTitle('');
            setNewName('');
            setNewNumber('');
            setSelectedIcon('phone-in-talk');
            showAlert("Success", "Contact added successfully");
        } catch (error) {
            console.error(error);
            showAlert("Error", "Failed to add contact");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (id: string) => {
        showAlert(
            "Confirm Delete",
            "Are you sure you want to delete this contact?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteContact(id);
                        } catch (error) {
                            console.error(error);
                            showAlert("Error", "Failed to delete contact");
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
        headerTitle: {
            fontSize: 22,
            fontWeight: '800',
            color: '#fff',
            letterSpacing: 0.5,
        },
        list: {
            padding: 24,
            paddingBottom: 100,
        },
        createBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.primary,
            marginBottom: 24,
            paddingVertical: 16,
            borderRadius: 16,
            gap: 8,
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
        card: {
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 16,
            marginBottom: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
            borderWidth: 1,
            borderColor: colors.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
        },
        cardIcon: {
            width: 48,
            height: 48,
            borderRadius: 14,
            backgroundColor: theme === 'dark' ? 'rgba(59,130,246,0.2)' : '#EFF6FF',
            justifyContent: 'center',
            alignItems: 'center',
        },
        cardContent: {
            flex: 1,
        },
        cardTitle: {
            fontSize: 16,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 2,
        },
        cardSubtitle: {
            fontSize: 13,
            color: colors.textSecondary,
        },
        deleteBtn: {
            padding: 8,
            backgroundColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.2)' : '#FEF2F2',
            borderRadius: 10,
        },
        // Modal Styles
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
            maxHeight: '85%',
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
        label: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.textSecondary,
            marginBottom: 8,
            marginTop: 16,
        },
        iconGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
            gap: 12, // Ensure gap is sufficient
            marginTop: 8,
        },
        iconOption: {
            width: '30%', // 3 columns
            aspectRatio: 1, // Square
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.card, // Match card background
            padding: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
        },
        iconOptionSelected: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        iconLabel: {
            fontSize: 10,
            marginTop: 4,
            fontWeight: '600',
            textAlign: 'center',
            color: colors.textSecondary
        },
        iconLabelSelected: {
            color: '#fff'
        },
        sectionLabel: {
            fontSize: 13,
            fontWeight: '600',
            color: colors.textSecondary,
            marginTop: 16,
            marginBottom: 8,
        },
        submitBtn: {
            backgroundColor: colors.primary,
            paddingVertical: 16,
            borderRadius: 16,
            alignItems: 'center',
            marginTop: 32,
            marginBottom: 24,
        },
        submitBtnText: {
            color: '#fff',
            fontSize: 16,
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
                <Text style={styles.headerTitle}>Emergency Contacts</Text>
            </LinearGradient>

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={contacts}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    ListHeaderComponent={
                        <TouchableOpacity style={styles.createBtn} onPress={() => setModalVisible(true)}>
                            <MaterialCommunityIcons name="plus" size={24} color="#fff" />
                            <Text style={styles.createBtnText}>Add New Contact</Text>
                        </TouchableOpacity>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.cardIcon}>
                                <MaterialCommunityIcons name={item.icon as any} size={24} color={colors.primary} />
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>{item.title}</Text>
                                <Text style={styles.cardSubtitle}>
                                    {item.name ? `${item.name} • ` : ''}{item.number}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                                <MaterialCommunityIcons name="trash-can-outline" size={20} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    )}
                    ListEmptyComponent={
                        <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 40 }}>
                            No emergency contacts added yet.
                        </Text>
                    }
                />
            )}

            {/* Add Contact Modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add Contact</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* <Text style={[styles.label, { marginTop: 0 }]}>Title (Role)</Text>
                            <InputField
                                icon="card-account-details-outline"
                                placeholder="e.g. Warden"
                                value={newTitle}
                                onChangeText={setNewTitle}
                            /> */
                            /* Removed Title Input */}

                            <Text style={styles.label}>Name (Optional)</Text>
                            <InputField
                                icon="account-outline"
                                placeholder="e.g. Mr. Sharma"
                                value={newName}
                                onChangeText={setNewName}
                            />

                            <Text style={styles.label}>Phone Number</Text>
                            <InputField
                                icon="phone-outline"
                                placeholder="e.g. 9876543210"
                                value={newNumber}
                                onChangeText={setNewNumber}
                                keyboardType="phone-pad"
                            />


                            <Text style={styles.sectionLabel}>Hostel Services</Text>
                            <View style={styles.iconGrid}>
                                {HOSTEL_ICONS.map((item) => (
                                    <TouchableOpacity
                                        key={item.name}
                                        style={[styles.iconOption, selectedIcon === item.name && styles.iconOptionSelected]}
                                        onPress={() => setSelectedIcon(item.name)}
                                    >
                                        <MaterialCommunityIcons
                                            name={item.name as any}
                                            size={24}
                                            color={selectedIcon === item.name ? '#fff' : colors.textSecondary}
                                        />
                                        <Text style={[styles.iconLabel, selectedIcon === item.name && styles.iconLabelSelected]} numberOfLines={1}>
                                            {item.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.sectionLabel}>Emergency Services</Text>
                            <View style={styles.iconGrid}>
                                {EMERGENCY_ICONS.map((item) => (
                                    <TouchableOpacity
                                        key={item.name}
                                        style={[styles.iconOption, selectedIcon === item.name && styles.iconOptionSelected]}
                                        onPress={() => setSelectedIcon(item.name)}
                                    >
                                        <MaterialCommunityIcons
                                            name={item.name as any}
                                            size={24}
                                            color={selectedIcon === item.name ? '#fff' : colors.textSecondary}
                                        />
                                        <Text style={[styles.iconLabel, selectedIcon === item.name && styles.iconLabelSelected]} numberOfLines={1}>
                                            {item.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity
                                style={[styles.submitBtn, saving && { opacity: 0.7 }]}
                                onPress={handleCreate}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.submitBtnText}>Save Contact</Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
