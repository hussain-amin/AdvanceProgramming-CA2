import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import AdminDashboard from "./pages/admin/Dashboard";
import MemberDashboard from "./pages/member/Dashboard";
import Projects from "./pages/shared/Projects";
import ProjectDetails from "./pages/shared/ProjectDetails";
import Members from "./pages/admin/Members";
import Reports from "./pages/admin/Reports";
import ProfileUpdate from "./pages/ProfileUpdate";
import Login from "./pages/Login";

// Inner component that uses useLocation
function MainContent({ token, role, userName }) {
  const location = useLocation();

  const getTitleForRoute = () => {
    const path = location.pathname;
    if (path === "/") return role === "admin" ? "Admin Dashboard" : "Member Dashboard";
    if (path === "/projects") return "Projects";
    if (path.startsWith("/projects/")) return "Project Details";
    if (path === "/members") return "Manage Members";
    if (path === "/reports") return "Reports";
    if (path === "/profile") return "Update Profile";
    return "Dashboard";
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="p-8">
          <Navbar userName={userName} title={getTitleForRoute()} />
          <main>
            <Routes>
              <Route
                path="/"
                element={role === "admin" ? <AdminDashboard /> : <MemberDashboard />}
              />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectDetails />} />
              <Route path="/profile" element={<ProfileUpdate />} />
              {role === "admin" && <Route path="/members" element={<Members />} />}
              {role === "admin" && <Route path="/reports" element={<Reports />} />}
              <Route path="/login" element={<Navigate to="/" />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}

function AppRoutes() {
  const [token, setToken] = React.useState(() => localStorage.getItem("token"));
  const [role, setRole] = React.useState(() => localStorage.getItem("role"));
  const userName = localStorage.getItem("userName");

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
      {token ? (
        <MainContent token={token} role={role} userName={userName} />
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default AppRoutes;
