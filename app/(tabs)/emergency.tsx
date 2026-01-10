import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmergencyContact, subscribeToContacts } from '../../utils/emergencySyncUtils';
import { useTheme } from '../../utils/ThemeContext';

export default function Emergency() {
  const { colors } = useTheme();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToContacts((data) => {
      setContacts(data);
    });
    return () => unsubscribe();
  }, []);

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
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
            <View>
              <Text style={styles.headerTitle}>Emergency</Text>
              <Text style={styles.headerSubtitle}>24/7 Support & Help</Text>
            </View>
            <View style={styles.sosIconContainer}>
              <MaterialCommunityIcons name="alarm-light" size={28} color="#EF4444" />
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >

        {/* Helper Banner */}
        <View style={styles.banner}>
          <MaterialCommunityIcons name="information-outline" size={24} color="#004e92" />
          <Text style={styles.bannerText}>
            Tap on any contact card below to initiate an immediate call.
          </Text>
        </View>

        <View style={styles.contactsContainer}>
          {contacts.map((contact, index) => (
            <Pressable
              key={contact.id}
              style={[styles.contactCard, styles.shadowProp]}
              onPress={() => handleCall(contact.number)}
            >
              <View style={styles.cardInner}>
                <View style={[styles.iconBox, { backgroundColor: index === 0 ? '#FEF2F2' : '#EFF6FF' }]}>
                  <MaterialCommunityIcons
                    name={contact.icon as any || 'phone-in-talk'}
                    size={24}
                    color={index === 0 ? "#EF4444" : "#004e92"}
                  />
                </View>

                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.title} {contact.name ? `• ${contact.name}` : ''}</Text>
                  <Text style={styles.contactNumber}>{contact.number}</Text>
                </View>

                <View style={[styles.callBtn, { backgroundColor: index === 0 ? '#EF4444' : '#10B981' }]}>
                  <MaterialIcons name="call" size={20} color="#fff" />
                </View>
              </View>
            </Pressable>
          ))}
        </View>



      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginTop: 4,
  },
  sosIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    gap: 12,
  },
  bannerText: {
    flex: 1,
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
    fontWeight: '500',
  },
  contactsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  contactCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  contactNumber: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sosButton: {
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 8,
  },
  sosGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  sosTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  sosSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  shadowProp: {
    shadowColor: '#64748B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
});