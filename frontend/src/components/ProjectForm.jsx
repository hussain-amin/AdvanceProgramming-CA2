import React, { useState, useEffect } from "react";
import { createProject, updateProject } from "../api/admin";

const ProjectForm = ({ projectToEdit, onProjectSaved }) => {
  const token = localStorage.getItem("token");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    due_date: "",
    priority: "Medium",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (projectToEdit) {
      setFormData({
        name: projectToEdit.title || "",
        description: projectToEdit.description || "",
        // Format dates to YYYY-MM-DD for input type="date"
        start_date: projectToEdit.start_date ? new Date(projectToEdit.start_date).toISOString().split('T')[0] : "",
        due_date: projectToEdit.due_date ? new Date(projectToEdit.due_date).toISOString().split('T')[0] : "",
        priority: projectToEdit.priority || "Medium",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        start_date: "",
        due_date: "",
        priority: "Medium",
      });
    }
  }, [projectToEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      let result;
      if (projectToEdit) {
        result = await updateProject(projectToEdit.id, formData, token);
      } else {
        result = await createProject(formData, token);
      }

      if (result.msg) {
        setMessage({ type: "success", text: result.msg });
        onProjectSaved();
        if (!projectToEdit) {
          // Clear form after creation
          setFormData({
            name: "",
            description: "",
            start_date: "",
            due_date: "",
            priority: "Medium",
          });
        }
      } else {
        setMessage({ type: "error", text: "Operation failed." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred while saving the project." });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <h3 className="text-xl font-semibold mb-4">
        {projectToEdit ? "Edit Project" : "Create New Project"}
      </h3>

      {message && (
        <div className={`p-3 mb-4 rounded-lg text-sm ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Project Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-200 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : projectToEdit ? "Update Project" : "Create Project"}
        </button>
      </form>
    </div>
  );
};

export default ProjectForm;
