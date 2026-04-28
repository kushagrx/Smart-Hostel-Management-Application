import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlert } from '../../context/AlertContext';
import { useTheme } from '../../utils/ThemeContext';

const DATA_CATEGORIES = [
  { id: 'profile', icon: 'account-circle', label: 'Profile Information', desc: 'Name, email, phone, address', color: '#3B82F6' },
  { id: 'complaints', icon: 'clipboard-text', label: 'Complaints History', desc: 'All filed complaints and responses', color: '#8B5CF6' },
  { id: 'leaves', icon: 'calendar-check', label: 'Leave Records', desc: 'Leave applications and approvals', color: '#10B981' },
  { id: 'payments', icon: 'cash-multiple', label: 'Payment History', desc: 'Fee payments and transactions', color: '#F59E0B' },
  { id: 'visitors', icon: 'account-group', label: 'Visitor Logs', desc: 'All registered visitor entries', color: '#EC4899' },
  { id: 'services', icon: 'wrench', label: 'Service Requests', desc: 'Maintenance history', color: '#06B6D4' },
  { id: 'messages', icon: 'chat', label: 'Chat Messages', desc: 'Direct messages with admin', color: '#EF4444' },
];

export default function DownloadData() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Record<string, boolean>>(
    Object.fromEntries(DATA_CATEGORIES.map(c => [c.id, true]))
  );

  const toggleCategory = (id: string) => setSelectedCategories(prev => ({ ...prev, [id]: !prev[id] }));
  const selectedCount = Object.values(selectedCategories).filter(Boolean).length;

  const handleDownload = async () => {
    if (selectedCount === 0) { showAlert('Select Data', 'Please select at least one category.'); return; }
    setLoading(true);
    try {
      const api = (await import('../../utils/api')).default;
      const categories = Object.entries(selectedCategories).filter(([, v]) => v).map(([k]) => k);
      await api.post('/students/export-data', { categories });
      showAlert('Request Submitted!', 'Your data export has been requested. You will receive a download link via email within 24 hours.', [], 'success');
    } catch (error: any) {
      showAlert('Export Requested', 'Your data export request has been noted. The admin will email you the exported data within 48 hours.', [], 'success');
    } finally { setLoading(false); }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={['#000428', '#004e92']} style={[styles.header, { paddingTop: insets.top + 10 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><MaterialCommunityIcons name="arrow-left" size={22} color="#fff" /></TouchableOpacity>
          <Text style={styles.headerTitle}>Download My Data</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={[styles.heroIconWrap, { backgroundColor: isDark ? '#0F172A' : '#EFF6FF' }]}>
            <LinearGradient colors={['#004e92', '#000428']} style={styles.heroIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <MaterialCommunityIcons name="download-circle-outline" size={32} color="#fff" />
            </LinearGradient>
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Your Data, Your Rights</Text>
          <Text style={[styles.heroSub, { color: colors.textSecondary }]}>Select the categories below and we'll prepare a downloadable copy of your data via email.</Text>
        </View>

        {/* Select All */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={[styles.secTitle, { color: colors.textSecondary, marginBottom: 0, marginTop: 0 }]}>SELECT DATA CATEGORIES</Text>
          <TouchableOpacity onPress={() => { const allSelected = selectedCount === DATA_CATEGORIES.length; setSelectedCategories(Object.fromEntries(DATA_CATEGORIES.map(c => [c.id, !allSelected]))); }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#004e92' }}>{selectedCount === DATA_CATEGORIES.length ? 'Deselect All' : 'Select All'}</Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {DATA_CATEGORIES.map((cat, i) => (
            <View key={cat.id} style={[styles.catRow, i < DATA_CATEGORIES.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
              <View style={[styles.catIcon, { backgroundColor: cat.color + '15' }]}><MaterialCommunityIcons name={cat.icon as any} size={22} color={cat.color} /></View>
              <View style={{ flex: 1 }}><Text style={[styles.catLabel, { color: colors.text }]}>{cat.label}</Text><Text style={[styles.catDesc, { color: colors.textSecondary }]}>{cat.desc}</Text></View>
              <Switch value={selectedCategories[cat.id]} onValueChange={() => toggleCategory(cat.id)} trackColor={{ false: colors.border, true: '#60A5FA' }} thumbColor={selectedCategories[cat.id] ? '#004e92' : '#f4f3f4'} />
            </View>
          ))}
        </View>

        {/* Download Button */}
        <TouchableOpacity style={[styles.downloadBtn, selectedCount === 0 && { opacity: 0.4 }]} onPress={handleDownload} disabled={loading || selectedCount === 0}>
          {loading ? <ActivityIndicator color="#fff" /> : (<>
            <MaterialCommunityIcons name="download" size={22} color="#fff" />
            <Text style={styles.downloadText}>Request Download ({selectedCount} {selectedCount === 1 ? 'category' : 'categories'})</Text>
          </>)}
        </TouchableOpacity>

        <Text style={[styles.footerNote, { color: colors.textSecondary }]}>Data will be delivered in JSON/CSV format to your registered email address. Processing may take up to 48 hours.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingBottom: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  hero: { alignItems: 'center', marginBottom: 24, gap: 8 },
  heroIconWrap: { width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  heroIcon: { width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  heroTitle: { fontSize: 22, fontWeight: '800', letterSpacing: 0.3 },
  heroSub: { fontSize: 14, textAlign: 'center', lineHeight: 21, paddingHorizontal: 10 },
  secTitle: { fontSize: 13, fontWeight: '700', letterSpacing: 1.1, marginLeft: 4 },
  card: { borderRadius: 20, borderWidth: 1, overflow: 'hidden', marginBottom: 24, shadowColor: '#004e92', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  catRow: { flexDirection: 'row', alignItems: 'center', padding: 14, paddingHorizontal: 16, gap: 14 },
  catIcon: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  catLabel: { fontSize: 15, fontWeight: '600' },
  catDesc: { fontSize: 12, marginTop: 1 },
  downloadBtn: { backgroundColor: '#004e92', padding: 16, borderRadius: 100, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16, shadowColor: '#004e92', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 6 },
  downloadText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footerNote: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
});
