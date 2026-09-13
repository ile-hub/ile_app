import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LandlordProfileScreen } from '../../screens/landlord/profile/LandlordProfileScreen';
import { LandlordVerificationScreen } from '../../screens/landlord/profile/LandlordVerificationScreen';
import { TenancyHistoryScreen } from '../../screens/landlord/profile/TenancyHistoryScreen';
import { stackScreenOptions } from '../stackScreenOptions';

export type LandlordProfileStackParamList = {
  LandlordProfileMain: undefined;
  LandlordVerification: undefined;
  TenancyHistory: undefined;
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
      <Stack.Screen
        component={LandlordVerificationScreen}
        name="LandlordVerification"
        options={{ title: 'Verification' }}
      />
      <Stack.Screen
        component={TenancyHistoryScreen}
        name="TenancyHistory"
        options={{ title: 'Tenancy History' }}
      />
    </Stack.Navigator>
  );
}
