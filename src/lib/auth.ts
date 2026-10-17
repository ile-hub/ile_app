import { supabase } from './supabase';

export type SelfServeRole = 'renter' | 'landlord';

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
