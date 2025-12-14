const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const BASE_URL = `${API_URL}/member`;

export const getMemberProjects = async (token ) => {
  const res = await fetch(`${BASE_URL}/projects`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const getProjectDetails = async (projectId, token) => {
  const res = await fetch(`${BASE_URL}/projects/${projectId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const getProjectTasks = async (projectId, token) => {
  const res = await fetch(`${BASE_URL}/projects/${projectId}/tasks`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const updateTaskStatus = async (taskId, status, token) => {
  const res = await fetch(`${BASE_URL}/tasks/${taskId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status })
  });
  return res.json();
};

export const addComment = async (taskId, content, token) => {
  const res = await fetch(`${BASE_URL}/tasks/${taskId}/comment`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ content })
  });
  return res.json();
};

export const getTaskComments = async (taskId, token) => {
  const res = await fetch(`${API_URL}/tasks/${taskId}/comments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const getMyTasks = async (token, filters = {}) => {
  const params = new URLSearchParams(filters);
  const res = await fetch(`${BASE_URL}/tasks?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};
