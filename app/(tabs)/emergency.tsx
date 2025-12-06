import { View, Text, StyleSheet, Pressable, ScrollView, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { emergencyContacts } from '../../utils/complaintsUtils';

export default function Emergency() {
  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="phone-alert" size={32} color="#FF8C00" />
        <Text style={styles.headerTitle}>24/7 Emergency Contacts</Text>
      </View>

      <View style={styles.contactsContainer}>
        {emergencyContacts.map((contact, index) => (
          <Pressable 
            key={index}
            style={[styles.contactCard, styles.shadowProp]}
            onPress={() => handleCall(contact.number)}
          >
            <View style={styles.contactLeft}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="phone" size={24} color="#FF8C00" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactNumber}>{contact.number}</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
          </Pressable>
        ))}
      </View>

      <View style={styles.infoBox}>
        <MaterialCommunityIcons name="information" size={24} color="#FF8C00" />
        <Text style={styles.infoText}>
          Tap on any contact to call immediately
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2d3436',
  },
  contactsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
  },
  contactNumber: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  infoBox: {
    margin: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    color: '#FF8C00',
    fontWeight: '500',
    fontSize: 14,
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