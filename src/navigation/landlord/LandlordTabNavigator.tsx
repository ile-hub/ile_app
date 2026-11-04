import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import type { NavigatorScreenParams } from '@react-navigation/native';
import type { DiscoverStackParamList } from '../DiscoverStack';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { tabScreenOptions } from '../tabScreenOptions';
import { DiscoverStack } from '../DiscoverStack';
import { ConnectionsStack } from '../ConnectionsStack';
import { LandlordProfileStack } from './LandlordProfileStack';
import { LandlordPropertiesStack } from './LandlordPropertiesStack';
export type LandlordTabParamList = {
  LandlordDiscoverTab: NavigatorScreenParams<DiscoverStackParamList> | undefined;
  LandlordConnectionsTab: undefined;
  LandlordPropertiesTab: undefined;
  LandlordProfileTab: undefined;
};
const icons: Record<keyof LandlordTabParamList, keyof typeof Ionicons.glyphMap> = {
  LandlordDiscoverTab: 'compass-outline',
  LandlordConnectionsTab: 'chatbubbles-outline',
  LandlordPropertiesTab: 'business-outline',
  LandlordProfileTab: 'person-outline',
};
const Tab = createBottomTabNavigator<LandlordTabParamList>();
export function LandlordTabNavigator() {
  return <Tab.Navigator screenOptions={({ route }) => ({ ...tabScreenOptions,
    tabBarIcon: ({ color, size }) => <Ionicons name={icons[route.name]} color={color} size={size} />,
  })}>
    <Tab.Screen name="LandlordDiscoverTab" component={DiscoverStack} options={{ title: 'Discover' }} />
    <Tab.Screen name="LandlordConnectionsTab" component={ConnectionsStack} options={({ route }) => ({ title: 'Connections', tabBarStyle: getFocusedRouteNameFromRoute(route) === 'Conversation' ? { display: 'none' } : tabScreenOptions.tabBarStyle })} />
    <Tab.Screen name="LandlordPropertiesTab" component={LandlordPropertiesStack} options={{ title: 'Properties' }} />
    <Tab.Screen name="LandlordProfileTab" component={LandlordProfileStack} options={{ title: 'Profile' }} />
  </Tab.Navigator>;
}
