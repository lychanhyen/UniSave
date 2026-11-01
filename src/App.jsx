import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CampusProvider } from './context/CampusContext';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import SetupPage from './pages/SetupPage';
import NotFoundPage from './pages/NotFoundPage';
import VerificationPendingPage from './pages/VerificationPendingPage';
import MarketplacePage from './pages/marketplace/MarketplacePage';
import PostDetailPage from './pages/marketplace/PostDetailPage';
import CreatePostPage from './pages/marketplace/CreatePostPage';
import GroupDealsPage from './pages/group-deals/GroupDealsPage';
import CreateDealPage from './pages/group-deals/CreateDealPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminStudentsPage from './pages/admin/AdminStudentsPage';
import AdminPostsPage from './pages/admin/AdminPostsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminCampusesPage from './pages/admin/AdminCampusesPage';

function PageLoader() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#f7faf8]">
      <div className="flex flex-col items-center gap-3">
        <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-brand-200 border-t-brand-600" />
        <p className="text-xs font-semibold text-ink-400">Đang kiểm tra phiên đăng nhập…</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return children;
}

function VerifiedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (!user.is_verified) return <VerificationPendingPage />;
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  return children;
}

function FallbackRoute() {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/" replace />;
  return <NotFoundPage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CampusProvider>
          <AppLayout>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route
                path="/login"
                element={
                  <GuestRoute>
                    <LoginPage />
                  </GuestRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <GuestRoute>
                    <RegisterPage />
                  </GuestRoute>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/marketplace"
                element={
                  <ProtectedRoute>
                    <MarketplacePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/marketplace/new"
                element={
                  <VerifiedRoute>
                    <CreatePostPage />
                  </VerifiedRoute>
                }
              />
              <Route
                path="/marketplace/:id"
                element={
                  <ProtectedRoute>
                    <PostDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/deals"
                element={
                  <ProtectedRoute>
                    <GroupDealsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/deals/new"
                element={
                  <VerifiedRoute>
                    <CreateDealPage />
                  </VerifiedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/setup"
                element={
                  <ProtectedRoute>
                    <SetupPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboardPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/students"
                element={
                  <AdminRoute>
                    <AdminStudentsPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/posts"
                element={
                  <AdminRoute>
                    <AdminPostsPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <AdminRoute>
                    <AdminReportsPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/campuses"
                element={
                  <AdminRoute>
                    <AdminCampusesPage />
                  </AdminRoute>
                }
              />

              <Route path="*" element={<FallbackRoute />} />
            </Routes>
          </AppLayout>
        </CampusProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
