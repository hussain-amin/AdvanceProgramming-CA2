import React from "react";
import NotificationPanel from "./NotificationPanel";

const Navbar = ({ userName, title }) => {
  const role = localStorage.getItem("role");

  return (
      <div className="sticky top-0 z-30 flex justify-between items-center p-4 bg-white shadow-md rounded-lg mb-6">
      <h1 className="text-2xl font-semibold text-gray-800">
        {title || (role === "admin" ? "Admin Dashboard" : "Member Dashboard")}
      </h1>
      <div className="flex items-center space-x-4">
        <NotificationPanel />
        <span className="text-gray-600">
          Welcome, <span className="font-medium text-blue-600">{userName}</span>
        </span>
        <span className="px-3 py-1 text-xs font-semibold text-white bg-green-500 rounded-full uppercase">
          {role}
        </span>
      </div>
    </div>
  );
};

export default Navbar;
