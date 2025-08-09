"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  User,
  UserCheck,
  Calendar,
  AlertTriangle,
  Building,
  Settings,
  Tag,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";

export default function AssignTaskPage() {
  const [selectedTask, setSelectedTask] = useState("");
  const [selectedTeknisi, setSelectedTeknisi] = useState("");
  const [selectedSupervisor, setSelectedSupervisor] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryClient = useQueryClient();

  // Fetch unassigned tasks
  const {
    data: tasksData,
    isLoading: loadingTasks,
    error: tasksError,
  } = useQuery({
    queryKey: ["tasks", "pending"],
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
  const {
    data: usersData,
    isLoading: loadingUsers,
    error: usersError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }
      return response.json();
    },
  });

  // Create assignment mutation
  const createAssignmentMutation = useMutation({
    mutationFn: async (assignmentData) => {
      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assignmentData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create assignment");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      window.location.href = "/assignments";
    },
  });

  const tasks = tasksData?.tasks || [];
  const users = usersData?.users || [];
  const supervisors = users.filter((u) => u.role === "supervisor");
  const teknisiList = users.filter((u) => u.role === "teknisi");

  const selectedTaskData = tasks.find((t) => t.id === parseInt(selectedTask));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTask || !selectedTeknisi || !selectedSupervisor) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await createAssignmentMutation.mutateAsync({
        task_id: parseInt(selectedTask),
        teknisi_id: parseInt(selectedTeknisi),
        supervisor_id: parseInt(selectedSupervisor),
        notes: notes.trim() || null,
      });
    } catch (error) {
      console.error("Error creating assignment:", error);
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const getTaskTypeBadge = (taskType) => {
    const badges = {
      visit: "bg-blue-100 text-blue-800 border-blue-300",
      minor: "bg-green-100 text-green-800 border-green-300",
      major: "bg-orange-100 text-orange-800 border-orange-300",
      kontrak: "bg-purple-100 text-purple-800 border-purple-300",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium border ${badges[taskType] || badges.visit}`}
      >
        {taskType?.toUpperCase() || "VISIT"}
      </span>
    );
  };

  if (tasksError || usersError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Data
          </h2>
          <p className="text-gray-600">
            {tasksError?.message || usersError?.message}
          </p>
        </div>
      </div>
    );
  }

  if (loadingTasks || loadingUsers) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assignments
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Assign Task to Technician
          </h1>
          <p className="text-gray-600">
            Select a task and assign it to a technician with supervisor
            oversight
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Assignment Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Assignment Details
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Task Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Task *
                </label>
                <select
                  value={selectedTask}
                  onChange={(e) => setSelectedTask(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose a task...</option>
                  {tasks.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.title} - {task.unit_name || "No Unit"} (
                      {task.company_name || "No Company"})
                    </option>
                  ))}
                </select>
                {tasks.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    No unassigned tasks available.{" "}
                    <a href="/tasks" className="text-blue-600 hover:underline">
                      Create a new task
                    </a>{" "}
                    first.
                  </p>
                )}
              </div>

              {/* Technician Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Technician *
                </label>
                <select
                  value={selectedTeknisi}
                  onChange={(e) => setSelectedTeknisi(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose a technician...</option>
                  {teknisiList.map((teknisi) => (
                    <option key={teknisi.id} value={teknisi.id}>
                      {teknisi.name} - {teknisi.phone || "No phone"}
                    </option>
                  ))}
                </select>
                {teknisiList.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    No technicians available.{" "}
                    <a
                      href="/users/new"
                      className="text-blue-600 hover:underline"
                    >
                      Add technicians
                    </a>{" "}
                    first.
                  </p>
                )}
              </div>

              {/* Supervisor Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supervisor *
                </label>
                <select
                  value={selectedSupervisor}
                  onChange={(e) => setSelectedSupervisor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose a supervisor...</option>
                  {supervisors.map((supervisor) => (
                    <option key={supervisor.id} value={supervisor.id}>
                      {supervisor.name} - {supervisor.phone || "No phone"}
                    </option>
                  ))}
                </select>
                {supervisors.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    No supervisors available.{" "}
                    <a
                      href="/users/new"
                      className="text-blue-600 hover:underline"
                    >
                      Add supervisors
                    </a>{" "}
                    first.
                  </p>
                )}
              </div>

              {/* Assignment Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignment Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Any special instructions or notes for this assignment..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !selectedTask ||
                    !selectedTeknisi ||
                    !selectedSupervisor
                  }
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Assignment...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Create Assignment
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Task Preview */}
          <div className="space-y-6">
            {selectedTaskData ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Task Preview
                </h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-gray-900">
                        {selectedTaskData.title}
                      </h4>
                      {getPriorityBadge(selectedTaskData.priority)}
                      {getTaskTypeBadge(selectedTaskData.task_type)}
                    </div>

                    {selectedTaskData.description && (
                      <p className="text-sm text-gray-600 mb-4">
                        {selectedTaskData.description}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 pt-4 border-t border-gray-100">
                    {selectedTaskData.unit_name && (
                      <div className="flex items-center text-sm">
                        <Settings className="h-4 w-4 text-gray-400 mr-2" />
                        <span>
                          <strong>Unit:</strong> {selectedTaskData.unit_name}
                        </span>
                      </div>
                    )}

                    {selectedTaskData.company_name && (
                      <div className="flex items-center text-sm">
                        <Building className="h-4 w-4 text-gray-400 mr-2" />
                        <span>
                          <strong>Company:</strong>{" "}
                          {selectedTaskData.company_name}
                        </span>
                      </div>
                    )}

                    {selectedTaskData.deadline && (
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span>
                          <strong>Deadline:</strong>{" "}
                          <span
                            className={
                              new Date(selectedTaskData.deadline) < new Date()
                                ? "text-red-600"
                                : "text-gray-600"
                            }
                          >
                            {new Date(
                              selectedTaskData.deadline,
                            ).toLocaleDateString()}
                            {new Date(selectedTaskData.deadline) < new Date() &&
                              " (Overdue)"}
                          </span>
                        </span>
                      </div>
                    )}

                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span>
                        <strong>Created:</strong>{" "}
                        {new Date(
                          selectedTaskData.created_at,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center text-gray-500">
                  <Tag className="h-8 w-8 mx-auto mb-2" />
                  <p>Select a task to see preview</p>
                </div>
              </div>
            )}

            {/* Selected Personnel Preview */}
            {(selectedTeknisi || selectedSupervisor) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Assignment Team
                </h3>

                <div className="space-y-4">
                  {selectedTeknisi && (
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <User className="h-8 w-8 text-blue-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {
                            teknisiList.find(
                              (t) => t.id === parseInt(selectedTeknisi),
                            )?.name
                          }
                        </p>
                        <p className="text-sm text-gray-600">
                          Technician •{" "}
                          {teknisiList.find(
                            (t) => t.id === parseInt(selectedTeknisi),
                          )?.phone || "No phone"}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedSupervisor && (
                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                      <UserCheck className="h-8 w-8 text-green-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {
                            supervisors.find(
                              (s) => s.id === parseInt(selectedSupervisor),
                            )?.name
                          }
                        </p>
                        <p className="text-sm text-gray-600">
                          Supervisor •{" "}
                          {supervisors.find(
                            (s) => s.id === parseInt(selectedSupervisor),
                          )?.phone || "No phone"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
