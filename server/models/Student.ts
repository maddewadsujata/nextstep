import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
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
  experienceLevel: 'Student' | 'Fresher' | '1-2 Years';
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Student full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Student email is required'],
      trim: true,
      lowercase: true,
    },
    avatarUrl: { type: String, default: '' },
    phone: { type: String, default: '+91 98765 43210' },
    college: {
      type: String,
      required: [true, 'College name is required'],
      default: 'Indian Institute of Technology (IIT) / Pune Institute of Computer Technology',
    },
    degree: {
      type: String,
      default: 'Bachelor of Technology (B.Tech)',
    },
    branch: {
      type: String,
      default: 'Computer Science and Engineering',
    },
    graduationYear: {
      type: String,
      default: '2026',
    },
    cgpa: {
      type: String,
      default: '9.2 / 10.0',
    },
    skills: {
      type: [String],
      default: ['React', 'Node.js', 'Express', 'MongoDB', 'TypeScript', 'Tailwind CSS', 'Python'],
    },
    preferredRoles: {
      type: [String],
      default: ['Full-Stack Developer Intern', 'Frontend Developer', 'Backend Intern', 'Software Engineer Intern'],
    },
    preferredLocations: {
      type: [String],
      default: ['Pune', 'Bengaluru', 'Remote', 'Mumbai'],
    },
    remotePreference: {
      type: String,
      enum: ['Remote', 'Hybrid', 'On-site', 'Flexible'],
      default: 'Flexible',
    },
    resumeName: { type: String, default: 'Sujata_Software_Engineer_Resume.pdf' },
    resumeText: { type: String, default: '' },
    portfolioUrl: { type: String, default: 'https://sujata-portfolio.dev' },
    linkedinUrl: { type: String, default: 'https://linkedin.com/in/sujata-tech' },
    githubUrl: { type: String, default: 'https://github.com/sujata-dev' },
    experienceLevel: {
      type: String,
      enum: ['Student', 'Fresher', '1-2 Years'],
      default: 'Student',
    },
  },
  {
    timestamps: true,
  }
);

export const StudentModel =
  mongoose.models.Student ||
  mongoose.model<IStudent>('Student', StudentSchema);
