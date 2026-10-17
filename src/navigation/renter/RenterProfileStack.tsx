import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RenterFileStack } from './RenterFileStack';
import { RenterProfileScreen } from '../../screens/renter/profile/RenterProfileScreen';
import { VerificationStatusScreen } from '../../screens/renter/profile/VerificationStatusScreen';
import { stackScreenOptions } from '../stackScreenOptions';

export type RenterProfileStackParamList = {
  RenterProfileMain: undefined;
  VerificationStatus: undefined;
  Evidence: undefined;
};

const Stack = createNativeStackNavigator<RenterProfileStackParamList>();

export function RenterProfileStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen
        component={RenterProfileScreen}
        name="RenterProfileMain"
        options={{ title: 'Profile' }}
      />
      <Stack.Screen
        component={VerificationStatusScreen}
        name="VerificationStatus"
        options={{ title: 'Verification' }}
      />
      <Stack.Screen component={RenterFileStack} name="Evidence" options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
