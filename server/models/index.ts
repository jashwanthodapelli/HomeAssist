import mongoose, { Schema, Document } from 'mongoose';

export interface ICategoryDoc extends Document {
  name: string;
  description: string;
  icon: string;
  image: string;
  status: 'Active' | 'Inactive';
}

const CategorySchema = new Schema<ICategoryDoc>({
  name: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  icon: { type: String, default: 'Wrench' },
  image: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
}, { timestamps: true });

export const CategoryModel = mongoose.models.Category || mongoose.model<ICategoryDoc>('Category', CategorySchema);

export interface IServiceDoc extends Document {
  name: string;
  category: string;
  description: string;
  basePrice: number;
  status: 'Active' | 'Inactive';
}

const ServiceSchema = new Schema<IServiceDoc>({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, default: '' },
  basePrice: { type: Number, default: 299 },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
}, { timestamps: true });

export const ServiceModel = mongoose.models.Service || mongoose.model<IServiceDoc>('Service', ServiceSchema);

export interface IBookingDoc extends Document {
  bookingNumber: string;
  customer: mongoose.Types.ObjectId;
  worker: mongoose.Types.ObjectId;
  service: string;
  date: string;
  time: string;
  description: string;
  image?: string;
  location: {
    address: string;
    city: string;
    area: string;
    lat?: number;
    lng?: number;
  };
  bookingStatus: 'Pending' | 'Accepted' | 'Rejected' | 'Completed' | 'Cancelled';
  paymentStatus: 'Pending' | 'Paid' | 'COD';
  paymentMethod: 'COD' | 'Mock UPI';
  amount?: number;
}

const BookingSchema = new Schema<IBookingDoc>({
  bookingNumber: { type: String, required: true, unique: true },
  customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  worker: { type: Schema.Types.ObjectId, ref: 'Worker', required: true },
  service: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  location: {
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    area: { type: String, default: '' },
    lat: { type: Number },
    lng: { type: Number }
  },
  bookingStatus: { type: String, enum: ['Pending', 'Accepted', 'Rejected', 'Completed', 'Cancelled'], default: 'Pending' },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'COD'], default: 'Pending' },
  paymentMethod: { type: String, enum: ['COD', 'Mock UPI'], default: 'COD' },
  amount: { type: Number, default: 0 }
}, { timestamps: true });

export const BookingModel = mongoose.models.Booking || mongoose.model<IBookingDoc>('Booking', BookingSchema);

export interface IReviewDoc extends Document {
  customer: mongoose.Types.ObjectId;
  worker: mongoose.Types.ObjectId;
  booking: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
}

const ReviewSchema = new Schema<IReviewDoc>({
  customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  worker: { type: Schema.Types.ObjectId, ref: 'Worker', required: true },
  booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true }
}, { timestamps: true });

export const ReviewModel = mongoose.models.Review || mongoose.model<IReviewDoc>('Review', ReviewSchema);

export interface IComplaintDoc extends Document {
  customer: mongoose.Types.ObjectId;
  worker?: mongoose.Types.ObjectId;
  booking?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  status: 'Open' | 'Under Review' | 'Resolved' | 'Rejected';
  adminResponse?: string;
}

const ComplaintSchema = new Schema<IComplaintDoc>({
  customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  worker: { type: Schema.Types.ObjectId, ref: 'Worker' },
  booking: { type: Schema.Types.ObjectId, ref: 'Booking' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['Open', 'Under Review', 'Resolved', 'Rejected'], default: 'Open' },
  adminResponse: { type: String, default: '' }
}, { timestamps: true });

export const ComplaintModel = mongoose.models.Complaint || mongoose.model<IComplaintDoc>('Complaint', ComplaintSchema);

export interface ICustomServiceDoc extends Document {
  customer: mongoose.Types.ObjectId;
  title: string;
  description: string;
  image?: string;
  preferredDate: string;
  preferredTime: string;
  location: {
    address: string;
    city: string;
    area: string;
  };
  status: 'Pending' | 'Approved' | 'Rejected' | 'Converted';
  adminNotes?: string;
}

const CustomServiceSchema = new Schema<ICustomServiceDoc>({
  customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, default: '' },
  preferredDate: { type: String, required: true },
  preferredTime: { type: String, required: true },
  location: {
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    area: { type: String, default: '' }
  },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Converted'], default: 'Pending' },
  adminNotes: { type: String, default: '' }
}, { timestamps: true });

export const CustomServiceModel = mongoose.models.CustomService || mongoose.model<ICustomServiceDoc>('CustomService', CustomServiceSchema);
