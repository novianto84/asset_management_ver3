import { Camera } from "lucide-react";

export function UnitPhotos({ photos }) {
  if (!photos || photos.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Camera className="h-5 w-5 mr-2" />
        Unit Photos
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((photo, index) => (
          <div key={index} className="relative group">
            <img
              src={photo}
              alt={`Unit photo ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg border border-gray-200 group-hover:shadow-md transition-shadow"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all cursor-pointer"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
