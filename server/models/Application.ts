import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
  internshipId: string;
  internshipTitle: string;
  companyName: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  status: 'applied' | 'under_review' | 'shortlisted' | 'interview_scheduled' | 'offer_received' | 'accepted' | 'rejected' | 'withdrawn';
  coverLetter?: string;
  appliedAt: Date;
  recruiterNotes?: string;
  history: Array<{
    status: string;
    timestamp: Date;
    note?: string;
  }>;
  interviewDetails?: {
    date: string;
    time: string;
    timezone: string;
    type: string;
    meetingUrl: string;
    instructions: string;
  };
  offerDetails?: {
    stipend: string;
    duration: string;
    startDate: string;
    expiryDate: string;
    additionalPerks?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema: Schema = new Schema(
  {
    internshipId: {
      type: String,
      required: [true, 'Internship ID is required'],
      index: true,
    },
    internshipTitle: {
      type: String,
      required: [true, 'Internship title is required'],
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
    },
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      index: true,
    },
    studentName: {
      type: String,
      required: [true, 'Student name is required'],
    },
    studentEmail: {
      type: String,
      required: [true, 'Student email is required'],
    },
    studentAvatar: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: [
        'applied',
        'under_review',
        'shortlisted',
        'interview_scheduled',
        'offer_received',
        'accepted',
        'rejected',
        'withdrawn',
      ],
      default: 'applied',
    },
    coverLetter: {
      type: String,
      default: '',
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    recruiterNotes: {
      type: String,
      default: '',
    },
    history: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: '' },
      },
    ],
    interviewDetails: {
      date: String,
      time: String,
      timezone: String,
      type: { type: String, default: 'Technical' },
      meetingUrl: String,
      instructions: String,
    },
    offerDetails: {
      stipend: String,
      duration: String,
      startDate: String,
      expiryDate: String,
      additionalPerks: String,
    },
  },
  {
    timestamps: true,
  }
);

export const ApplicationModel =
  mongoose.models.Application ||
  mongoose.model<IApplication>('Application', ApplicationSchema);
