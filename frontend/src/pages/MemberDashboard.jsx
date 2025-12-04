import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import TaskList from "../components/TaskList";
import { getMyTasks } from "../api/member";

const MemberDashboard = () => {
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("userName");
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({ status: '', priority: '' });

  const fetchTasks = async () => {
    const res = await getMyTasks(token, filters);
    setTasks(res.tasks);
  };

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8">
        <Navbar userName={userName} />
        <h1 className="text-3xl font-bold mb-6">Welcome, {userName}!</h1>

        <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Task Filters</h2>
          <div className="flex space-x-4">
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="p-2 border rounded"
            >
              <option value="">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <select
              name="priority"
              value={filters.priority}
              onChange={handleFilterChange}
              className="p-2 border rounded"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-4">My Assigned Tasks ({tasks.length})</h2>
        {tasks.length > 0 ? (
          <TaskList tasks={tasks} onTaskUpdated={fetchTasks} />
        ) : (
          <p className="text-gray-500">No tasks assigned to you matching the current filters.</p>
        )}
      </div>
    </div>
  );
};

export default MemberDashboard;
