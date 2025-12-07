import { View, Text, StyleSheet, TextInput, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

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
      const { getDbSafe } = await import('../../utils/firebase');
      const { getAuthSafe } = await import('../../utils/authUtils');
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      const { fetchUserData } = await import('../../utils/nameUtils');

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
      low: 'low-priority',
      medium: 'priority-high',
      high: 'warning',
      emergency: 'error'
    };
    return icons[priorityLevel] || icons.low;
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: "New Complaint",
          headerStyle: { backgroundColor: '#FF8C00' },
          headerTintColor: '#fff',
          headerShadowVisible: false,
        }} 
      />

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Title
            <Text style={styles.required}> *</Text>
          </Text>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="error-outline" size={20} color="#666" />
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter your issue"
              placeholderTextColor="#999"
            />
          </View>
        </View>

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
                  priority === level && styles[`priority${capitalize(level)}`],
                ]}
                onPress={() => setPriority(level)}
              >
                <MaterialIcons 
                  name={getPriorityIcon(level)} 
                  size={20} 
                  color={priority === level ? '#fff' : '#666'} 
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

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Description
            <Text style={styles.required}> *</Text>
          </Text>
          <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Please provide detailed description of your complaint"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        <Pressable 
          style={[
            styles.submitButton,
            (!title || !description) && styles.submitButtonDisabled
          ]} 
          onPress={handleSubmit}
          disabled={!title || !description || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <MaterialIcons name="send" size={20} color="white" />
              <Text style={styles.submitButtonText}>Submit Complaint</Text>
            </>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  form: {
    padding: 20,
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#2d3436',
    marginBottom: 4,
  },
  required: {
    color: '#FF5252',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#2d3436',
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
    paddingTop: 12,
  },
  textArea: {
    height: 100,
  },
  priorityContainer: {
    flexDirection: 'row',
    paddingVertical: 4,
    gap: 10,
  },
  priorityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ccc',
    gap: 8,
  },
  priorityLow: {
    backgroundColor: '#A5D6A7',
    borderColor: '#4CAF50',
  },
  priorityMedium: {
    backgroundColor: '#FFE082',
    borderColor: '#FFB300',
  },
  priorityHigh: {
    backgroundColor: '#EF9A9A',
    borderColor: '#E53935',
  },
  priorityEmergency: {
    backgroundColor: '#EF5350',
    borderColor: '#B71C1C',
  },
  priorityText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#666',
  },
  priorityTextSelected: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#FF8C00',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#FFE0B2',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});