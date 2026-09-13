import { StatusBar } from 'expo-status-bar';
import type { EvidenceItem } from '@yourorg/ile-shared-types';

import { AuthProvider } from './src/auth/AuthProvider';
import { LandlordVerificationProvider } from './src/auth/LandlordVerificationProvider';
import { RootNavigator } from './src/navigation/RootNavigator';

// This local sibling dependency can become a git or npm dependency once the
// shared-types package is pushed to its own remote.
const evidenceItems: EvidenceItem[] = [];

export default function App() {
  void evidenceItems;

  return (
    <AuthProvider>
      <LandlordVerificationProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </LandlordVerificationProvider>
    </AuthProvider>
  );
}
