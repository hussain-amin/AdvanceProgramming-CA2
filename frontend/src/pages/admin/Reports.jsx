import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Reports = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("http://localhost:5000/admin/reports/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-lg">Loading reports...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500 text-lg">Failed to load reports</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Project Reports</h1>
        <p className="text-gray-600 mt-2">Comprehensive analytics and insights</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Projects"
          value={stats.summary.total_projects}
          icon="📊"
          color="bg-blue-50 border-blue-200"
        />
        <StatCard
          title="Total Tasks"
          value={stats.summary.total_tasks}
          icon="✓"
          color="bg-green-50 border-green-200"
        />
        <StatCard
          title="Active Members"
          value={stats.summary.total_members}
          icon="👥"
          color="bg-purple-50 border-purple-200"
        />
        <StatCard
          title="Completion Rate"
          value={`${stats.summary.completion_rate}%`}
          icon="🎯"
          color="bg-orange-50 border-orange-200"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Task Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Task Status Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.status_distribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.status_distribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} tasks`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Task Priority Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Task Priority Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.priority_distribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" radius={[8, 8, 0, 0]}>
                {stats.priority_distribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={["#82ca9d", "#ffc658", "#ff7c7c"][index]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Summary</h2>
        <div className="space-y-4">
          {stats.status_distribution.map((status, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: status.color }}
                ></div>
                <span className="text-gray-700 font-medium">{status.name}</span>
              </div>
              <span className="text-gray-900 font-bold">{status.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function StatCard({ title, value, icon, color }) {
  return (
    <div className={`${color} border rounded-lg p-6 shadow-md hover:shadow-lg transition`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 font-medium text-sm">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </div>
  );
}

export default Reports;
