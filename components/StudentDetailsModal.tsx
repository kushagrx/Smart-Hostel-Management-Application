import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../utils/ThemeContext';

interface StudentDetailsModalProps {
    visible: boolean;
    student: any;
    onClose: () => void;
    onEdit: (student: any) => void;
    onDelete: (id: string, name: string, room: string) => void;
}

export default function StudentDetailsModal({ visible, student, onClose, onEdit, onDelete }: StudentDetailsModalProps) {
    const { colors, theme } = useTheme();
    const insets = useSafeAreaInsets();

    if (!visible || !student) return null;

    const getStatusColor = (status: string) => {
        return status === 'active' ? '#4CAF50' : '#F44336';
    };

    const styles = StyleSheet.create({
        modalOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            zIndex: 1000,
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalContent: {
            backgroundColor: colors.card,
            borderRadius: 24,
            width: '90%',
            maxHeight: Dimensions.get('window').height * 0.85,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 20 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 20,
            overflow: 'hidden',
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 24,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: '800',
            color: colors.text,
        },
        closeBtn: {
            padding: 4,
            backgroundColor: colors.background,
            borderRadius: 20,
        },
        modalBody: {
            padding: 24,
        },
        infoSection: {
            marginBottom: 16,
            backgroundColor: colors.background, // Nested diff bg
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
        },
        detailRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        detailLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
        },
        detailLabel: {
            fontSize: 12,
            fontWeight: '600',
            color: colors.textSecondary,
        },
        detailValue: {
            fontSize: 13,
            fontWeight: '600',
            color: colors.text,
            flex: 1,
            textAlign: 'right', // Align values right
            marginLeft: 16,
        },
        actionButtons: {
            flexDirection: 'row',
            gap: 12,
            marginTop: 8,
        },
        actionBtn: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 12,
            borderRadius: 12,
            gap: 8,
        },
        editBtn: {
            backgroundColor: colors.primary,
        },
        deleteBtn: {
            backgroundColor: '#EF4444',
        },
        actionBtnText: {
            color: '#fff',
            fontSize: 13,
            fontWeight: '700',
        },
    });

    return (
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Student Details</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <MaterialCommunityIcons name="close" size={24} color="#64748B" />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
                    <View style={styles.infoSection}>
                        <View style={styles.detailRow}>
                            <View style={styles.detailLeft}>
                                <MaterialCommunityIcons name="account" size={16} color="#6366F1" />
                                <Text style={styles.detailLabel}>Full Name</Text>
                            </View>
                            <Text style={styles.detailValue}>{student.name}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <View style={styles.detailLeft}>
                                <MaterialCommunityIcons name="card-account-details" size={16} color="#6366F1" />
                                <Text style={styles.detailLabel}>Roll No</Text>
                            </View>
                            <Text style={styles.detailValue}>{student.rollNo}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <View style={styles.detailLeft}>
                                <MaterialCommunityIcons name="school" size={16} color="#8B5CF6" />
                                <Text style={styles.detailLabel}>College</Text>
                            </View>
                            <Text style={styles.detailValue}>{student.collegeName || 'N/A'}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <View style={styles.detailLeft}>
                                <MaterialCommunityIcons name="office-building" size={16} color="#8B5CF6" />
                                <Text style={styles.detailLabel}>Hostel</Text>
                            </View>
                            <Text style={styles.detailValue}>{student.hostelName || 'N/A'}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <View style={styles.detailLeft}>
                                <MaterialCommunityIcons name="cake" size={16} color="#EC4899" />
                                <Text style={styles.detailLabel}>Age</Text>
                            </View>
                            <Text style={styles.detailValue}>{student.age || 'N/A'}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <View style={styles.detailLeft}>
                                <MaterialCommunityIcons name="door-closed" size={16} color="#8B5CF6" />
                                <Text style={styles.detailLabel}>Room</Text>
                            </View>
                            <Text style={styles.detailValue}>{student.room}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <View style={styles.detailLeft}>
                                <MaterialCommunityIcons name="email" size={16} color="#06B6D4" />
                                <Text style={styles.detailLabel}>Official Email</Text>
                            </View>
                            <Text style={styles.detailValue}>{student.email}</Text>
                        </View>
                        {student.personalEmail && (
                            <View style={styles.detailRow}>
                                <View style={styles.detailLeft}>
                                    <MaterialCommunityIcons name="gmail" size={16} color="#DB4437" />
                                    <Text style={styles.detailLabel}>Linked Gmail</Text>
                                </View>
                                <Text style={styles.detailValue}>{student.personalEmail}</Text>
                            </View>
                        )}
                        <View style={styles.detailRow}>
                            <View style={styles.detailLeft}>
                                <MaterialCommunityIcons name="phone" size={16} color="#EC4899" />
                                <Text style={styles.detailLabel}>Phone</Text>
                            </View>
                            <Text style={styles.detailValue}>{student.phone}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <View style={styles.detailLeft}>
                                <MaterialCommunityIcons name="check-circle" size={16} color={getStatusColor(student.status)} />
                                <Text style={styles.detailLabel}>Status</Text>
                            </View>
                            <Text style={[styles.detailValue, { color: getStatusColor(student.status), fontWeight: '700' }]}>
                                {student.status?.toUpperCase() || 'UNKNOWN'}
                            </Text>
                        </View>

                        <View style={styles.detailRow}>
                            <View style={styles.detailLeft}>
                                <MaterialCommunityIcons name="calendar-clock" size={16} color="#64748B" />
                                <Text style={styles.detailLabel}>Joined On</Text>
                            </View>
                            <Text style={styles.detailValue}>
                                {student.createdAt?.seconds
                                    ? new Date(student.createdAt.seconds * 1000).toLocaleString('en-IN', {
                                        day: '2-digit', month: 'short', year: 'numeric',
                                    })
                                    : 'N/A'}
                            </Text>
                        </View>

                        <View style={[styles.detailRow, {
                            borderBottomWidth: 0,
                            backgroundColor: theme === 'dark' ? 'rgba(245, 158, 11, 0.1)' : '#FFFBEB',
                            marginHorizontal: -16,
                            paddingHorizontal: 16,
                            marginTop: 8,
                            paddingVertical: 12,
                            borderTopWidth: 1,
                            borderTopColor: theme === 'dark' ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7',
                        }]}>
                            <View style={styles.detailLeft}>
                                <MaterialCommunityIcons name="key" size={16} color="#F59E0B" />
                                <Text style={[styles.detailLabel, { color: theme === 'dark' ? '#FBBF24' : '#92400E' }]}>Password</Text>
                            </View>
                            <Text style={[styles.detailValue, { fontFamily: 'monospace', color: '#D97706', fontSize: 15 }]}>
                                {student.tempPassword || 'N/A'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.editBtn]}
                            onPress={() => {
                                onClose(); // Close details modal specifically when editing
                                onEdit(student);
                            }}
                        >
                            <MaterialCommunityIcons name="pencil" size={16} color="#fff" />
                            <Text style={styles.actionBtnText}>Edit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionBtn, styles.deleteBtn]}
                            onPress={() => {
                                // Keep modal open or close? Typically confirm dialog appears over it.
                                // Let's rely on the main page's delete handler which shows an alert.
                                onDelete(student.id, student.name, student.room);
                            }}
                        >
                            <MaterialCommunityIcons name="delete" size={16} color="#fff" />
                            <Text style={styles.actionBtnText}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View >
        </View >
    );
}
