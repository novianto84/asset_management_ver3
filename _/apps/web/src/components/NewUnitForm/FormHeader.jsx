import { ArrowLeft } from "lucide-react";

export function FormHeader() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        <a
          href="/"
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Units
        </a>
      </div>
      <h1 className="text-3xl font-bold text-gray-900">
        Add New Generator Unit
      </h1>
      <p className="text-gray-600 mt-2">
        Enter the generator specifications and details
      </p>
    </div>
  );
}
