import fs from 'fs';
import path from 'path';
import { 
  IUser, IWorker, ICategory, IService, IBooking, 
  IReview, IFavorite, IComplaint, ICustomServiceRequest 
} from './types';
import { 
  initialCategories, initialServices, initialUsers, 
  initialWorkers, initialBookings, initialReviews, 
  initialComplaints, initialCustomServices 
} from './seedData';

interface DatabaseSchema {
  users: IUser[];
  workers: IWorker[];
  categories: ICategory[];
  services: IService[];
  bookings: IBooking[];
  reviews: IReview[];
  favorites: IFavorite[];
  complaints: IComplaint[];
  customServices: ICustomServiceRequest[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

class DataStore {
  private data: DatabaseSchema;
  private isInitialized = false;

  constructor() {
    this.data = {
      users: [],
      workers: [],
      categories: [],
      services: [],
      bookings: [],
      reviews: [],
      favorites: [],
      complaints: [],
      customServices: [],
    };
    this.init();
  }

  private init() {
    if (this.isInitialized) return;

    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
      } else {
        this.seedInitialData();
      }
    } catch (err) {
      console.warn('Could not read persistent file, seeding in-memory store:', err);
      this.seedInitialData();
    }

    // Ensure all demo users and workers exist even if file was partially populated
    if (!this.data.users || this.data.users.length === 0) {
      this.seedInitialData();
    }

    this.isInitialized = true;
  }

  private seedInitialData() {
    this.data = {
      users: [...initialUsers],
      workers: [...initialWorkers],
      categories: [...initialCategories],
      services: [...initialServices],
      bookings: [...initialBookings],
      reviews: [...initialReviews],
      favorites: [
        { _id: 'fav-1', customer: 'usr-customer-demo', worker: 'wrk-demo', createdAt: new Date().toISOString() },
        { _id: 'fav-2', customer: 'usr-customer-demo', worker: 'wrk-2', createdAt: new Date().toISOString() },
      ],
      complaints: [...initialComplaints],
      customServices: [...initialCustomServices],
    };
    this.persist();
  }

  private persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database file:', err);
    }
  }

  // --- Users ---
  getUsers() { return this.data.users; }
  getUserById(id: string) { return this.data.users.find(u => u._id === id || u.id === id); }
  getUserByEmail(email: string) { return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase()); }
  createUser(user: IUser) {
    this.data.users.push(user);
    this.persist();
    return user;
  }
  updateUser(id: string, update: Partial<IUser>) {
    const idx = this.data.users.findIndex(u => u._id === id || u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...update, updatedAt: new Date().toISOString() };
    this.persist();
    return this.data.users[idx];
  }
  deleteUser(id: string) {
    const idx = this.data.users.findIndex(u => u._id === id || u.id === id);
    if (idx === -1) return false;
    this.data.users.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- Workers ---
  getWorkers() { return this.data.workers; }
  getWorkerById(id: string) { return this.data.workers.find(w => w._id === id || w.id === id); }
  getWorkerByUserId(userId: string) { return this.data.workers.find(w => w.user === userId || (typeof w.user === 'object' && (w.user as any)._id === userId)); }
  createWorker(worker: IWorker) {
    this.data.workers.push(worker);
    this.persist();
    return worker;
  }
  updateWorker(id: string, update: Partial<IWorker>) {
    const idx = this.data.workers.findIndex(w => w._id === id || w.id === id);
    if (idx === -1) return null;
    this.data.workers[idx] = { ...this.data.workers[idx], ...update, updatedAt: new Date().toISOString() };
    this.persist();
    return this.data.workers[idx];
  }
  deleteWorker(id: string) {
    const idx = this.data.workers.findIndex(w => w._id === id || w.id === id);
    if (idx === -1) return false;
    this.data.workers.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- Categories ---
  getCategories() { return this.data.categories; }
  getCategoryById(id: string) { return this.data.categories.find(c => c._id === id || c.id === id); }
  createCategory(cat: ICategory) {
    this.data.categories.push(cat);
    this.persist();
    return cat;
  }
  updateCategory(id: string, update: Partial<ICategory>) {
    const idx = this.data.categories.findIndex(c => c._id === id || c.id === id);
    if (idx === -1) return null;
    this.data.categories[idx] = { ...this.data.categories[idx], ...update };
    this.persist();
    return this.data.categories[idx];
  }
  deleteCategory(id: string) {
    const idx = this.data.categories.findIndex(c => c._id === id || c.id === id);
    if (idx === -1) return false;
    this.data.categories.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- Services ---
  getServices() { return this.data.services; }
  getServiceById(id: string) { return this.data.services.find(s => s._id === id || s.id === id); }
  createService(service: IService) {
    this.data.services.push(service);
    this.persist();
    return service;
  }
  updateService(id: string, update: Partial<IService>) {
    const idx = this.data.services.findIndex(s => s._id === id || s.id === id);
    if (idx === -1) return null;
    this.data.services[idx] = { ...this.data.services[idx], ...update };
    this.persist();
    return this.data.services[idx];
  }
  deleteService(id: string) {
    const idx = this.data.services.findIndex(s => s._id === id || s.id === id);
    if (idx === -1) return false;
    this.data.services.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- Bookings ---
  getBookings() { return this.data.bookings; }
  getBookingById(id: string) { return this.data.bookings.find(b => b._id === id || b.id === id); }
  createBooking(booking: IBooking) {
    this.data.bookings.unshift(booking);
    this.persist();
    return booking;
  }
  updateBooking(id: string, update: Partial<IBooking>) {
    const idx = this.data.bookings.findIndex(b => b._id === id || b.id === id);
    if (idx === -1) return null;
    this.data.bookings[idx] = { ...this.data.bookings[idx], ...update, updatedAt: new Date().toISOString() };
    this.persist();
    return this.data.bookings[idx];
  }

  // --- Reviews ---
  getReviews() { return this.data.reviews; }
  getReviewsByWorkerId(workerId: string) {
    return this.data.reviews.filter(r => {
      const wId = typeof r.worker === 'string' ? r.worker : (r.worker as any)._id;
      return wId === workerId;
    });
  }
  createReview(review: IReview) {
    this.data.reviews.unshift(review);
    
    // Update worker rating and total reviews
    const workerId = typeof review.worker === 'string' ? review.worker : (review.worker as any)._id;
    const workerReviews = this.getReviewsByWorkerId(workerId);
    const avg = workerReviews.length > 0 
      ? Number((workerReviews.reduce((sum, r) => sum + r.rating, 0) / workerReviews.length).toFixed(1))
      : review.rating;
    
    this.updateWorker(workerId, {
      rating: avg,
      totalReviews: workerReviews.length
    });

    this.persist();
    return review;
  }
  deleteReview(id: string) {
    const idx = this.data.reviews.findIndex(r => r._id === id || r.id === id);
    if (idx === -1) return false;
    const deleted = this.data.reviews.splice(idx, 1)[0];
    
    // Recalculate worker rating
    const workerId = typeof deleted.worker === 'string' ? deleted.worker : (deleted.worker as any)._id;
    const workerReviews = this.getReviewsByWorkerId(workerId);
    const avg = workerReviews.length > 0 
      ? Number((workerReviews.reduce((sum, r) => sum + r.rating, 0) / workerReviews.length).toFixed(1))
      : 0;
    this.updateWorker(workerId, {
      rating: avg,
      totalReviews: workerReviews.length
    });

    this.persist();
    return true;
  }

  // --- Favorites ---
  getFavorites(customerId: string) {
    return this.data.favorites.filter(f => f.customer === customerId);
  }
  toggleFavorite(customerId: string, workerId: string): { isFavorite: boolean } {
    const idx = this.data.favorites.findIndex(f => f.customer === customerId && f.worker === workerId);
    if (idx !== -1) {
      this.data.favorites.splice(idx, 1);
      this.persist();
      return { isFavorite: false };
    } else {
      this.data.favorites.push({
        _id: 'fav-' + Date.now(),
        customer: customerId,
        worker: workerId,
        createdAt: new Date().toISOString(),
      });
      this.persist();
      return { isFavorite: true };
    }
  }

  // --- Complaints ---
  getComplaints() { return this.data.complaints; }
  getComplaintById(id: string) { return this.data.complaints.find(c => c._id === id || c.id === id); }
  createComplaint(complaint: IComplaint) {
    this.data.complaints.unshift(complaint);
    this.persist();
    return complaint;
  }
  updateComplaint(id: string, update: Partial<IComplaint>) {
    const idx = this.data.complaints.findIndex(c => c._id === id || c.id === id);
    if (idx === -1) return null;
    this.data.complaints[idx] = { ...this.data.complaints[idx], ...update, updatedAt: new Date().toISOString() };
    this.persist();
    return this.data.complaints[idx];
  }

  // --- Custom Services ---
  getCustomServices() { return this.data.customServices; }
  getCustomServiceById(id: string) { return this.data.customServices.find(cs => cs._id === id || cs.id === id); }
  createCustomService(cs: ICustomServiceRequest) {
    this.data.customServices.unshift(cs);
    this.persist();
    return cs;
  }
  updateCustomService(id: string, update: Partial<ICustomServiceRequest>) {
    const idx = this.data.customServices.findIndex(cs => cs._id === id || cs.id === id);
    if (idx === -1) return null;
    this.data.customServices[idx] = { ...this.data.customServices[idx], ...update, updatedAt: new Date().toISOString() };
    this.persist();
    return this.data.customServices[idx];
  }

  // Populate helper to enrich objects with user/worker details
  populateBooking(b: IBooking): any {
    const customer = typeof b.customer === 'string' ? this.getUserById(b.customer) : b.customer;
    const worker = typeof b.worker === 'string' ? this.getWorkerById(b.worker) : b.worker;
    return {
      ...b,
      customer: customer ? { _id: customer._id, name: customer.name, email: customer.email, phone: customer.phone, profileImage: customer.profileImage } : b.customer,
      worker: worker ? { _id: worker._id, name: worker.name, profession: worker.profession, phone: worker.phone, profileImage: worker.profileImage, rating: worker.rating } : b.worker,
    };
  }

  populateReview(r: IReview): any {
    const customer = typeof r.customer === 'string' ? this.getUserById(r.customer) : r.customer;
    const worker = typeof r.worker === 'string' ? this.getWorkerById(r.worker) : r.worker;
    return {
      ...r,
      customer: customer ? { _id: customer._id, name: customer.name, profileImage: customer.profileImage } : r.customer,
      worker: worker ? { _id: worker._id, name: worker.name, profession: worker.profession } : r.worker,
    };
  }

  populateComplaint(c: IComplaint): any {
    const customer = typeof c.customer === 'string' ? this.getUserById(c.customer) : c.customer;
    const worker = c.worker ? (typeof c.worker === 'string' ? this.getWorkerById(c.worker) : c.worker) : undefined;
    return {
      ...c,
      customer: customer ? { _id: customer._id, name: customer.name, email: customer.email, phone: customer.phone } : c.customer,
      worker: worker ? { _id: (worker as any)._id, name: (worker as any).name, profession: (worker as any).profession } : c.worker,
    };
  }

  populateCustomService(cs: ICustomServiceRequest): any {
    const customer = typeof cs.customer === 'string' ? this.getUserById(cs.customer) : cs.customer;
    const customerData = customer ? { _id: customer._id, name: customer.name, email: customer.email, phone: customer.phone } : cs.customer;
    return {
      ...cs,
      customer: customerData,
      user: customerData,
    };
  }
}

export const db = new DataStore();
