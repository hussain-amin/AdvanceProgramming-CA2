import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile } from "../api/auth";

const ProfileUpdate = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getProfile(token);
      setUser(res.user);
      setFormData(prev => ({
        ...prev,
        name: res.user.name,
        email: res.user.email,
      }));
    } catch (err) {
      setMessage({ type: "error", text: "Failed to load profile" });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    // Validate passwords match
    if (formData.new_password !== formData.confirm_password) {
      setMessage({ type: "error", text: "Passwords do not match" });
      setIsSubmitting(false);
      return;
    }

    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
      };

      // Only include password if changing it
      if (formData.new_password) {
        if (!formData.current_password) {
          setMessage({ type: "error", text: "Current password is required to change password" });
          setIsSubmitting(false);
          return;
        }
        updateData.current_password = formData.current_password;
        updateData.new_password = formData.new_password;
      }

      const result = await updateProfile(updateData, token);

      if (result.msg) {
        // Update localStorage with new name if it changed
        if (result.user.name !== user.name) {
          localStorage.setItem("userName", result.user.name);
        }
        setUser(result.user);
        
        // Redirect to dashboard after successful update
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        setMessage({ type: "error", text: result.msg || "Update failed" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred while updating profile" });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-center text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Update Profile</h1>

          <div className="bg-white rounded-xl shadow-lg p-8">
            {message && (
              <div className={`p-4 mb-6 rounded-lg ${
                message.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Divider */}
              <div className="border-t pt-6 mt-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Change Password (Optional)</h2>
                <p className="text-sm text-gray-600 mb-4">Leave blank if you don't want to change your password</p>

                {/* Current Password */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    name="current_password"
                    value={formData.current_password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* New Password */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    name="new_password"
                    value={formData.new_password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Confirm Password */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-200 disabled:opacity-50"
              >
                {isSubmitting ? "Updating..." : "Update Profile"}
              </button>
            </form>

            {/* User Info Display */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Current Information</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>User ID:</strong> {user?.id}</p>
                <p><strong>Role:</strong> <span className="capitalize">{user?.role}</span></p>
                <p><strong>Member Since:</strong> Today</p>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default ProfileUpdate;
