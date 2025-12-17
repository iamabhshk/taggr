import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Box } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { trackPageView } from '@/utils/analytics';

// Pages
import LoginPage from '@/pages/Login';
import SignupPage from '@/pages/Signup';
import DashboardPage from '@/pages/Dashboard';
import LabelsPage from '@/pages/Labels';
import ProfilePage from '@/pages/Profile';
import CreateLabelPage from '@/pages/CreateLabel';
import EditLabelPage from '@/pages/EditLabel';
import SettingsPage from '@/pages/Settings';
import TokensPage from '@/pages/Tokens';
import WorkspacesPage from '@/pages/Workspaces';
import NotFoundPage from '@/pages/NotFound';

// Components
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LoadingScreen from '@/components/common/LoadingScreen';
import ErrorBoundary from '@/components/ErrorBoundary';

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
    </Box>
    </ErrorBoundary>
  );
}

export default App;
