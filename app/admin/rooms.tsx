
import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAlert } from '../../context/AlertContext';
import { isAdmin, useUser } from '../../utils/authUtils';

import { useTheme } from '../../utils/ThemeContext';

export default function RoomsPage() {
  const { colors, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useUser();
  const router = useRouter();
  const { showAlert } = useAlert();
  const { search, openRoomId } = useLocalSearchParams();

  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  React.useEffect(() => {
    if (search) {
      setSearchQuery(search as string);
    }
  }, [search]);

  // Auto-expand room if openRoomId is provided and exists in loaded rooms
  React.useEffect(() => {
    if (openRoomId && rooms.length > 0) {
      const exists = rooms.some(r => r.id === openRoomId);
      if (exists) {
        setSelectedRoom(openRoomId as string);
      }
    }
  }, [openRoomId, rooms]);

  React.useEffect(() => {
    // Wait for user to be verified as admin
    if (!isAdmin(user)) return;

    let unsubscribe: () => void;

    const fetchRooms = async () => {
      try {
        const { getDbSafe } = await import('../../utils/firebase');
        const { collection, query, orderBy, onSnapshot } = await import('firebase/firestore');
        const db = getDbSafe();
        if (!db) return;

        const q = query(collection(db, 'rooms'), orderBy('number', 'asc'));
        unsubscribe = onSnapshot(q, (snapshot) => {
          const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setRooms(list);
          setLoading(false);
        }, (error) => {
          console.error("Error subscribing to rooms:", error);
          setLoading(false);
        });
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    };

    fetchRooms();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);



  const occupiedRooms = rooms.filter((r) => r.status === 'full' || r.status === 'occupied').length; // full is also occupied
  const vacantRooms = rooms.filter((r) => r.status === 'vacant').length;

  const filteredRooms = rooms.filter((room) =>
    room.number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied':
      case 'full':
        return '#06B6D4';
      case 'vacant':
        return '#8B5CF6';
      case 'maintenance':
        return '#EC4899';
      default:
        return '#94A3B8';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'occupied':
      case 'full':
        return 'check-circle';
      case 'vacant':
        return 'home-outline';
      case 'maintenance':
        return 'wrench';
      default:
        return 'help-circle';
    }
  };


  const getOccupantNames = (item: any) => {
    if (item.occupantDetails && item.occupantDetails.length > 0) {
      return item.occupantDetails.map((d: any) => d.name).join(', ');
    }
    return 'Vacant';
  };

  const handleDeleteRoom = async (roomNo: string) => {
    showAlert(
      'Confirm Delete',
      `Are you sure you want to delete Room ${roomNo}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => { },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { getDbSafe } = await import('../../utils/firebase');
              const { deleteRoom } = await import('../../utils/roomUtils');
              const db = getDbSafe();
              if (db) {
                await deleteRoom(db, roomNo);
                showAlert('Success', `Room ${roomNo} deleted.`, [], 'success');
              }
            } catch (e: any) {
              showAlert('Error', e.message, [], 'error');
            }
          },
        },
      ],
      'warning'
    );
  };

  const styles = React.useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      paddingBottom: 20,
      minHeight: '100%',
    },
    header: {
      paddingVertical: 24,
      paddingHorizontal: 24,
      marginBottom: 24,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: colors.primary,
      shadowOpacity: 0.25,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 12,
      elevation: 8,
    },
    headerContent: {
      flex: 1,
      alignItems: 'center',
      marginRight: 28,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: '#fff',
      letterSpacing: 0.5,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    statsContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      marginBottom: 24,
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 16,
      alignItems: 'center',
      shadowColor: colors.textSecondary,
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 16,
      elevation: 3,
    },
    statValue: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
      marginTop: 8,
    },
    statLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
      marginTop: 2,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 20,
      marginBottom: 20,
      backgroundColor: colors.card,
      borderRadius: 16,
      paddingHorizontal: 16,
      shadowColor: colors.textSecondary,
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 16,
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchIcon: {
      marginRight: 10,
      opacity: 0.5,
      color: colors.textSecondary,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 14,
      fontSize: 15,
      color: colors.text,
      fontWeight: '500',
    },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    roomCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      marginBottom: 16,
      overflow: 'hidden',
      shadowColor: colors.textSecondary,
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 16,
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.border,
    },
    roomCardActive: {
      borderColor: colors.primary,
      borderWidth: 1.5,
      shadowColor: colors.primary,
      shadowOpacity: 0.15,
    },
    roomHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 18,
      justifyContent: 'space-between',
    },
    roomNumber: {
      backgroundColor: theme === 'dark' ? '#1E293B' : '#F1F5F9', // Matches border/slight offset
      borderRadius: 14,
      width: 52,
      height: 52,
      justifyContent: 'center',
      alignItems: 'center',
    },
    roomNumberText: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text, // Updated from #334155
    },
    roomInfo: {
      flex: 1,
      marginLeft: 16,
      justifyContent: 'center',
    },
    roomTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    roomCapacity: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 12,
    },
    statusText: {
      color: '#fff',
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    expandedContent: {
      backgroundColor: theme === 'dark' ? '#1E293B' : '#F8FAFC',
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    detailLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    detailValue: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
    },
    actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 12,
      gap: 8,
    },
    deleteBtn: {
      backgroundColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.2)' : '#EF4444',
      borderWidth: 1,
      borderColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.5)' : 'transparent',
    },
    actionBtnText: {
      color: theme === 'dark' ? '#EF4444' : '#fff',
      fontSize: 14,
      fontWeight: '700',
    },
  }), [colors, theme]);

  if (!isAdmin(user))
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Access denied.</Text>
      </View>
    );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#000428', '#004e92']} style={[styles.header, { paddingTop: 24 + insets.top }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="chevron-left" size={32} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Manage Rooms</Text>
          </View>
        </LinearGradient>



        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialIcons name="door-closed" size={24} color="#6366F1" />
            <Text style={styles.statValue}>{rooms.length}</Text>
            <Text style={styles.statLabel}>Total Rooms</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="check-circle" size={24} color="#06B6D4" />
            <Text style={styles.statValue}>{occupiedRooms}</Text>
            <Text style={styles.statLabel}>Occupied</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="home-outline" size={24} color="#10B981" />
            <Text style={styles.statValue}>{vacantRooms}</Text>
            <Text style={styles.statLabel}>Vacant</Text>
          </View>
        </View>

        {/* Action Button Styles (Defining here for convenience as they were removed/missing in styles object) */}
        {/* We will add them to the StyleSheet at the bottom instead in a separate edit if needed, or use inline/existing styles if compatible. */}
        {/* Let's double check styles. actionBtn and deleteBtn seem missing from Step 357 view. */}
        {/* I'll add the function first. */}

        <View style={styles.searchContainer}>
          <MaterialIcons name="magnify" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by room number..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <FlatList
          data={filteredRooms}
          scrollEnabled={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.roomCard,
                selectedRoom === item.id && styles.roomCardActive,
              ]}
              onPress={() => setSelectedRoom(selectedRoom === item.id ? null : item.id)}
            >
              <View style={styles.roomHeader}>
                <View style={styles.roomNumber}>
                  <Text style={styles.roomNumberText}>#{item.number}</Text>
                </View>
                <View style={styles.roomInfo}>
                  <Text style={styles.roomTitle}>
                    {getOccupantNames(item)}
                  </Text>
                  <Text style={styles.roomCapacity}>
                    Occupancy: {item.occupants?.length || 0}/{item.capacity || 2}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                  <MaterialIcons name={getStatusIcon(item.status)} size={16} color="#fff" />
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>

              {selectedRoom === item.id && (
                <View style={styles.expandedContent}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Room Number:</Text>
                    <Text style={styles.detailValue}>{item.number}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Occupants:</Text>
                    <Text style={styles.detailValue}>
                      {getOccupantNames(item)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Availability:</Text>
                    <Text style={styles.detailValue}>
                      {(item.capacity || 2) - (item.occupants?.length || 0)} spots left
                    </Text>
                  </View>
                  {(!item.occupants || item.occupants.length === 0) && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.deleteBtn, { marginTop: 16 }]}
                      onPress={() => handleDeleteRoom(item.number)}
                    >
                      <MaterialIcons name="delete" size={20} color={theme === 'dark' ? '#EF4444' : '#fff'} />
                      <Text style={styles.actionBtnText}>Delete Room</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 20, color: colors.textSecondary }}>No rooms found. Allot students to create rooms.</Text>
          }
        />
      </ScrollView>

    </SafeAreaView>
  );
}


