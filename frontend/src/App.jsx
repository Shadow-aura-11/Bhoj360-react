import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import AgencyDashboard from './pages/AgencyDashboard';
import AgencyLogin from './pages/AgencyLogin';
import ContactPage from './pages/ContactPage';
import Login from './pages/Login';
import LandingPage from './pages/marketing/LandingPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import TablesManager from './pages/admin/TablesManager';
import ReservationsManager from './pages/admin/ReservationsManager';
import MenuManager from './pages/admin/MenuManager';
import Analytics from './pages/admin/Analytics';
import StaffSettings from './pages/admin/StaffSettings';
import StaffManager from './pages/admin/StaffManager';
import CustomerDirectory from './pages/admin/CustomerDirectory';
import CouponsManager from './pages/admin/CouponsManager';
import MoneyManager from './pages/admin/MoneyManager';
import QRPrintPage from './components/QR/QRPrintPage';
import WaiterDashboard from './pages/waiter/WaiterDashboard';
import CounterDashboard from './pages/counter/CounterDashboard';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import SelfOrder from './pages/customer/SelfOrder';
import CashierDashboard from './pages/cashier/CashierDashboard';

// Marketing Subpages
import AboutPage from './pages/marketing/AboutPage';
import FeaturesPage from './pages/marketing/FeaturesPage';
import ShowcasePage from './pages/marketing/ShowcasePage';
import PricingPage from './pages/marketing/PricingPage';
import CareerPage from './pages/marketing/CareerPage';
import BlogPage from './pages/marketing/BlogPage';
import BlogPostPage from './pages/marketing/BlogPostPage';
import PrivacyPolicyPage from './pages/marketing/PrivacyPolicyPage';
import TermsPage from './pages/marketing/TermsPage';
import RefundPolicyPage from './pages/marketing/RefundPolicyPage';

import './pages/marketing/marketing.css';

// Shared Components
import FloatingWhatsApp from './components/shared/FloatingWhatsApp';

// Agency auth route guard
function AgencyProtectedRoute({ children }) {
  const token = localStorage.getItem('agency_token');
  if (!token) {
    return <Navigate to="/app/login" replace />;
  }
  return children;
}

// Route Guard for staff / admin roles
function ProtectedRoute({ allowedRoles, children }) {
  const { restaurantId } = useParams();
  const sessionStr = sessionStorage.getItem('session');
  
  if (!sessionStr) {
    return <Navigate to={`/r/${restaurantId}/login`} replace />;
  }

  try {
    const session = JSON.parse(sessionStr);
    
    // Check if session belongs to this restaurant
    if (session.restaurantId !== restaurantId) {
      return <Navigate to={`/r/${restaurantId}/login`} replace />;
    }

    // Check if role is allowed
    if (!allowedRoles.includes(session.role)) {
      // If customer role mismatch, go to customer page, else go to login
      if (session.role === 'customer') {
        return <Navigate to={`/r/${restaurantId}/customer`} replace />;
      }
      return <Navigate to={`/r/${restaurantId}/login`} replace />;
    }

    return children;
  } catch {
    return <Navigate to={`/r/${restaurantId}/login`} replace />;
  }
}

export default function App() {
  const location = useLocation();
  const isMarketingRoute = !location.pathname.startsWith('/r/') && !location.pathname.startsWith('/app');

  // Trigger Intersection Observer for element scroll reveal animations on all subpages
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -50px 0px' }
    );

    const timer = setTimeout(() => {
      const elements = document.querySelectorAll('.reveal');
      elements.forEach((el) => observer.observe(el));
    }, 400);

    // Scroll window back to top on page navigation
    window.scrollTo(0, 0);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [location.pathname]);

  return (
    <>
      <Routes>
        {/* SaaS Marketing Portal */}
        <Route path="/" element={<LandingPage />} />

        {/* Marketing Sub-pages */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/showcase" element={<ShowcasePage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/career" element={<CareerPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/cancellation-refund" element={<RefundPolicyPage />} />

        {/* Public Contact Form */}
        <Route path="/contact" element={<ContactPage />} />

        {/* Agency Auth */}
        <Route path="/app/login" element={<AgencyLogin />} />

        {/* Agency Dashboard (protected) */}
        <Route
          path="/app"
          element={
            <AgencyProtectedRoute>
              <AgencyDashboard />
            </AgencyProtectedRoute>
          }
        />


      {/* Auth Route */}
      <Route path="/r/:restaurantId/login" element={<Login />} />

      {/* Admin Dashboard Protected Routes */}
      <Route
        path="/r/:restaurantId/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/r/:restaurantId/admin/tables"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <TablesManager />
          </ProtectedRoute>
        }
      />
      <Route
        path="/r/:restaurantId/admin/reservations"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ReservationsManager />
          </ProtectedRoute>
        }
      />
      <Route
        path="/r/:restaurantId/admin/menu"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <MenuManager />
          </ProtectedRoute>
        }
      />
      <Route
        path="/r/:restaurantId/admin/analytics"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Analytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/r/:restaurantId/admin/print-qr"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <QRPrintPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/r/:restaurantId/admin/settings"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <StaffSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/r/:restaurantId/admin/staff"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <StaffManager />
          </ProtectedRoute>
        }
      />
      <Route
        path="/r/:restaurantId/admin/customers"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <CustomerDirectory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/r/:restaurantId/admin/coupons"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <CouponsManager />
          </ProtectedRoute>
        }
      />
      <Route
        path="/r/:restaurantId/admin/money"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <MoneyManager />
          </ProtectedRoute>
        }
      />

      {/* Waiter Dashboard Protected Route */}
      <Route
        path="/r/:restaurantId/waiter"
        element={
          <ProtectedRoute allowedRoles={['admin', 'waiter']}>
            <WaiterDashboard />
          </ProtectedRoute>
        }
      />

      {/* Counter/Kitchen Dashboard Protected Route */}
      <Route
        path="/r/:restaurantId/counter"
        element={
          <ProtectedRoute allowedRoles={['admin', 'counter']}>
            <CounterDashboard />
          </ProtectedRoute>
        }
      />

      {/* Cashier Dashboard Protected Route */}
      <Route
        path="/r/:restaurantId/cashier"
        element={
          <ProtectedRoute allowedRoles={['admin', 'cashier']}>
            <CashierDashboard />
          </ProtectedRoute>
        }
      />

      {/* Customer Dashboard Seating Guard Route */}
      <Route
        path="/r/:restaurantId/customer"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Self-Ordering Public Landing QR Page */}
      <Route path="/r/:restaurantId/menu" element={<SelfOrder />} />

      {/* Catch-all Fallback Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    {isMarketingRoute && <FloatingWhatsApp />}
    </>
  );
}
