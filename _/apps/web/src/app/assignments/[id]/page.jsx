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
  Clock,
  CheckCircle2,
  Play,
  MapPin,
  Phone,
  Mail,
  Edit3,
  Trash2,
  MessageSquare,
} from "lucide-react";

export default function AssignmentDetailPage({ params }) {
  const [showEditNotes, setShowEditNotes] = useState(false);
  const [editNotes, setEditNotes] = useState("");

  const queryClient = useQueryClient();
  const assignmentId = parseInt(params.id);

  // Fetch assignment details
  const {
    data: assignmentData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["assignment", assignmentId],
    queryFn: async () => {
      const response = await fetch(`/api/assignments/${assignmentId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch assignment: ${response.status}`);
      }
      return response.json();
    },
  });

  // Update assignment mutation
  const updateAssignmentMutation = useMutation({
    mutationFn: async ({ action, data }) => {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
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
      queryClient.invalidateQueries({ queryKey: ["assignment", assignmentId] });
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Delete assignment mutation
  const deleteAssignmentMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete assignment");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      window.location.href = "/assignments";
    },
  });

  const assignment = assignmentData?.assignment;

  // Get assignment status
  const getAssignmentStatus = () => {
    if (!assignment) return "pending";
    if (assignment.completed_at) return "completed";
    if (assignment.started_at) return "in_progress";
    return "pending";
  };

  // Get status badge
  const getStatusBadge = () => {
    const status = getAssignmentStatus();
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
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${badges[status]}`}>
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
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${badges[priority] || badges.medium}`}>
        {priority?.toUpperCase() || "MEDIUM"}
      </span>
    );
  };

  // Get task type badge
  const getTaskTypeBadge = (taskType) => {
    const badges = {
      visit: "bg-blue-100 text-blue-800 border-blue-300",
      minor: "bg-green-100 text-green-800 border-green-300",
      major: "bg-orange-100 text-orange-800 border-orange-300",
      kontrak: "bg-purple-100 text-purple-800 border-purple-300",
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${badges[taskType] || badges.visit}`}>
        {taskType?.toUpperCase() || "VISIT"}
      </span>
    );
  };

  // Handle start assignment
  const handleStartAssignment = async () => {
    try {
      await updateAssignmentMutation.mutateAsync({ action: "start" });
    } catch (error) {
      console.error("Error starting assignment:", error);
      alert(error.message);
    }
  };

  // Handle complete assignment
  const handleCompleteAssignment = async () => {
    const notes = prompt("Completion notes (optional):");
    if (notes === null) return; // User cancelled

    try {
      await updateAssignmentMutation.mutateAsync({
        action: "complete",
        data: { completion_notes: notes },
      });
    } catch (error) {
      console.error("Error completing assignment:", error);
      alert(error.message);
    }
  };

  // Handle update notes
  const handleUpdateNotes = async () => {
    try {
      await updateAssignmentMutation.mutateAsync({
        data: { notes: editNotes },
      });
      setShowEditNotes(false);
    } catch (error) {
      console.error("Error updating notes:", error);
      alert(error.message);
    }
  };

  // Handle delete assignment
  const handleDeleteAssignment = async () => {
    if (!confirm("Are you sure you want to delete this assignment? This will reset the task to pending status.")) {
      return;
    }

    try {
      await deleteAssignmentMutation.mutateAsync();
    } catch (error) {
      console.error("Error deleting assignment:", error);
      alert(error.message);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Assignment
          </h2>
          <p className="text-gray-600">{error.message}</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading assignment details...</p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Assignment Not Found
          </h2>
          <p className="text-gray-600">The assignment you're looking for doesn't exist.</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assignments
          </button>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Assignment Details
              </h1>
              <p className="text-gray-600">
                Task assignment for {assignment.teknisi_name}
              </p>
            </div>
            
            <div className="flex items-center gap-3 mt-4 lg:mt-0">
              {getStatusBadge()}
              
              <div className="flex gap-2">
                {!assignment.started_at && (
                  <button
                    onClick={handleStartAssignment}
                    disabled={updateAssignmentMutation.isPending}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Work
                  </button>
                )}

                {assignment.started_at && !assignment.completed_at && (
                  <button
                    onClick={handleCompleteAssignment}
                    disabled={updateAssignmentMutation.isPending}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Complete
                  </button>
                )}

                <button
                  onClick={handleDeleteAssignment}
                  disabled={deleteAssignmentMutation.isPending}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Task Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      {assignment.task_title}
                    </h3>
                    {getPriorityBadge(assignment.priority)}
                    {getTaskTypeBadge(assignment.task_type)}
                  </div>
                  
                  {assignment.task_description && (
                    <p className="text-gray-600 mb-4">
                      {assignment.task_description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  {assignment.unit_name && (
                    <div className="flex items-center text-sm">
                      <Settings className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <span className="text-gray-500">Unit:</span>
                        <p className="font-medium">{assignment.unit_name}</p>
                        {assignment.unit_model && (
                          <p className="text-gray-500 text-xs">{assignment.unit_model}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {assignment.company_name && (
                    <div className="flex items-center text-sm">
                      <Building className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <span className="text-gray-500">Company:</span>
                        <p className="font-medium">{assignment.company_name}</p>
                        {assignment.contact_person && (
                          <p className="text-gray-500 text-xs">{assignment.contact_person}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {assignment.deadline && (
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <span className="text-gray-500">Deadline:</span>
                        <p className={`font-medium ${
                          new Date(assignment.deadline) < new Date()
                            ? "text-red-600"
                            : "text-gray-900"
                        }`}>
                          {new Date(assignment.deadline).toLocaleDateString()}
                          {new Date(assignment.deadline) < new Date() && " (Overdue)"}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <span className="text-gray-500">Task Created:</span>
                      <p className="font-medium">
                        {new Date(assignment.assigned_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Assignment Timeline
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Assignment Created</p>
                    <p className="text-sm text-gray-600">
                      {new Date(assignment.assigned_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {assignment.started_at && (
                  <div className="flex items-center p-4 bg-green-50 rounded-lg">
                    <Play className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Work Started</p>
                      <p className="text-sm text-gray-600">
                        {new Date(assignment.started_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {assignment.completed_at && (
                  <div className="flex items-center p-4 bg-purple-50 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-purple-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Work Completed</p>
                      <p className="text-sm text-gray-600">
                        {new Date(assignment.completed_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {!assignment.started_at && (
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <Clock className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-500">Waiting to Start</p>
                      <p className="text-sm text-gray-400">
                        Assignment is pending technician action
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notes Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Assignment Notes
                </h2>
                <button
                  onClick={() => {
                    setEditNotes(assignment.notes || "");
                    setShowEditNotes(true);
                  }}
                  className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  Edit Notes
                </button>
              </div>

              {showEditNotes ? (
                <div className="space-y-4">
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={6}
                    placeholder="Add notes about this assignment..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateNotes}
                      disabled={updateAssignmentMutation.isPending}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      Save Notes
                    </button>
                    <button
                      onClick={() => setShowEditNotes(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {assignment.notes ? (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {assignment.notes}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                      <p>No notes added yet</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Technician Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Assigned Technician
              </h3>
              
              <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                <User className="h-10 w-10 text-blue-600 mr-4" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {assignment.teknisi_name}
                  </p>
                  <p className="text-sm text-gray-600">Technician</p>
                  
                  <div className="mt-2 space-y-1">
                    {assignment.teknisi_phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-3 w-3 mr-1" />
                        <a href={`tel:${assignment.teknisi_phone}`} className="hover:text-blue-600">
                          {assignment.teknisi_phone}
                        </a>
                      </div>
                    )}
                    {assignment.teknisi_email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-3 w-3 mr-1" />
                        <a href={`mailto:${assignment.teknisi_email}`} className="hover:text-blue-600">
                          {assignment.teknisi_email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Supervisor Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Supervisor
              </h3>
              
              <div className="flex items-center p-4 bg-green-50 rounded-lg">
                <UserCheck className="h-10 w-10 text-green-600 mr-4" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {assignment.supervisor_name}
                  </p>
                  <p className="text-sm text-gray-600">Supervisor</p>
                  
                  <div className="mt-2 space-y-1">
                    {assignment.supervisor_phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-3 w-3 mr-1" />
                        <a href={`tel:${assignment.supervisor_phone}`} className="hover:text-green-600">
                          {assignment.supervisor_phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Company Contact Info */}
            {assignment.company_name && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Company Contact
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-gray-900">{assignment.company_name}</p>
                    {assignment.contact_person && (
                      <p className="text-sm text-gray-600">{assignment.contact_person}</p>
                    )}
                  </div>
                  
                  {assignment.company_phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      <a href={`tel:${assignment.company_phone}`} className="hover:text-blue-600">
                        {assignment.company_phone}
                      </a>
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