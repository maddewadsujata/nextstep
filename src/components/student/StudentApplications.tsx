import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Award, 
  ArrowRight, 
  Filter, 
  LayoutList, 
  Kanban, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Video
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Application, ApplicationStatus } from '../../types';

interface StudentApplicationsProps {
  onNavigate?: (page: string, params?: any) => void;
}

export const StudentApplications: React.FC<StudentApplicationsProps> = ({ onNavigate }) => {
  const { applications, updateApplicationStatus, withdrawApplication } = useData();
  const { currentUser } = useAuth();

  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const myApps = applications.filter(a => a.studentId === currentUser?.id);

  const filteredApps = myApps.filter(app => {
    if (statusFilter !== 'all' && app.status !== statusFilter) return false;
    return true;
  });

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'applied':
        return <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-800 px-2.5 py-0.5 rounded">Applied</span>;
      case 'under_review':
        return <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-950/60 px-2.5 py-0.5 rounded">Under Review</span>;
      case 'shortlisted':
        return <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 dark:text-indigo-300 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded">Shortlisted</span>;
      case 'interview_scheduled':
        return <span className="text-[11px] font-semibold text-violet-700 bg-violet-50 dark:text-violet-300 dark:bg-violet-950/60 px-2.5 py-0.5 rounded">Interview Scheduled</span>;
      case 'offer_received':
        return <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded animate-pulse">Offer Received!</span>;
      case 'accepted':
        return <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 dark:text-emerald-200 dark:bg-emerald-900 px-2.5 py-0.5 rounded">Offer Accepted</span>;
      case 'rejected':
        return <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-950/60 px-2.5 py-0.5 rounded">Not Selected</span>;
      case 'withdrawn':
        return <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-800 px-2.5 py-0.5 rounded">Withdrawn</span>;
      default:
        return null;
    }
  };

  const [appToWithdraw, setAppToWithdraw] = useState<Application | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAcceptOffer = (appId: string) => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    updateApplicationStatus(appId, 'accepted', 'Offer accepted by candidate with celebration!');
    if (selectedApp?.id === appId) {
      setSelectedApp(prev => prev ? { ...prev, status: 'accepted' } : null);
    }
  };

  const promptWithdraw = (app: Application) => {
    setAppToWithdraw(app);
  };

  const confirmWithdrawAction = () => {
    if (!appToWithdraw) return;
    const appId = appToWithdraw.id;
    withdrawApplication(appId);
    if (selectedApp?.id === appId) {
      setSelectedApp(prev => prev ? { ...prev, status: 'withdrawn' } : null);
    }
    setAppToWithdraw(null);
    setToastMessage('Application withdrawn successfully.');
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const kanbanColumns: { id: ApplicationStatus; title: string }[] = [
    { id: 'applied', title: 'Applied' },
    { id: 'under_review', title: 'Under Review' },
    { id: 'shortlisted', title: 'Shortlisted' },
    { id: 'interview_scheduled', title: 'Interviews' },
    { id: 'offer_received', title: 'Offers' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Applications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track your internship progress, manage scheduled interview rounds, and review received offers.
          </p>
        </div>

        {/* View toggles & Filter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Pipeline</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Stages ({myApps.length})</option>
            <option value="applied">Applied</option>
            <option value="under_review">Under Review</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview_scheduled">Interview Scheduled</option>
            <option value="offer_received">Offer Received</option>
          </select>
        </div>
      </div>

      {myApps.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-700 space-y-3">
          <Briefcase className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No active applications yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Explore open opportunities and submit your first application with AI-tailored cover letters.
          </p>
        </div>
      ) : viewMode === 'kanban' ? (
        /* KANBAN BOARD */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {kanbanColumns.map(col => {
            const colApps = filteredApps.filter(a => a.status === col.id);

            return (
              <div
                key={col.id}
                className="bg-slate-100/70 dark:bg-slate-800/40 rounded-xl p-3 border border-slate-200 dark:border-slate-700/60 flex flex-col min-w-[220px]"
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
                  {colApps.map(app => (
                    <div
                      key={app.id}
                      onClick={() => setSelectedApp(app)}
                      className="bg-white dark:bg-slate-800 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-500 cursor-pointer transition-all space-y-2"
                    >
                      <div>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          {app.companyName}
                        </p>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                          {app.internshipTitle}
                        </h4>
                      </div>

                      {app.interviewDetails && (
                        <div className="text-[10px] bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 p-1.5 rounded flex items-center gap-1">
                          <Calendar className="w-3 h-3 shrink-0" />
                          <span>{app.interviewDetails.date} ({app.interviewDetails.time})</span>
                        </div>
                      )}

                      {app.offerDetails && (
                        <div className="text-[10px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 p-1.5 rounded font-bold">
                          🎉 Offer: {app.offerDetails.stipend}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                        <span>Applied {new Date(app.appliedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Opportunity</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Applied Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredApps.map(app => (
                  <tr
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {app.internshipTitle}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {app.companyName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 tabular-nums">
                      {new Date(app.appliedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedApp(app);
                        }}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* APPLICATION DETAILS SLIDE-OVER / MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {selectedApp.companyName}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedApp.internshipTitle}
                </h3>
                <div className="mt-1">
                  {getStatusBadge(selectedApp.status)}
                </div>
              </div>

              <button
                onClick={() => setSelectedApp(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Offer Callout if offer_received */}
            {selectedApp.status === 'offer_received' && selectedApp.offerDetails && (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-bold text-sm">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <span>Formal Internship Offer Extended!</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-emerald-900 dark:text-emerald-100">
                  <p>Stipend: <strong>{selectedApp.offerDetails.stipend}</strong></p>
                  <p>Duration: <strong>{selectedApp.offerDetails.duration}</strong></p>
                  <p>Start Date: <strong>{selectedApp.offerDetails.startDate}</strong></p>
                  <p>Offer Valid Until: <strong>{selectedApp.offerDetails.expiryDate}</strong></p>
                </div>
                <button
                  onClick={() => handleAcceptOffer(selectedApp.id)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
                >
                  Accept Offer & Celebrate 🎉
                </button>
              </div>
            )}

            {/* Interview Details if interview_scheduled */}
            {selectedApp.status === 'interview_scheduled' && selectedApp.interviewDetails && (
              <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-violet-900 dark:text-violet-200 text-sm">
                    {selectedApp.interviewDetails.type} Interview
                  </span>
                  <span className="font-bold text-violet-700 bg-violet-100 dark:bg-violet-900 px-2 py-0.5 rounded">
                    {selectedApp.interviewDetails.time} {selectedApp.interviewDetails.timezone}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  Date: <strong>{new Date(selectedApp.interviewDetails.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</strong>
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  Instructions: {selectedApp.interviewDetails.instructions}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const mId = selectedApp.interviewDetails?.meetingId || 'meet-ns-sujata-sakshi';
                    if (onNavigate) {
                      onNavigate('meeting', { meetingId: mId });
                    } else {
                      window.location.href = `/meeting/${mId}`;
                    }
                  }}
                  className="w-full py-2.5 px-3 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-violet-600/30 cursor-pointer mt-2"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Join Interview Room</span>
                </button>
              </div>
            )}

            {/* Application Timeline */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                Lifecycle Progression
              </h4>
              <div className="space-y-3 pl-2 border-l-2 border-slate-200 dark:border-slate-700">
                {selectedApp.history.map((h, i) => (
                  <div key={i} className="relative pl-4">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 border-2 border-white dark:border-slate-900" />
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize">
                      {h.status.replace('_', ' ')}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(h.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                    {h.note && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        {h.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Submitted Cover Letter */}
            {selectedApp.coverLetter && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Submitted Cover Letter
                </h4>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {selectedApp.coverLetter}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              {selectedApp.status !== 'withdrawn' && selectedApp.status !== 'accepted' && (
                <button
                  type="button"
                  onClick={() => promptWithdraw(selectedApp)}
                  className="py-2 px-3 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                >
                  Withdraw Application
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="py-2 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 rounded-lg text-xs font-semibold ml-auto cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* WITHDRAW CONFIRMATION DIALOG MODAL */}
      {appToWithdraw && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center font-bold">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Withdraw Application
                </h3>
                <span className="text-xs text-slate-500">
                  {appToWithdraw.companyName}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to withdraw this application for <strong>{appToWithdraw.internshipTitle}</strong>?
            </p>
            <p className="text-[11px] text-slate-400">
              Once withdrawn, the recruiter will be notified and your submission will be removed from active review. This action cannot be reversed.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setAppToWithdraw(null)}
                className="py-2 px-3.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmWithdrawAction}
                className="py-2 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-colors shadow-sm cursor-pointer"
              >
                Yes, Withdraw Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST SUCCESS NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-60 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-250 border border-white/10">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
