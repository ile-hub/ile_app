import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LandlordHomeScreen } from '../../screens/landlord/LandlordHomeScreen';
import { stackScreenOptions } from '../stackScreenOptions';

export type LandlordHomeStackParamList = {
  LandlordHomeMain: undefined;
};

const Stack = createNativeStackNavigator<LandlordHomeStackParamList>();

export function LandlordHomeStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen
        component={LandlordHomeScreen}
        name="LandlordHomeMain"
        options={{ title: 'Home' }}
      />
    </Stack.Navigator>
  );
}
