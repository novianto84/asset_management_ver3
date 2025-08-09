const PartInfo = ({ name, partNumber, qty }) => (
  <div>
    <h3 className="text-md font-medium text-gray-800 mb-3">{name}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-500 mb-1">
          Part Number
        </label>
        <p className="text-gray-900">{partNumber || "N/A"}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-500 mb-1">
          Quantity
        </label>
        <p className="text-gray-900">{qty || "N/A"}</p>
      </div>
    </div>
  </div>
);

export function UnitPartsInfo({ unit }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Parts Information
      </h2>
      <div className="space-y-6">
        <PartInfo
          name="Fuel Filter"
          partNumber={unit.fuel_filter_part_number}
          qty={unit.fuel_filter_qty}
        />
        <PartInfo
          name="Fuel Separator"
          partNumber={unit.fuel_separator_part_number}
          qty={unit.fuel_separator_qty}
        />
        <PartInfo
          name="Oil Filter"
          partNumber={unit.oil_filter_part_number}
          qty={unit.oil_filter_qty}
        />
        <PartInfo
          name="Air Filter"
          partNumber={unit.air_filter_part_number}
          qty={unit.air_filter_qty}
        />
      </div>
    </div>
  );
}
