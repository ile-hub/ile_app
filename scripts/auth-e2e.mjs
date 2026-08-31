import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const runId = Date.now();
const password = 'LocalTestPassword123!';

async function verifyRole(role) {
  const email = `ile-${role}-${runId}@example.test`;
  const displayName = `E2E ${role}`;
  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { role, display_name: displayName } },
  });

  if (signUpError) throw signUpError;
  await supabase.auth.signOut();

  const { data, error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (loginError) throw loginError;

  const returnedRole = data.session?.user.user_metadata.role;
  const route = returnedRole === 'renter' ? 'RenterHome' : 'LandlordHome';

  if (returnedRole !== role) {
    throw new Error(`Expected ${role}, received ${String(returnedRole)}`);
  }

  console.log(JSON.stringify({ email, returnedRole, route }));
  await supabase.auth.signOut();
}

await verifyRole('renter');
await verifyRole('landlord');

const invalidEmail = `ile-invalid-${runId}@example.test`;
const { error: invalidRoleError } = await supabase.auth.signUp({
  email: invalidEmail,
  password,
  options: { data: { role: 'platform_admin', display_name: 'Invalid role' } },
});

if (!invalidRoleError) {
  throw new Error('Invalid role signup unexpectedly succeeded');
}

console.log(JSON.stringify({ invalidEmail, rejected: true, message: invalidRoleError.message }));
