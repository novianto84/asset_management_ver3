import { Camera, Upload } from "lucide-react";

export function UnitPhotosSection({
  formData,
  uploadLoading,
  handleUnitPhotoUpload,
  removeUnitPhoto,
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Camera className="h-5 w-5 mr-2" />
        Unit Photos
      </h2>

      <div className="mb-4">
        <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
          <Upload className="h-4 w-4 mr-2" />
          {uploadLoading ? "Uploading..." : "Add Photos"}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files);
              files.forEach((file) => handleUnitPhotoUpload(file));
            }}
            className="hidden"
            disabled={uploadLoading}
          />
        </label>
      </div>

      {formData.unit_photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {formData.unit_photos.map((photo, index) => (
            <div key={index} className="relative group">
              <img
                src={photo}
                alt={`Unit photo ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => removeUnitPhoto(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
