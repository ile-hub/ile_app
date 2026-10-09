import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MatchedDetailScreen } from '../../screens/landlord/matched/MatchedDetailScreen';
import { MatchedListScreen } from '../../screens/landlord/matched/MatchedListScreen';
import { stackScreenOptions } from '../stackScreenOptions';

export type LandlordMatchedStackParamList = {
  MatchedList: undefined;
  MatchedDetail: { applicantId: string };
};

const Stack = createNativeStackNavigator<LandlordMatchedStackParamList>();

export function LandlordMatchedStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen component={MatchedListScreen} name="MatchedList" options={{ title: 'Matched' }} />
      <Stack.Screen
        component={MatchedDetailScreen}
        name="MatchedDetail"
        options={{ title: 'Matched' }}
      />
    </Stack.Navigator>
  );
}
