import React from "react";
import { Link } from "react-router-dom";

const ProjectCard = ({ project }) => {
  // console.log("this is the name:", project.name);
  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-800 truncate">
            <span className="text-indigo-600">#{project.id}</span> {project.name}
          </h3>
          <span className={`px-3 py-1 text-xs font-semibold text-white rounded-full ${getPriorityColor(project.priority)}`}>
            {project.priority}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {project.description || "No description provided."}
        </p>
        <div className="text-xs text-gray-500 mb-4 space-y-1">
          {project.start_date && (
            <p>
              Start: <span className="font-medium text-gray-700">{new Date(project.start_date).toLocaleDateString()}</span>
            </p>
          )}
          {project.due_date && (
            <p>
              Due: <span className="font-medium text-gray-700">{new Date(project.due_date).toLocaleDateString()}</span>
            </p>
          )}
          {project.completion_date && (
            <p>
              Completed: <span className="font-medium text-gray-700">{new Date(project.completion_date).toLocaleDateString()}</span>
            </p>
          )}
        </div>
        <Link
          to={`/projects/${project.id}`}
          className="inline-block w-full text-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;
