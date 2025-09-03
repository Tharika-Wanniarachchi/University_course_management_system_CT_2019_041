import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface Student {
  id: number;
  name: string;
  email: string;
  department: string;
  coursesCount: number;
  status: 'Active' | 'Inactive' | 'Pending';
  joinedDate: string;
  avatar: string;
}

export const studentApi = {
  async getStudents(): Promise<Student[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/students`, {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  },

  async updateStudentStatus(id: number, status: string): Promise<{ message: string; student: { id: number; status: string } }> {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/students/${id}/status`,
        { status },
        {
          withCredentials: true,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating student status:', error);
      throw error;
    }
  },
};
