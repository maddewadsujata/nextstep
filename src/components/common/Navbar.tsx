import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { NotificationDropdown } from './NotificationDropdown';
import { Sun, Moon, LogOut, User, Menu, X } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, onOpenAuth }) => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  // Nav links strictly following the 4-5 single-line 1-2 word contract
  const renderNavLinks = () => {
    if (!currentUser) {
      return (
        <>
          <button
            onClick={() => handleNavClick('explore')}
            className={`transition-colors whitespace-nowrap shrink-0 text-sm font-medium ${
              currentPage === 'explore' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Explore Internships
          </button>
          <button
            onClick={() => handleNavClick('about')}
            className={`transition-colors whitespace-nowrap shrink-0 text-sm font-medium ${
              currentPage === 'about' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            About
          </button>
          <button
            onClick={() => handleNavClick('contact')}
            className={`transition-colors whitespace-nowrap shrink-0 text-sm font-medium ${
              currentPage === 'contact' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Help & Support
          </button>
        </>
      );
    }

    if (currentUser.role === 'student') {
      return (
        <>
          <button
            onClick={() => handleNavClick('student-dashboard')}
            className={`transition-colors whitespace-nowrap shrink-0 text-sm font-medium ${
              currentPage === 'student-dashboard' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => handleNavClick('explore')}
            className={`transition-colors whitespace-nowrap shrink-0 text-sm font-medium ${
              currentPage === 'explore' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => handleNavClick('student-applications')}
            className={`transition-colors whitespace-nowrap shrink-0 text-sm font-medium ${
              currentPage === 'student-applications' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            My Applications
          </button>
          <button
            onClick={() => handleNavClick('ai-tools')}
            className={`transition-colors whitespace-nowrap shrink-0 text-sm font-medium ${
              currentPage === 'ai-tools' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            AI Career Suite
          </button>
          <button
            onClick={() => handleNavClick('student-profile')}
            className={`transition-colors whitespace-nowrap shrink-0 text-sm font-medium ${
              currentPage === 'student-profile' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Profile
          </button>
        </>
      );
    }

    if (currentUser.role === 'recruiter') {
      return (
        <>
          <button
            onClick={() => handleNavClick('recruiter-dashboard')}
            className={`transition-colors whitespace-nowrap shrink-0 text-sm font-medium ${
              currentPage === 'recruiter-dashboard' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => handleNavClick('recruiter-internships')}
            className={`transition-colors whitespace-nowrap shrink-0 text-sm font-medium ${
              currentPage === 'recruiter-internships' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Manage Internships
          </button>
          <button
            onClick={() => handleNavClick('recruiter-pipeline')}
            className={`transition-colors whitespace-nowrap shrink-0 text-sm font-medium ${
              currentPage === 'recruiter-pipeline' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Candidate Pipeline
          </button>
        </>
      );
    }

    if (currentUser.role === 'admin') {
      return (
        <>
          <button
            onClick={() => handleNavClick('admin-dashboard')}
            className={`transition-colors whitespace-nowrap shrink-0 text-sm font-medium ${
              currentPage === 'admin-dashboard' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => handleNavClick('admin-users')}
            className={`transition-colors whitespace-nowrap shrink-0 text-sm font-medium ${
              currentPage === 'admin-users' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => handleNavClick('admin-internships')}
            className={`transition-colors whitespace-nowrap shrink-0 text-sm font-medium ${
              currentPage === 'admin-internships' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Internships
          </button>
          <button
            onClick={() => handleNavClick('admin-audit')}
            className={`transition-colors whitespace-nowrap shrink-0 text-sm font-medium ${
              currentPage === 'admin-audit' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Audit Logs
          </button>
        </>
      );
    }

    return null;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => handleNavClick(currentUser ? (currentUser.role === 'student' ? 'student-dashboard' : currentUser.role === 'recruiter' ? 'recruiter-dashboard' : 'admin-dashboard') : 'landing')}
          className="text-xl font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 flex items-center gap-2 group text-left"
        >
          <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-base shadow-sm group-hover:bg-indigo-500 transition-colors">
            N
          </span>
          <span>NextStep</span>
        </button>

        {/* Zone 2: 4–5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7">
          {renderNavLinks()}
        </nav>

        {/* Zone 3: 1 primary action or user control group */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle color theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {isAuthenticated && currentUser ? (
            <div className="flex items-center gap-2">
              <NotificationDropdown onNavigate={handleNavClick} />

              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

              <button
                onClick={() => handleNavClick(currentUser.role === 'student' ? 'student-profile' : currentUser.role === 'recruiter' ? 'recruiter-dashboard' : 'admin-dashboard')}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                title="Account Settings"
              >
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-600 to-emerald-500 text-white font-bold text-[10px] flex items-center justify-center shadow-sm">
                    {currentUser.role === 'student' ? 'SM' : currentUser.role === 'recruiter' ? 'SM' : currentUser.role === 'admin' ? 'MM' : currentUser.name.charAt(0)}
                  </div>
                )}
                <div className="hidden lg:block">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap leading-tight">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                    {currentUser.role}
                  </p>
                </div>
              </button>

              <button
                onClick={() => {
                  logout();
                  onNavigate('landing');
                }}
                className="p-2 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Sign Out"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
              >
                Get Started
              </button>
            </div>
          )}

          {/* Mobile menu hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-2">
          {renderNavLinks()}
          {!isAuthenticated && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
              <button
                onClick={() => { onOpenAuth('login'); setMobileMenuOpen(false); }}
                className="w-1/2 py-2 text-xs font-medium text-center border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                Sign In
              </button>
              <button
                onClick={() => { onOpenAuth('register'); setMobileMenuOpen(false); }}
                className="w-1/2 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg text-center"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
