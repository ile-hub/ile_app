import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RenterHomeScreen } from '../../screens/renter/RenterHomeScreen';
import { stackScreenOptions } from '../stackScreenOptions';

export type RenterHomeStackParamList = {
  RenterHomeMain: undefined;
};

const Stack = createNativeStackNavigator<RenterHomeStackParamList>();

export function RenterHomeStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen component={RenterHomeScreen} name="RenterHomeMain" options={{ title: 'Home' }} />
    </Stack.Navigator>
  );
}
