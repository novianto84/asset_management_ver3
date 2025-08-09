"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Edit, Building2, User, Phone, Mail, MapPin, Factory, Camera, Calendar, History, Trash2 } from "lucide-react";
import useUser from "@/utils/useUser";

export default function CompanyDetailPage({ params }) {
  const { id } = params;
  const { data: currentUser } = useUser();

  const { data: companyData, isLoading, error } = useQuery({
    queryKey: ["company", id],
    queryFn: async () => {
      const response = await fetch(`/api/companies/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch company");
      }
      return response.json();
    },
  });

  const canEdit = currentUser?.role === "admin" || currentUser?.role === "supervisor";
  const company = companyData?.company;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Company Not Found</h2>
          <p className="text-gray-600 mb-4">The requested company could not be found.</p>
          <a
            href="/companies"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Companies
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <a
              href="/companies"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Companies
            </a>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center">
              {company.customer_photo ? (
                <img
                  src={company.customer_photo}
                  alt={company.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 mr-4"
                />
              ) : (
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
                {company.industry && (
                  <div className="flex items-center mt-1">
                    <Factory className="h-4 w-4 text-gray-400 mr-1" />
                    <p className="text-gray-600 capitalize">{company.industry}</p>
                  </div>
                )}
              </div>
            </div>

            {canEdit && (
              <a
                href={`/companies/${id}/edit`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Company
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Company Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Company Name
                  </label>
                  <p className="text-gray-900 font-semibold">{company.name}</p>
                </div>

                {company.industry && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Industry
                    </label>
                    <div className="flex items-center">
                      <Factory className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="text-gray-900 capitalize">{company.industry}</p>
                    </div>
                  </div>
                )}

                {company.address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Address
                    </label>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-900">{company.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Contact Information
              </h2>

              <div className="space-y-4">
                {company.contact_person && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Contact Person
                    </label>
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="text-gray-900">{company.contact_person}</p>
                    </div>
                  </div>
                )}

                {company.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Phone Number
                    </label>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <a
                        href={`tel:${company.phone}`}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {company.phone}
                      </a>
                    </div>
                  </div>
                )}

                {company.email && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Email Address
                    </label>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <a
                        href={`mailto:${company.email}`}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {company.email}
                      </a>
                    </div>
                  </div>
                )}

                {!company.contact_person && !company.phone && !company.email && (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No contact information available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Photo Section */}
            {company.customer_photo && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Camera className="h-5 w-5 mr-2" />
                  Customer Photo
                </h2>
                
                <div className="text-center">
                  <img
                    src={company.customer_photo}
                    alt={company.name}
                    className="w-48 h-48 rounded-lg object-cover border border-gray-200 mx-auto"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Metadata & Actions */}
          <div className="space-y-6">
            {/* Account Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <History className="h-5 w-5 mr-2" />
                Account Information
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Company ID
                  </label>
                  <p className="text-gray-900 font-mono text-sm">{company.id}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Created Date
                  </label>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-gray-900 text-sm">
                      {new Date(company.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                {company.updated_at && 
                  new Date(company.updated_at) > new Date(company.created_at) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Last Updated
                    </label>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="text-gray-900 text-sm">
                        {new Date(company.updated_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
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
                {canEdit && (
                  <a
                    href={`/companies/${id}/edit`}
                    className="w-full flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Edit className="h-4 w-4 mr-3" />
                    Edit Company
                  </a>
                )}

                <a
                  href={`/units?company=${id}`}
                  className="w-full flex items-center px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Building2 className="h-4 w-4 mr-3" />
                  View Units
                </a>

                <a
                  href={`/tasks?company=${id}`}
                  className="w-full flex items-center px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Calendar className="h-4 w-4 mr-3" />
                  View Tasks
                </a>
              </div>
            </div>

            {/* Statistics (if needed) */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Statistics
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Units</span>
                  <span className="font-semibold">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Open Tasks</span>
                  <span className="font-semibold">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed Tasks</span>
                  <span className="font-semibold">-</span>
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                Statistics will be calculated based on related units and tasks.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}