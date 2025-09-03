import {
  GraduationCap,
  BookOpen,
  Users,
  ClipboardList,
  BarChart3,
  Settings,
  Home,
  FileText,
  Calendar,
  Trophy
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useMemo } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Students", url: "/students", icon: Users },
  { title: "Lecturers", url: "/lecturers", icon: ClipboardList },
//   { title: "Registrations", url: "/registrations", icon: Users },
//   { title: "Schedule", url: "/schedule", icon: Calendar },
    { title: "Courses", url: "/courses", icon: BookOpen },
  { title: "Results", url: "/results", icon: Trophy },
//   { title: "Reports", url: "/reports", icon: BarChart3 },
//   { title: "Documents", url: "/documents", icon: FileText },
];

const systemItems = [
//   { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { isAuthenticated, isApproved, isLoading, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  // Debug logging
  useEffect(() => {
    console.log('User:', user);
    console.log('isAuthenticated:', isAuthenticated);
    console.log('isApproved:', isApproved);
    console.log('isLoading:', isLoading);
  }, [user, isAuthenticated, isApproved, isLoading]);

  // Filter menu items based on user role using useMemo for better performance
  const filteredNavigationItems = useMemo(() => {
    if (!user) return [];

    // Filter based on roles first
    let filteredItems = [...navigationItems];

    if (user.role === 'student') {
      filteredItems = navigationItems.filter(item =>
        ['/dashboard', '/courses', '/results'].includes(item.url)
      );
    } else if (user.role === 'lecturer') {
      // For lecturers, modify the courses URL to point to registrations
      filteredItems = navigationItems.map(item => {
        if (item.url === '/courses') {
          return { ...item, url: '/registrations' };
        }
        return item;
      }).filter(item =>
        ['/dashboard', '/registrations', '/results', '/students'].includes(item.url)
      );
    } else if (user.role !== 'admin') {
      return [];
    }

    return filteredItems;
  }, [user]);

  const filteredSystemItems = useMemo(() => {
    if (!user) return [];
    if (user.role === 'admin') return systemItems;
    if (['student', 'lecturer'].includes(user.role)) {
      return systemItems.filter(item => item.url === '/settings');
    }
    return [];
  }, [user]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const isActive = (path: string) => {
    const isActive = currentPath === path ||
                    (path !== '/' && currentPath.startsWith(path + '/'));
    console.log(`Checking if ${path} is active (current: ${currentPath}):`, isActive);
    return isActive;
  };

  const getNavClasses = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-gray-100 text-gray-600 font-medium shadow-soft dark:bg-gray-800 dark:text-gray-100"
      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-100";

  return (
    <Sidebar className="w-64">
      <div className="flex items-center gap-2 p-4 border-b">
        <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-foreground">EduNexus</h1>
          <p className="text-xs text-muted-foreground">Course Management</p>
        </div>
      </div>

      <SidebarContent className="p-3 space-y-1">
        {/* {isApproved ? ( */}

          <>
            <SidebarGroup className="mb-6">
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Main Menu
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-2">
                  {filteredNavigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          end
                          className={getNavClasses}
                          onClick={() => console.log('Navigating to:', item.url, 'as', user?.role)}
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {filteredSystemItems.length > 0 && (
              <SidebarGroup className="mt-auto">
                <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  System
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-2">
                    {filteredSystemItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.url}
                            end
                            className={getNavClasses}
                          >
                            <item.icon className="w-4 h-4" />
                            <span>{item.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </>
        {/* ) : (
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              {isAuthenticated
                ? "Your account is pending approval. Please wait for an administrator to approve your access."
                : "Please log in to access the system."}
            </p>
          </div>
        )} */}
      </SidebarContent>
    </Sidebar>
  );
}
