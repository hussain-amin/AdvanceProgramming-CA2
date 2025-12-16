import React, { useState } from "react";
import { completeProject } from "../api/admin";

const ProjectCompletionModal = ({ projectId, projectName, tasks, isOpen, onClose, onCompleted }) => {
  const token = localStorage.getItem("token");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const completedTasks = tasks.filter(t => t.status === 'completed');
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const allCompleted = pendingTasks.length === 0;

  const handleComplete = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await completeProject(projectId, token);
      if (result.msg && !result.pending_tasks) {
        // Success
        onCompleted();
        onClose();
      } else if (result.pending_tasks) {
        // There are pending tasks
        setError(result.msg);
      }
    } catch (err) {
      setError("Failed to complete project. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-2xl font-semibold text-gray-900">
            Mark Project as Complete
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-lg text-gray-800">Project: {projectName}</h4>
          </div>

          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Completed Tasks */}
          <div>
            <h5 className="font-semibold text-green-700 mb-2">
              ✓ Completed Tasks ({completedTasks.length})
            </h5>
            {completedTasks.length > 0 ? (
              <ul className="space-y-1 ml-4">
                {completedTasks.map(task => (
                  <li key={`${task.project_id}-${task.task_number}`} className="text-sm text-gray-700">
                    • {task.title}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 ml-4">No tasks completed yet</p>
            )}
          </div>

          {/* Pending Tasks */}
          {pendingTasks.length > 0 && (
            <div>
              <h5 className="font-semibold text-red-700 mb-2">
                ⚠ Pending Tasks ({pendingTasks.length})
              </h5>
              <ul className="space-y-1 ml-4">
                {pendingTasks.map(task => (
                  <li key={`${task.project_id}-${task.task_number}`} className="text-sm text-gray-700">
                    • {task.title} - <span className="capitalize text-gray-500">{task.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Summary */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>{completedTasks.length}/{tasks.length}</strong> tasks completed
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleComplete}
              disabled={!allCompleted || isSubmitting}
              className={`flex-1 py-2 px-4 font-semibold rounded-lg transition duration-200 ${
                allCompleted
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? "Completing..." : allCompleted ? "Complete Project" : "Cannot Complete"}
            </button>
          </div>

          {!allCompleted && (
            <p className="text-sm text-red-600 text-center">
              All tasks must be completed before marking the project as complete.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCompletionModal;
