import { Building2, Upload } from "lucide-react";

export function CustomerInfoSection({
  isNewCompany,
  setIsNewCompany,
  formData,
  handleChange,
  companies,
  handleCustomerPhotoUpload,
  uploadLoading,
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Building2 className="h-5 w-5 mr-2" />
        Customer Information
      </h2>

      <div className="mb-4">
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              checked={!isNewCompany}
              onChange={() => setIsNewCompany(false)}
              className="mr-2"
            />
            Select Existing Company
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={isNewCompany}
              onChange={() => setIsNewCompany(true)}
              className="mr-2"
            />
            Add New Company
          </label>
        </div>
      </div>

      {!isNewCompany ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company *
          </label>
          <select
            name="company_id"
            value={formData.company_id}
            onChange={handleChange}
            required={!isNewCompany}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Company</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Photo
            </label>
            <div className="flex items-center gap-4">
              {formData.customer_photo && (
                <img
                  src={formData.customer_photo}
                  alt="Customer"
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                />
              )}
              <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <Upload className="h-4 w-4 mr-2" />
                {uploadLoading ? "Uploading..." : "Upload Photo"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) handleCustomerPhotoUpload(file);
                  }}
                  className="hidden"
                  disabled={uploadLoading}
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                required={isNewCompany}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter company name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Industry</option>
                <option value="restaurant">Restaurant</option>
                <option value="factory">Factory</option>
                <option value="hospital">Hospital</option>
                <option value="hotel">Hotel</option>
                <option value="mall">Shopping Mall</option>
                <option value="office">Office Building</option>
                <option value="warehouse">Warehouse</option>
                <option value="school">School</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Person
              </label>
              <input
                type="text"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter contact person name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="text"
                name="company_phone"
                value={formData.company_phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="company_email"
                value={formData.company_email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email address"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              name="company_address"
              value={formData.company_address}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter company address"
            />
          </div>
        </div>
      )}
    </div>
  );
}
