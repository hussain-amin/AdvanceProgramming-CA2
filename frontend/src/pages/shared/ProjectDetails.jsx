import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [allMembers, setAllMembers] = useState([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [sortKey, setSortKey] = useState('due_date');
  const [projectFiles, setProjectFiles] = useState([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isFileUploadModalOpen, setIsFileUploadModalOpen] = useState(false);
  const [highlightedTask, setHighlightedTask] = useState(null);

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

  // Handle scroll to task from notification click
  useEffect(() => {
    const taskNumber = searchParams.get('task');
    if (taskNumber && project) {
      setHighlightedTask(parseInt(taskNumber));
      
      // Wait for DOM to render, then scroll to task
      setTimeout(() => {
        const taskElement = document.getElementById(`task-${taskNumber}`);
        if (taskElement) {
          taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        // Clear highlight after 3 seconds
        setTimeout(() => {
          setHighlightedTask(null);
          // Clear the URL param
          setSearchParams({});
        }, 3000);
      }, 100);
    }
  }, [project, searchParams]);

  const handleDeleteProject = async () => {
    if (window.confirm(`Are you sure you want to delete project #${project.id}: ${project.name}?`)) {
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
        {/* TOP SECTION: Title and Buttons */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Project Info */}
          <div className="col-span-2 p-4 bg-white rounded-lg shadow-md border border-gray-200 max-h-48 overflow-y-auto">
            <h1 className="text-2xl font-bold mb-2"><span className="text-indigo-600">#{project.id}</span> {project.name}</h1>
            <p className="text-gray-600 text-sm whitespace-pre-wrap break-words">{project.description}</p>
          </div>

          {/* Admin Buttons */}
          {role === 'admin' && (
            <div className="col-span-1 p-4 bg-white rounded-lg shadow-md border border-gray-200 flex flex-col gap-3">
              <button
                onClick={() => setIsProjectModalOpen(true)}
                disabled={project.completion_date}
                className={`flex-1 py-2 px-4 font-semibold rounded-lg shadow-sm transition duration-200 text-sm ${
                  project.completion_date
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                }`}
              >
                ✏️ Edit Project
              </button>

              {!project.completion_date && (
                <button
                  onClick={() => setIsCompletionModalOpen(true)}
                  className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-sm transition duration-200 text-sm"
                >
                  ✓ Mark Complete
                </button>
              )}

              <button
                onClick={handleDeleteProject}
                className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-sm transition duration-200 text-sm"
              >
                🗑️ Delete
              </button>
            </div>
          )}
        </div>

        {/* MIDDLE SECTION: Timeline, Files, and Members */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Project Timeline */}
          <div className="col-span-1 p-4 bg-blue-50 rounded-lg border border-blue-200 overflow-hidden flex flex-col">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Project Timeline</h3>
            <div className="relative pl-4 flex-1 flex flex-col justify-center gap-4">
              {/* Start Date */}
              <div className="flex items-center gap-4 relative z-10">
                <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full border-2 border-blue-50 shadow-md flex items-center justify-center">
                  <span className="text-white text-xs font-bold">▶</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Start Date</p>
                  <p className="text-sm font-bold text-gray-800">{project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}</p>
                </div>
              </div>

              {/* Due Date */}
              <div className="flex items-center gap-4 relative z-10">
                <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-orange-400 to-red-600 rounded-full border-2 border-blue-50 shadow-md flex items-center justify-center">
                  <span className="text-white text-xs">📅</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Due Date</p>
                  <p className="text-sm font-bold text-gray-800">{project.due_date ? new Date(project.due_date).toLocaleDateString() : 'Not set'}</p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-4 relative z-10">
                <div className={`flex-shrink-0 w-7 h-7 rounded-full border-2 border-blue-50 shadow-md flex items-center justify-center ${project.completion_date ? 'bg-gradient-to-br from-green-400 to-emerald-600' : 'bg-gradient-to-br from-blue-400 to-indigo-600'}`}>
                  <span className="text-white text-xs font-bold">{project.completion_date ? '✓' : '◐'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status</p>
                  <p className={`text-sm font-bold ${project.completion_date ? 'text-green-600' : 'text-blue-600'}`}>
                    {project.completion_date ? `Completed: ${new Date(project.completion_date).toLocaleDateString()}` : 'In Progress'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Project Files */}
          <div className="col-span-1 p-4 border rounded-lg shadow-md bg-white max-h-64 overflow-y-auto">
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

          {/* Project Members */}
          <div className="col-span-1 p-4 border rounded-lg shadow-md bg-white max-h-64 overflow-y-auto">
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
            <ul className="flex flex-col gap-2 mt-2">
              {projectMembers.length > 0 ? (
                projectMembers.map(m => (
                  <li key={m.id} className="bg-blue-100 text-blue-800 text-sm font-medium px-4 py-2 rounded-lg">
                    {m.name}
                  </li>
                ))
              ) : (
                <li className="text-gray-500 text-sm">No members assigned.</li>
              )}
            </ul>
          </div>
        </div>

        {/* BOTTOM SECTION: Tasks and Activity Logs */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Tasks */}
          <div className="col-span-2 p-4 border rounded-lg shadow-md bg-white max-h-[600px] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Tasks ({project.tasks.length})</h2>
              {role === 'admin' && (
                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  disabled={project.completion_date}
                  className={`py-1 px-3 text-sm font-semibold rounded-lg transition duration-200 ${
                    project.completion_date
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  + Add Task
                </button>
              )}
            </div>
            <div className="mb-3 flex items-center space-x-2">
              <span className="text-xs text-gray-600">Sort:</span>
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value)}
                className="p-1 border rounded text-xs"
              >
                <option value="due_date">Due Date</option>
                <option value="priority">Priority</option>
              </select>
            </div>
            {sortedTasks.length > 0 ? (
              <TaskList tasks={sortedTasks} onTaskUpdated={fetchProjectDetails} onTaskEdit={handleTaskEdit} highlightedTask={highlightedTask} />
            ) : (
              <p className="text-gray-500 text-sm">No tasks for this project.</p>
            )}
          </div>

          {/* Activity Logs */}
          <div className="col-span-1 p-4 border rounded-lg shadow-md bg-white max-h-[600px] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Activity Logs</h2>
            <ul className="space-y-2">
              {project.activity_logs && project.activity_logs.length > 0 ? (
                project.activity_logs.map(log => (
                  <li key={log.id} className="text-xs border-b pb-2 last:border-b-0">
                    <span className="font-medium text-gray-800">{log.user_name}</span>
                    <p className="text-gray-600 text-xs mt-1">{log.action}</p>
                    <span className="text-gray-400 text-xs">{new Date(log.created_at).toLocaleString()}</span>
                  </li>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No activities yet.</p>
              )}
            </ul>
          </div>
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
