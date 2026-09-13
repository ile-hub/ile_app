import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { PreferencesScreen } from '../../screens/renter/profile/PreferencesScreen';
import { RenterProfileScreen } from '../../screens/renter/profile/RenterProfileScreen';
import { TenancyHistoryScreen } from '../../screens/renter/profile/TenancyHistoryScreen';
import { VerificationStatusScreen } from '../../screens/renter/profile/VerificationStatusScreen';
import { stackScreenOptions } from '../stackScreenOptions';

export type RenterProfileStackParamList = {
  RenterProfileMain: undefined;
  VerificationStatus: undefined;
  Preferences: undefined;
  TenancyHistory: undefined;
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
      <Stack.Screen component={PreferencesScreen} name="Preferences" options={{ title: 'Preferences' }} />
      <Stack.Screen
        component={TenancyHistoryScreen}
        name="TenancyHistory"
        options={{ title: 'Tenancy History' }}
      />
    </Stack.Navigator>
  );
}
