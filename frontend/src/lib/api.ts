import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Create axios instance with base URL
const apiClient: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api', // Update this if your Laravel backend is on a different URL
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Required for cookies and sessions
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth_token');
      window.location.href = '/welcome';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<AxiosResponse> => {
    return apiClient.post('/login', { email, password });
  },
  register: async (userData: any): Promise<AxiosResponse> => {
    return apiClient.post('/register', userData);
  },
  logout: async (): Promise<AxiosResponse> => {
    return apiClient.post('/logout');
  },
  getUser: async (): Promise<AxiosResponse> => {
    return apiClient.get('/user');
  },
};

// Courses API
export const coursesApi = {
  getAll: async (): Promise<AxiosResponse> => {
    return apiClient.get('/courses');
  },
  getById: async (id: string | number): Promise<AxiosResponse> => {
    return apiClient.get(`/courses/${id}`);
  },
  create: async (courseData: any): Promise<AxiosResponse> => {
    return apiClient.post('/courses', courseData);
  },
  update: async (id: string | number, courseData: any): Promise<AxiosResponse> => {
    return apiClient.put(`/courses/${id}`, courseData);
  },
  delete: async (id: string | number): Promise<AxiosResponse> => {
    return apiClient.delete(`/courses/${id}`);
  },
};

// Students API
export const studentsApi = {
  getAll: async (): Promise<AxiosResponse> => {
    return apiClient.get('/students');
  },
  getById: async (id: string | number): Promise<AxiosResponse> => {
    return apiClient.get(`/students/${id}`);
  },
  create: async (studentData: any): Promise<AxiosResponse> => {
    return apiClient.post('/students', studentData);
  },
  update: async (id: string | number, studentData: any): Promise<AxiosResponse> => {
    return apiClient.put(`/students/${id}`, studentData);
  },
  delete: async (id: string | number): Promise<AxiosResponse> => {
    return apiClient.delete(`/students/${id}`);
  },
};

// Registrations API
export const registrationsApi = {
  getAll: async (): Promise<AxiosResponse> => {
    return apiClient.get('/registrations');
  },
  getById: async (id: string | number): Promise<AxiosResponse> => {
    return apiClient.get(`/registrations/${id}`);
  },
  create: async (registrationData: any): Promise<AxiosResponse> => {
    return apiClient.post('/registrations', registrationData);
  },
  update: async (id: string | number, registrationData: any): Promise<AxiosResponse> => {
    return apiClient.put(`/registrations/${id}`, registrationData);
  },
  delete: async (id: string | number): Promise<AxiosResponse> => {
    return apiClient.delete(`/registrations/${id}`);
  },
};

export default apiClient;
