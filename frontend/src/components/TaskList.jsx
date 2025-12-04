import React, { useState, useEffect } from 'react';
import { getTaskComments, addComment, updateTaskStatus } from '../api/member';

const TaskItem = ({ task, onTaskUpdated }) => {
  const token = localStorage.getItem("token");
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);

  const fetchComments = async () => {
    const res = await getTaskComments(task.id, token);
    setComments(res.comments);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    await addComment(task.id, newComment, token);
    setNewComment("");
    fetchComments();
  };

  const handleStatusChange = async (e) => {
    await updateTaskStatus(task.id, e.target.value, token);
    onTaskUpdated();
  };

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 font-bold';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <li className="p-4 border-b last:border-b-0 bg-white hover:bg-gray-50 transition duration-150 ease-in-out">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-lg font-semibold">{task.title}</h4>
          <p className="text-sm text-gray-600">{task.description}</p>
          <p className={`text-xs ${getPriorityColor(task.priority)}`}>Priority: {task.priority}</p>
          <p className="text-xs text-gray-500">Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</p>
          {task.project_name && <p className="text-xs text-blue-500">Project: {task.project_name}</p>}
        </div>
        <div className="flex flex-col items-end space-y-2">
          <select
            className="p-1 border rounded text-sm"
            value={task.status}
            onChange={handleStatusChange}
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-blue-500 text-sm hover:underline"
          >
            {showComments ? 'Hide Comments' : `View Comments (${comments.length})`}
          </button>
        </div>
      </div>

      {showComments && (
        <div className="mt-4 p-3 bg-gray-100 border rounded">
          <h5 className="font-medium mb-2">Comments</h5>
          <ul className="space-y-2 text-sm">
            {comments.map(comment => (
              <li key={comment.id} className="border-b pb-1">
                <span className="font-semibold">{comment.user_name}:</span> {comment.content}
                <span className="text-xs text-gray-400 ml-2">{new Date(comment.created_at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
          <form onSubmit={handleAddComment} className="mt-3 flex space-x-2">
            <input
              type="text"
              className="flex-grow p-2 border rounded text-sm"
              placeholder="Add a comment..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              required
            />
            <button type="submit" className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">
              Post
            </button>
          </form>
        </div>
      )}
    </li>
  );
};

const TaskList = ({ tasks, onTaskUpdated }) => {
  return (
    <ul className="border rounded-lg overflow-hidden shadow-md">
      {tasks.map(t => (
        <TaskItem key={t.id} task={t} onTaskUpdated={onTaskUpdated} />
      ))}
    </ul>
  );
};

export default TaskList;
