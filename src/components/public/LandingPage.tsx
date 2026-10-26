import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  GraduationCap, 
  ShieldCheck, 
  TrendingUp, 
  Database, 
  FileText, 
  Briefcase, 
  UserCheck, 
  Layers, 
  Code2, 
  Users, 
  Compass, 
  BarChart3, 
  Clock, 
  ExternalLink 
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Internship } from '../../types';

interface LandingPageProps {
  onNavigate: (page: string, params?: { query?: string; internshipId?: string }) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onSelectInternship: (internship: Internship) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onOpenAuth, onSelectInternship }) => {
  const { internships } = useData();
  const { isAuthenticated, currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const featuredInternships = internships.filter(i => i.status === 'published').slice(0, 3);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('explore', { query: searchQuery });
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      if (currentUser?.role === 'student') onNavigate('student-dashboard');
      else if (currentUser?.role === 'recruiter') onNavigate('recruiter-dashboard');
      else if (currentUser?.role === 'admin') onNavigate('admin-dashboard');
      else onNavigate('student-dashboard');
    } else {
      onNavigate('register');
    }
  };

  return (
    <div className="space-y-20 pb-20 overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/80 via-white to-slate-50 dark:from-slate-900/90 dark:via-slate-900 dark:to-slate-950 pt-14 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Heading, Description, CTA Buttons */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-100/70 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 rounded-full text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>NextStep • Smart Internship & Career Management Portal</span>
              </div>

              {/* Exact heading requested */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1] text-balance">
                Your Next Step <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600">Starts Here</span>
              </h1>

              {/* Short description requested */}
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                NextStep is a professional full-stack platform built with <strong>React.js</strong>, <strong>Node.js</strong>, and <strong>MongoDB</strong>. It connects college students, recruiting companies, and academic administrators in one streamlined workspace with intelligent ATS resume analysis, verified internships, and transparent interview pipelines.
              </p>

              {/* Action Buttons: Get Started, Sign In, and Create Account */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleGetStarted}
                  className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {!isAuthenticated ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onNavigate('signin')}
                      className="px-5 py-3.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm rounded-xl transition-colors border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer"
                    >
                      Sign In
                    </button>

                    <button
                      type="button"
                      onClick={() => onNavigate('register')}
                      className="px-5 py-3.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-semibold text-sm rounded-xl transition-colors shadow-sm cursor-pointer"
                    >
                      Create Account
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (currentUser?.role === 'student') onNavigate('student-dashboard');
                      else if (currentUser?.role === 'recruiter') onNavigate('recruiter-dashboard');
                      else if (currentUser?.role === 'admin') onNavigate('admin-dashboard');
                    }}
                    className="px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm cursor-pointer"
                  >
                    Go to {currentUser?.role.toUpperCase()} Dashboard →
                  </button>
                )}
              </div>

              {/* Search Bar Preview */}
              <form onSubmit={handleSearchSubmit} className="pt-2">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-1.5 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 max-w-xl">
                  <div className="flex items-center gap-2.5 px-3 flex-1">
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search roles or skills (e.g. React, Python, MongoDB)..."
                      className="w-full text-xs sm:text-sm bg-transparent border-none focus:outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400"
                    />
                  </div>
                  <button
                    type="submit"
                    className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shadow-sm cursor-pointer"
                  >
                    <span>Search</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              {/* Key Platform Highlights */}
              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-200 dark:border-slate-800 text-left">
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">100%</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Verified Companies</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">₹18,500</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Avg. Monthly Stipend</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Full-Stack</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">React + Node + MongoDB</p>
                </div>
              </div>

            </div>

            {/* Right Column: Hero Visual Asset */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-700">
                <img
                  src="/src/assets/images/hero_internship_portal_1792343173613.jpg"
                  alt="Students and tech mentors on NextStep"
                  className="w-full h-auto object-cover max-h-[460px]"
                />
                
                {/* Floating Badge */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-lg flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">MongoDB Persistence</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Mongoose ODM + Bcrypt Security</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold text-[10px]">
                    Live Ready
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. THREE DEDICATED ROLE CARDS (STUDENT, RECRUITER, ADMIN) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-full text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            <Users className="w-3.5 h-3.5" />
            <span>Tailored Role Workspaces</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Designed for Every Stakeholder in Campus Hiring
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            NextStep provides three completely segregated, protected dashboards tailored with distinct tools, metrics, and workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* CARD 1: STUDENTS */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                For College Students
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Discover verified tech internships matching your degree and skills. Get instant Gemini ATS resume feedback and track every application status in real time.
              </p>
              
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Personalized dashboard (Welcome back, Sujata Maddewad!)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Discover & filter high-stipend opportunities</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Multi-stage application pipeline tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>AI resume analyzer & skill gap roadmap</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
              <button
                type="button"
                onClick={() => onNavigate('student-dashboard')}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>Explore Student Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* CARD 2: RECRUITERS */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                For Recruiters & Employers
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Publish verified internship listings, manage candidate pipelines, schedule technical rounds, and extend job offers with zero recruiting friction.
              </p>
              
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Dedicated Recruiter Overview (Welcome back, Sakshi Maddewad!)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Post new internships & manage active listings</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Review applicants & shortlist/reject candidates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Company branding & verification profile</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
              <button
                type="button"
                onClick={() => onNavigate('recruiter-dashboard')}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>Explore Recruiter Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* CARD 3: ADMINISTRATORS */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                For Administrators
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Supervise college campus operations, verify employer legitimacy, review reported content, audit security logs, and monitor platform analytics.
              </p>
              
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Administrative governance (Welcome back, Mayank Maddewad!)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Manage Students & Recruiters account statuses</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Verify employer companies & moderate listings</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Role-protected backend security checks</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
              <button
                type="button"
                onClick={() => onNavigate('admin-dashboard')}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>Explore Admin Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 3. PLATFORM CORE FEATURES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-4 mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-indigo-300 border border-white/10">
              <Layers className="w-3.5 h-3.5" />
              <span>Core Technological Pillars</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Why NextStep Outperforms Traditional Search Methods
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Built specifically to solve the fragmentation students face between discovery, resume tailoring, and interview status tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-white">MongoDB NoSQL</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Mongoose document persistence with strict schema validation, unique ObjectIds, and bcrypt password encryption.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-white">AI Career Intel</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Powered by Gemini AI for instant ATS resume scoring, missing competency gap detection, and personalized study roadmaps.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-white">Real-Time Pipeline</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Transparent 8-stage application lifecycle: applied, shortlisted, interview scheduled, offer received, and accepted.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-white">RBAC Security</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Role-Based Access Control enforced on both the React frontend and Node.js backend routes with bearer token verification.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. FEATURED OPPORTUNITIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Featured Internship Openings
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Top technology companies currently reviewing student applications on NextStep.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('explore')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1"
          >
            <span>View All Internships</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredInternships.map(internship => (
            <div
              key={internship.id}
              onClick={() => onSelectInternship(internship)}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-500/50 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                    {internship.type}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {internship.stipend}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1">
                    {internship.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {internship.companyName} • {internship.location}
                  </p>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {internship.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {internship.requiredSkills.slice(0, 3).map(skill => (
                    <span key={skill} className="px-2 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                      {skill}
                    </span>
                  ))}
                  {internship.requiredSkills.length > 3 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-400">
                      +{internship.requiredSkills.length - 3}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between text-xs text-slate-500">
                <span>{internship.openings} opening{internship.openings > 1 ? 's' : ''}</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  Apply Now <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
