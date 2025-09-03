import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export function useCurrentUser() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [userData, setUserData] = useState<UserProfile | null>(null);

  // Fetch user profile data
  const fetchUserProfile = async () => {
    if (!isAuthenticated) return null;

    try {
      const response = await apiClient.get<UserProfile>('/user/profile');
      return response.data;
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      throw err;
    }
  };

  // Use React Query for data fetching and caching
  const {
    data,
    isLoading: isFetching,
    error: fetchError,
    refetch,
  } = useQuery<UserProfile | null>({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
    enabled: isAuthenticated,
    retry: 1,
  });

  // Update local state when query state changes
  useEffect(() => {
    if (!isAuthLoading) {
      if (isAuthenticated) {
        // If we have data from the query, use it
        if (data) {
          setUserData(data);
        }
        setError(fetchError as Error | null);
      } else {
        // If not authenticated, reset user data
        setUserData(null);
      }
      setIsLoading(isAuthLoading || isFetching);
    }
  }, [isAuthenticated, isAuthLoading, isFetching, data, fetchError]);

  // Function to refresh user data
  const refreshUserData = async () => {
    try {
      await refetch();
    } catch (err) {
      console.error('Failed to refresh user data:', err);
      throw err;
    }
  };

  return {
    user: userData,
    isLoading,
    error,
    refreshUserData,
    isAuthenticated,
    // Role-based access control helpers
    isAdmin: userData?.role === 'admin',
    isInstructor: userData?.role === 'instructor',
    isStudent: userData?.role === 'student',
  };
}

// Hook to check if user has required permissions
export function usePermission(requiredRole: 'admin' | 'instructor' | 'student' | string[]) {
  const { user, isAuthenticated, isLoading } = useCurrentUser();

  if (isLoading || !isAuthenticated) {
    return {
      hasPermission: false,
      isLoading,
    };
  }

  const hasPermission = Array.isArray(requiredRole)
    ? requiredRole.includes(user?.role || '')
    : user?.role === requiredRole;

  return {
    hasPermission,
    isLoading: false,
  };
}
