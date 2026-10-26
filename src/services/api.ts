/**
 * NextStep Full-Stack API Client Service
 * Bridges React frontend with Node.js/Express backend & MongoDB persistence.
 */

import { MongoInternshipRecord, MongoDbStatus } from '../types';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
  message?: string;
  source?: 'mongodb' | 'memory_fallback';
  count?: number;
  deletedId?: string;
}

const API_BASE = '/api';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem('nextstep_token');
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) localStorage.setItem('nextstep_token', token);
    else localStorage.removeItem('nextstep_token');
  } catch {
    // pass
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const token = getStoredToken();
    const currentUserStr = localStorage.getItem('nextstep_auth_user');
    let userId = '';
    let userRole = '';
    if (currentUserStr) {
      try {
        const u = JSON.parse(currentUserStr);
        userId = u.id || '';
        userRole = u.role || '';
      } catch {
        // pass
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(userId ? { 'x-user-id': userId } : {}),
      ...(userRole ? { 'x-user-role': userRole } : {}),
      ...((options.headers as Record<string, string>) || {}),
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        success: false,
        error: data?.error || `HTTP ${response.status}: ${response.statusText}`,
        details: data?.details,
      };
    }

    return data as ApiResponse<T>;
  } catch (err: unknown) {
    return {
      success: false,
      error: 'Network error or backend server unreachable',
      details: err instanceof Error ? err.message : String(err),
    };
  }
}

// 0. Authentication API
export const authApi = {
  login: (email: string, password: string) =>
    request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (payload: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: 'student' | 'recruiter';
    companyName?: string;
  }) =>
    request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  me: () => request<{ authenticated: boolean; user: any }>('/auth/me', { method: 'GET' }),
  logout: () => request<{ message: string }>('/auth/logout', { method: 'POST' }),
};

// Admin Operations API (Guarded on backend)
export const adminApi = {
  getOverview: () =>
    request<{
      totalStudents: number;
      totalRecruiters: number;
      totalInternships: number;
      totalApplications: number;
      totalUsers: number;
    }>('/admin/overview', { method: 'GET' }),
  getUsers: (role?: string) =>
    request<{ count: number; users: any[] }>(`/admin/users${role ? `?role=${role}` : ''}`, { method: 'GET' }),
  updateUserStatus: (id: string, status: 'active' | 'suspended') =>
    request<{ message: string; user: any }>(`/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};

// 1. Database Operations & Diagnostics
export const dbApi = {
  getStatus: () => request<MongoDbStatus>('/db/status', { method: 'GET' }),
  connect: (uri?: string) => request<MongoDbStatus>('/db/connect', {
    method: 'POST',
    body: JSON.stringify({ uri }),
  }),
};

// 2. Internship CRUD Operations
export const internshipsApi = {
  getAll: () => request<MongoInternshipRecord[]>('/internships', { method: 'GET' }),
  getById: (id: string) => request<MongoInternshipRecord>(`/internships/${id}`, { method: 'GET' }),
  create: (data: Omit<MongoInternshipRecord, '_id' | 'createdAt' | 'updatedAt'>) =>
    request<MongoInternshipRecord>('/internships', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, updates: Partial<MongoInternshipRecord>) =>
    request<MongoInternshipRecord>(`/internships/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  delete: (id: string) =>
    request<{ deletedId: string }>(`/internships/${id}`, {
      method: 'DELETE',
    }),
  seed: () =>
    request<MongoInternshipRecord[]>('/internships/seed', {
      method: 'POST',
    }),
};

// 3. Student Record Operations
export interface StudentRecord {
  _id: string;
  userId: string;
  fullName: string;
  email: string;
  college: string;
  degree: string;
  branch: string;
  graduationYear: string;
  cgpa: string;
  skills: string[];
  preferredRoles: string[];
  preferredLocations?: string[];
  remotePreference?: 'Remote' | 'Hybrid' | 'On-site' | 'Flexible';
  resumeName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const studentsApi = {
  getAll: () => request<StudentRecord[]>('/students', { method: 'GET' }),
  getById: (idOrUserId: string) => request<StudentRecord>(`/students/${idOrUserId}`, { method: 'GET' }),
  create: (data: Partial<StudentRecord>) =>
    request<StudentRecord>('/students', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (idOrUserId: string, updates: Partial<StudentRecord>) =>
    request<StudentRecord>(`/students/${idOrUserId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
};

// 4. Company Profile Operations
export interface CompanyRecord {
  _id: string;
  userId: string;
  companyName: string;
  recruiterName: string;
  workEmail: string;
  companyDescription: string;
  website: string;
  industry: string;
  location: string;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}

export const companiesApi = {
  getAll: () => request<CompanyRecord[]>('/companies', { method: 'GET' }),
  getById: (idOrUserId: string) => request<CompanyRecord>(`/companies/${idOrUserId}`, { method: 'GET' }),
  create: (data: Partial<CompanyRecord>) =>
    request<CompanyRecord>('/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (idOrUserId: string, updates: Partial<CompanyRecord>) =>
    request<CompanyRecord>(`/companies/${idOrUserId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
};

// 5. Application Record Operations
export interface ApplicationRecord {
  _id: string;
  internshipId: string;
  internshipTitle: string;
  companyName: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  status: 'applied' | 'under_review' | 'shortlisted' | 'interview_scheduled' | 'offer_received' | 'accepted' | 'rejected' | 'withdrawn';
  coverLetter?: string;
  appliedAt?: string;
  recruiterNotes?: string;
  history?: Array<{ status: string; timestamp: string; note?: string }>;
  createdAt?: string;
  updatedAt?: string;
}

export const applicationsApi = {
  getAll: (params?: { studentId?: string; internshipId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.studentId) searchParams.set('studentId', params.studentId);
    if (params?.internshipId) searchParams.set('internshipId', params.internshipId);
    const qs = searchParams.toString();
    return request<ApplicationRecord[]>(`/applications${qs ? `?${qs}` : ''}`, { method: 'GET' });
  },
  getById: (id: string) => request<ApplicationRecord>(`/applications/${id}`, { method: 'GET' }),
  create: (data: Partial<ApplicationRecord>) =>
    request<ApplicationRecord>('/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, updates: Partial<ApplicationRecord> & { note?: string }) =>
    request<ApplicationRecord>(`/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  delete: (id: string) =>
    request<{ deletedId: string }>(`/applications/${id}`, {
      method: 'DELETE',
    }),
};
