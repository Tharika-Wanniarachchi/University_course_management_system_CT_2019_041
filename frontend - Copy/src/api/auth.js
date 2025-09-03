import axios from "axios";

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  }
});

// Add a request interceptor to include CSRF token
api.interceptors.request.use(async (config) => {
  // Only add CSRF token for non-GET requests
  if (config.method !== 'get') {
    try {
      // First, get the CSRF cookie
      await axios.get('http://localhost:8000/sanctum/csrf-cookie', { 
        withCredentials: true 
      });
    } catch (error) {
      console.error('Error getting CSRF token:', error);
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const registerUser = async (userData) => {
  return await api.post('/api/register', userData);
};

export const loginUser = async (credentials) => {
  try {
    // First, get CSRF cookie
    await api.get('/sanctum/csrf-cookie');
    
    // Then make the login request
    const response = await api.post('/api/login', credentials);
    
    // If we get here, login was successful
    console.log('Login successful:', response.data);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    
    // Handle validation errors
    if (error.response && error.response.status === 422) {
      const { data } = error.response;
      console.error('Validation errors:', data.errors);
      
      // Format validation errors for display
      const formattedErrors = {};
      Object.keys(data.errors || {}).forEach(field => {
        formattedErrors[field] = data.errors[field][0];
      });
      
      // Throw a new error with formatted messages
      const errorMessage = data.message || 'Validation failed';
      const validationError = new Error(errorMessage);
      validationError.errors = formattedErrors;
      throw validationError;
    }
    
    // Handle other errors
    const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
    const serverError = new Error(errorMessage);
    serverError.errors = { general: errorMessage };
    throw serverError;
  }
};

export const logoutUser = async () => {
  return await api.post('/api/logout');
};

export const getAuthUser = async () => {
  return await api.get('/api/user');
};
