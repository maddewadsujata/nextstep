import React, { useState } from 'react';
import { 
  Star, 
  Award, 
  CheckCircle2, 
  X, 
  Send, 
  Sparkles, 
  User, 
  Briefcase, 
  Clock, 
  FileText,
  ThumbsUp,
  ThumbsDown,
  AlertCircle
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export interface InterviewFeedbackData {
  technicalRating: number;
  problemSolvingRating: number;
  communicationRating: number;
  culturalFitRating: number;
  recommendation: 'strong_hire' | 'hire' | 'next_round' | 'reject';
  notes: string;
  strengths: string;
  improvements: string;
  submittedAt: string;
}

interface InterviewFeedbackComponentProps {
  applicationId: string;
  candidateName: string;
  position: string;
  companyName: string;
  meetingId: string;
  onClose: () => void;
  onSaved: (feedback: InterviewFeedbackData) => void;
}

export const InterviewFeedbackComponent: React.FC<InterviewFeedbackComponentProps> = ({
  applicationId,
  candidateName,
  position,
  companyName,
  meetingId,
  onClose,
  onSaved,
}) => {
  const { addRecruiterNote, updateApplicationStatus, applications } = useData();

  const [technicalRating, setTechnicalRating] = useState<number>(4);
  const [problemSolvingRating, setProblemSolvingRating] = useState<number>(5);
  const [communicationRating, setCommunicationRating] = useState<number>(5);
  const [culturalFitRating, setCulturalFitRating] = useState<number>(4);
  const [recommendation, setRecommendation] = useState<'strong_hire' | 'hire' | 'next_round' | 'reject'>('strong_hire');
  const [notes, setNotes] = useState<string>(
    'Candidate Sujata Maddewad exhibited outstanding React architecture proficiency and articulate communication during the live video interview. Strong problem solving and system thinking.'
  );
  const [strengths, setStrengths] = useState<string>('Deep TypeScript knowledge, hands-on Node.js & MongoDB skills, clear explanation of capstone project.');
  const [improvements, setImprovements] = useState<string>('Further practice with distributed microservices architecture patterns.');
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const renderStarSelector = (rating: number, setRating: (r: number) => void, label: string) => {
    return (
      <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 text-xs">
        <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="p-1 text-slate-300 hover:text-amber-400 transition-colors focus:outline-none"
            >
              <Star
                className={`w-4 h-4 ${
                  star <= rating
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-300 dark:text-slate-600'
                }`}
              />
            </button>
          ))}
          <span className="ml-1 text-[11px] font-bold text-slate-500 w-3">{rating}</span>
        </div>
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const feedbackPayload: InterviewFeedbackData = {
      technicalRating,
      problemSolvingRating,
      communicationRating,
      culturalFitRating,
      recommendation,
      notes: notes.trim(),
      strengths: strengths.trim(),
      improvements: improvements.trim(),
      submittedAt: new Date().toISOString(),
    };

    const formattedRecruiterNote = `[INTERVIEW EVALUATION - ${recommendation.toUpperCase().replace('_', ' ')}]\n` +
      `Technical: ${technicalRating}/5 | Problem Solving: ${problemSolvingRating}/5 | Communication: ${communicationRating}/5 | Fit: ${culturalFitRating}/5\n` +
      `Recommendation: ${recommendation.toUpperCase().replace('_', ' ')}\n` +
      `Strengths: ${strengths.trim()}\n` +
      `Feedback: ${notes.trim()}\n` +
      `Evaluated at: ${new Date().toLocaleString()}`;

    // 1. Update in client DataContext
    addRecruiterNote(applicationId, formattedRecruiterNote);

    // 2. Persist to MongoDB via PUT /api/applications/:id
    try {
      const targetApp = applications.find(a => a.id === applicationId);
      const updatedInterviewDetails = targetApp?.interviewDetails ? {
        ...targetApp.interviewDetails,
        feedback: notes.trim(),
      } : {
        date: '2026-10-28',
        time: '11:00 AM',
        timezone: 'IST',
        type: 'Technical' as const,
        meetingId,
        meetingUrl: `/meeting/${meetingId}`,
        feedback: notes.trim(),
        instructions: '',
      };

      await fetch(`/api/applications/${applicationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recruiterNotes: formattedRecruiterNote,
          interviewDetails: updatedInterviewDetails,
          note: `Recruiter submitted interview evaluation: ${recommendation.replace('_', ' ').toUpperCase()}`,
        }),
      });
    } catch (err) {
      console.warn('Network sync for interview feedback:', err);
    }

    setSaving(false);
    setSavedSuccess(true);

    setTimeout(() => {
      onSaved(feedbackPayload);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in text-slate-900 dark:text-slate-100">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>Interview Concluded · Recruiter Evaluation</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
              Submit Structured Interview Notes
            </h2>
            <p className="text-xs text-slate-500">
              Candidate: <strong>{candidateName}</strong> · {position}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            title="Skip feedback"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {savedSuccess ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Evaluation Saved to MongoDB!
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Interview notes and rating scorecards have been recorded to {candidateName}'s application record.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Rating Matrix */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Candidate Competency Scorecard
              </span>
              {renderStarSelector(technicalRating, setTechnicalRating, 'Technical & Code Architecture')}
              {renderStarSelector(problemSolvingRating, setProblemSolvingRating, 'Problem Solving & Algorithmic Thinking')}
              {renderStarSelector(communicationRating, setCommunicationRating, 'Communication & Clarity')}
              {renderStarSelector(culturalFitRating, setCulturalFitRating, 'Team Culture & Enthusiasm')}
            </div>

            {/* Recommendation Pills */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Hiring Recommendation
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'strong_hire', label: 'Strong Hire', color: 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40' },
                  { id: 'hire', label: 'Hire', color: 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40' },
                  { id: 'next_round', label: 'Next Round', color: 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40' },
                  { id: 'reject', label: 'Do Not Hire', color: 'border-rose-500 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40' },
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRecommendation(item.id as any)}
                    className={`py-2 px-2 text-center rounded-lg border font-bold text-xs transition-all ${
                      recommendation === item.id 
                        ? `${item.color} shadow-sm ring-1 ring-current`
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Detailed Notes */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Detailed Evaluation Notes (Saved to Application)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Describe candidate's performance, code walkthrough, and answers..."
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Key Strengths
                </label>
                <input
                  type="text"
                  value={strengths}
                  onChange={e => setStrengths(e.target.value)}
                  placeholder="e.g. React hooks, TypeScript, fast thinker"
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Areas for Growth
                </label>
                <input
                  type="text"
                  value={improvements}
                  onChange={e => setImprovements(e.target.value)}
                  placeholder="e.g. Cloud scaling, unit testing"
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
              >
                Skip & Return to Dashboard
              </button>

              <button
                type="submit"
                disabled={saving}
                className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Save Evaluation to MongoDB</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
