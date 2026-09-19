import { api } from './api';
import { User, Worker } from '../types';

export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (data: any) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (data: Partial<User>) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  changePassword: async (passwords: { currentPassword: string; newPassword: string }) => {
    const response = await api.put('/auth/password', passwords);
    return response.data;
  },
};

export const workerService = {
  getWorkers: async (params?: any) => {
    const response = await api.get('/workers', { params });
    return response.data;
  },

  getFeaturedWorkers: async () => {
    const response = await api.get('/workers/featured');
    return response.data;
  },

  getWorkerById: async (id: string) => {
    const response = await api.get(`/workers/${id}`);
    return response.data;
  },

  getWorkerDashboard: async () => {
    const response = await api.get('/workers/me/dashboard');
    return response.data;
  },

  updateWorkerProfile: async (data: Partial<Worker>) => {
    const response = await api.put('/workers/me/profile', data);
    return response.data;
  },

  toggleAvailability: async (availability: 'Available' | 'Busy' | 'Offline') => {
    const response = await api.put('/workers/me/availability', { availability });
    return response.data;
  },

  getDigitalVisitingCard: async (workerId: string) => {
    const response = await api.get(`/workers/${workerId}/card`);
    return response.data;
  },
};

export const bookingService = {
  createBooking: async (bookingData: any) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  getCustomerBookings: async () => {
    const response = await api.get('/bookings/my');
    return response.data;
  },

  getWorkerBookings: async () => {
    const response = await api.get('/bookings/worker');
    return response.data;
  },

  getBookingById: async (id: string) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  updateBookingStatus: async (id: string, data: { status: string; notes?: string; paymentStatus?: string }) => {
    const response = await api.put(`/bookings/${id}/status`, data);
    return response.data;
  },
};

export const categoryService = {
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
  getServices: async (category?: string) => {
    const response = await api.get('/services', { params: { category } });
    return response.data;
  },
};

export const reviewService = {
  getWorkerReviews: async (workerId: string) => {
    const response = await api.get(`/reviews/worker/${workerId}`);
    return response.data;
  },
  submitReview: async (data: { bookingId: string; rating: number; comment: string }) => {
    const response = await api.post('/reviews', data);
    return response.data;
  },
};

export const favoriteService = {
  getFavorites: async () => {
    const response = await api.get('/favorites');
    return response.data;
  },
  toggleFavorite: async (workerId: string) => {
    const response = await api.post(`/favorites/${workerId}`);
    return response.data;
  },
};

export const complaintService = {
  submitComplaint: async (data: { title: string; description: string; bookingId?: string; workerId?: string }) => {
    const response = await api.post('/complaints', data);
    return response.data;
  },
  getMyComplaints: async () => {
    const response = await api.get('/complaints/my');
    return response.data;
  },
};

export const customService = {
  submitCustomService: async (data: any) => {
    const response = await api.post('/custom-services', data);
    return response.data;
  },
  getMyCustomServices: async () => {
    const response = await api.get('/custom-services/my');
    return response.data;
  },
};

export const adminService = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
  getAdminStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
  getUsers: async (params?: any) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },
  getAllUsers: async (params?: any) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },
  updateUser: async (id: string, data: any) => {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
  },
  deleteUser: async (id: string) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },
  getWorkers: async (params?: any) => {
    const response = await api.get('/admin/workers', { params });
    return response.data;
  },
  getAllWorkers: async (params?: any) => {
    const response = await api.get('/admin/workers', { params });
    return response.data;
  },
  approveWorker: async (id: string) => {
    const response = await api.put(`/admin/workers/${id}/approve`);
    return response.data;
  },
  rejectWorker: async (id: string, reason?: string) => {
    const response = await api.put(`/admin/workers/${id}/reject`, { reason });
    return response.data;
  },
  suspendWorker: async (id: string) => {
    const response = await api.put(`/admin/workers/${id}/suspend`);
    return response.data;
  },
  activateWorker: async (id: string) => {
    const response = await api.put(`/admin/workers/${id}/activate`);
    return response.data;
  },
  updateWorker: async (id: string, data: any) => {
    const response = await api.put(`/admin/workers/${id}`, data);
    return response.data;
  },
  updateWorkerStatus: async (id: string, data: any) => {
    const response = await api.put(`/admin/workers/${id}`, data);
    return response.data;
  },
  deleteWorker: async (id: string) => {
    const response = await api.delete(`/admin/workers/${id}`);
    return response.data;
  },
  getBookings: async (params?: any) => {
    const response = await api.get('/admin/bookings', { params });
    return response.data;
  },
  getAllBookings: async (params?: any) => {
    const response = await api.get('/admin/bookings', { params });
    return response.data;
  },
  updateBooking: async (id: string, data: any) => {
    const response = await api.put(`/admin/bookings/${id}`, data);
    return response.data;
  },
  getReviews: async () => {
    const response = await api.get('/reviews');
    return response.data;
  },
  deleteReview: async (id: string) => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  },
  getComplaints: async () => {
    const response = await api.get('/complaints');
    return response.data;
  },
  getAllComplaints: async () => {
    const response = await api.get('/complaints');
    return response.data;
  },
  updateComplaint: async (id: string, data: any) => {
    const response = await api.put(`/complaints/${id}`, data);
    return response.data;
  },
  updateComplaintStatus: async (id: string, data: any) => {
    const response = await api.put(`/complaints/${id}`, data);
    return response.data;
  },
  getCustomServices: async () => {
    const response = await api.get('/custom-services');
    return response.data;
  },
  getAllCustomServices: async () => {
    const response = await api.get('/custom-services');
    return response.data;
  },
  updateCustomService: async (id: string, data: any) => {
    const response = await api.put(`/custom-services/${id}`, data);
    return response.data;
  },
  updateCustomServiceStatus: async (id: string, data: any) => {
    const response = await api.put(`/custom-services/${id}`, data);
    return response.data;
  },
  createCategory: async (data: any) => {
    const response = await api.post('/categories', data);
    return response.data;
  },
  updateCategory: async (id: string, data: any) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },
  deleteCategory: async (id: string) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
  createService: async (data: any) => {
    const response = await api.post('/services', data);
    return response.data;
  },
  getAllServices: async () => {
    const response = await api.get('/services');
    return response.data;
  },
  updateService: async (id: string, data: any) => {
    const response = await api.put(`/services/${id}`, data);
    return response.data;
  },
  deleteService: async (id: string) => {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  },
  getAllReviews: async () => {
    const response = await api.get('/reviews');
    return response.data;
  },
};

export const uploadService = {
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
