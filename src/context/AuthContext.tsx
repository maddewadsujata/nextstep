import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, StudentProfile, RecruiterProfile } from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_STUDENT_PROFILE, 
  INITIAL_RECRUITER_PROFILE,
  SUJATA_STUDENT_ID,
  MARCUS_RECRUITER_ID,
  ELENA_ADMIN_ID
} from '../data/seedData';
import { authApi, setStoredToken, getStoredToken } from '../services/api';

interface AuthResponse {
  success: boolean;
  error?: string;
  message?: string;
  user?: User;
}

interface RegisterPayload {
  name: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  role: UserRole;
  companyName?: string;
  extra?: Partial<StudentProfile | RecruiterProfile>;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string, role?: UserRole) => Promise<AuthResponse>;
  register: (payload: RegisterPayload | string, email?: string, role?: UserRole) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
  updateCurrentUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'nextstep_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.id === SUJATA_STUDENT_ID || (parsed.role === 'student' && parsed.isDemo)) {
          parsed.name = 'Sujata Maddewad';
          const customAvatar = localStorage.getItem('nextstep_sujata_avatar');
          if (customAvatar) parsed.avatarUrl = customAvatar;
        } else if (parsed.id === MARCUS_RECRUITER_ID || (parsed.role === 'recruiter' && parsed.isDemo)) {
          parsed.name = 'Sakshi Maddewad';
          parsed.email = 'sakshi@persistent.com';
        } else if (parsed.id === ELENA_ADMIN_ID || (parsed.role === 'admin' && parsed.isDemo)) {
          parsed.name = 'Mayank Maddewad';
          parsed.email = 'mayank.admin@nextstep.org';
        }
        return parsed;
      }
    } catch {
      // fallback
    }
    // Default to Sujata Maddewad (demo student) for initial load
    const customAvatar = typeof window !== 'undefined' ? localStorage.getItem('nextstep_sujata_avatar') : null;
    return {
      ...INITIAL_USERS[0],
      avatarUrl: customAvatar || INITIAL_USERS[0].avatarUrl || '',
    };
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setStoredToken(null);
    }
  }, [currentUser]);

  // Check backend session on mount if token exists
  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      authApi.me().then(res => {
        if (res.success && res.data?.authenticated && res.data.user) {
          setCurrentUser(res.data.user);
        }
      }).catch(() => {});
    }
  }, []);

  const login = async (email: string, password?: string, role?: UserRole): Promise<AuthResponse> => {
    const trimmedEmail = email.trim().toLowerCase();
    const effectivePassword = password || (
      trimmedEmail.includes('admin') ? 'admin123' :
      trimmedEmail.includes('recruiter') || trimmedEmail.includes('marcus') ? 'recruiter123' :
      'student123'
    );

    try {
      const res = await authApi.login(trimmedEmail, effectivePassword);
      if (res.success && res.data?.user) {
        if (res.data.token) {
          setStoredToken(res.data.token);
        }
        const userObj: User = {
          id: res.data.user.id || res.data.user._id,
          name: res.data.user.name,
          email: res.data.user.email,
          role: res.data.user.role,
          status: res.data.user.status,
          avatarUrl: res.data.user.avatarUrl,
          isDemo: res.data.user.isDemo,
          createdAt: res.data.user.createdAt || new Date().toISOString(),
        };
        setCurrentUser(userObj);
        return { success: true, message: res.data.user.name, user: userObj };
      }

      if (res.error) {
        return { success: false, error: res.error };
      }
    } catch {
      // Network fallback
    }

    // Fallback look-up
    const savedUsersStr = localStorage.getItem('nextstep_all_users');
    const allUsers: User[] = savedUsersStr ? JSON.parse(savedUsersStr) : INITIAL_USERS;
    const found = allUsers.find(u => u.email.toLowerCase() === trimmedEmail);

    if (found) {
      if (found.status === 'suspended') {
        return { success: false, error: 'Your account has been suspended by an administrator.' };
      }
      setCurrentUser(found);
      return { success: true, user: found };
    }

    // Auto-create local user session if completely new
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: email.split('@')[0],
      email: trimmedEmail,
      role: role || 'student',
      status: 'active',
      createdAt: new Date().toISOString(),
      isDemo: false,
    };
    setCurrentUser(newUser);
    return { success: true, user: newUser };
  };

  const register = async (
    payloadOrName: RegisterPayload | string,
    optionalEmail?: string,
    optionalRole?: UserRole
  ): Promise<AuthResponse> => {
    let name = '';
    let email = '';
    let password = 'student123';
    let confirmPassword = 'student123';
    let role: UserRole = 'student';
    let companyName: string | undefined;
    let extra: any;

    if (typeof payloadOrName === 'object') {
      name = payloadOrName.name;
      email = payloadOrName.email;
      password = payloadOrName.password || 'password123';
      confirmPassword = payloadOrName.confirmPassword || password;
      role = payloadOrName.role;
      companyName = payloadOrName.companyName;
      extra = payloadOrName.extra;
    } else {
      name = payloadOrName;
      email = optionalEmail || '';
      role = optionalRole || 'student';
    }

    if (role === 'admin') {
      return {
        success: false,
        error: 'Forbidden: Admin accounts cannot be self-registered. They must be provisioned securely by an administrator.',
      };
    }

    try {
      const res = await authApi.register({
        fullName: name,
        email,
        password,
        confirmPassword,
        role: role as 'student' | 'recruiter',
        companyName,
      });

      if (res.success && res.data?.user) {
        if (res.data.token) {
          setStoredToken(res.data.token);
        }
        const userObj: User = {
          id: res.data.user.id || res.data.user._id,
          name: res.data.user.name,
          email: res.data.user.email,
          role: res.data.user.role,
          status: res.data.user.status,
          avatarUrl: res.data.user.avatarUrl,
          isDemo: false,
          createdAt: res.data.user.createdAt || new Date().toISOString(),
        };
        setCurrentUser(userObj);
        return { success: true, message: res.message || 'Account created successfully', user: userObj };
      }

      if (res.error) {
        return { success: false, error: res.error };
      }
    } catch {
      // fallback
    }

    // Local fallback
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      status: 'active',
      createdAt: new Date().toISOString(),
      isDemo: false,
    };

    const savedUsersStr = localStorage.getItem('nextstep_all_users');
    const allUsers: User[] = savedUsersStr ? JSON.parse(savedUsersStr) : INITIAL_USERS;
    localStorage.setItem('nextstep_all_users', JSON.stringify([...allUsers, newUser]));

    if (role === 'student') {
      const newStudentProfile: StudentProfile = {
        ...INITIAL_STUDENT_PROFILE,
        userId: newUser.id,
        fullName: name.trim(),
        email: newUser.email,
        avatarUrl: '',
        projects: [],
        certifications: [],
        isDemo: false,
        ...(extra as Partial<StudentProfile>),
      };
      localStorage.setItem(`student_profile_${newUser.id}`, JSON.stringify(newStudentProfile));
    } else if (role === 'recruiter') {
      const newRecruiterProfile: RecruiterProfile = {
        ...INITIAL_RECRUITER_PROFILE,
        userId: newUser.id,
        recruiterName: name.trim(),
        workEmail: newUser.email,
        companyName: companyName || (extra as Partial<RecruiterProfile>)?.companyName || `${name.trim()} Corp`,
        verificationStatus: 'verified',
        isDemo: false,
        ...(extra as Partial<RecruiterProfile>),
      };
      localStorage.setItem(`recruiter_profile_${newUser.id}`, JSON.stringify(newRecruiterProfile));
    }

    setCurrentUser(newUser);
    return { success: true, user: newUser };
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // pass
    }
    setStoredToken(null);
    setCurrentUser(null);
  };

  const switchDemoRole = (role: UserRole) => {
    if (role === 'student') {
      const customAvatar = localStorage.getItem('nextstep_sujata_avatar') || '';
      setCurrentUser({
        ...INITIAL_USERS[0],
        avatarUrl: customAvatar || INITIAL_USERS[0].avatarUrl || '',
      });
    } else if (role === 'recruiter') {
      setCurrentUser(INITIAL_USERS[1]); // Sakshi Maddewad
    } else if (role === 'admin') {
      setCurrentUser(INITIAL_USERS[2]); // Mayank Maddewad
    }
  };

  const updateCurrentUser = (updates: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);

    const savedUsersStr = localStorage.getItem('nextstep_all_users');
    const allUsers: User[] = savedUsersStr ? JSON.parse(savedUsersStr) : INITIAL_USERS;
    const nextList = allUsers.map(u => u.id === updated.id ? updated : u);
    localStorage.setItem('nextstep_all_users', JSON.stringify(nextList));
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated: !!currentUser,
      login,
      register,
      logout,
      switchDemoRole,
      updateCurrentUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
