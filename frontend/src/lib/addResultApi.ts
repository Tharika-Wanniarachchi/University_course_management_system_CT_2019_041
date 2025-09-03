import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export interface ResultItem {
  id: number;
  student_id: number;
  course_id: number;
  grade_id: number;
  semester: string;
  academic_year: string;
  marks: number; // this is your percentage/score
  remarks?: string | null;
  student: { id: number; name: string; email: string };
  course:  {
      name: string; id: number; title: string; code: string; credits: number
};
  grade:   { id: number; letter?: string; name?: string; grade_point: number }; // letter OR name (depending on your Grade model)
  created_at?: string;
  updated_at?: string;
}

export interface Pagination<T> {
  data: T[];
  meta: { current_page: number; last_page: number; total: number };
}

export const resultsApi = {
  async list(params?: {
    student_id?: number;
    course_id?: number;
    semester?: string;
    title?: string;
    academic_year?: string;
    page?: number;
    per_page?: number;
  }): Promise<Pagination<ResultItem>> {
    const res = await axios.get(`${API_BASE_URL}/results`, {
      params,
      withCredentials: true,
      headers: { Accept: "application/json", "Content-Type": "application/json" },
    });

    // Laravel Resource pagination shape
    const p = res.data;
    return {
      data: p.data,
      meta: {
        current_page: p.meta?.current_page ?? p.current_page,
        last_page: p.meta?.last_page ?? p.last_page,
        total: p.meta?.total ?? p.total,
      },
    };
  },

  async create(payload: {
    student_id: number;
    course_id: number;
    semester: string;
    academic_year: string;
    marks: number;
    remarks?: string | null;
  }): Promise<ResultItem> {
    const res = await axios.post(`${API_BASE_URL}/results`, payload, {
      withCredentials: true,
      headers: { Accept: "application/json", "Content-Type": "application/json" },
    });
    return res.data.data; // ResultResource
  },

  async update(id: number, payload: Partial<{
    student_id: number;
    course_id: number;
    semester: string;
    academic_year: string;
    marks: number;
    remarks: string | null;
  }>): Promise<ResultItem> {
    const res = await axios.patch(`${API_BASE_URL}/results/${id}`, payload, {
      withCredentials: true,
      headers: { Accept: "application/json", "Content-Type": "application/json" },
    });
    return res.data.data;
  },

  async destroy(id: number): Promise<void> {
    await axios.delete(`${API_BASE_URL}/results/${id}`, {
      withCredentials: true,
      headers: { Accept: "application/json", "Content-Type": "application/json" },
    });
  },

  // optional: bulk create by calling store repeatedly
  async bulkCreate(rows: Array<{
    student_id: number;
    course_id: number;
    semester: string;
    academic_year: string;
    marks: number;
    remarks?: string | null;
  }>) {
    const outs: ResultItem[] = [];
    for (const row of rows) {
      const r = await resultsApi.create(row);
      outs.push(r);
    }
    return outs;
  },
};
