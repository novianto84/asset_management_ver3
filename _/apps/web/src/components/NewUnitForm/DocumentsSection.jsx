import { FileText, Upload, X, Eye } from "lucide-react";

export function DocumentsSection({ 
  formData, 
  uploadLoading, 
  handleDocumentUpload, 
  removeDocument 
}) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Please select a PDF file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert("File size must be less than 10MB");
        return;
      }
      handleDocumentUpload(file);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <FileText className="h-5 w-5 mr-2" />
        Unit Documents
      </h2>

      <p className="text-sm text-gray-600 mb-4">
        Upload PDF documents such as manuals, certificates, or specifications for this unit.
      </p>

      {/* Upload Area */}
      <div className="mb-6">
        <label className="block">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploadLoading}
            />
            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              {uploadLoading ? "Uploading..." : "Click to upload PDF documents"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PDF files only, max 10MB each
            </p>
          </div>
        </label>
      </div>

      {/* Document List */}
      {formData.documents && formData.documents.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Uploaded Documents</h3>
          <div className="grid grid-cols-1 gap-3">
            {formData.documents.map((doc, index) => {
              const fileName = doc.split('/').pop() || `Document ${index + 1}`;
              return (
                <div key={index} className="flex items-center p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <FileText className="h-5 w-5 text-red-600 mr-3" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {fileName}
                    </p>
                    <p className="text-xs text-gray-500">PDF Document</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-blue-600 hover:text-blue-800"
                      title="View document"
                    >
                      <Eye className="h-4 w-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="p-1 text-red-600 hover:text-red-800"
                      title="Remove document"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {formData.documents && formData.documents.length === 0 && (
        <div className="text-center py-4">
          <FileText className="mx-auto h-8 w-8 text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">No documents uploaded yet</p>
        </div>
      )}
    </div>
  );
}