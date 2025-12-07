import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isAdmin, useUser } from '../../utils/authUtils';
import { createNotice, deleteNotice, Notice, subscribeToNotices } from '../../utils/noticesSyncUtils';

export default function NoticesPage() {
  const user = useUser();
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newPriority, setNewPriority] = useState<Notice['priority']>('medium');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToNotices((data) => {
      setNotices(data);
      setLoading(false);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (!isAdmin(user))
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Access denied.</Text>
      </View>
    );

  const handleCreate = async () => {
    if (!newTitle || !newBody) {
      Alert.alert('Error', 'Title and Body are required');
      return;
    }

    try {
      await createNotice({
        title: newTitle,
        body: newBody,
        priority: newPriority,
        date: new Date(),
      });

      setModalVisible(false);
      setNewTitle('');
      setNewBody('');
      setNewPriority('medium');
      Alert.alert('Success', 'Notice created');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Delete Notice', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteNotice(id);
          } catch (e: any) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#DB2777';
      case 'medium':
        return '#F472B6';
      case 'low':
        return '#FB7185';
      default:
        return '#94A3B8';
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#DB2777', '#F472B6']} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="chevron-left" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Notices</Text>
          </View>
        </LinearGradient>

        <TouchableOpacity style={styles.createBtn} onPress={() => setModalVisible(true)}>
          <MaterialIcons name="plus-circle" size={20} color="#fff" />
          <Text style={styles.createBtnText}>Create New Notice</Text>
        </TouchableOpacity>

        <FlatList
          data={notices}
          keyExtractor={(i) => i.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.noticeCard, selectedId === item.id && styles.noticeCardSelected]}
              onPress={() => setSelectedId(selectedId === item.id ? null : item.id)}
            >
              <View style={styles.noticeHeader}>
                <View style={styles.noticeTitle}>
                  <MaterialIcons name="bullhorn" size={20} color="#DB2777" />
                  <Text style={styles.noticeTitleText}>{item.title}</Text>
                </View>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority || 'medium') + '20' }]}>
                  <Text style={[styles.priorityText, { color: getPriorityColor(item.priority || 'medium') }]}>
                    {item.priority}
                  </Text>
                </View>
              </View>
              <Text style={styles.noticeDate}>{item.date.toLocaleDateString()}</Text>
              {selectedId === item.id && (
                <View>
                  <Text style={styles.noticeBody}>{item.body}</Text>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                    <Text style={styles.deleteBtnText}>Delete Notice</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>No notices found.</Text>}
        />
      </ScrollView>

      {/* Create Modal */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Notice</Text>

            <Text style={styles.label}>Title</Text>
            <TextInput style={styles.input} placeholder="Notice Title" value={newTitle} onChangeText={setNewTitle} />

            <Text style={styles.label}>Body</Text>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              placeholder="Notice Details..."
              multiline
              value={newBody}
              onChangeText={setNewBody}
            />

            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityRow}>
              {['low', 'medium', 'high'].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityOption,
                    newPriority === p && { backgroundColor: getPriorityColor(p), borderColor: getPriorityColor(p) }
                  ]}
                  onPress={() => setNewPriority(p as any)}
                >
                  <Text style={[styles.priorityOptionText, newPriority === p && { color: '#fff' }]}>{p.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={handleCreate}>
                <Text style={styles.saveBtnText}>Post Notice</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  createBtn: {
    marginHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#DB2777',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#DB2777',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  createBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 12,
  },
  noticeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#DB2777',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  noticeCardSelected: {
    shadowOpacity: 0.15,
    elevation: 4,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  noticeTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  noticeTitleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  priorityBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  noticeDate: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 8,
  },
  noticeBody: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginTop: 8,
  },
  deleteBtn: {
    marginTop: 12,
    alignSelf: 'flex-end',
  },
  deleteBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 4,
    color: '#64748B',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#F8FAFC',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
    marginBottom: 20,
  },
  priorityOption: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  priorityOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  modalBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#F1F5F9',
  },
  saveBtn: {
    backgroundColor: '#DB2777',
  },
  cancelBtnText: {
    color: '#64748B',
    fontWeight: '600',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
});
