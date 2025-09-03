import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, BookOpen, GraduationCap, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import apiClient from "@/lib/api";

interface Activity {
  id: number;
  type: string;
  title: string;
  description: string;
  date: string;
  icon: string;
}

interface StudentData {
  totalCourses: number;
  enrolledCourses: number;
  uploadedResults: number;
  gpa: number;
  recentActivities: Activity[];
}

export default function Dashboard() {
  const { user, isAuthenticated, isLoading, isApproved } = useAuth();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (user?.role === 'student') {
        try {
          setLoading(true);
          const response = await apiClient.get(`/students/${user.id}/dashboard`);
          if (response.data.success) {
            setStudentData({
              totalCourses: response.data.data.total_courses,
              enrolledCourses: response.data.data.enrolled_courses,
              uploadedResults: response.data.data.uploaded_results,
              gpa: response.data.data.gpa,
              recentActivities: response.data.data.recent_activities || []
            });
          }
        } catch (error) {
          console.error('Error fetching student data:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchStudentData();
    }
  }, [user, isAuthenticated]);

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

    if (user?.role === 'lecturer' && !user?.approved === false) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Your lecturer account is pending admin approval. You'll have full access once approved.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Student-specific dashboard
  if (user?.role === 'student') {
    return (
      <div className="space-y-8 p-6">
        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-primary p-8 text-white shadow-lg">
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back, {user?.name || 'Student'}!</h1>
            <p className="text-blue-100 text-lg">Here's your academic summary</p>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-full">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-100">Total Courses</p>
                    <p className="text-2xl font-bold">{studentData?.totalCourses ?? 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-full">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-100">Enrolled Courses</p>
                    <p className="text-2xl font-bold">{studentData?.enrolledCourses ?? 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-full">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-100">Uploaded Results</p>
                    <p className="text-2xl font-bold">{studentData?.uploadedResults ?? 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-full">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-blue-100">Current GPA</p>
                    <p className="text-2xl font-bold">{studentData?.gpa?.toFixed(2) || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-semibold">Recent Activity</h2>
            {studentData?.recentActivities?.length > 0 ? (
              <div className="space-y-4">
                {studentData.recentActivities.map((activity) => (
                  <div key={activity.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-50 rounded-full">
                        {activity.type === 'result' ? (
                          <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{activity.title}</h3>
                        <p className="text-sm text-gray-500">{activity.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(activity.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
                <p className="text-gray-500">No recent activity to display</p>
              </div>
            )}
          </div>

          {/* Quick Actions - Takes 1 column */}
          <div className="space-y-6">


            {/* Upcoming Deadlines */}
            <div className="mt-8">
              <h3 className="font-medium text-lg mb-3">Upcoming Deadlines</h3>
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <CalendarDays className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Assignment {item} Due</h4>
                      <p className="text-sm text-gray-500">Course: Web Development</p>
                      <p className="text-xs text-gray-400">Due: November {15 + item}, 2025</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default dashboard for other roles
  return (
    <div className="space-y-8 p-6">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-primary p-8 text-white shadow-lg">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative">
          <h1 className="text-4xl font-bold mb-2">Welcome, {user?.name || 'User'}</h1>
          <p className="text-blue-100 text-lg">Here's what's happening at your university today.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity - Takes 2 columns */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
          <RecentActivity />
        </div>

        {/* Quick Actions - Takes 1 column */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Quick Actions</h2>
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
