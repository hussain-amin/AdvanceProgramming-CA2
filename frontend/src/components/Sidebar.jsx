import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const role = localStorage.getItem("role");
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    window.dispatchEvent(new Event("logout"));
  };

  const navItems = [
    { name: "Dashboard", path: "/", icon: "📊" },
    { name: "Projects", path: "/projects", icon: "📁" },
    ...(role === "admin"
      ? [
          { name: "Members", path: "/members", icon: "👥" },
          { name: "Reports", path: "/reports", icon: "📈" },
        ]
      : []),
  ];

  return (
      <div className="fixed left-0 top-0 flex flex-col w-64 bg-gray-800 text-white h-screen shadow-2xl z-40">
      <div className="p-6 text-2xl font-bold border-b border-gray-700">
        PM Portal
      </div>
      <nav className="flex-grow p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                isActive
                  ? "bg-blue-600 text-white shadow-md"
                  : "hover:bg-gray-700 text-gray-300"
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center p-3 rounded-lg bg-red-600 hover:bg-red-700 transition-colors duration-200 text-white font-semibold"
        >
          <span className="mr-2">🚪</span>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
