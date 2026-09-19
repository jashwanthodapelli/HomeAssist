import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkerDoc extends Document {
  user: mongoose.Types.ObjectId;
  profession: string;
  services: string[];
  experience: number;
  skills: string[];
  about: string;
  serviceArea: string;
  city: string;
  address?: string;
  location?: {
    lat: number;
    lng: number;
    addressText?: string;
  };
  availability: 'Available' | 'Busy' | 'Offline';
  rating: number;
  totalReviews: number;
  completedJobs: number;
  verificationStatus: 'Verified' | 'Unverified';
  status: 'Pending' | 'Approved' | 'Rejected' | 'Suspended';
  profileImage?: string;
  hourlyRate?: number;
  createdAt: Date;
  updatedAt: Date;
}

const WorkerSchema = new Schema<IWorkerDoc>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  profession: { type: String, required: true },
  services: [{ type: String }],
  experience: { type: Number, default: 0 },
  skills: [{ type: String }],
  about: { type: String, default: '' },
  serviceArea: { type: String, default: '' },
  city: { type: String, default: '' },
  address: { type: String, default: '' },
  location: {
    lat: { type: Number },
    lng: { type: Number },
    addressText: { type: String }
  },
  availability: { type: String, enum: ['Available', 'Busy', 'Offline'], default: 'Available' },
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  completedJobs: { type: Number, default: 0 },
  verificationStatus: { type: String, enum: ['Verified', 'Unverified'], default: 'Unverified' },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Suspended'], default: 'Pending' },
  profileImage: { type: String, default: '' },
  hourlyRate: { type: Number, default: 300 }
}, { timestamps: true });

export const WorkerModel = mongoose.models.Worker || mongoose.model<IWorkerDoc>('Worker', WorkerSchema);
