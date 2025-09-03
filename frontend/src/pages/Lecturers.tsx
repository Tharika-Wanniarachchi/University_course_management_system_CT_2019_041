import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  BookOpen,
  User as UserIcon,
  Loader2
} from "lucide-react";

// Import API service
import { lecturerApi, type Lecturer } from "@/lib/lecturerApi";

// ---- Helpers ----
const getStatusIcon = (status: string) => {
  switch (status) {
    case "Active":
      return <CheckCircle className="w-4 h-4" />;
    case "Inactive":
      return <XCircle className="w-4 h-4" />;
    case "Pending":
      return <AlertCircle className="w-4 h-4" />;
    default:
      return <AlertCircle className="w-4 h-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-accent text-accent-foreground";
    case "Inactive":
      return "bg-destructive text-destructive-foreground";
    case "Pending":
      return "bg-warning text-warning-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export default function Lecturers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive" | "Pending">("All");
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  // Fetch lecturers on component mount
  useEffect(() => {
    const fetchLecturers = async () => {
      try {
        setIsLoading(true);
        const data = await lecturerApi.getLecturers();
        setLecturers(data);
      } catch (error) {
        console.error('Failed to fetch lecturers:', error);
        toast.error('Failed to load lecturers. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLecturers();
  }, []);

  const filteredLecturers = lecturers.filter((l) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      l.name.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.department.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "All" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    All: lecturers.length,
    Active: lecturers.filter((l) => l.status === "Active").length,
    Inactive: lecturers.filter((l) => l.status === "Inactive").length,
    Pending: lecturers.filter((l) => l.status === "Pending").length
  };

  const handleStatusUpdate = async (id: number, newStatus: 'Active' | 'Inactive' | 'Pending') => {
    try {
      setUpdatingStatus(id);

      // Optimistically update the UI
      setLecturers(prevLecturers => {
        const updatedLecturers = prevLecturers.map(lecturer =>
          lecturer.id === id
            ? { ...lecturer, status: newStatus }
            : lecturer
        );

        // Update status counts based on the new state
        const newCounts = {
          All: updatedLecturers.length,
          Active: updatedLecturers.filter(l => l.status === 'Active').length,
          Inactive: updatedLecturers.filter(l => l.status === 'Inactive').length,
          Pending: updatedLecturers.filter(l => l.status === 'Pending').length
        };

        // This will trigger a re-render with the new counts
        return updatedLecturers;
      });

      // Make the API call
      await lecturerApi.updateLecturerStatus(id, newStatus);

      toast.success(`Lecturer status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update lecturer status. Please try again.');

      // Revert the optimistic update on error
      setLecturers(prevLecturers => {
        return prevLecturers.map(lecturer =>
          lecturer.id === id
            ? { ...lecturer, status: lecturer.status } // This will trigger a re-fetch of the original data
            : lecturer
        );
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Lecturers Management</h1>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Card
            key={status}
            className={`shadow-soft cursor-pointer transition-all duration-200 hover:shadow-medium ${
              statusFilter === status ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setStatusFilter(status as any)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{status}</p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    status === "Active"
                      ? "bg-accent/20 text-accent"
                      : status === "Inactive"
                      ? "bg-destructive/20 text-destructive"
                      : status === "Pending"
                      ? "bg-warning/20 text-warning"
                      : "bg-primary/20 text-primary"
                  }`}
                >
                  {getStatusIcon(status === "All" ? "Active" : status)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search + Filters */}
      <Card className="shadow-soft">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by lecturer name, email, or department…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lecturers List */}
      <div className="space-y-4">
        {filteredLecturers.map((l) => (
          <Card key={l.id} className="shadow-soft hover:shadow-medium transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={l.avatar} />
                    <AvatarFallback className="bg-gradient-primary text-white">
                      {l.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{l.name}</h3>
                      <Badge variant="outline">{l.email}</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <UserIcon className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Department</p>
                          <p className="text-muted-foreground">{l.department}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Courses</p>
                          <p className="text-muted-foreground">{l.coursesCount}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Joined</p>
                          <p className="text-muted-foreground">
                            {new Date(l.joinedDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(l.status)}>{l.status}</Badge>

                  <div className="flex gap-2">
                    {l.status === "Pending" && (
                      <div className="flex gap-2">
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleStatusUpdate(l.id, 'Active')}
                          disabled={updatingStatus === l.id}
                        >
                          {updatingStatus === l.id ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-1" />
                          )}
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleStatusUpdate(l.id, 'Inactive')}
                          disabled={updatingStatus === l.id}
                        >
                          {updatingStatus === l.id ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <XCircle className="w-4 h-4 mr-1" />
                          )}
                          Reject
                        </Button>
                      </div>
                    )}

                    {l.status === "Active" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleStatusUpdate(l.id, 'Inactive')}
                        disabled={updatingStatus === l.id}
                      >
                        {updatingStatus === l.id ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <XCircle className="w-4 h-4 mr-1" />
                        )}
                        Deactivate
                      </Button>
                    )}

                    {l.status === "Inactive" && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleStatusUpdate(l.id, 'Active')}
                        disabled={updatingStatus === l.id}
                      >
                        {updatingStatus === l.id ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-1" />
                        )}
                        Activate
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2">Loading lecturers...</span>
        </div>
      ) : filteredLecturers.length === 0 ? (
        <Card className="shadow-soft">
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No lecturers found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Try adjusting your search criteria" : "No lecturers match the current filter"}
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
