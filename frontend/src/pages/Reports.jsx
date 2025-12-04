import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const Reports = () => {
  const userName = localStorage.getItem("userName");

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8">
        <Navbar userName={userName} />
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Reports</h1>
        <div className="p-6 bg-white rounded-xl shadow-lg">
          <p className="text-gray-600">Reports functionality will be implemented here.</p>
        </div>
      </div>
    </div>
  );
};

export default Reports;
