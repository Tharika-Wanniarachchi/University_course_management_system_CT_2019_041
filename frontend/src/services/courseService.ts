import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export interface Grade {
  id: number;
  enrollment_id: number;
  grade: number | null;
  letter_grade: string | null;
  comments: string | null;
  graded_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface EnrolledCourse extends Course {
  enrollment_id: number;
  enrollment_date: string;
  status: 'active' | 'completed' | 'dropped';
  grade?: Grade;
}

export interface Course {
  id: number;
  title: string;
  code: string;
  instructor: string;
  department: string;
  credits: number;
  enrolled: number;
  capacity: number;
  schedule: string;
  status: string;
  description?: string;
}

export const getAvailableCourses = async (studentId?: number): Promise<Course[]> => {
  try {
    const url = studentId
      ? `${API_URL}/courses?exclude_enrolled_by=${studentId}`
      : `${API_URL}/courses`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching available courses:', error);
    throw error;
  }
};

export const getEnrolledCourses = async (studentId: number): Promise<Course[]> => {
  try {
    const response = await axios.get(`${API_URL}/students/${studentId}/enrollments`);
    return response.data;
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    throw error;
  }
};

export const enrollInCourse = async (studentId: number, courseId: number): Promise<void> => {
  try {
    await axios.post(`${API_URL}/enrollments`, {
      student_id: studentId,
      course_id: courseId
    });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    throw error;
  }
};

export const unenrollFromCourse = async (studentId: number, courseId: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/enrollments`, {
      data: {
        student_id: studentId,
        course_id: courseId
      }
    });
  } catch (error) {
    console.error('Error unenrolling from course:', error);
    throw error;
  }
};

export const getEnrolledCoursesWithGrades = async (studentId: number): Promise<EnrolledCourse[]> => {
  try {
    const response = await axios.get(`${API_URL}/students/${studentId}/enrollments?with_grades=true`);
    return response.data;
  } catch (error) {
    console.error('Error fetching enrolled courses with grades:', error);
    throw error;
  }
};

export const getGradeLetter = (grade: number | null): string => {
  if (grade === null) return 'N/A';
  if (grade >= 90) return 'A';
  if (grade >= 80) return 'B';
  if (grade >= 70) return 'C';
  if (grade >= 60) return 'D';
  return 'F';
};
