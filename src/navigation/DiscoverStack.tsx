import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DiscoverScreen } from '../screens/discover/DiscoverScreen';
import { LandlordProfileScreen } from '../screens/discover/LandlordProfileScreen';
import { RenterPublicProfileScreen } from '../screens/discover/RenterPublicProfileScreen';
import { PropertyDetailScreen } from '../screens/discover/PropertyDetailScreen';
import { RequestConnectScreen } from '../screens/connections/RequestConnectScreen';
import { stackScreenOptions } from './stackScreenOptions';

export type DiscoverStackParamList = {
  Discover: undefined;
  LandlordProfile: { landlordId?: string };
  RenterPublicProfile: { renterId: string } | undefined;
  PublicPropertyDetail: { propertyId: string; landlordId: string };
  RequestConnect: { recipientId: string };
};
const Stack = createNativeStackNavigator<DiscoverStackParamList>();
export function DiscoverStack() {
  return <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen name="Discover" component={DiscoverScreen} />
    <Stack.Screen name="LandlordProfile" component={LandlordProfileScreen} options={{ title: 'Landlord profile' }} />
    <Stack.Screen name="RenterPublicProfile" component={RenterPublicProfileScreen} options={{ title: 'Renter profile' }} />
    <Stack.Screen name="PublicPropertyDetail" component={PropertyDetailScreen} options={{ title: 'Property' }} />
    <Stack.Screen name="RequestConnect" component={RequestConnectScreen} options={{ title: 'Request to Connect' }} />
  </Stack.Navigator>;
}
