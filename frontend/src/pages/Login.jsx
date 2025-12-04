import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Login = ( ) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "member",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const endpoint = isRegister ? `${API_URL}/register` : `${API_URL}/login`;
    const payload = isRegister
      ? formData
      : { email: formData.email, password: formData.password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        if (isRegister) {
          setMessage("Registration successful! Please log in.");
          setIsRegister(false);
        } else {
          // Login successful
          localStorage.setItem("token", data.access_token);
          localStorage.setItem("role", data.role);
          localStorage.setItem("userName", data.name);
          localStorage.setItem("userId", data.user_id);
          window.dispatchEvent(new Event("login"));
          navigate("/");
        }
      } else {
        setMessage(data.msg || "An error occurred.");
      }
    } catch (error) {
      setMessage("Network error. Could not connect to the server.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-gray-900">
          {isRegister ? "Register" : "Sign in to PM Portal"}
        </h2>

        {message && (
          <div className={`p-3 rounded-lg text-sm ${message.includes("successful") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {message}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {isRegister && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          )}
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
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
          {isRegister && (
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          )}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-200"
          >
            {isRegister ? "Register" : "Login"}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {isRegister
              ? "Already have an account? Sign in"
              : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
