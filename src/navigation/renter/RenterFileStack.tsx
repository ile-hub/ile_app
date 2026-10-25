import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { colors } from '../../theme/colors';
import { TRUST_PILLARS } from '../../lib/trustPillars';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { EvidenceCategoryScreen } from '../../screens/renter/file/EvidenceCategoryScreen';
import { EvidenceDashboardScreen } from '../../screens/renter/file/EvidenceDashboardScreen';
import { EvidenceUploadScreen } from '../../screens/renter/file/EvidenceUploadScreen';
import type { TrustPillar } from '../../lib/trustPillars';
import { stackScreenOptions } from '../stackScreenOptions';

export type RenterFileStackParamList = {
  EvidenceDashboard: undefined;
  EvidenceCategory: { pillar: TrustPillar };
  EvidenceUpload: { pillar: TrustPillar; pathwayType: string };
};

const Stack = createNativeStackNavigator<RenterFileStackParamList>();

export function RenterFileStack() {
  return (
    <Stack.Navigator screenOptions={{ ...stackScreenOptions, headerTitleAlign: 'center', headerTitleStyle: { fontSize: 17, fontWeight: '700' } }}>
      <Stack.Screen
        component={EvidenceDashboardScreen}
        name="EvidenceDashboard"
        options={({ navigation }) => ({ title: 'My ARCS evidence', headerLeft: () => <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => navigation.getParent()?.goBack()} style={{ minHeight: 44, minWidth: 44, justifyContent: 'center' }}><Ionicons name="chevron-back" size={26} color={colors.textPrimary} /></Pressable> })}
      />
      <Stack.Screen
        component={EvidenceCategoryScreen}
        name="EvidenceCategory"
        options={({ route }) => ({ title: TRUST_PILLARS.find(pillar => pillar.id === route.params.pillar)?.label ?? 'Evidence' })}
      />
      <Stack.Screen
        component={EvidenceUploadScreen}
        name="EvidenceUpload"
        options={{ title: 'Add Evidence' }}
      />
    </Stack.Navigator>
  );
}
