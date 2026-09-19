export type UserRole = 'user' | 'worker' | 'admin';
export type WorkerStatus = 'Pending' | 'Approved' | 'Rejected' | 'Suspended';
export type BookingStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Completed' | 'Cancelled';
export type PaymentStatus = 'Pending' | 'Paid' | 'COD';
export type ComplaintStatus = 'Open' | 'Under Review' | 'Resolved' | 'Rejected';
export type CustomServiceStatus = 'Pending' | 'Approved' | 'Rejected' | 'Converted';

export interface IUser {
  _id: string;
  id?: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: UserRole;
  profileImage?: string;
  address?: string;
  city?: string;
  area?: string;
  bio?: string;
  status: 'Active' | 'Disabled';
  createdAt: string;
  updatedAt: string;
}

export interface IWorker {
  _id: string;
  id?: string;
  user: string | IUser;
  name?: string;
  email?: string;
  phone?: string;
  profession: string;
  services: string[];
  experience: number; // in years
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
  status: WorkerStatus;
  rejectionReason?: string;
  profileImage?: string;
  hourlyRate?: number;
  joinedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICategory {
  _id: string;
  id?: string;
  name: string;
  description: string;
  icon: string;
  image: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface IService {
  _id: string;
  id?: string;
  name: string;
  category: string; // category name or id
  description: string;
  basePrice: number;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface IBooking {
  _id: string;
  id?: string;
  bookingNumber: string;
  customer: string | IUser;
  worker: string | IWorker;
  service: string;
  customServiceTitle?: string;
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
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: 'COD' | 'Mock UPI';
  amount?: number;
  customerNotes?: string;
  workerNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IReview {
  _id: string;
  id?: string;
  customer: string | IUser;
  worker: string | IWorker;
  booking: string | IBooking;
  rating: number; // 1 - 5
  comment: string;
  createdAt: string;
}

export interface IFavorite {
  _id: string;
  id?: string;
  customer: string;
  worker: string;
  createdAt: string;
}

export interface IComplaint {
  _id: string;
  id?: string;
  customer: string | IUser;
  worker?: string | IWorker;
  booking?: string | IBooking;
  title: string;
  description: string;
  status: ComplaintStatus;
  adminResponse?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICustomServiceRequest {
  _id: string;
  id?: string;
  customer: string | IUser;
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
  status: CustomServiceStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}
