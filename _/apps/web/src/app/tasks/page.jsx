"use client";

import { useState } from "react";
import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Building2,
  CheckCircle,
  AlertCircle,
  Zap,
  Loader2,
  ArrowUp,
  ArrowDown,
  SortAsc,
  SortDesc,
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

function TasksPageContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [taskTypeFilter, setTaskTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "tasks",
      searchTerm,
      statusFilter,
      priorityFilter,
      taskTypeFilter,
      sortBy,
      sortOrder,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter) params.append("status", statusFilter);
      if (priorityFilter) params.append("priority", priorityFilter);
      if (taskTypeFilter) params.append("task_type", taskTypeFilter);
      if (sortBy) params.append("sortBy", sortBy);
      if (sortOrder) params.append("sortOrder", sortOrder);

      const response = await fetch(`/api/tasks?${params}`);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch tasks: ${response.status} ${response.statusText}`,
        );
      }
      return response.json();
    },
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 seconds
  });

  const tasks = data?.tasks || [];
  const userRole = data?.userRole || "teknisi";

  const sortOptions = [
    { value: "created_at", label: "Created Date" },
    { value: "deadline", label: "Deadline" },
    { value: "priority", label: "Priority" },
    { value: "status", label: "Status" },
    { value: "title", label: "Title" },
    { value: "task_type", label: "Task Type" },
  ];

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      assigned: "bg-blue-100 text-blue-800 border-blue-200",
      in_progress: "bg-purple-100 text-purple-800 border-purple-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      closed: "bg-gray-100 text-gray-800 border-gray-200",
    };

    const labels = {
      pending: "Pending",
      assigned: "Assigned",
      in_progress: "In Progress",
      completed: "Completed",
      closed: "Closed",
    };

    return (
      <span
        className={`px-2 py-1 rounded-md text-xs font-medium border ${styles[status] || styles.pending}`}
      >
        {labels[status] || status}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    };

    const icons = {
      urgent: <Zap className="h-3 w-3" />,
      high: <AlertCircle className="h-3 w-3" />,
      medium: <Clock className="h-3 w-3" />,
      low: <CheckCircle className="h-3 w-3" />,
    };

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${styles[priority] || styles.medium}`}
      >
        {icons[priority]}
        {priority?.charAt(0).toUpperCase() + priority?.slice(1)}
      </span>
    );
  };

  const getTaskTypeBadge = (taskType) => {
    const styles = {
      visit: "bg-indigo-100 text-indigo-800",
      minor: "bg-green-100 text-green-800",
      major: "bg-red-100 text-red-800",
      kontrak: "bg-purple-100 text-purple-800",
    };

    const labels = {
      visit: "Visit",
      minor: "Minor",
      major: "Major",
      kontrak: "Contract",
    };

    return (
      <span
        className={`px-2 py-1 rounded-md text-xs font-medium ${styles[taskType] || styles.visit}`}
      >
        {labels[taskType] || taskType}
      </span>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Tasks
          </h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Task Management
              </h1>
              <p className="text-gray-600 mt-1">
                {userRole === "teknisi"
                  ? "View your assigned tasks and available work"
                  : "Manage and track all tasks across units and customers"}
              </p>
            </div>
            {(userRole === "supervisor" || userRole === "admin") && (
              <div className="mt-4 sm:mt-0">
                <a
                  href="/tasks/new"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Task
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tasks, units, or companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Sort Controls */}
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      Sort by {option.label}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
                >
                  {sortOrder === "asc" ? (
                    <SortAsc className="h-4 w-4" />
                  ) : (
                    <SortDesc className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="closed">Closed</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Priority</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                <select
                  value={taskTypeFilter}
                  onChange={(e) => setTaskTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="visit">Visit</option>
                  <option value="minor">Minor</option>
                  <option value="major">Major</option>
                  <option value="kontrak">Contract</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Role-based info message */}
        {userRole === "teknisi" && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <User className="h-5 w-5 text-blue-600 mr-2" />
              <p className="text-blue-800 text-sm">
                You can only see tasks assigned to you and unassigned tasks
                available for pickup.
              </p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tasks.filter((t) => t.status === "pending").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Assigned</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tasks.filter((t) => t.status === "assigned").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tasks.filter((t) => t.status === "in_progress").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tasks.filter((t) => t.status === "completed").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                <span className="ml-2 text-gray-600">Loading tasks...</span>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No tasks found
                </h3>
                <p className="text-gray-600 mb-4">
                  {userRole === "teknisi"
                    ? "No tasks are currently assigned to you or available for pickup."
                    : "Get started by creating your first task."}
                </p>
                {(userRole === "supervisor" || userRole === "admin") && (
                  <a
                    href="/tasks/new"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Task
                  </a>
                )}
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type & Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit/Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deadline
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {task.title}
                          </div>
                          {task.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {task.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {getTaskTypeBadge(task.task_type)}
                          {getPriorityBadge(task.priority)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {task.unit_name && (
                            <div className="text-gray-900 font-medium">
                              {task.unit_name}
                            </div>
                          )}
                          {task.company_name && (
                            <div className="text-gray-500">
                              {task.company_name}
                            </div>
                          )}
                          {task.serial_number_engine && (
                            <div className="text-gray-400 text-xs">
                              Engine: {task.serial_number_engine}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(task.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {task.assigned_teknisi_name ? (
                            <div>
                              <div className="text-gray-900 font-medium">
                                {task.assigned_teknisi_name}
                              </div>
                              {task.supervisor_name && (
                                <div className="text-gray-500 text-xs">
                                  Supervisor: {task.supervisor_name}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">Unassigned</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {task.deadline ? (
                          <div className="text-sm">
                            <div className="text-gray-900">
                              {new Date(task.deadline).toLocaleDateString()}
                            </div>
                            <div
                              className={`text-xs ${
                                new Date(task.deadline) < new Date()
                                  ? "text-red-600"
                                  : "text-gray-500"
                              }`}
                            >
                              {new Date(task.deadline) < new Date()
                                ? "Overdue"
                                : "Upcoming"}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">No deadline</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <a
                            href={`/tasks/${task.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View
                          </a>
                          {(userRole === "supervisor" ||
                            userRole === "admin") && (
                            <>
                              <a
                                href={`/tasks/${task.id}/edit`}
                                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                              >
                                Edit
                              </a>
                              {!task.assigned_teknisi_id && (
                                <a
                                  href={`/assignments/assign?task=${task.id}`}
                                  className="text-green-600 hover:text-green-800 text-sm font-medium"
                                >
                                  Assign
                                </a>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TasksPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <Header />
      <TasksPageContent />
    </QueryClientProvider>
  );
}
