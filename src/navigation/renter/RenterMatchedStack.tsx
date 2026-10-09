import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MatchedDetailScreen } from '../../screens/renter/matched/MatchedDetailScreen';
import { MatchedListScreen } from '../../screens/renter/matched/MatchedListScreen';
import { stackScreenOptions } from '../stackScreenOptions';

export type RenterMatchedStackParamList = {
  MatchedList: undefined;
  MatchedDetail: { propertyId: string };
};

const Stack = createNativeStackNavigator<RenterMatchedStackParamList>();

export function RenterMatchedStack() {
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
