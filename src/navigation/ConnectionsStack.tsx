import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ConnectionsScreen } from '../screens/connections/ConnectionsScreen';
import { ConnectionDetailScreen } from '../screens/connections/ConnectionDetailScreen';
import { ConversationScreen } from '../screens/connections/ConversationScreen';
import { ConnectedScreen } from '../screens/connections/ConnectedScreen';
import { stackScreenOptions } from './stackScreenOptions';

export type ConnectionsStackParamList = {
  Connections: undefined;
  ConnectionDetail: { connectionId: string; interestId?: never } | { interestId: string; connectionId?: never };
  Connected: { connectionId: string };
  Conversation: { connectionId: string };
};
const Stack = createNativeStackNavigator<ConnectionsStackParamList>();
export function ConnectionsStack() {
  return <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen name="Connections" component={ConnectionsScreen} />
    <Stack.Screen name="ConnectionDetail" component={ConnectionDetailScreen} options={{ title: 'Review request' }} />
    <Stack.Screen name="Connected" component={ConnectedScreen} options={{ title: 'Connection confirmation' }} />
    <Stack.Screen name="Conversation" component={ConversationScreen} options={{ headerShown: false }} />
  </Stack.Navigator>;
}
