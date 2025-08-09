"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Building2,
  CheckCircle,
  AlertCircle,
  Zap,
  Loader2,
  Edit,
  Trash2,
  UserPlus,
  MapPin,
  FileText,
  Settings,
  Eye,
  History,
} from "lucide-react";
import useUser from "@/utils/useUser";

export default function TaskDetailPage() {
  const queryClient = useQueryClient();
  const { data: currentUser } = useUser();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Get task ID from URL
  const taskId =
    typeof window !== "undefined"
      ? window.location.pathname.split("/").pop()
      : null;

  const {
    data: taskData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["task", taskId],
    queryFn: async () => {
      const response = await fetch(`/api/tasks/${taskId}`);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch task: ${response.status} ${response.statusText}`,
        );
      }
      return response.json();
    },
    enabled: !!taskId,
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete task");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["tasks"]);
      window.location.href = "/tasks";
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus) => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        throw new Error("Failed to update task status");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["task", taskId]);
      queryClient.invalidateQueries(["tasks"]);
    },
  });

  const task = taskData?.task;

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
        className={`px-3 py-1 rounded-full text-sm font-medium border ${styles[status] || styles.pending}`}
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
      urgent: <Zap className="h-4 w-4" />,
      high: <AlertCircle className="h-4 w-4" />,
      medium: <Clock className="h-4 w-4" />,
      low: <CheckCircle className="h-4 w-4" />,
    };

    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${styles[priority] || styles.medium}`}
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
        className={`px-3 py-1 rounded-full text-sm font-medium ${styles[taskType] || styles.visit}`}
      >
        {labels[taskType] || taskType}
      </span>
    );
  };

  const handleStatusUpdate = (newStatus) => {
    updateStatusMutation.mutate(newStatus);
  };

  const handleDelete = () => {
    deleteTaskMutation.mutate();
    setShowDeleteConfirm(false);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Task
          </h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={() => (window.location.href = "/tasks")}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Task Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The task you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => (window.location.href = "/tasks")}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  const canEdit =
    currentUser?.role === "admin" || currentUser?.role === "supervisor";
  const canAssign = canEdit && !task.assigned_teknisi_id;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => (window.location.href = "/tasks")}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Tasks
            </button>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {task.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                {getTaskTypeBadge(task.task_type)}
                {getPriorityBadge(task.priority)}
                {getStatusBadge(task.status)}
              </div>
            </div>

            {canEdit && (
              <div className="mt-4 lg:mt-0 flex gap-2">
                {canAssign && (
                  <a
                    href={`/assignments/assign?task=${task.id}`}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign
                  </a>
                )}
                <a
                  href={`/tasks/${task.id}/edit`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </a>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {task.description && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Description
                </h2>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {task.description}
                </p>
              </div>
            )}

            {/* Unit & Company Info */}
            {(task.unit_name || task.company_name) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Location Details
                </h2>
                <div className="space-y-4">
                  {task.unit_name && (
                    <div className="flex items-start">
                      <Settings className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {task.unit_name}
                        </p>
                        {task.unit_model && (
                          <p className="text-sm text-gray-600">
                            Model: {task.unit_model}
                          </p>
                        )}
                        <a
                          href={`/units/${task.unit_id}`}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          View Unit Details →
                        </a>
                      </div>
                    </div>
                  )}

                  {task.company_name && (
                    <div className="flex items-start">
                      <Building2 className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {task.company_name}
                        </p>
                        <p className="text-sm text-gray-600">Customer</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Assignment Info */}
            {task.assigned_teknisi_name && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Assignment Details
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <User className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {task.assigned_teknisi_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Assigned Technician
                      </p>
                    </div>
                  </div>

                  {task.assigned_supervisor_name && (
                    <div className="flex items-start">
                      <User className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {task.assigned_supervisor_name}
                        </p>
                        <p className="text-sm text-gray-600">Supervisor</p>
                      </div>
                    </div>
                  )}

                  {task.assigned_at && (
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {new Date(task.assigned_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">Assigned Date</p>
                      </div>
                    </div>
                  )}

                  {task.assignment_notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Assignment Notes:
                      </p>
                      <p className="text-sm text-gray-600">
                        {task.assignment_notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                {task.unit_id && (
                  <a
                    href={`/units/${task.unit_id}`}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Unit
                  </a>
                )}

                {task.unit_id && (
                  <a
                    href={`/units/${task.unit_id}/history`}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <History className="h-4 w-4 mr-2" />
                    Unit History
                  </a>
                )}

                {task.status !== "completed" && task.status !== "closed" && (
                  <div className="border-t pt-3 mt-3">
                    <p className="text-xs font-medium text-gray-500 mb-2">
                      UPDATE STATUS
                    </p>
                    {task.status === "pending" && (
                      <button
                        onClick={() => handleStatusUpdate("in_progress")}
                        disabled={updateStatusMutation.isLoading}
                        className="flex items-center w-full px-3 py-2 text-sm text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Start Work
                      </button>
                    )}
                    {task.status === "in_progress" && (
                      <button
                        onClick={() => handleStatusUpdate("completed")}
                        disabled={updateStatusMutation.isLoading}
                        className="flex items-center w-full px-3 py-2 text-sm text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Complete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Task Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Task Information
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Created</p>
                  <p className="text-sm text-gray-900">
                    {new Date(task.created_at).toLocaleDateString()}
                  </p>
                  {task.created_by_name && (
                    <p className="text-xs text-gray-600">
                      by {task.created_by_name}
                    </p>
                  )}
                </div>

                {task.deadline && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Deadline
                    </p>
                    <p
                      className={`text-sm ${
                        new Date(task.deadline) < new Date()
                          ? "text-red-600 font-medium"
                          : "text-gray-900"
                      }`}
                    >
                      {new Date(task.deadline).toLocaleDateString()}
                    </p>
                    {new Date(task.deadline) < new Date() && (
                      <p className="text-xs text-red-600">Overdue</p>
                    )}
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-500">Task ID</p>
                  <p className="text-sm text-gray-900 font-mono">#{task.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Task
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this task? This action will mark
              the task as closed and cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteTaskMutation.isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteTaskMutation.isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Deleting...
                  </div>
                ) : (
                  "Delete Task"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
