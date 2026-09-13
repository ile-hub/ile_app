import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { colors } from '../../theme/colors';
import { RenterFileStack } from './RenterFileStack';
import { RenterHomeStack } from './RenterHomeStack';
import { RenterListingsStack } from './RenterListingsStack';
import { RenterProfileStack } from './RenterProfileStack';

export type RenterTabParamList = {
  RenterHomeTab: undefined;
  RenterListingsTab: undefined;
  RenterFileTab: undefined;
  RenterProfileTab: undefined;
};

type IconName = keyof typeof Ionicons.glyphMap;

// [filled, outline] pair per tab — kept as literal pairs rather than
// derived via string templating so TS can check each name is real.
const icons: Record<keyof RenterTabParamList, readonly [IconName, IconName]> = {
  RenterHomeTab: ['home', 'home-outline'],
  RenterListingsTab: ['search', 'search-outline'],
  RenterFileTab: ['folder', 'folder-outline'],
  RenterProfileTab: ['person', 'person-outline'],
};

const Tab = createBottomTabNavigator<RenterTabParamList>();

export function RenterTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarIcon: ({ color, focused, size }) => (
          <Ionicons color={color} name={icons[route.name][focused ? 0 : 1]} size={size} />
        ),
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      })}
    >
      <Tab.Screen component={RenterHomeStack} name="RenterHomeTab" options={{ title: 'Home' }} />
      <Tab.Screen
        component={RenterListingsStack}
        name="RenterListingsTab"
        options={{ title: 'Listings' }}
      />
      <Tab.Screen component={RenterFileStack} name="RenterFileTab" options={{ title: 'My File' }} />
      <Tab.Screen
        component={RenterProfileStack}
        name="RenterProfileTab"
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}
