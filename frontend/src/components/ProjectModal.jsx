import React from "react";
import ProjectForm from "./ProjectForm";

const ProjectModal = ({ projectToEdit, isOpen, onClose, onProjectSaved }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-2xl font-semibold text-gray-900">
            {projectToEdit ? "Edit Project" : "Create New Project"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <ProjectForm
          projectToEdit={projectToEdit}
          onProjectSaved={( ) => {
            onProjectSaved();
            onClose();
          }}
        />
      </div>
    </div>
  );
};

export default ProjectModal;
