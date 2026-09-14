import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import { colors } from '../theme/colors';

// Shared header styling for every per-tab stack (renter and landlord alike).
export const stackScreenOptions: NativeStackNavigationOptions = {
  headerBackButtonDisplayMode: 'minimal', // back button is just the chevron, not "< Previous Screen Title"
  headerShadowVisible: false,
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.textPrimary,
  headerTitleStyle: { fontWeight: '800' },
};
