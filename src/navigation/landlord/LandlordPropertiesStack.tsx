import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AddEditPropertyScreen } from '../../screens/landlord/properties/AddEditPropertyScreen';
import { PropertiesListScreen } from '../../screens/landlord/properties/PropertiesListScreen';
import { PropertyDetailScreen } from '../../screens/landlord/properties/PropertyDetailScreen';
import { PropertyPreferencesScreen } from '../../screens/landlord/properties/PropertyPreferencesScreen';
import { stackScreenOptions } from '../stackScreenOptions';

export type LandlordPropertiesStackParamList = {
  PropertiesList: undefined;
  PropertyDetail: { propertyId: string };
  AddEditProperty: { propertyId?: string };
  PropertyPreferences: { propertyId: string };
};

const Stack = createNativeStackNavigator<LandlordPropertiesStackParamList>();

export function LandlordPropertiesStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen
        component={PropertiesListScreen}
        name="PropertiesList"
        options={{ title: 'Properties' }}
      />
      <Stack.Screen
        component={PropertyDetailScreen}
        name="PropertyDetail"
        options={{ title: 'Property' }}
      />
      <Stack.Screen
        component={AddEditPropertyScreen}
        name="AddEditProperty"
        options={{ title: 'Add Property' }}
      />
      <Stack.Screen
        component={PropertyPreferencesScreen}
        name="PropertyPreferences"
        options={{ title: 'Preferences' }}
      />
    </Stack.Navigator>
  );
}
