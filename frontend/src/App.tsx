import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { trackPageView } from '@/utils/analytics';

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('@/pages/Login'));
const SignupPage = lazy(() => import('@/pages/Signup'));
const DashboardPage = lazy(() => import('@/pages/Dashboard'));
const LabelsPage = lazy(() => import('@/pages/Labels'));
const ProfilePage = lazy(() => import('@/pages/Profile'));
const CreateLabelPage = lazy(() => import('@/pages/CreateLabel'));
const EditLabelPage = lazy(() => import('@/pages/EditLabel'));
const SettingsPage = lazy(() => import('@/pages/Settings'));
const TokensPage = lazy(() => import('@/pages/Tokens'));
const WorkspacesPage = lazy(() => import('@/pages/Workspaces'));
const NotFoundPage = lazy(() => import('@/pages/NotFound'));

// Components (keep non-lazy as they're used immediately)
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LoadingScreen from '@/components/common/LoadingScreen';
import ErrorBoundary from '@/components/ErrorBoundary';

// Loading fallback component for lazy-loaded pages
const PageLoader = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '50vh',
    }}
    role="status"
    aria-label="Loading page"
  >
    <CircularProgress aria-hidden="true" />
  </Box>
);

function App() {
  const { isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Track page views
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <Box sx={{ minHeight: '100vh' }}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes */}
            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
            />
            <Route
              path="/signup"
              element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignupPage />}
            />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/labels"
              element={
                <ProtectedRoute>
                  <LabelsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/labels/new"
              element={
                <ProtectedRoute>
                  <CreateLabelPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/labels/:id/edit"
              element={
                <ProtectedRoute>
                  <EditLabelPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tokens"
              element={
                <ProtectedRoute>
                  <TokensPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workspaces"
              element={
                <ProtectedRoute>
                  <WorkspacesPage />
                </ProtectedRoute>
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

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </Box>
    </ErrorBoundary>
  );
}

export default App;
