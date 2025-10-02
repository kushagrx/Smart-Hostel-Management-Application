import { View, Text, StyleSheet, TextInput, ScrollView, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

export default function NewComplaint() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('maintenance');
  const [priority, setPriority] = useState('low');

  const handleSubmit = () => {
    // TODO: Implement complaint submission
    console.log({ title, description, category, priority });
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: "New Complaint",
          headerStyle: { backgroundColor: '#FF8C00' },
          headerTintColor: '#fff',
        }} 
      />

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Brief description of the issue"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={category}
              onValueChange={setCategory}
              style={styles.picker}
            >
              <Picker.Item label="Maintenance" value="maintenance" />
              <Picker.Item label="Cleanliness" value="cleanliness" />
              <Picker.Item label="Security" value="security" />
              <Picker.Item label="Mess Related" value="mess" />
              <Picker.Item label="Others" value="others" />
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.priorityContainer}>
            {['low', 'medium', 'high', 'emergency'].map((level) => (
              <Pressable
                key={level}
                style={[
                  styles.priorityButton,
                  priority === level && styles.selectedPriority,
                  { backgroundColor: getPriorityColor(level) }
                ]}
                onPress={() => setPriority(level)}
              >
                <Text style={[
                  styles.priorityText,
                  priority === level && styles.selectedPriorityText
                ]}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Detailed description of your complaint"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <Pressable style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Complaint</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const getPriorityColor = (priority: string) => {
  const colors = {
    low: '#E8F5E9',
    medium: '#FFF3E0',
    high: '#FFEBEE',
    emergency: '#FFE0E0'
  };
  return colors[priority] || colors.low;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  form: {
    padding: 20,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  priorityButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedPriority: {
    borderWidth: 2,
    borderColor: '#FF8C00',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  selectedPriorityText: {
    color: '#FF8C00',
  },
  submitButton: {
    backgroundColor: '#FF8C00',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});