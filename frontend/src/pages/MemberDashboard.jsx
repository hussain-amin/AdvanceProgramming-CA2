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
    <main className="dashboard-container">
      <section className="sidebar-section">
        <Sidebar />
      </section>

      <section className="content-section">
        <Navbar userName={userName} />

        <div className="dashboard-content">
          <h1>Welcome, {userName}!</h1>

          <div className="dashboard-section">
            <h2>Task Filters</h2>
            <div className="filters-group">
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="filter-select"
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
                className="filter-select"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="dashboard-section">
            <h2>My Assigned Tasks ({tasks.length})</h2>
            {tasks.length > 0 ? (
              <TaskList tasks={tasks} onTaskUpdated={fetchTasks} />
            ) : (
              <p className="no-data">No tasks assigned to you matching the current filters.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default MemberDashboard;
