import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function AdminCard({
  title,
  value,
  subtitle,
  children,
}: {
  title: string;
  value?: string | number;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {value !== undefined && <Text style={styles.value}>{value}</Text>}
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF8C00',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    minWidth: 140,
    flex: 1,
  },
  title: {
    fontWeight: '700',
    marginBottom: 6,
    color: '#333'
  },
  value: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FF8C00',
    marginBottom: 4,
  },
  subtitle: {
    color: '#888',
    fontSize: 12,
    marginBottom: 8,
  },
  body: {
    marginTop: 6,
  }
});
