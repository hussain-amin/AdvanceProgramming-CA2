const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const BASE_URL = `${API_URL}/admin`;

export const getProjects = async (token ) => {
  const res = await fetch(`${BASE_URL}/projects`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const createProject = async (project, token) => {
  const res = await fetch(`${BASE_URL}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(project),
  });
  return res.json();
};

export const getMembers = async (token) => {
  const res = await fetch(`${BASE_URL}/members`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const createMember = async (member, token) => {
  const res = await fetch(`${BASE_URL}/members`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(member),
  });
  return res.json();
};

export const deleteProject = async (id, token) => {
  const res = await fetch(`${BASE_URL}/projects/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};

export const updateProject = async (id, project, token) => {
  const res = await fetch(`${BASE_URL}/projects/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(project),
  });
  return res.json();
};

export const getProjectById = async (id, token) => {
  const res = await fetch(`${BASE_URL}/projects/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};

export const updateProjectMembers = async (projectId, memberIds, token) => {
  const res = await fetch(`${BASE_URL}/projects/${projectId}/members`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ member_ids: memberIds })
  });
  return res.json();
};

export const createTask = async (projectId, task, token) => {
  const res = await fetch(`${BASE_URL}/projects/${projectId}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(task)
  });
  return res.json();
};

export const updateTask = async (taskId, task, token) => {
  const res = await fetch(`${API_URL}/admin/tasks/${taskId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(task)
  });
  return res.json();
};

export const deleteTask = async (taskId, token) => {
  const res = await fetch(`${API_URL}/admin/tasks/${taskId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};

export const getAllTasks = async (token, filters = {}) => {
  const params = new URLSearchParams(filters);
  const res = await fetch(`${API_URL}/admin/tasks?${params}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};

export const updateMember = async (userId, member, token) => {
  const res = await fetch(`${BASE_URL}/members/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(member),
  });
  return res.json();
};

export const deleteMember = async (userId, token) => {
  const res = await fetch(`${BASE_URL}/members/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};

export const completeProject = async (projectId, token) => {
  const res = await fetch(`${BASE_URL}/projects/${projectId}/complete`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};

export const approveTaskCompletion = async (taskId, token) => {
  const res = await fetch(`${BASE_URL}/tasks/${taskId}/approve`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};

export const rejectTaskCompletion = async (taskId, reason = '', token) => {
  const res = await fetch(`${BASE_URL}/tasks/${taskId}/reject`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ reason })
  });
  return res.json();
};
