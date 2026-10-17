import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { tabScreenOptions } from '../tabScreenOptions';
import { DiscoverStack } from '../DiscoverStack';
import { ConnectionsStack } from '../ConnectionsStack';
import { RenterProfileStack } from './RenterProfileStack';
export type RenterTabParamList = {
  RenterDiscoverTab: undefined;
  RenterConnectionsTab: undefined;
  RenterProfileTab: undefined;
};
const icons: Record<keyof RenterTabParamList, keyof typeof Ionicons.glyphMap> = {
  RenterDiscoverTab: 'compass-outline',
  RenterConnectionsTab: 'chatbubbles-outline',
  RenterProfileTab: 'person-outline',
};
const Tab = createBottomTabNavigator<RenterTabParamList>();
export function RenterTabNavigator() {
  return <Tab.Navigator screenOptions={({ route }) => ({ ...tabScreenOptions,
    tabBarIcon: ({ color, size }) => <Ionicons name={icons[route.name]} color={color} size={size} />,
  })}>
    <Tab.Screen name="RenterDiscoverTab" component={DiscoverStack} options={{ title: 'Discover' }} />
    <Tab.Screen name="RenterConnectionsTab" component={ConnectionsStack} options={({ route }) => ({ title: 'Connections', tabBarStyle: getFocusedRouteNameFromRoute(route) === 'Conversation' ? { display: 'none' } : tabScreenOptions.tabBarStyle })} />
    <Tab.Screen name="RenterProfileTab" component={RenterProfileStack} options={{ title: 'Profile' }} />
  </Tab.Navigator>;
}
