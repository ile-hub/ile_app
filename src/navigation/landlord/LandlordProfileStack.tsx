import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LandlordProfileScreen } from '../../screens/landlord/LandlordProfileScreen';
import { stackScreenOptions } from '../stackScreenOptions';

export type LandlordProfileStackParamList = {
  LandlordProfileMain: undefined;
};

const Stack = createNativeStackNavigator<LandlordProfileStackParamList>();

export function LandlordProfileStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen
        component={LandlordProfileScreen}
        name="LandlordProfileMain"
        options={{ title: 'Profile' }}
      />
    </Stack.Navigator>
  );
}
