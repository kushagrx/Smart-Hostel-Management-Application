import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isAdmin, useUser } from '../../utils/authUtils';



export default function StudentAllotmentPage() {
  const user = useUser();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [age, setAge] = useState('');
  const [room, setRoom] = useState('');
  const [email, setEmail] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [generatedPassword, setGeneratedPassword] = useState('');

  React.useEffect(() => {
    // Generate a secure random password on mount
    const pwd = Math.random().toString(36).slice(-8); // 8 chars
    setGeneratedPassword(pwd);
  }, []);

  const handleSubmit = async () => {
    if (!fullName || !rollNo || !collegeName || !age || !room || !email || !phone) {
      Alert.alert('Missing details', 'Please fill all fields (Personal Email is optional).');
      return;
    }

    try {
      const { getDbSafe } = await import('../../utils/firebase');
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      const db = getDbSafe();

      if (!db) {
        Alert.alert('Error', 'Database not initialized');
        return;
      }

      // Use email as doc ID for uniqueness and easy lookup
      await setDoc(doc(db, 'allocations', email.toLowerCase().trim()), {
        name: fullName,
        rollNo,
        collegeName,
        age,
        room,
        email: email.toLowerCase().trim(),
        personalEmail: personalEmail ? personalEmail.toLowerCase().trim() : null, // Save Personal Email
        phone,
        status,
        tempPassword: generatedPassword, // Save the password
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      Alert.alert(
        'Success',
        `Student allotted.\n\nLogin Password: ${generatedPassword}\n\nPlease share this with the student.`,
        [
          { text: 'Copy & Close', onPress: () => router.replace('/admin/students') } // In a real app we'd copy to clipboard
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', 'Failed to allot student: ' + error.message);
    }
  };

  if (!isAdmin(user))
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Access denied.</Text>
      </View>
    );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/admin/students')} style={styles.backBtn}>
            <MaterialIcons name="chevron-left" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Student Allotment</Text>
          </View>
        </LinearGradient>

        <View style={styles.navBar}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.replace('/admin/students')}
          >
            <MaterialIcons name="account-group" size={18} color="#64748B" />
            <Text style={styles.navItemLabel}>Manage Students</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
            <MaterialIcons name="clipboard-list" size={18} color="#6366F1" />
            <Text style={[styles.navItemLabel, styles.navItemLabelActive]}>Student Allotment</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <MaterialIcons name="clipboard-list" size={18} color="#6366F1" />
            <Text style={styles.formTitle}>New Student Allotment</Text>
          </View>

          <View style={[styles.inputContainer, { backgroundColor: '#F0FDF4', padding: 10, borderRadius: 8, borderColor: '#86EFAC', borderWidth: 1 }]}>
            <Text style={[styles.label, { color: '#166534' }]}>Generated Login Password</Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#15803D', letterSpacing: 1 }}>
              {generatedPassword}
            </Text>
            <Text style={{ fontSize: 11, color: '#166534', marginTop: 4 }}>
              * Student must use this password for their first login.
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter full name"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Roll Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter roll number"
              value={rollNo}
              onChangeText={setRollNo}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Room</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter room"
              value={room}
              onChangeText={setRoom}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>College Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter college name"
              value={collegeName}
              onChangeText={setCollegeName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter age"
              keyboardType="numeric"
              value={age}
              onChangeText={setAge}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email (Official/Login ID)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter official email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Personal Gmail ID (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter personal gmail"
              keyboardType="email-address"
              autoCapitalize="none"
              value={personalEmail}
              onChangeText={setPersonalEmail}
            />
            <Text style={{ fontSize: 10, color: '#64748B', marginTop: 4 }}>
              * Allows student to login via Google using this email.
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter phone"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={status}
                onValueChange={(v) => setStatus(v as 'active' | 'inactive')}
              >
                <Picker.Item label="Active" value="active" />
                <Picker.Item label="Inactive" value="inactive" />
              </Picker>
            </View>
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <MaterialIcons name="check-circle" size={18} color="#fff" />
            <Text style={styles.submitText}>Allot Student</Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: 12,
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
    fontSize: 26,
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
  listHeader: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    borderTopWidth: 3,
    borderTopColor: '#6366F1',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAFBFF',
  },
  roomBadge: {
    backgroundColor: '#ECFDF5',
    borderLeftWidth: 3,
    borderLeftColor: '#6366F1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  roomBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#6366F1',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  occupantsList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  occupantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  occupantName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    borderTopWidth: 3,
    borderTopColor: '#6366F1',
    padding: 16,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  inputContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FAFBFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#1E293B',
  },
  pickerWrapper: {
    backgroundColor: '#FAFBFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
  },
  submitBtn: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    borderRadius: 10,
  },
  submitText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
