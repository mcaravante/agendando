import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PageLoading } from './components/common/Loading';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { EventTypes } from './pages/EventTypes';
import { Availability } from './pages/Availability';
import { Profile } from './pages/Profile';
import { Bookings } from './pages/Bookings';
import { PublicProfile } from './pages/PublicProfile';
import { BookingPage } from './pages/BookingPage';
import { CancelBooking } from './pages/CancelBooking';
import { Integrations } from './pages/Integrations';
import { Workflows } from './pages/Workflows';
import { WorkflowEditor } from './pages/WorkflowEditor';
import { Contacts } from './pages/Contacts';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/cancel/:token" element={<CancelBooking />} />

      {/* Protected routes with DashboardLayout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/event-types"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <EventTypes />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/availability"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Availability />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Profile />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Bookings />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/contacts"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Contacts />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/integrations"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Integrations />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/workflows"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Workflows />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/workflows/new"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <WorkflowEditor />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/workflows/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <WorkflowEditor />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Public booking routes - must be last */}
      <Route path="/:username" element={<PublicProfile />} />
      <Route path="/:username/:eventSlug" element={<BookingPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <AppRoutes />
            <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
