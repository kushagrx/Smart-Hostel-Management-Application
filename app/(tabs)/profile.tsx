import { View, Text, StyleSheet, Pressable } from 'react-native'
import React from 'react'
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { getInitial, userData } from '../../utils/nameUtils';

const Profile = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Profile</Text>

      <View style={styles.profileSection}>
        <View style={styles.profilePic}>
          <Text style={styles.profileInitial}>{getInitial(userData.fullName)}</Text>
        </View>
        <Text style={styles.name}>{userData.fullName}</Text>
        <Text style={styles.roomNo}>{userData.roomNo}</Text>
      </View>

      <Text style={styles.sectionTitle}>Quick Info</Text>
      <View style={styles.infoCard}>
        <View style={styles.infoItem}>
          <MaterialCommunityIcons name="cash" size={24} color="#2196F3" />
          <View>
            <Text style={styles.infoLabel}>Current Dues:</Text>
            <Text style={styles.infoValue}>₹1500</Text>
          </View>
          <Pressable style={styles.payButton}>
            <Text style={styles.payButtonText}>Pay Now</Text>
          </Pressable>
        </View>
        <View style={styles.infoItem}>
          <MaterialCommunityIcons name="wifi" size={24} color="#2196F3" />
          <View>
            <Text style={styles.infoLabel}>Wi-Fi:</Text>
            <Text style={styles.infoValue}>Hostel_SSID</Text>
          </View>
          <Text style={styles.copyHint}>(Tap to copy)</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Details</Text>
      <View style={styles.detailsCard}>
        <Pressable style={styles.detailItem}>
          <MaterialCommunityIcons name="phone-alert" size={24} color="#666" />
          <Text style={styles.detailText}>Emergency Contact</Text>
          <Text style={styles.viewEdit}>View/Edit</Text>
        </Pressable>
        <Pressable style={styles.detailItem}>
          <MaterialCommunityIcons name="file-document" size={24} color="#666" />
          <Text style={styles.detailText}>Hostel Policies</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
        </Pressable>
      </View>

      <Pressable style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 40,
    marginBottom: 30,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profilePic: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileInitial: {
    color: 'white',
    fontSize: 32,
    fontWeight: '600',
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 5,
  },
  roomNo: {
    fontSize: 16,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 15,
    padding: 15,
    marginBottom: 25,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 15,
  },
  infoLabel: {
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontWeight: '500',
  },
  payButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 'auto',
  },
  payButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  copyHint: {
    color: '#666',
    marginLeft: 'auto',
    fontSize: 12,
  },
  detailsCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 25,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    gap: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailText: {
    flex: 1,
    fontSize: 16,
  },
  viewEdit: {
    color: '#2196F3',
  },
  logoutButton: {
    backgroundColor: '#FF5252',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Profile;