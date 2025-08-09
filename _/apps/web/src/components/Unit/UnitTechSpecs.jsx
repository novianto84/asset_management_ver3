const SpecField = ({ label, value, unit = "", className = "" }) => (
  <div>
    <label className="block text-sm font-medium text-gray-500 mb-1">
      {label}
    </label>
    <p className={`text-gray-900 ${className}`}>
      {value ? `${value} ${unit}`.trim() : "N/A"}
    </p>
  </div>
);

export function UnitTechSpecs({ unit }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Technical Specifications
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SpecField label="Frequency" value={unit.frequency_hz} unit="Hz" />
        <SpecField label="RPM" value={unit.rpm} />
        <SpecField
          label="Module Control"
          value={unit.module_control}
          className="uppercase"
        />
        <SpecField
          label="System Operation"
          value={unit.system_operation}
          className="capitalize"
        />
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Operation Mode
          </label>
          <p className="text-gray-900 capitalize">
            {unit.operation_mode?.replace("_", " ") || "N/A"}
          </p>
        </div>
        <SpecField
          label="Transfer System"
          value={unit.transfer_system}
          className="capitalize"
        />
        <SpecField
          label="Oil Capacity"
          value={unit.oil_capacity_liters}
          unit="L"
        />
        <SpecField label="Oil Type" value={unit.oil_type} />
      </div>
    </div>
  );
}
