export type UserRole = 'student' | 'recruiter' | 'admin';

export type UserStatus = 'active' | 'suspended';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  avatarUrl?: string;
  isDemo?: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  techTags: string[];
  link?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
  credentialUrl?: string;
}

export interface StudentProfile {
  userId: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
  college: string;
  degree: string;
  branch: string;
  graduationYear: string;
  cgpa?: string;
  skills: string[];
  preferredRoles: string[];
  preferredLocations: string[];
  remotePreference: 'Remote' | 'Hybrid' | 'On-site' | 'Flexible';
  resumeName?: string;
  resumeText?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  projects: Project[];
  certifications: Certification[];
  experienceLevel: 'Student' | 'Fresher' | '1-2 Years';
  weeklyGoals?: { id: string; text: string; completed: boolean }[];
  isDemo?: boolean;
}

export interface RecruiterProfile {
  userId: string;
  recruiterName: string;
  workEmail: string;
  companyName: string;
  companyDescription: string;
  website: string;
  industry: string;
  companyLogo?: string;
  location: string;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  companyProfile?: string;
  isDemo?: boolean;
}

export type InternshipDomain = 'Engineering' | 'Product' | 'Design' | 'Data Science' | 'Marketing' | 'DevOps';
export type InternshipWorkType = 'Remote' | 'Hybrid' | 'On-site';
export type InternshipStatus = 'published' | 'draft' | 'pending_approval' | 'closed' | 'rejected';

export interface Internship {
  id: string;
  title: string;
  companyName: string;
  companyLogo?: string;
  recruiterId: string;
  description: string;
  responsibilities: string[];
  eligibility: string[];
  requiredSkills: string[];
  stipend: string;
  stipendNumeric: number; // for filtering/sorting
  duration: string;
  location: string;
  type: InternshipWorkType;
  openings: number;
  deadline: string; // ISO string
  status: InternshipStatus;
  createdAt: string;
  experienceLevel: 'All Levels' | 'Beginner' | 'Intermediate';
  domain: InternshipDomain;
  isDemo?: boolean;
}

export type ApplicationStatus = 
  | 'applied' 
  | 'under_review' 
  | 'shortlisted' 
  | 'interview_scheduled' 
  | 'offer_received' 
  | 'accepted' 
  | 'rejected' 
  | 'withdrawn';

export interface StatusHistoryItem {
  status: ApplicationStatus;
  timestamp: string;
  note?: string;
}

export interface InterviewDetails {
  date: string;
  time: string;
  timezone: string;
  type: 'Technical' | 'Behavioral' | 'Screening' | 'Final Round';
  meetingId?: string;
  meetingUrl: string;
  instructions: string;
  feedback?: string;
  candidateName?: string;
  recruiterName?: string;
}

export interface OfferDetails {
  stipend: string;
  duration: string;
  startDate: string;
  expiryDate: string;
  additionalPerks?: string;
}

export interface Application {
  id: string;
  internshipId: string;
  internshipTitle: string;
  companyName: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  appliedAt: string;
  status: ApplicationStatus;
  resumeSnapshot?: string;
  coverLetter?: string;
  answers?: Record<string, string>;
  recruiterNotes?: string;
  history: StatusHistoryItem[];
  interviewDetails?: InterviewDetails;
  offerDetails?: OfferDetails;
}

export interface SavedInternship {
  id: string;
  userId: string;
  internshipId: string;
  savedAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'interview' | 'offer';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface ContentReport {
  id: string;
  targetType: 'internship' | 'user';
  targetId: string;
  targetTitle: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  target: string;
  details: string;
  timestamp: string;
}

export interface ResumeAnalysisResult {
  overallScore: number;
  extractedSkills: string[];
  strengths: string[];
  missingSections: string[];
  recommendations: { section: string; suggestion: string; priority: 'High' | 'Medium' | 'Low' }[];
  summary: string;
}

export interface MatchScoreResult {
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  recommendations: string[];
  summary: string;
}

export interface SkillGapResult {
  targetRole: string;
  overallReadiness: number;
  acquiredSkills: string[];
  skillsToLearn: { skill: string; importance: 'Critical' | 'Recommended' | 'Bonus'; estimatedWeeks: number }[];
  learningRoadmap: { phase: string; title: string; duration: string; topics: string[]; suggestedProject: string }[];
}

export interface MongoInternshipRecord {
  _id: string;
  title: string;
  company: string;
  location: string;
  skills: string[];
  description: string;
  stipend?: string;
  openings?: number;
  workType?: 'Remote' | 'Hybrid' | 'On-site';
  createdAt?: string;
  updatedAt?: string;
}

export interface MongoDbStatus {
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  readyState: number;
  host: string | null;
  database: string | null;
  maskedUri: string | null;
  isLiveMongo: boolean;
  driver: string;
  error: string | null;
}
