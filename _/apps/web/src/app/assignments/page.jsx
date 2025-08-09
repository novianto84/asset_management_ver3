"use client";

import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import {
  Search,
  Plus,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Filter,
  X,
  UserCheck,
  Calendar,
  MapPin,
  Phone,
  Eye,
  Play,
  Square,
} from "lucide-react";
import Header from "@/components/Header";

// Create a stable query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AssignmentsPageContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [supervisorFilter, setSupervisorFilter] = useState("all");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const queryClient = useQueryClient();

  // Fetch assignments
  const {
    data: assignmentsData,
    isLoading: loadingAssignments,
    error: assignmentsError,
  } = useQuery({
    queryKey: ["assignments", statusFilter, supervisorFilter],
    queryFn: async () => {
      const url = new URL("/api/assignments", window.location.origin);
      if (statusFilter !== "all") url.searchParams.set("status", statusFilter);
      if (supervisorFilter !== "all")
        url.searchParams.set("supervisor_id", supervisorFilter);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch assignments: ${response.status}`);
      }
      return response.json();
    },
  });

  // Fetch unassigned tasks
  const { data: unassignedTasksData } = useQuery({
    queryKey: ["tasks", "unassigned"],
    queryFn: async () => {
      const url = new URL("/api/tasks", window.location.origin);
      url.searchParams.set("status", "pending");

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.status}`);
      }
      return response.json();
    },
  });

  // Fetch users (supervisors and teknisi)
  const { data: usersData } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }
      return response.json();
    },
  });

  // Update assignment mutation
  const updateAssignmentMutation = useMutation({
    mutationFn: async ({ id, action, data }) => {
      const response = await fetch(`/api/assignments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...data }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update assignment");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const assignments = assignmentsData?.assignments || [];
  const unassignedTasks = unassignedTasksData?.tasks || [];
  const users = usersData?.users || [];
  const supervisors = users.filter((u) => u.role === "supervisor");
  const teknisiList = users.filter((u) => u.role === "teknisi");

  // Filter assignments
  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch =
      searchTerm === "" ||
      assignment.task_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.teknisi_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      assignment.unit_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.company_name?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Get assignment status
  const getAssignmentStatus = (assignment) => {
    if (assignment.completed_at) return "completed";
    if (assignment.started_at) return "in_progress";
    return "pending";
  };

  // Get status badge
  const getStatusBadge = (assignment) => {
    const status = getAssignmentStatus(assignment);
    const badges = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      in_progress: "bg-blue-100 text-blue-800 border-blue-300",
      completed: "bg-green-100 text-green-800 border-green-300",
    };

    const labels = {
      pending: "Assigned",
      in_progress: "In Progress",
      completed: "Completed",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium border ${badges[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    const badges = {
      urgent: "bg-red-100 text-red-800 border-red-300",
      high: "bg-orange-100 text-orange-800 border-orange-300",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
      low: "bg-gray-100 text-gray-800 border-gray-300",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium border ${badges[priority] || badges.medium}`}
      >
        {priority?.toUpperCase() || "MEDIUM"}
      </span>
    );
  };

  // Handle start assignment
  const handleStartAssignment = async (assignmentId) => {
    try {
      await updateAssignmentMutation.mutateAsync({
        id: assignmentId,
        action: "start",
      });
    } catch (error) {
      console.error("Error starting assignment:", error);
    }
  };

  // Handle complete assignment
  const handleCompleteAssignment = async (assignmentId, notes) => {
    try {
      await updateAssignmentMutation.mutateAsync({
        id: assignmentId,
        action: "complete",
        data: { completion_notes: notes },
      });
    } catch (error) {
      console.error("Error completing assignment:", error);
    }
  };

  if (assignmentsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Assignments
          </h2>
          <p className="text-gray-600">{assignmentsError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Assignment Management
          </h1>
          <p className="text-gray-600">
            Assign tasks to technicians and track progress
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {assignments.filter((a) => !a.started_at).length}
                </p>
                <p className="text-sm text-gray-600">Assigned</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Play className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {
                    assignments.filter((a) => a.started_at && !a.completed_at)
                      .length
                  }
                </p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {assignments.filter((a) => a.completed_at).length}
                </p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Square className="h-8 w-8 text-gray-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {unassignedTasks.length}
                </p>
                <p className="text-sm text-gray-600">Unassigned</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col lg:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={supervisorFilter}
              onChange={(e) => setSupervisorFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Supervisors</option>
              {supervisors.map((supervisor) => (
                <option key={supervisor.id} value={supervisor.id}>
                  {supervisor.name}
                </option>
              ))}
            </select>

            <a
              href="/assignments/assign"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Assign Task
            </a>
          </div>
        </div>

        {/* Assignments List */}
        {loadingAssignments ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2 w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Assignments Found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ||
              statusFilter !== "all" ||
              supervisorFilter !== "all"
                ? "No assignments match your search criteria."
                : "Start by assigning tasks to technicians."}
            </p>
            <a
              href="/assignments/assign"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Assign Task
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {assignment.task_title}
                      </h3>
                      {getStatusBadge(assignment)}
                      {getPriorityBadge(assignment.priority)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <UserCheck className="h-4 w-4 mr-2" />
                        <span>
                          <strong>Teknisi:</strong> {assignment.teknisi_name}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        <span>
                          <strong>Supervisor:</strong>{" "}
                          {assignment.supervisor_name}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>
                          <strong>Unit:</strong> {assignment.unit_name || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>
                          <strong>Assigned:</strong>{" "}
                          {new Date(
                            assignment.assigned_at,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {assignment.company_name && (
                      <div className="mt-2 text-sm text-gray-600">
                        <strong>Company:</strong> {assignment.company_name}
                      </div>
                    )}

                    {assignment.deadline && (
                      <div className="mt-2 text-sm">
                        <strong>Deadline:</strong>{" "}
                        <span
                          className={
                            new Date(assignment.deadline) < new Date()
                              ? "text-red-600"
                              : "text-gray-600"
                          }
                        >
                          {new Date(assignment.deadline).toLocaleDateString()}
                          {new Date(assignment.deadline) < new Date() &&
                            " (Overdue)"}
                        </span>
                      </div>
                    )}

                    {/* Timeline */}
                    <div className="mt-4 flex items-center text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Assigned:{" "}
                        {new Date(assignment.assigned_at).toLocaleString()}
                      </div>
                      {assignment.started_at && (
                        <div className="flex items-center ml-4">
                          <Play className="h-4 w-4 mr-1" />
                          Started:{" "}
                          {new Date(assignment.started_at).toLocaleString()}
                        </div>
                      )}
                      {assignment.completed_at && (
                        <div className="flex items-center ml-4">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Completed:{" "}
                          {new Date(assignment.completed_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 lg:mt-0">
                    <a
                      href={`/assignments/${assignment.id}`}
                      className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </a>

                    {!assignment.started_at && (
                      <button
                        onClick={() => handleStartAssignment(assignment.id)}
                        disabled={updateAssignmentMutation.isPending}
                        className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Work
                      </button>
                    )}

                    {assignment.started_at && !assignment.completed_at && (
                      <button
                        onClick={() => {
                          const notes = prompt("Completion notes (optional):");
                          if (notes !== null) {
                            handleCompleteAssignment(assignment.id, notes);
                          }
                        }}
                        disabled={updateAssignmentMutation.isPending}
                        className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Complete
                      </button>
                    )}
                  </div>
                </div>

                {assignment.notes && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Notes:</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {assignment.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AssignmentsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <Header />
      <AssignmentsPageContent />
    </QueryClientProvider>
  );
}
