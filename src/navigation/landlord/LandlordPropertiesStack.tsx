import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LandlordPropertiesScreen } from '../../screens/landlord/LandlordPropertiesScreen';
import { stackScreenOptions } from '../stackScreenOptions';

export type LandlordPropertiesStackParamList = {
  LandlordPropertiesMain: undefined;
};

const Stack = createNativeStackNavigator<LandlordPropertiesStackParamList>();

export function LandlordPropertiesStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen
        component={LandlordPropertiesScreen}
        name="LandlordPropertiesMain"
        options={{ title: 'Properties' }}
      />
    </Stack.Navigator>
  );
}
