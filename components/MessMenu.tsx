import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { currentWeekMenu } from '../utils/messUtils';

export default function MessMenu() {
  const [selectedDay, setSelectedDay] = useState(new Date().toLocaleString('en-US', { weekday: 'long' }));
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const getMealTimings = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return '8:00 - 9:30 AM';
      case 'lunch': return '12:30 - 2:30 PM';
      case 'snacks': return '5:30 - 6:30 PM';
      case 'dinner': return '8:30 - 9:30 PM';
      default: return '';
    }
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

        {['breakfast', 'lunch', 'snacks', 'dinner'].map((mealType) => (
          <View key={mealType} style={[styles.mealSection, styles.shadowProp]}>
            <View style={styles.mealHeader}>
              <View style={styles.mealTitleContainer}>
                <View style={[styles.iconBox, { backgroundColor: getMealColorBg(mealType) }]}>
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

            {currentWeekMenu[selectedDay]?.[mealType as keyof typeof currentWeekMenu[typeof selectedDay]]?.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.menuItem,
                  item.highlight && styles.highlightedItem
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
                  item.highlight && styles.highlightedText
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
            ))}
          </View>
        ))}
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

const getMealColorBg = (mealType: string) => {
  switch (mealType) {
    case 'breakfast': return '#FFFBEB';
    case 'lunch': return '#FEF2F2';
    case 'snacks': return '#F5F3FF';
    case 'dinner': return '#EFF6FF';
    default: return '#F1F5F9';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 70,
    alignItems: 'center',
  },
  selectedDay: {
    backgroundColor: '#004e92',
    borderColor: '#004e92',
  },
  dayText: {
    color: '#64748B',
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
    color: '#334155',
    marginBottom: 4,
    marginLeft: 4,
  },
  mealSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
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
    color: '#1E293B',
    marginBottom: 2,
  },
  timings: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  menuItemText: {
    color: '#475569',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  highlightedItem: {
    backgroundColor: '#FFFBEB',
    padding: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
    marginHorizontal: -8,
    paddingHorizontal: 12,
  },
  highlightedText: {
    color: '#1E293B',
    fontWeight: '500',
  },
  shadowProp: {
    shadowColor: '#64748B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
});