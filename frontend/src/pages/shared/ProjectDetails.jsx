import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProjectById, getMembers, deleteProject } from "../../api/admin";
import { getProjectDetails as getMemberProjectDetails } from "../../api/member";
import { uploadProjectFile, getProjectFiles, deleteProjectFile, getMemberProjectFiles } from "../../api/files";
import Sidebar from "../../components/Sidebar";
import TaskList from "../../components/TaskList";
import TaskModal from "../../components/TaskModal";
import ProjectModal from "../../components/ProjectModal";
import MemberAssignmentModal from "../../components/MemberAssignmentModal";
import ProjectCompletionModal from "../../components/ProjectCompletionModal";
import FileUpload from "../../components/FileUpload";
import FileList from "../../components/FileList";

const ProjectDetails = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [allMembers, setAllMembers] = useState([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null); // New state for editing
  const [sortKey, setSortKey] = useState('due_date'); // New state for sorting
  const [projectFiles, setProjectFiles] = useState([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isFileUploadModalOpen, setIsFileUploadModalOpen] = useState(false);

  const fetchProjectDetails = async () => {
    try {
      let res;
      if (role === 'admin') {
        res = await getProjectById(id, token);
      } else {
        // Member uses their own endpoint
        res = await getMemberProjectDetails(id, token);
      }
      setProject(res.project);
    } catch (error) {
      console.error("Error fetching project details:", error);
    }
  };

  const fetchAllMembers = async () => {
    const res = await getMembers(token);
    setAllMembers(res.members);
  };

  const fetchProjectFiles = async () => {
    try {
      let files;
      if (role === 'admin') {
        files = await getProjectFiles(id, token);
      } else {
        files = await getMemberProjectFiles(id, token);
      }
      setProjectFiles(files);
    } catch (error) {
      console.error("Error fetching project files:", error);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
    if (role === 'admin') {
      fetchAllMembers();
    }
    fetchProjectFiles();
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

  const handleTaskEdit = (task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleTaskModalClose = () => {
    setIsTaskModalOpen(false);
    setTaskToEdit(null);
  };

  const handleFileUpload = async (file) => {
    try {
      setIsUploadingFile(true);
      await uploadProjectFile(id, file, token);
      await fetchProjectFiles();
      setIsFileUploadModalOpen(false); // Close modal after successful upload
    } catch (error) {
      alert("Error uploading file: " + error);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await deleteProjectFile(id, fileId, token);
      await fetchProjectFiles();
    } catch (error) {
      alert("Error deleting file: " + error);
    }
  };

  // Sorting logic
  const sortedTasks = useMemo(() => {
    if (!project || !project.tasks) return [];

    const tasksCopy = [...project.tasks];
    
    tasksCopy.sort((a, b) => {
      if (sortKey === 'due_date') {
        const dateA = a.due_date ? new Date(a.due_date).getTime() : Infinity;
        const dateB = b.due_date ? new Date(b.due_date).getTime() : Infinity;
        return dateA - dateB;
      } else if (sortKey === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority.toLowerCase()] - priorityOrder[a.priority.toLowerCase()];
      }
      return 0;
    });

    return tasksCopy;
  }, [project, sortKey]);

  if (!project) return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <p className="text-center text-gray-500">Loading project details...</p>
      </div>
    </div>
  );

  // Filter all members to only include those assigned to the project for task assignment
  const projectMembers = project.members || [];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">{project.name}</h1>
          {role === 'admin' && (
            <div className="flex space-x-3">
              <button
                onClick={() => setIsTaskModalOpen(true)}
                disabled={project.completion_date}
                className={`py-2 px-4 font-semibold rounded-lg shadow-md transition duration-200 ${
                  project.completion_date
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                + Add New Task
              </button>

              <button
                onClick={() => setIsProjectModalOpen(true)}
                disabled={project.completion_date}
                className={`py-2 px-4 font-semibold rounded-lg shadow-md transition duration-200 ${
                  project.completion_date
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                }`}
              >
                Edit Project
              </button>

              {!project.completion_date && (
                <button
                  onClick={() => setIsCompletionModalOpen(true)}
                  className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition duration-200"
                >
                  Mark Complete
                </button>
              )}

              <button
                onClick={handleDeleteProject}
                className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition duration-200"
              >
                Delete Project
              </button>
            </div>
          )}
        </div>

        <p className="text-gray-700 mb-6">{project.description}</p>

        {/* Project Dates */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Project Timeline</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Start Date</p>
              <p className="font-medium text-gray-900">
                {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Due Date</p>
              <p className="font-medium text-gray-900">
                {project.due_date ? new Date(project.due_date).toLocaleDateString() : 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Completion Date</p>
              <p className="font-medium text-gray-900">
                {project.completion_date ? new Date(project.completion_date).toLocaleDateString() : 'Not set'}
              </p>
            </div>
          </div>
        </div>

        {/* Member Display and Update Button */}
        <div className="mb-8 p-4 border rounded-lg shadow-md bg-white">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">Project Members</h2>
            {role === 'admin' && (
              <button
                onClick={() => setIsMemberModalOpen(true)}
                disabled={project.completion_date}
                className={`py-1 px-3 text-sm font-semibold rounded-lg transition duration-200 ${
                  project.completion_date
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                Update Members
              </button>
            )}
          </div>
          <ul className="flex flex-wrap gap-2 mt-1">
            {projectMembers.length > 0 ? (
              projectMembers.map(m => (
                <li key={m.id} className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                  {m.name}
                </li>
              ))
            ) : (
              <li className="text-gray-500 text-sm">No members assigned.</li>
            )}
          </ul>
        </div>

        {/* Project Files Section */}
        <div className="mb-8 p-4 border rounded-lg shadow-md bg-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Project Files</h2>
            {role === 'admin' && (
              <button
                onClick={() => setIsFileUploadModalOpen(true)}
                className="py-1 px-3 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
              >
                + Add Files
              </button>
            )}
          </div>
          <FileList files={projectFiles} onDelete={handleDeleteFile} canDelete={role === 'admin'} />
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Tasks ({project.tasks.length})</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value)}
                className="p-1 border rounded text-sm"
              >
                <option value="due_date">Due Date</option>
                <option value="priority">Priority</option>
              </select>
            </div>
          </div>
          
          {sortedTasks.length > 0 ? (
            <TaskList tasks={sortedTasks} onTaskUpdated={fetchProjectDetails} onTaskEdit={handleTaskEdit} />
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
          members={projectMembers} // Only project members can be assigned tasks
          taskToEdit={taskToEdit}
          isOpen={isTaskModalOpen}
          onClose={handleTaskModalClose}
          onTaskSaved={fetchProjectDetails}
          projectStartDate={project.start_date}
          projectDueDate={project.due_date}
        />

        <ProjectModal
          projectToEdit={project}
          isOpen={isProjectModalOpen}
          onClose={() => setIsProjectModalOpen(false)}
          onProjectSaved={handleProjectSaved}
        />

        <MemberAssignmentModal
          projectId={id}
          projectMembers={projectMembers}
          allMembers={allMembers}
          isOpen={isMemberModalOpen}
          onClose={() => setIsMemberModalOpen(false)}
          onMembersUpdated={handleMembersUpdated}
        />

        <ProjectCompletionModal
          projectId={id}
          projectName={project.name}
          tasks={sortedTasks}
          isOpen={isCompletionModalOpen}
          onClose={() => setIsCompletionModalOpen(false)}
          onCompleted={handleProjectSaved}
        />

        {/* File Upload Modal */}
        {isFileUploadModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h3 className="text-2xl font-semibold text-gray-900">Upload Files</h3>
                <button 
                  onClick={() => setIsFileUploadModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              <FileUpload onFileUpload={handleFileUpload} uploading={isUploadingFile} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;
