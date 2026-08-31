import type { User } from '@supabase/supabase-js';

import { supabase } from './supabase';

export type SelfServeRole = 'renter' | 'landlord';
export type HomeRoute = 'RenterHome' | 'LandlordHome';

export async function signUp(params: {
  email: string;
  password: string;
  displayName: string;
  role: SelfServeRole;
}) {
  return supabase.auth.signUp({
    email: params.email.trim(),
    password: params.password,
    options: {
      data: {
        role: params.role,
        display_name: params.displayName.trim(),
      },
    },
  });
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
}

export function getSelfServeRole(user: User): SelfServeRole | null {
  const role = user.user_metadata.role;
  return role === 'renter' || role === 'landlord' ? role : null;
}

export function getHomeRoute(role: SelfServeRole): HomeRoute {
  return role === 'renter' ? 'RenterHome' : 'LandlordHome';
}
