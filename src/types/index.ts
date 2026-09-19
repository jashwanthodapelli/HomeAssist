export type UserRole = 'user' | 'worker' | 'admin';
export type WorkerStatus = 'Pending' | 'Approved' | 'Rejected' | 'Suspended';
export type BookingStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Completed' | 'Cancelled';
export type PaymentStatus = 'Pending' | 'Paid' | 'COD';
export type ComplaintStatus = 'Open' | 'Under Review' | 'Resolved' | 'Rejected';
export type CustomServiceStatus = 'Pending' | 'Approved' | 'Rejected' | 'Converted';

export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  profileImage?: string;
  address?: string;
  city?: string;
  area?: string;
  bio?: string;
  status: 'Active' | 'Disabled';
  createdAt: string;
}

export interface Worker {
  _id: string;
  id?: string;
  user?: string | User;
  name: string;
  email?: string;
  phone?: string;
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
  status: WorkerStatus;
  rejectionReason?: string;
  profileImage?: string;
  hourlyRate?: number;
  joinedDate?: string;
  createdAt: string;
  isFavorite?: boolean;
  reviews?: Review[];
}

export interface Category {
  _id: string;
  name: string;
  description: string;
  icon: string;
  image?: string;
  status?: 'Active' | 'Inactive';
  isActive?: boolean;
  workerCount?: number;
  createdAt?: string;
}

export interface Service {
  _id: string;
  name: string;
  category: string;
  description: string;
  basePrice: number;
  status: 'Active' | 'Inactive';
  availableWorkers?: number;
}

export interface Booking {
  _id: string;
  bookingNumber: string;
  customer: string | User;
  worker: string | Worker;
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
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: 'COD' | 'Mock UPI';
  amount?: number;
  customerNotes?: string;
  workerNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  customer: string | User;
  worker: string | Worker;
  booking: string | Booking;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Complaint {
  _id: string;
  customer?: string | User;
  user?: string | User;
  worker?: string | Worker;
  booking?: string | Booking;
  title: string;
  description: string;
  status: ComplaintStatus;
  adminResponse?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomServiceRequest {
  _id: string;
  customer?: string | User;
  user?: string | User;
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
