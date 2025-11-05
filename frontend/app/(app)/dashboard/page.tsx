import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import PatientDashboard from '@/components/PatientDashboard';
import ResearcherDashboard from '@/components/ResearcherDashboard';

// --- Define Types for our Fetched Data ---
type Trial = {
  nctId: string;
  title: string;
  summary: string;
};
type Researcher = {
  id: string;
  full_name: string;
  research_interests: string;
};

// --- Helper: Fetch Trials (based on patient's condition) ---
async function getPatientRecommendations(condition: string): Promise<Trial[]> {
  try {
    // Call our existing backend endpoint!
    const response = await fetch(
      `process.env.NEXT_PUBLIC_API_URL/api/v1/trials/search?query=${encodeURIComponent(
        condition
      )}&location=`
    );
    if (!response.ok) return [];
    
    const allTrials: any[] = await response.json();
    
    // Return just the first 2, and only the data we need
    return allTrials.slice(0, 2).map(t => ({
      nctId: t.nctId,
      title: t.title,
      summary: t.summary.substring(0, 100) + '...', // Short summary
    }));
  } catch (error) {
    console.error("Failed to fetch trial recommendations:", error);
    return [];
  }
}

// --- Helper: Fetch Collaborators (latest researchers) ---
async function getResearcherRecommendations(userId: string): Promise<Researcher[]> {
  try {
    // Call our existing backend endpoint!
    // We search with a blank query and exclude ourself.
    const response = await fetch(
      `process.env.NEXT_PUBLIC_API_URL/api/v1/researchers/search?query=&user_id=${userId}`
    );
    if (!response.ok) return [];
    
    const allResearchers: any[] = await response.json();
    
    // Return the first 2, and only the data we need
    return allResearchers.slice(0, 2).map(r => ({
      id: r.id,
      full_name: r.full_name,
      research_interests: r.research_interests || 'N/A',
    }));
  } catch (error) {
    console.error("Failed to fetch researcher recommendations:", error);
    return [];
  }
}

// --- The Main Dashboard Page (Server Component) ---
export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // 1. Get user and profile data
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null; // Should be impossible due to middleware

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, is_researcher, medical_conditions')
    .eq('id', user.id)
    .single();

  const isResearcher = profile?.is_researcher || false;

  // 2. Fetch data *based on user type*
  let trialRecs: Trial[] = [];
  let researcherRecs: Researcher[] = [];

  if (isResearcher) {
    // Fetch latest researchers
    researcherRecs = await getResearcherRecommendations(user.id);
  } else {
    // Fetch trials based on patient's condition
    const condition = profile?.medical_conditions || 'cancer'; // Default to 'cancer'
    trialRecs = await getPatientRecommendations(condition);
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">
        Welcome back, {profile?.full_name || 'User'}!
      </h1>

      {/* 3. Pass the *real data* to the components */}
      {isResearcher ? (
        <ResearcherDashboard recommendations={researcherRecs} />
      ) : (
        <PatientDashboard recommendations={trialRecs} />
      )}
    </div>
  );
}