"use client";

import { Save } from "lucide-react";
import { useNewUnitForm } from "@/utils/useNewUnitForm";
import { FormHeader } from "@/components/NewUnitForm/FormHeader";
import { CustomerInfoSection } from "@/components/NewUnitForm/CustomerInfoSection";
import { BasicInfoSection } from "@/components/NewUnitForm/BasicInfoSection";
import { UnitPhotosSection } from "@/components/NewUnitForm/UnitPhotosSection";
import { TechSpecsSection } from "@/components/NewUnitForm/TechSpecsSection";
import { PartsInfoSection } from "@/components/NewUnitForm/PartsInfoSection";

export default function NewUnitPage() {
  const {
    formData,
    error,
    isNewCompany,
    setIsNewCompany,
    companies,
    uploadLoading,
    handleUnitPhotoUpload,
    handleCustomerPhotoUpload,
    removeUnitPhoto,
    createUnitMutation,
    handleSubmit,
    handleChange,
  } = useNewUnitForm();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FormHeader />

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

          <TechSpecsSection formData={formData} handleChange={handleChange} />

          <PartsInfoSection formData={formData} handleChange={handleChange} />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-4">
            <a
              href="/"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </a>
            <button
              type="submit"
              disabled={createUnitMutation.isLoading || uploadLoading}
              className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {createUnitMutation.isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Unit
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
