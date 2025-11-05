'use client'; // This component fetches data on the client

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import FadeInWrapper from '@/components/FadeInWrapper';
// --- Define Types for our Favorite Items ---
// This is what our API returns NOW
type RawFavoriteItem = {
  id: number;
  trial_id_str: string | null;
  expert: FavoriteExpert | null; // Expert details are already joined
};

// This is what we will RENDER
type FavoriteItem = {
  id: number;
  trial: FavoriteTrial | null;
  expert: FavoriteExpert | null;
};

// Types for the sub-objects
type FavoriteTrial = {
  nctId: string;
  title: string;
  status: string;
  summary: string;
  location: string;
};
type FavoriteExpert = {
  id: string;
  full_name: string;
  specialties: string;
  research_interests: string;
};

// --- NEW: Helper function to fetch single trial details ---
async function fetchTrialDetails(nctId: string): Promise<FavoriteTrial | null> {
  // This calls the *external* API, not our backend
  const CLINICAL_TRIALS_API_URL_SINGLE = `https://clinicaltrials.gov/api/v2/studies/${nctId}`;
  try {
    const params = new URLSearchParams({
      fields:
        'NCTId,BriefTitle,OverallStatus,BriefSummary,LocationCity,LocationCountry',
      format: 'json',
    });
    const trialResponse = await fetch(`${CLINICAL_TRIALS_API_URL_SINGLE}?${params}`);
    if (!trialResponse.ok) return null;
    
    const trial_data = await trialResponse.json();
    
    // Process the single trial data
    const study = trial_data.get("protocolSection", {});
    const ai_summary = study.get("descriptionModule", {}).get("briefSummary", "No summary available.");
    const locations = study.get("contactsLocationsModule", {}).get("locations", []);
    let location_str = "Multiple locations";
    if (locations && locations.length > 0) {
        const loc = locations[0];
        const city = loc.get("city", "");
        const country = loc.get("country", "");
        location_str = `${city}, ${country}`.replace(/^, |^,|^ $/, "");
        if (!location_str || location_str.trim() === ',') {
            location_str = "Location not specified";
        }
    }

    return {
      nctId: study.get("identificationModule", {}).get("nctId", "N/A"),
      title: study.get("identificationModule", {}).get("briefTitle", "No title"),
      status: study.get("statusModule", {}).get("overallStatus", "Unknown"),
      summary: ai_summary,
      location: location_str,
    };
  } catch (error) {
    console.error("Failed to fetch trial details:", error);
    return null; // Return null if fetching fails
  }
}


export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchFavorites = async () => {
      setIsLoading(true);
      setError(null);
      
      // 1. Get the user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('You must be logged in.');
        setIsLoading(false);
        return;
      }

      // 2. Fetch their favorites from our backend
      try {
        const response = await fetch(
          `process.env.NEXT_PUBLIC_API_URL/api/v1/favorites/${user.id}`
        );
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.detail || 'Failed to fetch favorites');
        }
        
        const rawData: RawFavoriteItem[] = await response.json();

        // 3. --- NEW: Process the data ---
        // Use Promise.all to fetch details for all trials in parallel
        const processedFavorites = await Promise.all(
          rawData.map(async (item) => {
            // If it's an expert, the data is already there
            if (item.expert) {
              return {
                id: item.id,
                expert: item.expert,
                trial: null,
              };
            }
            // If it's a trial, we need to fetch its details
            if (item.trial_id_str) {
              const trialDetails = await fetchTrialDetails(item.trial_id_str);
              return {
                id: item.id,
                expert: null,
                trial: trialDetails, // This will be the full trial object or null
              };
            }
            // Should not happen, but just in case
            return null;
          })
        );
        
        // Filter out any null items
        setFavorites(processedFavorites.filter(Boolean) as FavoriteItem[]);
        
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFavorites();
  }, [supabase]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>

      <div className="mt-8">
        {isLoading && <p>Loading your favorites...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!isLoading && !error && favorites.length === 0 && (
          <p className="text-gray-600">
            You haven&apos;t favorited anything yet. Start by searching for
            trials or experts.
          </p>
        )}
        
        {/* --- Render the list of favorites --- */}
        {!isLoading && favorites.length > 0 && (
          <div className="space-y-4">
            {favorites.map((item, index) => (
  <FadeInWrapper key={item.id} delay={index * 0.1}>
    {item.trial && (
      <FavoriteTrialCard trial={item.trial} />
    )}
    {item.expert && (
      <FavoriteExpertCard expert={item.expert} />
    )}
  </FadeInWrapper>
))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Card for Favorited Trials ---
function FavoriteTrialCard({ trial }: { trial: FavoriteTrial }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <h3 className="text-lg font-semibold text-gray-900">{trial.title}</h3>
      <p className="mt-1 text-sm text-gray-600">
        Status: <span className="font-medium">{trial.status}</span>
      </p>
      <p className="mt-2 text-sm text-gray-700">{trial.summary.substring(0, 150)}...</p>
    </div>
  );
}

// --- Card for Favorited Experts ---
function FavoriteExpertCard({ expert }: { expert: FavoriteExpert }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <h3 className="text-lg font-semibold text-gray-900">
        {expert.full_name}
      </h3>
      <p className="mt-1 text-sm text-gray-600">
        <span className="font-medium">Specialties:</span> {expert.specialties}
      </p>
      <p className="mt-1 text-sm text-gray-600">
        <span className="font-medium">Interests:</span> {expert.research_interests}
      </p>
    </div>
  );
}