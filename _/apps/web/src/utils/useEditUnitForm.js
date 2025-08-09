"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useUpload from "@/utils/useUpload";

export function useEditUnitForm(unitId) {
  const queryClient = useQueryClient();
  const [upload, { loading: uploadLoading }] = useUpload();

  const [formData, setFormData] = useState({
    company_id: "",
    unit_name: "",
    model: "",
    model_engine: "",
    model_generator: "",
    serial_number: "",
    serial_number_engine: "",
    serial_number_generator: "",
    install_date: "",
    specifications: "",
    warranty_end: "",
    register_date: "",
    frequency_hz: "",
    rpm: "",
    module_control: "",
    system_operation: "",
    operation_mode: "",
    transfer_system: "",
    oil_capacity_liters: "",
    oil_type: "",
    fuel_filter_part_number: "",
    fuel_filter_qty: 1,
    fuel_separator_part_number: "",
    fuel_separator_qty: 1,
    oil_filter_part_number: "",
    oil_filter_qty: 1,
    air_filter_part_number: "",
    air_filter_qty: 1,
    unit_photos: [],
    documents: [],
    // Company fields
    company_name: "",
    company_address: "",
    company_phone: "",
    contact_person: "",
    company_email: "",
    customer_photo: "",
    industry: "",
  });

  const [error, setError] = useState(null);
  const [isNewCompany, setIsNewCompany] = useState(false);

  // Fetch unit data
  const { data: unitData, isLoading: unitLoading } = useQuery({
    queryKey: ["unit", unitId],
    queryFn: async () => {
      const response = await fetch(`/api/units/${unitId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch unit");
      }
      return response.json();
    },
  });

  // Fetch companies
  const { data: companiesData } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const response = await fetch("/api/companies");
      if (!response.ok) {
        throw new Error("Failed to fetch companies");
      }
      return response.json();
    },
  });

  const companies = companiesData?.companies || [];
  const unit = unitData?.unit;

  // Populate form data when unit is loaded
  useEffect(() => {
    if (unit) {
      setFormData({
        company_id: unit.company_id || "",
        unit_name: unit.unit_name || "",
        model: unit.model || "",
        model_engine: unit.model_engine || "",
        model_generator: unit.model_generator || "",
        serial_number: unit.serial_number || "",
        serial_number_engine: unit.serial_number_engine || "",
        serial_number_generator: unit.serial_number_generator || "",
        install_date: unit.install_date || "",
        specifications: unit.specifications || "",
        warranty_end: unit.warranty_end || "",
        register_date: unit.register_date || "",
        frequency_hz: unit.frequency_hz || "",
        rpm: unit.rpm || "",
        module_control: unit.module_control || "",
        system_operation: unit.system_operation || "",
        operation_mode: unit.operation_mode || "",
        transfer_system: unit.transfer_system || "",
        oil_capacity_liters: unit.oil_capacity_liters || "",
        oil_type: unit.oil_type || "",
        fuel_filter_part_number: unit.fuel_filter_part_number || "",
        fuel_filter_qty: unit.fuel_filter_qty || 1,
        fuel_separator_part_number: unit.fuel_separator_part_number || "",
        fuel_separator_qty: unit.fuel_separator_qty || 1,
        oil_filter_part_number: unit.oil_filter_part_number || "",
        oil_filter_qty: unit.oil_filter_qty || 1,
        air_filter_part_number: unit.air_filter_part_number || "",
        air_filter_qty: unit.air_filter_qty || 1,
        unit_photos: unit.unit_photos || [],
        documents: unit.documents || [],
        // Company fields
        company_name: unit.company_name || "",
        company_address: unit.company_address || "",
        company_phone: unit.company_phone || "",
        contact_person: unit.contact_person || "",
        company_email: unit.company_email || "",
        customer_photo: unit.customer_photo || "",
        industry: unit.industry || "",
      });
    }
  }, [unit]);

  const handleUnitPhotoUpload = async (file) => {
    try {
      const { url, error } = await upload({ file });
      if (error) {
        setError(error);
        return;
      }
      setFormData((prev) => ({
        ...prev,
        unit_photos: [...prev.unit_photos, url],
      }));
    } catch (err) {
      setError("Failed to upload photo");
    }
  };

  const handleDocumentUpload = async (file) => {
    try {
      const { url, error } = await upload({ file });
      if (error) {
        setError(error);
        return;
      }
      setFormData((prev) => ({
        ...prev,
        documents: [...prev.documents, url],
      }));
    } catch (err) {
      setError("Failed to upload document");
    }
  };

  const handleCustomerPhotoUpload = async (file) => {
    try {
      const { url, error } = await upload({ file });
      if (error) {
        setError(error);
        return;
      }
      setFormData((prev) => ({
        ...prev,
        customer_photo: url,
      }));
    } catch (err) {
      setError("Failed to upload customer photo");
    }
  };

  const removeUnitPhoto = (index) => {
    setFormData((prev) => ({
      ...prev,
      unit_photos: prev.unit_photos.filter((_, i) => i !== index),
    }));
  };

  const removeDocument = (index) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  const updateUnitMutation = useMutation({
    mutationFn: async (data) => {
      let companyId = data.company_id;

      if (isNewCompany) {
        const companyResponse = await fetch("/api/companies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.company_name,
            address: data.company_address,
            phone: data.company_phone,
            contact_person: data.contact_person,
            email: data.company_email,
            customer_photo: data.customer_photo,
            industry: data.industry,
          }),
        });
        if (!companyResponse.ok) {
          const errorData = await companyResponse.json();
          throw new Error(errorData.error || "Failed to create company");
        }
        const companyResult = await companyResponse.json();
        companyId = companyResult.company.id;
      }

      const unitData = { ...data, company_id: companyId };
      const unitResponse = await fetch(`/api/units/${unitId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(unitData),
      });

      if (!unitResponse.ok) {
        const errorData = await unitResponse.json();
        throw new Error(
          errorData.details || errorData.error || "Failed to update unit"
        );
      }
      return unitResponse.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["unit", unitId]);
      queryClient.invalidateQueries(["units"]);
      queryClient.invalidateQueries(["companies"]);
      window.location.href = `/units/${unitId}`;
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    let finalModelEngine = formData.model;
    if (formData.model === "add_new" && formData.custom_engine) {
      finalModelEngine = formData.custom_engine;
    }

    let finalModelGenerator = formData.model_generator;
    if (formData.model_generator === "add_new" && formData.custom_generator) {
      finalModelGenerator = formData.custom_generator;
    }

    let finalRpm = formData.rpm;
    if (formData.rpm === "add_new" && formData.custom_rpm) {
      finalRpm = formData.custom_rpm;
    }

    const processedData = {
      ...formData,
      model: finalModelEngine,
      model_generator: finalModelGenerator,
      frequency_hz: formData.frequency_hz
        ? parseInt(formData.frequency_hz)
        : null,
      rpm: finalRpm ? parseInt(finalRpm) : null,
      oil_capacity_liters: formData.oil_capacity_liters
        ? parseFloat(formData.oil_capacity_liters)
        : null,
      fuel_filter_qty: parseInt(formData.fuel_filter_qty) || 1,
      fuel_separator_qty: parseInt(formData.fuel_separator_qty) || 1,
      oil_filter_qty: parseInt(formData.oil_filter_qty) || 1,
      air_filter_qty: parseInt(formData.air_filter_qty) || 1,
    };

    updateUnitMutation.mutate(processedData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return {
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
    setError,
  };
}