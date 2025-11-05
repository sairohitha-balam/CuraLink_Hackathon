'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// Define the navigation links (no changes here)
const patientNav = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Clinical Trials', href: '/trials' },
  { name: 'Health Experts', href: '/experts' },
  { name: 'Forums', href: '/forums' },
  { name: 'My Favorites', href: '/favorites' },
];
const researcherNav = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Manage Trials', href: '/trials/manage' },
  { name: 'Collaborators', href: '/collaborators' },
  { name: 'Forums', href: '/forums' },
  { name: 'My Favorites', href: '/favorites' },
];

// Helper function (no changes here)
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

// --- UPDATED AppLayout Component ---
export default function AppLayout({
  userName,
  isResearcher,
  children,
}: {
  userName: string | null;
  isResearcher: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const supabase = createClient();
  const router = useRouter();

  const navigation = isResearcher ? researcherNav : patientNav;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    // --- UPDATED: Main background is light gray ---
    <div className="flex h-screen bg-gray-100">
      
      {/* --- UPDATED: Sidebar is dark --- */}
      <div className="flex w-64 flex-col bg-gray-900">
        <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
          
          {/* Logo (now white) */}
          <div className="flex flex-shrink-0 items-center px-4">
            <Link href="/dashboard" className="text-2xl font-bold text-white">
              CuraLink
            </Link>
          </div>
          
          {/* Navigation Links (updated for dark) */}
          <nav className="mt-5 flex-1 space-y-1 px-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={classNames(
                  pathname === item.href
                    ? 'bg-gray-800 text-white' // Active link style
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white', // Inactive link
                  'group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        
        {/* Sidebar Footer (updated for dark) */}
        <div className="flex flex-shrink-0 border-t border-gray-700 p-4">
          <div className="flex-shrink-0">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">
                {userName || 'User'}
              </span>
              <button
                onClick={handleSignOut}
                className="text-left text-sm font-medium text-gray-400 hover:text-gray-200"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- Main Content Area (is light gray) --- */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        <main>
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              {/* The page content will be injected here */}
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}