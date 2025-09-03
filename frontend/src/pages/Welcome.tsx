import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { LogIn, UserPlus, BookOpen } from "lucide-react";

type AuthMode = 'login' | 'register';

export default function Welcome() {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const toggleAuthMode = (mode: AuthMode) => {
    setAuthMode(mode);
  };

//   const features = [
//     {
//       icon: <GraduationCap className="h-5 w-5 text-primary" />,
//       title: "Student Management",
//       description: "Easily manage student records, enrollments, and academic progress."
//     },
//     {
//       icon: <BookCheck className="h-5 w-5 text-primary" />,
//       title: "Course Catalog",
//       description: "Browse and manage courses with detailed descriptions and requirements."
//     },
//     {
//       icon: <Users className="h-5 w-5 text-primary" />,
//       title: "Faculty Dashboard",
//       description: "Tools for instructors to manage courses, assignments, and grades."
//     },
//     {
//       icon: <BarChart3 className="h-5 w-5 text-primary" />,
//       title: "Analytics",
//       description: "Track student performance and course statistics with detailed reports."
//     },
//     {
//       icon: <FileText className="h-5 w-5 text-primary" />,
//       title: "Document Management",
//       description: "Store and organize course materials, syllabi, and resources."
//     },
//     {
//       icon: <Calendar className="h-5 w-5 text-primary" />,
//       title: "Scheduling",
//       description: "Manage class schedules, exams, and academic calendar events."
//     }
//   ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-primary/10 blur-3xl opacity-30"></div>
        <div className="absolute -left-40 bottom-0 w-80 h-80 rounded-full bg-accent/10 blur-3xl opacity-30"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl"></div>
      </div>

      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-16 items-center relative z-10">
        {/* Welcome Content */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="space-y-6">
            <div className="flex items-center space-x-3 group">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg transform transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Welcome to <span className="text-primary">EduNexus</span>
                </span>
                <span className="text-xs text-muted-foreground -mt-1 tracking-wider">UNIVERSITY COURSE MANAGEMENT SYSTEM</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-tight">
              University <span className="text-primary">Course Management</span> System
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg">
              Streamline your educational institution's course management with our comprehensive platform.
            </p>
          </div>

          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-3 p-3 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-colors"
              >
                <div className="p-1.5 rounded-md bg-primary/10">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-medium">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div> */}

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              size="lg"
              className="w-full sm:w-auto gap-2"
              onClick={() => toggleAuthMode('login')}
              variant={authMode === 'login' ? 'default' : 'outline'}
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
            <Button
              size="lg"
              variant={authMode === 'register' ? 'default' : 'outline'}
              className="w-full sm:w-auto gap-2"
              onClick={() => toggleAuthMode('register')}
            >
              <UserPlus className="h-4 w-4" />
              Create Account
            </Button>
          </div>
        </motion.div>

        {/* Auth Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Auth Tabs */}
          {/* <div className="flex border-b border-border">
            <button
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                authMode === 'login'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                authMode === 'register'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Create Account
            </button>
          </div> */}

          {/* Auth Content */}
          <div className="px-8">
            {authMode === 'login' ? (
              <LoginForm onSwitchToRegister={() => toggleAuthMode('register')} />
            ) : (
              <RegisterForm onSwitchToLogin={() => toggleAuthMode('login')} />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
