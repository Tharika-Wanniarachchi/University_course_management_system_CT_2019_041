import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export interface DashboardCounts {
  enrolledStudents: number;
  users: number;
  students: number;
  lecturers: number;
  admins: number;
  pendingLecturers: number;
  courses: number;
  activeCourses: number;
  results: number;
  pendingRegistrations: number;
}

export interface RecentItem {
  type: "user" | "course" | "result" | "registration";
  id: number;
  title: string;
  subtitle?: string;
  meta?: string;
  at: string; // ISO
}

export interface DashboardResponse {
  counts: DashboardCounts;
  recent: RecentItem[];
}

export async function fetchDashboard(): Promise<DashboardResponse> {
  try {
    const res = await axios.get(`${API_BASE_URL}/dashboard`, {
      withCredentials: true,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    return res.data;
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', error.response.data);
      console.error('Error status:', error.response.status);
      console.error('Error headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
    }
    throw error; // Re-throw the error to be handled by the component
  }
}
