import React, { useState, useEffect } from "react";
import { updateProjectMembers } from "../api/admin";

const MemberAssignmentModal = ({ projectId, projectMembers, allMembers, isOpen, onClose, onMembersUpdated }) => {
  const token = localStorage.getItem("token");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && projectMembers) {
      // Initialize selected members with current project members' IDs
      const initialIds = projectMembers.map(m => m.id);
      setSelectedMembers(initialIds);
    }
  }, [isOpen, projectMembers]);

  const handleToggleMember = (memberId) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      // Filter out null/undefined IDs just in case
      const memberIds = selectedMembers.filter(id => id !== null && id !== undefined);
      await updateProjectMembers(projectId, memberIds, token);
      onMembersUpdated();
      onClose();
    } catch (error) {
      console.error("Failed to update project members:", error);
      // Handle error display
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-2xl font-semibold text-gray-900">Manage Project Members</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto space-y-2 mb-4 p-2 border rounded-lg">
          {allMembers.map(member => (
            <div key={member.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md">
              <label htmlFor={`member-${member.id}`} className="flex-grow cursor-pointer">
                <span className="font-medium">{member.name}</span>
                <span className="text-sm text-gray-500 ml-2">({member.email} )</span>
              </label>
              <input
                id={`member-${member.id}`}
                type="checkbox"
                checked={selectedMembers.includes(member.id)}
                onChange={() => handleToggleMember(member.id)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-200 disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Members"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberAssignmentModal;
