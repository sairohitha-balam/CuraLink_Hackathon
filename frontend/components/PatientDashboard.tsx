'use client';

import FadeInWrapper from '@/components/FadeInWrapper';
import Link from 'next/link';

// Define the type for the data we receive
type Trial = {
  nctId: string;
  title: string;
  summary: string;
};

// Accept 'recommendations' as a prop
export default function PatientDashboard({ recommendations }: { recommendations: Trial[] }) {
  return (
    <FadeInWrapper>
      <div className="mt-8 space-y-6">
        <section>
          <h2 className="text-2xl font-semibold text-gray-800">
            Recommended Clinical Trials
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Check if we have recommendations */}
            {recommendations.length > 0 ? (
              recommendations.map((trial) => (
                <Link
                  href={`/trials?query=${encodeURIComponent(trial.title)}`} // Make it a link!
                  key={trial.nctId}
                  className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <h3 className="font-semibold">{trial.title}</h3>
                  <p className="text-sm text-gray-600">{trial.summary}</p>
                </Link>
              ))
            ) : (
              // Show a helpful message if no data
              <p className="text-gray-600 md:col-span-2">
                No specific trial recommendations found. Try a broader search in the
                <Link href="/trials" className="font-medium text-gray-900 underline ml-1">
                  Clinical Trials
                </Link> page.
              </p>
            )}
          </div>
        </section>

        {/* This section is still static, which is fine for the MVP */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800">
            Recommended Health Experts
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <h3 className="font-semibold">Dr. Emily Carter</h3>
              <p className="text-sm text-gray-600">Oncologist, New York</p>
            </div>
          </div>
        </section>
      </div>
    </FadeInWrapper>
  );
}