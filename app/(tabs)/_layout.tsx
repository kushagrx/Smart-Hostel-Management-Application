import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const _layout = () => {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: 'orange',
      tabBarInactiveTintColor: 'gray',
    }}>
        <Tabs.Screen 
          name="index" 
          options={{ 
            headerShown: false, 
            title: 'Home',
            tabBarIcon: ({color, focused}) => (
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
            tabBarIcon: ({color, focused}) => (
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
            tabBarIcon: ({color, focused}) => (
              <MaterialCommunityIcons 
                name={focused ? "phone-alert" : "phone-alert-outline"} 
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
            tabBarIcon: ({color, focused}) => (
              <MaterialCommunityIcons 
                name={focused ? "cog" : "cog-outline"} 
                size={24} 
                color={color} 
              />
            )
          }} 
        />
    </Tabs>
  )
}

export default _layout