import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Route Guards & Layouts
import { ProtectedRoute, RoleRoute } from './routes/ProtectedRoute';
import { PublicLayout } from './layouts/PublicLayout';
import { CustomerLayout } from './layouts/CustomerLayout';
import { WorkerLayout } from './layouts/WorkerLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { ServicesPage } from './pages/public/ServicesPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { FAQPage } from './pages/public/FAQPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';

// Customer Pages
import { SearchWorkersPage } from './pages/customer/SearchWorkersPage';
import { WorkerProfilePage } from './pages/customer/WorkerProfilePage';
import { BookingPage } from './pages/customer/BookingPage';
import { BookingSuccessPage } from './pages/customer/BookingSuccessPage';
import { MyBookingsPage } from './pages/customer/MyBookingsPage';
import { FavoritesPage } from './pages/customer/FavoritesPage';
import { CustomerComplaintsPage } from './pages/customer/CustomerComplaintsPage';
import { CustomServiceRequestPage } from './pages/customer/CustomServiceRequestPage';
import { CustomerProfilePage } from './pages/customer/CustomerProfilePage';

// Worker Pages
import { WorkerDashboardPage } from './pages/worker/WorkerDashboardPage';
import { WorkerBookingsPage } from './pages/worker/WorkerBookingsPage';
import { WorkerProfileEditPage } from './pages/worker/WorkerProfileEditPage';
import { WorkerVisitingCardPage } from './pages/worker/WorkerVisitingCardPage';
import { WorkerReviewsPage } from './pages/worker/WorkerReviewsPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminWorkersPage } from './pages/admin/AdminWorkersPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminBookingsPage } from './pages/admin/AdminBookingsPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminComplaintsPage } from './pages/admin/AdminComplaintsPage';
import { AdminCustomServicesPage } from './pages/admin/AdminCustomServicesPage';
import { AdminWorkerApprovalsPage } from './pages/admin/AdminWorkerApprovalsPage';
import { AdminServicesPage } from './pages/admin/AdminServicesPage';
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

export default function App() {
  return (
    <Router>
      <NotificationProvider>
        <AuthProvider>
          <Routes>
            {/* PUBLIC ROUTES (Accessible to guests and users) */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/search" element={<SearchWorkersPage />} />
              <Route path="/worker/:id" element={<WorkerProfilePage />} />
              <Route path="/request-custom" element={<CustomServiceRequestPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/booking-success/:id" element={<BookingSuccessPage />} />
            </Route>

            {/* CUSTOMER PROTECTED ROUTES */}
            <Route
              element={
                <ProtectedRoute>
                  <CustomerLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/book/:workerId" element={<BookingPage />} />
              <Route path="/bookings" element={<MyBookingsPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/complaints" element={<CustomerComplaintsPage />} />
              <Route path="/custom-requests" element={<CustomServiceRequestPage />} />
              <Route path="/profile" element={<CustomerProfilePage />} />
            </Route>

            {/* WORKER PROTECTED ROUTES */}
            <Route
              path="/worker"
              element={
                <RoleRoute allowedRoles={['worker']}>
                  <WorkerLayout />
                </RoleRoute>
              }
            >
              <Route index element={<Navigate to="/worker/dashboard" replace />} />
              <Route path="dashboard" element={<WorkerDashboardPage />} />
              <Route path="bookings" element={<WorkerBookingsPage />} />
              <Route path="profile" element={<WorkerProfileEditPage />} />
              <Route path="visiting-card" element={<WorkerVisitingCardPage />} />
              <Route path="reviews" element={<WorkerReviewsPage />} />
            </Route>

            {/* ADMIN PROTECTED ROUTES */}
            <Route
              path="/admin"
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <AdminLayout />
                </RoleRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="workers" element={<AdminWorkersPage />} />
              <Route path="worker-approvals" element={<AdminWorkerApprovalsPage />} />
              <Route path="services" element={<AdminServicesPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="bookings" element={<AdminBookingsPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="reviews" element={<AdminReviewsPage />} />
              <Route path="complaints" element={<AdminComplaintsPage />} />
              <Route path="custom-services" element={<AdminCustomServicesPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>

            {/* CATCH-ALL REDIRECT */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </NotificationProvider>
    </Router>
  );
}
