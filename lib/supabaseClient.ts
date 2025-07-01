import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

let supabase: any;

if (!supabaseUrl || !supabaseAnonKey || 
    supabaseUrl === 'https://your-project-id.supabase.co' || 
    supabaseAnonKey === 'your-anon-key-here' ||
    supabaseUrl === 'https://placeholder.supabase.co' ||
    supabaseAnonKey === 'placeholder-anon-key') {
  console.warn(
    '⚠️ Supabase environment variables are not properly configured. Please update your .env file with actual Supabase credentials.\n\n' +
    'To fix this:\n' +
    '1. Go to https://supabase.com/dashboard\n' +
    '2. Create a new project or select existing one\n' +
    '3. Go to Settings → API\n' +
    '4. Copy your Project URL and anon/public key\n' +
    '5. Update the .env file with these values\n' +
    '6. Restart your development server'
  );
  
  // Create a mock client to prevent the app from crashing
  supabase = {
    auth: {
      signUp: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      signOut: () => Promise.resolve({ error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      resend: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
      setSession: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
    },
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      update: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      delete: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      upsert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
    })
  };
} else {
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    }
  });
}

export { supabase };