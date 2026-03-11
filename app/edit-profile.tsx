import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    DeviceEventEmitter,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlert } from '../context/AlertContext';
import { API_BASE_URL } from '../utils/api';
import { getInitial } from '../utils/nameUtils';
import { useTheme } from '../utils/ThemeContext';

export default function EditProfile() {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { showAlert } = useAlert();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Profile Display Info
    const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
    const [fullName, setFullName] = useState<string>('Student');

    // Form Data State
    const [formData, setFormData] = useState({
        phone: '',
        dob: '',
        bloodGroup: '',
        address: '',
        medicalHistory: '',
        fatherName: '',
        fatherPhone: '',
        motherName: '',
        motherPhone: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
    });

    const [initialData, setInitialData] = useState<any>(null);

    // DatePicker State
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateValue, setDateValue] = useState(new Date(2000, 0, 1));

    useEffect(() => {
        loadProfileData();
    }, []);

    const loadProfileData = async () => {
        try {
            const token = await import('@react-native-async-storage/async-storage').then(m => m.default.getItem('userToken'));
            const response = await fetch(`${API_BASE_URL}/api/students/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to load profile');

            const data = await response.json();

            setProfilePhoto(data.profilePhoto || null);
            setFullName(data.fullName || 'Student');

            const dobString = data.dob ? new Date(data.dob).toISOString().split('T')[0] : '';
            if (data.dob) {
                setDateValue(new Date(data.dob));
            }

            const loadedFormData = {
                phone: data.phone || '',
                dob: dobString,
                bloodGroup: data.bloodGroup || '',
                address: data.address || '',
                medicalHistory: data.medicalHistory || '',
                fatherName: data.fatherName || '',
                fatherPhone: data.fatherPhone || '',
                motherName: data.motherName || '',
                motherPhone: data.motherPhone || '',
                emergencyContactName: data.emergencyContactName || '',
                emergencyContactPhone: data.emergencyContactPhone || '',
            };

            setFormData(loadedFormData);
            setInitialData(loadedFormData);
        } catch (error) {
            console.error('Error loading profile:', error);
            showAlert('Error', 'Failed to load profile details.');
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        try {
            const ImagePicker = await import('expo-image-picker');
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'] as any,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled && result.assets[0].uri) {
                uploadImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            showAlert('Error', 'Failed to open image picker');
        }
    };

    const uploadImage = async (uri: string) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('profilePhoto', {
                uri: uri,
                name: 'profile_photo.jpg',
                type: 'image/jpeg',
                // @ts-ignore
            } as any);

            const token = await import('@react-native-async-storage/async-storage').then(m => m.default.getItem('userToken'));

            const response = await fetch(`${API_BASE_URL}/api/students/profile/photo`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Upload failed: ${errorText}`);
            }

            const result = await response.json();

            if (result.success && result.profilePhoto) {
                setProfilePhoto(result.profilePhoto);
                DeviceEventEmitter.emit('profileUpdated');
                showAlert('Success', 'Profile photo updated successfully!', [], 'success');
            }
        } catch (error: any) {
            console.error('Error uploading image:', error);
            showAlert('Upload Failed', error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (initialData && JSON.stringify(formData) === JSON.stringify(initialData)) {
            showAlert('No Changes', 'You have not made any changes to your profile.', [], 'info');
            return;
        }

        setSaving(true);
        try {
            const token = await import('@react-native-async-storage/async-storage').then(m => m.default.getItem('userToken'));

            if (!formData.phone || formData.phone.length < 10) {
                showAlert('Validation Error', 'Please enter a valid phone number.');
                setSaving(false);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/students/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to update profile');
            }

            DeviceEventEmitter.emit('profileUpdated');
            showAlert('Success', 'Profile updated successfully!', [], 'success');
            router.back();
        } catch (error: any) {
            console.error('Error saving profile:', error);
            showAlert('Update Failed', error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios'); // Keep open on iOS, close on Android
        if (selectedDate) {
            setDateValue(selectedDate);
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;
            setFormData(prev => ({ ...prev, dob: formattedDate }));
        }
    };

    // UI Builders
    const renderInput = (label: string, key: keyof typeof formData, icon: any, placeholder: string, keyboardType: any = 'default', multiline = false) => (
        <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{label}</Text>
            <View style={[styles.inputContainer, { backgroundColor: isDark ? '#1e293b' : '#f8fafc', borderColor: colors.border }]}>
                <MaterialCommunityIcons name={icon} size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                    style={[styles.input, { color: colors.text, height: multiline ? 80 : 48 }, multiline && { textAlignVertical: 'top', paddingTop: 12 }]}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textSecondary + '80'}
                    value={formData[key]}
                    onChangeText={(val) => handleChange(key, val)}
                    keyboardType={keyboardType}
                    multiline={multiline}
                />
            </View>
        </View>
    );

    const renderDatePicker = () => (
        <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Date of Birth</Text>
            <Pressable
                onPress={() => setShowDatePicker(true)}
                style={[styles.inputContainer, { height: 48, backgroundColor: isDark ? '#1e293b' : '#f8fafc', borderColor: colors.border }]}
            >
                <MaterialCommunityIcons name="calendar" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <Text style={[styles.input, { color: formData.dob ? colors.text : colors.textSecondary + '80', lineHeight: 48 }]}>
                    {formData.dob || 'Select Date of Birth'}
                </Text>
            </Pressable>
            {showDatePicker && (
                <DateTimePicker
                    value={dateValue}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                    maximumDate={new Date()}
                />
            )}
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <Stack.Screen options={{ headerShown: false }} />
                <ActivityIndicator size="large" color="#004e92" />
                <Text style={{ color: colors.textSecondary, marginTop: 12 }}>Loading Details...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: colors.background }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView
                contentContainerStyle={{ paddingBottom: 60 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Premium Banner Header */}
                <View style={styles.headerContainer}>
                    <LinearGradient
                        colors={['#000428', '#004e92']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.headerGradient, { paddingTop: insets.top + 20 }]}
                    >
                        <View style={styles.headerContent}>
                            <Pressable onPress={() => router.back()} style={styles.backButton}>
                                <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                            </Pressable>
                            <Text style={styles.headerTitle}>Edit Profile</Text>
                            <View style={{ width: 40 }} />
                        </View>

                        {/* Profile Photo Editor */}
                        <View style={styles.profileCard}>
                            <View style={styles.avatarContainer}>
                                <View style={styles.avatar}>
                                    {profilePhoto ? (
                                        <Image
                                            source={{ uri: `${API_BASE_URL}${profilePhoto}` }}
                                            style={{ width: '100%', height: '100%', borderRadius: 60 }}
                                            contentFit="cover"
                                            cachePolicy="none"
                                        />
                                    ) : (
                                        <Text style={styles.avatarText}>{getInitial(fullName)}</Text>
                                    )}
                                    {uploading && (
                                        <View style={[styles.avatar, { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10 }]}>
                                            <ActivityIndicator color="#fff" />
                                        </View>
                                    )}
                                </View>
                                {/* Camera Edit Button */}
                                <Pressable
                                    style={styles.cameraButton}
                                    onPress={pickImage}
                                    disabled={uploading}
                                >
                                    <View style={styles.cameraButtonInner}>
                                        <MaterialCommunityIcons name="camera" size={20} color="#004e92" />
                                    </View>
                                </Pressable>
                            </View>
                            <Text style={styles.studentName}>{fullName}</Text>
                        </View>
                    </LinearGradient>
                    <View style={[styles.curveBlock, { backgroundColor: colors.background }]} />
                </View>

                <View style={styles.scrollContent}>
                    {/* Personal Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Details</Text>
                        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            {renderInput('Phone Number', 'phone', 'phone', 'Enter your phone number', 'phone-pad')}
                            {renderDatePicker()}
                            {renderInput('Blood Group', 'bloodGroup', 'water', 'e.g., O+', 'default')}
                            {renderInput('Permanent Address', 'address', 'map-marker', 'Enter full home address', 'default', true)}
                        </View>
                    </View>

                    {/* Family Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Family Details</Text>
                        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            {renderInput("Father's Name", 'fatherName', 'account-tie', "Enter father's name")}
                            {renderInput("Father's Phone", 'fatherPhone', 'phone', "Enter father's phone", 'phone-pad')}
                            {renderInput("Mother's Name", 'motherName', 'face-woman', "Enter mother's name")}
                            {renderInput("Mother's Phone", 'motherPhone', 'phone', "Enter mother's phone", 'phone-pad')}
                        </View>
                    </View>

                    {/* Emergency Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Medical & Emergency</Text>
                        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            {renderInput("Emergency Contact Name", 'emergencyContactName', 'account-alert', "Name of contact person")}
                            {renderInput("Emergency Phone", 'emergencyContactPhone', 'phone-alert', "Emergency phone number", 'phone-pad')}
                            {renderInput('Medical History', 'medicalHistory', 'medical-bag', 'Any allergies or conditions?', 'default', true)}
                        </View>
                    </View>

                    {/* Save Button */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.saveBtn,
                            pressed && styles.saveBtnPressed,
                            saving && styles.saveBtnDisabled
                        ]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <MaterialCommunityIcons name="content-save" size={24} color="#fff" />
                                <Text style={styles.saveBtnText}>Save All Changes</Text>
                            </>
                        )}
                    </Pressable>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContainer: {
        position: 'relative',
        marginBottom: 10,
    },
    headerGradient: {
        paddingBottom: 50,
        alignItems: 'center',
    },
    headerContent: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
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
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.5,
    },
    profileCard: {
        alignItems: 'center',
        gap: 12,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 4,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.3)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    avatarText: {
        fontSize: 48,
        fontWeight: '700',
        color: '#004e92',
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 20,
    },
    cameraButtonInner: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    studentName: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.5,
    },
    curveBlock: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 40,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    section: {
        marginBottom: 28,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        color: '#64748b',
    },
    card: {
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        gap: 20,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    inputGroup: {
        gap: 8,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    saveBtn: {
        backgroundColor: '#004e92',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        borderRadius: 100,
        gap: 12,
        marginTop: 10,
        marginBottom: 20,
        shadowColor: '#004e92',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    saveBtnPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    saveBtnDisabled: {
        opacity: 0.6,
    },
    saveBtnText: {
        color: '#ffffff',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});
