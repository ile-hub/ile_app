import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LandlordApplicantsScreen } from '../../screens/landlord/LandlordApplicantsScreen';
import { stackScreenOptions } from '../stackScreenOptions';

export type LandlordApplicantsStackParamList = {
  LandlordApplicantsMain: undefined;
};

const Stack = createNativeStackNavigator<LandlordApplicantsStackParamList>();

export function LandlordApplicantsStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen
        component={LandlordApplicantsScreen}
        name="LandlordApplicantsMain"
        options={{ title: 'Applicants' }}
      />
    </Stack.Navigator>
  );
}
