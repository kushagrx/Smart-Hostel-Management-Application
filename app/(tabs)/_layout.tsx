import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {
  createMaterialTopTabNavigator,
  MaterialTopTabNavigationEventMap,
  MaterialTopTabNavigationOptions,
} from '@react-navigation/material-top-tabs';
import { ParamListBase, TabNavigationState } from '@react-navigation/native';
import { withLayoutContext } from 'expo-router';
import { View } from 'react-native';
import { useTheme } from '../../utils/ThemeContext';

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

const _layout = () => {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <MaterialTopTabs
        tabBarPosition="bottom"
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            elevation: 8,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: -2 },
            paddingBottom: 4, // Add some padding for bottom safe area look
            height: 60,
          },
          tabBarIndicatorStyle: {
            backgroundColor: colors.primary,
            height: 3,
            top: 0, // Indicator at the top of the bottom tab bar
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            textTransform: 'capitalize',
            marginTop: -4,
          },
          tabBarIconStyle: {
            marginBottom: -2,
          },
          swipeEnabled: true,
          animationEnabled: true,
        }}
      >
        <MaterialTopTabs.Screen
          name="index"
          options={{
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

        <MaterialTopTabs.Screen
          name="emergency"
          options={{
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

        <MaterialTopTabs.Screen
          name="payments"
          options={{
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

        <MaterialTopTabs.Screen
          name="settings"
          options={{
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
      </MaterialTopTabs>
    </View>
  )
}

export default _layout