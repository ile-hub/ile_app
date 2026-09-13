import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ApplicationDetailScreen } from '../../screens/renter/listings/ApplicationDetailScreen';
import { ListingsScreen } from '../../screens/renter/listings/ListingsScreen';
import { MyApplicationsScreen } from '../../screens/renter/listings/MyApplicationsScreen';
import { PropertyDetailScreen } from '../../screens/renter/listings/PropertyDetailScreen';
import { stackScreenOptions } from '../stackScreenOptions';

export type RenterListingsStackParamList = {
  ListingsMain: undefined;
  PropertyDetail: { propertyId: string };
  MyApplications: undefined;
  ApplicationDetail: { applicationId: string };
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
        component={MyApplicationsScreen}
        name="MyApplications"
        options={{ title: 'My Applications' }}
      />
      <Stack.Screen
        component={ApplicationDetailScreen}
        name="ApplicationDetail"
        options={{ title: 'Application' }}
      />
    </Stack.Navigator>
  );
}
