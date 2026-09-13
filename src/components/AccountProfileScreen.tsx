import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../auth/AuthProvider';
import { colors } from '../theme/colors';
import { ScreenContainer } from './ScreenContainer';

export type ProfileMenuItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

// Shared by RenterProfileScreen and LandlordProfileScreen — same fields
// (email, name, role, log out); roleLabel and menuItems differ per role.
export function AccountProfileScreen({
  menuItems,
  roleLabel,
}: {
  menuItems?: ProfileMenuItem[];
  roleLabel: string;
}) {
  const { displayName, signOut, user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  async function handleLogout() {
    try {
      await signOut();
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : 'Unable to log out.');
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>
            {(displayName ?? user?.email ?? '?').charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{displayName ?? 'Your profile'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>{roleLabel}</Text>
        </View>
      </View>

      {menuItems && menuItems.length > 0 ? (
        <View style={styles.menu}>
          {menuItems.map((item, index) => (
            <Pressable
              key={item.key}
              onPress={item.onPress}
              style={({ pressed }) => [
                styles.menuRow,
                index === 0 && styles.menuRowFirst,
                pressed && styles.menuRowPressed,
              ]}
            >
              <Ionicons color={colors.accent} name={item.icon} size={20} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
            </Pressable>
          ))}
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        accessibilityRole="button"
        onPress={handleLogout}
        style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}
      >
        <Text style={styles.logoutButtonText}>Log out</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', paddingTop: 24 },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    width: 80,
  },
  avatarInitial: { color: colors.surface, fontSize: 32, fontWeight: '800' },
  name: { color: colors.textPrimary, fontSize: 22, fontWeight: '800', marginTop: 16 },
  email: { color: colors.textSecondary, fontSize: 14, marginTop: 4 },
  roleBadge: {
    backgroundColor: colors.accentMuted,
    borderRadius: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  roleBadgeText: { color: colors.accentPressed, fontSize: 12, fontWeight: '700' },
  menu: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 28,
  },
  menuRow: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuRowFirst: { borderTopWidth: 0 },
  menuRowPressed: { backgroundColor: colors.background },
  menuLabel: { color: colors.textPrimary, flex: 1, fontSize: 15, fontWeight: '600' },
  error: { color: colors.danger, fontSize: 13, marginTop: 24, textAlign: 'center' },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: 25,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: 'auto',
    minHeight: 52,
  },
  logoutButtonPressed: { backgroundColor: colors.background },
  logoutButtonText: { color: colors.danger, fontSize: 15, fontWeight: '700' },
});
