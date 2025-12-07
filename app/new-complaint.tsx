import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuthSafe, getDbSafe } from '../utils/firebase';
import { fetchUserData } from '../utils/nameUtils';

export default function NewComplaint() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'emergency'>('low');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!title || !description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const db = getDbSafe();
      const auth = getAuthSafe();

      if (!db || !auth?.currentUser?.email) {
        Alert.alert('Error', 'Not authenticated');
        setIsSubmitting(false);
        return;
      }

      const userData = await fetchUserData();

      const complaintRef = collection(db, 'complaints');
      await addDoc(complaintRef, {
        title,
        description,
        priority,
        status: 'open',
        category: 'general',
        studentEmail: auth.currentUser.email,
        studentName: userData?.fullName || 'Student',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      Alert.alert('Success', 'Complaint submitted successfully');
      router.back();
    } catch (error) {
      console.error('Error submitting complaint:', error);
      Alert.alert('Error', 'Failed to submit complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityIcon = (priorityLevel: string): any => {
    const icons: Record<string, string> = {
      low: 'check-circle-outline',
      medium: 'alert-circle-outline',
      high: 'alert',
      emergency: 'alert-decagram'
    };
    return icons[priorityLevel] || icons.low;
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <LinearGradient
        colors={['#000428', '#004e92']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView edges={['top', 'left', 'right']}>
          <View style={styles.headerContent}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <MaterialIcons name="arrow-back" size={24} color="#fff" />
            </Pressable>
            <View>
              <Text style={styles.headerTitle}>New Complaint</Text>
              <Text style={styles.headerSubtitle}>Raise an Issue</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          {/* Title Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="edit" size={20} color="#64748B" />
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Briefly summarize the issue"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          {/* Priority Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Priority Level</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.priorityContainer}
            >
              {(['low', 'medium', 'high', 'emergency'] as const).map((level) => (
                <Pressable
                  key={level}
                  style={[
                    styles.priorityButton,
                    priority === level && styles.prioritySelected,
                    priority === level && styles[`bg${capitalize(level)}`],
                  ]}
                  onPress={() => setPriority(level)}
                >
                  <MaterialCommunityIcons
                    name={getPriorityIcon(level)}
                    size={18}
                    color={priority === level ? '#fff' : '#64748B'}
                  />
                  <Text style={[
                    styles.priorityText,
                    priority === level && styles.priorityTextSelected
                  ]}>
                    {capitalize(level)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Description Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Provide details about the problem..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Submit Button */}
          <Pressable
            style={[styles.submitContainer, (!title || !description) && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={!title || !description || isSubmitting}
          >
            <LinearGradient
              colors={['#000428', '#004e92']}
              style={styles.submitButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <View style={styles.btnContent}>
                  <Text style={styles.submitButtonText}>Submit Complaint</Text>
                  <MaterialIcons name="send" size={18} color="white" />
                </View>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: "#004e92",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  headerContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  content: {
    padding: 24,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginLeft: 4,
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
    paddingVertical: 0,
  },
  textArea: {
    height: 100,
    marginTop: 12,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  priorityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  prioritySelected: {
    borderWidth: 0,
  },
  bgLow: { backgroundColor: '#10B981' }, // Green
  bgMedium: { backgroundColor: '#F59E0B' }, // Amber
  bgHigh: { backgroundColor: '#F97316' }, // Orange
  bgEmergency: { backgroundColor: '#EF4444' }, // Red

  priorityText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  priorityTextSelected: {
    color: '#fff',
  },
  submitContainer: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#004e92',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});