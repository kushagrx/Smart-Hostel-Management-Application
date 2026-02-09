import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../../utils/authUtils';
import { EmergencyContact, subscribeToContacts } from '../../utils/emergencySyncUtils';
import { fetchUserData, StudentData } from '../../utils/nameUtils';
import { useTheme } from '../../utils/ThemeContext';

export default function Emergency() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const user = useUser();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [userData, setUserData] = useState<StudentData | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToContacts((data) => {
      setContacts(data);
    });

    // Fetch user data for medical info
    fetchUserData().then(setUserData);

    return () => unsubscribe();
  }, []);

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ padding: 24 }}>
          {/* Helper Banner */}
          <View style={[styles.banner, {
            backgroundColor: isDark ? colors.card : '#EFF6FF',
            borderColor: isDark ? colors.border : '#DBEAFE'
          }]}>
            <MaterialCommunityIcons name="information-outline" size={24} color={isDark ? colors.primary : "#004e92"} />
            <Text style={[styles.bannerText, { color: isDark ? colors.text : '#1E40AF' }]}>
              Tap on any contact card below to initiate an immediate call.
            </Text>
          </View>

          {/* Support Chat Card */}
          <Pressable
            style={[styles.contactCard, styles.shadowProp, {
              backgroundColor: isDark ? colors.card : '#FFFFFF',
              borderColor: colors.border,
              marginBottom: 24
            }]}
            // @ts-ignore
            onPress={() => router.push(`/chat/${user?.uid || user?.email || 'guest'}`)}
          >
            <View style={styles.cardInner}>
              <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
                <MaterialCommunityIcons name="whatsapp" size={24} color="#25D366" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={[styles.contactName, { color: colors.text }]}>Admin Support Chat</Text>
                <Text style={[styles.contactNumber, { color: colors.textSecondary }]}>Direct Message to Hostel Admin</Text>
              </View>
              <View style={[styles.callBtn, { backgroundColor: '#25D366' }]}>
                <MaterialCommunityIcons name="message-text" size={20} color="#fff" />
              </View>
            </View>
          </Pressable>

          {/* Medical Profile Card */}
          {userData && (
            <View style={{ marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingHorizontal: 4 }}>
                <MaterialCommunityIcons name="medical-bag" size={20} color={isDark ? colors.text : '#1E293B'} />
                <Text style={{ fontSize: 16, fontWeight: '700', color: isDark ? colors.text : '#1E293B', marginLeft: 8 }}>
                  My Medical Profile
                </Text>
              </View>

              <View style={[styles.contactCard, styles.shadowProp, { backgroundColor: colors.card, borderColor: colors.border, padding: 16 }]}>
                <View style={{ flexDirection: 'row', gap: 16 }}>
                  {/* Blood Group Badge */}
                  <View style={{
                    width: 60, height: 60,
                    borderRadius: 16,
                    backgroundColor: '#FEF2F2',
                    justifyContent: 'center', alignItems: 'center',
                    borderWidth: 1, borderColor: '#FECACA'
                  }}>
                    <MaterialIcons name="water" size={24} color="#EF4444" />
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#B91C1C', marginTop: 2 }}>
                      {userData.bloodGroup || 'N/A'}
                    </Text>
                  </View>

                  <View style={{ flex: 1, justifyContent: 'center' }}>
                    <View style={{ marginBottom: 8 }}>
                      <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 2 }}>Specific Emergency Contact</Text>
                      <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>{userData.emergencyContactName || 'Not set'}</Text>
                      {userData.emergencyContactPhone && userData.emergencyContactPhone !== 'N/A' && (
                        <Text style={{ fontSize: 13, color: colors.primary, fontWeight: '600' }} onPress={() => handleCall(userData.emergencyContactPhone!)}>
                          {userData.emergencyContactPhone}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>

                {(userData.medicalHistory && userData.medicalHistory !== 'None') && (
                  <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border }}>
                    <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>Medical History / Allergies</Text>
                    <Text style={{ fontSize: 14, color: colors.text, lineHeight: 20 }}>
                      {userData.medicalHistory}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          <View style={styles.contactsContainer}>
            {contacts.map((contact, index) => (
              <Pressable
                key={contact.id}
                style={[styles.contactCard, styles.shadowProp, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => handleCall(contact.number)}
              >
                <View style={styles.cardInner}>
                  <View style={[styles.iconBox, { backgroundColor: index === 0 ? '#FEF2F2' : (isDark ? '#172554' : '#EFF6FF') }]}>
                    <MaterialCommunityIcons
                      name={contact.icon as any || 'phone-in-talk'}
                      size={24} // keeping red for emergency
                      color={index === 0 ? "#EF4444" : (isDark ? '#60A5FA' : "#004e92")}
                    />
                  </View>

                  <View style={styles.contactInfo}>
                    <Text style={[styles.contactName, { color: colors.text }]}>{contact.title} {contact.name ? `• ${contact.name}` : ''}</Text>
                    <Text style={[styles.contactNumber, { color: colors.textSecondary }]}>{contact.number}</Text>
                  </View>

                  <View style={[styles.callBtn, { backgroundColor: index === 0 ? '#EF4444' : '#10B981' }]}>
                    <MaterialIcons name="call" size={20} color="#fff" />
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
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
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
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
    borderRadius: 20,
    borderWidth: 1,
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