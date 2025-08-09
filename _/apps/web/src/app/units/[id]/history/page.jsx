"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  AlertTriangle,
  Settings,
  Calendar,
  MapPin,
  Building,
  User,
  Phone,
  Mail,
  Clock,
  Activity,
  Wrench,
  FileText,
  Eye,
  Download,
  Filter,
  History,
  CheckCircle2,
  AlertCircle,
  Scan,
  Camera,
  MapPinned,
} from "lucide-react";

export default function UnitHistoryPage({ params }) {
  const [historyFilter, setHistoryFilter] = useState("all");
  const unitId = parseInt(params.id);

  // Fetch unit details
  const {
    data: unitData,
    isLoading: loadingUnit,
    error: unitError,
  } = useQuery({
    queryKey: ["unit", unitId],
    queryFn: async () => {
      const response = await fetch(`/api/units/${unitId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch unit: ${response.status}`);
      }
      return response.json();
    },
  });

  // Fetch unit history
  const {
    data: historyData,
    isLoading: loadingHistory,
    error: historyError,
  } = useQuery({
    queryKey: ["unit-history", unitId, historyFilter],
    queryFn: async () => {
      const url = new URL(`/api/units/${unitId}/history`, window.location.origin);
      if (historyFilter !== "all") {
        url.searchParams.set("type", historyFilter);
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch unit history: ${response.status}`);
      }
      return response.json();
    },
  });

  const unit = unitData?.unit;
  const histories = historyData?.histories || [];

  // Get history type icon and color
  const getHistoryIcon = (type) => {
    const icons = {
      work: <Wrench className="h-5 w-5 text-blue-600" />,
      access: <Eye className="h-5 w-5 text-green-600" />,
      maintenance: <Settings className="h-5 w-5 text-purple-600" />,
      parts: <Wrench className="h-5 w-5 text-orange-600" />,
      session: <Scan className="h-5 w-5 text-indigo-600" />,
    };
    return icons[type] || <Activity className="h-5 w-5 text-gray-600" />;
  };

  const getHistoryColor = (type) => {
    const colors = {
      work: "border-l-blue-500",
      access: "border-l-green-500", 
      maintenance: "border-l-purple-500",
      parts: "border-l-orange-500",
      session: "border-l-indigo-500",
    };
    return colors[type] || "border-l-gray-500";
  };

  if (unitError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Unit
          </h2>
          <p className="text-gray-600">{unitError.message}</p>
        </div>
      </div>
    );
  }

  if (loadingUnit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading unit details...</p>
        </div>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Unit Not Found
          </h2>
          <p className="text-gray-600">The unit you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Unit Details
          </button>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Unit History & Logs
              </h1>
              <p className="text-gray-600">
                {unit.unit_name} • {unit.model} • {unit.company_name}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* History Filter */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Activity Timeline
                </h2>
                <div className="flex gap-2">
                  <select
                    value={historyFilter}
                    onChange={(e) => setHistoryFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Activities</option>
                    <option value="work">Work History</option>  
                    <option value="maintenance">Maintenance</option>
                    <option value="parts">Parts Replacement</option>
                    <option value="sessions">Work Sessions</option>
                    <option value="access">Access Logs</option>
                  </select>
                </div>
              </div>
            </div>

            {/* History Timeline */}
            {loadingHistory ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading history...</p>
                </div>
              </div>
            ) : historyError ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="text-center">
                  <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                  <p className="text-gray-600">Error loading history: {historyError.message}</p>
                </div>
              </div>
            ) : histories.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="text-center">
                  <History className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No History Records</h3>
                  <p className="text-gray-600">No activity records found for this unit yet.</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <div className="flow-root">
                    <ul className="-mb-8">
                      {histories.map((history, index) => (
                        <li key={`${history.type}-${history.id}`}>
                          <div className="relative pb-8">
                            {index !== histories.length - 1 && (
                              <span
                                className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                aria-hidden="true"
                              />
                            )}
                            <div className="relative flex space-x-3">
                              <div className={`flex h-8 w-8 items-center justify-center rounded-full ring-6 ring-white bg-white border-2 ${getHistoryColor(history.type).replace('border-l-', 'border-')}`}>
                                {getHistoryIcon(history.type)}
                              </div>
                              <div className={`min-w-0 flex-1 pt-1.5 border-l-4 pl-4 ${getHistoryColor(history.type)}`}>
                                <div className="flex justify-between">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">
                                      {history.description}
                                    </p>
                                    
                                    {/* Additional details based on type */}
                                    {history.type === 'work' && (
                                      <div className="mt-2 space-y-1">
                                        {history.technician_name && (
                                          <p className="text-xs text-gray-600 flex items-center">
                                            <User className="h-3 w-3 inline mr-1" />
                                            Technician: {history.technician_name}
                                          </p>
                                        )}
                                        {history.task_title && (
                                          <p className="text-xs text-gray-600 flex items-center">
                                            <FileText className="h-3 w-3 inline mr-1" />
                                            Task: {history.task_title}
                                          </p>
                                        )}
                                        {history.work_duration_minutes && (
                                          <p className="text-xs text-gray-600 flex items-center">
                                            <Clock className="h-3 w-3 inline mr-1" />
                                            Duration: {history.work_duration_minutes} minutes
                                          </p>
                                        )}
                                        {(history.gps_latitude && history.gps_longitude) && (
                                          <p className="text-xs text-gray-600 flex items-center">
                                            <MapPinned className="h-3 w-3 inline mr-1" />
                                            Location: {parseFloat(history.gps_latitude).toFixed(6)}, {parseFloat(history.gps_longitude).toFixed(6)}
                                          </p>
                                        )}
                                        {history.photos && history.photos.length > 0 && (
                                          <p className="text-xs text-gray-600 flex items-center">
                                            <Camera className="h-3 w-3 inline mr-1" />
                                            {history.photos.length} photo(s) attached
                                          </p>
                                        )}
                                      </div>
                                    )}

                                    {history.type === 'maintenance' && (
                                      <div className="mt-2 space-y-1">
                                        <div className="flex items-center gap-2">
                                          {history.maintenance_status === 'completed' && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                              <CheckCircle2 className="h-3 w-3 mr-1" />
                                              Completed
                                            </span>
                                          )}
                                          {history.maintenance_status === 'overdue' && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                              <AlertCircle className="h-3 w-3 mr-1" />
                                              Overdue
                                            </span>
                                          )}
                                          {history.maintenance_status === 'due_soon' && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                              <Clock className="h-3 w-3 mr-1" />
                                              Due Soon  
                                            </span>
                                          )}
                                          {history.maintenance_status === 'scheduled' && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                              <Calendar className="h-3 w-3 mr-1" />
                                              Scheduled
                                            </span>
                                          )}
                                        </div>
                                        {history.next_due && (
                                          <p className="text-xs text-gray-600">
                                            Next due: {new Date(history.next_due).toLocaleDateString()}
                                          </p>
                                        )}
                                        {history.frequency_days && (
                                          <p className="text-xs text-gray-600">
                                            Frequency: Every {history.frequency_days} days
                                          </p>
                                        )}
                                      </div>
                                    )}

                                    {history.type === 'parts' && (
                                      <div className="mt-2 space-y-1">
                                        <div className="flex items-center justify-between">
                                          <p className="text-xs font-medium text-gray-700">
                                            {history.part_name} ({history.part_code})
                                          </p>
                                          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                                            Qty: {history.quantity_used}
                                          </span>
                                        </div>
                                        {history.technician_name && (
                                          <p className="text-xs text-gray-600 flex items-center">
                                            <User className="h-3 w-3 inline mr-1" />
                                            Technician: {history.technician_name}
                                          </p>
                                        )}
                                        {history.replacement_reason && (
                                          <p className="text-xs text-gray-600">
                                            <strong>Reason:</strong> {history.replacement_reason}
                                          </p>
                                        )}
                                        {history.part_condition_before && (
                                          <p className="text-xs text-gray-600">
                                            <strong>Previous condition:</strong> {history.part_condition_before}
                                          </p>
                                        )}
                                        {history.warranty_months > 0 && (
                                          <p className="text-xs text-green-600">
                                            <strong>Warranty:</strong> {history.warranty_months} months
                                          </p>
                                        )}
                                        {history.next_replacement_due && (
                                          <p className="text-xs text-gray-600">
                                            <strong>Next replacement due:</strong> {new Date(history.next_replacement_due).toLocaleDateString()}
                                          </p>
                                        )}
                                      </div>
                                    )}

                                    {history.type === 'session' && (
                                      <div className="mt-2 space-y-1">
                                        <div className="flex items-center gap-2">
                                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            history.session_type === 'work_start' ? 'bg-green-100 text-green-800' :
                                            history.session_type === 'work_end' ? 'bg-red-100 text-red-800' :
                                            history.session_type === 'inspection' ? 'bg-blue-100 text-blue-800' :
                                            'bg-purple-100 text-purple-800'
                                          }`}>
                                            {history.session_type.replace('_', ' ').toUpperCase()}
                                          </span>
                                        </div>
                                        {history.technician_name && (
                                          <p className="text-xs text-gray-600 flex items-center">
                                            <User className="h-3 w-3 inline mr-1" />
                                            Technician: {history.technician_name}
                                          </p>
                                        )}
                                        {(history.gps_latitude && history.gps_longitude) && (
                                          <p className="text-xs text-gray-600 flex items-center">
                                            <MapPinned className="h-3 w-3 inline mr-1" />
                                            Location: {parseFloat(history.gps_latitude).toFixed(6)}, {parseFloat(history.gps_longitude).toFixed(6)}
                                          </p>
                                        )}
                                        {history.notes && (
                                          <p className="text-xs text-gray-600">
                                            <strong>Notes:</strong> {history.notes}
                                          </p>
                                        )}
                                      </div>
                                    )}

                                    {history.type === 'access' && (
                                      <div className="mt-2 space-y-1">
                                        <div className="flex items-center gap-2">
                                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            history.access_type === 'qr_scan' ? 'bg-blue-100 text-blue-800' :
                                            history.access_type === 'web' ? 'bg-green-100 text-green-800' :
                                            'bg-gray-100 text-gray-800'
                                          }`}>
                                            {history.access_type.replace('_', ' ').toUpperCase()}
                                          </span>
                                        </div>
                                        {history.ip_address && (
                                          <p className="text-xs text-gray-600">
                                            IP Address: {history.ip_address}
                                          </p>
                                        )}
                                        {history.user_agent && (
                                          <p className="text-xs text-gray-600 truncate">
                                            User Agent: {history.user_agent}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div className="whitespace-nowrap text-right text-sm text-gray-500 ml-4">
                                    <time dateTime={history.date} className="block font-medium">
                                      {new Date(history.date).toLocaleDateString()}  
                                    </time>
                                    <time dateTime={history.date} className="block text-xs">
                                      {new Date(history.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </time>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Unit Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Unit Summary
              </h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{unit.unit_name}</p>
                  <p className="text-sm text-gray-600">{unit.model}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Company</p>
                  <p className="text-sm text-gray-900">{unit.company_name}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Serial Number</p>
                  <p className="text-sm text-gray-900">{unit.serial_number || "N/A"}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Install Date</p>
                  <p className="text-sm text-gray-900">
                    {unit.install_date 
                      ? new Date(unit.install_date).toLocaleDateString()
                      : "N/A"
                    }
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Warranty Status</p>
                  <p className={`text-sm font-medium ${
                    unit.warranty_end && new Date(unit.warranty_end) < new Date()
                      ? "text-red-600"
                      : "text-green-600"
                  }`}>
                    {unit.warranty_end 
                      ? new Date(unit.warranty_end) < new Date()
                        ? "Expired"
                        : "Active"
                      : "N/A"
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Activity Summary
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Records</span>
                  <span className="text-sm font-medium text-gray-900">{histories.length}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Work History</span>
                  <span className="text-sm font-medium text-blue-600">
                    {histories.filter(h => h.type === 'work').length}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Maintenance</span>
                  <span className="text-sm font-medium text-purple-600">
                    {histories.filter(h => h.type === 'maintenance').length}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Parts Replaced</span>
                  <span className="text-sm font-medium text-orange-600">
                    {histories.filter(h => h.type === 'parts').length}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Work Sessions</span>
                  <span className="text-sm font-medium text-indigo-600">
                    {histories.filter(h => h.type === 'session').length}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Access Logs</span>
                  <span className="text-sm font-medium text-green-600">
                    {histories.filter(h => h.type === 'access').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Export History
              </h3>
              
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Download className="h-4 w-4 mr-2" />
                  Export to PDF
                </button>
                
                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Download className="h-4 w-4 mr-2" />
                  Export to CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}