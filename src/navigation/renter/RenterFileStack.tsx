import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { EvidenceCategoryScreen } from '../../screens/renter/file/EvidenceCategoryScreen';
import { EvidenceDashboardScreen } from '../../screens/renter/file/EvidenceDashboardScreen';
import { EvidenceUploadScreen } from '../../screens/renter/file/EvidenceUploadScreen';
import { TrustProfileScreen } from '../../screens/renter/file/TrustProfileScreen';
import type { TrustPillar } from '../../lib/trustPillars';
import { stackScreenOptions } from '../stackScreenOptions';

export type RenterFileStackParamList = {
  EvidenceDashboard: undefined;
  EvidenceCategory: { pillar: TrustPillar };
  EvidenceUpload: { pillar: TrustPillar; pathwayType: string };
  TrustProfile: undefined;
};

const Stack = createNativeStackNavigator<RenterFileStackParamList>();

export function RenterFileStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen
        component={EvidenceDashboardScreen}
        name="EvidenceDashboard"
        options={{ title: 'My File' }}
      />
      <Stack.Screen
        component={EvidenceCategoryScreen}
        name="EvidenceCategory"
        options={{ title: 'Pillar' }}
      />
      <Stack.Screen
        component={EvidenceUploadScreen}
        name="EvidenceUpload"
        options={{ title: 'Add Evidence' }}
      />
      <Stack.Screen
        component={TrustProfileScreen}
        name="TrustProfile"
        options={{ title: 'Trust Profile' }}
      />
    </Stack.Navigator>
  );
}
