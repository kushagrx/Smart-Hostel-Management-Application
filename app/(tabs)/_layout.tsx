import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'

const _layout = () => {
  return (
    <Tabs>
        <Tabs.Screen name="index" options={{ headerShown: false, title: 'Home' }} />
        <Tabs.Screen name="alerts" options={{ headerShown: false, title: 'Alerts' }} />
        <Tabs.Screen name="profile" options={{ headerShown: false, title: 'Profile' }} />
        
    </Tabs>
  )
}

export default _layout