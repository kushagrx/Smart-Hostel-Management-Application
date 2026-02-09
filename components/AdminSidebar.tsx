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
const DRAWER_WIDTH = SCREEN_WIDTH * 0.8;

type NavItem = {
  id: string;
  label: string;
  icon: any; // MaterialCommunityIcons name
  color: string;
  path?: string; // If leaf node
  children?: NavItem[];
};

export const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Home', icon: 'home', color: '#3B82F6', path: '/admin' },
  { id: 'studentManagement', label: 'Student Management', icon: 'account-school', color: '#6366F1', path: '/admin/student-management' },
  { id: 'facilities', label: 'Hostel Management', icon: 'office-building', color: '#10B981', path: '/admin/facilities' },
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
      ],
      borderTopRightRadius: interpolate(progress.value, [0, 1], [0, 20]),
      borderBottomRightRadius: interpolate(progress.value, [0, 1], [0, 20]),
    };
  });

  const handleNavPress = (item: NavItem) => {
    if (!item.path) return;

    onClose();

    // Determine navigation method
    if (item.id === 'dashboard') {
      if (activeNav !== 'dashboard') {
        router.navigate('/admin');
      }
    } else {
      if (activeNav === 'dashboard') {
        router.push(item.path as any);
      } else {
        router.replace(item.path as any);
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
              // const { getAuthSafe } = await import('../utils/firebase');
              // const { signOut } = await import('firebase/auth');
              // const auth = getAuthSafe();
              // if (auth) await signOut(auth);

              await setStoredUser(null);
              onClose();
              router.replace('/login');

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

  const renderNavItem = (item: NavItem, level = 0) => {
    const isActive = activeNav === item.id;

    return (
      <View key={item.id}>
        <TouchableOpacity
          style={[
            styles.navItem,
            isActive && styles.navItemActive,
            { paddingLeft: 20 + (level * 20) }
          ]}
          onPress={() => handleNavPress(item)}
        >
          <View style={[styles.navIconContainer, isActive && { backgroundColor: item.color + '20' }]}>
            <MaterialIcons
              name={item.icon}
              size={22}
              color={isActive ? item.color : colors.textSecondary}
            />
          </View>
          <Text style={[
            styles.navText,
            { color: isActive ? item.color : colors.textSecondary, fontWeight: isActive ? '700' : '600', flex: 1 }
          ]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      </View>
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
          <Text style={styles.sidebarTitle}>SmartStay</Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.navContainer} showsVerticalScrollIndicator={false}>
          {navItems.map(item => renderNavItem(item))}
        </ScrollView>

        <TouchableOpacity style={[styles.logoutBtn, { borderTopColor: colors.border }]} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
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
  },
  overlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sidebarPanel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: DRAWER_WIDTH,
    elevation: 20,
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  sidebarTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  navContainer: {
    paddingVertical: 16,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingRight: 20,
    marginBottom: 4,
  },
  navItemActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderRightWidth: 3,
    borderRightColor: '#3B82F6',
  },
  navIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  navText: {
    fontSize: 15,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderTopWidth: 1,
    marginTop: 'auto',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
    marginLeft: 12,
  },
});
