import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import MemberDashboard from "./pages/MemberDashboard";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import Members from "./pages/Members";
import Reports from "./pages/Reports"; // Added Reports import
import Login from "./pages/Login";

function AppRoutes() {
  const [token, setToken] = React.useState(() => localStorage.getItem("token"));
  const [role, setRole] = React.useState(() => localStorage.getItem("role"));

  React.useEffect(() => {
    const onLogin = () => {
      setToken(localStorage.getItem("token"));
      setRole(localStorage.getItem("role"));
    };
    const onLogout = () => {
      setToken(null);
      setRole(null);
    };
    window.addEventListener("login", onLogin);
    window.addEventListener("logout", onLogout);
    return () => {
      window.removeEventListener("login", onLogin);
      window.removeEventListener("logout", onLogout);
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {token ? (
          <>
            <Route
              path="/"
              element={role === "admin" ? <AdminDashboard /> : <MemberDashboard />}
            />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
            {role === "admin" && <Route path="/members" element={<Members />} />}
            {role === "admin" && <Route path="/reports" element={<Reports />} />}
            <Route path="/login" element={<Navigate to="/" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        ) : (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
