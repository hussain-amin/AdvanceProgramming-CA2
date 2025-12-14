import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import ProjectCard from "../../components/ProjectCard";
import ProjectModal from "../../components/ProjectModal"; // New import
import { getMemberProjects } from "../../api/member";
import { getProjects } from "../../api/admin";

const Projects = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const userName = localStorage.getItem("userName");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // New state for modal
  const [isOngoingExpanded, setIsOngoingExpanded] = useState(true);
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(true);

  const fetchProjects = async () => {
    try {
      let data;
      if (role === "admin") {
        // Admin gets all projects
        data = await getProjects(token);
        setProjects(data.projects || []);
      } else {
        // Member gets assigned projects
        data = await getMemberProjects(token);
        setProjects(data || []);
      }
    } catch (err) {
      setError("Failed to fetch projects.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [token, role]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 p-8">
          <p className="text-center text-gray-500">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 p-8">
          <p className="text-center text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            {role === "admin" ? "All Projects" : "My Assigned Projects"}
          </h1>
          {role === "admin" && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition duration-200"
            >
              + Create New Project
            </button>
          )}
        </div>

        {projects.length === 0 ? (
          <p className="text-gray-500">No projects found.</p>
        ) : (
          <div className="space-y-6">
            {/* Ongoing Projects Section */}
            <div className="border rounded-lg shadow-md bg-white overflow-hidden">
              <button
                onClick={() => setIsOngoingExpanded(!isOngoingExpanded)}
                className="w-full px-6 py-4 bg-blue-50 hover:bg-blue-100 flex justify-between items-center transition duration-200"
              >
                <h2 className="text-xl font-semibold text-blue-900">
                  Ongoing Projects ({projects.filter(p => !p.completion_date).length})
                </h2>
                <svg
                  className={`w-6 h-6 text-blue-900 transform transition-transform ${
                    isOngoingExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7-7m0 0L5 14m7-7v12" />
                </svg>
              </button>
              
              {isOngoingExpanded && (
                <div className="p-6">
                  {projects.filter(p => !p.completion_date).length === 0 ? (
                    <p className="text-gray-500">No ongoing projects.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {projects
                        .filter(p => !p.completion_date)
                        .map((project) => (
                          <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Completed Projects Section */}
            <div className="border rounded-lg shadow-md bg-white overflow-hidden">
              <button
                onClick={() => setIsCompletedExpanded(!isCompletedExpanded)}
                className="w-full px-6 py-4 bg-green-50 hover:bg-green-100 flex justify-between items-center transition duration-200"
              >
                <h2 className="text-xl font-semibold text-green-900">
                  Completed Projects ({projects.filter(p => p.completion_date).length})
                </h2>
                <svg
                  className={`w-6 h-6 text-green-900 transform transition-transform ${
                    isCompletedExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7-7m0 0L5 14m7-7v12" />
                </svg>
              </button>
              
              {isCompletedExpanded && (
                <div className="p-6">
                  {projects.filter(p => p.completion_date).length === 0 ? (
                    <p className="text-gray-500">No completed projects yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {projects
                        .filter(p => p.completion_date)
                        .map((project) => (
                          <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Project Creation Modal */}
        <ProjectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onProjectSaved={fetchProjects}
        />
      </div>
    </div>
  );
};

export default Projects;
