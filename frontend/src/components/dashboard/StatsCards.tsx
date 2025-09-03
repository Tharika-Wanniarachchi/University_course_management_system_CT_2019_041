// src/components/dashboard/StatsCards.tsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, ClipboardList, GraduationCap, Trophy } from "lucide-react";
import { Loader2 } from "lucide-react";
import { fetchDashboard, type DashboardResponse } from "@/lib/dashboardApi";

export function StatsCards() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetchDashboard(); // GET /api/dashboard/stats
        setData(res);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const items = [
    { title: "Total Courses",         value: data?.counts?.courses ?? 0,              icon: BookOpen,      description: "Active courses this semester" },
    { title: "Registered Students",   value: data?.counts?.students ?? 0,             icon: Users,         description: "Current registered students" },
    { title: "Enrolled Students",     value: data?.counts?.enrolledStudents ?? 0,     icon: Users,         description: "Students currently enrolled" },
    { title: "Registered Lecturers",  value: data?.counts?.lecturers ?? 0,            icon: GraduationCap, description: "Current registered lecturers" },
    { title: "Pending Registrations", value: data?.counts?.pendingRegistrations ?? 0, icon: ClipboardList, description: "Awaiting approval" },
    { title: "Uploaded Results",      value: data?.counts?.results ?? 0,              icon: Trophy,        description: "All uploaded results" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((stat) => (
        <Card key={stat.title} className="shadow-soft hover:shadow-medium transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <stat.icon className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : stat.value}
            </div>
            <p className="text-xs text-muted-foreground mt-2">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
