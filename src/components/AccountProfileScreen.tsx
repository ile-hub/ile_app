import { profileSummary } from '../lib/profiles';
import { ProfilePortrait } from './ProfilePortrait';
import { LegalPreferences } from './LegalPreferences';
import { useProfile } from '../auth/ProfileProvider';
import { Ionicons } from '@expo/vector-icons';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../auth/AuthProvider';
import { colors } from '../theme/colors';
import { ScreenContainer } from './ScreenContainer';
import { ErrorState, LoadingState } from './QueryState';

export type ProfileMenuItem = {
  key: string;
  label: string;
  detail?: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

// Shared by RenterProfileScreen and LandlordProfileScreen — same fields
// (email, name, role, log out); roleLabel and menuItems differ per role.
export function AccountProfileScreen({
  menuItems,
  roleLabel,
  children,
  focused = false,
  flow = 'overview',
  dashboard = false,
  settingsOnly = false,
}: {
  dashboard?: boolean;
  settingsOnly?: boolean;
  children?: ReactNode;
  focused?: boolean;
  flow?: string;
  menuItems?: ProfileMenuItem[];
  roleLabel: string;
}) {
  const { displayName: accountName, signOut, user } = useAuth();
  const { profile, reload, isLoading, error: profileError } = useProfile();
  const displayName = profileSummary(profile?.displayName ?? accountName) || 'Your profile';
  const [localSettings, setSettings] = useState(false);
  const settings = settingsOnly || localSettings;
  const [error, setError] = useState<string | null>(null);

  async function handleLogout() {
    try {
      await signOut();
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : 'Unable to log out.');
    }
  }

  return (
    <ScreenContainer resetKey={`${settings}:${flow}`} refreshing={isLoading} onRefresh={!settingsOnly && !settings && focused && flow === 'overview' ? () => { void reload(); } : undefined}>
      {!dashboard && !settingsOnly && focused && flow === 'overview' ? <Pressable accessibilityRole="button" accessibilityLabel={settings ? 'Back to profile' : 'Settings'}
        onPress={() => setSettings(!settings)} style={styles.settingsButton}>
        <Ionicons name={settings ? 'arrow-back' : 'settings-outline'} size={22} color={colors.accent} />
        <Text style={styles.menuLabel}>{settings ? 'Back to profile' : 'Settings'}</Text>
      </Pressable> : null}
      {settings && !settingsOnly ? <Text style={styles.name}>Settings</Text> : null}
      {!settingsOnly && (!focused || (!settings && flow === 'overview')) ? <View style={[styles.card, dashboard && styles.dashboardIdentity]}>
        <ProfilePortrait profile={profile} accessibilityLabel="Your profile photo" style={[styles.avatar, dashboard && styles.dashboardAvatar]} fallback={<View style={[styles.avatar, dashboard && styles.dashboardAvatar]}>
          <Text style={styles.avatarInitial}>
            {(displayName ?? user?.email ?? '?').charAt(0).toUpperCase()}
          </Text>
        </View>} />
        <Text style={[styles.name, dashboard && styles.dashboardName]}>{displayName ?? 'Your profile'}</Text>
        {!focused && !dashboard ? <Text style={styles.email}>{user?.email}</Text> : null}
        <View style={[styles.roleBadge, dashboard && styles.dashboardRole]}>
          <Text style={styles.roleBadgeText}>{roleLabel}</Text>
        </View>
      </View> : null}

      {dashboard && isLoading && !profile ? <LoadingState /> : null}
      {dashboard && profileError ? <ErrorState error={profileError} onRetry={reload} /> : null}

      {(!focused || (!settings && flow === 'overview')) && menuItems && menuItems.length > 0 ? (
        <View style={[styles.menu, dashboard && styles.dashboardMenu]}>
          {menuItems.map((item, index) => (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              onPress={item.onPress}
              style={({ pressed }) => [
                styles.menuRow,
                dashboard && styles.dashboardRow,
                index === 0 && styles.menuRowFirst,
                pressed && styles.menuRowPressed,
              ]}
            >
              <Ionicons color={colors.accent} name={item.icon} size={20} />
              <View style={styles.menuText}><Text style={[styles.menuLabel, { flex: 0 }]}>{item.label}</Text>{item.detail ? <Text numberOfLines={2} style={styles.menuDetail}>{item.detail}</Text> : null}</View>
              <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
            </Pressable>
          ))}
        </View>
      ) : null}

      {children ? <View style={{ marginTop: 24, display: (focused || settingsOnly) && settings ? 'none' : 'flex' }}>{children}</View> : null}

      {!focused || settings ? <>
      {focused || settingsOnly ? <Text style={styles.email}>Account: {user?.email}</Text> : null}
      <View style={{ marginTop: 24 }}><LegalPreferences /></View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        accessibilityRole="button"
        onPress={handleLogout}
        style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}
      >
        <Text style={styles.logoutButtonText}>Log out</Text>
      </Pressable>
      </> : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  dashboardIdentity: { paddingTop: 0 },
  dashboardAvatar: { width: 72, height: 72, borderRadius: 36 },
  dashboardName: { marginTop: 10, textAlign: 'center' },
  dashboardRole: { marginTop: 8, paddingVertical: 4 },
  dashboardMenu: { marginTop: 20, overflow: 'hidden' },
  dashboardRow: { minHeight: 84, paddingVertical: 12 },
  menuText: { flex: 1, gap: 4 },
  menuDetail: { color: colors.textSecondary, fontSize: 13, lineHeight: 19 },
  settingsButton: { flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'flex-end', minHeight: 48, paddingHorizontal: 16, backgroundColor: colors.surfaceSage, borderRadius: 24 },
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
