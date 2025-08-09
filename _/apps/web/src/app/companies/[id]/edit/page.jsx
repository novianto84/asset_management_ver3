"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, AlertCircle, Loader2, Upload, X } from "lucide-react";
import useUpload from "@/utils/useUpload";

export default function EditCompanyPage({ params }) {
  const { id } = params;
  const queryClient = useQueryClient();
  const [upload, { loading: uploading }] = useUpload();
  
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    contact_person: "",
    email: "",
    customer_photo: "",
    industry: "",
  });
  const [error, setError] = useState(null);

  // Fetch company data
  const {
    data: companyData,
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ["company", id],
    queryFn: async () => {
      const response = await fetch(`/api/companies/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch company");
      }
      return response.json();
    },
  });

  // Update form data when company data is loaded
  useEffect(() => {
    if (companyData?.company) {
      const company = companyData.company;
      setFormData({
        name: company.name || "",
        address: company.address || "",
        phone: company.phone || "",
        contact_person: company.contact_person || "",
        email: company.email || "",
        customer_photo: company.customer_photo || "",
        industry: company.industry || "",
      });
    }
  }, [companyData]);

  const updateCompanyMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch(`/api/companies/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update company");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["company", id]);
      queryClient.invalidateQueries(["companies"]);
      window.location.href = "/companies";
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const deleteCompanyMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/companies/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete company");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["companies"]);
      window.location.href = "/companies";
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!formData.name) {
      setError("Company name is required");
      return;
    }

    // Email validation
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address");
        return;
      }
    }

    updateCompanyMutation.mutate(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { url, error: uploadError } = await upload({ file });
      if (uploadError) {
        setError(uploadError);
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        customer_photo: url
      }));
    } catch (err) {
      setError("Failed to upload photo");
    }
  };

  const removePhoto = () => {
    setFormData(prev => ({
      ...prev,
      customer_photo: ""
    }));
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${companyData?.company?.name}? This action cannot be undone.`)) {
      deleteCompanyMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">Loading company data...</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Company
          </h2>
          <p className="text-gray-600 mb-4">{fetchError.message}</p>
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <a
              href="/companies"
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </a>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Company</h1>
              <p className="text-gray-600 mt-1">
                Update company information and details
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Customer Photo */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Customer Photo
              </h3>
              
              <div className="flex items-center space-x-4">
                {formData.customer_photo ? (
                  <div className="relative">
                    <img
                      src={formData.customer_photo}
                      alt="Customer"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-200">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                
                <div>
                  <label
                    htmlFor="photo-upload"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? "Uploading..." : "Upload Photo"}
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    JPG, PNG or GIF. Max size 10MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Company Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Company Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter company name"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact_person"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Contact Person
                  </label>
                  <input
                    type="text"
                    id="contact_person"
                    name="contact_person"
                    value={formData.contact_person}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter contact person name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="industry"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Industry
                  </label>
                  <select
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select industry</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="construction">Construction</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="education">Education</option>
                    <option value="retail">Retail</option>
                    <option value="hospitality">Hospitality</option>
                    <option value="agriculture">Agriculture</option>
                    <option value="government">Government</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter company address"
                  />
                </div>
              </div>
            </div>

            {/* Account Info */}
            {companyData?.company && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Account Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Company ID:</strong> {companyData.company.id}</p>
                    <p><strong>Created:</strong> {new Date(companyData.company.created_at).toLocaleString()}</p>
                    {companyData.company.created_by_name && (
                      <p><strong>Created by:</strong> {companyData.company.created_by_name}</p>
                    )}
                    {companyData.company.updated_at && (
                      <p><strong>Last Updated:</strong> {new Date(companyData.company.updated_at).toLocaleString()}</p>
                    )}
                    {companyData.company.updated_by_name && (
                      <p><strong>Updated by:</strong> {companyData.company.updated_by_name}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteCompanyMutation.isPending}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteCompanyMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Company"
                )}
              </button>

              <div className="flex space-x-3">
                <a
                  href="/companies"
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </a>
                <button
                  type="submit"
                  disabled={updateCompanyMutation.isPending || uploading}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateCompanyMutation.isPending ? "Updating..." : "Update Company"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Audit Trail Information:
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• All changes are tracked with user stamps and timestamps</li>
            <li>• Company deletion is soft delete - data is preserved for records</li>
            <li>• Cannot delete companies that have active units assigned</li>
            <li>• Photo uploads are automatically processed and stored</li>
          </ul>
        </div>
      </div>
    </div>
  );
}