import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';

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
            tabBarIcon: ({color, size}) => (
              <AntDesign name="home" size={size} color={color} />
            )
          }} 
        />

        <Tabs.Screen 
          name="alerts" 
          options={{ 
            headerShown: false, 
            title: 'Alerts',
            tabBarIcon: ({color, size}) => (
              <AntDesign name="bell" size={size} color={color} />
            )
          }} 
        />

        <Tabs.Screen 
          name="profile" 
          options={{ 
            headerShown: false, 
            title: 'Profile',
            tabBarIcon: ({color, size}) => (
              <AntDesign name="user" size={size} color={color} />
            )
          }} 
        />

        <Tabs.Screen 
          name="settings" 
          options={{ 
            headerShown: false, 
            title: 'Settings',
            tabBarIcon: ({color, size}) => (
              <Feather name="settings" size={size} color={color} />
            )
          }} 
        />
    </Tabs>
  )
}

export default _layout