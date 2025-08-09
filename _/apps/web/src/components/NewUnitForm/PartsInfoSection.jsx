const PartInput = ({
  title,
  partNumberName,
  qtyName,
  formData,
  handleChange,
}) => (
  <div>
    <h3 className="text-md font-medium text-gray-800 mb-3">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Part Number
        </label>
        <input
          type="text"
          name={partNumberName}
          value={formData[partNumberName]}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter part number"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quantity
        </label>
        <input
          type="number"
          name={qtyName}
          value={formData[qtyName]}
          onChange={handleChange}
          min="1"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  </div>
);

export function PartsInfoSection({ formData, handleChange }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Parts Information
      </h2>
      <div className="space-y-6">
        <PartInput
          title="Fuel Filter"
          partNumberName="fuel_filter_part_number"
          qtyName="fuel_filter_qty"
          formData={formData}
          handleChange={handleChange}
        />
        <PartInput
          title="Fuel Separator"
          partNumberName="fuel_separator_part_number"
          qtyName="fuel_separator_qty"
          formData={formData}
          handleChange={handleChange}
        />
        <PartInput
          title="Oil Filter"
          partNumberName="oil_filter_part_number"
          qtyName="oil_filter_qty"
          formData={formData}
          handleChange={handleChange}
        />
        <PartInput
          title="Air Filter"
          partNumberName="air_filter_part_number"
          qtyName="air_filter_qty"
          formData={formData}
          handleChange={handleChange}
        />
      </div>
    </div>
  );
}
