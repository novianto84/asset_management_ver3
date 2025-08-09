import { Settings } from "lucide-react";

const InfoField = ({ label, value, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-500 mb-1">
      {label}
    </label>
    {children || <p className="text-gray-900">{value || "N/A"}</p>}
  </div>
);

export function UnitBasicInfo({ unit }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Settings className="h-5 w-5 mr-2" />
        Basic Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoField label="Engine Serial Number (Primary ID)">
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
        </InfoField>
        <InfoField label="Box Serial Number" value={unit.serial_number} />
        <InfoField label="Unit Name" value={unit.unit_name} />
        <InfoField label="Model Engine (Brand)" value={unit.model} />
        <InfoField label="Engine Model" value={unit.model_engine} />
        <InfoField
          label="Model Generator (Brand)"
          value={unit.model_generator}
        />
        <InfoField
          label="Generator Serial Number"
          value={unit.serial_number_generator}
        />
        <InfoField label="Company" value={unit.company_name} />
        <InfoField
          label="Install Date"
          value={
            unit.install_date
              ? new Date(unit.install_date).toLocaleDateString()
              : "N/A"
          }
        />
        <InfoField
          label="Register Date"
          value={
            unit.register_date
              ? new Date(unit.register_date).toLocaleDateString()
              : "N/A"
          }
        />
        <InfoField
          label="Warranty End"
          value={
            unit.warranty_end
              ? new Date(unit.warranty_end).toLocaleDateString()
              : "N/A"
          }
        />
        <InfoField label="Access Token">
          <p className="text-xs text-gray-600 font-mono bg-gray-50 p-2 rounded">
            {unit.access_token}
          </p>
        </InfoField>
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
  );
}
