import mongoose, { Schema, Document } from 'mongoose';

export interface IInternship extends Document {
  title: string;
  company: string;
  location: string;
  skills: string[];
  description: string;
  stipend?: string;
  openings?: number;
  workType?: 'Remote' | 'Hybrid' | 'On-site';
  createdAt: Date;
  updatedAt: Date;
}

const InternshipSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Internship title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company cannot exceed 100 characters'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    skills: {
      type: [String],
      required: [true, 'At least one skill is required'],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: 'Skills must contain at least one skill tag',
      },
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    stipend: {
      type: String,
      default: '₹18,000 / month',
      trim: true,
    },
    openings: {
      type: Number,
      default: 1,
      min: [1, 'Must have at least 1 opening'],
    },
    workType: {
      type: String,
      enum: ['Remote', 'Hybrid', 'On-site'],
      default: 'Hybrid',
    },
  },
  {
    timestamps: true,
  }
);

export const InternshipModel =
  mongoose.models.Internship ||
  mongoose.model<IInternship>('Internship', InternshipSchema);
