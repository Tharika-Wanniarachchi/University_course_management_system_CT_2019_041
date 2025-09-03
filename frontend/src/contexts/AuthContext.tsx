import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/api';

interface User {
    isApproved(): boolean;
    id: number;
    name: string;
    email: string;
    role: 'student' | 'lecturer' | 'admin';
    approved?: boolean;
  }

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isApproved: boolean;
  login: (email: string, password: string, onSuccess?: () => void) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = !!user;
  const isApproved = user?.role === 'admin' || user?.role === 'student' || user?.role === 'lecturer' || user?.approved === true;


  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          const response = await authApi.getUser();
          setUser(response.data);
        }
      } catch (error) {
        console.error('Failed to load user', error);
        localStorage.removeItem('auth_token');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string, onSuccess?: () => void) => {
    try {
      const response = await authApi.login(email, password);
      const { token, user } = response.data;

      localStorage.setItem('auth_token', token);
      setUser(user);

      // Call the success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      // Add role as 'student' to the registration data
      const registrationData = {
        ...userData,
        // Set default role as student
      };

      await authApi.register(registrationData);
      // After successful registration, log the user in
      await login(userData.email, userData.password);
    } catch (error) {
      console.error('Registration failed', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
      window.location.href = '/welcome';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        isApproved,
        login,
        register,
        logout,
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
