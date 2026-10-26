import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  LogIn, 
  Mail, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  GraduationCap, 
  Building2, 
  UserCheck,
  Eye,
  EyeOff
} from 'lucide-react';

interface SignInPageProps {
  onNavigate: (page: string) => void;
  onLoginSuccess?: () => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onNavigate, onLoginSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (forgotMode) {
      if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
        setError('Please enter a valid registered email address.');
        return;
      }
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setForgotSubmitted(true);
        setSuccessMsg(`A password reset link has been dispatched to ${email.trim()}.`);
      }, 700);
      return;
    }

    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }

    if (!password) {
      setError('Password is required.');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email.trim(), password);
      if (result.success) {
        setSuccessMsg(`Welcome back, ${result.user?.name || 'User'}! Redirecting to your dashboard...`);
        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess();
          } else {
            if (result.user?.role === 'student') onNavigate('student-dashboard');
            else if (result.user?.role === 'recruiter') onNavigate('recruiter-dashboard');
            else if (result.user?.role === 'admin') onNavigate('admin-dashboard');
            else onNavigate('student-dashboard');
          }
        }, 600);
      } else {
        setError(result.error || 'Invalid email or password. Please try again.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* NextStep Logo Header */}
        <div className="flex justify-center">
          <div 
            onClick={() => onNavigate('landing')}
            className="cursor-pointer inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-800/40"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-sm shadow-md">
              N
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Next<span className="text-indigo-600 dark:text-indigo-400">Step</span>
            </span>
          </div>
        </div>

        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {forgotMode ? 'Reset your password' : 'Sign in to your account'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          {forgotMode ? (
            <span>Remember your password?{' '}
              <button onClick={() => { setForgotMode(false); setError(null); }} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                Back to Sign In
              </button>
            </span>
          ) : (
            <span>
              Don't have an account yet?{' '}
              <button 
                onClick={() => onNavigate('register')} 
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Create an account
              </button>
            </span>
          )}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 shadow-xl rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
          
          {/* Error Message Alert */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 flex items-start gap-2.5 text-xs animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">{error}</p>
            </div>
          )}

          {/* Success Message Alert */}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-start gap-2.5 text-xs animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">{successMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@university.edu or company.com"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {!forgotMode && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { setForgotMode(true); setError(null); }}
                    className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="block w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>{forgotMode ? 'Send Recovery Instructions' : 'Sign In'}</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Box */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Instant Demo Access (1-Click Role Accounts):</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => fillQuickDemo('sujata@university.edu', 'student123')}
                className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300 hover:bg-sky-100 transition-colors text-center"
              >
                <GraduationCap className="w-3.5 h-3.5 mx-auto mb-1 text-sky-600 dark:text-sky-400" />
                <span className="font-semibold block truncate">Student</span>
                <span className="text-[9px] opacity-75 truncate block">Sujata Maddewad</span>
              </button>

              <button
                type="button"
                onClick={() => fillQuickDemo('sakshi@persistent.com', 'recruiter123')}
                className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300 hover:bg-indigo-100 transition-colors text-center"
              >
                <Building2 className="w-3.5 h-3.5 mx-auto mb-1 text-indigo-600 dark:text-indigo-400" />
                <span className="font-semibold block truncate">Recruiter</span>
                <span className="text-[9px] opacity-75 truncate block">Sakshi Maddewad</span>
              </button>

              <button
                type="button"
                onClick={() => fillQuickDemo('mayank.admin@nextstep.org', 'admin123')}
                className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300 hover:bg-purple-100 transition-colors text-center"
              >
                <ShieldCheck className="w-3.5 h-3.5 mx-auto mb-1 text-purple-600 dark:text-purple-400" />
                <span className="font-semibold block truncate">Admin</span>
                <span className="text-[9px] opacity-75 truncate block">Mayank Maddewad</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
