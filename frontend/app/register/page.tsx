import AuthLayout from '@/components/AuthLayout';
import Link from 'next/link';

// This is just a "chooser" page
export default function RegisterPage() {
  return (
    <AuthLayout title="Join CuraLink">
      <div className="space-y-4">
        <p className="text-center text-gray-600">
          How would you like to join?
        </p>

        <Link
          href="/register/patient"
          className="group block w-full rounded-lg border border-gray-300 p-4 text-left hover:border-blue-600 hover:shadow-sm"
        >
          <h3 className="font-semibold text-gray-800">
            I am a Patient or Caregiver
          </h3>
          <p className="text-sm text-gray-600">
            Find trials, experts, and publications.
          </p>
        </Link>

        <Link
          href="/register/researcher"
          className="group block w-full rounded-lg border border-gray-300 p-4 text-left hover:border-blue-600 hover:shadow-sm"
        >
          <h3 className="font-semibold text-gray-800">
            I am a Researcher or Health Expert
          </h3>
          <p className="text-sm text-gray-600">
            Find collaborators and manage trials.
          </p>
        </Link>

        <div className="text-center text-sm">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-gray-900 hover:text-gray-600"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}