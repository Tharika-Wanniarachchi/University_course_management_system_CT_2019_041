import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteWithRoleProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRouteWithRole = ({ 
  children, 
  allowedRoles = [] 
}: ProtectedRouteWithRoleProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/welcome" replace />;
  }

  // If no specific roles are provided, allow access
  if (allowedRoles.length === 0 || allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }

  // If user doesn't have required role, redirect to dashboard
  return <Navigate to="/dashboard" replace />;
};
