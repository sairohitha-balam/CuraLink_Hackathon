'use client';

import AuthLayout from '@/components/AuthLayout';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegisterPatientPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [medicalConditions, setMedicalConditions] = useState('');
  const [location, setLocation] = useState('');
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
          // We pass our profile data here.
          // This will be used in a Database Trigger
          // to populate our 'profiles' table.
          data: {
            full_name: fullName,
            is_researcher: false,
            medical_conditions: medicalConditions,
            location: location,
          },
        },
      });

    if (signUpError) {
      setError(signUpError.message);
    } else if (signUpData.user) {
      // Supabase sends a confirmation email by default.
      // For the hackathon, we'll just log them in.
      // A full app would show a "Check your email" message.
      
      // Let's sign them in right away
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
    <AuthLayout title="Create your Patient account">
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

        {/* THIS IS THE KEY FEATURE FROM THE BRIEF */}
        <div>
          <label
            htmlFor="conditions"
            className="block text-sm font-medium text-gray-700"
          >
            Tell us about your medical condition(s)
          </label>
          <p className="text-xs text-gray-500">
            Use natural language. e.g., &quot;I have been diagnosed with
            Stage 2 lung cancer.&quot;
          </p>
          <textarea
            id="conditions"
            rows={3}
            value={medicalConditions}
            onChange={(e) => setMedicalConditions(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-gray-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700"
          >
            Location (City, Country)
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
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
            Are you a Researcher?{' '}
            <Link
              href="/register/researcher"
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