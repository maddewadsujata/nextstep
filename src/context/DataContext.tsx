import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Internship, 
  Application, 
  StudentProfile, 
  RecruiterProfile, 
  AppNotification, 
  ContentReport, 
  AuditLog, 
  ApplicationStatus,
  User,
  UserStatus
} from '../types';
import { 
  INITIAL_INTERNSHIPS, 
  INITIAL_APPLICATIONS, 
  INITIAL_STUDENT_PROFILE, 
  INITIAL_RECRUITER_PROFILE, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_REPORTS, 
  INITIAL_AUDIT_LOGS,
  INITIAL_USERS,
  SUJATA_STUDENT_ID,
  MARCUS_RECRUITER_ID
} from '../data/seedData';
import { useAuth } from './AuthContext';

interface DataContextType {
  internships: Internship[];
  applications: Application[];
  studentProfile: StudentProfile;
  recruiterProfile: RecruiterProfile;
  savedInternshipIds: string[];
  notifications: AppNotification[];
  reports: ContentReport[];
  auditLogs: AuditLog[];
  allUsers: User[];

  // Student actions
  applyToInternship: (internshipId: string, coverLetter?: string, answers?: Record<string, string>) => { success: boolean; message: string };
  withdrawApplication: (applicationId: string) => void;
  toggleSaveInternship: (internshipId: string) => void;
  isInternshipSaved: (internshipId: string) => boolean;
  updateStudentProfile: (updates: Partial<StudentProfile>) => void;
  toggleGoal: (goalId: string) => void;
  addGoal: (text: string) => void;

  // Recruiter actions
  createInternship: (data: Omit<Internship, 'id' | 'createdAt' | 'recruiterId' | 'status'>) => Internship;
  updateInternship: (id: string, updates: Partial<Internship>) => void;
  duplicateInternship: (id: string) => void;
  changeInternshipStatus: (id: string, status: Internship['status']) => void;
  updateApplicationStatus: (
    applicationId: string, 
    status: ApplicationStatus, 
    note?: string,
    interviewDetails?: Application['interviewDetails'],
    offerDetails?: Application['offerDetails']
  ) => void;
  addRecruiterNote: (applicationId: string, note: string) => void;
  updateRecruiterProfile: (updates: Partial<RecruiterProfile>) => void;

  // Admin actions
  verifyRecruiterStatus: (recruiterUserId: string, status: 'verified' | 'rejected') => void;
  moderateInternship: (internshipId: string, action: 'approve' | 'reject' | 'close') => void;
  resolveReport: (reportId: string, status: 'reviewed' | 'dismissed') => void;
  submitReport: (targetType: 'internship' | 'user', targetId: string, targetTitle: string, reason: string) => void;
  setUserStatus: (userId: string, status: UserStatus, reason: string) => void;
  deleteUser: (userId: string) => void;

  // Notification actions
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  
  // Reset
  resetToDemoSeed: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  // Load from localStorage or seeds
  const [internships, setInternships] = useState<Internship[]>(() => {
    const saved = localStorage.getItem('nextstep_internships');
    return saved ? JSON.parse(saved) : INITIAL_INTERNSHIPS;
  });

  const [applications, setApplications] = useState<Application[]>(() => {
    const saved = localStorage.getItem('nextstep_applications');
    return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
  });

  const [savedInternshipIds, setSavedInternshipIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('nextstep_saved_internships');
    return saved ? JSON.parse(saved) : ['int-001', 'int-003'];
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('nextstep_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [reports, setReports] = useState<ContentReport[]>(() => {
    const saved = localStorage.getItem('nextstep_reports');
    return saved ? JSON.parse(saved) : INITIAL_REPORTS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('nextstep_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('nextstep_all_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  // Current student profile
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(() => {
    const userId = currentUser?.id || SUJATA_STUDENT_ID;
    const customAvatar = typeof window !== 'undefined' ? localStorage.getItem('nextstep_sujata_avatar') : null;
    const saved = typeof window !== 'undefined' ? localStorage.getItem(`student_profile_${userId}`) : null;
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.fullName === 'Sujata' || parsed.userId === SUJATA_STUDENT_ID) {
        parsed.fullName = 'Sujata Maddewad';
      }
      if (customAvatar) parsed.avatarUrl = customAvatar;
      return parsed;
    }
    if (userId === SUJATA_STUDENT_ID) {
      return {
        ...INITIAL_STUDENT_PROFILE,
        avatarUrl: customAvatar || INITIAL_STUDENT_PROFILE.avatarUrl || '',
      };
    }
    return {
      ...INITIAL_STUDENT_PROFILE,
      userId,
      fullName: currentUser?.name || 'Student Candidate',
      email: currentUser?.email || 'student@nextstep.edu',
      projects: [],
      certifications: [],
      isDemo: false
    };
  });

  // Current recruiter profile
  const [recruiterProfile, setRecruiterProfile] = useState<RecruiterProfile>(() => {
    const userId = currentUser?.id || MARCUS_RECRUITER_ID;
    const saved = typeof window !== 'undefined' ? localStorage.getItem(`recruiter_profile_${userId}`) : null;
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.recruiterName === 'Marcus Vance' || parsed.recruiterName === 'Suchita Maddewad' || parsed.userId === MARCUS_RECRUITER_ID || parsed.companyName === 'InnovateTech Labs') {
        parsed.recruiterName = 'Sakshi Maddewad';
        parsed.workEmail = 'sakshi@persistent.com';
        parsed.companyName = 'Persistent Systems';
        parsed.location = 'Pune, Maharashtra (Hinjawadi Tech Park)';
      }
      return parsed;
    }
    if (userId === MARCUS_RECRUITER_ID) return INITIAL_RECRUITER_PROFILE;
    return {
      ...INITIAL_RECRUITER_PROFILE,
      userId,
      recruiterName: currentUser?.name || 'Sakshi Maddewad',
      workEmail: currentUser?.email || 'sakshi@persistent.com',
      companyName: 'Persistent Systems',
      verificationStatus: 'verified',
      isDemo: false
    };
  });

  // Sync profile when currentUser changes
  useEffect(() => {
    if (!currentUser) return;
    const customAvatar = localStorage.getItem('nextstep_sujata_avatar');
    if (currentUser.role === 'student') {
      const saved = localStorage.getItem(`student_profile_${currentUser.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.fullName === 'Sujata' || parsed.userId === SUJATA_STUDENT_ID) {
          parsed.fullName = 'Sujata Maddewad';
        }
        if (customAvatar) parsed.avatarUrl = customAvatar;
        setStudentProfile(parsed);
      } else if (currentUser.id === SUJATA_STUDENT_ID) {
        setStudentProfile({
          ...INITIAL_STUDENT_PROFILE,
          avatarUrl: customAvatar || INITIAL_STUDENT_PROFILE.avatarUrl || '',
        });
      } else {
        const fresh: StudentProfile = {
          ...INITIAL_STUDENT_PROFILE,
          userId: currentUser.id,
          fullName: currentUser.name,
          email: currentUser.email,
          projects: [],
          certifications: [],
          isDemo: false
        };
        setStudentProfile(fresh);
      }
    } else if (currentUser.role === 'recruiter') {
      const saved = localStorage.getItem(`recruiter_profile_${currentUser.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.recruiterName === 'Marcus Vance' || parsed.recruiterName === 'Suchita Maddewad' || parsed.userId === MARCUS_RECRUITER_ID) {
          parsed.recruiterName = 'Sakshi Maddewad';
        }
        setRecruiterProfile(parsed);
      } else if (currentUser.id === MARCUS_RECRUITER_ID) {
        setRecruiterProfile(INITIAL_RECRUITER_PROFILE);
      } else {
        const fresh: RecruiterProfile = {
          ...INITIAL_RECRUITER_PROFILE,
          userId: currentUser.id,
          recruiterName: currentUser.name,
          workEmail: currentUser.email,
          companyName: 'Partner Enterprise',
          verificationStatus: 'pending',
          isDemo: false
        };
        setRecruiterProfile(fresh);
      }
    }
  }, [currentUser]);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('nextstep_internships', JSON.stringify(internships));
  }, [internships]);

  useEffect(() => {
    localStorage.setItem('nextstep_applications', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('nextstep_saved_internships', JSON.stringify(savedInternshipIds));
  }, [savedInternshipIds]);

  useEffect(() => {
    localStorage.setItem('nextstep_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('nextstep_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('nextstep_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('nextstep_all_users', JSON.stringify(allUsers));
  }, [allUsers]);

  // STUDENT ACTIONS
  const applyToInternship = (internshipId: string, coverLetter?: string, answers?: Record<string, string>) => {
    if (!currentUser) return { success: false, message: 'Please log in to apply.' };
    
    // Check duplicate
    const existing = applications.find(a => a.internshipId === internshipId && a.studentId === currentUser.id);
    if (existing) {
      return { success: false, message: 'You have already submitted an application for this internship.' };
    }

    const internship = internships.find(i => i.id === internshipId);
    if (!internship) return { success: false, message: 'Internship listing not found.' };

    const newApp: Application = {
      id: `app-${Date.now()}`,
      internshipId,
      internshipTitle: internship.title,
      companyName: internship.companyName,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentEmail: currentUser.email,
      studentAvatar: studentProfile.avatarUrl,
      appliedAt: new Date().toISOString(),
      status: 'applied',
      resumeSnapshot: studentProfile.resumeName || 'Default_Resume.pdf',
      coverLetter: coverLetter || `Dear ${internship.companyName} Team,\n\nI am eager to apply for the ${internship.title} position.`,
      answers: answers || {},
      history: [
        { status: 'applied', timestamp: new Date().toISOString(), note: 'Application submitted by candidate.' }
      ]
    };

    setApplications(prev => [newApp, ...prev]);

    // Send notification to recruiter
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: internship.recruiterId,
      title: 'New Applicant Received',
      message: `${currentUser.name} applied for "${internship.title}".`,
      type: 'info',
      read: false,
      createdAt: new Date().toISOString(),
      link: '/recruiter/applicants'
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Confirm notification to student
    const studentNotif: AppNotification = {
      id: `notif-${Date.now() + 1}`,
      userId: currentUser.id,
      title: 'Application Submitted!',
      message: `Your application for "${internship.title}" at ${internship.companyName} was successfully received.`,
      type: 'success',
      read: false,
      createdAt: new Date().toISOString(),
      link: '/student/applications'
    };
    setNotifications(prev => [studentNotif, ...prev]);

    return { success: true, message: 'Application submitted successfully!' };
  };

  const withdrawApplication = (applicationId: string) => {
    let targetApp: Application | undefined;

    setApplications(prev => {
      const updated = prev.map(a => {
        if (a.id === applicationId) {
          targetApp = a;
          const historyEntry = { 
            status: 'withdrawn' as ApplicationStatus, 
            timestamp: new Date().toISOString(), 
            note: 'Application withdrawn by candidate.' 
          };
          return {
            ...a,
            status: 'withdrawn' as ApplicationStatus,
            history: [...a.history, historyEntry]
          };
        }
        return a;
      });

      // Immediate local persistence
      localStorage.setItem('nextstep_applications', JSON.stringify(updated));
      return updated;
    });

    // Create confirmation in-app notification
    const studentNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: currentUser?.id || 'user-sujata-001',
      title: 'Application Withdrawn',
      message: targetApp 
        ? `Your application for "${targetApp.internshipTitle}" at ${targetApp.companyName} was withdrawn successfully.` 
        : 'Application withdrawn successfully.',
      type: 'info',
      read: false,
      createdAt: new Date().toISOString(),
      link: '/student/applications'
    };
    setNotifications(prev => {
      const nextNotifs = [studentNotif, ...prev];
      localStorage.setItem('nextstep_notifications', JSON.stringify(nextNotifs));
      return nextNotifs;
    });

    // Synchronize status with backend REST API
    try {
      fetch(`/api/applications/${applicationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'withdrawn',
          note: 'Application withdrawn by candidate.'
        }),
      }).catch(err => console.warn('Offline application sync notice:', err));
    } catch {
      // Offline fallback
    }
  };

  const toggleSaveInternship = (internshipId: string) => {
    setSavedInternshipIds(prev => 
      prev.includes(internshipId) ? prev.filter(id => id !== internshipId) : [...prev, internshipId]
    );
  };

  const isInternshipSaved = (internshipId: string) => savedInternshipIds.includes(internshipId);

  const updateStudentProfile = (updates: Partial<StudentProfile>) => {
    const updated = { ...studentProfile, ...updates };
    setStudentProfile(updated);
    if (currentUser) {
      localStorage.setItem(`student_profile_${currentUser.id}`, JSON.stringify(updated));
    }
  };

  const toggleGoal = (goalId: string) => {
    if (!studentProfile.weeklyGoals) return;
    const nextGoals = studentProfile.weeklyGoals.map(g => g.id === goalId ? { ...g, completed: !g.completed } : g);
    updateStudentProfile({ weeklyGoals: nextGoals });
  };

  const addGoal = (text: string) => {
    const nextGoals = [...(studentProfile.weeklyGoals || []), { id: `goal-${Date.now()}`, text, completed: false }];
    updateStudentProfile({ weeklyGoals: nextGoals });
  };

  // RECRUITER ACTIONS
  const createInternship = (data: Omit<Internship, 'id' | 'createdAt' | 'recruiterId' | 'status'>) => {
    const newInternship: Internship = {
      ...data,
      id: `int-${Date.now()}`,
      recruiterId: currentUser?.id || MARCUS_RECRUITER_ID,
      createdAt: new Date().toISOString(),
      status: recruiterProfile.verificationStatus === 'verified' ? 'published' : 'pending_approval',
    };
    setInternships(prev => [newInternship, ...prev]);
    return newInternship;
  };

  const updateInternship = (id: string, updates: Partial<Internship>) => {
    setInternships(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const duplicateInternship = (id: string) => {
    const source = internships.find(i => i.id === id);
    if (!source) return;
    const duplicated: Internship = {
      ...source,
      id: `int-${Date.now()}`,
      title: `${source.title} (Copy)`,
      createdAt: new Date().toISOString(),
      status: 'draft',
    };
    setInternships(prev => [duplicated, ...prev]);
  };

  const changeInternshipStatus = (id: string, status: Internship['status']) => {
    setInternships(prev => prev.map(i => i.id === id ? { ...i, status } : i));
  };

  const updateApplicationStatus = (
    applicationId: string, 
    status: ApplicationStatus, 
    note?: string,
    interviewDetails?: Application['interviewDetails'],
    offerDetails?: Application['offerDetails']
  ) => {
    setApplications(prev => prev.map(a => {
      if (a.id === applicationId) {
        const historyItem = { status, timestamp: new Date().toISOString(), note };
        const updated: Application = {
          ...a,
          status,
          history: [...a.history, historyItem],
          interviewDetails: interviewDetails || a.interviewDetails,
          offerDetails: offerDetails || a.offerDetails,
        };

        // Notify student of status update
        let title = `Application Update: ${status.replace('_', ' ').toUpperCase()}`;
        let message = `Your application for "${a.internshipTitle}" at ${a.companyName} is now ${status.replace('_', ' ')}.`;
        let type: AppNotification['type'] = 'info';

        if (status === 'interview_scheduled') {
          title = 'Interview Scheduled!';
          message = `${a.companyName} scheduled an interview for "${a.internshipTitle}".`;
          type = 'interview';
        } else if (status === 'offer_received') {
          title = 'Congratulations! Offer Received';
          message = `${a.companyName} extended an internship offer for "${a.internshipTitle}"!`;
          type = 'offer';
        } else if (status === 'shortlisted') {
          title = 'Application Shortlisted';
          type = 'success';
        }

        const notif: AppNotification = {
          id: `notif-${Date.now()}`,
          userId: a.studentId,
          title,
          message,
          type,
          read: false,
          createdAt: new Date().toISOString(),
          link: '/student/applications'
        };
        setNotifications(n => [notif, ...n]);

        return updated;
      }
      return a;
    }));
  };

  const addRecruiterNote = (applicationId: string, note: string) => {
    setApplications(prev => prev.map(a => a.id === applicationId ? { ...a, recruiterNotes: note } : a));
  };

  const updateRecruiterProfile = (updates: Partial<RecruiterProfile>) => {
    const updated = { ...recruiterProfile, ...updates };
    setRecruiterProfile(updated);
    if (currentUser) {
      localStorage.setItem(`recruiter_profile_${currentUser.id}`, JSON.stringify(updated));
    }
  };

  // ADMIN ACTIONS
  const verifyRecruiterStatus = (recruiterUserId: string, status: 'verified' | 'rejected') => {
    const adminName = currentUser?.name || 'Administrator';
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      adminId: currentUser?.id || 'admin',
      adminName,
      action: status === 'verified' ? 'RECRUITER_VERIFIED' : 'RECRUITER_REJECTED',
      target: `User ID: ${recruiterUserId}`,
      details: `Recruiter verification status updated to ${status}.`,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [log, ...prev]);

    // If verified, auto-approve their pending listings
    if (status === 'verified') {
      setInternships(prev => prev.map(i => i.recruiterId === recruiterUserId && i.status === 'pending_approval' ? { ...i, status: 'published' } : i));
    }
  };

  const moderateInternship = (internshipId: string, action: 'approve' | 'reject' | 'close') => {
    const newStatus: Internship['status'] = action === 'approve' ? 'published' : action === 'reject' ? 'rejected' : 'closed';
    setInternships(prev => prev.map(i => i.id === internshipId ? { ...i, status: newStatus } : i));

    const log: AuditLog = {
      id: `log-${Date.now()}`,
      adminId: currentUser?.id || 'admin',
      adminName: currentUser?.name || 'Administrator',
      action: `INTERNSHIP_${action.toUpperCase()}`,
      target: `Internship ID: ${internshipId}`,
      details: `Internship status changed to ${newStatus}.`,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  const submitReport = (targetType: 'internship' | 'user', targetId: string, targetTitle: string, reason: string) => {
    const newReport: ContentReport = {
      id: `rep-${Date.now()}`,
      targetType,
      targetId,
      targetTitle,
      reporterId: currentUser?.id || 'anonymous',
      reporterName: currentUser?.name || 'Anonymous User',
      reason,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setReports(prev => [newReport, ...prev]);
  };

  const resolveReport = (reportId: string, status: 'reviewed' | 'dismissed') => {
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
  };

  const setUserStatus = (userId: string, status: UserStatus, reason: string) => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
    const targetUser = allUsers.find(u => u.id === userId);
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      adminId: currentUser?.id || 'admin',
      adminName: currentUser?.name || 'Administrator',
      action: status === 'suspended' ? 'USER_SUSPENDED' : 'USER_REACTIVATED',
      target: `${targetUser?.name || userId} (${targetUser?.email || ''})`,
      details: `Reason: ${reason}`,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  const deleteUser = (userId: string) => {
    const targetUser = allUsers.find(u => u.id === userId);
    setAllUsers(prev => {
      const filtered = prev.filter(u => u.id !== userId);
      localStorage.setItem('nextstep_all_users', JSON.stringify(filtered));
      return filtered;
    });

    const log: AuditLog = {
      id: `log-${Date.now()}`,
      adminId: currentUser?.id || 'admin',
      adminName: currentUser?.name || 'Mayank Maddewad (Admin)',
      action: 'USER_DELETED',
      target: targetUser ? `${targetUser.name} (${targetUser.email})` : `User ID: ${userId}`,
      details: 'User account permanently removed by Administrator.',
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => {
      const nextLogs = [log, ...prev];
      localStorage.setItem('nextstep_audit_logs', JSON.stringify(nextLogs));
      return nextLogs;
    });

    try {
      fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      }).catch(err => console.warn('Offline delete user notice:', err));
    } catch {
      // Offline fallback
    }
  };

  // NOTIFICATION ACTIONS
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    if (!currentUser) return;
    setNotifications(prev => prev.map(n => n.userId === currentUser.id ? { ...n, read: true } : n));
  };

  // RESET
  const resetToDemoSeed = () => {
    localStorage.removeItem('nextstep_internships');
    localStorage.removeItem('nextstep_applications');
    localStorage.removeItem('nextstep_saved_internships');
    localStorage.removeItem('nextstep_notifications');
    localStorage.removeItem('nextstep_reports');
    localStorage.removeItem('nextstep_audit_logs');
    localStorage.removeItem('nextstep_all_users');
    localStorage.removeItem(`student_profile_${SUJATA_STUDENT_ID}`);
    localStorage.removeItem(`recruiter_profile_${MARCUS_RECRUITER_ID}`);

    setInternships(INITIAL_INTERNSHIPS);
    setApplications(INITIAL_APPLICATIONS);
    setSavedInternshipIds(['int-001', 'int-003']);
    setNotifications(INITIAL_NOTIFICATIONS);
    setReports(INITIAL_REPORTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setAllUsers(INITIAL_USERS);
    setStudentProfile(INITIAL_STUDENT_PROFILE);
    setRecruiterProfile(INITIAL_RECRUITER_PROFILE);
  };

  return (
    <DataContext.Provider value={{
      internships,
      applications,
      studentProfile,
      recruiterProfile,
      savedInternshipIds,
      notifications,
      reports,
      auditLogs,
      allUsers,
      applyToInternship,
      withdrawApplication,
      toggleSaveInternship,
      isInternshipSaved,
      updateStudentProfile,
      toggleGoal,
      addGoal,
      createInternship,
      updateInternship,
      duplicateInternship,
      changeInternshipStatus,
      updateApplicationStatus,
      addRecruiterNote,
      updateRecruiterProfile,
      verifyRecruiterStatus,
      moderateInternship,
      resolveReport,
      submitReport,
      setUserStatus,
      deleteUser,
      markNotificationRead,
      markAllNotificationsRead,
      resetToDemoSeed
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
