import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Dimensions, KeyboardAvoidingView, Platform, RefreshControl, ScrollView, SectionList, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import AlphabetJumpBar from '../../components/AlphabetJumpBar';
import InputField from '../../components/InputField';
import StudentDetailsModal from '../../components/StudentDetailsModal';
import { useAlert } from '../../context/AlertContext';
import { useRefresh } from '../../hooks/useRefresh';
import { API_BASE_URL } from '../../utils/api';
import { isAdmin, useUser } from '../../utils/authUtils';
import { createStudent, deleteStudent, subscribeToStudents, updateStudent } from '../../utils/studentUtils';
import { useTheme } from '../../utils/ThemeContext';



export default function StudentsPage() {
  const { colors, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useUser();
  const router = useRouter();
  const { showAlert } = useAlert();
  const { search, openId } = useLocalSearchParams();

  const styles = React.useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      paddingBottom: 20,
    },
    header: {
      paddingVertical: 24,
      paddingHorizontal: 24,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    backButton: {
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
      textAlign: 'center',
      marginRight: 40,
    },
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
    statsGrid: {
      paddingHorizontal: 20,
      marginBottom: 24,
      gap: 12,
    },
    statsRow: {
      flexDirection: 'row',
      gap: 12,
    },
    heroCard: {
      borderRadius: 24,
      padding: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: '#4F46E5',
      shadowOpacity: 0.25,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
      overflow: 'hidden',
      height: 100,
    },
    miniCard: {
      flex: 1,
      borderRadius: 20,
      padding: 16,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
      overflow: 'hidden',
      height: 110,
      justifyContent: 'space-between',
    },
    cardWatermark: {
      position: 'absolute',
      right: -10,
      bottom: -10,
      opacity: 0.15,
      transform: [{ rotate: '-15deg' }, { scale: 1.5 }],
    },
    heroLabel: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 4,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    heroValue: {
      color: '#fff',
      fontSize: 36,
      fontWeight: '800',
      letterSpacing: -1,
    },
    miniLabel: {
      color: 'rgba(255,255,255,0.9)',
      fontSize: 12,
      fontWeight: '700',
      opacity: 0.9,
    },
    miniValue: {
      color: '#fff',
      fontSize: 28,
      fontWeight: '800',
      marginTop: 4,
    },
    miniHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 8,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      marginBottom: 20,
      backgroundColor: colors.card,
      borderRadius: 16,
      paddingHorizontal: 16,
      height: 56,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOpacity: 0.03,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    searchIcon: {
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      color: colors.text,
      height: '100%',
    },
    listHeader: {
      paddingHorizontal: 20,
      marginBottom: 12,
    },
    listTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 40,
    },
    studentCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      marginBottom: 12,
      shadowColor: colors.textSecondary,
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
      overflow: 'hidden',
    },
    studentCardActive: {
      shadowColor: colors.primary,
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 6,
      transform: [{ scale: 1.01 }],
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: colors.card,
    },
    studentAvatarContainer: {
      marginRight: 14,
      position: 'relative',
    },
    studentAvatar: {
      width: 50,
      height: 50,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.card,
    },
    avatarImage: {
      width: '100%',
      height: '100%',
      borderRadius: 18,
    },
    studentInitial: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '800',
    },
    studentInfo: {
      flex: 1,
    },
    studentName: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    roomRollContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    pill: {
      backgroundColor: theme === 'dark' ? '#1E293B' : '#F1F5F9',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
    },
    detailSmall: {
      fontSize: 11,
      color: colors.textSecondary,
      fontWeight: '700',
    },
    detailSmallLight: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    statusBadge: {
      width: 32,
      height: 32,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    expandedContent: {
      backgroundColor: colors.background,
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    infoSection: {
      marginBottom: 16,
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 12,
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
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 12,
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
    // Modal Styles
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
    keyboardAvoidingView: {
      width: '100%',
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 24,
      width: '90%',
      height: Dimensions.get('window').height * 0.85,
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
      flex: 1,
      padding: 24,
    },
    formSection: {
      marginBottom: 16,
    },
    modalLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 8,
      marginLeft: 4,
    },
    modalInputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme === 'dark' ? '#0F172A' : '#FFFFFF', // Higher contrast background
      borderRadius: 16, // Rounder corners
      borderWidth: 1.5, // Thicker border
      borderColor: theme === 'dark' ? '#334155' : '#E2E8F0',
      height: 56, // Taller touch target
      paddingHorizontal: 16,
      shadowColor: theme === 'dark' ? '#000' : '#64748B',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme === 'dark' ? 0.3 : 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    disabledInputWrapper: {
      backgroundColor: theme === 'dark' ? '#1E293B' : '#F8FAFC',
      borderColor: colors.border,
      opacity: 0.7,
      elevation: 0,
    },
    inputIcon: {
      marginRight: 12,
    },
    modalInput: {
      flex: 1,
      fontSize: 15, // Larger text
      color: colors.text,
      fontWeight: '500',
    },
    disabledInput: {
      color: colors.textSecondary,
    },
    profilePhotoContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    profilePhoto: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: 10,
    },
    photoPlaceholder: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme === 'dark' ? '#1E293B' : '#F1F5F9',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
    },
    changePhotoBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: theme === 'dark' ? '#1E293B' : '#F1F5F9',
    },
    changePhotoText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.primary,
    },
    modalFooter: {
      padding: 24,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      flexDirection: 'row',
      gap: 12,
    },
    modalBtn: {
      flex: 1,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      height: 50,
    },
    cancelBtn: {
      backgroundColor: colors.background,
    },
    cancelBtnText: {
      color: colors.textSecondary,
      fontWeight: '700',
      fontSize: 14,
    },
    saveBtn: {
      overflow: 'hidden',
    },
    saveBtnGradient: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveBtnText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 14,
    },
    // Allotment Form Styles
    card: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 24,
      marginBottom: 20,
      elevation: 4,
      shadowColor: colors.textSecondary,
      shadowOpacity: 0.1,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
    },
    sectionSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 20,
    },
    inputContainer: {
      marginBottom: 16,
    },
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 8,
      marginLeft: 4,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme === 'dark' ? '#1E293B' : '#F8FAFC',
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: colors.border,
      height: 56,
      paddingHorizontal: 16,
    },
    inputWrapperFocused: {
      borderColor: colors.primary,
      backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : '#F0F9FF',
    },
    input: {
      flex: 1,
      fontSize: 15,
      color: colors.text,
      height: '100%',
    },
    errorText: {
      color: '#EF4444',
      fontSize: 12,
      marginTop: 4,
      marginLeft: 4,
    },
    /* divider removed (duplicate) */
    submitButton: {
      marginTop: 12,
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: colors.primary,
      shadowOpacity: 0.3,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
    },
    gradientButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      gap: 10,
    },
    submitButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
  }), [colors, theme]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { refreshing, onRefresh } = useRefresh(async () => {
    // Simulated refresh for real-time list
    await new Promise(resolve => setTimeout(resolve, 1000));
  }, () => {
    // Clear search and selection
    setSearchQuery('');
    setSelectedId(null);
  });

  // Auto-search from params
  React.useEffect(() => {
    if (search) {
      setSearchQuery(search as string);
    }
  }, [search]);

  // Sync viewingStudent when students list updates (for real-time refresh after edit)
  React.useEffect(() => {
    if (viewingStudent && students.length > 0) {
      const updated = students.find(s => String(s.id) === String(viewingStudent.id));
      if (updated) {
        setViewingStudent(updated);
      }
    }
  }, [students]);

  // Auto-expand student if openId is provided and exists in loaded students
  React.useEffect(() => {
    if (openId && students.length > 0) {
      const student = students.find(s => String(s.id) === String(openId));
      if (student) {
        setViewingStudent(student);
        setDetailsModalVisible(true);
      }
    }
  }, [openId, students]);

  // Handle 'action' param to switch tabs
  const { action, openEditId } = useLocalSearchParams();
  React.useEffect(() => {
    if (action === 'allot') {
      // Small delay to ensure pager is ready
      setTimeout(() => {
        handleTabChange(1);
      }, 100);
    }
  }, [action]);

  // Handle 'openEditId' param to auto-open edit modal
  React.useEffect(() => {
    if (openEditId && students.length > 0) {
      // Use loose equality or string conversion to match IDs
      const student = students.find(s => String(s.id) === String(openEditId));
      if (student) {
        // Clear param to avoid re-opening on re-renders if needed, 
        // but for now just opening is fine. router.setParams works but triggers re-render.
        handleEdit(student);
      }
    }
  }, [openEditId, students]);

  // Handle 'openDeleteId' param to auto-trigger delete confirmation
  const { openDeleteId } = useLocalSearchParams();
  React.useEffect(() => {
    if (openDeleteId && students.length > 0) {
      const student = students.find(s => String(s.id) === String(openDeleteId));
      if (student) {
        handleDelete(student.id, student.name, student.roomNo || student.room);
      }
    }
  }, [openDeleteId, students]);



  // Tab State & Pager Ref
  const [activeTab, setActiveTab] = useState(0); // 0: Manage, 1: Allotment
  const pagerRef = useRef<PagerView>(null);

  const handleTabChange = (index: number) => {
    setActiveTab(index);
    pagerRef.current?.setPage(index);
  };

  // Image Picker State
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Permission needed', 'Sorry, we need camera roll permissions to make this work!', [], 'error');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      // Also update editing state if modal is open
      if (isEditModalVisible) {
        setEditImage(result.assets[0].uri);
      }
    }
  };

  const [editImage, setEditImage] = useState<string | null>(null);
  const pickEditImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Permission needed', 'Sorry, we need camera roll permissions!', [], 'error');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setEditImage(result.assets[0].uri);
    }
  };

  // Allotment Form State
  const [fullName, setFullName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [hostelName, setHostelName] = useState('');
  const [dob, setDob] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [room, setRoom] = useState('');
  const [email, setEmail] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');
  const [collegeEmail, setCollegeEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [wifiSSID, setWifiSSID] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [address, setAddress] = useState('');
  const [fatherName, setFatherName] = useState(''); // New Father Name State
  const [fatherPhone, setFatherPhone] = useState(''); // New Father Phone State
  const [motherName, setMotherName] = useState(''); // New Mother Name State
  const [motherPhone, setMotherPhone] = useState(''); // New Mother Phone State
  const [totalFee, setTotalFee] = useState(''); // Renamed from initialDues
  const [feeFrequency, setFeeFrequency] = useState<'Monthly' | 'Semester' | 'Yearly'>('Monthly');
  // Medical Info State
  const [bloodGroup, setBloodGroup] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');

  // Room Configuration States
  const [sharingType, setSharingType] = useState('');
  const [apartmentType, setApartmentType] = useState<string | null>(null);

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [facilities, setFacilities] = useState([
    { name: 'WiFi', icon: 'wifi' as const, status: 'Not Included' },
    { name: 'Laundry', icon: 'washing-machine' as const, status: 'Not Included' },
    { name: 'Cleaning', icon: 'broom' as const, status: 'Not Included' },
    { name: 'Meals', icon: 'food' as const, status: 'Not Included' },
    { name: 'Electricity', icon: 'lightning-bolt' as const, status: 'Not Included' },
    { name: 'Fridge', icon: 'fridge' as const, status: 'Not Included' },
    { name: 'Microwave', icon: 'microwave' as const, status: 'Not Included' },
    { name: 'AC', icon: 'air-conditioner' as const, status: 'Not Included' },
    { name: 'TV', icon: 'television' as const, status: 'Not Included' },
    { name: 'Induction', icon: 'stove' as const, status: 'Not Included' },
    { name: 'Cooler', icon: 'snowflake' as const, status: 'Not Included' },
    { name: 'Fan', icon: 'fan' as const, status: 'Not Included' },
  ]);

  // Edit Modal State
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);

  // View Details Modal State
  const [viewingStudent, setViewingStudent] = useState<any>(null);
  const [isDetailsModalVisible, setDetailsModalVisible] = useState(false);

  // Form State (Edit)
  const [editName, setEditName] = useState('');
  const [editRollNo, setEditRollNo] = useState('');
  const [editRoom, setEditRoom] = useState('');

  // Edit Room Configuration
  const [editSharingType, setEditSharingType] = useState('Single Sharing');
  const [editApartmentType, setEditApartmentType] = useState<string | null>(null);
  const [editFacilities, setEditFacilities] = useState<any[]>([]);

  const [editCollege, setEditCollege] = useState('');
  const [editHostelName, setEditHostelName] = useState('');

  const [editDob, setEditDob] = useState('');
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);
  const [editPhone, setEditPhone] = useState('');

  const [editGoogleEmail, setEditGoogleEmail] = useState('');
  const [editCollegeEmail, setEditCollegeEmail] = useState('');
  const [editStatus, setEditStatus] = useState('active');
  const [editWifiSSID, setEditWifiSSID] = useState('');
  const [editWifiPassword, setEditWifiPassword] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editFatherName, setEditFatherName] = useState(''); // Edit Father Name
  const [editFatherPhone, setEditFatherPhone] = useState(''); // Edit Father Phone
  const [editMotherName, setEditMotherName] = useState(''); // Edit Mother Name
  const [editMotherPhone, setEditMotherPhone] = useState(''); // Edit Mother Phone

  const [editTotalFee, setEditTotalFee] = useState(''); // Add editTotalFee state
  const [editDues, setEditDues] = useState(''); // Edit Dues
  const [editFeeFrequency, setEditFeeFrequency] = useState<'Monthly' | 'Semester' | 'Yearly'>('Monthly');
  // Edit Medical Info State
  const [editBloodGroup, setEditBloodGroup] = useState('');
  const [editMedicalHistory, setEditMedicalHistory] = useState('');
  const [editEmergencyContactName, setEditEmergencyContactName] = useState('');
  const [editEmergencyContactPhone, setEditEmergencyContactPhone] = useState('');

  React.useEffect(() => {
    // Generate a secure random password on mount for allotment (max 8 chars)
    const pwd = Math.random().toString(36).slice(-8); // Exactly 8 chars
    setGeneratedPassword(pwd);
  }, []);

  // Helper to convert DD/MM/YYYY to YYYY-MM-DD for backend
  const toISODate = (dateStr: string) => {
    if (!dateStr) return null;
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    return dateStr;
  };

  // Helper to convert YYYY-MM-DD to DD/MM/YYYY for frontend display
  const fromISODate = (dateStr: string) => {
    if (!dateStr) return '';
    // Check if already in DD/MM/YYYY
    if (dateStr.includes('/') && dateStr.split('/')[0].length === 2) return dateStr;

    // Handle YYYY-MM-DD
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }
    return dateStr;
  };

  const handleAllotmentSubmit = async () => {
    setHasSubmitted(true);



    if (!fullName || !rollNo || !collegeName || !hostelName || !dob || !room || !email || !phone || !address || !fatherName || !fatherPhone || !motherName || !motherPhone || !totalFee) {
      showAlert('Missing details', 'Please fill all mandatory fields (marked red).', [], 'error');
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      showAlert('Invalid Phone', 'Phone number must be exactly 10 digits.', [], 'error');
      return;
    }

    if (generatedPassword.length < 6 || generatedPassword.length > 8) {
      showAlert('Invalid Password', 'Password must be between 6-8 characters.', [], 'error');
      return;
    }

    try {
      /* API Migration */
      /* API Migration */
      /* API Migration - JSON Payload Fix */
      const data = {
        fullName,
        email: email.toLowerCase().trim(),
        password: generatedPassword,
        rollNo,
        collegeName,
        hostelName,
        dob: toISODate(dob) || dob,
        roomNo: room,
        phone,
        googleEmail,
        collegeEmail,
        address,
        fatherName,
        fatherPhone,
        motherName,
        motherPhone,
        totalFee: parseFloat(totalFee) || 0,
        dues: 0,
        feeFrequency,
        bloodGroup,
        medicalHistory,
        emergencyContactName,
        emergencyContactPhone,
        status,
        wifiSSID,
        wifiPassword,
        roomType: apartmentType ? `${apartmentType} ${sharingType}` : sharingType,
        facilities: facilities, // Send as array directly
        profilePhoto: null // JSON cannot send files. Handle upload separately if needed.
      };

      const response = await createStudent(data);

      if (response?.success) {
        const studentId = response.studentId;

        // 2. Upload Profile Photo if exists
        if (image) {
          try {
            console.log("📸 Uploading profile photo for ID:", studentId);
            const photoData = new FormData();
            // @ts-ignore
            photoData.append('profilePhoto', {
              uri: image,
              name: 'profile.jpg',
              type: 'image/jpeg',
            });

            // Use updateStudent to upload photo
            // updateStudent handles FormData correctly via fetch
            await updateStudent(studentId, photoData);
            console.log("✅ Profile photo uploaded");

          } catch (uploadErr) {
            console.error("❌ Photo upload failed:", uploadErr);
            showAlert('Warning', 'Student created but photo upload failed. You can update it later.', [], 'warning');
          }
        }

        // Trigger manual refresh
        const { getAllStudents } = await import('../../utils/studentUtils');
        const updatedData = await getAllStudents();
        setStudents(updatedData);

        showAlert(
          'Success',
          `Student allotted to Room ${room}.\n\nLogin Password: ${generatedPassword}\n\nPlease share this with the student.`,
          [
            {
              text: 'Copy & Close',
              onPress: () => {
                handleTabChange(0);
                setFullName(''); setRollNo(''); setRoom(''); setEmail(''); setPhone(''); setDob('');
                setAddress(''); setFatherName(''); setFatherPhone(''); setMotherName(''); setMotherPhone('');
                setTotalFee(''); setFeeFrequency('Monthly'); setBloodGroup(''); setMedicalHistory(''); setEmergencyContactName('');
                setEmergencyContactPhone(''); setWifiSSID(''); setWifiPassword('');
                setSharingType(''); setApartmentType(null);
                setFacilities((prev) => prev.map((f) => ({ ...f, status: 'Not Included' })));
                setImage(null);
                setHasSubmitted(false);
                setGeneratedPassword(Math.random().toString(36).slice(-8));
              }
            }
          ],
          'success'
        );
      }
    } catch (error: any) {
      showAlert('Error', 'Failed to allot student: ' + (error.response?.data?.error || error.message), [], 'error');
    }
  };

  // Fetch students from Firestore
  React.useEffect(() => {
    // Wait for user to be verified as admin
    if (!isAdmin(user)) return;

    let unsubscribe: () => void;

    const fetchStudents = async () => {
      /* API Migration */
      unsubscribe = subscribeToStudents((data) => {
        setStudents(data);
        setLoading(false);
      });
    };

    fetchStudents();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  const [editEmail, setEditEmail] = useState(''); // Add state for ID/Email editing

  const handleEdit = (student: any) => {
    setEditingStudent(student);
    setEditName(student.name || '');
    setEditEmail(student.email || ''); // This is LOGIN EMAIL
    setEditRollNo(student.rollNo || '');
    setEditRoom(student.room || '');
    setEditCollege(student.collegeName || '');
    setEditHostelName(student.hostelName || '');
    setEditHostelName(student.hostelName || '');
    setEditDob(fromISODate(student.dob) || '');
    setEditPhone(student.phone || '');
    setEditPhone(student.phone || '');
    setEditGoogleEmail(student.googleEmail || '');
    setEditCollegeEmail(student.collegeEmail || '');
    setEditStatus(student.status || 'active');
    setEditWifiSSID(student.wifiSSID || '');
    setEditWifiSSID(student.wifiSSID || '');
    setEditWifiPassword(student.wifiPassword || '');

    // Parse Room Type for Edit
    const rt = student.roomType || '';
    if (rt.includes('BHK') || rt.includes('Studio')) {
      const parts = rt.split(' '); // e.g., "1BHK Double Sharing"
      const foundApt = parts.find((p: string) => p.includes('BHK') || p === 'Studio');
      setEditApartmentType(foundApt || null);
      setEditSharingType(rt.replace(foundApt || '', '').trim() || 'Single Sharing');
    } else {
      setEditApartmentType(null);
      setEditSharingType(rt || 'Single Sharing');
    }

    // Initialize Facilities for Edit
    let parsedFacilities: any[] = [];
    try {
      if (Array.isArray(student.facilities)) {
        parsedFacilities = student.facilities;
      } else if (typeof student.facilities === 'string') {
        parsedFacilities = JSON.parse(student.facilities);
      }
    } catch (e) {
      console.error('Error parsing facilities:', e);
    }

    if (parsedFacilities.length > 0) {
      // Merge with default list to ensure all icons/names are present
      const defaultFacilities = [
        { name: 'WiFi', icon: 'wifi' as const, status: 'Included' },
        { name: 'Laundry', icon: 'washing-machine' as const, status: 'Not Included' },
        { name: 'Cleaning', icon: 'broom' as const, status: 'Included' },
        { name: 'Meals', icon: 'food' as const, status: 'Included' },
        { name: 'Electricity', icon: 'lightning-bolt' as const, status: 'Included' },
        { name: 'Fridge', icon: 'fridge' as const, status: 'Not Included' },
        { name: 'Microwave', icon: 'microwave' as const, status: 'Not Included' },
        { name: 'AC', icon: 'air-conditioner' as const, status: 'Not Included' },
        { name: 'TV', icon: 'television' as const, status: 'Not Included' },
        { name: 'Induction', icon: 'stove' as const, status: 'Not Included' },
        { name: 'Cooler', icon: 'snowflake' as const, status: 'Not Included' },
        { name: 'Fan', icon: 'fan' as const, status: 'Included' },
      ];

      const merged = defaultFacilities.map(defItem => {
        const existing = parsedFacilities.find((f: any) => f.name === defItem.name);
        return existing ? { ...defItem, status: existing.status } : defItem;
      });
      setEditFacilities(merged);
    } else {
      // Default if none
      setEditFacilities([
        { name: 'WiFi', icon: 'wifi' as const, status: 'Included' },
        { name: 'Laundry', icon: 'washing-machine' as const, status: 'Not Included' },
        { name: 'Cleaning', icon: 'broom' as const, status: 'Included' },
        { name: 'Meals', icon: 'food' as const, status: 'Included' },
        { name: 'Electricity', icon: 'lightning-bolt' as const, status: 'Included' },
        { name: 'Fridge', icon: 'fridge' as const, status: 'Not Included' },
        { name: 'Microwave', icon: 'microwave' as const, status: 'Not Included' },
        { name: 'AC', icon: 'air-conditioner' as const, status: 'Not Included' },
        { name: 'TV', icon: 'television' as const, status: 'Not Included' },
        { name: 'Induction', icon: 'stove' as const, status: 'Not Included' },
        { name: 'Cooler', icon: 'snowflake' as const, status: 'Not Included' },
        { name: 'Fan', icon: 'fan' as const, status: 'Included' },
      ]);
    }

    setEditPassword(student.password || student.tempPassword || '');
    setEditAddress(student.address || '');
    setEditFatherName(student.fatherName || '');
    setEditFatherPhone(student.fatherPhone || '');
    setEditMotherName(student.motherName || '');
    setEditMotherPhone(student.motherPhone || '');
    setEditMotherName(student.motherName || '');
    setEditMotherPhone(student.motherPhone || '');
    setEditTotalFee(student.totalFee ? String(student.totalFee) : ''); // Initialize editTotalFee
    setEditDues(student.dues ? String(student.dues) : '');

    setEditFeeFrequency(student.feeFrequency || 'Monthly');
    setEditBloodGroup(student.bloodGroup || '');
    setEditMedicalHistory(student.medicalHistory || '');
    setEditEmergencyContactName(student.emergencyContactName || '');
    setEditEmergencyContactPhone(student.emergencyContactPhone || '');

    // Load existing profile photo if available
    setEditImage(student.profilePhoto ? (student.profilePhoto.startsWith('http') ? student.profilePhoto : `${API_BASE_URL}${student.profilePhoto}`) : null);

    setEditModalVisible(true);
  };



  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const day = selectedDate.getDate().toString().padStart(2, '0');
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const year = selectedDate.getFullYear();
      setDob(`${day}/${month}/${year}`);
    }
  };

  const onEditDateChange = (event: any, selectedDate?: Date) => {
    setShowEditDatePicker(false);
    if (selectedDate) {
      const day = selectedDate.getDate().toString().padStart(2, '0');
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const year = selectedDate.getFullYear();
      setEditDob(`${day}/${month}/${year}`);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingStudent) return;
    setLoading(true);

    try {
      /* API Migration */
      const formData = new FormData();
      formData.append('fullName', editName);
      formData.append('rollNo', editRollNo);
      formData.append('roomNo', editRoom);
      formData.append('collegeName', editCollege);
      formData.append('hostelName', editHostelName);
      formData.append('dob', toISODate(editDob) || editDob);
      formData.append('phone', editPhone);
      formData.append('googleEmail', editGoogleEmail);
      formData.append('collegeEmail', editCollegeEmail);
      formData.append('status', editStatus);
      formData.append('wifiSSID', editWifiSSID);
      formData.append('wifiPassword', editWifiPassword);
      formData.append('address', editAddress);
      formData.append('fatherName', editFatherName);
      formData.append('fatherPhone', editFatherPhone);
      formData.append('motherName', editMotherName);
      formData.append('motherPhone', editMotherPhone);

      formData.append('totalFee', editTotalFee); // Send totalFee
      formData.append('dues', editDues);
      formData.append('feeFrequency', editFeeFrequency);
      formData.append('bloodGroup', editBloodGroup);
      formData.append('medicalHistory', editMedicalHistory);
      formData.append('emergencyContactName', editEmergencyContactName);
      formData.append('emergencyContactPhone', editEmergencyContactPhone);
      formData.append('email', editEmail); // Login Email
      formData.append('password', editPassword);

      // Combine Room Type
      const finalRoomType = editApartmentType ? `${editApartmentType} ${editSharingType}` : editSharingType;
      formData.append('roomType', finalRoomType);
      formData.append('facilities', JSON.stringify(editFacilities));

      if (editImage && editImage !== editingStudent.profilePhoto && !editImage.startsWith('http')) {
        // @ts-ignore
        formData.append('profilePhoto', {
          uri: editImage,
          name: 'profile_edit.jpg',
          type: 'image/jpeg',
        });
      }

      await updateStudent(editingStudent.id, formData);

      // Trigger immediate manual refresh
      const { getAllStudents } = await import('../../utils/studentUtils');
      const updatedData = await getAllStudents();
      setStudents(updatedData);

      showAlert('Success', 'Student details updated successfully.', [], 'success');
      setEditModalVisible(false);
      setEditEmail('');
    } catch (e: any) {
      console.error(e);
      showAlert('Error', 'Failed to update student: ' + (e.response?.data?.error || e.message), [], 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string, name: string, roomNo: string) => {
    showAlert(
      'Confirm Delete',
      `Are you sure you want to remove ${name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => { },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              /* API Migration */
              await deleteStudent(id);
              showAlert('Success', 'Student removed successfully.', [], 'success');
            } catch (error: any) {
              console.error(error);
              showAlert('Error', 'Failed to delete student: ' + (error.response?.data?.error || error.message), [], 'error');
            }
          },
        },
      ],
      'warning'
    );
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.room?.includes(searchQuery) ||
      s.rollNo?.includes(searchQuery)
  ).sort((a, b) => a.name.localeCompare(b.name));

  const activeStudents = students.filter((s) => s.status === 'active').length;

  const sectionListRef = useRef<SectionList>(null);
  const [showAlphabet, setShowAlphabet] = useState(false);
  const hideTimeout = useRef<any>(null);

  const handleScroll = () => {
    setShowAlphabet(true);
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => {
      setShowAlphabet(false);
    }, 1500);
  };

  // Group by first letter
  const sections = React.useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    if (filteredStudents.length === 0) return [];

    filteredStudents.forEach(student => {
      const letter = student.name.charAt(0).toUpperCase();
      if (/[A-Z]/.test(letter)) {
        if (!groups[letter]) groups[letter] = [];
        groups[letter].push(student);
      } else {
        if (!groups['#']) groups['#'] = [];
        groups['#'].push(student);
      }
    });

    const sortedKeys = Object.keys(groups).sort();
    return sortedKeys.map(key => ({
      title: key,
      data: groups[key]
    }));
  }, [filteredStudents]);

  const handleLetterPress = (letter: string) => {
    const sectionIndex = sections.findIndex(s => s.title === letter);
    if (sectionIndex !== -1 && sectionListRef.current) {
      sectionListRef.current.scrollToLocation({
        sectionIndex,
        itemIndex: 0,
        animated: false
      });
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? '#4CAF50' : '#F44336';
  };

  const getStatusIcon = (status: string) => {
    return status === 'active' ? 'check-circle' : 'alert-circle';
  };

  if (!isAdmin(user))
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Access denied.</Text>
      </View>
    );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Edit Modal */}
        {isEditModalVisible && (
          <View style={styles.modalOverlay}>
            <View // Inner KB view handled by modal structure
              style={styles.keyboardAvoidingView}
            >
              <View style={styles.modalContent}>
                <View style={[styles.modalHeader, { paddingTop: insets.top }]}>
                  <Text style={styles.modalTitle}>Edit Student</Text>
                  <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.closeBtn}>
                    <MaterialIcons name="close" size={24} color="#64748B" />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.modalBody} contentContainerStyle={{ paddingBottom: 20 }}>
                  {/* Profile Photo Section */}
                  <View style={styles.profilePhotoContainer}>
                    <View style={styles.photoPlaceholder}>
                      {editImage ? (
                        <Image source={{ uri: editImage }} style={styles.profilePhoto} contentFit="cover" />
                      ) : (
                        <MaterialIcons name="account" size={40} color={colors.textSecondary} />
                      )}
                    </View>
                    <TouchableOpacity style={styles.changePhotoBtn} onPress={pickEditImage}>
                      <MaterialIcons name="camera" size={16} color={colors.primary} />
                      <Text style={styles.changePhotoText}>Change Photo</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.formSection}>
                    <Text style={styles.modalLabel}>Login Email (Official ID)</Text>
                    <View style={styles.modalInputWrapper}>
                      <MaterialIcons name="email-outline" size={20} color="#64748B" style={styles.inputIcon} />
                      <TextInput
                        style={styles.modalInput}
                        value={editEmail}
                        onChangeText={setEditEmail}
                        placeholder="official@college.edu"
                        autoCapitalize="none"
                        keyboardType="email-address"
                      />
                    </View>
                  </View>

                  <View style={styles.formSection}>
                    <Text style={styles.modalLabel}>Login Password</Text>
                    <View style={styles.modalInputWrapper}>
                      <MaterialIcons name="key" size={20} color="#64748B" style={styles.inputIcon} />
                      <TextInput
                        style={styles.modalInput}
                        value={editPassword}
                        onChangeText={setEditPassword}
                        placeholder="Login Password"
                        autoCapitalize="none"
                      />
                    </View>
                  </View>

                  <View style={styles.formSection}>
                    <Text style={styles.modalLabel}>Google Mail (For Login)</Text>
                    <View style={styles.modalInputWrapper}>
                      <MaterialIcons name="google" size={20} color="#64748B" style={styles.inputIcon} />
                      <TextInput
                        style={styles.modalInput}
                        value={editGoogleEmail}
                        onChangeText={setEditGoogleEmail}
                        placeholder="student.google@gmail.com"
                        autoCapitalize="none"
                        keyboardType="email-address"
                      />
                    </View>
                  </View>

                  <View style={styles.formSection}>
                    <Text style={styles.modalLabel}>College Email</Text>
                    <View style={styles.modalInputWrapper}>
                      <MaterialIcons name="email" size={20} color="#64748B" style={styles.inputIcon} />
                      <TextInput
                        style={styles.modalInput}
                        value={editCollegeEmail}
                        onChangeText={setEditCollegeEmail}
                        placeholder="student@college.edu"
                        autoCapitalize="none"
                        keyboardType="email-address"
                      />
                    </View>
                  </View>



                  <View style={styles.formSection}>
                    <Text style={styles.modalLabel}>Full Name</Text>
                    <View style={styles.modalInputWrapper}>
                      <MaterialIcons name="account" size={20} color="#64748B" style={styles.inputIcon} />
                      <TextInput style={styles.modalInput} value={editName} onChangeText={setEditName} placeholder="Full Name" />
                    </View>

                    <View style={{ marginTop: 12 }}>
                      <Text style={styles.modalLabel}>Roll No</Text>
                      <View style={styles.modalInputWrapper}>
                        <MaterialIcons name="identifier" size={20} color="#64748B" style={styles.inputIcon} />
                        <TextInput style={styles.modalInput} value={editRollNo} onChangeText={setEditRollNo} placeholder="Roll No" />
                      </View>
                    </View>

                    <View style={{ marginTop: 12 }}>
                      <Text style={styles.modalLabel}>Room</Text>
                      <View style={styles.modalInputWrapper}>
                        <MaterialIcons name="door" size={20} color="#64748B" style={styles.inputIcon} />
                        <TextInput style={styles.modalInput} value={editRoom} onChangeText={setEditRoom} placeholder="Room" />
                      </View>
                    </View>
                  </View>

                  <View style={styles.formSection}>
                    <Text style={styles.modalLabel}>WiFi SSID</Text>
                    <View style={styles.modalInputWrapper}>
                      <MaterialIcons name="wifi" size={20} color="#64748B" style={styles.inputIcon} />
                      <TextInput
                        style={styles.modalInput}
                        value={editWifiSSID}
                        onChangeText={setEditWifiSSID}
                        placeholder="WiFi SSID"
                        placeholderTextColor="#94A3B8"
                      />
                    </View>
                  </View>

                  <View style={styles.formSection}>
                    <Text style={styles.modalLabel}>WiFi Password</Text>
                    <View style={styles.modalInputWrapper}>
                      <MaterialIcons name="lock" size={20} color="#64748B" style={styles.inputIcon} />
                      <TextInput
                        style={styles.modalInput}
                        value={editWifiPassword}
                        onChangeText={setEditWifiPassword}
                        placeholder="WiFi Password"
                        placeholderTextColor="#94A3B8"
                      />
                    </View>
                  </View>

                  <View style={styles.formSection}>
                    <Text style={styles.modalLabel}>College Name</Text>
                    <View style={styles.modalInputWrapper}>
                      <MaterialIcons name="school" size={20} color="#64748B" style={styles.inputIcon} />
                      <TextInput style={styles.modalInput} value={editCollege} onChangeText={setEditCollege} placeholder="College" />
                    </View>
                  </View>

                  <View style={styles.formSection}>
                    <Text style={styles.modalLabel}>Hostel Name</Text>
                    <View style={styles.modalInputWrapper}>
                      <MaterialIcons name="office-building" size={20} color="#64748B" style={styles.inputIcon} />
                      <TextInput style={styles.modalInput} value={editHostelName} onChangeText={setEditHostelName} placeholder="Hostel" />
                    </View>
                  </View>

                  {/* Room Configuration Section - Edit */}
                  <View style={styles.formSection}>
                    <Text style={[styles.modalLabel, { color: colors.primary, marginBottom: 12 }]}>Room Configuration</Text>

                    <View style={{ marginBottom: 16 }}>
                      <Text style={[styles.label, { fontSize: 13, marginBottom: 8 }]}>Sharing Options</Text>
                      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                        {['Single Sharing', 'Double Sharing', 'Triple Sharing'].map((type) => (
                          <TouchableOpacity
                            key={type}
                            style={{
                              paddingHorizontal: 12,
                              paddingVertical: 8,
                              borderRadius: 12,
                              backgroundColor: editSharingType === type ? colors.primary : (theme === 'dark' ? '#1E293B' : '#F1F5F9'),
                              borderWidth: 1,
                              borderColor: editSharingType === type ? colors.primary : colors.border
                            }}
                            onPress={() => setEditSharingType(type)}
                          >
                            <Text style={{
                              color: editSharingType === type ? '#fff' : colors.textSecondary,
                              fontWeight: '600',
                              fontSize: 12
                            }}>{type}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>

                      <Text style={[styles.label, { fontSize: 13, marginBottom: 8 }]}>BHK / Studio Options (Optional)</Text>
                      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                        {['1BHK', '2BHK', '3BHK', 'Studio'].map((type) => (
                          <TouchableOpacity
                            key={type}
                            style={{
                              paddingHorizontal: 16,
                              paddingVertical: 8,
                              borderRadius: 12,
                              backgroundColor: editApartmentType === type ? colors.primary : (theme === 'dark' ? '#1E293B' : '#F1F5F9'),
                              borderWidth: 1,
                              borderColor: editApartmentType === type ? colors.primary : colors.border
                            }}
                            onPress={() => setEditApartmentType(editApartmentType === type ? null : type)}
                          >
                            <Text style={{
                              color: editApartmentType === type ? '#fff' : colors.textSecondary,
                              fontWeight: '600',
                              fontSize: 12
                            }}>{type}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <Text style={[styles.label, { marginTop: 4, marginBottom: 8 }]}>Facilities & Amenities</Text>
                    <View style={{ marginTop: 0 }}>
                      {editFacilities.map((fac, idx) => (
                        <View key={fac.name} style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingVertical: 10,
                          borderBottomWidth: idx === editFacilities.length - 1 ? 0 : 1,
                          borderBottomColor: colors.border
                        }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <MaterialIcons name={fac.icon} size={20} color={colors.primary} />
                            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>{fac.name}</Text>
                          </View>
                          <View style={{ flexDirection: 'row', gap: 6 }}>
                            <TouchableOpacity
                              onPress={() => {
                                const f = [...editFacilities];
                                f[idx].status = 'Included';
                                setEditFacilities(f);
                              }}
                              style={{
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 8,
                                backgroundColor: fac.status === 'Included' ? colors.primary : (theme === 'dark' ? '#1E293B' : '#F1F5F9'),
                                borderWidth: 1,
                                borderColor: fac.status === 'Included' ? colors.primary : colors.border
                              }}>
                              <Text style={{ fontSize: 11, fontWeight: '700', color: fac.status === 'Included' ? '#fff' : colors.textSecondary }}>Included</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => {
                                const f = [...editFacilities];
                                f[idx].status = 'Not Included';
                                setEditFacilities(f);
                              }}
                              style={{
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 8,
                                backgroundColor: fac.status === 'Not Included' ? colors.primary : (theme === 'dark' ? '#1E293B' : '#F1F5F9'),
                                borderWidth: 1,
                                borderColor: fac.status === 'Not Included' ? colors.primary : colors.border
                              }}>
                              <Text style={{ fontSize: 11, fontWeight: '700', color: fac.status === 'Not Included' ? '#fff' : colors.textSecondary }}>Not Included</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalLabel}>Date of Birth</Text>
                      <TouchableOpacity
                        onPress={() => setShowEditDatePicker(true)}
                        style={styles.modalInputWrapper}
                      >
                        <MaterialIcons name="calendar-account" size={20} color="#64748B" style={styles.inputIcon} />
                        <Text style={[styles.modalInput, { color: editDob ? colors.text : '#94A3B8', paddingVertical: 14 }]}>
                          {editDob || 'DD/MM/YYYY'}
                        </Text>
                      </TouchableOpacity>
                      {showEditDatePicker && (
                        <DateTimePicker
                          value={editDob && editDob.includes('/') ? new Date(editDob.split('/').reverse().join('-')) : new Date()}
                          mode="date"
                          display="default"
                          onChange={onEditDateChange}
                          maximumDate={new Date()}
                        />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalLabel}>Phone</Text>
                      <View style={styles.modalInputWrapper}>
                        <MaterialIcons name="phone" size={20} color="#64748B" style={styles.inputIcon} />
                        <TextInput style={styles.modalInput} value={editPhone} onChangeText={setEditPhone} keyboardType="phone-pad" placeholder="Phone" />
                      </View>
                    </View>
                  </View>

                  <View style={styles.formSection}>
                    <Text style={styles.modalLabel}>Address</Text>
                    <View style={styles.modalInputWrapper}>
                      <MaterialIcons name="map-marker" size={20} color="#64748B" style={styles.inputIcon} />
                      <TextInput style={styles.modalInput} value={editAddress} onChangeText={setEditAddress} placeholder="Permanent Address" multiline />
                    </View>
                  </View>

                  <View style={{ marginTop: 12 }}>
                    <Text style={styles.modalLabel}>Father's Name</Text>
                    <View style={styles.modalInputWrapper}>
                      <MaterialIcons name="account-tie" size={20} color="#64748B" style={styles.inputIcon} />
                      <TextInput style={styles.modalInput} value={editFatherName} onChangeText={setEditFatherName} placeholder="Father Name" />
                    </View>
                  </View>

                  <View style={{ marginTop: 12 }}>
                    <Text style={styles.modalLabel}>Father's Phone</Text>
                    <View style={styles.modalInputWrapper}>
                      <MaterialIcons name="phone" size={20} color="#64748B" style={styles.inputIcon} />
                      <TextInput style={styles.modalInput} value={editFatherPhone} onChangeText={setEditFatherPhone} placeholder="Phone" keyboardType="phone-pad" />
                    </View>
                  </View>

                  <View style={{ marginTop: 12 }}>
                    <Text style={styles.modalLabel}>Mother's Name</Text>
                    <View style={styles.modalInputWrapper}>
                      <MaterialIcons name="face-woman" size={20} color="#64748B" style={styles.inputIcon} />
                      <TextInput style={styles.modalInput} value={editMotherName} onChangeText={setEditMotherName} placeholder="Mother Name" />
                    </View>
                  </View>

                  <View style={{ marginTop: 12 }}>
                    <Text style={styles.modalLabel}>Mother's Phone</Text>
                    <View style={styles.modalInputWrapper}>
                      <MaterialIcons name="phone" size={20} color="#64748B" style={styles.inputIcon} />
                      <TextInput style={styles.modalInput} value={editMotherPhone} onChangeText={setEditMotherPhone} placeholder="Phone" keyboardType="phone-pad" />
                    </View>
                  </View>

                  <View style={styles.formSection}>
                    <Text style={styles.modalLabel}>Total Fee (Record Only)</Text>
                    <View style={styles.modalInputWrapper}>
                      <MaterialIcons name="cash-multiple" size={20} color="#64748B" style={styles.inputIcon} />
                      <TextInput style={styles.modalInput} value={editTotalFee} onChangeText={setEditTotalFee} keyboardType="numeric" placeholder="Total Fee Amount" />
                    </View>

                    <Text style={[styles.modalLabel, { marginTop: 12 }]}>Current Dues</Text>
                    <View style={styles.modalInputWrapper}>
                      <MaterialIcons name="cash-register" size={20} color="#64748B" style={styles.inputIcon} />
                      <TextInput style={styles.modalInput} value={editDues} onChangeText={setEditDues} keyboardType="numeric" placeholder="Current Dues Amount" />
                    </View>

                    {/* Fee Frequency Selector */}
                    <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
                      {(['Monthly', 'Semester', 'Yearly'] as const).map((freq) => (
                        <TouchableOpacity
                          key={freq}
                          style={{
                            flex: 1,
                            paddingVertical: 8,
                            backgroundColor: editFeeFrequency === freq ? colors.primary : (theme === 'dark' ? '#1E293B' : '#F1F5F9'),
                            borderRadius: 8,
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: editFeeFrequency === freq ? colors.primary : colors.border
                          }}
                          onPress={() => setEditFeeFrequency(freq)}
                        >
                          <Text style={{
                            fontSize: 12,
                            fontWeight: '600',
                            color: editFeeFrequency === freq ? '#fff' : colors.textSecondary
                          }}>
                            {freq}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.formSection}>
                    <Text style={[styles.modalLabel, { color: colors.primary }]}>Medical Info (Optional)</Text>

                    <View>
                      <Text style={styles.modalLabel}>Blood Group</Text>
                      <View style={styles.modalInputWrapper}>
                        <MaterialIcons name="water" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                        <TextInput style={styles.modalInput} value={editBloodGroup} onChangeText={setEditBloodGroup} placeholder="e.g. O+" />
                      </View>
                    </View>

                    <View style={{ marginTop: 12 }}>
                      <Text style={styles.modalLabel}>Emergency Contact Name</Text>
                      <View style={styles.modalInputWrapper}>
                        <MaterialIcons name="account-alert" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                        <TextInput style={styles.modalInput} value={editEmergencyContactName} onChangeText={setEditEmergencyContactName} placeholder="Contact Name" />
                      </View>
                    </View>


                    <View style={{ marginTop: 12 }}>
                      <Text style={styles.modalLabel}>Emergency Phone</Text>
                      <View style={styles.modalInputWrapper}>
                        <MaterialIcons name="phone-alert" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                        <TextInput style={styles.modalInput} value={editEmergencyContactPhone} onChangeText={setEditEmergencyContactPhone} placeholder="Phone" keyboardType="phone-pad" />
                      </View>
                    </View>

                    <View style={{ marginTop: 12 }}>
                      <Text style={styles.modalLabel}>Medical History / Allergies</Text>
                      <View style={[styles.modalInputWrapper, { height: 'auto', minHeight: 80, paddingVertical: 8, alignItems: 'flex-start' }]}>
                        <MaterialIcons name="medical-bag" size={20} color={colors.textSecondary} style={[styles.inputIcon, { marginTop: 4 }]} />
                        <TextInput
                          style={[styles.modalInput, { textAlignVertical: 'top' }]}
                          value={editMedicalHistory}
                          onChangeText={setEditMedicalHistory}
                          placeholder="Any known allergies or conditions..."
                          multiline
                          numberOfLines={3}
                        />
                      </View>
                    </View>
                  </View>

                  <View style={styles.formSection}>
                    <Text style={styles.modalLabel}>Status</Text>
                    <View style={[styles.modalInputWrapper, { justifyContent: 'space-between', paddingRight: 8 }]}>
                      <Text style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: editStatus === 'active' ? '#16A34A' : '#EF4444'
                      }}>
                        {editStatus === 'active' ? 'Active' : 'Inactive'}
                      </Text>
                      <Switch
                        trackColor={{ false: "#FEE2E2", true: "#DCFCE7" }}
                        thumbColor={editStatus === 'active' ? "#16A34A" : "#EF4444"}
                        ios_backgroundColor="#FEE2E2"
                        onValueChange={(val) => setEditStatus(val ? 'active' : 'inactive')}
                        value={editStatus === 'active'}
                      />
                    </View>
                  </View>

                </ScrollView>
                <View style={styles.modalFooter}>
                  <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setEditModalVisible(false)}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={handleSaveEdit}>
                    <LinearGradient
                      colors={['#004e92', '#000428']}
                      style={styles.saveBtnGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.saveBtnText}>Save Changes</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View >
          </View >
        )
        }

        {/* View Details Modal */}
        <StudentDetailsModal
          visible={isDetailsModalVisible}
          student={viewingStudent}
          onClose={() => setDetailsModalVisible(false)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <View style={{ flex: 1 }}>
          <LinearGradient
            colors={['#000428', '#004e92']}
            style={[styles.header, { paddingTop: 24 + insets.top }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <MaterialIcons name="chevron-left" size={32} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>{activeTab === 0 ? 'Manage Students' : 'Student Allotment'}</Text>
            </View>
          </LinearGradient>



          <View style={styles.navBar}>
            <TouchableOpacity
              style={[styles.navItem, activeTab === 0 && styles.navItemActive]}
              onPress={() => handleTabChange(0)}
            >
              <MaterialIcons name="account-group" size={20} color={activeTab === 0 ? colors.primary : colors.textSecondary} />
              <Text style={[styles.navItemLabel, activeTab === 0 && styles.navItemLabelActive]}>Manage Students</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navItem, activeTab === 1 && styles.navItemActive]}
              onPress={() => handleTabChange(1)}
            >
              <MaterialIcons name="account-plus" size={20} color={activeTab === 1 ? colors.primary : colors.textSecondary} />
              <Text style={[styles.navItemLabel, activeTab === 1 && styles.navItemLabelActive]}>Student Allotment</Text>
            </TouchableOpacity>
          </View>

          <PagerView
            ref={pagerRef}
            style={{ flex: 1 }}
            initialPage={0}
            onPageSelected={(e) => setActiveTab(e.nativeEvent.position)}
          >
            {/* PAGE 0: MANAGE STUDENTS LIST */}
            <View key="0" style={{ flex: 1 }}>
              <View style={{ flex: 1, position: 'relative' }}>
                <SectionList
                  ref={sectionListRef}
                  onScroll={handleScroll}
                  scrollEventThrottle={16}
                  sections={sections}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.listContent}
                  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                  showsVerticalScrollIndicator={false}
                  renderSectionHeader={({ section: { title } }) => (
                    <View style={{ backgroundColor: colors.background, paddingVertical: 8, paddingHorizontal: 20 }}>
                      <Text style={{ fontWeight: 'bold', color: colors.primary }}>{title}</Text>
                    </View>
                  )}
                  ListHeaderComponent={
                    <View>
                      <View style={styles.statsGrid}>
                        {/* Hero Card: Total Students */}
                        <LinearGradient
                          colors={['#4F46E5', '#312E81']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.heroCard}
                        >
                          <View>
                            <Text style={styles.heroLabel}>Total Students</Text>
                            <Text style={styles.heroValue}>{students.length}</Text>
                          </View>
                          <MaterialIcons name="account-group" size={48} color="rgba(255,255,255,0.9)" />
                          <View style={styles.cardWatermark}>
                            <MaterialIcons name="account-group" size={100} color="#fff" />
                          </View>
                        </LinearGradient>

                        <View style={styles.statsRow}>
                          {/* Active Students */}
                          <LinearGradient
                            colors={['#059669', '#064E3B']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.miniCard}
                          >
                            <View style={styles.miniHeader}>
                              <MaterialIcons name="check-circle" size={18} color="rgba(255,255,255,0.9)" />
                              <Text style={styles.miniLabel}>Active</Text>
                            </View>
                            <Text style={styles.miniValue}>{activeStudents}</Text>
                            <View style={styles.cardWatermark}>
                              <MaterialIcons name="check-circle" size={80} color="#fff" />
                            </View>
                          </LinearGradient>

                          {/* Rooms Occupied */}
                          <LinearGradient
                            colors={['#7E22CE', '#581C87']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.miniCard}
                          >
                            <View style={styles.miniHeader}>
                              <MaterialIcons name="door-closed" size={18} color="rgba(255,255,255,0.9)" />
                              <Text style={styles.miniLabel}>Rooms</Text>
                            </View>
                            <Text style={styles.miniValue}>{students.length}</Text>
                            <View style={styles.cardWatermark}>
                              <MaterialIcons name="door-closed" size={80} color="#fff" />
                            </View>
                          </LinearGradient>
                        </View>
                      </View>

                      <View style={styles.searchContainer}>
                        <MaterialIcons name="magnify" size={24} color="#94A3B8" style={styles.searchIcon} />
                        <TextInput
                          style={styles.searchInput}
                          placeholder="Search by name, room, or roll no..."
                          placeholderTextColor="#94A3B8"
                          value={searchQuery}
                          onChangeText={setSearchQuery}
                        />
                      </View>

                      <View style={styles.listHeader}>
                        <Text style={styles.listTitle}>
                          {filteredStudents.length} Student{filteredStudents.length !== 1 ? 's' : ''} Found
                        </Text>
                      </View>
                    </View>
                  }
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.studentCard,
                        // selectedId === item.id && styles.studentCardActive, // No longer highlighting in place
                      ]}
                      onPress={() => {
                        setViewingStudent(item);
                        setDetailsModalVisible(true);
                      }}
                    >
                      <View style={styles.cardHeader}>
                        <View style={styles.studentAvatarContainer}>
                          <LinearGradient
                            colors={['#004e92', '#000428']}
                            style={styles.studentAvatar}
                          >
                            <Text style={styles.studentInitial}>
                              {item.profilePhoto ? (
                                <Image source={{ uri: `${API_BASE_URL}${item.profilePhoto}` }} style={styles.avatarImage} contentFit="cover" />
                              ) : (
                                item.name
                                  .split(' ')
                                  .map((n: string) => n[0])
                                  .join('')
                                  .toUpperCase()
                              )}
                            </Text>
                          </LinearGradient>
                        </View>
                        <View style={styles.studentInfo}>
                          <Text style={styles.studentName}>{item.name}</Text>
                          <View style={styles.roomRollContainer}>
                            <View style={styles.pill}>
                              <Text style={styles.detailSmall}>Room {item.room}</Text>
                            </View>
                            <Text style={styles.detailSmallLight}>• {item.rollNo}</Text>
                          </View>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                          <MaterialIcons name={getStatusIcon(item.status)} size={18} color={getStatusColor(item.status)} />
                        </View>
                      </View>
                    </TouchableOpacity>
                  )}
                />
                <AlphabetJumpBar
                  onLetterPress={handleLetterPress}
                  visible={showAlphabet}
                  alphabets={sections.map(s => s.title)}
                />
              </View>
            </View>

            {/* PAGE 1: STUDENT ALLOTMENT FORM */}
            <View key="1" style={{ flex: 1 }}>
              <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                {/* Form Card */}
                <View style={styles.card}>
                  <View style={{ marginBottom: 24 }}>
                    <Text style={styles.sectionTitle}>Student Details</Text>
                    <Text style={styles.sectionSubtitle}>Enter the information below to allot a room.</Text>
                  </View>

                  {/* Profile Photo Input */}
                  <View style={[styles.profilePhotoContainer, { marginBottom: 24 }]}>
                    <TouchableOpacity onPress={pickImage} style={styles.photoPlaceholder}>
                      {image ? (
                        <Image source={{ uri: image }} style={styles.profilePhoto} contentFit="cover" />
                      ) : (
                        <MaterialIcons name="camera-plus" size={32} color={colors.textSecondary} />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={pickImage}>
                      <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 13 }}>
                        {image ? 'Change Photo' : 'Upload Profile Photo'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Generated Password Input */}
                  <View style={{ marginBottom: 16 }}>
                    <InputField
                      label="Login Password"
                      icon="key-variant"
                      value={generatedPassword}
                      onChangeText={setGeneratedPassword}
                      placeholder="Auto-generated password"
                      required
                      hasSubmitted={hasSubmitted}
                    />
                    <Text style={{ fontSize: 12, color: '#64748B', marginLeft: 4, marginTop: -8, marginBottom: 12 }}>
                      Auto-generated (8 characters max). You can edit if needed.
                    </Text>
                  </View>

                  <View style={styles.divider} />

                  {/* Room Configuration Section */}
                  <View style={{ marginBottom: 24 }}>
                    <Text style={styles.sectionTitle}>Room Configuration</Text>

                    <View style={styles.inputContainer}>
                      <Text style={[styles.label, { fontSize: 13, marginBottom: 8 }]}>Sharing Options</Text>
                      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                        {['Single Sharing', 'Double Sharing', 'Triple Sharing'].map((type) => (
                          <TouchableOpacity
                            key={type}
                            style={{
                              paddingHorizontal: 12,
                              paddingVertical: 8,
                              borderRadius: 12,
                              backgroundColor: sharingType === type ? colors.primary : (theme === 'dark' ? '#1E293B' : '#F1F5F9'),
                              borderWidth: 1,
                              borderColor: sharingType === type ? colors.primary : colors.border
                            }}
                            onPress={() => setSharingType(type)}
                          >
                            <Text style={{
                              color: sharingType === type ? '#fff' : colors.textSecondary,
                              fontWeight: '600',
                              fontSize: 12
                            }}>{type}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>

                      <Text style={[styles.label, { fontSize: 13, marginBottom: 8 }]}>BHK / Studio Options (Optional)</Text>
                      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                        {['1BHK', '2BHK', '3BHK', 'Studio'].map((type) => (
                          <TouchableOpacity
                            key={type}
                            style={{
                              paddingHorizontal: 16,
                              paddingVertical: 8,
                              borderRadius: 12,
                              backgroundColor: apartmentType === type ? colors.primary : (theme === 'dark' ? '#1E293B' : '#F1F5F9'),
                              borderWidth: 1,
                              borderColor: apartmentType === type ? colors.primary : colors.border
                            }}
                            onPress={() => setApartmentType(apartmentType === type ? null : type)}
                          >
                            <Text style={{
                              color: apartmentType === type ? '#fff' : colors.textSecondary,
                              fontWeight: '600',
                              fontSize: 12
                            }}>{type}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <Text style={[styles.label, { marginTop: 12 }]}>Facilities & Amenities</Text>
                    <View style={{ marginTop: 8 }}>
                      {facilities.map((fac, idx) => (
                        <View key={fac.name} style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingVertical: 10,
                          borderBottomWidth: idx === facilities.length - 1 ? 0 : 1,
                          borderBottomColor: colors.border
                        }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <MaterialIcons name={fac.icon} size={20} color={colors.primary} />
                            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>{fac.name}</Text>
                          </View>
                          <View style={{ flexDirection: 'row', gap: 6 }}>
                            <TouchableOpacity
                              onPress={() => {
                                const f = [...facilities];
                                f[idx].status = 'Included';
                                setFacilities(f);
                              }}
                              style={{
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 8,
                                backgroundColor: fac.status === 'Included' ? colors.primary : (theme === 'dark' ? '#1E293B' : '#F1F5F9'),
                                borderWidth: 1,
                                borderColor: fac.status === 'Included' ? colors.primary : colors.border
                              }}>
                              <Text style={{ fontSize: 11, fontWeight: '700', color: fac.status === 'Included' ? '#fff' : colors.textSecondary }}>Included</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => {
                                const f = [...facilities];
                                f[idx].status = 'Not Included';
                                setFacilities(f);
                              }}
                              style={{
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 8,
                                backgroundColor: fac.status === 'Not Included' ? colors.primary : (theme === 'dark' ? '#1E293B' : '#F1F5F9'),
                                borderWidth: 1,
                                borderColor: fac.status === 'Not Included' ? colors.primary : colors.border
                              }}>
                              <Text style={{ fontSize: 11, fontWeight: '700', color: fac.status === 'Not Included' ? '#fff' : colors.textSecondary }}>Not Included</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <InputField
                    label="Full Name"
                    icon="account"
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="e.g. John Doe"
                    required
                    hasSubmitted={hasSubmitted}
                  />

                  <InputField
                    label="Roll No"
                    icon="identifier"
                    value={rollNo}
                    onChangeText={setRollNo}
                    placeholder="e.g. CS-24-001"
                    required
                    hasSubmitted={hasSubmitted}
                  />

                  <InputField
                    label="Room"
                    icon="door"
                    value={room}
                    onChangeText={setRoom}
                    placeholder="e.g. 101"
                    required
                    hasSubmitted={hasSubmitted}
                  />

                  <InputField
                    label="Login Email (Auth ID)"
                    icon="email-lock"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="student@college.edu"
                    keyboardType="email-address"
                    required
                    hasSubmitted={hasSubmitted}
                  />

                  <InputField
                    label="Google Mail (For Login Sync)"
                    icon="google"
                    value={googleEmail}
                    onChangeText={setGoogleEmail}
                    placeholder="student.google@gmail.com"
                    keyboardType="email-address"
                    hasSubmitted={hasSubmitted}
                  />

                  <InputField
                    label="College Email"
                    icon="email"
                    value={collegeEmail}
                    onChangeText={setCollegeEmail}
                    placeholder="student@college.edu"
                    keyboardType="email-address"
                    hasSubmitted={hasSubmitted}
                  />

                  <InputField
                    label="Phone Number"
                    icon="phone"
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="10-digit mobile number"
                    keyboardType="phone-pad"
                    required
                    hasSubmitted={hasSubmitted}
                  />

                  <InputField
                    label="Address"
                    icon="map-marker"
                    value={address}
                    onChangeText={setAddress}
                    placeholder="Permanent Address"
                    required
                    hasSubmitted={hasSubmitted}
                  />

                  <InputField
                    label="Father Name"
                    icon="account-tie"
                    value={fatherName}
                    onChangeText={setFatherName}
                    placeholder="Father Name"
                    required
                    hasSubmitted={hasSubmitted}
                  />

                  <InputField
                    label="Father Phone"
                    icon="phone"
                    value={fatherPhone}
                    onChangeText={setFatherPhone}
                    placeholder="10-digit phone number"
                    keyboardType="phone-pad"
                    required
                    hasSubmitted={hasSubmitted}
                  />

                  <InputField
                    label="Mother Name"
                    icon="face-woman"
                    value={motherName}
                    onChangeText={setMotherName}
                    placeholder="Mother Name"
                    required
                    hasSubmitted={hasSubmitted}
                  />

                  <InputField
                    label="Mother Phone"
                    icon="phone"
                    value={motherPhone}
                    onChangeText={setMotherPhone}
                    placeholder="10-digit phone number"
                    keyboardType="phone-pad"
                    required
                    hasSubmitted={hasSubmitted}
                  />

                  <InputField
                    label="Total Fee (Record Only)"
                    icon="cash-multiple"
                    value={totalFee}
                    onChangeText={setTotalFee}
                    placeholder="e.g. 15000"
                    keyboardType="numeric"
                    required
                    hasSubmitted={hasSubmitted}
                  />

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Fee Frequency</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {['Monthly', 'Semester', 'Yearly'].map((type) => (
                        <TouchableOpacity
                          key={type}
                          onPress={() => setFeeFrequency(type as any)}
                          style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingVertical: 12,
                            borderRadius: 12,
                            backgroundColor: feeFrequency === type
                              ? (theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : '#EFF6FF')
                              : (theme === 'dark' ? '#1E293B' : '#F8FAFC'),
                            borderWidth: 1,
                            borderColor: feeFrequency === type ? colors.primary : colors.border
                          }}
                        >
                          <Text style={{
                            color: feeFrequency === type ? colors.primary : colors.textSecondary,
                            fontWeight: feeFrequency === type ? '700' : '500',
                            fontSize: 13
                          }}>{type}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.inputContainer}>
                        <Text style={styles.label}>Date of Birth <Text style={{ color: '#EF4444' }}>*</Text></Text>
                        <TouchableOpacity
                          onPress={() => setShowDatePicker(true)}
                          style={[styles.inputWrapper, { paddingVertical: 12, justifyContent: 'center' }]}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <MaterialIcons name="calendar-account" size={20} color={colors.textSecondary} style={{ marginRight: 10 }} />
                            <Text style={{ color: dob ? colors.text : colors.textSecondary, fontSize: 16 }}>
                              {dob || 'Select Date'}
                            </Text>
                          </View>
                        </TouchableOpacity>
                        {showDatePicker && (
                          <DateTimePicker
                            value={dob && dob.includes('/') ? new Date(dob.split('/').reverse().join('-')) : new Date()}
                            mode="date"
                            display="default"
                            onChange={onDateChange}
                            maximumDate={new Date()}
                          />
                        )}
                      </View>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.inputContainer}>
                        <Text style={styles.label}>Status</Text>
                        <View style={styles.inputWrapper}>
                          <Switch
                            trackColor={{ false: "#FEE2E2", true: "#DCFCE7" }}
                            thumbColor={status === 'active' ? "#16A34A" : "#EF4444"}
                            ios_backgroundColor="#FEE2E2"
                            onValueChange={(val) => setStatus(val ? 'active' : 'inactive')}
                            value={status === 'active'}
                          />
                          <Text style={{
                            marginLeft: 12,
                            fontSize: 14,
                            fontWeight: '600',
                            color: status === 'active' ? '#16A34A' : '#EF4444'
                          }}>
                            {status === 'active' ? 'Active' : 'Inactive'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <Text style={[styles.sectionTitle, { color: colors.primary }]}>Medical Information (Optional)</Text>

                  <InputField
                    label="Blood Group"
                    icon="water"
                    value={bloodGroup}
                    onChangeText={setBloodGroup}
                    placeholder="e.g. O+, A+, B+, AB+"
                    hasSubmitted={hasSubmitted}
                  />

                  <InputField
                    label="Emergency Contact Name"
                    icon="account-alert"
                    value={emergencyContactName}
                    onChangeText={setEmergencyContactName}
                    placeholder="Emergency Contact Name"
                    hasSubmitted={hasSubmitted}
                  />

                  <InputField
                    label="Emergency Phone"
                    icon="phone-alert"
                    value={emergencyContactPhone}
                    onChangeText={setEmergencyContactPhone}
                    placeholder="10-digit emergency contact number"
                    keyboardType="phone-pad"
                    hasSubmitted={hasSubmitted}
                  />

                  <InputField
                    label="Medical History / Allergies"
                    icon="medical-bag"
                    value={medicalHistory}
                    onChangeText={setMedicalHistory}
                    placeholder="Any known allergies, medical conditions, or medications"
                    hasSubmitted={hasSubmitted}
                  />

                  <View style={styles.divider} />

                  <Text style={styles.sectionTitle}>College Info</Text>

                  <InputField
                    label="WiFi SSID"
                    icon="wifi"
                    value={wifiSSID}
                    onChangeText={setWifiSSID}
                    placeholder="e.g. Hostel_Wifi_101"
                    hasSubmitted={hasSubmitted}
                  />

                  <InputField
                    label="WiFi Password"
                    icon="lock"
                    value={wifiPassword}
                    onChangeText={setWifiPassword}
                    placeholder="WiFi Password"
                    hasSubmitted={hasSubmitted}
                  />

                  <InputField
                    label="College Name"
                    icon="school"
                    value={collegeName}
                    onChangeText={setCollegeName}
                    placeholder="e.g. Engineering College"
                    required
                    hasSubmitted={hasSubmitted}
                  />

                  <InputField
                    label="Hostel Name"
                    icon="office-building"
                    value={hostelName}
                    onChangeText={setHostelName}
                    placeholder="e.g. Block A"
                    required
                    hasSubmitted={hasSubmitted}
                  />

                  <TouchableOpacity style={styles.submitButton} onPress={handleAllotmentSubmit}>
                    <LinearGradient
                      colors={['#004e92', '#000428']}
                      style={styles.gradientButton}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.submitButtonText}>Confirm Allotment</Text>
                      <MaterialIcons name="check-circle-outline" size={20} color="#fff" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
                <View style={{ height: 40 }} />

              </ScrollView>
            </View>
          </PagerView>
        </View>


      </KeyboardAvoidingView >

    </SafeAreaView >
  );
}



