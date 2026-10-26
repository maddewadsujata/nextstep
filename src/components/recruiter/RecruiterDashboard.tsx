import React, { useMemo } from 'react';
import { 
  Briefcase, 
  Users, 
  Calendar, 
  Award, 
  Plus, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle,
  Clock,
  ExternalLink,
  Database,
  Video
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

interface RecruiterDashboardProps {
  onNavigate: (page: string, params?: any) => void;
  onOpenCreateModal: () => void;
}

export const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({
  onNavigate,
  onOpenCreateModal,
}) => {
  const { internships, applications, recruiterProfile } = useData();
  const { currentUser } = useAuth();

  const myListings = useMemo(() => {
    return internships.filter(i => i.recruiterId === currentUser?.id || i.recruiterId === 'user-recruiter-marcus-01');
  }, [internships, currentUser]);

  const myListingsIds = useMemo(() => new Set(myListings.map(i => i.id)), [myListings]);

  const myApplicants = useMemo(() => {
    return applications.filter(a => myListingsIds.has(a.internshipId));
  }, [applications, myListingsIds]);

  const publishedCount = myListings.filter(i => i.status === 'published').length;
  const underReviewCount = myApplicants.filter(a => a.status === 'under_review').length;
  const interviewCount = myApplicants.filter(a => a.status === 'interview_scheduled').length;
  const offerCount = myApplicants.filter(a => a.status === 'offer_received' || a.status === 'accepted').length;

  // Upcoming interviews
  const scheduledInterviews = useMemo(() => {
    return myApplicants
      .filter(a => a.status === 'interview_scheduled' && a.interviewDetails)
      .map(a => ({ app: a, details: a.interviewDetails! }));
  }, [myApplicants]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Recruiter Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-indigo-300">
              Employer Talent Portal
            </span>
            {recruiterProfile.verificationStatus === 'verified' ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" /> Verified Partner
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded-full">
                <AlertCircle className="w-3 h-3" /> Verification Pending
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {currentUser?.name || recruiterProfile.recruiterName || 'Sakshi Maddewad'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            {recruiterProfile.companyName} Talent Hub · Managed by {currentUser?.name || recruiterProfile.recruiterName || 'Sakshi Maddewad'} ({recruiterProfile.workEmail || 'sakshi@persistent.com'}) · {recruiterProfile.location}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => onNavigate('recruiter-internships')}
            className="py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-sm border border-white/20 cursor-pointer"
          >
            <Briefcase className="w-4 h-4 text-indigo-300" />
            <span>Manage Internships</span>
          </button>

          <button
            type="button"
            onClick={onOpenCreateModal}
            className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Internship</span>
          </button>
        </div>
      </div>

      {/* Recruiter KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => onNavigate('recruiter-internships')}
          className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:border-indigo-400 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Live Listings</span>
            <Briefcase className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums mt-2">
            {publishedCount}
          </p>
          <span className="text-[11px] text-slate-400 group-hover:text-indigo-600 transition-colors mt-1 block">
            Manage listings →
          </span>
        </div>

        <div 
          onClick={() => onNavigate('recruiter-pipeline')}
          className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:border-blue-400 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Applicants</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums mt-2">
            {myApplicants.length}
          </p>
          <span className="text-[11px] text-slate-400 group-hover:text-blue-600 transition-colors mt-1 block">
            Open candidate Kanban →
          </span>
        </div>

        <div 
          onClick={() => onNavigate('recruiter-pipeline')}
          className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:border-violet-400 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Interviews Scheduled</span>
            <Calendar className="w-4 h-4 text-violet-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums mt-2">
            {interviewCount}
          </p>
          <span className="text-[11px] text-slate-400 group-hover:text-violet-600 transition-colors mt-1 block">
            Review interview schedules →
          </span>
        </div>

        <div 
          onClick={() => onNavigate('recruiter-pipeline')}
          className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:border-emerald-400 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Offers Extended</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums mt-2">
            {offerCount}
          </p>
          <span className="text-[11px] text-slate-400 group-hover:text-emerald-600 transition-colors mt-1 block">
            View offer terms →
          </span>
        </div>
      </div>

      {/* Recruitment Funnel & Candidate Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (8 cols): Active Listings Quick Table */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Your Company's Active Postings ({myListings.length})
            </h2>
            <button
              onClick={() => onNavigate('recruiter-internships')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Manage all
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-3">Role Title</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Openings</th>
                  <th className="py-2.5 px-3">Stipend</th>
                  <th className="py-2.5 px-3">Deadline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {myListings.map(listing => (
                  <tr key={listing.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30">
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                      {listing.title}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                        listing.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : listing.status === 'draft'
                          ? 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {listing.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 tabular-nums">{listing.openings}</td>
                    <td className="py-3 px-3 font-semibold">{listing.stipend}</td>
                    <td className="py-3 px-3 text-slate-500">
                      {new Date(listing.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (4 cols): Scheduled Candidate Interviews */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Upcoming Candidate Interview</span>
            </h2>
          </div>

          {scheduledInterviews.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 space-y-1">
              <Clock className="w-6 h-6 text-slate-400 mx-auto mb-2" />
              <p>No interviews scheduled this week.</p>
              <p className="text-[11px]">Move shortlisted candidates to schedule rounds.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduledInterviews.map(({ app, details }) => {
                const meetingId = details.meetingId || 'meet-ns-sujata-sakshi';
                return (
                  <div
                    key={app.id}
                    className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 space-y-2.5"
                  >
                    <div className="space-y-1">
                      <div className="flex items-start justify-between">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          Candidate: <span className="text-indigo-600 dark:text-indigo-400">{app.studentName || 'Sujata Maddewad'}</span>
                        </p>
                        <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded">
                          {details.time || '11:00 AM'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">
                        Position: <strong>{app.internshipTitle || 'Software Development Intern'}</strong>
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Date & Time: <strong>28 October 2026, 11:00 AM</strong>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onNavigate('meeting', { meetingId })}
                      className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-600/30 cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Interview</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
