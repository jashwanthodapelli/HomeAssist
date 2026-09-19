import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useAuth } from '../context/AuthContext';

export const PublicLayout: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // If authenticated as admin, do NOT show the customer/public interface.
  // Redirect immediately to the Admin Panel.
  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // If authenticated as worker, do NOT show the customer/public interface.
  // Redirect immediately to the Worker Portal.
  if (isAuthenticated && user?.role === 'worker') {
    return <Navigate to="/worker/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
