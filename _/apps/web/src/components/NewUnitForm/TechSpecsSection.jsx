export function TechSpecsSection({ formData, handleChange }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Technical Specifications
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Frequency (Hz)
          </label>
          <select
            name="frequency_hz"
            value={formData.frequency_hz}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Frequency</option>
            <option value="50">50 Hz</option>
            <option value="60">60 Hz</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            RPM
          </label>
          <select
            name="rpm"
            value={formData.rpm}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select RPM</option>
            <option value="1500">1500 RPM</option>
            <option value="1800">1800 RPM</option>
            <option value="3000">3000 RPM</option>
            <option value="750">750 RPM</option>
            <option value="1000">1000 RPM</option>
            <option value="add_new">Add New</option>
          </select>
          {formData.rpm === "add_new" && (
            <input
              type="number"
              name="custom_rpm"
              value={formData.custom_rpm || ""}
              onChange={handleChange}
              placeholder="Enter custom RPM"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-2"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Module Control
          </label>
          <input
            type="text"
            name="module_control"
            value={formData.module_control}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., DSE7320, COMAP AMF25"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            System Operation
          </label>
          <select
            name="system_operation"
            value={formData.system_operation}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Operation Type</option>
            <option value="single">Single</option>
            <option value="synchrone">Synchrone</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Operation Mode
          </label>
          <select
            name="operation_mode"
            value={formData.operation_mode}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Operation Mode</option>
            <option value="emergency_backup">Emergency Backup</option>
            <option value="primary">Primary</option>
            <option value="base_load">Base Load</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transfer System
          </label>
          <select
            name="transfer_system"
            value={formData.transfer_system}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Transfer System</option>
            <option value="manual">Manual</option>
            <option value="auto">Auto</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Oil Capacity (Liters)
          </label>
          <input
            type="number"
            step="0.1"
            name="oil_capacity_liters"
            value={formData.oil_capacity_liters}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., 25.5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Oil Type
          </label>
          <input
            type="text"
            name="oil_type"
            value={formData.oil_type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., SAE 15W-40"
          />
        </div>
      </div>
    </div>
  );
}
