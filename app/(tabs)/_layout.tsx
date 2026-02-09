import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {
  createMaterialTopTabNavigator,
  MaterialTopTabNavigationEventMap,
  MaterialTopTabNavigationOptions,
} from '@react-navigation/material-top-tabs';
import { ParamListBase, TabNavigationState } from '@react-navigation/native';
import { withLayoutContext } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../utils/ThemeContext';

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

const AnimatedIcon = ({ name, focused, color }: { name: any, focused: boolean, color: string }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withSpring(focused ? 1.2 : 1, { mass: 0.5, damping: 10, stiffness: 150 }) }
      ],
      // No opacity change effectively, letting the color handle focus state visibility clearly
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <MaterialCommunityIcons name={name} size={24} color={color} />
    </Animated.View>
  );
};

const _layout = () => {
  const { colors, isDark } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <MaterialTopTabs
        tabBarPosition="bottom"
        screenOptions={{
          tabBarActiveTintColor: colors.primary, // Brand Color for active
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: isDark ? '#1e293b' : '#ffffff', // Clean capsule
            position: 'absolute',
            bottom: 10,
            left: 30, // Increased margin
            right: 30, // Increased margin
            borderRadius: 35,
            height: 55, // Reduced height
            borderTopWidth: 0,
            elevation: 4,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            justifyContent: 'center',
            paddingBottom: 0,
          },
          tabBarIndicatorStyle: {
            height: 0,
            backgroundColor: 'transparent',
          },
          tabBarLabelStyle: {
            fontSize: 9,
            fontWeight: '600',
            textTransform: 'capitalize',
            marginTop: -4,
            marginBottom: 2,
          },
          tabBarIconStyle: {
            marginTop: 4,
          },
          swipeEnabled: true,
          animationEnabled: true,
        }}
      >
        <MaterialTopTabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <AnimatedIcon name={focused ? "home" : "home-outline"} focused={focused} color={color} />
            )
          }}
        />

        <MaterialTopTabs.Screen
          name="emergency"
          options={{
            title: 'Emergency',
            tabBarIcon: ({ color, focused }) => (
              <AnimatedIcon name={focused ? "phone-alert" : "phone-alert-outline"} focused={focused} color={color} />
            )
          }}
        />

        <MaterialTopTabs.Screen
          name="payments"
          options={{
            title: 'Payments',
            tabBarIcon: ({ color, focused }) => (
              <AnimatedIcon name={focused ? "wallet" : "wallet-outline"} focused={focused} color={color} />
            )
          }}
        />

        <MaterialTopTabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, focused }) => (
              <AnimatedIcon name={focused ? "cog" : "cog-outline"} focused={focused} color={color} />
            )
          }}
        />
      </MaterialTopTabs>
    </View>
  )
}

export default _layout