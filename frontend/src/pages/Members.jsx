import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { getMembers, deleteMember, updateMember, createMember } from "../api/admin";

// Reusable MemberForm component (moved from the previous Members.jsx)
const MemberForm = ({ onMemberSaved, memberToEdit, setMemberToEdit, onClose }) => {
  const token = localStorage.getItem("token");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "member",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (memberToEdit) {
      setFormData({
        name: memberToEdit.name || "",
        email: memberToEdit.email || "",
        password: "", // Password should not be pre-filled
        role: memberToEdit.role || "member",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "member",
      });
    }
  }, [memberToEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      let result;
      if (memberToEdit) {
        // Update member
        const updateData = { name: formData.name, email: formData.email, role: formData.role };
        if (formData.password) {
          updateData.password = formData.password;
        }
        result = await updateMember(memberToEdit.id, updateData, token);
      } else {
        // Create new member
        result = await createMember(formData, token);
      }

      if (result.msg) {
        setMessage({ type: "success", text: result.msg });
        onMemberSaved();
        onClose(); // Close modal on success
      } else {
        setMessage({ type: "error", text: result.msg || "Operation failed." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred while saving the member." });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <h3 className="text-xl font-semibold mb-4">
        {memberToEdit ? "Edit Member" : "Add New Member"}
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
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        />
        <input
          type="password"
          name="password"
          placeholder={memberToEdit ? "New Password (optional)" : "Password"}
          value={formData.password}
          onChange={handleChange}
          required={!memberToEdit && !memberToEdit} // Require password only for new members
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        />
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-200 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : memberToEdit ? "Update Member" : "Add Member"}
        </button>
      </form>
    </div>
  );
};

// Reusable MemberModal component
const MemberModal = ({ memberToEdit, isOpen, onClose, onMemberSaved }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-2xl font-semibold text-gray-900">
            {memberToEdit ? "Edit Member" : "Add New Member"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <MemberForm
          memberToEdit={memberToEdit}
          onMemberSaved={onMemberSaved}
          onClose={onClose}
        />
      </div>
    </div>
   );
};


const Members = () => {
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("userName");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchMembers = async () => {
    setLoading(true);
    const data = await getMembers(token);
    setMembers(data.members || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this member? All their assigned tasks will be unassigned.")) {
      await deleteMember(id, token);
      fetchMembers();
    }
  };

  const handleEdit = (member) => {
    setMemberToEdit(member);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setMemberToEdit(null);
  };

  const handleMemberSaved = () => {
    fetchMembers();
    setMemberToEdit(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Manage Members</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-200"
          >
            + Add New Member
          </button>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">Member List</h2>
          {loading ? (
            <p className="text-gray-500">Loading members...</p>
          ) : (
            <div className="bg-white shadow-lg rounded-xl overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {member.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${member.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}`}>
                          {member.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(member)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Member Creation/Edit Modal */}
        <MemberModal
          memberToEdit={memberToEdit}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onMemberSaved={handleMemberSaved}
        />
      </div>
    </div>
  );
};

export default Members;
