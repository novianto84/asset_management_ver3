import { FileText, Eye, AlertCircle } from "lucide-react";

const DocumentItem = ({ docUrl }) => {
  const fileName = docUrl.split("/").pop() || "Document";
  return (
    <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
      <FileText className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {fileName}
        </p>
        <p className="text-xs text-gray-500">Unit Manual/Certificate</p>
      </div>
      <a
        href={docUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="ml-2 p-1 text-blue-600 hover:text-blue-800"
        title="View document"
      >
        <Eye className="h-4 w-4" />
      </a>
    </div>
  );
};

const WorkHistoryItem = ({ item }) => {
  const { work_date, teknisi_name, description, documents } = item;
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-900">
          {work_date
            ? new Date(work_date).toLocaleDateString()
            : "Work Session"}
        </h4>
        {teknisi_name && (
          <span className="text-xs text-gray-500">by {teknisi_name}</span>
        )}
      </div>
      {description && (
        <p className="text-sm text-gray-600 mb-3">{description}</p>
      )}
      {documents && documents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {documents.map((doc, docIndex) => {
            const fileName = doc.split("/").pop() || `Report ${docIndex + 1}`;
            return (
              <div
                key={docIndex}
                className="flex items-center p-2 bg-gray-50 rounded"
              >
                <FileText className="h-4 w-4 text-red-600 mr-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {fileName}
                  </p>
                </div>
                <a
                  href={doc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 p-1 text-blue-600 hover:text-blue-800"
                  title="View document"
                >
                  <Eye className="h-3 w-3" />
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export function UnitDocuments({ documents, workHistoryDocuments }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <FileText className="h-5 w-5 mr-2" />
        Documents & Work History Files
      </h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-md font-medium text-gray-800 mb-3">
            Unit Manuals & Certificates
          </h3>
          {documents && documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {documents.map((doc, index) => (
                <DocumentItem key={index} docUrl={doc} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              No unit documents available
            </p>
          )}
        </div>

        <div>
          <h3 className="text-md font-medium text-gray-800 mb-3">
            Work Completion Reports
          </h3>
          {workHistoryDocuments && workHistoryDocuments.length > 0 ? (
            <div className="space-y-3">
              {workHistoryDocuments.map((item, index) => (
                <WorkHistoryItem key={index} item={item} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              No work history documents available
            </p>
          )}
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">
                Document Upload
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                PDF documents are automatically uploaded when teknisi complete
                work sessions. Unit manuals can be uploaded by admin/supervisor
                during unit editing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
