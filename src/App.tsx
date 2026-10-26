import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import { DemoRoleBar } from './components/common/DemoRoleBar';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { AuthModal } from './components/public/AuthModal';
import { LandingPage } from './components/public/LandingPage';
import { SignInPage } from './components/public/SignInPage';
import { RegisterPage } from './components/public/RegisterPage';
import { InternshipDiscovery } from './components/public/InternshipDiscovery';
import { InternshipDetailModal } from './components/public/InternshipDetailModal';
import { ReportModal } from './components/common/ReportModal';
import { AboutPage } from './components/public/AboutPage';
import { ContactPage } from './components/public/ContactPage';
import { StudentDashboard } from './components/student/StudentDashboard';
import { StudentApplications } from './components/student/StudentApplications';
import { StudentProfileView } from './components/student/StudentProfileView';
import { AICareerIntelligence } from './components/student/AICareerIntelligence';
import { RecruiterDashboard } from './components/recruiter/RecruiterDashboard';
import { ManageInternships } from './components/recruiter/ManageInternships';
import { ApplicantPipeline } from './components/recruiter/ApplicantPipeline';
import { CompanyProfileEdit } from './components/recruiter/CompanyProfileEdit';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AISupportChatModal } from './components/common/AISupportChatModal';
import { InterviewMeetingRoom } from './components/meeting/InterviewMeetingRoom';
import { AccessDenied } from './components/common/AccessDenied';
import { Internship } from './types';

const MainApp: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();

  // Meeting ID state extracted from URL or route params
  const [currentMeetingId, setCurrentMeetingId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const pathMatch = window.location.pathname.match(/\/meeting\/([a-zA-Z0-9_-]+)/);
      if (pathMatch) return pathMatch[1];
      const hashMatch = window.location.hash.match(/meeting\/([a-zA-Z0-9_-]+)/);
      if (hashMatch) return hashMatch[1];
    }
    return 'meet-ns-sujata-sakshi';
  });

  // Page routing
  const [currentPage, setCurrentPage] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname.includes('/meeting/') || window.location.hash.includes('meeting')) {
        return 'meeting';
      }
    }
    if (currentUser?.role === 'student') return 'student-dashboard';
    if (currentUser?.role === 'recruiter') return 'recruiter-dashboard';
    if (currentUser?.role === 'admin') return 'admin-dashboard';
    return 'landing';
  });

  // Modal states
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [reportInternship, setReportInternship] = useState<Internship | null>(null);

  // Navigation router with parameter passing
  const [initialSearchQuery, setInitialSearchQuery] = useState('');
  const [initialCategory, setInitialCategory] = useState('All');
  const [initialCompany, setInitialCompany] = useState('All');
  const [initialLocation, setInitialLocation] = useState('All');
  const [initialAiTab, setInitialAiTab] = useState<'resume' | 'roadmap' | 'interview' | 'chat'>('resume');

  // Handle browser back/forward or direct link access
  useEffect(() => {
    const handleLocationChange = () => {
      const pathMatch = window.location.pathname.match(/\/meeting\/([a-zA-Z0-9_-]+)/);
      const hashMatch = window.location.hash.match(/meeting\/([a-zA-Z0-9_-]+)/);
      const mId = pathMatch ? pathMatch[1] : (hashMatch ? hashMatch[1] : null);
      if (mId) {
        setCurrentMeetingId(mId);
        setCurrentPage('meeting');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = (page: string, params?: any) => {
    if (params?.query !== undefined) {
      setInitialSearchQuery(params.query);
    }
    if (params?.category !== undefined) {
      setInitialCategory(params.category);
    }
    if (params?.company !== undefined) {
      setInitialCompany(params.company);
    }
    if (params?.location !== undefined) {
      setInitialLocation(params.location);
    }
    if (params?.tab) {
      setInitialAiTab(params.tab);
    }

    if (page === 'meeting') {
      const mId = params?.meetingId || currentMeetingId || 'meet-ns-sujata-sakshi';
      setCurrentMeetingId(mId);
      if (window.location.pathname !== `/meeting/${mId}`) {
        window.history.pushState(null, '', `/meeting/${mId}`);
      }
    } else if (currentPage === 'meeting') {
      window.history.pushState(null, '', '/');
    }

    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    if (mode === 'login') {
      navigateTo('signin');
    } else {
      navigateTo('register');
    }
  };

  const handlePostAuthRedirect = () => {
    if (currentUser?.role === 'student') navigateTo('student-dashboard');
    else if (currentUser?.role === 'recruiter') navigateTo('recruiter-dashboard');
    else if (currentUser?.role === 'admin') navigateTo('admin-dashboard');
    else navigateTo('student-dashboard');
  };

  const renderCurrentView = () => {
    switch (currentPage) {
      // PUBLIC HOME & AUTH PAGES
      case 'landing':
        return (
          <LandingPage
            onNavigate={navigateTo}
            onOpenAuth={handleOpenAuth}
            onSelectInternship={setSelectedInternship}
          />
        );

      case 'signin':
        return (
          <SignInPage
            onNavigate={navigateTo}
            onLoginSuccess={handlePostAuthRedirect}
          />
        );

      case 'register':
        return (
          <RegisterPage
            onNavigate={navigateTo}
            onRegisterSuccess={handlePostAuthRedirect}
          />
        );

      case 'explore':
        return (
          <InternshipDiscovery
            initialQuery={initialSearchQuery}
            initialCategory={initialCategory}
            initialCompany={initialCompany}
            initialLocation={initialLocation}
            onSelectInternship={setSelectedInternship}
            onOpenReportModal={setReportInternship}
          />
        );

      case 'about':
        return <AboutPage />;

      case 'contact':
        return <ContactPage />;

      // STUDENT PAGES (Protected: Requires Authenticated Student or Admin)
      case 'student-dashboard':
        if (!isAuthenticated) return <SignInPage onNavigate={navigateTo} onLoginSuccess={handlePostAuthRedirect} />;
        return (
          <StudentDashboard
            onNavigate={navigateTo}
            onSelectInternship={setSelectedInternship}
          />
        );

      case 'student-applications':
        if (!isAuthenticated) return <SignInPage onNavigate={navigateTo} onLoginSuccess={handlePostAuthRedirect} />;
        return <StudentApplications onNavigate={navigateTo} />;

      case 'student-profile':
        if (!isAuthenticated) return <SignInPage onNavigate={navigateTo} onLoginSuccess={handlePostAuthRedirect} />;
        return <StudentProfileView />;

      case 'ai-tools':
        return <AICareerIntelligence initialTab={initialAiTab} />;

      // RECRUITER PAGES (Protected: Requires Authenticated Recruiter or Admin)
      case 'recruiter-dashboard':
        if (!isAuthenticated) return <SignInPage onNavigate={navigateTo} onLoginSuccess={handlePostAuthRedirect} />;
        if (currentUser?.role !== 'recruiter' && currentUser?.role !== 'admin') {
          return <AccessDenied requiredRole="recruiter" attemptedPage="Recruiter Dashboard" onNavigate={navigateTo} />;
        }
        return (
          <RecruiterDashboard
            onNavigate={navigateTo}
            onOpenCreateModal={() => navigateTo('recruiter-internships')}
          />
        );

      case 'recruiter-internships':
        if (!isAuthenticated) return <SignInPage onNavigate={navigateTo} onLoginSuccess={handlePostAuthRedirect} />;
        if (currentUser?.role !== 'recruiter' && currentUser?.role !== 'admin') {
          return <AccessDenied requiredRole="recruiter" attemptedPage="Manage Internships" onNavigate={navigateTo} />;
        }
        return <ManageInternships />;

      case 'recruiter-pipeline':
        if (!isAuthenticated) return <SignInPage onNavigate={navigateTo} onLoginSuccess={handlePostAuthRedirect} />;
        if (currentUser?.role !== 'recruiter' && currentUser?.role !== 'admin') {
          return <AccessDenied requiredRole="recruiter" attemptedPage="Applicant Pipeline" onNavigate={navigateTo} />;
        }
        return <ApplicantPipeline />;

      case 'recruiter-company':
        if (!isAuthenticated) return <SignInPage onNavigate={navigateTo} onLoginSuccess={handlePostAuthRedirect} />;
        if (currentUser?.role !== 'recruiter' && currentUser?.role !== 'admin') {
          return <AccessDenied requiredRole="recruiter" attemptedPage="Company Profile" onNavigate={navigateTo} />;
        }
        return <CompanyProfileEdit />;

      // ADMIN PAGES (Strictly Protected: Admin Role Only!)
      case 'admin-dashboard':
      case 'admin-users':
      case 'admin-internships':
      case 'admin-audit':
        if (!isAuthenticated) return <SignInPage onNavigate={navigateTo} onLoginSuccess={handlePostAuthRedirect} />;
        if (currentUser?.role !== 'admin') {
          return <AccessDenied requiredRole="admin" attemptedPage="Admin Dashboard" onNavigate={navigateTo} />;
        }
        return <AdminDashboard onNavigate={navigateTo} />;

      case 'meeting':
        return (
          <InterviewMeetingRoom
            meetingId={currentMeetingId}
            onLeave={() => {
              if (currentUser?.role === 'recruiter') navigateTo('recruiter-dashboard');
              else if (currentUser?.role === 'student') navigateTo('student-dashboard');
              else if (currentUser?.role === 'admin') navigateTo('admin-dashboard');
              else navigateTo('landing');
            }}
          />
        );

      case 'mongodb-demo':
        if (currentUser?.role === 'student') return <StudentDashboard onNavigate={navigateTo} onSelectInternship={setSelectedInternship} />;
        if (currentUser?.role === 'recruiter') return <RecruiterDashboard onNavigate={navigateTo} onOpenCreateModal={() => navigateTo('recruiter-internships')} />;
        if (currentUser?.role === 'admin') return <AdminDashboard onNavigate={navigateTo} />;
        return <LandingPage onNavigate={navigateTo} onOpenAuth={handleOpenAuth} onSelectInternship={setSelectedInternship} />;

      default:
        return (
          <LandingPage
            onNavigate={navigateTo}
            onOpenAuth={handleOpenAuth}
            onSelectInternship={setSelectedInternship}
          />
        );
    }
  };

  // Full-screen dedicated interface for real online interview meetings
  if (currentPage === 'meeting') {
    return (
      <InterviewMeetingRoom
        meetingId={currentMeetingId}
        onLeave={() => {
          if (currentUser?.role === 'recruiter') navigateTo('recruiter-dashboard');
          else if (currentUser?.role === 'student') navigateTo('student-dashboard');
          else if (currentUser?.role === 'admin') navigateTo('admin-dashboard');
          else navigateTo('landing');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Interactive Persona / Demo Switcher Bar */}
      <DemoRoleBar onNavigate={navigateTo} currentPage={currentPage} />

      {/* Main Top Navigation */}
      <Navbar
        currentPage={currentPage}
        onNavigate={navigateTo}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {renderCurrentView()}
      </main>

      {/* Footer */}
      <Footer onNavigate={navigateTo} />

      {/* Global Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={handlePostAuthRedirect}
      />

      <InternshipDetailModal
        internship={selectedInternship}
        onClose={() => setSelectedInternship(null)}
        onOpenAuth={() => handleOpenAuth('login')}
        onOpenReportModal={(item) => {
          setSelectedInternship(null);
          setReportInternship(item);
        }}
      />

      <ReportModal
        internship={reportInternship}
        onClose={() => setReportInternship(null)}
      />

      {/* 24/7 AI Support Chatbot accessible across all portals */}
      <AISupportChatModal onNavigate={navigateTo} />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <MainApp />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
