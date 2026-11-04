import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useAuth } from './AuthProvider';
import { api } from '../lib/api';
import type { OwnProfile, ProfileUpdate } from '../lib/phase1Types';

type ProfileContextValue = {
  profile: OwnProfile | null; isLoading: boolean; error: Error | null;
  reload: () => Promise<OwnProfile | undefined>; save: (body: ProfileUpdate) => Promise<OwnProfile>;
};
const ProfileContext = createContext<ProfileContextValue | null>(null);
// Replaces the old local landlord verification context with authoritative profile
// state for both roles. Account changes remount it; auth itself is unchanged.
export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, role } = useAuth();
  return <ProfileSession key={`${user?.id ?? 'anonymous'}:${role ?? 'none'}`} enabled={!!user && !!role}>{children}</ProfileSession>;
}
function ProfileSession({ children, enabled }: { children: ReactNode; enabled: boolean }) {
  const [profile, setProfile] = useState<OwnProfile | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);
  const generation = useRef(0);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; generation.current += 1; }; }, []);
  const load = useCallback((): Promise<OwnProfile | undefined> => {
    if (!enabled) return Promise.resolve(undefined);
    const id = ++generation.current;
    return api.getOwnProfile().then((result) => {
      if (mounted.current && id === generation.current) {
        setProfile(result); setError(null); return result;
      }
      return undefined;
    }).catch((err: unknown) => {
      if (mounted.current && id === generation.current) setError(err instanceof Error ? err : new Error('Unable to load profile.'));
      return undefined;
    }).finally(() => { if (mounted.current && id === generation.current) setIsLoading(false); });
  }, [enabled]);
  const reload = useCallback(() => { setIsLoading(enabled); return load(); }, [enabled, load]);
  useEffect(() => { void load(); }, [load]);
  const save = useCallback(async (body: ProfileUpdate) => {
    // Invalidate pre-save reads; a late response must not restore old fields/status.
    generation.current += 1;
    try {
      const result = await api.updateOwnProfile(body);
      generation.current += 1;
      if (mounted.current) { setProfile(result); setError(null); }
      return result;
    } finally { if (mounted.current) setIsLoading(false); }
  }, []);
  const value = useMemo(() => ({ profile, isLoading, error, reload, save }), [profile, isLoading, error, reload, save]);
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}
export function useProfile() {
  const value = useContext(ProfileContext);
  if (!value) throw new Error('useProfile must be used inside ProfileProvider');
  return value;
}
