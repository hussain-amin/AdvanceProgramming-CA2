import React, { useEffect, useState } from "react";
import { getTaskFiles, uploadTaskFile, deleteTaskFile } from "../api/files";
import FileUpload from "./FileUpload";
import FileList from "./FileList";

const TaskFileModal = ({ projectId, taskNumber, taskTitle, isOpen, onClose, isAssignedUser, onFilesChange }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const [taskFiles, setTaskFiles] = useState([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTaskFiles = async () => {
    try {
      setIsLoading(true);
      const files = await getTaskFiles(projectId, taskNumber, token);
      setTaskFiles(files);
      return files.length;
    } catch (error) {
      console.error("Error fetching task files:", error);
      return 0;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTaskFiles();
    }
  }, [isOpen, projectId, taskNumber]);

  const handleFileUpload = async (file) => {
    try {
      setIsUploadingFile(true);
      await uploadTaskFile(projectId, taskNumber, file, token);
      const count = await fetchTaskFiles();
      // Notify parent of file count change
      if (onFilesChange) onFilesChange(count);
    } catch (error) {
      alert("Error uploading file: " + error);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await deleteTaskFile(projectId, taskNumber, fileId, token);
      const count = await fetchTaskFiles();
      // Notify parent of file count change
      if (onFilesChange) onFilesChange(count);
    } catch (error) {
      alert("Error deleting file: " + error);
    }
  };

  if (!isOpen) return null;

  // Only assigned member can upload/delete files
  const canManageFiles = role === 'member' && isAssignedUser;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-500 to-purple-600">
          <div>
            <h3 className="text-xl font-semibold text-white">Task Files</h3>
            {taskTitle && <p className="text-indigo-100 text-sm mt-0.5">{taskTitle}</p>}
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Upload Section - Only for assigned member */}
          {canManageFiles && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload Files
              </h4>
              <FileUpload onFileUpload={handleFileUpload} uploading={isUploadingFile} />
            </div>
          )}

          {/* Files List */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Attached Files
              <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">{taskFiles.length}</span>
            </h4>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : taskFiles.length > 0 ? (
              <FileList 
                files={taskFiles} 
                onDelete={handleDeleteFile} 
                canDelete={canManageFiles}
              />
            ) : (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-slate-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-slate-400 font-medium">No files attached</p>
                {canManageFiles && <p className="text-slate-300 text-sm mt-1">Upload a file to get started</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskFileModal;
