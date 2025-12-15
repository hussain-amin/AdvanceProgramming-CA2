import React, { useState, useEffect } from 'react';
import { getTaskComments, addComment, updateTaskStatus } from '../api/member';
import { deleteTask, approveTaskCompletion, rejectTaskCompletion } from '../api/admin';
import { getTaskFiles } from '../api/files';
import TaskFileModal from './TaskFileModal';
import ConfirmModal from './ConfirmModal';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const TaskItem = ({ task, onTaskUpdated, onTaskEdit }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const userId = parseInt(localStorage.getItem("userId"));
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [fileCount, setFileCount] = useState(task.attachments_count || 0);
  
  // Confirmation modal states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    confirmColor: 'indigo',
    onConfirm: () => {},
    files: [], // For approve modal
    showInput: false, // For reject modal
    inputValue: ''
  });
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  const fetchComments = async () => {
    const res = await getTaskComments(task.id, token);
    setComments(res.comments);
    setCommentCount(res.comments.length);
  };

  // Fetch comment count on mount
  useEffect(() => {
    fetchComments();
  }, [task.id]);

  // Update file count from task prop when it changes
  useEffect(() => {
    setFileCount(task.attachments_count || 0);
  }, [task.attachments_count]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    await addComment(task.id, newComment, token);
    setNewComment("");
    fetchComments();
  };

  const handleStatusChange = async (newStatus) => {
    await updateTaskStatus(task.id, newStatus, token);
    onTaskUpdated();
  };

  const handleApproveTask = async () => {
    await approveTaskCompletion(task.id, token);
    onTaskUpdated();
  };

  const handleRejectTask = async (reason) => {
    await rejectTaskCompletion(task.id, reason, token);
    await fetchComments(); // Refresh comments to show rejection reason
    onTaskUpdated();
  };

  const handleDelete = async () => {
    await deleteTask(task.id, token);
    onTaskUpdated();
  };

  // Show confirmation modal helpers
  const showStartConfirmation = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Start Task',
      message: `Are you sure you want to start working on "${task.title}"? This will change the status to In Progress.`,
      confirmText: 'Start Task',
      confirmColor: 'amber',
      onConfirm: () => handleStatusChange('in_progress'),
      files: []
    });
  };

  const showCompleteConfirmation = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Submit for Review',
      message: `Are you sure you want to submit "${task.title}" for review? An admin will review your work and attached files before marking it as complete.`,
      confirmText: 'Submit for Review',
      confirmColor: 'green',
      onConfirm: () => handleStatusChange('completed'),
      files: []
    });
  };

  const showApproveConfirmation = async () => {
    // First fetch the files to show in the modal
    setIsLoadingFiles(true);
    setConfirmModal({
      isOpen: true,
      title: 'Approve Task Completion',
      message: `Review the submitted files for "${task.title}" before approving.`,
      confirmText: 'Approve',
      confirmColor: 'green',
      onConfirm: handleApproveTask,
      files: []
    });
    
    try {
      const files = await getTaskFiles(task.id, token);
      setConfirmModal(prev => ({ ...prev, files }));
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const showRejectConfirmation = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Reject & Send Back',
      message: `Are you sure you want to reject "${task.title}"? The task will be sent back to the member for revision.`,
      confirmText: 'Reject',
      confirmColor: 'red',
      onConfirm: handleRejectTask,
      files: [],
      showInput: true,
      inputValue: ''
    });
  };

  const showDeleteConfirmation = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Task',
      message: `Are you sure you want to delete "${task.title}"? This action cannot be undone.`,
      confirmText: 'Delete',
      confirmColor: 'red',
      onConfirm: handleDelete,
      files: []
    });
  };

  // Handle file count update from TaskFileModal
  const handleFilesChange = (newCount) => {
    setFileCount(newCount);
  };

  // Status-based border and badge colors
  const getStatusStyles = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return {
          border: 'border-l-4 border-l-emerald-500',
          badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
          bg: 'bg-emerald-50/50'
        };
      case 'pending_review':
        return {
          border: 'border-l-4 border-l-purple-500',
          badge: 'bg-purple-100 text-purple-700 border-purple-200',
          bg: 'bg-purple-50/50'
        };
      case 'in_progress':
        return {
          border: 'border-l-4 border-l-amber-500',
          badge: 'bg-amber-100 text-amber-700 border-amber-200',
          bg: 'bg-amber-50/50'
        };
      default: // todo
        return {
          border: 'border-l-4 border-l-slate-400',
          badge: 'bg-slate-100 text-slate-600 border-slate-200',
          bg: 'bg-white'
        };
    }
  };

  const getPriorityStyles = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const formatStatus = (status) => {
    switch (status.toLowerCase()) {
      case 'in_progress': return 'In Progress';
      case 'pending_review': return 'Pending Review';
      case 'completed': return 'Completed';
      default: return 'To Do';
    }
  };

  const statusStyles = getStatusStyles(task.status);
  const isAssignedToCurrentUser = task.assigned_to === userId;
  const hasFiles = fileCount > 0;

  return (
    <div className={`rounded-xl ${statusStyles.border} ${statusStyles.bg} border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden`}>
      {/* Main Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left Side - Task Info */}
          <div className="flex-1 min-w-0">
            {/* Title Row with Files Button */}
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-base font-semibold text-slate-800 truncate">{task.title}</h4>
              {/* Files Button */}
              <button
                onClick={() => setIsFileModalOpen(true)}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                  hasFiles 
                    ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' 
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                {hasFiles && <span>{fileCount}</span>}
              </button>
            </div>

            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles.badge}`}>
                {formatStatus(task.status)}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityStyles(task.priority)}`}>
                {task.priority}
              </span>
              {task.due_date && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(task.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                </span>
              )}
            </div>

            {/* Assigned To */}
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                {task.assignee_name?.charAt(0).toUpperCase() || '?'}
              </div>
              <span>Assigned to: <span className="font-medium text-slate-700">{task.assignee_name || 'Unassigned'}</span></span>
            </div>
          </div>

          {/* Right Side - Actions */}
          <div className="flex flex-col items-end gap-2">
            {/* Member Status Change Buttons (only for assigned member) */}
            {role === 'member' && isAssignedToCurrentUser && task.status !== 'completed' && task.status !== 'pending_review' && (
              <div className="flex gap-1">
                {task.status === 'todo' && (
                  <button
                    onClick={showStartConfirmation}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    Start
                  </button>
                )}
                {task.status === 'in_progress' && (
                  <button
                    onClick={showCompleteConfirmation}
                    className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    Submit for Review
                  </button>
                )}
              </div>
            )}

            {/* Admin Review Buttons (for pending_review tasks) */}
            {role === 'admin' && task.status === 'pending_review' && (
              <div className="flex gap-1">
                <button
                  onClick={showApproveConfirmation}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  ✓ Approve
                </button>
                <button
                  onClick={showRejectConfirmation}
                  className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  ✗ Reject
                </button>
              </div>
            )}

            {/* Admin Actions */}
            {role === 'admin' && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onTaskEdit(task)}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Edit task"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={showDeleteConfirmation}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete task"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}

            {/* Comments Toggle */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {showComments ? 'Hide' : commentCount}
            </button>
          </div>
        </div>
      </div>

      {/* Task File Modal */}
      <TaskFileModal 
        taskId={task.id} 
        taskTitle={task.title}
        isOpen={isFileModalOpen} 
        onClose={() => setIsFileModalOpen(false)}
        isAssignedUser={isAssignedToCurrentUser}
        onFilesChange={handleFilesChange}
      />

      {/* Comments Section */}
      {showComments && (
        <div className="px-4 pb-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <h5 className="text-sm font-semibold text-slate-700 mb-3">Comments</h5>
            {comments.length > 0 ? (
              <ul className="space-y-3 mb-4">
                {comments.map(comment => (
                  <li key={comment.id} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                      {comment.user_name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-slate-700">{comment.user_name}</span>
                        <span className="text-xs text-slate-400">{new Date(comment.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-slate-600">{comment.content}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400 mb-4">No comments yet</p>
            )}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Add a comment..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                required
              />
              <button 
                type="submit" 
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Post
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        confirmColor={confirmModal.confirmColor}
        isLoading={isLoadingFiles}
        showInput={confirmModal.showInput}
        inputValue={confirmModal.inputValue}
        onInputChange={(value) => setConfirmModal({ ...confirmModal, inputValue: value })}
        inputPlaceholder="Explain what needs to be fixed..."
      >
        {/* Files list for Approve modal */}
        {confirmModal.files && confirmModal.files.length > 0 && (
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <h5 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Submitted Files ({confirmModal.files.length})
            </h5>
            <ul className="space-y-2 max-h-40 overflow-y-auto">
              {confirmModal.files.map(file => (
                <li key={file.id} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{file.filename}</p>
                    <p className="text-xs text-slate-400">{new Date(file.uploaded_at).toLocaleDateString()}</p>
                  </div>
                  <a 
                    href={`${API_URL}${file.file_url}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Download file"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {confirmModal.files && confirmModal.files.length === 0 && confirmModal.title === 'Approve Task Completion' && !isLoadingFiles && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-amber-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-sm font-medium">No files submitted</span>
            </div>
            <p className="text-xs text-amber-600 mt-1 ml-7">The member has not attached any files to this task.</p>
          </div>
        )}
      </ConfirmModal>
    </div>
  );
};

const TaskList = ({ tasks, onTaskUpdated, onTaskEdit }) => {
  return (
    <div className="space-y-3">
      {tasks.map(t => (
        <TaskItem key={t.id} task={t} onTaskUpdated={onTaskUpdated} onTaskEdit={onTaskEdit} />
      ))}
    </div>
  );
};

export default TaskList;
