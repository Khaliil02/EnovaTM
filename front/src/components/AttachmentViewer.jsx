import { useState } from "react";
import { getAttachmentViewUrl } from "../services/attachmentService";

const AttachmentViewer = ({ attachment }) => {
  const [expanded, setExpanded] = useState(false);

  // Helper to determine if file type can be displayed
  const isDisplayable = (mimetype) => {
    return (
      mimetype?.startsWith("image/") ||
      mimetype === "application/pdf" ||
      mimetype?.startsWith("text/")
    );
  };

  const viewUrl = getAttachmentViewUrl(attachment.id);
  const fileIcon = getFileIcon(attachment.mime_type || "");

  const handleViewClick = (e) => {
    e.stopPropagation();
    // For non-displayable files or to open in new tab
    window.open(viewUrl, "_blank");
  };

  return (
    <div className="border rounded mb-3">
      <div className="flex justify-between items-center p-2 bg-gray-50">
        <div className="flex items-center">
          {fileIcon}
          <span className="ml-2">{attachment.original_filename}</span>
        </div>
        <div>
          <button onClick={handleViewClick} className="btn btn-sm btn-primary">
            View
          </button>
          {isDisplayable(attachment.mime_type) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="btn btn-sm ml-2"
            >
              {expanded ? "Hide" : "Preview"}
            </button>
          )}
        </div>
      </div>

      {expanded && isDisplayable(attachment.mime_type) && (
        <div className="p-2">
          {attachment.mime_type?.startsWith("image/") && (
            <img
              src={viewUrl}
              alt={attachment.original_filename}
              className="max-w-full max-h-96"
            />
          )}

          {attachment.mime_type === "application/pdf" && (
            <iframe
              src={viewUrl}
              className="w-full h-96"
              title={attachment.original_filename}
            ></iframe>
          )}

          {attachment.mime_type?.startsWith("text/") && (
            <iframe
              src={viewUrl}
              className="w-full h-64"
              title={attachment.original_filename}
            ></iframe>
          )}
        </div>
      )}
    </div>
  );
};

// Helper function to get appropriate icon based on file type
const getFileIcon = (mimetype) => {
  // You can implement this with appropriate icons based on file type
  return <span>📄</span>;
};

export default AttachmentViewer;
