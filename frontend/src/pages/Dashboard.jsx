import React, { useEffect, useState } from "react";
import { getProjects } from "../api/admin";

const Dashboard = () => {
  const [projects, setProjects] = useState([]);

  const token = localStorage.getItem("token"); // JWT stored after login

  useEffect(() => {
    getProjects(token).then((data) => setProjects(data.projects || []));
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <h2>Projects Overview</h2>
      <ul>
        {projects.map((p) => (
          <li key={p.id}>{p.name} - {p.status}</li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
