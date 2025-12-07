import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Dimensions, FlatList, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isAdmin, useUser } from '../../utils/authUtils';



export default function StudentsPage() {
  const user = useUser();
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);

  // Form State
  const [editName, setEditName] = useState('');
  const [editRollNo, setEditRollNo] = useState('');
  const [editRoom, setEditRoom] = useState('');
  const [editCollege, setEditCollege] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const [editPersonalEmail, setEditPersonalEmail] = useState('');
  const [editStatus, setEditStatus] = useState('active');
  const [editPassword, setEditPassword] = useState('');

  // Fetch students from Firestore
  React.useEffect(() => {
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
  }, []);

  const handleEdit = (student: any) => {
    setEditingStudent(student);
    setEditName(student.name || '');
    setEditRollNo(student.rollNo || '');
    setEditRoom(student.room || '');
    setEditCollege(student.collegeName || '');
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
      const { doc, updateDoc, collection, query, where, getDocs, writeBatch } = await import('firebase/firestore');
      const { allocateRoom, deallocateRoom } = await import('../../utils/roomUtils');

      const db = getDbSafe();
      if (!db) {
        Alert.alert('Error', 'Database not connected');
        return;
      }

      setLoading(true);

      const roomChanged = editRoom !== editingStudent.room;

      // 1. If room changed, reserve the new room first (checks capacity)
      if (roomChanged) {
        try {
          await allocateRoom(db, editRoom, editingStudent.id, editName);
        } catch (err: any) {
          Alert.alert('Room Assignment Failed', err.message);
          setLoading(false);
          return;
        }
      }

      const batch = writeBatch(db);

      // 2. Update Allocation Document
      const allocationRef = doc(db, 'allocations', editingStudent.id); // ID is official email
      const updates = {
        name: editName,
        rollNo: editRollNo,
        room: editRoom,
        collegeName: editCollege,
        age: editAge,
        phone: editPhone,
        personalEmail: editPersonalEmail,
        status: editStatus,
        tempPassword: editPassword,
      };
      batch.update(allocationRef, updates);

      // 3. Find and Update User Profile (if exists) via Official Email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('officialEmail', '==', editingStudent.id));
      const querySnap = await getDocs(q);

      querySnap.forEach((userDoc) => {
        batch.update(userDoc.ref, updates);
      });

      if (querySnap.empty) {
        const q2 = query(usersRef, where('email', '==', editingStudent.id));
        const snap2 = await getDocs(q2);
        snap2.forEach((userDoc) => {
          batch.update(userDoc.ref, updates);
        });
      }

      try {
        await batch.commit();

        // 4. If commit successful AND room changed, release the old room
        if (roomChanged && editingStudent.room) {
          await deallocateRoom(db, editingStudent.room, editingStudent.id);
        }

        Alert.alert('Success', 'Student details updated successfully.');
        setEditModalVisible(false);
        setEditingStudent(null);
      } catch (commitError: any) {
        // 5. If batch failed, rollback the new room allocation
        if (roomChanged) {
          await deallocateRoom(db, editRoom, editingStudent.id);
        }
        throw commitError;
      }

    } catch (e: any) {
      console.error(e);
      Alert.alert('Error', 'Failed to update student: ' + e.message);
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async (id: string, name: string, room: string) => {
    Alert.alert('Confirm Delete', `Are you sure you want to remove ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
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
              await deleteDoc(doc(db, 'allocations', id));
              // Sync Room
              if (room) {
                await deallocateRoom(db, room, id);
              }
              setSelectedId(null);
            }
          } catch (e) {
            Alert.alert('Error', 'Failed to delete allocation');
          }
        },
      },
    ]);
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
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      {/* Edit Modal */}
      {isEditModalVisible && (
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Student</Text>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <MaterialIcons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalBody} contentContainerStyle={{ paddingBottom: 20 }}>
                <Text style={styles.modalLabel}>Official Email (ID) - Read Only</Text>
                <TextInput style={[styles.modalInput, styles.disabledInput]} value={editingStudent?.id} editable={false} />

                <Text style={styles.modalLabel}>Full Name</Text>
                <TextInput style={styles.modalInput} value={editName} onChangeText={setEditName} />

                <Text style={styles.modalLabel}>Roll No</Text>
                <TextInput style={styles.modalInput} value={editRollNo} onChangeText={setEditRollNo} />

                <Text style={styles.modalLabel}>Room Number</Text>
                <TextInput style={styles.modalInput} value={editRoom} onChangeText={setEditRoom} />

                <Text style={styles.modalLabel}>College Name</Text>
                <TextInput style={styles.modalInput} value={editCollege} onChangeText={setEditCollege} />

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalLabel}>Age</Text>
                    <TextInput style={styles.modalInput} value={editAge} onChangeText={setEditAge} keyboardType="numeric" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalLabel}>Phone</Text>
                    <TextInput style={styles.modalInput} value={editPhone} onChangeText={setEditPhone} keyboardType="phone-pad" />
                  </View>
                </View>


                <Text style={styles.modalLabel}>Linked Gmail (Personal) - Read Only</Text>
                <TextInput style={[styles.modalInput, styles.disabledInput]} value={editPersonalEmail} editable={false} />

                <Text style={styles.modalLabel}>Status (active / inactive)</Text>
                <TextInput style={styles.modalInput} value={editStatus} onChangeText={(text) => setEditStatus(text.toLowerCase())} placeholder="active or inactive" />

                <Text style={styles.modalLabel}>Temporary Password</Text>
                <TextInput style={styles.modalInput} value={editPassword} onChangeText={setEditPassword} />
              </ScrollView>
              <View style={styles.modalFooter}>
                <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setEditModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={handleSaveEdit}>
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="chevron-left" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Manage Students</Text>
          </View>
        </LinearGradient>

        <View style={styles.navBar}>
          <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
            <MaterialIcons name="account-group" size={18} color="#6366F1" />
            <Text style={[styles.navItemLabel, styles.navItemLabelActive]}>Manage Students</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push('/admin/student-allotment')}
          >
            <MaterialIcons name="clipboard-list" size={18} color="#64748B" />
            <Text style={styles.navItemLabel}>Student Allotment</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialIcons name="account-group" size={22} color="#6366F1" />
            <Text style={styles.statValue}>{students.length}</Text>
            <Text style={styles.statLabel}>Total Students</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="check-circle" size={22} color="#06B6D4" />
            <Text style={styles.statValue}>{activeStudents}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="door-closed" size={22} color="#8B5CF6" />
            <Text style={styles.statValue}>{students.length}</Text>
            <Text style={styles.statLabel}>Rooms</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <MaterialIcons name="magnify" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, room, or roll no..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            {filteredStudents.length} Student{filteredStudents.length !== 1 ? 's' : ''}
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
                selectedId === item.id && styles.studentCardActive,
              ]}
              onPress={() => setSelectedId(selectedId === item.id ? null : item.id)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.studentAvatarContainer}>
                  <View style={styles.studentAvatar}>
                    <Text style={styles.studentInitial}>
                      {item.name
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{item.name}</Text>
                  <View style={styles.roomRollContainer}>
                    <Text style={styles.detailSmall}>Room {item.room}</Text>
                    <Text style={styles.detailSmall}>• {item.rollNo}</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                  <MaterialIcons name={getStatusIcon(item.status)} size={14} color="#fff" />
                </View>
              </View>

              {selectedId === item.id && (
                <View style={styles.expandedContent}>
                  <View style={styles.infoSection}>
                    <View style={styles.detailRow}>
                      <View style={styles.detailLeft}>
                        <MaterialIcons name="account" size={16} color="#6366F1" />
                        <Text style={styles.detailLabel}>Full Name</Text>
                      </View>
                      <Text style={styles.detailValue}>{item.name}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <View style={styles.detailLeft}>
                        <MaterialIcons name="card-account-details" size={16} color="#6366F1" />
                        <Text style={styles.detailLabel}>Roll No</Text>
                      </View>
                      <Text style={styles.detailValue}>{item.rollNo}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <View style={styles.detailLeft}>
                        <MaterialIcons name="school" size={16} color="#8B5CF6" />
                        <Text style={styles.detailLabel}>College</Text>
                      </View>
                      <Text style={styles.detailValue}>{item.collegeName || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <View style={styles.detailLeft}>
                        <MaterialIcons name="cake" size={16} color="#EC4899" />
                        <Text style={styles.detailLabel}>Age</Text>
                      </View>
                      <Text style={styles.detailValue}>{item.age || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <View style={styles.detailLeft}>
                        <MaterialIcons name="door-closed" size={16} color="#8B5CF6" />
                        <Text style={styles.detailLabel}>Room</Text>
                      </View>
                      <Text style={styles.detailValue}>{item.room}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <View style={styles.detailLeft}>
                        <MaterialIcons name="email" size={16} color="#06B6D4" />
                        <Text style={styles.detailLabel}>Official Email</Text>
                      </View>
                      <Text style={styles.detailValue}>{item.email}</Text>
                    </View>
                    {item.personalEmail && (
                      <View style={styles.detailRow}>
                        <View style={styles.detailLeft}>
                          <MaterialIcons name="gmail" size={16} color="#DB4437" />
                          <Text style={styles.detailLabel}>Linked Gmail</Text>
                        </View>
                        <Text style={styles.detailValue}>{item.personalEmail}</Text>
                      </View>
                    )}
                    <View style={styles.detailRow}>
                      <View style={styles.detailLeft}>
                        <MaterialIcons name="phone" size={16} color="#EC4899" />
                        <Text style={styles.detailLabel}>Phone</Text>
                      </View>
                      <Text style={styles.detailValue}>{item.phone}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <View style={styles.detailLeft}>
                        <MaterialIcons name="check-circle" size={16} color={getStatusColor(item.status)} />
                        <Text style={styles.detailLabel}>Status</Text>
                      </View>
                      <Text style={[styles.detailValue, { color: getStatusColor(item.status), fontWeight: '700' }]}>
                        {item.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.detailLeft}>
                      <MaterialIcons name="key" size={16} color="#F59E0B" />
                      <Text style={styles.detailLabel}>Password</Text>
                    </View>
                    <Text style={[styles.detailValue, { fontFamily: 'monospace', color: '#D97706' }]}>
                      {item.tempPassword || 'N/A'}
                    </Text>
                  </View>

                  <View style={styles.actionButtons}>
                    <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => handleEdit(item)}>
                      <MaterialIcons name="pencil" size={16} color="#fff" />
                      <Text style={styles.actionBtnText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBtn, styles.deleteBtn]}
                      onPress={() => handleDelete(item.id, item.name, item.room)}
                    >
                      <MaterialIcons name="delete" size={16} color="#fff" />
                      <Text style={styles.actionBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    paddingBottom: 20,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  navItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  navItemActive: {
    borderBottomColor: '#6366F1',
    backgroundColor: '#FAFBFF',
  },
  navItemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  navItemLabelActive: {
    color: '#6366F1',
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6366F1',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
  },
  listHeader: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  listContent: {
    paddingHorizontal: 12,
  },
  studentCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    borderLeftWidth: 0,
    shadowColor: '#6366F1',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderTopWidth: 3,
    borderTopColor: '#6366F1',
  },
  studentCardActive: {
    shadowOpacity: 0.18,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    backgroundColor: '#FAFBFF',
    borderBottomWidth: 0,
  },
  studentAvatarContainer: {
    marginRight: 12,
  },
  studentAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  studentInitial: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 3,
    letterSpacing: -0.3,
  },
  roomRollContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailSmall: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  statusBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandedContent: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  infoSection: {
    marginBottom: 12,
    gap: 0,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    fontWeight: '600',
  },
  editBtn: {
    backgroundColor: '#6366F1',
  },

  deleteBtn: {
    backgroundColor: '#EC4899',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    height: Dimensions.get('window').height * 0.75, // Fixed pixel height
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    overflow: 'hidden',
  },
  keyboardAvoidingView: {
    width: '100%',
    flex: 1, // Ensure it takes full space to center the modal
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#fff',
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  modalBody: {
    padding: 20,
    flex: 1, // Full flexible height
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
    marginTop: 12,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  disabledInput: {
    backgroundColor: '#F1F5F9',
    color: '#94A3B8',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: '#F1F5F9',
  },
  saveBtn: {
    backgroundColor: '#6366F1',
  },
  cancelBtnText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
