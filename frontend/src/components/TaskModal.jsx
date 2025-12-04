import React, { useState } from "react";
import { createTask } from "../api/admin";

const TaskModal = ({ projectId, members, isOpen, onClose, onTaskAdded }) => {
  const token = localStorage.getItem("token");
  const [task, setTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    due_date: "",
    assigned_to: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTask = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const taskData = {
      ...task,
      assigned_to: task.assigned_to === "" ? null : parseInt(task.assigned_to),
    };

    try {
      await createTask(projectId, taskData, token);
      // Clear form and close modal
      setTask({
        title: "",
        description: "",
        priority: "medium",
        due_date: "",
        assigned_to: "",
      });
      onTaskAdded();
      onClose();
    } catch (error) {
      console.error("Failed to create task:", error);
      // Optionally show an error message to the user
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-2xl font-semibold text-gray-900">Create New Task</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <form onSubmit={handleAddTask} className="space-y-4">
          <input
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Task Title"
            value={task.title}
            onChange={(e ) => setTask({ ...task, title: e.target.value })}
            required
          />
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Description"
            value={task.description}
            onChange={(e) => setTask({ ...task, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={task.priority}
              onChange={(e) => setTask({ ...task, priority: e.target.value })}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              type="date"
              value={task.due_date}
              onChange={(e) => setTask({ ...task, due_date: e.target.value })}
            />
          </div>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={task.assigned_to}
            onChange={(e) => setTask({ ...task, assigned_to: e.target.value })}
          >
            <option value="">Unassigned</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-200 disabled:opacity-50"
          >
            {isSubmitting ? "Adding Task..." : "Add Task"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
