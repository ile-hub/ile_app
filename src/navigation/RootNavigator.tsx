import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuth } from '../auth/AuthProvider';
import { LandlordTabNavigator } from './landlord/LandlordTabNavigator';
import { RenterTabNavigator } from './renter/RenterTabNavigator';
import { LoginScreen } from '../screens/LoginScreen';
import { SignupScreen } from '../screens/SignupScreen';
import { navigationTheme } from '../theme/navigationTheme';
import { colors } from '../theme/colors';

// Login/Signup live on this root stack. Once a role is known, the whole
// stack is swapped out for that role's own tab navigator (RenterTabNavigator
// / LandlordTabNavigator) — each role gets its own menu and its own set of
// per-tab stacks, entirely separate from the other role's.
export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  RenterRoot: undefined;
  LandlordRoot: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isLoading, role, user } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator key={user?.id ?? 'signed-out'} screenOptions={{ headerShown: false }}>
        {role === 'renter' ? (
          <Stack.Screen component={RenterTabNavigator} name="RenterRoot" />
        ) : role === 'landlord' ? (
          <Stack.Screen component={LandlordTabNavigator} name="LandlordRoot" />
        ) : (
          <Stack.Group>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    backgroundColor: colors.background,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
