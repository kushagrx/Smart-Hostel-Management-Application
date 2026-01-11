import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../utils/ThemeContext';

const _layout = () => {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Tabs screenOptions={{
        tabBarActiveTintColor: colors.primary, // Using theme color
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        headerShown: false,
      }}>
        <Tabs.Screen
          name="index"
          options={{
            headerShown: false,
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <MaterialCommunityIcons
                name={focused ? "home" : "home-outline"}
                size={24}
                color={color}
              />
            )
          }}
        />

        <Tabs.Screen
          name="alerts"
          options={{
            headerShown: false,
            title: 'Alerts',
            tabBarIcon: ({ color, focused }) => (
              <MaterialCommunityIcons
                name={focused ? "bell" : "bell-outline"}
                size={24}
                color={color}
              />
            )
          }}
        />

        <Tabs.Screen
          name="emergency"
          options={{
            headerShown: false,
            title: 'Emergency',
            tabBarIcon: ({ color, focused }) => (
              <MaterialCommunityIcons
                name={focused ? "phone-alert" : "phone-alert-outline"}
                size={24}
                color={color}
              />
            )
          }}
        />

        <Tabs.Screen
          name="payments"
          options={{
            headerShown: false,
            title: 'Payments',
            tabBarIcon: ({ color, focused }) => (
              <MaterialCommunityIcons
                name={focused ? "wallet" : "wallet-outline"}
                size={24}
                color={color}
              />
            )
          }}
        />

        <Tabs.Screen
          name="settings"
          options={{
            headerShown: false,
            title: 'Settings',
            tabBarIcon: ({ color, focused }) => (
              <MaterialCommunityIcons
                name={focused ? "cog" : "cog-outline"}
                size={24}
                color={color}
              />
            )
          }}
        />
      </Tabs>
    </View>
  )
}

export default _layout