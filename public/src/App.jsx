import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ActivateAccountPage from './pages/ActivateAccountPage';
import RegistrationFlow from './pages/RegistrationFlow';

// Admin
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import PendingRegistrations from './pages/admin/PendingRegistrations';
import AllMembers from './pages/admin/AllMembers';
import Statistics from './pages/admin/Statistics';
import PaymentManagement from './pages/admin/PaymentManagement';

// Member
import MemberLayout from './components/layout/MemberLayout';
import MemberDashboard from './pages/member/MemberDashboard';
import MemberProfile from './pages/member/MemberProfile';
import RegistrationDetails from './pages/member/RegistrationDetails';
import MembershipCard from './pages/member/MembershipCard';
import MemberNotifications from './pages/member/MemberNotifications';

// Public Pages
import AboutPage from './pages/AboutPage';
import WorkPage from './pages/WorkPage';
import InfoPage from './pages/InfoPage';

// Route Protection
import { ProtectedRoute, PublicRoute, RegistrationRoute } from './components/ProtectedRoute';

import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/work" element={<WorkPage />} />
        <Route path="/info" element={<InfoPage />} />

        {/* Auth Routes - Redirect if already logged in */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/activate/:token" element={<ActivateAccountPage />} />

        {/* Registration Flow - Protected and Sequential */}
        <Route path="/registration/*" element={
          <ProtectedRoute>
            <RegistrationFlow />
          </ProtectedRoute>
        } />

        {/* Admin Routes - Protected */}
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="pending" element={<PendingRegistrations />} />
          <Route path="members" element={<AllMembers />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="payments" element={<PaymentManagement />} />
        </Route>

        {/* Member Routes - Protected */}
        <Route path="/member" element={<ProtectedRoute><MemberLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/member/dashboard" replace />} />
          <Route path="dashboard" element={<MemberDashboard />} />
          <Route path="profile" element={<MemberProfile />} />
          <Route path="registration-details" element={<RegistrationDetails />} />
          <Route path="membership-card" element={<MembershipCard />} />
          <Route path="notifications" element={<MemberNotifications />} />
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
