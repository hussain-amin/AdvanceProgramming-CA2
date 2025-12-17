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

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Reports = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/reports/stats`, {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
        <StatCard
          title="Overdue Tasks"
          value={stats.summary.overdue_tasks}
          icon="⚠️"
          color={stats.summary.overdue_tasks > 0 ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"}
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
                cx="40%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                isAnimationActive={false}
              >
                {stats.status_distribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend 
                layout="vertical" 
                align="right" 
                verticalAlign="middle"
                formatter={(value, entry) => `${entry.payload.name}: ${entry.payload.value}`}
              />
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
              <Bar dataKey="value" fill="#8884d8" radius={[8, 8, 0, 0]} isAnimationActive={false}>
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
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Task Status Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      {/* Top Performers & Project Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performers */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">🏆 Top Performers</h2>
          {stats.top_performers && stats.top_performers.length > 0 ? (
            <div className="space-y-3">
              {stats.top_performers.map((performer, idx) => (
                <div
                  key={performer.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <span className={`text-2xl font-bold ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-amber-600' : 'text-gray-500'}`}>
                      #{idx + 1}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
                      {performer.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-800 font-medium">{performer.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-green-600">{performer.completed}</span>
                    <span className="text-gray-500 text-sm">completed</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No completed tasks yet</p>
          )}
        </div>

        {/* Project Progress */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">📈 Project Progress</h2>
          {stats.project_progress && stats.project_progress.length > 0 ? (
            <div className="space-y-4">
              {stats.project_progress.map((project) => (
                <div key={project.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-800 font-medium">
                      <span className="text-indigo-600">#{project.id}</span> {project.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {project.completed_tasks}/{project.total_tasks} tasks
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        project.progress === 100 ? 'bg-green-500' : 
                        project.progress >= 50 ? 'bg-blue-500' : 
                        project.progress > 0 ? 'bg-amber-500' : 'bg-gray-300'
                      }`}
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-sm font-semibold text-gray-600">
                    {project.progress}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No projects yet</p>
          )}
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
