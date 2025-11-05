'use client';

import { useState, useEffect } from 'react'; // <-- ADD useEffect
import { createClient } from '@/lib/supabase'; // <-- ADD createClient
import FadeInWrapper from '@/components/FadeInWrapper';
type Researcher = {
  id: string;
  full_name: string;
  specialties: string | null;
  research_interests: string | null;
  available_for_meetings: boolean;
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

export default function ResearcherSearch({ title }: { title: string }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Researcher[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const userId = useUserId(); // <-- NEW: Get the logged-in user's ID

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    // --- NEW CHECK ---
    // Don't search if we don't know who the user is yet
    if (!userId) {
      setError("User not loaded. Please wait a moment and try again.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setResults([]);

    try {
      // --- UPDATED FETCH URL ---
      // We added the `&user_id=` parameter
      const response = await fetch(
        `process.env.NEXT_PUBLIC_API_URL/api/v1/researchers/search?query=${encodeURIComponent(
          query
        )}&user_id=${encodeURIComponent(userId)}` // <-- THE FIX
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Failed to fetch researchers');
      }

      const data: Researcher[] = await response.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      
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
            Name, Specialty, or Research Interest
          </label>
          <input
            id="query"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., Oncology, Dr. Smith, or Gene Therapy"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-gray-500 sm:text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="mt-1 self-start rounded-md border border-transparent bg-gray-900 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 md:self-end"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* --- Results (Unchanged) --- */}
      <div className="mt-8">
        {/* ... (loading/error logic is the same) ... */}
        {isLoading && (
          <p className="text-center text-gray-600">Loading results...</p>
        )}
        {error && (
          <p className="text-center font-medium text-red-600">{error}</p>
        )}
        {!isLoading && !error && hasSearched && results.length === 0 && (
          <p className="text-center text-gray-600">
            No researchers found on our platform. Try a different search.
          </p>
        )}
        {results.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((researcher, index) => (
  <FadeInWrapper key={researcher.id} delay={index * 0.1}>
    <ResearcherCard
      researcher={researcher}
      userId={userId}
    />
  </FadeInWrapper>
))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- UPDATED Researcher Result Card Component ---
function ResearcherCard({
  researcher,
  userId,
}: {
  researcher: Researcher;
  userId: string | null;
}) {
  const handleConnect = () => {
    alert('Connection request sent! (Feature in development)');
  };

  // --- NEW: handleFollow function ---
  const handleFollow = async () => {
    if (!userId) {
      alert('You must be logged in to follow.');
      return;
    }

    try {
      const response = await fetch(
        'process.env.NEXT_PUBLIC_API_URL/api/v1/favorites/add',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            expert_id: researcher.id, // Use the researcher's ID
          }),
        }
      );
      if (!response.ok) throw new Error('Failed to follow');
      alert('Followed!');
    } catch (err) {
      alert('Error following expert.');
      console.error(err);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <h3 className="text-lg font-semibold text-gray-900">
        {researcher.full_name}
      </h3>
      
      {/* ... (rest of the card is the same) ... */}
      {researcher.specialties && (
        <p className="mt-2 text-sm text-gray-600">
          <span className="font-medium text-gray-800">Specialties:</span>{' '}
          {researcher.specialties}
        </p>
      )}
      
      {researcher.research_interests && (
        <p className="mt-1 text-sm text-gray-600">
          <span className="font-medium text-gray-800">Interests:</span>{' '}
          {researcher.research_interests}
        </p>
      )}

      {/* --- UPDATED Action Buttons --- */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={handleConnect}
          className="rounded-md bg-gray-900 px-3 py-1 text-sm font-medium text-white hover:bg-gray-700"
        >
          Connect
        </button>
        <button
          onClick={handleFollow} // <-- NEW: Added onClick
          className="rounded-md border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Follow
        </button>
      </div>
    </div>
  );
}