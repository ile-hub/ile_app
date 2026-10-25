import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RenterFileStack } from './RenterFileStack';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { colors } from '../../theme/colors';
import { RenterProfileEditorScreen, RenterSettingsScreen, RenterProfileScreen } from '../../screens/renter/profile/RenterProfileScreen';
import { VerificationStatusScreen } from '../../screens/renter/profile/VerificationStatusScreen';
import { stackScreenOptions } from '../stackScreenOptions';

export type RenterProfileStackParamList = {
  RenterProfileMain: undefined;
  VerificationStatus: undefined;
  Evidence: undefined;
  AboutMe: undefined;
  HousingPreferences: undefined;
  PersonalStory: undefined;
  PublicProfilePreview: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RenterProfileStackParamList>();

export function RenterProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ ...stackScreenOptions, headerTitleAlign: 'center', headerTitleStyle: { fontSize: 17, fontWeight: '700' } }}>
      <Stack.Screen
        component={RenterProfileScreen}
        name="RenterProfileMain"
        options={({ navigation }) => ({ title: 'My Profile', headerRight: () => <Pressable accessibilityRole="button" accessibilityLabel="Settings" onPress={() => navigation.navigate('Settings')} style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="settings-outline" size={22} color={colors.accent} /></Pressable> })}
      />
      <Stack.Screen name="AboutMe" component={RenterProfileEditorScreen} options={{ title: 'About me' }} />
      <Stack.Screen name="HousingPreferences" component={RenterProfileEditorScreen} options={{ title: 'Housing preferences' }} />
      <Stack.Screen name="PersonalStory" component={RenterProfileEditorScreen} options={{ title: 'Personal story' }} />
      <Stack.Screen name="PublicProfilePreview" component={RenterProfileEditorScreen} options={{ title: 'Public profile preview' }} />
      <Stack.Screen name="Settings" component={RenterSettingsScreen} options={{ title: 'Settings' }} />
      <Stack.Screen
        component={VerificationStatusScreen}
        name="VerificationStatus"
        options={{ title: 'Verification' }}
      />
      <Stack.Screen component={RenterFileStack} name="Evidence" options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
