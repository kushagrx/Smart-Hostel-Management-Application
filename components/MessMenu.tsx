import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { useState } from 'react';
import { currentWeekMenu } from '../utils/messUtils';

export default function MessMenu() {
  const [selectedDay, setSelectedDay] = useState(new Date().toLocaleString('en-US', { weekday: 'long' }));
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const getMealTimings = (mealType: string) => {
    switch(mealType) {
      case 'breakfast': return '8:00 - 9:30 AM';
      case 'lunch': return '12:30 - 2:30 PM';
      case 'snacks': return '5:30 - 6:30 PM';
      case 'dinner': return '8:30 - 9:30 PM';
      default: return '';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.daySelector}>
        {days.map((day) => (
          <Pressable 
            key={day} 
            onPress={() => setSelectedDay(day)}
            style={[
              styles.dayButton,
              selectedDay === day && styles.selectedDay
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
      </View>

      <View style={styles.menuContainer}>
        {['breakfast', 'lunch', 'snacks', 'dinner'].map((mealType) => (
          <View key={mealType} style={styles.mealSection}>
            <View style={styles.mealHeader}>
              <View style={styles.mealTitleContainer}>
                <MaterialCommunityIcons 
                  name={getMealIcon(mealType)} 
                  size={20} 
                  color="#FF8C00" 
                />
                <Text style={styles.mealType}>
                  {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                </Text>
              </View>
              <Text style={styles.timings}>
                {getMealTimings(mealType)}
              </Text>
            </View>
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
                  size={16} 
                  color={item.type === 'veg' ? '#4CAF50' : '#FF5722'} 
                />
                <Text style={[
                  styles.menuItemText,
                  item.highlight && styles.highlightedText
                ]}>
                  {item.dish}
                  {item.highlight && (
                    <FontAwesome 
                      name="star" 
                      size={12} 
                      color="#FFD700" 
                      style={styles.starIcon} 
                    />
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
  switch(mealType) {
    case 'breakfast': return 'coffee';
    case 'lunch': return 'food';
    case 'snacks': return 'cookie';
    case 'dinner': return 'food-turkey';
    default: return 'food';
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 15,
    marginTop: 10,
  },
  daySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  selectedDay: {
    backgroundColor: '#FF8C00',
  },
  dayText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  selectedDayText: {
    color: 'white',
  },
  menuContainer: {
    gap: 15,
  },
  mealSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 10,
  },
  mealTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mealType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 5,
  },
  timings: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  menuItemText: {
    color: '#666',
    fontSize: 14,
    flex: 1,
  },
  highlightedItem: {
    backgroundColor: '#FFF8E1',
    padding: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FFD700',
  },
  highlightedText: {
    color: '#333',
    fontWeight: '500',
  },
  starIcon: {
    marginLeft: 6,
  },
});