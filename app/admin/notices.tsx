import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isAdmin, useUser } from '../../utils/authUtils';

const MOCK = [
  { id: 'n1', title: 'Water outage', body: 'Water will be off from 9am-12pm', date: '2025-12-06', priority: 'high' },
  { id: 'n2', title: 'Maintenance work', body: 'Electrical maintenance in Block A', date: '2025-12-05', priority: 'medium' },
  { id: 'n3', title: 'WiFi upgrade', body: 'Internet speed upgrade completed', date: '2025-12-04', priority: 'low' },
];

export default function NoticesPage() {
  const user = useUser();
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!isAdmin(user))
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Access denied.</Text>
      </View>
    );

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

      <TouchableOpacity style={styles.createBtn}>
        <MaterialIcons name="plus-circle" size={20} color="#fff" />
        <Text style={styles.createBtnText}>Create New Notice</Text>
      </TouchableOpacity>

      <FlatList
        data={MOCK}
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
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
                <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
                  {item.priority}
                </Text>
              </View>
            </View>
            <Text style={styles.noticeDate}>{item.date}</Text>
            {selectedId === item.id && <Text style={styles.noticeBody}>{item.body}</Text>}
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
});
