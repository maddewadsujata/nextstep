import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Download, 
  Search, 
  Calendar, 
  Award, 
  XCircle, 
  CheckCircle, 
  FileText, 
  ChevronRight,
  MessageSquare,
  Clock,
  Sparkles
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Application, ApplicationStatus } from '../../types';

export const ApplicantPipeline: React.FC = () => {
  const { 
    applications, 
    internships, 
    updateApplicationStatus, 
    addRecruiterNote 
  } = useData();
  const { currentUser } = useAuth();

  const [selectedInternshipId, setSelectedInternshipId] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Recruiter Note state
  const [noteText, setNoteText] = useState('');

  // Interview Scheduler State
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewDate, setInterviewDate] = useState('2026-10-28');
  const [interviewTime, setInterviewTime] = useState('11:00 AM');
  const [interviewTimezone, setInterviewTimezone] = useState('IST');
  const [interviewType, setInterviewType] = useState<'Technical' | 'Behavioral' | 'Screening' | 'Final Round'>('Technical');
  const [meetingId, setMeetingId] = useState('meet-ns-sujata-sakshi');
  const [meetingUrl, setMeetingUrl] = useState('/meeting/meet-ns-sujata-sakshi');
  const [instructions, setInstructions] = useState('Prepare to discuss your recent projects and walk through your React code.');

  // Offer Letter Generator State
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerStipend, setOfferStipend] = useState('₹20,000 / month');
  const [offerDuration, setOfferDuration] = useState('6 Months');
  const [offerStartDate, setOfferStartDate] = useState('January 1, 2027');
  const [offerExpiryDate, setOfferExpiryDate] = useState('15 Nov 2026');

  // Filter relevant listings
  const myListings = internships.filter(i => i.recruiterId === currentUser?.id || i.recruiterId === 'user-recruiter-marcus-01');
  const myListingIds = new Set(myListings.map(i => i.id));

  const relevantApps = applications.filter(a => myListingIds.has(a.internshipId));

  const filteredApps = relevantApps.filter(a => {
    if (selectedInternshipId !== 'all' && a.internshipId !== selectedInternshipId) return false;
    return true;
  });

  const columns: { id: ApplicationStatus; title: string }[] = [
    { id: 'applied', title: 'Applied' },
    { id: 'under_review', title: 'Under Review' },
    { id: 'shortlisted', title: 'Shortlisted' },
    { id: 'interview_scheduled', title: 'Interviews' },
    { id: 'offer_received', title: 'Offers Extended' },
  ];

  const handleExportCSV = () => {
    const headers = ['Application ID', 'Internship', 'Candidate Name', 'Email', 'Applied At', 'Status', 'Recruiter Notes'];
    const rows = filteredApps.map(a => [
      a.id,
      `"${a.internshipTitle}"`,
      `"${a.studentName}"`,
      a.studentEmail,
      a.appliedAt,
      a.status,
      `"${(a.recruiterNotes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NextStep_Applicants_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !noteText.trim()) return;
    addRecruiterNote(selectedApp.id, noteText.trim());
    setSelectedApp(prev => prev ? { ...prev, recruiterNotes: noteText.trim() } : null);
    setNoteText('');
  };

  const handleScheduleInterviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    const finalMeetingId = meetingId || `meet-ns-${Math.random().toString(36).substring(2, 9)}`;
    const finalMeetingUrl = `/meeting/${finalMeetingId}`;

    updateApplicationStatus(
      selectedApp.id,
      'interview_scheduled',
      `Scheduled ${interviewType} interview for ${interviewDate} at ${interviewTime} ${interviewTimezone}`,
      {
        date: interviewDate,
        time: interviewTime,
        timezone: interviewTimezone,
        type: interviewType,
        meetingId: finalMeetingId,
        meetingUrl: finalMeetingUrl,
        candidateName: selectedApp.studentName,
        recruiterName: currentUser?.name || 'Sakshi Maddewad',
        instructions,
      }
    );

    // Sync with backend API
    fetch('/api/meetings/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        meetingId: finalMeetingId,
        candidateName: selectedApp.studentName,
        candidateId: selectedApp.studentId,
        recruiterName: currentUser?.name || 'Sakshi Maddewad',
        recruiterId: currentUser?.id,
        position: selectedApp.internshipTitle,
        companyName: selectedApp.companyName,
        date: interviewDate,
        time: interviewTime,
      }),
    }).catch(() => {});

    setShowInterviewModal(false);
    setSelectedApp(null);
  };

  const handleCreateOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    updateApplicationStatus(
      selectedApp.id,
      'offer_received',
      `Extended formal internship offer with stipend ${offerStipend}`,
      undefined,
      {
        stipend: offerStipend,
        duration: offerDuration,
        startDate: offerStartDate,
        expiryDate: offerExpiryDate,
      }
    );
    setShowOfferModal(false);
    setSelectedApp(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Applicant Hiring Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review candidate qualifications, move through hiring stages, schedule interviews, and extend offers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedInternshipId}
            onChange={e => setSelectedInternshipId(e.target.value)}
            className="text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Opportunities ({myListings.length})</option>
            {myListings.map(l => (
              <option key={l.id} value={l.id}>{l.title}</option>
            ))}
          </select>

          <button
            onClick={handleExportCSV}
            className="py-2 px-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* PIPELINE KANBAN COLUMNS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {columns.map(col => {
          const colApps = filteredApps.filter(a => a.status === col.id);

          return (
            <div
              key={col.id}
              className="bg-slate-100/70 dark:bg-slate-800/40 rounded-xl p-3 border border-slate-200 dark:border-slate-700/60 flex flex-col min-w-[230px]"
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {col.title}
                </span>
                <span className="text-[10px] font-semibold bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full tabular-nums">
                  {colApps.length}
                </span>
              </div>

              <div className="space-y-3 flex-1">
                {colApps.length === 0 ? (
                  <div className="py-6 text-center text-[11px] text-slate-400">
                    No candidates in this stage
                  </div>
                ) : (
                  colApps.map(app => (
                    <div
                      key={app.id}
                      onClick={() => {
                        setSelectedApp(app);
                        setNoteText(app.recruiterNotes || '');
                      }}
                      className="bg-white dark:bg-slate-800 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-500 cursor-pointer transition-all space-y-2 group"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                            {app.studentName}
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            {app.internshipTitle}
                          </p>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {app.studentName.charAt(0)}
                        </div>
                      </div>

                      {app.recruiterNotes && (
                        <p className="text-[10px] bg-slate-50 dark:bg-slate-900 p-1.5 rounded text-slate-600 dark:text-slate-400 italic line-clamp-2">
                          "{app.recruiterNotes}"
                        </p>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                        <span>Applied {new Date(app.appliedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* APPLICANT REVIEW DRAWER / MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl my-8 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 max-h-[90vh] overflow-y-auto text-xs">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold text-base flex items-center justify-center">
                  {selectedApp.studentName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedApp.studentName}
                  </h3>
                  <p className="text-slate-500">
                    Candidate for <strong>{selectedApp.internshipTitle}</strong> · {selectedApp.studentEmail}
                  </p>
                </div>
              </div>

              <button onClick={() => setSelectedApp(null)} className="p-1.5 text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            {/* Quick Actions: Move Stages */}
            <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">
                Update Pipeline Status:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => updateApplicationStatus(selectedApp.id, 'under_review', 'Moved to Under Review')}
                  className="py-1 px-2.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 font-semibold text-[11px]"
                >
                  Under Review
                </button>
                <button
                  onClick={() => updateApplicationStatus(selectedApp.id, 'shortlisted', 'Candidate shortlisted for interview')}
                  className="py-1 px-2.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200 font-semibold text-[11px]"
                >
                  Shortlist
                </button>
                <button
                  onClick={() => setShowInterviewModal(true)}
                  className="py-1 px-2.5 rounded bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200 font-semibold text-[11px] flex items-center gap-1"
                >
                  <Calendar className="w-3 h-3" />
                  <span>Schedule Interview</span>
                </button>
                <button
                  onClick={() => setShowOfferModal(true)}
                  className="py-1 px-2.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 font-semibold text-[11px] flex items-center gap-1"
                >
                  <Award className="w-3 h-3" />
                  <span>Extend Offer</span>
                </button>
                <button
                  onClick={() => updateApplicationStatus(selectedApp.id, 'rejected', 'Candidate not selected at this time')}
                  className="py-1 px-2.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 font-semibold text-[11px]"
                >
                  Reject
                </button>
              </div>
            </div>

            {/* Candidate Cover Letter */}
            {selectedApp.coverLetter && (
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Submitted Cover Letter
                </h4>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {selectedApp.coverLetter}
                </div>
              </div>
            )}

            {/* Recruiter Internal Notes */}
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">
                Internal Recruiter Assessment & Feedback Notes (Restricted Visibility)
              </h4>
              <form onSubmit={handleSaveNote} className="space-y-2">
                <textarea
                  rows={3}
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Add private evaluation notes, interview scoring, or reference feedback..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  className="py-1.5 px-3 bg-slate-900 text-white rounded font-semibold text-[11px]"
                >
                  Save Internal Note
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* SCHEDULE INTERVIEW MODAL */}
      {showInterviewModal && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-xs">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Schedule Interview for {selectedApp.studentName}
            </h3>

            <form onSubmit={handleScheduleInterviewSubmit} className="space-y-3">
              <div>
                <label className="block font-medium mb-1">Interview Type</label>
                <select
                  value={interviewType}
                  onChange={e => setInterviewType(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="Technical">Technical Round (Coding / Architecture)</option>
                  <option value="Behavioral">Behavioral (Culture & STAR)</option>
                  <option value="Screening">Initial Screening</option>
                  <option value="Final Round">Final Round</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={interviewDate}
                    onChange={e => setInterviewDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Time & Timezone</label>
                  <input
                    type="text"
                    value={`${interviewTime} ${interviewTimezone}`}
                    onChange={e => setInterviewTime(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block font-medium">Online Video Room ID</label>
                  <button
                    type="button"
                    onClick={() => {
                      const newId = `meet-ns-${Math.random().toString(36).substring(2, 9)}`;
                      setMeetingId(newId);
                      setMeetingUrl(`/meeting/${newId}`);
                    }}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Generate New Room
                  </button>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-between">
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">{meetingId}</span>
                  <span className="text-[10px] text-slate-500">/meeting/{meetingId}</span>
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Instructions for Candidate</label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInterviewModal(false)}
                  className="py-1.5 px-3 border border-slate-300 dark:border-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-1.5 px-4 bg-indigo-600 text-white rounded-lg font-bold"
                >
                  Confirm & Send Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXTEND OFFER MODAL */}
      {showOfferModal && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-xs">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Extend Internship Offer to {selectedApp.studentName}
            </h3>

            <form onSubmit={handleCreateOfferSubmit} className="space-y-3">
              <div>
                <label className="block font-medium mb-1">Proposed Stipend</label>
                <input
                  type="text"
                  value={offerStipend}
                  onChange={e => setOfferStipend(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Duration</label>
                <input
                  type="text"
                  value={offerDuration}
                  onChange={e => setOfferDuration(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Expected Start Date</label>
                <input
                  type="text"
                  value={offerStartDate}
                  onChange={e => setOfferStartDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Offer Acceptance Expiry Date</label>
                <input
                  type="text"
                  value={offerExpiryDate}
                  onChange={e => setOfferExpiryDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOfferModal(false)}
                  className="py-1.5 px-3 border border-slate-300 dark:border-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-1.5 px-4 bg-emerald-600 text-white rounded-lg font-bold"
                >
                  Extend Formal Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
