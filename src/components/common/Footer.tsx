import React from 'react';
import { Heart, Sparkles, Shield, Compass } from 'lucide-react';

export const Footer: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                N
              </span>
              <span className="text-lg font-bold text-white tracking-tight">NextStep</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Smart Internship & Career Management Portal connecting ambitious students with forward-thinking recruiters and transparent career intelligence.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-2.5 py-1 rounded-md">
                <Sparkles className="w-3 h-3" />
                <span>AI-Powered Career Matching</span>
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              For Students
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('explore')} className="hover:text-white transition-colors">
                  Discover Internships
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('ai-tools')} className="hover:text-white transition-colors">
                  AI Resume Analyzer
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('ai-tools')} className="hover:text-white transition-colors">
                  Skill Gap Roadmap
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('ai-tools')} className="hover:text-white transition-colors">
                  Interview Practice Simulator
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('student-applications')} className="hover:text-white transition-colors">
                  Application Tracker
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              For Employers
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('recruiter-internships')} className="hover:text-white transition-colors">
                  Post an Internship
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('recruiter-pipeline')} className="hover:text-white transition-colors">
                  Candidate Pipeline Kanban
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('recruiter-pipeline')} className="hover:text-white transition-colors">
                  Schedule Interviews
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('recruiter-dashboard')} className="hover:text-white transition-colors">
                  Employer Verification
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('recruiter-pipeline')} className="hover:text-white transition-colors">
                  Export Applicant Records (CSV)
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Platform & Credits
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">
                  About NextStep
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">
                  Help & Contact Center
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin-dashboard')} className="hover:text-white transition-colors">
                  Administrative Portal
                </button>
              </li>
              <li className="pt-2 text-slate-400">
                <span className="text-slate-300 font-medium">Developed by Sujata Maddewad</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-slate-500">
            © 2026 NextStep — Smart Internship & Career Management Portal. Developed by <span className="text-slate-300 font-semibold">Sujata Maddewad</span>.
          </p>

          <div className="flex items-center gap-6 text-slate-500">
            <span>Enterprise Security & ABAC</span>
            <span>·</span>
            <span>Gemini AI Engine</span>
            <span>·</span>
            <span className="flex items-center gap-1 text-indigo-400">
              Crafted with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> by Sujata Maddewad
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
