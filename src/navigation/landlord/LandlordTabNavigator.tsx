import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { colors } from '../../theme/colors';
import { LandlordApplicantsStack } from './LandlordApplicantsStack';
import { LandlordHomeStack } from './LandlordHomeStack';
import { LandlordMatchedStack } from './LandlordMatchedStack';
import { LandlordProfileStack } from './LandlordProfileStack';
import { LandlordPropertiesStack } from './LandlordPropertiesStack';

export type LandlordTabParamList = {
  LandlordHomeTab: undefined;
  LandlordPropertiesTab: undefined;
  LandlordApplicantsTab: undefined;
  LandlordMatchedTab: undefined;
  LandlordProfileTab: undefined;
};

type IconName = keyof typeof Ionicons.glyphMap;

// [filled, outline] pair per tab — kept as literal pairs rather than
// derived via string templating so TS can check each name is real.
const icons: Record<keyof LandlordTabParamList, readonly [IconName, IconName]> = {
  LandlordHomeTab: ['home', 'home-outline'],
  LandlordPropertiesTab: ['business', 'business-outline'],
  LandlordApplicantsTab: ['people', 'people-outline'],
  LandlordMatchedTab: ['heart', 'heart-outline'],
  LandlordProfileTab: ['person', 'person-outline'],
};

const Tab = createBottomTabNavigator<LandlordTabParamList>();

export function LandlordTabNavigator() {
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
      <Tab.Screen
        component={LandlordHomeStack}
        name="LandlordHomeTab"
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        component={LandlordPropertiesStack}
        name="LandlordPropertiesTab"
        options={{ title: 'Properties' }}
      />
      <Tab.Screen
        component={LandlordApplicantsStack}
        name="LandlordApplicantsTab"
        options={{ title: 'Applicants' }}
      />
      <Tab.Screen
        component={LandlordMatchedStack}
        name="LandlordMatchedTab"
        options={{ title: 'Matched' }}
      />
      <Tab.Screen
        component={LandlordProfileStack}
        name="LandlordProfileTab"
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}
