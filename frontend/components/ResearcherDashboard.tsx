'use client';

import FadeInWrapper from '@/components/FadeInWrapper';
import Link from 'next/link';

// Define the type for the data we receive
type Researcher = {
  id: string;
  full_name: string;
  research_interests: string;
};

// Accept 'recommendations' as a prop
export default function ResearcherDashboard({ recommendations }: { recommendations: Researcher[] }) {
  return (
    <FadeInWrapper>
      <div className="mt-8 space-y-6">
        {/* This section is static, which is fine */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800">
            Forum Questions
          </h2>
          <Link
            href="/forums"
            className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-lg"
          >
            <h3 className="font-semibold">
              Question about new immunotherapy side effects
            </h3>
            <p className="text-sm text-gray-600">
              A patient is asking about...
            </p>
            <span className="mt-2 text-sm font-medium text-gray-900">
              View & Answer &rarr;
            </span>
          </Link>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800">
            Potential Collaborators
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {recommendations.length > 0 ? (
              recommendations.map((researcher) => (
                <Link
                  href="/collaborators" // Make it a link!
                  key={researcher.id}
                  className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <h3 className="font-semibold">{researcher.full_name}</h3>
                  <p className="text-sm text-gray-600">
                    Interests: {researcher.research_interests}
                  </p>
                </Link>
              ))
            ) : (
              // Show a helpful message if no data
              <p className="text-gray-600 md:col-span-2">
                No new collaborators found.
                <Link href="/collaborators" className="font-medium text-gray-900 underline ml-1">
                  Search for collaborators
                </Link> page.
              </p>
            )}
          </div>
        </section>
      </div>
    </FadeInWrapper>
  );
}