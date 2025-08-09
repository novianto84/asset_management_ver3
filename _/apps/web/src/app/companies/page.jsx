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
  Building2,
  Plus,
  Search,
  Edit,
  Trash2,
  User,
  Phone,
  Mail,
  MapPin,
  Eye,
  AlertTriangle,
  Factory,
} from "lucide-react";
import useUser from "@/utils/useUser";
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

function CompaniesPageContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: currentUser } = useUser();
  const queryClient = useQueryClient();

  const {
    data: companiesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["companies", searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await fetch(`/api/companies?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch companies");
      }
      return response.json();
    },
  });

  const deleteCompanyMutation = useMutation({
    mutationFn: async (companyId) => {
      const response = await fetch(`/api/companies/${companyId}`, {
        method: "DELETE",
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("Delete failed:", responseData);
        throw new Error(
          responseData.error ||
            responseData.details ||
            "Failed to delete company",
        );
      }
      return responseData;
    },
    onSuccess: (data) => {
      console.log("Delete successful:", data);
      // Refresh companies list
      queryClient.invalidateQueries(["companies"]);
    },
    onError: (error) => {
      console.error("Delete mutation error:", error);
      alert(`Error deleting company: ${error.message}`);
    },
  });

  const handleDeleteCompany = async (company) => {
    const confirmMessage = `Are you sure you want to delete "${company.name}"? This action cannot be undone.`;

    if (confirm(confirmMessage)) {
      try {
        console.log("Attempting to delete company:", company.id);
        await deleteCompanyMutation.mutateAsync(company.id);
        alert(`Company "${company.name}" has been deleted successfully.`);
      } catch (error) {
        console.error("Error in handleDeleteCompany:", error);
        // Error is already handled in mutation onError
      }
    }
  };

  const companies = companiesData?.companies || [];

  const canEdit =
    currentUser?.role === "admin" || currentUser?.role === "supervisor";

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Companies
          </h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
                <p className="mt-2 text-gray-600">
                  Manage customer companies and their information
                </p>
              </div>
              {canEdit && (
                <div className="mt-4 sm:mt-0">
                  <a
                    href="/companies/new"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Company
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search companies..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Companies Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Companies Found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm
                  ? "No companies match your search criteria"
                  : "Get started by adding your first company"}
              </p>
              {canEdit && !searchTerm && (
                <a
                  href="/companies/new"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Company
                </a>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((company) => (
                <div
                  key={company.id}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    {/* Company Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3">
                        {company.customer_photo ? (
                          <img
                            src={company.customer_photo}
                            alt={company.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-blue-600" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {company.name}
                          </h3>
                          {company.industry && (
                            <div className="flex items-center mt-1">
                              <Factory className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="text-sm text-gray-600 capitalize">
                                {company.industry}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Company Details */}
                    <div className="space-y-2 mb-4">
                      {company.contact_person && (
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="truncate">
                            {company.contact_person}
                          </span>
                        </div>
                      )}

                      {company.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{company.phone}</span>
                        </div>
                      )}

                      {company.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="truncate">{company.email}</span>
                        </div>
                      )}

                      {company.address && (
                        <div className="flex items-start text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">
                            {company.address}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Audit Info */}
                    <div className="text-xs text-gray-500 mb-4">
                      <p>
                        Created:{" "}
                        {new Date(company.created_at).toLocaleDateString()}
                        {company.created_by_name &&
                          ` by ${company.created_by_name}`}
                      </p>
                      {company.updated_at && (
                        <p>
                          Updated:{" "}
                          {new Date(company.updated_at).toLocaleDateString()}
                          {company.updated_by_name &&
                            ` by ${company.updated_by_name}`}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-2">
                      <a
                        href={`/companies/${company.id}`}
                        className="inline-flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </a>

                      {canEdit && (
                        <>
                          <a
                            href={`/companies/${company.id}/edit`}
                            className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </a>

                          <button
                            onClick={() => handleDeleteCompany(company)}
                            disabled={deleteCompanyMutation.isPending}
                            className="inline-flex items-center px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            {deleteCompanyMutation.isPending
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          {!isLoading && companies.length > 0 && (
            <div className="mt-8 text-center text-sm text-gray-600">
              Showing {companies.length} companies
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CompaniesPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <CompaniesPageContent />
    </QueryClientProvider>
  );
}
