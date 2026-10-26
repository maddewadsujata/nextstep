import React, { useState } from 'react';
import { X, MapPin, DollarSign, Calendar, Users, Sparkles, CheckCircle2, Bookmark, Share2, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { Internship, MatchScoreResult } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

interface InternshipDetailModalProps {
  internship: Internship | null;
  onClose: () => void;
  onOpenAuth: () => void;
  onOpenReportModal: (internship: Internship) => void;
}

export const InternshipDetailModal: React.FC<InternshipDetailModalProps> = ({
  internship,
  onClose,
  onOpenAuth,
  onOpenReportModal,
}) => {
  const { applyToInternship, applications, savedInternshipIds, toggleSaveInternship, studentProfile } = useData();
  const { currentUser } = useAuth();

  const [isApplying, setIsApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [matchScoreData, setMatchScoreData] = useState<MatchScoreResult | null>(null);
  const [isCalculatingMatch, setIsCalculatingMatch] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  if (!internship) return null;

  const isSaved = savedInternshipIds.includes(internship.id);
  const hasApplied = applications.some(a => a.internshipId === internship.id && a.studentId === currentUser?.id);

  const handleCalculateMatch = async () => {
    setIsCalculatingMatch(true);
    try {
      const res = await fetch('/api/ai/match-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentProfile,
          internship,
        }),
      });
      const data = await res.json();
      setMatchScoreData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCalculatingMatch(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    setIsGeneratingCoverLetter(true);
    try {
      const res = await fetch('/api/ai/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentProfile,
          internship,
        }),
      });
      const data = await res.json();
      if (data.coverLetter) {
        setCoverLetter(data.coverLetter);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!currentUser) {
      onOpenAuth();
      return;
    }

    const res = applyToInternship(internship.id, coverLetter);
    if (!res.success) {
      setSubmitError(res.message);
    } else {
      setSubmitSuccess(true);
      setTimeout(() => {
        setIsApplying(false);
        setSubmitSuccess(false);
        onClose();
      }, 1800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {internship.companyName}
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                {internship.domain}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {internship.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400 pt-1">
              <span className="flex items-center gap-1 font-semibold text-slate-900 dark:text-white">
                {internship.stipend}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {internship.location} ({internship.type})
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Duration: {internship.duration}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleSaveInternship(internship.id)}
              className={`p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 ${
                isSaved ? 'text-indigo-600 fill-indigo-600' : 'text-slate-500'
              }`}
              title={isSaved ? 'Saved' : 'Save'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-indigo-600' : ''}`} />
            </button>
            <button
              onClick={() => onOpenReportModal(internship)}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-amber-500"
              title="Report listing"
            >
              <AlertTriangle className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          
          {/* AI Match Score Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50/80 to-blue-50/80 dark:from-indigo-950/40 dark:to-blue-950/40 border border-indigo-100 dark:border-indigo-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>NextStep AI Match Intelligence</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {matchScoreData
                  ? `Evaluated match for ${studentProfile.fullName}: ${matchScoreData.summary}`
                  : 'Compare your profile skills and projects against this role with Gemini AI.'}
              </p>
            </div>

            {matchScoreData ? (
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                    {matchScoreData.matchPercentage}%
                  </span>
                  <span className="block text-[10px] text-slate-500 font-medium">Estimated Match</span>
                </div>
              </div>
            ) : (
              <button
                onClick={handleCalculateMatch}
                disabled={isCalculatingMatch}
                className="py-2 px-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shrink-0 disabled:opacity-50"
              >
                {isCalculatingMatch ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Check My Match Score</span>
              </button>
            )}
          </div>

          {/* If Match Score Details expanded */}
          {matchScoreData && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
              <div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                  ✓ Matched Skills ({matchScoreData.matchedSkills.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {matchScoreData.matchedSkills.map(s => (
                    <span key={s} className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded text-[11px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {matchScoreData.missingSkills.length > 0 && (
                <div>
                  <span className="font-bold text-amber-600 dark:text-amber-400 block mb-1">
                    ⚠ Skill Gaps to Address
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {matchScoreData.missingSkills.map(s => (
                      <span key={s} className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded text-[11px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              Role Overview
            </h3>
            <p className="leading-relaxed text-slate-600 dark:text-slate-300">
              {internship.description}
            </p>
          </div>

          {/* Responsibilities */}
          {internship.responsibilities && internship.responsibilities.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                Key Responsibilities
              </h3>
              <ul className="space-y-1.5 list-disc list-inside text-slate-600 dark:text-slate-300 leading-relaxed">
                {internship.responsibilities.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Eligibility */}
          {internship.eligibility && internship.eligibility.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                Eligibility & Candidate Profile
              </h3>
              <ul className="space-y-1.5 list-disc list-inside text-slate-600 dark:text-slate-300 leading-relaxed">
                {internship.eligibility.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Required Skills */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              Required Skills & Technologies
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {internship.requiredSkills.map(skill => (
                <span
                  key={skill}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
            <div>
              <span className="text-[11px] text-slate-400 block">Openings</span>
              <span className="font-bold text-slate-900 dark:text-white tabular-nums">{internship.openings} positions</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Experience Level</span>
              <span className="font-bold text-slate-900 dark:text-white">{internship.experienceLevel}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Application Deadline</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {new Date(internship.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Company Status</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
              </span>
            </div>
          </div>

          {/* APPLICATION FORM SUB-SECTION */}
          {isApplying && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Submit Your Application
                </h3>
                <button
                  type="button"
                  onClick={handleGenerateCoverLetter}
                  disabled={isGeneratingCoverLetter}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-semibold flex items-center gap-1 disabled:opacity-50"
                >
                  {isGeneratingCoverLetter ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  <span>Generate AI Cover Letter</span>
                </button>
              </div>

              {submitError && (
                <div className="p-3 text-xs bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 rounded-lg">
                  {submitError}
                </div>
              )}

              {submitSuccess && (
                <div className="p-3 text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Application submitted successfully! Redirecting...</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Cover Letter / Personal Note (Editable)
                </label>
                <textarea
                  rows={5}
                  value={coverLetter}
                  onChange={e => setCoverLetter(e.target.value)}
                  placeholder="Share why you are excited about this role and how your projects align..."
                  className="w-full p-3 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Submitting as: <strong>{studentProfile.fullName}</strong> ({studentProfile.email})</span>
              </div>
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            {hasApplied ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> You have already applied to this position
              </span>
            ) : (
              <span>Applications reviewed on a rolling basis.</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="py-2 px-4 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold rounded-lg"
            >
              Close
            </button>

            {!hasApplied && (
              !isApplying ? (
                <button
                  onClick={() => {
                    if (!currentUser) {
                      onOpenAuth();
                    } else {
                      setIsApplying(true);
                      if (!coverLetter) {
                        setCoverLetter(`Dear Hiring Team at ${internship.companyName},\n\nI am eager to apply for the ${internship.title} position. As a student passionate about modern software and hands-on systems, I would love the opportunity to contribute.`);
                      }
                    }
                  }}
                  className="py-2 px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span>Apply for Internship</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleConfirmSubmit}
                  className="py-2 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span>Confirm & Submit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
