import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { MasterDataProvider, useMasterData } from './context/MasterDataContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilDesaPage from './pages/ProfilDesaPage';
import CaraKerjaPage from './pages/CaraKerjaPage';
import CreateReportPage from './pages/CreateReportPage';
import UserDashboardPage from './pages/UserDashboardPage';
import UserReportDetailPage from './pages/UserReportDetailPage';
import AdminDashboardLayout from './pages/AdminDashboardLayout';
import ChangePasswordPage from './pages/ChangePasswordPage';
import LoadingOverlay from './components/LoadingOverlay';
import ScrollToTop from './components/ScrollToTop';

// Protected route wrapper for Regular Users
function RequireUser({ children }) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingOverlay message="Memuat Sesi Pengguna..." backdrop="blank" />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// Protected route wrapper for Admin Users
function RequireAdmin({ children }) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingOverlay message="Memuat Dashboard Admin..." backdrop="blank" />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/reports" replace />;
  }

  return children;
}

// Public layout wrapper with Navbar & Footer
function PublicLayout({ children }) {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  if (user && isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 font-sans text-slate-900">
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className={`flex-1 flex flex-col ${isHomePage ? '' : 'pt-16'}`}>{children}</main>
      </div>
      <Footer />
    </div>
  );
}

function MainRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route
        path="/"
        element={
          <PublicLayout>
            <LandingPage />
          </PublicLayout>
        }
      />
      <Route
        path="/login"
        element={
          <PublicLayout>
            <LoginPage />
          </PublicLayout>
        }
      />
      <Route
        path="/register"
        element={
          <PublicLayout>
            <RegisterPage />
          </PublicLayout>
        }
      />
      <Route
        path="/profil-desa"
        element={
          <PublicLayout>
            <ProfilDesaPage />
          </PublicLayout>
        }
      />
      <Route
        path="/profil-desa/:section"
        element={
          <PublicLayout>
            <ProfilDesaPage />
          </PublicLayout>
        }
      />
      <Route
        path="/cara-kerja"
        element={
          <PublicLayout>
            <CaraKerjaPage />
          </PublicLayout>
        }
      />

      {/* User Pages */}
      <Route
        path="/reports"
        element={
          <RequireUser>
            <PublicLayout>
              <UserDashboardPage />
            </PublicLayout>
          </RequireUser>
        }
      />
      <Route
        path="/reports/create"
        element={
          <RequireUser>
            <PublicLayout>
              <CreateReportPage />
            </PublicLayout>
          </RequireUser>
        }
      />
      <Route
        path="/reports/:id"
        element={
          <RequireUser>
            <PublicLayout>
              <UserReportDetailPage />
            </PublicLayout>
          </RequireUser>
        }
      />
      <Route
        path="/change-password"
        element={
          <RequireUser>
            <PublicLayout>
              <ChangePasswordPage />
            </PublicLayout>
          </RequireUser>
        }
      />

      {/* Admin Distinct Routes */}
      <Route
        path="/dashboard"
        element={
          <RequireAdmin>
            <AdminDashboardLayout />
          </RequireAdmin>
        }
      />
      <Route
        path="/master-data/change-password"
        element={
          <RequireAdmin>
            <AdminDashboardLayout />
          </RequireAdmin>
        }
      />
      <Route
        path="/master-data/users"
        element={
          <RequireAdmin>
            <AdminDashboardLayout />
          </RequireAdmin>
        }
      />
      <Route
        path="/master-data/desa"
        element={
          <RequireAdmin>
            <AdminDashboardLayout />
          </RequireAdmin>
        }
      />
      <Route
        path="/master-data/desa/:section"
        element={
          <RequireAdmin>
            <AdminDashboardLayout />
          </RequireAdmin>
        }
      />
      <Route
        path="/master-data/kepala-desa"
        element={
          <RequireAdmin>
            <AdminDashboardLayout />
          </RequireAdmin>
        }
      />
      <Route
        path="/master-data/visi-misi"
        element={
          <RequireAdmin>
            <AdminDashboardLayout />
          </RequireAdmin>
        }
      />
      <Route
        path="/master-data/geografis"
        element={
          <RequireAdmin>
            <AdminDashboardLayout />
          </RequireAdmin>
        }
      />
      <Route
        path="/master-data/office-info"
        element={
          <RequireAdmin>
            <AdminDashboardLayout />
          </RequireAdmin>
        }
      />
      <Route
        path="/master-data/desa/office-info"
        element={
          <RequireAdmin>
            <AdminDashboardLayout />
          </RequireAdmin>
        }
      />
      <Route
        path="/master-data/app-settings"
        element={
          <RequireAdmin>
            <AdminDashboardLayout />
          </RequireAdmin>
        }
      />
      <Route
        path="/laporan"
        element={
          <RequireAdmin>
            <AdminDashboardLayout />
          </RequireAdmin>
        }
      />
      <Route
        path="/laporan/:id"
        element={
          <RequireAdmin>
            <AdminDashboardLayout />
          </RequireAdmin>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function AppContent() {
  const { loading: authLoading } = useAuth();
  const { loading: masterLoading } = useMasterData();

  if (authLoading || masterLoading) {
    return <LoadingOverlay message="Memuat Aplikasi Lapor Pak!..." backdrop="blank" />;
  }

  return <MainRoutes />;
}

export default function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
    });
    window.lenisInstance = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      delete window.lenisInstance;
      lenis.destroy();
    };
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <MasterDataProvider>
        <AuthProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </AuthProvider>
      </MasterDataProvider>
    </BrowserRouter>
  );
}
