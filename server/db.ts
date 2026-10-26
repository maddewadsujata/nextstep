import mongoose from 'mongoose';
import { InternshipModel } from './models/Internship.ts';
import { StudentModel } from './models/Student.ts';
import { CompanyModel } from './models/Company.ts';
import { ApplicationModel } from './models/Application.ts';

interface DbStatus {
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  readyState: number;
  host: string | null;
  database: string | null;
  maskedUri: string | null;
  isLiveMongo: boolean;
  driver: string;
  error: string | null;
}

let lastConnectionError: string | null = null;
let currentConfiguredUri: string | null = null;

// Safely normalize MongoDB URI handling special characters in password (such as @ -> %40)
export function normalizeMongoUri(rawUri: string): string {
  let uri = rawUri.trim();
  const protoMatch = uri.match(/^(mongodb(?:\+srv)?:\/\/)(.+)$/);
  if (!protoMatch) return uri;

  const protocol = protoMatch[1];
  const rest = protoMatch[2];

  const pathIdx = rest.search(/[/\\?]/);
  const authority = pathIdx === -1 ? rest : rest.substring(0, pathIdx);
  let pathAndQuery = pathIdx === -1 ? '' : rest.substring(pathIdx);

  const lastAtIdx = authority.lastIndexOf('@');
  if (lastAtIdx === -1) {
    return uri;
  }

  const userPassPart = authority.substring(0, lastAtIdx);
  const hostsPart = authority.substring(lastAtIdx + 1);

  const colonIdx = userPassPart.indexOf(':');
  if (colonIdx === -1) {
    return uri;
  }

  const rawUser = userPassPart.substring(0, colonIdx);
  const rawPass = userPassPart.substring(colonIdx + 1);

  // Auto-encode unencoded '@' in password / username to %40
  const encodedUser = rawUser.includes('%40') ? rawUser : rawUser.replace(/@/g, '%40');
  const encodedPass = rawPass.includes('%40') ? rawPass : rawPass.replace(/@/g, '%40');

  // If mongodb+srv:// and no query params, append retryWrites
  if (protocol.startsWith('mongodb+srv://') && !pathAndQuery.includes('?')) {
    if (pathAndQuery === '' || pathAndQuery === '/') {
      pathAndQuery = '/NextStep?retryWrites=true&w=majority';
    } else {
      pathAndQuery += '?retryWrites=true&w=majority';
    }
  }

  return `${protocol}${encodedUser}:${encodedPass}@${hostsPart}${pathAndQuery}`;
}

// Mask credentials in MongoDB connection string for safe client display
export function maskMongoUri(uri: string): string {
  try {
    const protoMatch = uri.match(/^(mongodb(?:\+srv)?:\/\/)(.+)$/);
    if (!protoMatch) return 'mongodb://*****';
    const protocol = protoMatch[1];
    const rest = protoMatch[2];
    const pathIdx = rest.search(/[/\\?]/);
    const authority = pathIdx === -1 ? rest : rest.substring(0, pathIdx);
    const pathAndQuery = pathIdx === -1 ? '' : rest.substring(pathIdx);
    const lastAtIdx = authority.lastIndexOf('@');
    if (lastAtIdx === -1) {
      return uri;
    }
    const hostsPart = authority.substring(lastAtIdx + 1);
    return `${protocol}*****:*****@${hostsPart}${pathAndQuery}`;
  } catch {
    return 'mongodb://*****';
  }
}

export async function connectToDatabase(customUri?: string): Promise<{ success: boolean; message: string }> {
  const rawUri = customUri || process.env.MONGODB_URI;

  if (!rawUri || rawUri.trim() === '' || rawUri.includes('<username>')) {
    lastConnectionError = 'MONGODB_URI is not configured in .env or contains placeholder credentials.';
    return { success: false, message: lastConnectionError };
  }

  const uri = normalizeMongoUri(rawUri);
  currentConfiguredUri = uri;

  try {
    // If already connected to the same URI, return early
    if (mongoose.connection.readyState === 1 && mongoose.connection.host) {
      return { success: true, message: `Already connected to MongoDB at ${mongoose.connection.host}` };
    }

    // Disconnect previous if open
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    lastConnectionError = null;
    console.log(`Connecting to MongoDB (${maskMongoUri(uri)})...`);

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ Successfully connected to MongoDB: ${mongoose.connection.name} on ${mongoose.connection.host}`);
    return { success: true, message: `Connected to MongoDB database "${mongoose.connection.name}" on ${mongoose.connection.host}` };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    lastConnectionError = errorMsg;
    console.error('❌ MongoDB Connection Error:', errorMsg);
    return { success: false, message: errorMsg };
  }
}

export function getDatabaseStatus(): DbStatus {
  const readyState = mongoose.connection.readyState;
  let status: DbStatus['status'] = 'disconnected';

  if (readyState === 1) status = 'connected';
  else if (readyState === 2) status = 'connecting';
  else if (lastConnectionError) status = 'error';

  return {
    status,
    readyState,
    host: readyState === 1 ? mongoose.connection.host : null,
    database: readyState === 1 ? mongoose.connection.name : null,
    maskedUri: currentConfiguredUri ? maskMongoUri(currentConfiguredUri) : (process.env.MONGODB_URI ? maskMongoUri(process.env.MONGODB_URI) : null),
    isLiveMongo: readyState === 1,
    driver: `Mongoose v${mongoose.version}`,
    error: lastConnectionError,
  };
}

// In-Memory simulated NoSQL store for when MongoDB Atlas/local daemon is pending configuration
// Uses valid 24-character hex MongoDB ObjectId format
export interface SimulatedInternship {
  _id: string;
  title: string;
  company: string;
  location: string;
  skills: string[];
  description: string;
  stipend: string;
  openings: number;
  workType: 'Remote' | 'Hybrid' | 'On-site';
  createdAt: string;
  updatedAt: string;
}

export const fallbackStorage: SimulatedInternship[] = [
  {
    _id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Full-Stack Software Engineering Intern',
    company: 'Persistent Systems',
    location: 'Pune, Maharashtra',
    skills: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'Express'],
    description: 'Build robust scalable full-stack features with React and MongoDB NoSQL document persistence at Persistent Systems Hinjawadi campus.',
    stipend: '₹18,000 / month',
    openings: 3,
    workType: 'Hybrid',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    _id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Cloud & Database Backend Intern',
    company: 'Tata Consultancy Services (TCS)',
    location: 'Pune, Maharashtra',
    skills: ['MongoDB', 'Mongoose', 'Docker', 'REST APIs', 'Node.js'],
    description: 'Design schema validations, indexing strategies, and aggregation pipelines on high-throughput enterprise systems.',
    stipend: '₹20,000 / month',
    openings: 4,
    workType: 'Hybrid',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    _id: new mongoose.Types.ObjectId().toHexString(),
    title: 'AI Platform Engineering Intern',
    company: 'Infosys',
    location: 'Bengaluru, Karnataka',
    skills: ['Python', 'TypeScript', 'Vector DB', 'MongoDB', 'Gemini AI'],
    description: 'Integrate multi-modal LLM workflows and persistent document storage for next-generation developer tooling.',
    stipend: '₹25,000 / month',
    openings: 2,
    workType: 'Remote',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    _id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Software Development Intern (Placement Track)',
    company: 'Tech Mahindra',
    location: 'Pune, Maharashtra',
    skills: ['Java', 'Spring Boot', 'React', 'MongoDB', 'SQL'],
    description: 'Work with the digital engineering division on enterprise client solutions with pre-placement interview (PPI) opportunity.',
    stipend: '₹15,000 / month',
    openings: 5,
    workType: 'On-site',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
];

// Fallback Student Documents
export interface SimulatedStudent {
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
  preferredLocations: string[];
  remotePreference: 'Remote' | 'Hybrid' | 'On-site' | 'Flexible';
  resumeName: string;
  experienceLevel: 'Student' | 'Fresher' | '1-2 Years';
  createdAt: string;
  updatedAt: string;
}

export const fallbackStudents: SimulatedStudent[] = [
  {
    _id: new mongoose.Types.ObjectId().toHexString(),
    userId: 'user-sujata-001',
    fullName: 'Sujata Maddewad',
    email: 'sujata@university.edu',
    college: 'Pune Institute of Computer Technology (PICT) / Pune University',
    degree: 'Bachelor of Engineering (B.E.)',
    branch: 'Computer Engineering',
    graduationYear: '2026',
    cgpa: '9.2 / 10.0',
    skills: ['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'Mongoose', 'Tailwind CSS', 'Python'],
    preferredRoles: ['Full-Stack Developer Intern', 'React Developer', 'Software Engineer Intern'],
    preferredLocations: ['Pune', 'Bengaluru', 'Remote'],
    remotePreference: 'Flexible',
    resumeName: 'Sujata_Maddewad_Resume.pdf',
    experienceLevel: 'Student',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Fallback Company Documents
export interface SimulatedCompany {
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
  createdAt: string;
  updatedAt: string;
}

export const fallbackCompanies: SimulatedCompany[] = [
  {
    _id: new mongoose.Types.ObjectId().toHexString(),
    userId: 'user-recruiter-001',
    companyName: 'Persistent Systems',
    recruiterName: 'Sakshi Maddewad',
    workEmail: 'sakshi@persistent.com',
    companyDescription: 'Global leader in digital engineering and enterprise software modernization headquartered in Pune.',
    website: 'https://www.persistent.com',
    industry: 'Digital Engineering & Enterprise Software',
    location: 'Hinjawadi Tech Park, Pune, Maharashtra',
    verificationStatus: 'verified',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: new mongoose.Types.ObjectId().toHexString(),
    userId: 'user-recruiter-002',
    companyName: 'Tata Consultancy Services (TCS)',
    recruiterName: 'Priya Deshmukh',
    workEmail: 'priya.deshmukh@tcs.com',
    companyDescription: 'Pioneering global IT services, consulting, and business solutions across industries.',
    website: 'https://www.tcs.com',
    industry: 'IT Services & Consulting',
    location: 'Sahyadri Park, Hinjawadi Phase 3, Pune, Maharashtra',
    verificationStatus: 'verified',
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Fallback Application Documents
export interface SimulatedApplication {
  _id: string;
  internshipId: string;
  internshipTitle: string;
  companyName: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  status: 'applied' | 'under_review' | 'shortlisted' | 'interview_scheduled' | 'offer_received' | 'accepted' | 'rejected' | 'withdrawn';
  coverLetter: string;
  appliedAt: string;
  recruiterNotes: string;
  history: Array<{ status: string; timestamp: string; note?: string }>;
  createdAt: string;
  updatedAt: string;
}

export const fallbackApplications: SimulatedApplication[] = [
  {
    _id: new mongoose.Types.ObjectId().toHexString(),
    internshipId: fallbackStorage[0]._id,
    internshipTitle: 'Full-Stack Software Engineering Intern',
    companyName: 'Persistent Systems',
    studentId: 'user-sujata-001',
    studentName: 'Sujata Maddewad',
    studentEmail: 'sujata@university.edu',
    status: 'interview_scheduled',
    coverLetter: 'I am passionate about full-stack engineering with React, Node.js, and MongoDB. I built NextStep and would love to contribute to Persistent Systems at the Pune campus. - Sujata Maddewad',
    appliedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    recruiterNotes: 'Candidate demonstrated exemplary architectural understanding of React frontend and Node.js backend integration.',
    history: [
      { status: 'applied', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), note: 'Application submitted via NextStep' },
      { status: 'shortlisted', timestamp: new Date(Date.now() - 86400000 * 1.5).toISOString(), note: 'Profile cleared automated ATS filter with 94% score' },
      { status: 'interview_scheduled', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), note: 'Technical Round 1 scheduled (IST)' },
    ],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    _id: new mongoose.Types.ObjectId().toHexString(),
    internshipId: fallbackStorage[0]._id,
    internshipTitle: 'Full-Stack Software Engineering Intern',
    companyName: 'Persistent Systems',
    studentId: 'user-priya-patil-02',
    studentName: 'Priya Patil',
    studentEmail: 'priya.patil@coep.ac.in',
    status: 'shortlisted',
    coverLetter: 'B.Tech Computer Engineering student from COEP Pune skilled in React, TypeScript, and REST APIs.',
    appliedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    recruiterNotes: 'Strong coding portfolio and academic ranking at COEP Pune.',
    history: [
      { status: 'applied', timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), note: 'Application submitted via NextStep' },
      { status: 'shortlisted', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), note: 'Shortlisted for technical assessment' },
    ],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    _id: new mongoose.Types.ObjectId().toHexString(),
    internshipId: fallbackStorage[1]._id,
    internshipTitle: 'Cloud & Database Backend Intern',
    companyName: 'Tata Consultancy Services (TCS)',
    studentId: 'user-sneha-kulkarni-03',
    studentName: 'Sneha Kulkarni',
    studentEmail: 'sneha.kulkarni@cumminscollege.in',
    status: 'under_review',
    coverLetter: 'B.E. Information Technology student from Cummins College of Engineering for Women, Pune with hands-on MongoDB and Node.js expertise.',
    appliedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    recruiterNotes: 'Resume matches database indexing criteria.',
    history: [
      { status: 'applied', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), note: 'Application submitted via NextStep' },
      { status: 'under_review', timestamp: new Date().toISOString(), note: 'Initial profile review in progress' },
    ],
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Fallback User Accounts with bcrypt-hashed passwords
import bcrypt from 'bcryptjs';
import { UserModel } from './models/User.ts';

export interface SimulatedUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'student' | 'recruiter' | 'admin';
  status: 'active' | 'suspended';
  avatarUrl?: string;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export const fallbackUsers: SimulatedUser[] = [
  {
    _id: 'user-sujata-001',
    name: 'Sujata Maddewad',
    email: 'sujata@university.edu',
    passwordHash: bcrypt.hashSync('student123', 10),
    role: 'student',
    status: 'active',
    avatarUrl: '',
    isDemo: true,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'user-recruiter-001',
    name: 'Sakshi Maddewad',
    email: 'sakshi@persistent.com',
    passwordHash: bcrypt.hashSync('recruiter123', 10),
    role: 'recruiter',
    status: 'active',
    avatarUrl: '',
    isDemo: true,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'user-admin-001',
    name: 'Mayank Maddewad (Admin)',
    email: 'mayank.admin@nextstep.org',
    passwordHash: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    status: 'active',
    avatarUrl: '',
    isDemo: true,
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Auto-seed initial documents into live MongoDB if empty
export async function seedLiveUsersIfEmpty(): Promise<void> {
  if (mongoose.connection.readyState !== 1) return;
  try {
    // 1. Users
    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      console.log('Seeding initial verified users into MongoDB...');
      for (const u of fallbackUsers) {
        await UserModel.create({
          name: u.name,
          email: u.email,
          passwordHash: u.passwordHash,
          role: u.role,
          status: u.status,
          avatarUrl: u.avatarUrl,
          isDemo: u.isDemo,
        });
      }
      console.log('✅ Initial users seeded into MongoDB.');
    }

    // 2. Internships
    const internshipCount = await InternshipModel.countDocuments();
    if (internshipCount === 0) {
      console.log('Seeding initial internships into MongoDB...');
      for (const item of fallbackStorage) {
        await InternshipModel.create({
          title: item.title,
          company: item.company,
          location: item.location,
          skills: item.skills,
          description: item.description,
          stipend: item.stipend,
          openings: item.openings,
          workType: item.workType,
        });
      }
      console.log('✅ Initial internships seeded into MongoDB.');
    }

    // 3. Students
    const studentCount = await StudentModel.countDocuments();
    if (studentCount === 0) {
      console.log('Seeding initial student profiles into MongoDB...');
      for (const s of fallbackStudents) {
        await StudentModel.create({
          userId: s.userId,
          fullName: s.fullName,
          email: s.email,
          college: s.college,
          degree: s.degree,
          branch: s.branch,
          graduationYear: s.graduationYear,
          cgpa: s.cgpa,
          skills: s.skills,
          preferredRoles: s.preferredRoles,
          preferredLocations: s.preferredLocations,
          remotePreference: s.remotePreference,
          resumeName: s.resumeName,
          experienceLevel: s.experienceLevel,
        });
      }
      console.log('✅ Initial students seeded into MongoDB.');
    }

    // 4. Companies
    const companyCount = await CompanyModel.countDocuments();
    if (companyCount === 0) {
      console.log('Seeding initial company profiles into MongoDB...');
      for (const c of fallbackCompanies) {
        await CompanyModel.create({
          userId: c.userId,
          companyName: c.companyName,
          recruiterName: c.recruiterName,
          workEmail: c.workEmail,
          companyDescription: c.companyDescription,
          website: c.website,
          industry: c.industry,
          location: c.location,
          verificationStatus: c.verificationStatus,
        });
      }
      console.log('✅ Initial companies seeded into MongoDB.');
    }

    // 5. Applications
    const appCount = await ApplicationModel.countDocuments();
    if (appCount === 0) {
      console.log('Seeding initial applications into MongoDB...');
      for (const a of fallbackApplications) {
        await ApplicationModel.create({
          internshipId: a.internshipId,
          internshipTitle: a.internshipTitle,
          companyName: a.companyName,
          studentId: a.studentId,
          studentName: a.studentName,
          studentEmail: a.studentEmail,
          status: a.status,
          coverLetter: a.coverLetter,
          appliedAt: new Date(a.appliedAt),
          recruiterNotes: a.recruiterNotes,
          history: a.history.map(h => ({ status: h.status, timestamp: new Date(h.timestamp), note: h.note })),
        });
      }
      console.log('✅ Initial applications seeded into MongoDB.');
    }
  } catch (err: unknown) {
    console.warn('Database seeding notice:', (err as Error).message);
  }
}

export const seedLiveDatabaseIfEmpty = seedLiveUsersIfEmpty;


