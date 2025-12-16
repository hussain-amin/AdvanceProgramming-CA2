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

export const updateTaskStatus = async (projectId, taskNumber, status, token) => {
  const res = await fetch(`${BASE_URL}/projects/${projectId}/tasks/${taskNumber}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status })
  });
  return res.json();
};

export const addComment = async (projectId, taskNumber, content, token) => {
  const res = await fetch(`${BASE_URL}/projects/${projectId}/tasks/${taskNumber}/comment`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ content })
  });
  return res.json();
};

export const getTaskComments = async (projectId, taskNumber, token) => {
  const res = await fetch(`${API_URL}/projects/${projectId}/tasks/${taskNumber}/comments`, {
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
