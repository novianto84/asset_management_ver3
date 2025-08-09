import { ArrowLeft, Edit } from "lucide-react";

const getStatusColor = (warrantyEnd) => {
  const now = new Date();
  const endDate = warrantyEnd ? new Date(warrantyEnd) : null;
  if (endDate && endDate < now) {
    return "bg-red-100 border-red-300 text-red-800";
  }
  return "bg-green-100 border-green-300 text-green-800";
};

const getStatusText = (warrantyEnd) => {
  const now = new Date();
  const endDate = warrantyEnd ? new Date(warrantyEnd) : null;
  if (endDate && endDate < now) {
    return "Warranty Expired";
  }
  return "Active";
};

export function UnitDetailHeader({ unit }) {
  const { id, unit_name, model, company_name, warranty_end } = unit;
  const statusColor = getStatusColor(warranty_end);
  const statusText = getStatusText(warranty_end);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{unit_name}</h1>
          <p className="text-gray-600 mt-1">
            {model} • {company_name}
          </p>
        </div>
        <div className="flex gap-3">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColor}`}
          >
            {statusText}
          </span>
          <a
            href={`/units/${id}/edit`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Unit
          </a>
        </div>
      </div>
    </div>
  );
}
