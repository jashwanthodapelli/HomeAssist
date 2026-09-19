import mongoose, { Schema, Document } from 'mongoose';

export interface IUserDoc extends Document {
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: 'user' | 'worker' | 'admin';
  profileImage?: string;
  address?: string;
  city?: string;
  area?: string;
  bio?: string;
  status: 'Active' | 'Disabled';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDoc>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'worker', 'admin'], default: 'user' },
  profileImage: { type: String, default: '' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  area: { type: String, default: '' },
  bio: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'Disabled'], default: 'Active' },
}, { timestamps: true });

export const UserModel = mongoose.models.User || mongoose.model<IUserDoc>('User', UserSchema);
