import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Layout } from "./components/layout/Layout";
import { ProtectedRouteWithRole } from "@/components/auth/ProtectedRouteWithRole";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Students from "./pages/Students";
import Registrations from "./pages/Registrations";
import Results from "./pages/Results";
import Lectures from "./pages/Lecturers";
import NotFound from "./pages/NotFound";
import Lecturers from "./pages/Lecturers";
import AddResults from "./pages/AddResults";

const queryClient = new QueryClient();

// Role-based access control configuration
const ROUTE_PERMISSIONS = {
  // Student routes
  student: ['/dashboard', '/courses', '/results'],
  // Lecturer routes (students routes + additional ones)
  lecturer: ['/dashboard', '/courses', '/results', '/students', '/registrations'],
  // Admin has access to all routes
  admin: ['*']
};

// Check if user has access to a specific path
const hasAccess = (userRole: string, path: string): boolean => {
  if (!userRole) return false;

  const allowedPaths = ROUTE_PERMISSIONS[userRole as keyof typeof ROUTE_PERMISSIONS] || [];

  // If user has access to all routes
  if (allowedPaths.includes('*')) return true;

  // Check if the path starts with any of the allowed paths
  return allowedPaths.some(allowedPath =>
    path === allowedPath || path.startsWith(`${allowedPath}/`)
  );
};

// Protected Route component with role-based access
const ProtectedRoute = ({ children, path = '' }: { children: React.ReactNode, path?: string }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/welcome" replace />;
  }

  // Check if user has access to the requested path
  if (path && !hasAccess(user.role, path)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Main App Routes component that uses useAuth
const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/" element={<Navigate to="/welcome" replace />} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute path="/dashboard">
          <Layout><Dashboard /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/students" element={
        <ProtectedRoute path="/students">
          <Layout><Students /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/lecturers" element={
        <ProtectedRoute path="/lecturers">
          <Layout><Lecturers /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/registrations" element={
        <ProtectedRoute path="/registrations">
          <Layout><Registrations /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/courses" element={
        <ProtectedRoute path="/courses">
          {user?.role === 'student' ? (
            <Layout><Courses /></Layout>
          ) : (
            <Layout><Registrations /></Layout>
          )}
        </ProtectedRoute>
      } />
      <Route path="/results" element={
        <ProtectedRoute path="/results">
          {user?.role === 'lecturer' || user?.role === 'admin' ? (
            <Layout><AddResults /></Layout>
          ) : (
            <Layout><Results /></Layout>
          )}
        </ProtectedRoute>
      } />

      {/* Other protected routes */}
      <Route path="/schedule" element={
        <ProtectedRoute path="/schedule">
          <Layout><div className="p-6"><h1 className="text-2xl font-bold">Class Schedule</h1><p>Interactive class schedule coming soon...</p></div></Layout>
        </ProtectedRoute>
      } />


      {/* 404 - Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// Main App component
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
