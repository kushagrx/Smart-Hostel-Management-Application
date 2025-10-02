import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { emergencyContacts, faqData } from '../utils/complaintsUtils';

export default function Complaints() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: "Support & Complaints",
          headerStyle: { backgroundColor: '#FF8C00' },
          headerTintColor: '#fff',
        }} 
      />

      {/* Emergency Contacts Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>24/7 EMERGENCY CONTACTS</Text>
        <View style={styles.contactsContainer}>
          {emergencyContacts.map((contact, index) => (
            <Pressable 
              key={index} 
              style={[styles.contactCard, styles.shadowProp]}
              onPress={() => {/* Implement call functionality */}}
            >
              <MaterialIcons name="phone" size={24} color="#FF8C00" />
              <View>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactNumber}>{contact.number}</Text>
              </View>
              <MaterialIcons name="call" size={24} color="#4CAF50" style={styles.callIcon} />
            </Pressable>
          ))}
        </View>
      </View>

      {/* Actions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>RAISE COMPLAINT</Text>
        <View style={styles.actionsGrid}>
          <Pressable 
            style={[styles.actionButton, styles.shadowProp]}
            onPress={() => router.push('/new-complaint')}
          >
            <MaterialIcons name="add-circle" size={32} color="#FF8C00" />
            <Text style={styles.actionText}>New Complaint</Text>
          </Pressable>
          <Pressable 
            style={[styles.actionButton, styles.shadowProp]}
            onPress={() => router.push('/my-complaints')}
          >
            <MaterialIcons name="history" size={32} color="#FF8C00" />
            <Text style={styles.actionText}>My Complaints</Text>
          </Pressable>
        </View>
      </View>

      {/* FAQs Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>FREQUENTLY ASKED QUESTIONS</Text>
        <View style={styles.faqContainer}>
          {faqData.map((faq, index) => (
            <Pressable 
              key={index} 
              style={[styles.faqCard, styles.shadowProp]}
            >
              <Text style={styles.question}>{faq.question}</Text>
              <Text style={styles.answer}>{faq.answer}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 15,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 15,
    color: '#2d3436',
    letterSpacing: 1,
  },
  contactsContainer: {
    gap: 12,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    gap: 12,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
  },
  contactNumber: {
    color: '#636e72',
  },
  callIcon: {
    marginLeft: 'auto',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  actionButton: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    width: '47%',
    aspectRatio: 1,
  },
  actionText: {
    marginTop: 8,
    color: '#2d3436',
    fontWeight: '600',
    textAlign: 'center',
  },
  faqContainer: {
    gap: 12,
  },
  faqCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 8,
  },
  answer: {
    color: '#636e72',
    lineHeight: 20,
  },
  shadowProp: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
});