import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../utils/ThemeContext';

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
  const { colors, theme } = useTheme();

  const styles = React.useMemo(() => StyleSheet.create({
    card: {
      padding: 14,
      margin: 8,
      backgroundColor: colors.card,
      borderRadius: 12,
      borderLeftWidth: 4,
      borderLeftColor: '#FF8C00',
      shadowColor: colors.textSecondary,
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 3 },
      elevation: 3,
      minWidth: 140,
      flex: 1,
    },
    title: {
      fontWeight: '700',
      marginBottom: 6,
      color: colors.text,
    },
    value: {
      fontSize: 32,
      fontWeight: '800',
      color: '#FF8C00',
      marginBottom: 4,
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: 12,
      marginBottom: 8,
    },
    body: {
      marginTop: 6,
    }
  }), [colors, theme]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {value !== undefined && <Text style={styles.value}>{value}</Text>}
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      <View style={styles.body}>{children}</View>
    </View>
  );
}


