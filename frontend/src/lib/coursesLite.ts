// src/lib/coursesLite.ts
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export interface CourseLite { id: number; title: string; code: string; credits: number; }

export async function fetchCourses(): Promise<CourseLite[]> {
  const res = await axios.get(`${API_BASE_URL}/courses`, {
    params: { per_page: 100, status: "Active" }, // adjust to your controller
    withCredentials: true,
  });
  // If your /courses returns {data, meta}
  return res.data.data?.length ? res.data.data : res.data;
}
