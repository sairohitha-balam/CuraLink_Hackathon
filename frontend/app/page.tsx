import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import FadeInWrapper from '@/components/FadeInWrapper';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* --- Header --- */}
      <header className="py-4">
        <nav className="container mx-auto flex justify-between items-center px-4">
          <h1 className="text-2xl font-bold text-blue-600">CuraLink</h1>
          <div className="space-x-2 sm:space-x-4">
            <Link
              href="/login"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm sm:text-base font-medium"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm sm:text-base font-medium hover:bg-gray-700 transition-colors shadow-sm"
            >
              Sign Up
            </Link>
          </div>
        </nav>
      </header>

      {/* --- Hero Section --- */}
      <main className="flex-grow flex items-center justify-center">
        <div className="container mx-auto text-center px-4 py-16 sm:py-24">
          <FadeInWrapper>
            
            {/* --- UPDATED: Hero Content Wrapper (Dark) --- */}
            <div className="max-w-4xl mx-auto p-8 sm:p-12 rounded-2xl shadow-xl bg-gray-900">
              
              {/* --- UPDATED: Hero Text (Light) --- */}
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Find the future of health.
                <br />
                Together.
              </h2>
              <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
                CuraLink connects patients and researchers to discover relevant
                clinical trials, publications, and health experts.
              </p>

              {/* --- CTA Cards (Now nested in dark) --- */}
              <div className="flex flex-col md:flex-row justify-center gap-6">
                
                {/* --- UPDATED: Patient Card (Lighter Dark) --- */}
                <Link
                  href="/register/patient"
                  className="group flex-1 p-6 bg-gray-800 rounded-lg text-left hover:bg-gray-700 transition-all duration-300 shadow-lg border border-gray-700"
                >
                  <h3 className="text-xl font-semibold text-white mb-2">
                    For Patients & Caregivers
                  </h3>
                  <p className="text-base text-gray-300 mb-4">
                    Find trials, get AI-powered insights, and connect with experts.
                  </p>
                  <span className="text-white font-semibold text-base group-hover:underline flex items-center">
                    Get Started
                    <ArrowRightIcon className="w-5 h-5 ml-1 transform group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>

                {/* --- UPDATED: Researcher Card (Lighter Dark) --- */}
                <Link
                  href="/register/researcher"
                  className="group flex-1 p-6 bg-gray-800 rounded-lg text-left hover:bg-gray-700 transition-all duration-300 shadow-lg border border-gray-700"
                >
                  <h3 className="text-xl font-semibold text-white mb-2">
                    For Researchers
                  </h3>
                  <p className="text-base text-gray-300 mb-4">
                    Find collaborators, manage trials, and engage with patients.
                  </p>
                  <span className="text-white font-semibold text-base group-hover:underline flex items-center">
                    Join Now
                    <ArrowRightIcon className="w-5 h-5 ml-1 transform group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </div>
            </div>
          </FadeInWrapper>
        </div>
      </main>

      {/* --- Footer --- */}
      <FadeInWrapper delay={0.2}>
        <footer className="py-8 text-center text-gray-500">
          &copy; {new Date().getFullYear()} CuraLink. All rights reserved.
        </footer>
      </FadeInWrapper>
    </div>
  );
}