// src/lib/courseRegistrationApi.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface Course {
  id: number;
  title: string;
  code: string;
  credits: number;
  instructor: string;
  department: string;
  status: 'Active' | 'Deactivated' | 'Planning';
  schedule: string;
  description?: string;
  created_at: string;
  capacity: number;
}

export interface RegistrationStats {
  total: number;
  active: number;
  deactivated: number;
  planning: number;
}

export const courseRegistrationApi = {
  async getRegistrations(params?: {
    status?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<{ data: Course[]; meta: { current_page: number; last_page: number; total: number } }> {
    const res = await axios.get(`${API_BASE_URL}/course-registrations`, {
      params,
      withCredentials: true,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    });

    // Laravel paginate() returns { data, current_page, last_page, total, ... }
    const p = res.data;
    return {
      data: p.data,
      meta: {
        current_page: p.current_page,
        last_page: p.last_page,
        total: p.total,
      },
    };
  },

  async updateStatus(
    id: number,
    data: { status: 'Active' | 'Deactivated' | 'Planning'; feedback?: string }
  ): Promise<Course> {
    const res = await axios.patch(`${API_BASE_URL}/course-registrations/${id}/status`, data, {
      withCredentials: true,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    });
    return res.data.data;
  },

  async getStatistics(): Promise<RegistrationStats> {
    const res = await axios.get(`${API_BASE_URL}/course-registrations/statistics`, {
      withCredentials: true,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    });
    return res.data;
  },

  async createCourse(courseData: Omit<Course, 'id' | 'created_at'>): Promise<Course> {
    const res = await axios.post(`${API_BASE_URL}/courses`, courseData, {
      withCredentials: true,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    });
    return res.data.data;
  },

  async updateCourse(id: number, courseData: Partial<Omit<Course, 'id' | 'created_at'>>): Promise<Course> {
    const res = await axios.put(`${API_BASE_URL}/courses/${id}`, courseData, {
      withCredentials: true,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    });
    return res.data.data;
  },

  async deleteCourse(id: number): Promise<void> {
    await axios.delete(`${API_BASE_URL}/courses/${id}`, {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
