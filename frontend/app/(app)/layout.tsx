import AppLayout from '@/components/AppLayout';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// This layout wraps all our protected app pages
export default async function ProtectedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // 1. Get the current logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // This should be protected by middleware, but as a fallback:
  if (!user) {
    redirect('/login');
  }

  // 2. Get the user's profile from our 'profiles' table
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('full_name, is_researcher')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    // Handle error or missing profile (e.g., sign them out)
    console.error('Error fetching profile:', error);
    // You could redirect to a "complete profile" page if needed
    // For now, let's just use defaults.
  }

  const userName = profile?.full_name || 'No Name';
  const isResearcher = profile?.is_researcher || false;

  // 3. Pass the user's data to the AppLayout component
  return (
    <AppLayout userName={userName} isResearcher={isResearcher}>
      {children}
    </AppLayout>
  );
}