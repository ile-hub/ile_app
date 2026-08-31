import { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../auth/AuthProvider';

export function RenterHomeScreen() {
  const { signOut } = useAuth();
  const [error, setError] = useState<string | null>(null);

  async function handleLogout() {
    try {
      await signOut();
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : 'Unable to log out.');
    }
  }

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="Log out" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  error: {
    color: '#b00020',
  },
});
