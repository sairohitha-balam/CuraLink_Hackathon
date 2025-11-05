'use client'; // This page is interactive

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

// --- Define Types ---
type Trial = {
  id: number;
  title: string;
  status: string;
  phase: string;
  location: string;
  ai_summary: string;
};

// --- Main Page Component ---
export default function ManageTrialsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const supabase = createClient();

  // --- Data Fetching ---
  const fetchMyTrials = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Get User
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('User not authenticated');
      setUser(authUser);

      // 2. Get this user's trials
      const response = await fetch(
        `process.env.NEXT_PUBLIC_API_URL/api/v1/trials/my-trials/${authUser.id}`
      );
      if (!response.ok) throw new Error('Failed to fetch trials');
      const data: Trial[] = await response.json();
      setTrials(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Initial Load ---
  useEffect(() => {
    fetchMyTrials();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Manage Clinical Trials</h1>
        <button
  onClick={() => setShowAddModal(true)}
  className="rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
>
  + Add New Trial
</button>
      </div>

      {/* --- Loading / Error States --- */}
      {isLoading && <p className="mt-4">Loading your trials...</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}

      {/* --- Trials List --- */}
      <div className="mt-8 space-y-4">
        {!isLoading && !error && trials.length === 0 && (
          <p className="text-gray-600">You have not added any trials yet.</p>
        )}
        {trials.map((trial) => (
          <div key={trial.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <h3 className="font-semibold">{trial.title}</h3>
            <p className="text-sm text-gray-600">
              {trial.phase} | {trial.status} | {trial.location}
            </p>
            <p className="mt-2 text-sm text-gray-700">{trial.ai_summary}</p>
          </div>
        ))}
      </div>

      {/* --- Modals --- */}
      {showAddModal && user && (
        <AddTrialModal
          userId={user.id}
          onClose={() => setShowAddModal(false)}
          onTrialPosted={() => {
            setShowAddModal(false);
            fetchMyTrials(); // Refresh list after posting
          }}
        />
      )}
    </div>
  );
}

// --- Add Trial Modal Component ---
function AddTrialModal({ userId, onClose, onTrialPosted }: { userId: string, onClose: () => void, onTrialPosted: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eligibility_criteria: '',
    phase: 'Phase 1',
    status: 'Recruiting',
    location: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch('process.env.NEXT_PUBLIC_API_URL/api/v1/trials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          researcher_id: userId,
          ...formData,
        }),
      });
      if (!response.ok) throw new Error('Failed to post trial');
      onTrialPosted();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-10 bg-gray-500 bg-opacity-75">
      <div className="flex min-h-full items-center justify-center p-4">
        <form onSubmit={handleSubmit} className="w-full max-w-2xl rounded-lg bg-white p-6">
          <h2 className="text-xl font-semibold">Add a New Clinical Trial</h2>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium">Title</label>
              <input id="title" name="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm" />
            </div>
            
            <div className="sm:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium">Description</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm" />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="eligibility_criteria" className="block text-sm font-medium">Eligibility Criteria</label>
              <textarea id="eligibility_criteria" name="eligibility_criteria" value={formData.eligibility_criteria} onChange={handleChange} rows={3} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm" />
            </div>

            <div>
              <label htmlFor="phase" className="block text-sm font-medium">Phase</label>
              <select id="phase" name="phase" value={formData.phase} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm">
                <option>Phase 1</option>
                <option>Phase 2</option>
                <option>Phase 3</option>
                <option>Phase 4</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium">Status</label>
              <select id="status" name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm">
                <option>Recruiting</option>
                <option>Not yet recruiting</option>
                <option>Completed</option>
                <option>Active, not recruiting</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="location" className="block text-sm font-medium">Location</label>
              <input id="location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g., City, Country" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm" />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" className="rounded-md bg-gray-900 px-3 py-2 text-sm text-white hover:bg-gray-700">Add Trial</button>
          </div>
        </form>
      </div>
    </div>
  );
}