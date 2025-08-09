export function BasicInfoSection({ formData, handleChange }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Basic Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Unit Name *
          </label>
          <input
            type="text"
            name="unit_name"
            value={formData.unit_name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., GenSet-001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Model Engine *
          </label>
          <select
            name="model"
            value={formData.model}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Engine Brand</option>
            <option value="Perkins">Perkins</option>
            <option value="Cummins">Cummins</option>
            <option value="Caterpillar">Caterpillar</option>
            <option value="Komatsu">Komatsu</option>
            <option value="Kubota">Kubota</option>
            <option value="Yanmar">Yanmar</option>
            <option value="add_new">Add New</option>
          </select>
          {formData.model === "add_new" && (
            <input
              type="text"
              name="custom_engine"
              value={formData.custom_engine || ""}
              onChange={handleChange}
              placeholder="Enter custom engine brand"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-2"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Model Generator *
          </label>
          <select
            name="model_generator"
            value={formData.model_generator}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Generator Brand</option>
            <option value="Stamford">Stamford</option>
            <option value="Leroy Somer">Leroy Somer</option>
            <option value="Marelli">Marelli</option>
            <option value="Marathon">Marathon</option>
            <option value="Mecc Alte">Mecc Alte</option>
            <option value="Taiyo">Taiyo</option>
            <option value="Denyo">Denyo</option>
            <option value="add_new">Add New</option>
          </select>
          {formData.model_generator === "add_new" && (
            <input
              type="text"
              name="custom_generator"
              value={formData.custom_generator || ""}
              onChange={handleChange}
              placeholder="Enter custom generator brand"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-2"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Serial Number
          </label>
          <input
            type="text"
            name="serial_number"
            value={formData.serial_number}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter serial number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Engine Serial Number
          </label>
          <input
            type="text"
            name="serial_number_engine"
            value={formData.serial_number_engine}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter engine serial number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Generator Serial Number
          </label>
          <input
            type="text"
            name="serial_number_generator"
            value={formData.serial_number_generator}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter generator serial number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Engine Model
          </label>
          <input
            type="text"
            name="model_engine"
            value={formData.model_engine}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter engine model (e.g., 4008-TAG2A)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Install Date
          </label>
          <input
            type="date"
            name="install_date"
            value={formData.install_date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Register Date
          </label>
          <input
            type="date"
            name="register_date"
            value={formData.register_date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Warranty End Date
          </label>
          <input
            type="date"
            name="warranty_end"
            value={formData.warranty_end}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Specifications
        </label>
        <textarea
          name="specifications"
          value={formData.specifications}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter any additional specifications or notes"
        />
      </div>
    </div>
  );
}
