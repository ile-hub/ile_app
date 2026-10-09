import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LandlordProfileScreen } from '../../screens/renter/listings/LandlordProfileScreen';
import { ListingsScreen } from '../../screens/renter/listings/ListingsScreen';
import { PropertyDetailScreen } from '../../screens/renter/listings/PropertyDetailScreen';
import { stackScreenOptions } from '../stackScreenOptions';

export type RenterListingsStackParamList = {
  ListingsMain: undefined;
  PropertyDetail: { propertyId: string };
  LandlordProfile: { landlordId: string };
};

const Stack = createNativeStackNavigator<RenterListingsStackParamList>();

export function RenterListingsStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen component={ListingsScreen} name="ListingsMain" options={{ title: 'Listings' }} />
      <Stack.Screen
        component={PropertyDetailScreen}
        name="PropertyDetail"
        options={{ title: 'Property' }}
      />
      <Stack.Screen
        component={LandlordProfileScreen}
        name="LandlordProfile"
        options={{ title: 'Landlord' }}
      />
    </Stack.Navigator>
  );
}
