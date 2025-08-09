import { ArrowLeft, AlertTriangle } from "lucide-react";

export function UnitDetailError({ error }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Unit Not Found
        </h2>
        <p className="text-gray-600 mb-4">
          {error?.message || "The requested unit could not be found."}
        </p>
        <a
          href="/"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Units
        </a>
      </div>
    </div>
  );
}
