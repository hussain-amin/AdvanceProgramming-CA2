import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProjectById, getMembers, deleteProject } from "../api/admin";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import TaskList from "../components/TaskList";
import TaskModal from "../components/TaskModal";
import ProjectModal from "../components/ProjectModal";
import MemberAssignmentModal from "../components/MemberAssignmentModal"; // New import

const ProjectDetails = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [allMembers, setAllMembers] = useState([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false); // New state for member modal

  const fetchProjectDetails = async () => {
    const res = await getProjectById(id, token);
    setProject(res.project);
  };

  const fetchAllMembers = async () => {
    const res = await getMembers(token);
    setAllMembers(res.members);
  };

  useEffect(() => {
    fetchProjectDetails();
    if (role === 'admin') {
      fetchAllMembers();
    }
  }, [id, role]);

  const handleDeleteProject = async () => {
    if (window.confirm(`Are you sure you want to delete project: ${project.name}?`)) {
      await deleteProject(id, token);
      navigate('/projects'); // Redirect to projects list after deletion
    }
  };

  const handleProjectSaved = () => {
    fetchProjectDetails(); // Refresh details after edit
  };

  const handleMembersUpdated = () => {
    fetchProjectDetails(); // Refresh details after member update
  };

  if (!project) return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <Navbar />
        <p className="text-center text-gray-500">Loading project details...</p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8">
        <Navbar />
        
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">{project.name}</h1>
          {role === 'admin' && (
            <div className="flex space-x-3">
              <button
                onClick={() => setIsProjectModalOpen(true)}
                className="py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg shadow-md transition duration-200"
              >
                Edit Project
              </button>
              <button
                onClick={handleDeleteProject}
                className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition duration-200"
              >
                Delete Project
              </button>
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-200"
              >
                + Add New Task
              </button>
            </div>
          )}
        </div>

        <p className="text-gray-700 mb-6">{project.description}</p>

        {/* Member Display and Update Button */}
        <div className="mb-8 p-4 border rounded-lg shadow-md bg-white">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">Project Members</h2>
            {role === 'admin' && (
              <button
                onClick={() => setIsMemberModalOpen(true)}
                className="py-1 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition duration-200"
              >
                Update Members
              </button>
            )}
          </div>
          <ul className="flex flex-wrap gap-2 mt-1">
            {project.members.length > 0 ? (
              project.members.map(m => (
                <li key={m.id} className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                  {m.name}
                </li>
              ))
            ) : (
              <li className="text-gray-500 text-sm">No members assigned.</li>
            )}
          </ul>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Tasks ({project.tasks.length})</h2>
          {project.tasks.length > 0 ? (
            <TaskList tasks={project.tasks} onTaskUpdated={fetchProjectDetails} />
          ) : (
            <p className="text-gray-500">No tasks for this project.</p>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Activity Logs</h2>
          <ul className="space-y-2 p-4 border rounded-lg shadow-md bg-white">
            {project.activity_logs.map(log => (
              <li key={log.id} className="text-sm border-b pb-1 last:border-b-0">
                <span className="font-medium">{log.user_name}</span> {log.action}
                <span className="text-xs text-gray-400 ml-2">{new Date(log.created_at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Modals */}
        <TaskModal
          projectId={id}
          members={allMembers}
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onTaskAdded={fetchProjectDetails}
        />

        <ProjectModal
          projectToEdit={project}
          isOpen={isProjectModalOpen}
          onClose={() => setIsProjectModalOpen(false)}
          onProjectSaved={handleProjectSaved}
        />

        <MemberAssignmentModal
          projectId={id}
          projectMembers={project.members}
          allMembers={allMembers}
          isOpen={isMemberModalOpen}
          onClose={() => setIsMemberModalOpen(false)}
          onMembersUpdated={handleMembersUpdated}
        />
      </div>
    </div>
  );
};

export default ProjectDetails;
