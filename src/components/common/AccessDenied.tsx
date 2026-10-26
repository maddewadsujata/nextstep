import React from 'react';
import { ShieldAlert, ArrowLeft, LogIn, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AccessDeniedProps {
  requiredRole: 'student' | 'recruiter' | 'admin';
  attemptedPage: string;
  onNavigate: (page: string) => void;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({ requiredRole, attemptedPage, onNavigate }) => {
  const { currentUser, isAuthenticated } = useAuth();

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center shadow-lg border border-rose-200 dark:border-rose-900">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
          <Lock className="w-3.5 h-3.5" />
          <span>HTTP 403 • Forbidden Access</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Role-Based Access Control Gate
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
          The requested page <code className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">{attemptedPage}</code> is strictly restricted to authenticated <strong>{requiredRole.toUpperCase()}</strong> accounts.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-left max-w-md mx-auto space-y-2">
        <div className="flex justify-between items-center text-slate-500">
          <span>Your Authenticated Status:</span>
          <span className="font-semibold text-slate-900 dark:text-white">
            {isAuthenticated ? 'Authenticated' : 'Anonymous / Not signed in'}
          </span>
        </div>
        {isAuthenticated && currentUser && (
          <>
            <div className="flex justify-between items-center text-slate-500">
              <span>Account Name:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{currentUser.name}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span>Your Current Role:</span>
              <span className="font-mono uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">
                {currentUser.role}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span>Required Role:</span>
              <span className="font-mono uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold">
                {requiredRole}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        {isAuthenticated && currentUser ? (
          <button
            onClick={() => {
              if (currentUser.role === 'student') onNavigate('student-dashboard');
              else if (currentUser.role === 'recruiter') onNavigate('recruiter-dashboard');
              else if (currentUser.role === 'admin') onNavigate('admin-dashboard');
              else onNavigate('landing');
            }}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Your {currentUser.role.toUpperCase()} Dashboard</span>
          </button>
        ) : (
          <button
            onClick={() => onNavigate('signin')}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Access Dashboard</span>
          </button>
        )}

        <button
          onClick={() => onNavigate('landing')}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
};
