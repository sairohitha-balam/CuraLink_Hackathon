'use client'; 

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import FadeInWrapper from '@/components/FadeInWrapper';

// Define a type for our trial results for TypeScript
type Trial = {
  nctId: string;
  title: string;
  status: string;
  summary: string;
  location: string;
};

// --- NEW: Custom Hook to get User ID ---
function useUserId() {
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    fetchUser();
  }, [supabase]);

  return userId;
}

export default function TrialsPage() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [results, setResults] = useState<Trial[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const userId = useUserId();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setResults([]);

    try {
      // --- THIS IS THE FIX ---
      // Changed to template literal with ${...}
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/trials/search?query=${encodeURIComponent(
          query
        )}&location=${encodeURIComponent(location)}`
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Failed to fetch trials');
      }

      const data: Trial[] = await response.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">
        Search Clinical Trials
      </h1>

      {/* --- Search Form (Unchanged) --- */}
      <form
        onSubmit={handleSearch}
        className="mt-6 flex flex-col gap-4 rounded-lg border bg-white p-4 shadow-sm md:flex-row"
      >
        <div className="flex-1">
          <label
            htmlFor="query"
            className="block text-sm font-medium text-gray-700"
          >
            Condition or Keyword
          </label>
          <input
            id="query"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., Lung Cancer"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-gray-500 sm:text-sm"
          />
        </div>
        <div className="flex-1">
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700"
          >
            Location (Optional)
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., New York or USA"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-gray-500 sm:text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="mt-6 self-start rounded-md border border-transparent bg-gray-900 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 md:self-end"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* --- Results (Unchanged) --- */}
      <div className="mt-8">
        {/* ... (loading/error/no results logic is the same) ... */}
        {isLoading && (
          <p className="text-center text-gray-600">Loading results...</p>
        )}
        {error && (
          <p className="text-center font-medium text-red-600">{error}</p>
        )}
        {!isLoading && !error && hasSearched && results.length === 0 && (
          <p className="text-center text-gray-600">
            No trials found. Try a different search.
          </p>
        )}
        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((trial, index) => (
              <FadeInWrapper key={trial.nctId} delay={index * 0.1}>
                <TrialCard trial={trial} userId={userId} />
              </FadeInWrapper>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- UPDATED Trial Result Card Component ---
function TrialCard({ trial, userId }: { trial: Trial; userId: string | null }) {
  const getStatusColor = (status: string) => {
    if (status.toLowerCase().includes('recruiting')) return 'text-green-700';
    if (status.toLowerCase().includes('completed')) return 'text-blue-700';
    return 'text-gray-700';
  };

  // --- NEW: handleFavorite function ---
  const handleFavorite = async () => {
    if (!userId) {
      alert('You must be logged in to add a favorite.');
      return;
    }

    try {
      // --- THIS IS THE SECOND FIX ---
      // Changed to template literal with ${...}
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/favorites/add`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            trial_id_str: trial.nctId, // Use the string ID
          }),
        }
      );
      if (!response.ok) throw new Error('Failed to add favorite');
      alert('Favorite added!');
    } catch (err) {
      alert('Error adding favorite.');
      console.error(err);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="p-4 sm:p-6">
        {/* --- NEW: Flex container for title and button --- */}
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{trial.title}</h3>
          <button
            onClick={handleFavorite}
            title="Add to favorites"
            className="ml-4 flex-shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            {/* Simple Star Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.31h5.518a.563.563 0 0 1 .321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.021a.562.562 0 0 1-.84.61l-4.725-2.885a.563.563 0 0 0-.586 0L6.982 21.7a.562.562 0 0 1-.84-.61l1.285-5.021a.563.563 0 0 0-.182-.557l-4.204-3.602a.563.563 0 0 1 .321-.988h5.518a.563.563 0 0 0 .475-.31L11.48 3.5Z"
              />
            </svg>
          </button>
        </div>

        {/* ... (rest of the card is the same) ... */}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
          <p>
            Status:{' '}
            <span className={`font-medium ${getStatusColor(trial.status)}`}>
              {trial.status}
            </span>
          </p>
          <p>
            ID: <span className="font-medium">{trial.nctId}</span>
          </p>
          <p>
            Location: <span className="font-medium">{trial.location}</span>
          </p>
        </div>

        <div className="mt-4">
          <h4 className="font-semibold text-gray-800">AI-Generated Summary</h4>
          <p className="mt-1 text-sm text-gray-600">{trial.summary}</p>
        </div>
      </div>
    </div>
  );
}