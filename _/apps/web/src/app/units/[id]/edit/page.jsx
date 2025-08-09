"use client";

import { Save, ArrowLeft, AlertTriangle } from "lucide-react";
import { useEditUnitForm } from "@/utils/useEditUnitForm";
import { CustomerInfoSection } from "@/components/NewUnitForm/CustomerInfoSection";
import { BasicInfoSection } from "@/components/NewUnitForm/BasicInfoSection";
import { UnitPhotosSection } from "@/components/NewUnitForm/UnitPhotosSection";
import { TechSpecsSection } from "@/components/NewUnitForm/TechSpecsSection";
import { PartsInfoSection } from "@/components/NewUnitForm/PartsInfoSection";
import { DocumentsSection } from "@/components/NewUnitForm/DocumentsSection";

export default function EditUnitPage({ params }) {
  const { id } = params;
  const {
    formData,
    error,
    isNewCompany,
    setIsNewCompany,
    companies,
    uploadLoading,
    unitLoading,
    unit,
    handleUnitPhotoUpload,
    handleDocumentUpload,
    handleCustomerPhotoUpload,
    removeUnitPhoto,
    removeDocument,
    updateUnitMutation,
    handleSubmit,
    handleChange,
  } = useEditUnitForm(id);

  if (unitLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Unit Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The unit you're trying to edit could not be found.
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <a
              href={`/units/${id}`}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Unit Details
            </a>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Unit</h1>
            <p className="text-gray-600 mt-1">
              Update information for {unit.unit_name}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <CustomerInfoSection
            isNewCompany={isNewCompany}
            setIsNewCompany={setIsNewCompany}
            formData={formData}
            handleChange={handleChange}
            companies={companies}
            handleCustomerPhotoUpload={handleCustomerPhotoUpload}
            uploadLoading={uploadLoading}
          />

          <BasicInfoSection formData={formData} handleChange={handleChange} />

          <UnitPhotosSection
            formData={formData}
            uploadLoading={uploadLoading}
            handleUnitPhotoUpload={handleUnitPhotoUpload}
            removeUnitPhoto={removeUnitPhoto}
          />

          <DocumentsSection
            formData={formData}
            uploadLoading={uploadLoading}
            handleDocumentUpload={handleDocumentUpload}
            removeDocument={removeDocument}
          />

          <TechSpecsSection formData={formData} handleChange={handleChange} />

          <PartsInfoSection formData={formData} handleChange={handleChange} />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-4">
            <a
              href={`/units/${id}`}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </a>
            <button
              type="submit"
              disabled={updateUnitMutation.isLoading || uploadLoading}
              className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {updateUnitMutation.isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Unit
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}