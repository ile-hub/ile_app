import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { colors } from '../../theme/colors';
import { LandlordProfileEditorScreen, LandlordArcsScreen, LandlordSettingsScreen, LandlordProfileScreen } from '../../screens/landlord/profile/LandlordProfileScreen';
import { LandlordVerificationScreen } from '../../screens/landlord/profile/LandlordVerificationScreen';
import { stackScreenOptions } from '../stackScreenOptions';

export type LandlordProfileStackParamList = {
  LandlordProfileMain: undefined;
  LandlordVerification: undefined;
  LandlordAbout: undefined;
  LandlordBusiness: undefined;
  LandlordArcs: undefined;
  LandlordPreview: undefined;
  LandlordSettings: undefined;
};

const Stack = createNativeStackNavigator<LandlordProfileStackParamList>();

export function LandlordProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ ...stackScreenOptions, headerTitleAlign: 'center', headerTitleStyle: { fontSize: 17, fontWeight: '700' } }}>
      <Stack.Screen
        component={LandlordProfileScreen}
        name="LandlordProfileMain"
        options={({ navigation }) => ({ title: 'My Profile', headerRight: () => <Pressable accessibilityRole="button" accessibilityLabel="Settings" onPress={() => navigation.navigate('LandlordSettings')} style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="settings-outline" size={22} color={colors.accent} /></Pressable> })}
      />
      <Stack.Screen name="LandlordAbout" component={LandlordProfileEditorScreen} options={{ title: 'About me' }} />
      <Stack.Screen name="LandlordBusiness" component={LandlordProfileEditorScreen} options={{ title: 'Business & registration' }} />
      <Stack.Screen name="LandlordArcs" component={LandlordArcsScreen} options={{ title: 'My ARCS preferences' }} />
      <Stack.Screen name="LandlordPreview" component={LandlordProfileEditorScreen} options={{ title: 'Public profile preview' }} />
      <Stack.Screen name="LandlordSettings" component={LandlordSettingsScreen} options={{ title: 'Settings' }} />
      <Stack.Screen
        component={LandlordVerificationScreen}
        name="LandlordVerification"
        options={{ title: 'Verification' }}
      />
    </Stack.Navigator>
  );
}
