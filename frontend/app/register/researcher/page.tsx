'use client';

import AuthLayout from '@/components/AuthLayout';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegisterResearcherPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [researchInterests, setResearchInterests] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { data: signUpData, error: signUpError } =
      await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: fullName,
            is_researcher: true,
            specialties: specialties,
            research_interests: researchInterests,
          },
        },
      });

    if (signUpError) {
      setError(signUpError.message);
    } else if (signUpData.user) {
      // Sign them in right away
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
      } else {
        // Success! Redirect to the dashboard.
        router.push('/dashboard');
        router.refresh();
      }
    }
  };

  return (
    <AuthLayout title="Create your Researcher account">
      <form className="space-y-4" onSubmit={handleSignUp}>
        {error && (
          <div className="rounded-md border border-red-400 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-gray-700"
          >
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-gray-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-gray-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password (min. 6 characters)
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-gray-500 sm:text-sm"
          />
        </div>

        {/* KEY FEATURES FROM THE BRIEF */}
        <div>
          <label
            htmlFor="specialties"
            className="block text-sm font-medium text-gray-700"
          >
            Specialties
          </label>
          <p className="text-xs text-gray-500">
            e.g., &quot;Oncology, Neurology, Immunology&quot;
          </p>
          <input
            id="specialties"
            type="text"
            value={specialties}
            onChange={(e) => setSpecialties(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-gray-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="researchInterests"
            className="block text-sm font-medium text-gray-700"
          >
            Research Interests
          </label>
          <p className="text-xs text-gray-500">
            e.g., &quot;Immunotherapy, Clinical AI, Gene Therapy&quot;
          </p>
          <input
            id="researchInterests"
            type="text"
            value={researchInterests}
            onChange={(e) => setResearchInterests(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-gray-500 sm:text-sm"
          />
        </div>

        <div>
          <button
            type="submit"
            className="flex w-full justify-center rounded-md border border-transparent bg-gray-900 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Create Account
          </button>
        </div>

        <div className="text-center text-sm">
          <p className="text-gray-600">
            Are you a Patient?{' '}
            <Link
              href="/register/patient"
              className="font-medium text-gray-900 hover:text-gray-600"
            >
              Register here
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}