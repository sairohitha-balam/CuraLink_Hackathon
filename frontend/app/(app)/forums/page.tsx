'use client'; // This is a highly interactive page

import { useEffect, useState, useContext, createContext } from 'react';
import { createClient } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import FadeInWrapper from '@/components/FadeInWrapper';
// --- Define Types ---
type ResearcherReply = {
  id: number;
  reply_body: string;
  created_at: string;
  researcher: { full_name: string };
};
type ForumQuestion = {
  id: number;
  title: string;
  question_body: string;
  category: string;
  created_at: string;
  patient: { full_name: string };
  replies: ResearcherReply[];
};
type AppUser = {
  id: string;
  isResearcher: boolean;
  fullName: string;
} | null;

// --- Simple State Context ---
// We'll pass the user data down to all child components
const UserContext = createContext<AppUser>(null);

// --- Main Page Component ---
export default function ForumsPage() {
  const [user, setUser] = useState<AppUser>(null);
  const [questions, setQuestions] = useState<ForumQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const supabase = createClient();

  // --- Data Fetching ---
  const fetchForumData = async () => {
    try {
      // 1. Get User Profile
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('User not authenticated');
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, is_researcher')
        .eq('id', authUser.id)
        .single();
      if (profile) {
        setUser({ 
          id: profile.id, 
          isResearcher: profile.is_researcher, 
          fullName: profile.full_name 
        });
      }

      // 2. Get Questions
      const response = await fetch('process.env.NEXT_PUBLIC_API_URL/api/v1/forums/questions');
      if (!response.ok) throw new Error('Failed to fetch questions');
      const data: ForumQuestion[] = await response.json();
      setQuestions(data);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Initial Load ---
  useEffect(() => {
    fetchForumData();
  }, []);

  return (
    <UserContext.Provider value={user}>
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Forums</h1>
          {/* Only show "Ask" button if user is loaded AND is a patient */}
          {user && !user.isResearcher && (
            <button
  onClick={() => setShowQuestionModal(true)}
  className="rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
>
  Ask a Question
</button>
          )}
        </div>

        {/* --- Loading / Error States --- */}
        {isLoading && <p className="mt-4">Loading forums...</p>}
        {error && <p className="mt-4 text-red-600">{error}</p>}

        {/* --- Questions List --- */}
        <div className="mt-8 space-y-4">
          {!isLoading && !error && questions.length === 0 && (
            <p className="text-gray-600">No questions have been asked yet.</p>
          )}

          {questions.map((q, index) => (
  <FadeInWrapper key={q.id} delay={index * 0.1}>
    <QuestionCard question={q} onReplySuccess={fetchForumData} />
  </FadeInWrapper>
))}
        </div>

        {/* --- Modals --- */}
        {showQuestionModal && (
          <AskQuestionModal
            onClose={() => setShowQuestionModal(false)}
            onQuestionPosted={() => {
              setShowQuestionModal(false);
              fetchForumData(); // Refresh list after posting
            }}
          />
        )}
      </div>
    </UserContext.Provider>
  );
}

// --- Question Card Component ---
function QuestionCard({ question, onReplySuccess }: { question: ForumQuestion, onReplySuccess: () => void }) {
  const user = useContext(UserContext);
  const [showReplyBox, setShowReplyBox] = useState(false);

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
      <div className="p-4 sm:p-6">
        <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
          {question.category}
        </span>
        <h3 className="mt-2 text-lg font-semibold text-gray-900">{question.title}</h3>
        <p className="mt-2 text-sm text-gray-600">
          <span className="font-medium">{question.patient.full_name}</span> asked:
        </p>
        <p className="mt-1 text-gray-800">{question.question_body}</p>
        <p className="mt-2 text-xs text-gray-400">
          {new Date(question.created_at).toLocaleString()}
        </p>

        {/* --- Replies --- */}
        <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-200">
          {question.replies.length === 0 && (
            <p className="text-sm text-gray-500">No replies yet.</p>
          )}
          {question.replies.map((reply) => (
            <div key={reply.id}>
              <p className="text-sm text-gray-800">{reply.reply_body}</p>
              <p className="text-xs text-gray-500">
                - <span className="font-medium">Dr. {reply.researcher.full_name}</span>, {new Date(reply.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* --- Reply Button/Box (Researchers Only) --- */}
        {user && user.isResearcher && (
          <div className="mt-4">
            {!showReplyBox && (
              <button
                onClick={() => setShowReplyBox(true)}
                className="text-sm font-medium text-gray-900 hover:text-blue-500"
              >
                Write a reply
              </button>
            )}
            {showReplyBox && (
              <ReplyForm
                questionId={question.id}
                onReplySuccess={() => {
                  setShowReplyBox(false);
                  onReplySuccess(); // Refresh the list
                }}
                onCancel={() => setShowReplyBox(false)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Ask Question Modal Component ---
function AskQuestionModal({ onClose, onQuestionPosted }: { onClose: () => void, onQuestionPosted: () => void }) {
  const user = useContext(UserContext);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('General');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return setError('User not found');
    setError(null);

    try {
      const response = await fetch('process.env.NEXT_PUBLIC_API_URL/api/v1/forums/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          title: title,
          question_body: body,
          category: category,
        }),
      });
      if (!response.ok) throw new Error('Failed to post question');
      onQuestionPosted();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-10 bg-gray-500 bg-opacity-75">
      <div className="flex min-h-full items-center justify-center p-4">
        <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-lg bg-white p-6">
          <h2 className="text-xl font-semibold">Ask a New Question</h2>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium">Title</label>
              <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm" />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium">Category</label>
              <input id="category" value={category} onChange={(e) => setCategory(e.target.value)} required placeholder="e.g., Cancer Research" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm" />
            </div>
            <div>
              <label htmlFor="body" className="block text-sm font-medium">Question</label>
              <textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} rows={4} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm" />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" className="rounded-md bg-gray-900 px-3 py-2 text-sm text-white hover:bg-gray-700">Post Question</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Reply Form Component ---
function ReplyForm({ questionId, onReplySuccess, onCancel }: { questionId: number, onReplySuccess: () => void, onCancel: () => void }) {
  const user = useContext(UserContext);
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return setError('User not found');
    setError(null);

    try {
      const response = await fetch('process.env.NEXT_PUBLIC_API_URL/api/v1/forums/replies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          question_id: questionId,
          reply_body: body,
        }),
      });
      if (!response.ok) throw new Error('Failed to post reply');
      onReplySuccess();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2">
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        required
        placeholder="Write your answer..."
        className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
      />
      <div className="mt-2 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="text-sm text-gray-600 hover:text-gray-800">Cancel</button>
        <button type="submit" className="rounded-md bg-gray-900 px-3 py-1 text-sm text-white hover:bg-gray-700">Post Reply</button>
      </div>
    </form>
  );
}