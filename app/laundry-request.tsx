import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { submitLaundryRequest } from '../utils/laundryRequestUtils';
import { fetchUserData, StudentData } from '../utils/nameUtils';
import { useTheme } from '../utils/ThemeContext';

export default function LaundryRequest() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const [student, setStudent] = useState<StudentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [clothesDetails, setClothesDetails] = useState('');
    const [totalClothes, setTotalClothes] = useState('');

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const data = await fetchUserData();
            setStudent(data);
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!clothesDetails.trim()) {
            Alert.alert('Missing Details', 'Please describe the clothes you are sending.');
            return;
        }
        if (!totalClothes.trim() || isNaN(Number(totalClothes))) {
            Alert.alert('Invalid Count', 'Please enter a valid total number of clothes.');
            return;
        }

        setSubmitting(true);
        try {
            await submitLaundryRequest(
                student?.roomNo || 'Unknown',
                student?.fullName || 'Unknown',
                clothesDetails,
                Number(totalClothes)
            );
            Alert.alert('Success', 'Your laundry request has been submitted!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to submit request. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading Profile...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <LinearGradient
                colors={['#000428', '#004e92']}
                style={styles.headerGradient}
            >
                <SafeAreaView edges={['top']} style={styles.safeArea}>
                    <View style={styles.header}>
                        <Pressable onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </Pressable>
                        <Text style={styles.headerTitle}>Laundry Request</Text>
                        <View style={{ width: 40 }} />
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView contentContainerStyle={styles.content}>

                        {/* Student Info Card */}
                        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <View style={styles.infoRow}>
                                <View style={[styles.iconBox, { backgroundColor: isDark ? '#172554' : '#EFF6FF' }]}>
                                    <MaterialCommunityIcons name="account-circle-outline" size={24} color={isDark ? '#60A5FA' : '#3B82F6'} />
                                </View>
                                <View>
                                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Student Name</Text>
                                    <Text style={[styles.infoValue, { color: colors.text }]}>{student?.fullName || '--'}</Text>
                                </View>
                            </View>
                            <View style={[styles.divider, { backgroundColor: colors.border }]} />
                            <View style={styles.infoRow}>
                                <View style={[styles.iconBox, { backgroundColor: isDark ? '#172554' : '#EFF6FF' }]}>
                                    <MaterialCommunityIcons name="door-open" size={24} color={isDark ? '#60A5FA' : '#3B82F6'} />
                                </View>
                                <View>
                                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Room Number</Text>
                                    <Text style={[styles.infoValue, { color: colors.text }]}>{student?.roomNo || '--'}</Text>
                                </View>
                            </View>
                        </View>

                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Request Details</Text>

                        {/* Form */}
                        <View style={styles.formContainer}>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>Clothes Details</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                                    placeholder="E.g., 2 Shirts, 1 Jeans, 1 Towel..."
                                    placeholderTextColor={colors.textSecondary}
                                    multiline
                                    textAlignVertical="top"
                                    value={clothesDetails}
                                    onChangeText={setClothesDetails}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>Total Count</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                                    placeholder="e.g. 5"
                                    placeholderTextColor={colors.textSecondary}
                                    keyboardType="numeric"
                                    value={totalClothes}
                                    onChangeText={setTotalClothes}
                                />
                            </View>
                        </View>

                        <Pressable
                            onPress={handleSubmit}
                            style={({ pressed }) => [
                                styles.submitButton,
                                submitting && styles.disabledButton,
                                pressed && styles.buttonPressed
                            ]}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <MaterialCommunityIcons name="send" size={20} color="#fff" style={{ marginRight: 8 }} />
                                    <Text style={styles.buttonText}>Submit Request</Text>
                                </>
                            )}
                        </Pressable>

                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 12,
        color: '#64748B',
    },
    headerGradient: {
        paddingBottom: 24,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    safeArea: {
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
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
    },
    content: {
        padding: 24,
    },

    // Info Card
    infoCard: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        borderWidth: 1,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 16,
        color: '#1E293B',
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 16,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 16,
    },
    formContainer: {
        gap: 20,
        marginBottom: 30,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
    },
    textArea: {
        height: 120,
    },

    submitButton: {
        backgroundColor: '#004e92',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 18,
        borderRadius: 16,
        shadowColor: '#004e92',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 6,
    },
    buttonPressed: {
        transform: [{ scale: 0.98 }],
        opacity: 0.9,
    },
    disabledButton: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
});
