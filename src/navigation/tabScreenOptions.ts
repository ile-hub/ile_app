import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { colors } from '../theme/colors';

export const tabScreenOptions: BottomTabNavigationOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.accent,
  tabBarInactiveTintColor: colors.textMuted,
  tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border },
  tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
  tabBarHideOnKeyboard: true,
};
