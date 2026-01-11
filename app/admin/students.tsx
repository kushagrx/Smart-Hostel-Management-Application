import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, FlatList, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import InputField from '../../components/InputField';
import StudentDetailsModal from '../../components/StudentDetailsModal';
import { useAlert } from '../../context/AlertContext';
import { isAdmin, useUser } from '../../utils/authUtils';
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
      marginBottom: 16,
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
    },
    studentAvatar: {
      width: 50,
      height: 50,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
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
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
      marginBottom: 8,
      marginLeft: 4,
    },
    modalInputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme === 'dark' ? '#1E293B' : '#F8FAFC',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      height: 50,
      paddingHorizontal: 16,
    },
    disabledInputWrapper: {
      backgroundColor: theme === 'dark' ? '#1E293B' : '#F1F5F9',
      borderColor: colors.border,
      opacity: 0.8,
    },
    inputIcon: {
      marginRight: 10,
    },
    modalInput: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
      fontWeight: '600',
    },
    disabledInput: {
      color: colors.textSecondary,
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

  const [refreshing, setRefreshing] = useState(false);

  // Simulated refresh for real-time list
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // Auto-search from params
  React.useEffect(() => {
    if (search) {
      setSearchQuery(search as string);
    }
  }, [search]);

  // Auto-expand student if openId is provided and exists in loaded students
  React.useEffect(() => {
    if (openId && students.length > 0) {
      const student = students.find(s => s.id === openId);
      if (student) {
        setViewingStudent(student);
        setDetailsModalVisible(true);
      }
    }
  }, [openId, students]);



  // Tab State
  const [activeTab, setActiveTab] = useState<'list' | 'allotment'>('list');

  // Allotment Form State
  const [fullName, setFullName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [hostelName, setHostelName] = useState('');
  const [age, setAge] = useState('');
  const [room, setRoom] = useState('');
  const [email, setEmail] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

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
  const [editCollege, setEditCollege] = useState('');
  const [editHostelName, setEditHostelName] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const [editPersonalEmail, setEditPersonalEmail] = useState('');
  const [editStatus, setEditStatus] = useState('active');
  const [editPassword, setEditPassword] = useState('');

  React.useEffect(() => {
    // Generate a secure random password on mount for allotment
    const pwd = Math.random().toString(36).slice(-8); // 8 chars
    setGeneratedPassword(pwd);
  }, []);

  const handleAllotmentSubmit = async () => {
    setHasSubmitted(true);

    if (!fullName || !rollNo || !collegeName || !hostelName || !age || !room || !email || !phone) {
      showAlert('Missing details', 'Please fill all mandatory fields (marked red).', [], 'error');
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      showAlert('Invalid Phone', 'Phone number must be exactly 10 digits.', [], 'error');
      return;
    }

    if (generatedPassword.length < 6) {
      showAlert('Invalid Password', 'Password must be at least 6 characters long.', [], 'error');
      return;
    }

    try {
      const { getDbSafe } = await import('../../utils/firebase');
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      const { allocateRoom, deallocateRoom } = await import('../../utils/roomUtils');

      const db = getDbSafe();

      if (!db) {
        showAlert('Error', 'Database not initialized', [], 'error');
        return;
      }

      await allocateRoom(db, room, email.toLowerCase().trim(), fullName);

      try {
        await setDoc(doc(db, 'allocations', email.toLowerCase().trim()), {
          name: fullName,
          rollNo,
          collegeName,
          hostelName,
          age,
          room,
          email: email.toLowerCase().trim(),
          personalEmail: personalEmail ? personalEmail.toLowerCase().trim() : null,
          phone,
          status,
          tempPassword: generatedPassword,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (allocError: any) {
        console.error("Allocation save failed, rolling back room...", allocError);
        await deallocateRoom(db, room, email.toLowerCase().trim());
        throw allocError;
      }

      showAlert(
        'Success',
        `Student allotted to Room ${room}.\n\nLogin Password: ${generatedPassword}\n\nPlease share this with the student.`,
        [
          {
            text: 'Copy & Close',
            onPress: () => {
              setActiveTab('list');
              setFullName('');
              setRollNo('');
              setRoom('');
              setEmail('');
              setPhone('');
              setAge('');
              setHasSubmitted(false);
              setGeneratedPassword(Math.random().toString(36).slice(-8));
            }
          }
        ],
        'success'
      );
    } catch (error: any) {
      showAlert('Error', 'Failed to allot student: ' + error.message, [], 'error');
    }
  };

  // Fetch students from Firestore
  React.useEffect(() => {
    // Wait for user to be verified as admin
    if (!isAdmin(user)) return;

    let unsubscribe: () => void;

    const fetchStudents = async () => {
      try {
        const { getDbSafe } = await import('../../utils/firebase');
        const { collection, query, orderBy, onSnapshot } = await import('firebase/firestore');
        const db = getDbSafe();
        if (!db) return;

        const q = query(collection(db, 'allocations'), orderBy('createdAt', 'desc'));
        unsubscribe = onSnapshot(q, (snapshot) => {
          const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setStudents(list);
          setLoading(false);
        }, (error) => {
          console.error("Error subscribing to allocations:", error);
          setLoading(false);
        });
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
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
    setEditEmail(student.id || student.email || ''); // Initialize with ID/Effective Email
    setEditRollNo(student.rollNo || '');
    setEditRoom(student.room || '');
    setEditCollege(student.collegeName || '');
    setEditHostelName(student.hostelName || '');
    setEditAge(student.age || '');
    setEditPhone(student.phone || '');
    setEditPersonalEmail(student.personalEmail || '');
    setEditStatus(student.status || 'active');
    setEditPassword(student.tempPassword || '');
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editingStudent) return;

    try {
      const { getDbSafe } = await import('../../utils/firebase');
      const { doc, updateDoc, collection, query, where, getDocs, writeBatch, setDoc, deleteDoc, getDoc } = await import('firebase/firestore');
      const { allocateRoom, deallocateRoom } = await import('../../utils/roomUtils');

      const db = getDbSafe();
      if (!db) {
        showAlert('Error', 'Database not connected', [], 'error');
        return;
      }

      setLoading(true);

      const oldEmail = editingStudent.id;
      const newEmail = editEmail.toLowerCase().trim();
      const emailChanged = oldEmail !== newEmail;
      const roomChanged = editRoom !== editingStudent.room;

      // 1. If Email Changed: Ensure new email doesn't already exist
      if (emailChanged) {
        const newEmailDoc = await getDoc(doc(db, 'allocations', newEmail));
        if (newEmailDoc.exists()) {
          showAlert('Error', 'Student with this email already exists!', [], 'error');
          setLoading(false);
          return;
        }
      }

      // 2. Room Allocation Logic
      // If room changed, we need to allocate the new room to the CORRECT ID (new or old)
      // If email changed, we technically need to deallocate the old ID from the old room (or current room) and allocate the NEW ID

      const targetRoom = roomChanged ? editRoom : editingStudent.room;
      const targetId = newEmail; // We effectively want the room to be assigned to the new ID

      // If room changed OR email changed, we need to update room records
      // Because Room stores the Occupant ID. Even if room is same, ID changed, so we must update room.
      const needsRoomUpdate = roomChanged || emailChanged;

      if (needsRoomUpdate && targetRoom) {
        try {
          // If we are changing room, check capacity of new room
          // Logic is complex: 
          // A. Deallocate Old ID from Old Room
          // B. Allocate New ID to New Room (or Old Room)

          // Simplest safe approach:
          // 1. Deallocate Old Room / Old ID
          if (editingStudent.room) {
            await deallocateRoom(db, editingStudent.room, oldEmail);
          }
          // 2. Allocate Target Room / New ID
          await allocateRoom(db, targetRoom, newEmail, editName);

        } catch (err: any) {
          showAlert('Allocation Update Failed', err.message, [], 'error');
          setLoading(false);
          return; // Stop if room ops fail
        }
      }

      const batch = writeBatch(db);

      const updates = {
        name: editName,
        rollNo: editRollNo,
        room: targetRoom,
        collegeName: editCollege,
        hostelName: editHostelName,
        age: editAge,
        phone: editPhone,
        personalEmail: editPersonalEmail,
        status: editStatus,
        tempPassword: editPassword,
        email: newEmail, // Ensure internal email field matches ID
      };

      if (emailChanged) {
        // MIGRATION: Create New, Delete Old
        const newDocRef = doc(db, 'allocations', newEmail);
        const oldDocRef = doc(db, 'allocations', oldEmail);

        // Copy old data + updates
        const docData = {
          ...editingStudent,
          ...updates,
          // Preserve tracking
          updatedAt: new Date(),
          // If we want to keep createdAt of original, we can, but new doc usually gets new createdAt. 
          // Better to keep original createdAt if possible or just let it be new. 
          // Let's keep original if valid, else new.
          createdAt: editingStudent.createdAt || new Date()
        };
        delete docData.id; // Don't save ID field in doc data

        batch.set(newDocRef, docData);
        batch.delete(oldDocRef);

      } else {
        // Normal Update
        const allocationRef = doc(db, 'allocations', oldEmail);
        batch.update(allocationRef, updates);
      }

      // 3. Update User Profile (Sync)
      // We search for users with the OLD officialEmail and update them to NEW officialEmail
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('officialEmail', '==', oldEmail));
      const querySnap = await getDocs(q);

      querySnap.forEach((userDoc) => {
        batch.update(userDoc.ref, {
          ...updates,
          officialEmail: newEmail // Sync the link
        });
      });

      // Fallback: Check 'email' field in users collection too if different scheme
      if (querySnap.empty) {
        const q2 = query(usersRef, where('email', '==', oldEmail));
        const snap2 = await getDocs(q2);
        snap2.forEach((userDoc) => {
          // If user signed in with this email, updating 'email' field might handle logic elsewhere
          // But 'email' is usually auth provider linked. We update descriptive fields.
          batch.update(userDoc.ref, updates);
        });
      }

      await batch.commit();

      showAlert('Success', 'Student details updated successfully.', [], 'success');
      setEditModalVisible(false);
      setEditingStudent(null);
      setEditEmail('');

    } catch (e: any) {
      console.error(e);
      showAlert('Error', 'Failed to update student: ' + e.message, [], 'error');
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
              const { getDbSafe } = await import('../../utils/firebase');
              const { doc, deleteDoc } = await import('firebase/firestore');
              const { deallocateRoom } = await import('../../utils/roomUtils');
              const db = getDbSafe();
              if (db) {
                // 1. Deallocate Room
                await deallocateRoom(db, roomNo, id); // id is the email in this schema
                // 2. Delete Student Allocation Doc
                await deleteDoc(doc(db, 'allocations', id));

                showAlert('Success', 'Student removed successfully.', [], 'success');
              }
            } catch (error) {
              console.error(error);
              showAlert('Error', 'Failed to delete allocation', [], 'error');
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
  );

  const activeStudents = students.filter((s) => s.status === 'active').length;

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
                  <View style={styles.formSection}>
                    <Text style={styles.modalLabel}>Official Email (ID)</Text>
                    <View style={styles.modalInputWrapper}>
                      <MaterialIcons name="email" size={20} color="#64748B" style={styles.inputIcon} />
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
                    <Text style={styles.modalLabel}>Full Name</Text>
                    <View style={styles.modalInputWrapper}>
                      <MaterialIcons name="account" size={20} color="#64748B" style={styles.inputIcon} />
                      <TextInput style={styles.modalInput} value={editName} onChangeText={setEditName} placeholder="Full Name" />
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalLabel}>Roll No</Text>
                      <View style={styles.modalInputWrapper}>
                        <MaterialIcons name="identifier" size={20} color="#64748B" style={styles.inputIcon} />
                        <TextInput style={styles.modalInput} value={editRollNo} onChangeText={setEditRollNo} placeholder="Roll No" />
                      </View>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalLabel}>Room</Text>
                      <View style={styles.modalInputWrapper}>
                        <MaterialIcons name="door" size={20} color="#64748B" style={styles.inputIcon} />
                        <TextInput style={styles.modalInput} value={editRoom} onChangeText={setEditRoom} placeholder="Room" />
                      </View>
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

                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalLabel}>Age</Text>
                      <View style={styles.modalInputWrapper}>
                        <MaterialIcons name="calendar-account" size={20} color="#64748B" style={styles.inputIcon} />
                        <TextInput style={styles.modalInput} value={editAge} onChangeText={setEditAge} keyboardType="numeric" placeholder="Age" />
                      </View>
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

        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
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
              <Text style={styles.headerTitle}>{activeTab === 'list' ? 'Manage Students' : 'Student Allotment'}</Text>
            </View>
          </LinearGradient>



          <View style={styles.navBar}>
            <TouchableOpacity
              style={[styles.navItem, activeTab === 'list' && styles.navItemActive]}
              onPress={() => setActiveTab('list')}
            >
              <MaterialIcons name="account-group" size={20} color={activeTab === 'list' ? colors.primary : colors.textSecondary} />
              <Text style={[styles.navItemLabel, activeTab === 'list' && styles.navItemLabelActive]}>Manage Students</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navItem, activeTab === 'allotment' && styles.navItemActive]}
              onPress={() => setActiveTab('allotment')}
            >
              <MaterialIcons name="account-plus" size={20} color={activeTab === 'allotment' ? colors.primary : colors.textSecondary} />
              <Text style={[styles.navItemLabel, activeTab === 'allotment' && styles.navItemLabelActive]}>Student Allotment</Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'list' ? (
            <>
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

              <FlatList
                data={filteredStudents}
                scrollEnabled={false}
                keyExtractor={(item) => item.id}
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
                            {item.name
                              .split(' ')
                              .map((n: string) => n[0])
                              .join('')
                              .toUpperCase()}
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
                contentContainerStyle={styles.listContent}
              />
            </>
          ) : (
            <View style={{ paddingHorizontal: 20 }}>
              {/* Form Card */}
              <View style={styles.card}>
                <View style={{ marginBottom: 24 }}>
                  <Text style={styles.sectionTitle}>Student Details</Text>
                  <Text style={styles.sectionSubtitle}>Enter the information below to allot a room.</Text>
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
                    This password is auto-generated. You can edit it if needed.
                  </Text>
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

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <InputField
                      label="Roll No"
                      icon="identifier"
                      value={rollNo}
                      onChangeText={setRollNo}
                      placeholder="e.g. CS-24-001"
                      required
                      hasSubmitted={hasSubmitted}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <InputField
                      label="Room"
                      icon="door"
                      value={room}
                      onChangeText={setRoom}
                      placeholder="e.g. 101"
                      required
                      hasSubmitted={hasSubmitted}
                    />
                  </View>
                </View>

                <InputField
                  label="Official Email"
                  icon="email-lock"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="student@college.edu"
                  keyboardType="email-address"
                  required
                  hasSubmitted={hasSubmitted}
                />

                <InputField
                  label="Personal Email"
                  icon="google"
                  value={personalEmail}
                  onChangeText={setPersonalEmail}
                  placeholder="personal@gmail.com (Optional)"
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

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <InputField
                      label="Age"
                      icon="calendar-account"
                      value={age}
                      onChangeText={setAge}
                      placeholder="Years"
                      keyboardType="numeric"
                      required
                      hasSubmitted={hasSubmitted}
                    />
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

                <Text style={styles.sectionTitle}>College Info</Text>

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
            </View>
          )}
        </ScrollView>

      </KeyboardAvoidingView >

    </SafeAreaView >
  );
}


