import mongoose, { Schema, Document } from 'mongoose';

export interface ICompany extends Document {
  userId: string;
  companyName: string;
  recruiterName: string;
  workEmail: string;
  companyDescription: string;
  website: string;
  industry: string;
  companyLogo?: string;
  location: string;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      unique: true,
      index: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    recruiterName: {
      type: String,
      required: [true, 'Recruiter name is required'],
      trim: true,
    },
    workEmail: {
      type: String,
      required: [true, 'Work email is required'],
      trim: true,
      lowercase: true,
    },
    companyDescription: {
      type: String,
      default: 'Innovating cutting-edge software and cloud-native solutions.',
    },
    website: {
      type: String,
      default: 'https://example.com',
    },
    industry: {
      type: String,
      default: 'Information Technology & Software',
    },
    companyLogo: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: 'Pune, Maharashtra / Bengaluru',
    },
    verificationStatus: {
      type: String,
      enum: ['verified', 'pending', 'rejected'],
      default: 'verified',
    },
  },
  {
    timestamps: true,
  }
);

export const CompanyModel =
  mongoose.models.Company ||
  mongoose.model<ICompany>('Company', CompanySchema);
