import React from 'react';
import { Sparkles, ShieldCheck, Heart, Award, Code, GraduationCap, CheckCircle } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Title */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
          About the Project
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          NextStep — Smart Internship & Career Management Portal
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          A production-grade, full-stack career platform designed to solve real challenges in internship recruitment, ATS opacity, and university talent acquisition.
        </p>
      </div>

      {/* Developer Credit Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-semibold">
            <Award className="w-3.5 h-3.5 text-indigo-300" />
            <span>Smart Career Management Platform</span>
          </div>
          <h2 className="text-2xl font-bold">
            Developed by Sujata Maddewad
          </h2>
          <p className="text-xs sm:text-sm text-indigo-200 max-w-xl leading-relaxed">
            Architected and engineered by Sujata Maddewad combining modern React & TypeScript, MongoDB document storage, server-side Gemini AI intelligence, role-based access governance, and real-time recruitment pipeline tracking.
          </p>
        </div>

        <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-indigo-400/40 shadow-lg shrink-0 flex items-center justify-center bg-indigo-800 text-white font-extrabold text-2xl">
          <span>SM</span>
        </div>
      </div>

      {/* Core Architectural Pillars */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white text-center">
          Engineering Architecture & Highlights
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Code className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Full-Stack & Resilient Backend
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Express server runtime with Vite middleware, typed schemas, and persistent dual-mode architecture that operates seamlessly across sessions.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Gemini 3.8 AI Intelligence
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Real server-side LLM calls via @google/genai for structured ATS resume critiquing, skill gap learning roadmaps, mock interview evaluations, and personalized cover letters.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-lg bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Role-Based Governance (RBAC)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Strict multi-tier segregation between Students, Employers, and Platform Administrators, including recruiter verification and audit logging.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
