import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MenuItem, subscribeToMenu, WeekMenu } from '../utils/messSyncUtils';

import { useTheme } from '../utils/ThemeContext';

export default function MessMenu() {
  const { colors, theme } = useTheme();

  const [fullMenu, setFullMenu] = useState<WeekMenu>({});
  const [selectedDay, setSelectedDay] = useState(new Date().toLocaleString('en-US', { weekday: 'long' }));
  const [loading, setLoading] = useState(true);


  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    const unsubscribeMenu = subscribeToMenu((data) => {
      setFullMenu(data);
      setLoading(false);
    });

    return () => {
      unsubscribeMenu();
    };
  }, []);

  const styles = React.useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    daySelectorWrapper: {
      marginBottom: 20,
      marginTop: 20,
    },
    daySelector: {
      paddingHorizontal: 20,
      gap: 12,
      paddingBottom: 10, // For shadow
    },
    dayButton: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 24,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      minWidth: 70,
      alignItems: 'center',
    },
    selectedDay: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    dayText: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: '600',
    },
    selectedDayText: {
      color: 'white',
    },
    menuContainer: {
      paddingHorizontal: 20,
      gap: 16,
    },
    currentDayTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
      marginLeft: 4,
    },
    mealSection: {
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 16,
      marginBottom: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    mealHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    mealTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    iconBox: {
      width: 40,
      height: 40,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    mealType: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 2,
    },
    timings: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 12,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 6,
    },
    menuItemText: {
      color: colors.textSecondary,
      fontSize: 14,
      flex: 1,
      lineHeight: 20,
    },
    shadowProp: {
      shadowColor: colors.textSecondary,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
  }), [colors, theme]);

  const getMealTimings = (mealType: string) => {
    // @ts-ignore
    return fullMenu[selectedDay]?.timings?.[mealType] || '';
  };

  const hasItems = (mealType: string) => {
    // @ts-ignore
    return fullMenu[selectedDay]?.[mealType]?.length > 0;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Day Selector */}
      <View style={styles.daySelectorWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daySelector}>
          {days.map((day) => (
            <Pressable
              key={day}
              onPress={() => setSelectedDay(day)}
              style={[
                styles.dayButton,
                selectedDay === day && styles.selectedDay,
                styles.shadowProp
              ]}
            >
              <Text style={[
                styles.dayText,
                selectedDay === day && styles.selectedDayText
              ]}>
                {day.slice(0, 3)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.menuContainer}>
        <Text style={styles.currentDayTitle}>{selectedDay}'s Menu</Text>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
        ) : (
          <>
            {['breakfast', 'lunch', 'snacks', 'dinner'].map((mealType) => (
              <View key={mealType} style={[styles.mealSection, styles.shadowProp]}>
                <View style={styles.mealHeader}>
                  <View style={styles.mealTitleContainer}>
                    <View style={[styles.iconBox, { backgroundColor: getMealColorBg(mealType, theme) }]}>
                      <MaterialCommunityIcons
                        name={getMealIcon(mealType) as any}
                        size={20}
                        color={getMealColor(mealType)}
                      />
                    </View>
                    <View>
                      <Text style={styles.mealType}>
                        {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                      </Text>
                      <Text style={styles.timings}>
                        {getMealTimings(mealType)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* @ts-ignore */}
                {!fullMenu[selectedDay]?.[mealType]?.length ? (
                  <Text style={{ color: colors.textSecondary, fontStyle: 'italic', fontSize: 13 }}>TBD</Text>
                ) : (
                  // @ts-ignore
                  fullMenu[selectedDay][mealType].map((item: MenuItem, index: number) => (
                    <View
                      key={index}
                      style={[
                        styles.menuItem,
                        item.highlight && { backgroundColor: theme === 'dark' ? 'rgba(245, 158, 11, 0.1)' : '#FFFBEB', borderRadius: 8, marginHorizontal: -8, paddingHorizontal: 12, padding: 8, borderLeftWidth: 3, borderLeftColor: '#F59E0B' }
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={item.type === 'veg' ? 'circle-slice-8' : 'food-drumstick'}
                        size={14}
                        color={item.type === 'veg' ? '#10B981' : '#EF4444'}
                        style={{ marginTop: 2 }}
                      />
                      <Text style={[
                        styles.menuItemText,
                        item.highlight && { color: colors.text, fontWeight: '500' }
                      ]}>
                        {item.dish}
                        {item.highlight && (
                          <Text>
                            {"  "}
                            <FontAwesome name="star" size={10} color="#F59E0B" />
                          </Text>
                        )}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const getMealIcon = (mealType: string) => {
  switch (mealType) {
    case 'breakfast': return 'coffee';
    case 'lunch': return 'food-variant';
    case 'snacks': return 'cookie';
    case 'dinner': return 'food-turkey';
    default: return 'food';
  }
};

const getMealColor = (mealType: string) => {
  switch (mealType) {
    case 'breakfast': return '#F59E0B'; // Orange
    case 'lunch': return '#EF4444';     // Red
    case 'snacks': return '#8B5CF6';    // Purple
    case 'dinner': return '#004e92';    // Blue
    default: return '#64748B';
  }
};

const getMealColorBg = (mealType: string, theme: string) => {
  if (theme === 'dark') {
    switch (mealType) {
      case 'breakfast': return 'rgba(245, 158, 11, 0.1)';
      case 'lunch': return 'rgba(239, 68, 68, 0.1)';
      case 'snacks': return 'rgba(139, 92, 246, 0.1)';
      case 'dinner': return 'rgba(59, 130, 246, 0.1)';
      default: return '#1E293B';
    }
  }
  switch (mealType) {
    case 'breakfast': return '#FFFBEB';
    case 'lunch': return '#FEF2F2';
    case 'snacks': return '#F5F3FF';
    case 'dinner': return '#EFF6FF';
    default: return '#F1F5F9';
  }
};


