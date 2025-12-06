import { View, Text, StyleSheet, Pressable, ScrollView, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { emergencyContacts } from '../../utils/complaintsUtils';
import { useTheme } from '../../utils/ThemeContext';

export default function Emergency() {
  const { colors } = useTheme();

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="phone-alert" size={32} color="#FF8C00" />
          <Text style={[styles.headerTitle, { color: colors.text }]}>24/7 Emergency Contacts</Text>
        </View>

        <View style={styles.contactsContainer}>
          {emergencyContacts.map((contact, index) => (
            <Pressable 
              key={index}
              style={[styles.contactCard, styles.shadowProp, { backgroundColor: colors.cardBackground }]}
              onPress={() => handleCall(contact.number)}
            >
              <View style={styles.contactLeft}>
                <View style={[styles.iconCircle, { backgroundColor: colors.theme === 'dark' ? '#4d2e0a' : '#FFF3E0' }]}>
                  <MaterialCommunityIcons name="phone" size={24} color="#FF8C00" />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactName, { color: colors.text }]}>{contact.name}</Text>
                  <Text style={[styles.contactNumber, { color: colors.secondary }]}>{contact.number}</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={colors.icon} />
            </Pressable>
          ))}
        </View>

        <View style={[styles.infoBox, { backgroundColor: colors.theme === 'dark' ? '#4d2e0a' : '#FFF3E0' }]}>
          <MaterialCommunityIcons name="information" size={24} color="#FF8C00" />
          <Text style={[styles.infoText, { color: colors.theme === 'dark' ? '#FFB84D' : '#FF8C00' }]}>
            Tap on any contact to call immediately
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 20,
    gap: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
  },
  contactsContainer: {
    paddingHorizontal: 0,
    gap: 12,
    marginBottom: 20,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  contactNumber: {
    fontSize: 14,
    marginTop: 4,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontWeight: '500' as const,
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