import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAlert } from '../../context/AlertContext';
import { isAdmin, useUser } from '../../utils/authUtils';

const InputField = React.memo(({ label, icon, value, onChangeText, placeholder, keyboardType = 'default', required = false, hasSubmitted }: any) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.inputContainer}>
      <Text style={[
        styles.label,
        isFocused && { color: '#004e92' } // Removed fontWeight change
      ]}>
        {label} {required && <Text style={{ color: '#EF4444' }}>*</Text>}
      </Text>
      <View style={[
        styles.inputWrapper,
        isFocused && styles.inputWrapperFocused,
        hasSubmitted && required && !value && { borderColor: '#EF4444', borderWidth: 1 }
      ]}>
        <MaterialIcons
          name={icon}
          size={20}
          color={isFocused ? "#004e92" : "#64748B"}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize="none"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
      {hasSubmitted && required && !value && (
        <Text style={styles.errorText}>{label} is required</Text>
      )}
    </View>
  );
});

export default function StudentAllotmentPage() {
  const user = useUser();
  const router = useRouter();
  const { showAlert } = useAlert();
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
  const [hostelFee, setHostelFee] = useState('');
  const [messFee, setMessFee] = useState('');
  const [feeFrequency, setFeeFrequency] = useState<'Monthly' | 'Quarterly' | 'Yearly'>('Monthly');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  React.useEffect(() => {
    // Generate a secure random password on mount
    const pwd = Math.random().toString(36).slice(-8); // 8 chars
    setGeneratedPassword(pwd);
  }, []);

  const handleSubmit = async () => {
    setHasSubmitted(true);

    if (!fullName || !rollNo || !collegeName || !hostelName || !age || !room || !email || !phone) {
      showAlert('Missing details', 'Please fill all mandatory fields (marked red).', [], 'error');
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      showAlert('Invalid Phone', 'Phone number must be exactly 10 digits.', [], 'error');
      return;
    }

    try {
      const { default: api } = await import('../../utils/api');

      const totalDues = (parseFloat(hostelFee) || 0) + (parseFloat(messFee) || 0);

      const payload = {
        fullName,
        email: email.trim(),
        password: generatedPassword,
        rollNo,
        collegeName,
        hostelName,
        dob: null, // Frontend only asks for Age
        roomNo: room,
        phone,
        personalEmail: personalEmail ? personalEmail.trim() : null,
        address: '', // Optional
        fatherName: '', // Optional
        fatherPhone: '', // Optional
        motherName: '', // Optional
        motherPhone: '', // Optional
        dues: totalDues,
        bloodGroup: '', // Optional
        medicalHistory: '', // Optional
        emergencyContactName: '', // Optional
        emergencyContactPhone: '', // Optional
        status,
        wifiSSID: 'Hostel_WiFi', // Default
        wifiPassword: '' // Default
      };

      await api.post('/students/allot', payload);

      showAlert(
        'Success',
        `Student allotted to Room ${room}.\n\nLogin Password: ${generatedPassword}\n\nPlease share this with the student.`,
        [
          { text: 'Copy & Close', onPress: () => router.replace('/admin/students') }
        ],
        'success'
      );
    } catch (error: any) {
      console.error(error);
      let msg = 'Failed to allot student.';
      if (error.response?.data?.error) {
        msg = error.response.data.error;
      }
      showAlert('Error', msg, [], 'error');
    }
  };

  if (!isAdmin(user))
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Access denied.</Text>
      </View>
    );

  return (
    <View style={styles.mainContainer}>
      <LinearGradient
        colors={['#000428', '#004e92']}
        style={styles.headerBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/admin/students')} style={styles.backButton}>
            <MaterialIcons name="arrow-left" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Allotment</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Navigation Tabs */}
          <View style={styles.navBar}>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => router.replace('/admin/students')}
            >
              <MaterialIcons name="account-group" size={20} color="#64748B" />
              <Text style={styles.navItemLabel}>Students</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
              <MaterialIcons name="account-plus" size={20} color="#004e92" />
              <Text style={[styles.navItemLabel, styles.navItemLabelActive]}>Allotment</Text>
            </TouchableOpacity>
          </View>

          {/* Generator Card */}
          <View style={[styles.card, styles.generatorCard]}>
            <View style={styles.generatorHeader}>
              <View style={styles.iconCircle}>
                <MaterialIcons name="key-variant" size={20} color="#16A34A" />
              </View>
              <View>
                <Text style={styles.generatorTitle}>Login Credentials</Text>
                <Text style={styles.generatorSubtitle}>Share this with the student</Text>
              </View>
            </View>
            <View style={styles.passwordBox}>
              <Text style={styles.passwordLabel}>Generated Password</Text>
              <Text style={styles.passwordValue}>{generatedPassword}</Text>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Student Details</Text>

            <InputField
              label="Full Name"
              icon="account"
              value={fullName}
              onChangeText={setFullName}
              placeholder="e.g. John Doe"
              required
              hasSubmitted={hasSubmitted}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
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
              <View style={{ flex: 1, marginLeft: 8 }}>
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

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
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
              <View style={{ flex: 1, marginLeft: 8 }}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Status</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons name="toggle-switch" size={20} color={status === 'active' ? '#16A34A' : '#64748B'} style={styles.inputIcon} />
                    <Picker
                      selectedValue={status}
                      style={{ flex: 1, color: '#1E293B', marginLeft: -8 }}
                      onValueChange={(v) => setStatus(v as 'active' | 'inactive')}
                    >
                      <Picker.Item label="Active" value="active" />
                      <Picker.Item label="Inactive" value="inactive" />
                    </Picker>
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

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Fee Structure</Text>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <InputField
                  label="Hostel Fee"
                  icon="bed"
                  value={hostelFee}
                  onChangeText={setHostelFee}
                  placeholder="0.00"
                  keyboardType="numeric"
                  hasSubmitted={hasSubmitted}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <InputField
                  label="Mess Fee"
                  icon="food"
                  value={messFee}
                  onChangeText={setMessFee}
                  placeholder="0.00"
                  keyboardType="numeric"
                  hasSubmitted={hasSubmitted}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Payment Frequency</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="calendar-clock" size={20} color={feeFrequency ? '#004e92' : '#64748B'} style={styles.inputIcon} />
                <Picker
                  selectedValue={feeFrequency}
                  style={{ flex: 1, color: '#1E293B', marginLeft: -8 }}
                  onValueChange={(v) => setFeeFrequency(v)}
                >
                  <Picker.Item label="Monthly" value="Monthly" />
                  <Picker.Item label="Quarterly" value="Quarterly" />
                  <Picker.Item label="Yearly" value="Yearly" />
                </Picker>
              </View>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
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
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  headerBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 120, // Extended header background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
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
  scrollContent: {
    paddingHorizontal: 20,
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 6,
    marginTop: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  navItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  navItemActive: {
    backgroundColor: '#EFF6FF',
  },
  navItemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  navItemLabelActive: {
    color: '#004e92',
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#64748B',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  generatorCard: {
    backgroundColor: '#fff',
    borderLeftWidth: 4,
    borderLeftColor: '#16A34A',
  },
  generatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  generatorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  generatorSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  passwordBox: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  passwordLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    color: '#15803D',
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 1,
  },
  passwordValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#166534',
    letterSpacing: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    height: 56,
    paddingHorizontal: 16,
  },
  inputWrapperFocused: {
    borderColor: '#004e92',
    backgroundColor: '#F0F9FF',
    // Removed elevation and shadow to prevent flickering on focus
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    height: '100%',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 24,
  },
  submitButton: {
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#004e92',
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
});
