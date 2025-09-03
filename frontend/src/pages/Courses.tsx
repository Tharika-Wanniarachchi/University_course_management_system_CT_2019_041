import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Course } from "@/services/courseService";
import { toast } from "sonner";
import {
  Plus,
  Search,
  BookOpen,
  Clock,
  LogOut,
  Loader2,
  Calendar,
  BookMarked,
  User,
  FileText,
  BarChart2,
  ChevronRight,
  ArrowLeft,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  getAvailableCourses,
  getEnrolledCourses,
  enrollInCourse,
  unenrollFromCourse,
  getEnrolledCoursesWithGrades,
  getGradeLetter,
} from "@/services/courseService";

import { useAuth } from "@/contexts/AuthContext"; // <-- adjust path if different

interface User {
  id: number;
  role: "admin" | "instructor" | "student";
  // Add other user properties as needed
}

export default function Courses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isUnenrolling, setIsUnenrolling] = useState<number | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [grades, setGrades] = useState<Record<number, number>>({});
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);

  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      if (!user?.id) return; // no user yet
      try {
        setIsLoading(true);

        // Fetch enrolled courses and available courses (excluding already enrolled ones) in parallel
        const fetchEnrolledCourses = async () => {
          try {
            const courses = await getEnrolledCoursesWithGrades(user.id);
            setEnrolledCourses(courses);

            // Create a grades map for quick lookup
            const gradesMap = courses.reduce((acc, course) => {
              if (
                course.grade?.grade !== undefined &&
                course.grade.grade !== null
              ) {
                acc[course.id] = course.grade.grade;
              }
              return acc;
            }, {} as Record<number, number>);

            setGrades(gradesMap);
          } catch (error) {
            console.error("Error fetching enrolled courses:", error);
            toast.error("Failed to load enrolled courses");
          }
        };

        const [_, available] = await Promise.all([
          fetchEnrolledCourses(),
          getAvailableCourses(user.id),
        ]);
        setAvailableCourses(available);
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Failed to load courses. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [user?.id]);

  // Handle course enrollment
  const handleEnroll = async (courseId: number) => {
    try {
      setIsEnrolling(true);
      await enrollInCourse(user.id, courseId);

      // Update the UI to reflect the new enrollment
      const enrolledCourse = availableCourses.find((c) => c.id === courseId);
      if (enrolledCourse) {
        setEnrolledCourses((prev) => [...prev, enrolledCourse]);
        setAvailableCourses((prev) => prev.filter((c) => c.id !== courseId));
        toast.success("Successfully enrolled in the course!");
      }

      setIsEnrollModalOpen(false);
    } catch (error) {
      console.error("Error enrolling in course:", error);
      toast.error("Failed to enroll in the course. Please try again.");
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleUnenroll = async (courseId: number) => {
    try {
      setIsUnenrolling(courseId);
      await unenrollFromCourse(user.id, courseId);

      // Update the UI to reflect the unenrollment
      const unenrolledCourse = enrolledCourses.find((c) => c.id === courseId);
      if (unenrolledCourse) {
        setEnrolledCourses((prev) => prev.filter((c) => c.id !== courseId));
        setAvailableCourses((prev) => [...prev, unenrolledCourse]);
        toast.success("Successfully unenrolled from the course!");
      }
    } catch (error) {
      console.error("Error unenrolling from course:", error);
      toast.error("Failed to unenroll from the course. Please try again.");
    } finally {
      setIsUnenrolling(null);
    }
  };

  const filteredEnrolledCourses = enrolledCourses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAvailableCourses = availableCourses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading courses...</span>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-accent text-accent-foreground";
      case "Planning":
        return "bg-warning text-warning-foreground";
      case "Completed":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Course Management
          </h1>
          <p className="text-muted-foreground">
            Manage university courses and offerings
          </p>
        </div>
        {user?.role === "student" ? (
          <Button
            variant="default"
            className="gap-2"
            onClick={() => setIsEnrollModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Enroll in New Course
          </Button>
        ) : (
          <Button variant="default" className="gap-2">
            <Plus className="w-4 h-4" />
            Add New Course
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card className="shadow-soft">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by course name, code, or instructor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enrolled Courses */}
      <h2 className="text-xl font-semibold">My Enrolled Courses</h2>
      {filteredEnrolledCourses.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          You haven't enrolled in any courses yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEnrolledCourses.map((course) => (
            <Card
              key={course.id}
              className="shadow-soft hover:shadow-medium transition-shadow duration-300 cursor-pointer hover:border-primary/50"
              onClick={() => setSelectedCourse(course)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg mb-1 flex items-center">
                      {course.title}
                      <ChevronRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {course.code}
                    </p>
                  </div>
                  <Badge className={getStatusColor(course.status)}>
                    {course.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <span>{course.instructor}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{course.schedule}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm font-medium">
                    {course.credits} Credits
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-1"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent event from bubbling up to the card
                        handleUnenroll(course.id);
                      }}
                      disabled={isUnenrolling === course.id}
                    >
                      {isUnenrolling === course.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="ml-1">Unenrolling...</span>
                        </>
                      ) : (
                        <>
                          <LogOut className="w-4 h-4" />
                          <span>Unenroll</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Enroll New Course Modal */}
      <Dialog open={isEnrollModalOpen} onOpenChange={setIsEnrollModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enroll in New Course</DialogTitle>
            <DialogDescription>
              Select courses to enroll in. Click the checkmark to enroll.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAvailableCourses.length > 0 ? (
                filteredAvailableCourses.map((course) => (
                  <Card key={course.id} className="relative">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {course.title}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {course.code}
                          </p>
                        </div>
                        <Badge className={getStatusColor(course.status)}>
                          {course.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                        <span>{course.instructor}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{course.schedule}</span>
                      </div>
                      <div className="pt-2">
                        {enrolledCourses.some((c) => c.id === course.id) ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full gap-2 bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700 border-green-200"
                            disabled
                          >
                            <Check className="w-4 h-4" />
                            Enrolled
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full gap-2"
                            onClick={() => handleEnroll(course.id)}
                            disabled={isEnrolling}
                          >
                            {isEnrolling ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Enrolling...
                              </>
                            ) : (
                              <>
                                <LogOut className="w-4 h-4 mr-1" />
                                Enroll in Course
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-2 text-center py-8 text-muted-foreground">
                  No available courses found. You're already enrolled in all
                  courses or there are no courses available.
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Course Details Dialog */}
      <Dialog
        open={!!selectedCourse}
        onOpenChange={(open) => !open && setSelectedCourse(null)}
      >
        {selectedCourse && (
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <Button
              variant="ghost"
              className="absolute left-4 top-4"
              onClick={() => setSelectedCourse(null)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </Button>

            <DialogHeader className="mt-8">
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="text-2xl">
                    {selectedCourse.title}
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    {selectedCourse.code} • {selectedCourse.credits} Credits
                  </DialogDescription>
                </div>
                <Badge className={getStatusColor(selectedCourse.status)}>
                  {selectedCourse.status}
                </Badge>
              </div>
            </DialogHeader>

            <Tabs defaultValue="overview" className="mt-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">
                          Course Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-start gap-3">
                          <User className="w-5 h-5 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Instructor</p>
                            <p className="text-sm text-muted-foreground">
                              {selectedCourse.instructor}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Schedule</p>
                            <p className="text-sm text-muted-foreground">
                              {selectedCourse.schedule}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <BookMarked className="w-5 h-5 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Credits</p>
                            <p className="text-sm text-muted-foreground">
                              {selectedCourse.credits} credit hours
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="font-semibold">Course Description</h3>
                      <p className="text-muted-foreground">
                        {selectedCourse.description ||
                          "No description available for this course."}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="resources" className="mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Course Resources</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        name: "Course Syllabus",
                        type: "PDF",
                        date: "Aug 20, 2023",
                      },
                      {
                        name: "Textbook - Chapter 1",
                        type: "PDF",
                        date: "Aug 22, 2023",
                      },
                      {
                        name: "Lecture 1 Slides",
                        type: "PPTX",
                        date: "Aug 25, 2023",
                      },
                      {
                        name: "Additional Reading Materials",
                        type: "ZIP",
                        date: "Aug 27, 2023",
                      },
                    ].map((resource, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">{resource.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {resource.type} • {resource.date}
                            </p>
                          </div>
                          <Button variant="ghost" size="icon">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-4 h-4"
                            >
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                              <polyline points="7 10 12 15 17 10"></polyline>
                              <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
