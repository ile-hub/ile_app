import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ApplicantDetailScreen } from '../../screens/landlord/applicants/ApplicantDetailScreen';
import { ApplicantsListScreen } from '../../screens/landlord/applicants/ApplicantsListScreen';
import { stackScreenOptions } from '../stackScreenOptions';

export type LandlordApplicantsStackParamList = {
  ApplicantsList: undefined;
  ApplicantDetail: { applicantId: string };
};

const Stack = createNativeStackNavigator<LandlordApplicantsStackParamList>();

export function LandlordApplicantsStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen
        component={ApplicantsListScreen}
        name="ApplicantsList"
        options={{ title: 'Applicants' }}
      />
      <Stack.Screen
        component={ApplicantDetailScreen}
        name="ApplicantDetail"
        options={{ title: 'Applicant' }}
      />
    </Stack.Navigator>
  );
}
