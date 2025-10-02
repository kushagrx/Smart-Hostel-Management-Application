import { View, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import MessMenu from '../components/MessMenu';

export default function Mess() {
  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ 
        title: "Mess Menu",
        headerStyle: {
          backgroundColor: '#FF8C00',
        },
        headerTintColor: '#fff',
      }} />
      <MessMenu />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 15,
  },
});