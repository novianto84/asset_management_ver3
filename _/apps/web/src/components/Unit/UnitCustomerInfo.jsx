import { Building2 } from "lucide-react";

const InfoField = ({ label, value, className = "" }) => {
  if (!value) return null;
  return (
    <div>
      <label className="block text-sm font-medium text-gray-500 mb-1">
        {label}
      </label>
      <p className={`text-gray-900 ${className}`}>{value}</p>
    </div>
  );
};

export function UnitCustomerInfo({ unit }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Building2 className="h-5 w-5 mr-2" />
        Customer Information
      </h3>
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
        <InfoField label="Company Name" value={unit.company_name} />
        <InfoField
          label="Industry"
          value={unit.industry}
          className="capitalize"
        />
        <InfoField label="Address" value={unit.company_address} />
        <InfoField label="Contact Person" value={unit.contact_person} />
        <InfoField label="Phone" value={unit.company_phone} />
        <InfoField label="Email" value={unit.company_email} />
      </div>
    </div>
  );
}
