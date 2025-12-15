import React, { useEffect, useState } from "react";
import { getTaskFiles, uploadTaskFile, deleteTaskFile } from "../api/files";
import FileUpload from "./FileUpload";
import FileList from "./FileList";

const TaskFileModal = ({ taskId, isOpen, onClose }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const [taskFiles, setTaskFiles] = useState([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTaskFiles = async () => {
    try {
      setIsLoading(true);
      const files = await getTaskFiles(taskId, token);
      setTaskFiles(files);
    } catch (error) {
      console.error("Error fetching task files:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTaskFiles();
    }
  }, [isOpen, taskId]);

  const handleFileUpload = async (file) => {
    try {
      setIsUploadingFile(true);
      await uploadTaskFile(taskId, file, token);
      await fetchTaskFiles();
    } catch (error) {
      alert("Error uploading file: " + error);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await deleteTaskFile(taskId, fileId, token);
      await fetchTaskFiles();
    } catch (error) {
      alert("Error deleting file: " + error);
    }
  };

  if (!isOpen) return null;

  const canUpload = role === 'member';

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-2xl font-semibold text-gray-900">Task Files</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600"
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {canUpload && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Upload Files</h4>
              <FileUpload onFileUpload={handleFileUpload} uploading={isUploadingFile} />
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Files ({taskFiles.length})</h4>
            {isLoading ? (
              <p className="text-center text-gray-500 py-4">Loading files...</p>
            ) : (
              <FileList 
                files={taskFiles} 
                onDelete={handleDeleteFile} 
                canDelete={canUpload}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskFileModal;
