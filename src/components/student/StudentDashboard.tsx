import React, { useMemo } from 'react';
import { 
  Briefcase, 
  CheckCircle, 
  Calendar, 
  Award, 
  ArrowRight, 
  Sparkles, 
  Bookmark, 
  Clock, 
  ExternalLink,
  Target,
  Plus,
  Database,
  Server,
  Code2,
  Camera,
  Search,
  Building2,
  MapPin,
  Filter,
  Video
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Internship } from '../../types';
import { SUJATA_STUDENT_ID } from '../../data/seedData';

interface StudentDashboardProps {
  onNavigate: (page: string, params?: any) => void;
  onSelectInternship: (internship: Internship) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate, onSelectInternship }) => {
  const { currentUser, updateCurrentUser } = useAuth();
  const { 
    studentProfile, 
    updateStudentProfile,
    applications, 
    internships, 
    savedInternshipIds, 
    toggleGoal, 
    addGoal 
  } = useData();

  const [newGoalText, setNewGoalText] = React.useState('');
  const [quickSearchQuery, setQuickSearchQuery] = React.useState('');
  const [mongoDocCount, setMongoDocCount] = React.useState<number | null>(null);
  const [isMongoLive, setIsMongoLive] = React.useState<boolean>(false);

  React.useEffect(() => {
    fetch('/api/internships')
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data)) {
          setMongoDocCount(json.data.length);
        }
      })
      .catch(() => {});

    fetch('/api/db/status')
      .then(res => res.json())
      .then(data => {
        if (data && data.isLiveMongo) {
          setIsMongoLive(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Please choose an image under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      localStorage.setItem('nextstep_sujata_avatar', dataUrl);
      updateStudentProfile({ avatarUrl: dataUrl });
      updateCurrentUser({ avatarUrl: dataUrl });
      try {
        await fetch(`/api/students/${studentProfile.userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatarUrl: dataUrl }),
        });
      } catch {
        // offline fallback
      }
    };
    reader.readAsDataURL(file);
  };

  // Determine if the current authenticated user corresponds to the demo student account
  const isDemoStudent = Boolean(
    currentUser?.id === SUJATA_STUDENT_ID ||
    (currentUser?.role === 'student' && currentUser?.isDemo) ||
    currentUser?.name?.trim().toLowerCase().includes('sujata')
  );

  // Greet as 'Welcome back, Sujata Maddewad!'
  const greetingText = isDemoStudent
    ? 'Welcome back, Sujata Maddewad!'
    : `Welcome back, ${currentUser?.name?.trim() || 'Sujata Maddewad'}!`;

  // Real stats calculated directly from database records
  const myApplications = useMemo(() => {
    return applications.filter(a => a.studentId === currentUser?.id);
  }, [applications, currentUser]);

  const shortlistedCount = myApplications.filter(a => a.status === 'shortlisted').length;
  const interviewCount = myApplications.filter(a => a.status === 'interview_scheduled').length;
  const offerCount = myApplications.filter(a => a.status === 'offer_received' || a.status === 'accepted').length;

  // Profile completion calculation
  const profileCompletion = useMemo(() => {
    let score = 30; // base for email & name
    if (studentProfile.college) score += 10;
    if (studentProfile.degree) score += 10;
    if (studentProfile.skills && studentProfile.skills.length >= 5) score += 15;
    if (studentProfile.projects && studentProfile.projects.length >= 2) score += 15;
    if (studentProfile.resumeName || studentProfile.resumeText) score += 10;
    if (studentProfile.githubUrl || studentProfile.linkedinUrl) score += 10;
    return Math.min(100, score);
  }, [studentProfile]);

  // Recommended internships matching student's skills
  const recommendedInternships = useMemo(() => {
    const userSkills = studentProfile.skills || [];
    return internships
      .filter(i => i.status === 'published')
      .map(i => {
        const matches = i.requiredSkills.filter(s => 
          userSkills.some(us => us.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(us.toLowerCase()))
        );
        const matchPct = Math.round((matches.length / (i.requiredSkills.length || 1)) * 100);
        return { internship: i, matchPct };
      })
      .sort((a, b) => b.matchPct - a.matchPct)
      .slice(0, 3);
  }, [internships, studentProfile]);

  // Upcoming interviews
  const upcomingInterviews = useMemo(() => {
    return myApplications
      .filter(a => a.status === 'interview_scheduled' && a.interviewDetails)
      .map(a => ({
        application: a,
        details: a.interviewDetails!
      }));
  }, [myApplications]);

  // Saved internships
  const savedList = useMemo(() => {
    return internships.filter(i => savedInternshipIds.includes(i.id)).slice(0, 3);
  }, [internships, savedInternshipIds]);

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    addGoal(newGoalText.trim());
    setNewGoalText('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Personalized Greeting & Profile Completion Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Student Avatar / Neutral Placeholder with Upload Option */}
            <div className="relative group shrink-0">
              {studentProfile.avatarUrl || currentUser?.avatarUrl ? (
                <img
                  src={studentProfile.avatarUrl || currentUser?.avatarUrl}
                  alt={studentProfile.fullName || 'Sujata Maddewad'}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-indigo-300/80 shadow-lg"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-indigo-500 via-indigo-600 to-emerald-400 text-white font-extrabold text-xl sm:text-2xl flex items-center justify-center border-2 border-white/30 shadow-lg">
                  SM
                </div>
              )}
              <label
                className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-md cursor-pointer transition-transform hover:scale-110"
                title="Upload personal profile photo for Sujata Maddewad"
              >
                <Camera className="w-3.5 h-3.5" />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                <span>Student Career Center</span>
              </div>
              {/* Personalized Greeting: "Welcome back, Sujata Maddewad!" */}
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {greetingText}
              </h1>
              <p className="text-xs sm:text-sm text-indigo-200 max-w-xl">
                {studentProfile.college ? `${studentProfile.branch} at ${studentProfile.college}` : 'Complete your student profile to unlock top-tier ATS ranking and AI matching.'}
              </p>
            </div>
          </div>

          {/* Profile Completion Meter */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 w-full md:w-64 shrink-0">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-white">Profile Readiness</span>
              <span className="font-bold text-indigo-300 tabular-nums">{profileCompletion}%</span>
            </div>
            <div className="w-full bg-black/30 rounded-full h-2 overflow-hidden mb-3">
              <div 
                className="bg-gradient-to-r from-blue-400 to-emerald-400 h-2 rounded-full transition-all duration-700"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            <button
              onClick={() => onNavigate('student-profile')}
              className="w-full py-1.5 text-center bg-white text-indigo-950 font-bold text-xs rounded-lg hover:bg-slate-100 transition-colors shadow-sm"
            >
              Complete Profile Details
            </button>
          </div>
        </div>
      </div>

      {/* KPI METRIC CARDS - Real data from state */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => onNavigate('student-applications')}
          className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-indigo-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Applied</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums mt-2">
            {myApplications.length}
          </p>
          <span className="text-[11px] text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mt-1 block">
            View application tracker →
          </span>
        </div>

        <div 
          onClick={() => onNavigate('student-applications')}
          className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-blue-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Shortlisted</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums mt-2">
            {shortlistedCount}
          </p>
          <span className="text-[11px] text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mt-1 block">
            Passing initial screen →
          </span>
        </div>

        <div 
          onClick={() => onNavigate('student-applications')}
          className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-violet-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Interviews</span>
            <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums mt-2">
            {interviewCount}
          </p>
          <span className="text-[11px] text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors mt-1 block">
            Upcoming rounds scheduled →
          </span>
        </div>

        <div 
          onClick={() => onNavigate('student-applications')}
          className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-emerald-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Offers</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums mt-2">
            {offerCount}
          </p>
          <span className="text-[11px] text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mt-1 block">
            Offer letters received →
          </span>
        </div>
      </div>

      {/* TWO-COLUMN WORKSPACE: Recommended Internships & Interview/Goals Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (8 cols): Recommended Internships & Activity */}
        <div className="lg:col-span-8 space-y-8">

          {/* Search & Filter Internship Explorer Widget */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Search className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Search & Filter Internship Opportunities</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Browse verified listings filtered by domain category, premier company, or desired location.
                </p>
              </div>

              <button
                onClick={() => onNavigate('explore')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 self-start sm:self-auto shrink-0"
              >
                <span>Full Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Keyword Search Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                onNavigate('explore', { query: quickSearchQuery });
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={quickSearchQuery}
                  onChange={(e) => setQuickSearchQuery(e.target.value)}
                  placeholder="Search by role title, skill (e.g. React, Python), keyword..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 shrink-0"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </form>

            {/* Filter by Categories */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Filter className="w-3 h-3 text-indigo-500" />
                <span>Filter by Category:</span>
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { label: 'All Roles', cat: 'All' },
                  { label: 'Engineering', cat: 'Engineering' },
                  { label: 'Data Science & AI', cat: 'Data Science' },
                  { label: 'UI/UX Design', cat: 'Design' },
                  { label: 'Cloud & DevOps', cat: 'DevOps' },
                  { label: 'Product Management', cat: 'Product' }
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={() => onNavigate('explore', { category: item.cat })}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-50 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter by Top Companies & Prime Locations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
              {/* Companies */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-blue-500" />
                  <span>By Company:</span>
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {['Persistent Systems', 'Tata Consultancy Services (TCS)', 'Infosys', 'Tech Mahindra', 'Wipro'].map(comp => (
                    <button
                      key={comp}
                      onClick={() => onNavigate('explore', { company: comp })}
                      className="px-2 py-0.5 rounded text-[11px] bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors"
                    >
                      {comp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Locations */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-500" />
                  <span>By Location:</span>
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {['Pune, Maharashtra', 'Mumbai, Maharashtra', 'Bengaluru, Karnataka', 'Hyderabad, Telangana', 'Remote'].map(loc => (
                    <button
                      key={loc}
                      onClick={() => onNavigate('explore', { location: loc })}
                      className="px-2 py-0.5 rounded text-[11px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Recommended Internships */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>AI Recommended For Your Skillset</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Matched against your skills ({studentProfile.skills.slice(0, 4).join(', ')}...)
                </p>
              </div>
              <button
                onClick={() => onNavigate('explore')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Browse all
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {recommendedInternships.map(({ internship, matchPct }) => (
                <div
                  key={internship.id}
                  onClick={() => onSelectInternship(internship)}
                  className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-700/30 p-2 rounded-lg transition-colors group"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {internship.companyName}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                      {internship.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{internship.stipend}</span>
                      <span>·</span>
                      <span>{internship.type}</span>
                      <span>·</span>
                      <span>{internship.location}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded">
                      {matchPct}% Match
                    </span>
                    <span className="block text-[11px] text-indigo-600 dark:text-indigo-400 mt-1 font-semibold group-hover:underline">
                      Apply →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick AI Tools Showcase Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div 
              onClick={() => onNavigate('ai-tools', { tab: 'resume' })}
              className="bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all group"
            >
              <h3 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center justify-between">
                <span>Resume ATS Analyzer</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </h3>
              <p className="text-[11px] text-indigo-700 dark:text-indigo-300 mt-1">
                Scan your resume against technical keywords and receive ATS suggestions.
              </p>
            </div>

            <div 
              onClick={() => onNavigate('ai-tools', { tab: 'roadmap' })}
              className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all group"
            >
              <h3 className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center justify-between">
                <span>Skill Gap Roadmap</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </h3>
              <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-1">
                Generate tailored multi-week learning roadmaps for target software roles.
              </p>
            </div>

            <div 
              onClick={() => onNavigate('ai-tools', { tab: 'interview' })}
              className="bg-violet-50/70 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/60 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all group"
            >
              <h3 className="text-xs font-bold text-violet-900 dark:text-violet-200 flex items-center justify-between">
                <span>Mock Interview Prep</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </h3>
              <p className="text-[11px] text-violet-700 dark:text-violet-300 mt-1">
                Practice role-specific technical questions and receive instant AI feedback.
              </p>
            </div>
          </div>

          {/* Bookmarked / Saved Internships */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-indigo-600" />
                <span>Saved Internships ({savedList.length})</span>
              </h2>
              <button
                onClick={() => onNavigate('explore')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Find more
              </button>
            </div>

            {savedList.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                You haven't bookmarked any internships yet. Click the bookmark icon on any card to save it here.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedList.map(internship => (
                  <div
                    key={internship.id}
                    onClick={() => onSelectInternship(internship)}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition-colors cursor-pointer flex justify-between items-center"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {internship.title}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {internship.companyName} · {internship.stipend}
                      </p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column (4 cols): Upcoming Interviews & Weekly Career Goals */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Upcoming Interviews Card */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-violet-600" />
              <span>Upcoming Interview</span>
            </h2>

            {upcomingInterviews.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500 space-y-1">
                <Clock className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <p>No interviews scheduled yet.</p>
                <p className="text-[11px]">Keep applying to verified opportunities!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingInterviews.map(({ application, details }) => {
                  const mId = details.meetingId || 'meet-ns-sujata-sakshi';
                  return (
                    <div 
                      key={application.id}
                      className="p-4 rounded-xl bg-violet-50/70 dark:bg-violet-950/40 border border-violet-200/80 dark:border-violet-800/60 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {application.internshipTitle || 'Software Development Intern'}
                          </p>
                          <p className="text-[11px] text-violet-700 dark:text-violet-300 font-medium">
                            Recruiter: {details.recruiterName || 'Sakshi Maddewad'}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold bg-violet-600 text-white px-2 py-0.5 rounded shrink-0">
                          {details.time || '11:00 AM'}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between">
                        <span>Date: <strong>28 October 2026</strong></span>
                        <span className="text-[10px] text-slate-500 font-mono">ID: {mId}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onNavigate('meeting', { meetingId: mId })}
                        className="w-full py-2.5 px-3 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-violet-600/30 cursor-pointer"
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

          {/* Weekly Career Goals Checklist */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-600" />
              <span>Weekly Career Goals</span>
            </h2>

            <div className="space-y-2">
              {studentProfile.weeklyGoals?.map(goal => (
                <div
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className="flex items-start gap-2.5 p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700/40 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={goal.completed}
                    onChange={() => {}}
                    className="mt-0.5 accent-indigo-600 rounded cursor-pointer"
                  />
                  <span className={`text-xs ${goal.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                    {goal.text}
                  </span>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddGoal} className="pt-2 flex gap-2">
              <input
                type="text"
                value={newGoalText}
                onChange={e => setNewGoalText(e.target.value)}
                placeholder="Add new weekly milestone..."
                className="flex-1 px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none"
              />
              <button
                type="submit"
                className="p-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
                title="Add Goal"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};
