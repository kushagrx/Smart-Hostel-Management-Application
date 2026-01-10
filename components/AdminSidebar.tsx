import { MaterialCommunityIcons as MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  SharedValue,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlert } from '../context/AlertContext';
import { setStoredUser } from '../utils/authUtils';
import { useTheme } from '../utils/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = 280;

export const navItems = [
  { id: 'dashboard', label: 'Home', icon: 'home', color: '#3B82F6' },
  { id: 'students', label: 'Students', icon: 'account-group', color: '#6366F1' },
  { id: 'rooms', label: 'Rooms', icon: 'door-closed', color: '#8B5CF6' },
  { id: 'complaints', label: 'Complaints', icon: 'alert-circle', color: '#EC4899' },
  { id: 'leaves', label: 'Leaves', icon: 'calendar-clock', color: '#06B6D4' },
  { id: 'services', label: 'Services', icon: 'room-service', color: '#10B981' },
  { id: 'notices', label: 'Notices', icon: 'bullhorn', color: '#3B82F6' },
  { id: 'busTimings', label: 'Bus Timings', icon: 'bus-clock', color: '#F59E0B' },
  { id: 'messMenu', label: 'Mess Menu', icon: 'food-fork-drink', color: '#EC4899' },
  { id: 'laundry', label: 'Laundry', icon: 'washing-machine', color: '#06B6D4' },
  { id: 'emergency', label: 'Emergency', icon: 'phone-alert', color: '#EF4444' },
];

interface AdminSidebarProps {
  // Supports either modern drawerProgress (fluid) or legacy visible (boolean toggle)
  visible?: boolean;
  onClose: () => void;
  activeNav: string;
  drawerProgress?: SharedValue<number>;
}

export default function AdminSidebar({ onClose, activeNav, drawerProgress, visible = false }: AdminSidebarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { colors, isDark } = useTheme();
  const { showAlert } = useAlert();

  // Animations
  // If drawerProgress is not provided, create a local one based on `visible` prop for backward compatibility
  const localProgress = useDerivedValue(() => {
    return visible ? withTiming(1, { duration: 300 }) : withTiming(0, { duration: 250 });
  }, [visible]);

  const progress = drawerProgress || localProgress;

  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(progress.value, [0, 1], [0, 1]),
      // Hide completely when closed to let clicks pass through
      zIndex: progress.value > 0.05 ? 2000 : -1,
      display: progress.value === 0 ? 'none' : 'flex'
    };
  });

  const panelStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: interpolate(progress.value, [0, 1], [-DRAWER_WIDTH, 0]) }
      ]
    };
  });

  const handleNavPress = (id: string) => {
    onClose();

    // Determine the target path
    let targetPath = '';
    if (id === 'dashboard') targetPath = '/admin';
    else if (id === 'services') targetPath = '/admin/services';
    else if (id === 'students') targetPath = '/admin/students';
    else if (id === 'rooms') targetPath = '/admin/rooms';
    else if (id === 'complaints') targetPath = '/admin/complaints';
    else if (id === 'leaves') targetPath = '/admin/leaveRequests';
    else if (id === 'notices') targetPath = '/admin/notices';
    else if (id === 'busTimings') targetPath = '/admin/busTimings';
    else if (id === 'messMenu') targetPath = '/admin/messMenu';
    else if (id === 'laundry') targetPath = '/admin/laundry';
    else if (id === 'emergency') targetPath = '/admin/emergency';

    // If target is dashboard
    if (id === 'dashboard') {
      if (activeNav !== 'dashboard') {
        // Unwind to dashboard
        router.navigate('/admin');
      }
    } else {
      // Navigating to sibling page
      if (activeNav === 'dashboard') {
        // From dashboard, push
        router.push(targetPath as any);
      } else {
        // From another sibling, replace to keep stack flat (Home -> Sibling)
        router.replace(targetPath as any);
      }
    }
  };

  const handleLogout = async () => {
    showAlert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel", onPress: onClose },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              const { getAuthSafe } = await import('../utils/firebase');
              const { signOut } = await import('firebase/auth');
              const auth = getAuthSafe();
              if (auth) await signOut(auth);

              await setStoredUser(null);
              onClose();
              router.replace('/login');
            } catch (e) {
              console.error(e);
            }
          },
        },
      ]
    );
  };

  return (
    <Animated.View style={[styles.sidebarOverlay, { top: 0, bottom: 0 }, overlayStyle]}>
      <TouchableOpacity
        style={styles.overlayBackground}
        onPress={onClose}
        activeOpacity={1}
      />
      <Animated.View style={[styles.sidebarPanel, { backgroundColor: colors.card, shadowColor: '#000' }, panelStyle]}>
        <LinearGradient colors={['#000428', '#004e92']} style={[styles.sidebarHeader, { paddingTop: insets.top + 24 }]}>
          <Text style={styles.sidebarTitle}>Smart Hostel</Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView
          style={styles.sidebarScrollView}
          contentContainerStyle={styles.sidebarScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            // For active items, we use generic blue tint. 
            // For inactive, separate colors for dark mode vs light mode
            const bg = isActive ? (isDark ? 'rgba(59,130,246,0.2)' : '#EFF6FF') : 'transparent';
            const iconBg = isActive ? colors.primary : (isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9');
            const iconColor = isActive ? '#fff' : (isDark ? colors.textSecondary : '#64748B');
            const textColor = isActive ? (isDark ? '#bfdbfe' : colors.primary) : colors.textSecondary;

            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.sidebarItem, { backgroundColor: bg }]}
                onPress={() => handleNavPress(item.id)}
              >
                <View style={[styles.sidebarIconContainer, { backgroundColor: iconBg }]}>
                  <MaterialIcons name={item.icon as any} size={22} color={iconColor} />
                </View>
                <Text style={[styles.sidebarItemLabel, { color: textColor, fontWeight: isActive ? '700' : '600' }]}>
                  {item.label}
                </Text>
                {isActive && (
                  <MaterialIcons name="chevron-right" size={20} color={isDark ? '#bfdbfe' : colors.primary} />
                )}
              </TouchableOpacity>
            );
          })}

          <View style={[styles.sidebarDivider, { backgroundColor: colors.border }]} />

          <TouchableOpacity
            style={styles.sidebarLogoutItem}
            onPress={handleLogout}
          >
            <View style={[styles.sidebarIconContainer, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEF2F2' }]}>
              <MaterialIcons name="logout" size={22} color="#EF4444" />
            </View>
            <Text style={styles.sidebarLogoutLabel}>Log Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sidebarOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 2000,
    flexDirection: 'row',
  },
  overlayBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  sidebarPanel: {
    width: 280,
    height: '100%',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  sidebarHeader: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sidebarTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  sidebarScrollView: {
    flex: 1,
    paddingVertical: 12,
  },
  sidebarScrollContent: {
    paddingBottom: 40,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
  },
  sidebarIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  sidebarItemLabel: {
    flex: 1,
    fontSize: 15,
  },
  sidebarDivider: {
    height: 1,
    marginHorizontal: 24,
    marginVertical: 16,
  },
  sidebarLogoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
  },
  sidebarLogoutLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EF4444',
  },
});
