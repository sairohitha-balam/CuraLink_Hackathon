import { createBrowserClient } from '@supabase/ssr';

// This function creates a *client-side* Supabase client
// We will use this in our components (forms, etc.)
export function createClient() {
  // We set these variables in our .env.local file back in Step 1
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}