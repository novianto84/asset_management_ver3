"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Edit,
  QrCode,
  Calendar,
  Settings,
  MapPin,
  Clock,
  AlertTriangle,
  Camera,
  Building2,
  History,
  User,
  FileText,
  Eye,
  Wrench,
  Activity,
  CheckCircle2,
  AlertCircle,
  Scan,
  MapPinned,
  Download,
} from "lucide-react";

export default function UnitDetailPage({ params }) {
  const { id } = params;
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [loadingQr, setLoadingQr] = useState(false);

  const {
    data: unitData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["unit", id],
    queryFn: async () => {
      const response = await fetch(`/api/units/${id}`);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch unit: ${response.status} ${response.statusText}`,
        );
      }
      return response.json();
    },
  });

  const unit = unitData?.unit;

  // Generate QR Code
  const generateQrCode = async () => {
    if (!unit?.serial_number_engine) {
      alert("No engine serial number available for QR generation");
      return;
    }

    setLoadingQr(true);
    try {
      const qrUrl = `${window.location.origin}/unit/${unit.serial_number_engine}`;
      const response = await fetch(
        `/integrations/qr-code/generatebasicbase64?data=${encodeURIComponent(qrUrl)}&size=300`,
      );

      if (!response.ok) {
        throw new Error("Failed to generate QR code");
      }

      const base64QrCode = await response.text();
      setQrCodeUrl(`data:image/png;base64,${base64QrCode}`);
    } catch (error) {
      console.error("Error generating QR code:", error);
      alert("Failed to generate QR code");
    } finally {
      setLoadingQr(false);
    }
  };

  // Download QR Code
  const downloadQrCode = () => {
    if (!qrCodeUrl || !unit) return;

    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `QR_${unit.unit_name}_Engine_${unit.serial_number_engine}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !unit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Unit Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            {error?.message || "The requested unit could not be found."}
          </p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Units
          </a>
        </div>
      </div>
    );
  }

  const getStatusColor = () => {
    const now = new Date();
    const warrantyEnd = unit.warranty_end ? new Date(unit.warranty_end) : null;

    if (warrantyEnd && warrantyEnd < now) {
      return "bg-red-100 border-red-300 text-red-800";
    }

    return "bg-green-100 border-green-300 text-green-800";
  };

  const getStatusText = () => {
    const now = new Date();
    const warrantyEnd = unit.warranty_end ? new Date(unit.warranty_end) : null;

    if (warrantyEnd && warrantyEnd < now) {
      return "Warranty Expired";
    }

    return "Active";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <a
              href="/"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Units
            </a>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {unit.unit_name}
              </h1>
              <p className="text-gray-600 mt-1">
                {unit.model} • {unit.company_name}
              </p>
            </div>

            <div className="flex gap-3">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor()}`}
              >
                {getStatusText()}
              </span>
              <a
                href={`/units/${id}/edit`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Unit
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Unit Photos */}
            {unit.unit_photos && unit.unit_photos.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Camera className="h-5 w-5 mr-2" />
                  Unit Photos
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {unit.unit_photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`Unit photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200 group-hover:shadow-md transition-shadow"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all cursor-pointer"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Engine Serial Number (Primary ID)
                  </label>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-900 font-semibold text-lg">
                      {unit.serial_number_engine || "N/A"}
                    </p>
                    {unit.serial_number_engine && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Primary ID
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Box Serial Number
                  </label>
                  <p className="text-gray-900">{unit.serial_number || "N/A"}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Unit Name
                  </label>
                  <p className="text-gray-900">{unit.unit_name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Model Engine (Brand)
                  </label>
                  <p className="text-gray-900">{unit.model}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Engine Model
                  </label>
                  <p className="text-gray-900">{unit.model_engine || "N/A"}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Model Generator (Brand)
                  </label>
                  <p className="text-gray-900">
                    {unit.model_generator || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Generator Serial Number
                  </label>
                  <p className="text-gray-900">
                    {unit.serial_number_generator || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Company
                  </label>
                  <p className="text-gray-900">{unit.company_name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Install Date
                  </label>
                  <p className="text-gray-900">
                    {unit.install_date
                      ? new Date(unit.install_date).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Register Date
                  </label>
                  <p className="text-gray-900">
                    {unit.register_date
                      ? new Date(unit.register_date).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Warranty End
                  </label>
                  <p className="text-gray-900">
                    {unit.warranty_end
                      ? new Date(unit.warranty_end).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Access Token
                  </label>
                  <p className="text-xs text-gray-600 font-mono bg-gray-50 p-2 rounded">
                    {unit.access_token}
                  </p>
                </div>
              </div>

              {unit.specifications && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Additional Specifications
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {unit.specifications}
                  </p>
                </div>
              )}
            </div>

            {/* Technical Specifications */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Technical Specifications
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Frequency
                  </label>
                  <p className="text-gray-900">
                    {unit.frequency_hz ? `${unit.frequency_hz} Hz` : "N/A"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    RPM
                  </label>
                  <p className="text-gray-900">{unit.rpm || "N/A"}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Module Control
                  </label>
                  <p className="text-gray-900 uppercase">
                    {unit.module_control || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    System Operation
                  </label>
                  <p className="text-gray-900 capitalize">
                    {unit.system_operation || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Operation Mode
                  </label>
                  <p className="text-gray-900 capitalize">
                    {unit.operation_mode?.replace("_", " ") || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Transfer System
                  </label>
                  <p className="text-gray-900 capitalize">
                    {unit.transfer_system || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Oil Capacity
                  </label>
                  <p className="text-gray-900">
                    {unit.oil_capacity_liters
                      ? `${unit.oil_capacity_liters} L`
                      : "N/A"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Oil Type
                  </label>
                  <p className="text-gray-900">{unit.oil_type || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Parts Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Parts Information
              </h2>

              <div className="space-y-6">
                {/* Fuel Filter */}
                <div>
                  <h3 className="text-md font-medium text-gray-800 mb-3">
                    Fuel Filter
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Part Number
                      </label>
                      <p className="text-gray-900">
                        {unit.fuel_filter_part_number || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Quantity
                      </label>
                      <p className="text-gray-900">
                        {unit.fuel_filter_qty || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Fuel Separator */}
                <div>
                  <h3 className="text-md font-medium text-gray-800 mb-3">
                    Fuel Separator
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Part Number
                      </label>
                      <p className="text-gray-900">
                        {unit.fuel_separator_part_number || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Quantity
                      </label>
                      <p className="text-gray-900">
                        {unit.fuel_separator_qty || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Oil Filter */}
                <div>
                  <h3 className="text-md font-medium text-gray-800 mb-3">
                    Oil Filter
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Part Number
                      </label>
                      <p className="text-gray-900">
                        {unit.oil_filter_part_number || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Quantity
                      </label>
                      <p className="text-gray-900">
                        {unit.oil_filter_qty || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Air Filter */}
                <div>
                  <h3 className="text-md font-medium text-gray-800 mb-3">
                    Air Filter
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Part Number
                      </label>
                      <p className="text-gray-900">
                        {unit.air_filter_part_number || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Quantity
                      </label>
                      <p className="text-gray-900">
                        {unit.air_filter_qty || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Documents & Work History Files
              </h2>

              <div className="space-y-6">
                {/* Unit Documents */}
                <div>
                  <h3 className="text-md font-medium text-gray-800 mb-3">
                    Unit Manuals & Certificates
                  </h3>
                  {unit.documents && unit.documents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {unit.documents.map((doc, index) => {
                        const fileName = doc.split('/').pop() || `Document ${index + 1}`;
                        return (
                          <div key={index} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <FileText className="h-5 w-5 text-red-600 mr-3" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {fileName}
                              </p>
                              <p className="text-xs text-gray-500">Unit Manual/Certificate</p>
                            </div>
                            <a
                              href={doc}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 p-1 text-blue-600 hover:text-blue-800"
                              title="View document"
                            >
                              <Eye className="h-4 w-4" />
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No unit documents available</p>
                  )}
                </div>

                {/* Work History Documents */}
                <div>
                  <h3 className="text-md font-medium text-gray-800 mb-3">
                    Work Completion Reports
                  </h3>
                  {unitData?.workHistoryDocuments && unitData.workHistoryDocuments.length > 0 ? (
                    <div className="space-y-3">
                      {unitData.workHistoryDocuments.map((item, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-gray-900">
                              {item.work_date ? new Date(item.work_date).toLocaleDateString() : 'Work Session'}
                            </h4>
                            {item.teknisi_name && (
                              <span className="text-xs text-gray-500">by {item.teknisi_name}</span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                          )}
                          {item.documents && item.documents.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {item.documents.map((doc, docIndex) => {
                                const fileName = doc.split('/').pop() || `Report ${docIndex + 1}`;
                                return (
                                  <div key={docIndex} className="flex items-center p-2 bg-gray-50 rounded">
                                    <FileText className="h-4 w-4 text-red-600 mr-2" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium text-gray-900 truncate">
                                        {fileName}
                                      </p>
                                    </div>
                                    <a
                                      href={doc}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="ml-2 p-1 text-blue-600 hover:text-blue-800"
                                      title="View document"
                                    >
                                      <Eye className="h-3 w-3" />
                                    </a>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No work history documents available</p>
                  )}
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">Document Upload</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        PDF documents are automatically uploaded when teknisi complete work sessions. 
                        Unit manuals can be uploaded by admin/supervisor during unit editing.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - QR & Actions */}
          <div className="space-y-6">
            {/* QR Code Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <QrCode className="h-5 w-5 mr-2" />
                QR Code Access
              </h3>

              <div className="text-center">
                <div className="bg-gray-100 p-4 rounded-lg mb-4 min-h-[200px] flex items-center justify-center">
                  {qrCodeUrl ? (
                    <img
                      src={qrCodeUrl}
                      alt="Unit QR Code"
                      className="max-w-full max-h-48 rounded"
                    />
                  ) : (
                    <div className="flex flex-col items-center">
                      <QrCode className="h-24 w-24 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">
                        Click below to generate QR code
                      </p>
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  QR code links to:{" "}
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    /unit/{unit?.serial_number_engine || "ENGINE_SERIAL"}
                  </span>
                </p>

                <p className="text-sm text-gray-600 mb-4">
                  Anyone can scan this QR code to view unit info. Teknisi can
                  start work sessions after login.
                </p>

                <div className="space-y-2">
                  <button
                    onClick={generateQrCode}
                    disabled={loadingQr}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loadingQr
                      ? "Generating..."
                      : qrCodeUrl
                        ? "Regenerate QR Code"
                        : "Generate QR Code"}
                  </button>

                  {qrCodeUrl && (
                    <button
                      onClick={downloadQrCode}
                      className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download QR Code
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Company Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Customer Information
              </h3>

              {/* Customer Photo */}
              {unit.customer_photo && (
                <div className="mb-4 text-center">
                  <img
                    src={unit.customer_photo}
                    alt="Customer"
                    className="w-20 h-20 rounded-full object-cover mx-auto mb-2 border-2 border-gray-200"
                  />
                  <p className="text-sm text-gray-600">Customer Photo</p>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Company Name
                  </label>
                  <p className="text-gray-900">{unit.company_name}</p>
                </div>

                {unit.industry && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Industry
                    </label>
                    <p className="text-gray-900 capitalize">{unit.industry}</p>
                  </div>
                )}

                {unit.company_address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Address
                    </label>
                    <p className="text-gray-900">{unit.company_address}</p>
                  </div>
                )}

                {unit.contact_person && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Contact Person
                    </label>
                    <p className="text-gray-900">{unit.contact_person}</p>
                  </div>
                )}

                {unit.company_phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Phone
                    </label>
                    <p className="text-gray-900">{unit.company_phone}</p>
                  </div>
                )}

                {unit.company_email && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Email
                    </label>
                    <p className="text-gray-900">{unit.company_email}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>

              <div className="space-y-3">
                <a
                  href={`/units/${id}/history`}
                  className="w-full flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <History className="h-4 w-4 mr-3" />
                  View History & Logs
                </a>

                <a
                  href={`/units/${id}/tasks`}
                  className="w-full flex items-center px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Calendar className="h-4 w-4 mr-3" />
                  View Tasks
                </a>

                <a
                  href={`/units/${id}/maintenance`}
                  className="w-full flex items-center px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Settings className="h-4 w-4 mr-3" />
                  Maintenance History
                </a>

                <a
                  href={`/units/${id}/work-sessions`}
                  className="w-full flex items-center px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Clock className="h-4 w-4 mr-3" />
                  Work Sessions
                </a>

                <a
                  href={`/units/${id}/location`}
                  className="w-full flex items-center px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <MapPin className="h-4 w-4 mr-3" />
                  Location Tracking
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}