import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface Lecturer {
  id: number;
  name: string;
  email: string;
  department: string;
  coursesCount: number;
  status: 'Active' | 'Inactive' | 'Pending';
  joinedDate: string;
  avatar: string;
}

export const lecturerApi = {
  async getLecturers(): Promise<Lecturer[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/lecturers`, {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching lecturers:', error);
      throw error;
    }
  },

  async updateLecturerStatus(id: number, status: string): Promise<{ message: string; lecturer: { id: number; status: string } }> {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/lecturers/${id}/status`,
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
      console.error('Error updating lecturer status:', error);
      throw error;
    }
  },
};
