import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getProjects, getMembers } from "../api/admin";
import "../styles/Dashboard.css";

const AdminDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("userName");

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching projects and members...");
        const [projData, membData] = await Promise.all([
          getProjects(token),
          getMembers(token),
        ]);
        console.log("Projects:", projData);
        console.log("Members:", membData);
        setProjects(projData.projects || []);
        setMembers(membData.members || []);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
    else setLoading(false);
  }, [token]);

  const stats = [
    { label: "Total Projects", value: projects.length, color: "#646cff" },
    { label: "Total Members", value: members.length, color: "#61dafb" },
    {
      label: "Active Projects",
      value: projects.filter((p) => p.status !== "completed").length,
      color: "#58d68d",
    },
  ];

  return (
    <div className="dashboard-container">
      <Sidebar userName={userName} />
      <div className="dashboard-main">
        <Navbar userName={userName} />
        <div className="dashboard-content">
          <div className="dashboard-header">
            <h1>Admin Dashboard</h1>
            <p>Manage projects, members, and tasks</p>
          </div>

          <div className="stats-grid">
            {stats.map((stat, idx) => (
              <div key={idx} className="stat-card">
                <div className="stat-value" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="dashboard-section">
            <div className="section-header">
              <h2>Projects</h2>
              <Link to="/projects" className="btn-primary">
                Manage Projects
              </Link>
            </div>

            {loading ? (
              <p>Loading projects...</p>
            ) : projects.length > 0 ? (
              <div className="projects-grid">
                {projects.slice(0, 3).map((project) => (
                  <div key={project.id} className="project-card">
                    <h3>{project.name}</h3>
                    <p className="project-description">{project.description}</p>
                    <div className="project-meta">
                      <span className="priority-badge" style={{ background: getPriorityColor(project.priority) }}>
                        {project.priority}
                      </span>
                      {project.deadline && (
                        <span className="deadline">
                          {new Date(project.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <Link to={`/projects/${project.id}`} className="btn-secondary">
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No projects yet. Create one to get started.</p>
            )}
          </div>

          <div className="dashboard-section">
            <div className="section-header">
              <h2>Team Members</h2>
              <Link to="/members" className="btn-primary">
                Manage Members
              </Link>
            </div>

            {loading ? (
              <p>Loading members...</p>
            ) : members.length > 0 ? (
              <div className="members-list">
                {members.slice(0, 5).map((member) => (
                  <div key={member.id} className="member-item">
                    <div className="member-info">
                      <div className="member-avatar">{member.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <h4>{member.name}</h4>
                        <p>{member.email}</p>
                      </div>
                    </div>
                    <span className="role-badge">{member.role}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No members yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const getPriorityColor = (priority) => {
  const colors = { High: "#ff6b6b", Medium: "#ffd93d", Low: "#6bcf7f" };
  return colors[priority] || "#646cff";
};

export default AdminDashboard;
