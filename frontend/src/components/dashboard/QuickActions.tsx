// src/components/dashboard/QuickActions.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus, FileText, BookOpen, Users, User2, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function QuickActions() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const adminActions = [
    { title: "Students", desc: "Manage users", icon: Users, to: "/students", variant: "outline" as const },
    { title: "Lecturers", desc: "Approve & manage", icon: User2, to: "/lecturers", variant: "outline" as const },
    { title: "Courses", desc: "Approve enrollments", icon: ClipboardList, to: "/registrations", variant: "outline" as const },
    { title: "Results", desc: "Upload & manage", icon: FileText, to: "/results", variant: "outline" as const },
  ];

  const lecturerActions = [
    { title: "My Courses", desc: "View & edit", icon: BookOpen, to: "/courses?mine=1", variant: "default" as const },
    { title: "Add Results", desc: "Subject-wise", icon: FileText, to: "/results/add", variant: "outline" as const },
    { title: "My Students", desc: "Advisees", icon: Users, to: "/students?mine=1", variant: "outline" as const },
  ];

  const studentActions = [
    { title: "My Courses", desc: "Enrolled list", icon: BookOpen, to: "/my/courses", variant: "default" as const },
    { title: "My Results", desc: "Grades & GPA", icon: FileText, to: "/my/results", variant: "outline" as const },
    { title: "Profile", desc: "Account details", icon: User2, to: "/profile", variant: "outline" as const },
  ];

  const actions =
    user?.role === "admin" ? adminActions :
    user?.role === "lecturer" ? lecturerActions :
    studentActions;

  return (
    <Card className="shadow-soft border-0 bg-gradient-subtle">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 rounded-lg bg-gradient-primary text-white">
            <Plus className="w-5 h-5" />
          </div>
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-3">
          {actions.map((a) => (
            <Button
              key={a.title}
              variant={a.variant}
              className="h-24 p-3 flex flex-col items-center justify-center gap-2 text-center transition-all hover:shadow-sm"
              onClick={() => navigate(a.to)}
            >
              <div className="p-2 rounded-lg bg-primary/10">
                <a.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-0.5">
                <span className="block text-sm font-medium">{a.title}</span>
                <span className="block text-xs text-muted-foreground">{a.desc}</span>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
