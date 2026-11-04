import type { Session, User } from '@supabase/supabase-js';
import type { MeResponse } from '@yourorg/ile-shared-types';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { api } from '../lib/api';
import type { SelfServeRole } from '../lib/auth';
import { supabase } from '../lib/supabase';

type AuthContextValue = {
  isLoading: boolean;
  // From GET /me, not from the Supabase session's metadata — the API's
  // users.role is the source of truth.
  role: SelfServeRole | null;
  user: User | null;
  me: MeResponse | null;
  displayName: string | null;
  // Set when signing in succeeded but GET /me didn't (API unreachable, or
  // an account that isn't a renter/landlord). Shown on the Login screen.
  sessionError: string | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function selfServeRole(me: MeResponse | null): SelfServeRole | null {
  return me?.role === 'renter' || me?.role === 'landlord' ? me.role : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  // The user whose /me result is currently applied. Token refreshes fire
  // auth events for the same user; they shouldn't refetch /me or flash the
  // loading screen.
  const loadedUserId = useRef<string | null>(null);

  const applySession = useCallback(async (session: Session | null) => {
    setUser(session?.user ?? null);

    if (!session) {
      loadedUserId.current = null;
      setMe(null);
      setIsLoading(false);
      return;
    }
    if (loadedUserId.current === session.user.id) {
      return;
    }

    loadedUserId.current = session.user.id;
    setIsLoading(true);
    setSessionError(null);
    try {
      const nextMe = await api.getMe();
      if (selfServeRole(nextMe)) {
        setMe(nextMe);
      } else {
        setSessionError('Your account does not have a valid renter or landlord role.');
        await supabase.auth.signOut();
      }
    } catch (error) {
      // Not signed out: a transient failure (API down) shouldn't throw
      // away a valid session. Logging in again retries /me.
      loadedUserId.current = null;
      setMe(null);
      setSessionError(error instanceof Error ? error.message : 'Unable to load your account.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) void applySession(data.session);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      // Deferred: supabase-js runs this callback while holding its auth
      // lock, and api.getMe() calls getSession(), which waits on that same
      // lock — awaiting it here would deadlock.
      setTimeout(() => {
        if (isMounted) void applySession(session);
      }, 0);
    });

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [applySession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading,
      role: selfServeRole(me),
      user,
      me,
      displayName: me?.displayName ?? null,
      sessionError,
      signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      },
    }),
    [isLoading, me, user, sessionError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
