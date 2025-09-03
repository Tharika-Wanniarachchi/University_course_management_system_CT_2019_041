import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

type CourseStatus = 'Active' | 'Deactivated' | 'Planning';

interface CourseFormData {
  title: string;
  code: string;
  credits: number;
  instructor: string;
  department: string;
  schedule: string;
  description: string;
  status: CourseStatus;
  capacity: number;
}
import {
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen,
  Calendar,
  Loader2,
  User as UserIcon
} from "lucide-react";

import {
  courseRegistrationApi,
  type Course,
  type RegistrationStats,
} from "@/lib/courseRegistrationApi";

// ---- Helpers ----
const getStatusIcon = (status: string) => {
  switch (status) {
    case "Active":
      return <CheckCircle className="w-4 h-4" />;
    case "Deactivated":
      return <XCircle className="w-4 h-4" />;
    case "Planning":
      return <Clock className="w-4 h-4" />;
    default:
      return <AlertCircle className="w-4 h-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-accent text-accent-foreground";
    case "Deactivated":
      return "bg-destructive text-destructive-foreground";
    case "Planning":
      return "bg-warning text-warning-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

type StatusFilter = "All" | "Active" | "Deactivated" | "Planning";

export default function Registrations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

  const [rows, setRows] = useState<Course[]>([]);
  const [stats, setStats] = useState<RegistrationStats | null>(null);
  const [meta, setMeta] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [page, setPage] = useState(1);
  const perPage = 10;

  // Reject dialog state
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<Course | null>(null);
  const [feedback, setFeedback] = useState("");

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebounced(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // fetch stats once (and after status change)
  async function fetchStats() {
    try {
      setIsLoadingStats(true);
      const s = await courseRegistrationApi.getStatistics();
      setStats(s);
    } catch (e) {
      toast.error("Failed to load statistics");
    } finally {
      setIsLoadingStats(false);
    }
  }

  // fetch registrations when filters change
  async function fetchRegistrations() {
    try {
      setIsLoading(true);
      const res = await courseRegistrationApi.getRegistrations({
        status: statusFilter === "All" ? undefined : statusFilter,
        search: debounced || undefined,
        page,
        per_page: perPage,
      });
      setRows(res.data || []);
      setMeta(res.meta || null);
    } catch (e) {
      toast.error("Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    setPage(1); // reset to first page when filters change
  }, [statusFilter, debounced]);

  useEffect(() => {
    fetchRegistrations();
  }, [statusFilter, debounced, page]);

  const statusCounts = useMemo(() => {
    if (!stats) return { All: 0, Active: 0, Deactivated: 0, Planning: 0 };
    return {
      All: stats?.total ?? 0,
      Active: stats?.active ?? 0,
      Deactivated: stats?.deactivated ?? 0,
      Planning: stats?.planning ?? 0,
    };
  }, [stats]);

  const handleStatusChange = async (id: number, newStatus: 'Active' | 'Deactivated' | 'Planning') => {
    try {
      setUpdatingId(id);
      const updatedCourse = await courseRegistrationApi.updateStatus(id, { status: newStatus });
      
      // Update the course in the local state
      setRows(prevRows => 
        prevRows.map(course => 
          course.id === id ? updatedCourse : course
        )
      );

      // Update the stats in real-time
      if (stats) {
        setStats(prev => {
          if (!prev) return prev;
          
          const newStats = { ...prev };
          
          // Find the course to get its previous status
          const course = rows.find(c => c.id === id);
          if (course) {
            // Decrement count for old status
            const oldStatus = course.status.toLowerCase() as keyof typeof prev;
            if (oldStatus in prev) {
              newStats[oldStatus] = Math.max(0, (prev[oldStatus] as number) - 1);
            }
            
            // Update total (if status actually changed)
            if (course.status !== newStatus) {
              newStats.total = prev.total;
            }
          }
          
          // Increment count for new status
          const statusKey = newStatus.toLowerCase() as keyof typeof prev;
          if (statusKey in newStats) {
            newStats[statusKey] = (newStats[statusKey] as number) + 1;
          }
          
          return newStats;
        });
      }
      
      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      setUpdatingId(id);
      await courseRegistrationApi.deleteCourse(id);
      await fetchRegistrations();
      toast.success('Course deleted successfully');
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    } finally {
      setUpdatingId(null);
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      code: '',
      credits: 3,
      instructor: '',
      department: '',
      schedule: '',
      description: '',
      status: 'Planning',
      capacity: 30
    });
    setEditingId(null);
    setFormErrors({});
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    setOpen(open);
  };

  const handleEdit = (course: Course) => {
    setForm({
      title: course.title,
      code: course.code,
      credits: course.credits,
      instructor: course.instructor,
      department: course.department,
      schedule: course.schedule,
      description: course.description || '',
      status: course.status as CourseStatus,
      capacity: course.capacity
    });
    setEditingId(course.id);
    setOpen(true);
  };

  function openRejectDialog(course: Course) {
    setRejectTarget(course);
    setFeedback("");
    setRejectOpen(true);
  }

  async function submitReject() {
    if (!rejectTarget) return;
    const id = rejectTarget.id;
    setUpdatingId(id);
    const prev = rows.slice();
    setRows(prev.map(r => (r.id === id ? { ...r, status: "Deactivated" } : r)));
    try {
      await courseRegistrationApi.updateStatus(id, { status: "Deactivated", feedback });
      await fetchStats();
      toast.success("Course status updated to Deactivated");
      setRejectOpen(false);
    } catch {
      setRows(prev);
      toast.error("Failed to update course status");
    } finally {
      setUpdatingId(null);
    }
  }

  function clearFilters() {
    setSearchTerm("");
    setStatusFilter("All");
  }

  function exportCSV() {
    const header = [
      "ID",
      "Course Title",
      "Course Code",
      "Instructor",
      "Department",
      "Credits",
      "Status",
      "Created At",
      "Schedule",
      "Description",
    ];
    const rowsCsv = rows.map(course => [
      course.id,
      course.title,
      course.code,
      course.instructor,
      course.department,
      course.credits,
      course.status,
      course.created_at,
      course.schedule,
      course.description,
    ]);
    const csv = [header, ...rowsCsv].map(a => a.map(x => `"${String(x).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `courses_page${page}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CourseFormData, string>>>({});
  const [form, setForm] = useState<CourseFormData>({
    title: '',
    code: '',
    credits: 3,
    instructor: '',
    department: '',
    schedule: '',
    description: '',
    status: 'Planning',
    capacity: 30
  });

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof CourseFormData, string>> = {};

    if (!form.title.trim()) errors.title = 'Title is required';
    if (!form.code.trim()) errors.code = 'Course code is required';
    if (!form.instructor.trim()) errors.instructor = 'Instructor is required';
    if (!form.department.trim()) errors.department = 'Department is required';
    if (!form.credits || form.credits < 1) errors.credits = 'Credits must be at least 1';
    if (!form.capacity || form.capacity < 1) errors.capacity = 'Capacity must be at least 1';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    // Client-side validation
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      if (editingId) {
        // Update existing course
        const updatedCourse = await courseRegistrationApi.updateCourse(editingId, form);
        
        // Update the local state with the updated course
        setRows(prevRows => 
          prevRows.map(course => 
            course.id === editingId ? updatedCourse : course
          )
        );
        
        toast.success('Course updated successfully');
      } else {
        // Create new course
        const newCourse = await courseRegistrationApi.createCourse(form);
        
        // Update the local state with the new course
        setRows(prevRows => [newCourse, ...prevRows]);

        // Update meta total count
        setMeta(prev => ({
          ...prev,
          total: prev ? prev.total + 1 : 1
        }));

        // Update stats
        if (stats) {
          setStats(prev => ({
            ...prev,
            total: prev.total + 1,
            [newCourse.status.toLowerCase()]: (prev[newCourse.status.toLowerCase() as keyof typeof prev] as number) + 1
          }));
        }
        
        toast.success('Course created successfully');
      }

      // Close dialog and reset form
      setOpen(false);
      resetForm();
      
    } catch (error: any) {
      console.error('Error saving course:', error);
      if (error.response?.status === 422 && error.response?.data?.errors) {
        // Handle validation errors
        const errors = error.response.data.errors;
        const formattedErrors: Record<string, string> = {};

        Object.keys(errors).forEach(key => {
          formattedErrors[key as keyof CourseFormData] = errors[key][0];
        });

        setFormErrors(formattedErrors);
      } else {
        toast.error(error.response?.data?.message || `Failed to ${editingId ? 'update' : 'create'} course`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormChange = (field: keyof CourseFormData, value: any) => {
    // Clear error for the field being edited
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Course Management</h1>
          <p className="text-muted-foreground">Manage course information and status</p>
        </div>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add New Course
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Course' : 'Add New Course'}</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title *</Label>
                <div className="space-y-1">
                  <Input
                    id="title"
                    placeholder="e.g., Data Structures & Algorithms"
                    value={form.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    className={formErrors.title ? 'border-destructive' : ''}
                  />
                  {formErrors.title && (
                    <p className="text-sm text-destructive">{formErrors.title}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Course Code *</Label>
                <div className="space-y-1">
                  <Input
                    id="code"
                    placeholder="e.g., CS-301"
                    value={form.code}
                    onChange={(e) => handleFormChange('code', e.target.value)}
                    className={formErrors.code ? 'border-destructive' : ''}
                  />
                  {formErrors.code && (
                    <p className="text-sm text-destructive">{formErrors.code}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructor">Instructor *</Label>
                <div className="space-y-1">
                  <Input
                    id="instructor"
                    placeholder="e.g., Dr. Emily Watson"
                    value={form.instructor}
                    onChange={(e) => handleFormChange('instructor', e.target.value)}
                    className={formErrors.instructor ? 'border-destructive' : ''}
                  />
                  {formErrors.instructor && (
                    <p className="text-sm text-destructive">{formErrors.instructor}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <div className="space-y-1">
                  <Input
                    id="department"
                    placeholder="e.g., Computer Science"
                    value={form.department}
                    onChange={(e) => handleFormChange('department', e.target.value)}
                    className={formErrors.department ? 'border-destructive' : ''}
                  />
                  {formErrors.department && (
                    <p className="text-sm text-destructive">{formErrors.department}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="credits">Credits *</Label>
                <div className="space-y-1">
                  <Input
                    id="credits"
                    type="number"
                    min={1}
                    placeholder="e.g., 3"
                    value={form.credits}
                    onChange={(e) => handleFormChange('credits', Number(e.target.value))}
                    className={formErrors.credits ? 'border-destructive' : ''}
                  />
                  {formErrors.credits && (
                    <p className="text-sm text-destructive">{formErrors.credits}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity *</Label>
                <div className="space-y-1">
                  <Input
                    id="capacity"
                    type="number"
                    min={1}
                    placeholder="e.g., 60"
                    value={form.capacity}
                    onChange={(e) => handleFormChange('capacity', Number(e.target.value))}
                    className={formErrors.capacity ? 'border-destructive' : ''}
                  />
                  {formErrors.capacity && (
                    <p className="text-sm text-destructive">{formErrors.capacity}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="schedule">Schedule</Label>
                <Input
                  id="schedule"
                  placeholder="e.g., Mon/Wed 10:00–11:30"
                  value={form.schedule}
                  onChange={(e) => handleFormChange('schedule', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(value: CourseStatus) => handleFormChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Deactivated">Deactivated</SelectItem>
                    <SelectItem value="Planning">Planning</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <div className="space-y-1">
                  <Textarea
                    id="description"
                    placeholder="Write a brief description…"
                    value={form.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    className={`min-h-[96px] ${formErrors.description ? 'border-destructive' : ''}`}
                  />
                  {formErrors.description && (
                    <p className="text-sm text-destructive">{formErrors.description}</p>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingId ? 'Updating...' : 'Creating...'}
                  </>
                ) : editingId ? 'Update Course' : 'Create Course'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>


      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {(["All", "Active", "Deactivated", "Planning"] as const).map((status) => {
          const count = status === "All"
            ? stats?.total
            : status === "Active"
              ? stats?.active
              : status === "Deactivated"
                ? stats?.deactivated
                : stats?.planning;

          return (
            <Card
              key={status}
              className={`shadow-soft cursor-pointer transition-all duration-200 hover:shadow-medium ${
                statusFilter === status ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setStatusFilter(status as StatusFilter)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{status}</p>
                    <p className="text-2xl font-bold">
                      {isLoadingStats ? <Loader2 className="w-5 h-5 animate-spin" /> : count || 0}
                    </p>
                  </div>
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      status === "Planning"
                        ? "bg-warning/20 text-warning"
                        : status === "Active"
                        ? "bg-accent/20 text-accent"
                        : status === "Deactivated"
                        ? "bg-destructive/20 text-destructive"
                        : "bg-primary/20 text-primary"
                    }`}
                  >
                    {getStatusIcon(status === "All" ? "Active" : status)}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search and Filters */}
      <Card className="shadow-soft">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by course title, code, or instructor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Courses List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card className="shadow-soft">
            <CardContent className="p-6 flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading courses...</span>
            </CardContent>
          </Card>
        ) : rows.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="p-6 text-center text-muted-foreground">
              No courses found
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rows.map((course) => (
              <Card key={course.id} className="shadow-soft overflow-hidden h-full">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{course.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{course.code}</Badge>
                        <Badge variant="outline">{course.credits} Credits</Badge>
                      </div>
                    </div>
                    <Badge className={getStatusColor(course.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(course.status)}
                        {course.status}
                      </span>
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span>{course.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      <span>{course.instructor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Schedule: {course.schedule}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Created: {new Date(course.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    {/* Edit Button - Available for all statuses except Deactivated */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(course)}
                      disabled={updatingId === course.id}
                    >
                      {updatingId === course.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Pencil className="w-4 h-4 mr-2" />
                      )}
                      Edit
                    </Button>

                    {/* Dynamic Action Button */}
                    {course.status === "Planning" && (
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleStatusChange(course.id, "Active")}
                        disabled={updatingId === course.id}
                      >
                        {updatingId === course.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        Activate
                      </Button>
                    )}

                    {course.status === "Active" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleStatusChange(course.id, "Deactivated")}
                        disabled={updatingId === course.id}
                      >
                        {updatingId === course.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4 mr-2" />
                        )}
                        Deactivate
                      </Button>
                    )}

                    {course.status === "Deactivated" && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleStatusChange(course.id, "Active")}
                          disabled={updatingId === course.id}
                        >
                          {updatingId === course.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          )}
                          Reactivate
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleDelete(course.id)}
                          disabled={updatingId === course.id}
                        >
                          {updatingId === course.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 mr-2" />
                          )}
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {meta && rows.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {meta.current_page} of {meta.last_page} • Total {meta.total}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled={meta.current_page <= 1} onClick={() => setPage((p) => p - 1)}>
              Prev
            </Button>
            <Button variant="outline" disabled={meta.current_page >= meta.last_page} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to reject <strong>{rejectTarget?.title}</strong>?
            </p>
            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback (Optional)</Label>
              <Textarea
                id="feedback"
                placeholder="Provide a reason for rejection..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={submitReject}>
              {updatingId === rejectTarget?.id ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Reject Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
