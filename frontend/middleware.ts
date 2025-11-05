import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // Create a Supabase client for server-side operations
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Get the current logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // --- Define Protected and Public Routes ---
  const protectedRoutes = ['/dashboard', '/favorites', '/trials', '/experts'];
  const authRoutes = ['/login', '/register'];

  // --- Logic ---

  // 1. If user is NOT logged in and tries to access a protected route
  if (!user && protectedRoutes.some((route) => pathname.startsWith(route))) {
    // Redirect them to the login page
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. If user IS logged in and tries to access an auth route (or the landing page)
  if (user && (authRoutes.some((route) => pathname.startsWith(route)) || pathname === '/')) {
    // Redirect them to their dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 3. Otherwise, allow the request to continue
  return NextResponse.next();
}

// Config: Specify which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};