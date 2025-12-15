import { useState } from 'react';

export default function FileList({ files, onDelete, canDelete }) {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (fileId) => {
    setDeletingId(fileId);
    await onDelete(fileId);
    setDeletingId(null);
  };

  if (!files || files.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p className="text-sm">No files uploaded yet</p>
      </div>
    );
  }

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const iconMap = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      xls: '📊',
      xlsx: '📊',
      txt: '📋',
      png: '🖼️',
      jpg: '🖼️',
      jpeg: '🖼️',
      gif: '🖼️',
      zip: '📦'
    };
    return iconMap[ext] || '📎';
  };

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-lg">{getFileIcon(file.filename)}</span>
            <div className="flex-1 min-w-0">
              <a
                href={`http://localhost:5000${file.file_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-blue-600 hover:text-blue-800 truncate block"
              >
                {file.filename}
              </a>
              <p className="text-xs text-gray-500">
                by {file.uploaded_by} • {new Date(file.uploaded_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          {canDelete && (
            <button
              onClick={() => handleDelete(file.id)}
              disabled={deletingId === file.id}
              className="ml-2 p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
              title="Delete file"
            >
              {deletingId === file.id ? (
                <span className="inline-block animate-spin">⏳</span>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
