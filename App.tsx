import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from './src/auth/AuthProvider';
import { ProfileProvider } from './src/auth/ProfileProvider';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </ProfileProvider>
    </AuthProvider>
  );
}
