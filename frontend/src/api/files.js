import axios from 'axios';

const API_BASE = 'http://localhost:5000';

// Project Files
export async function uploadProjectFile(projectId, file, token) {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await axios.post(
      `${API_BASE}/admin/projects/${projectId}/files`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.msg || 'Error uploading file';
  }
}

export async function getProjectFiles(projectId, token) {
  try {
    const response = await axios.get(
      `${API_BASE}/admin/projects/${projectId}/files`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    return response.data.files;
  } catch (error) {
    throw error.response?.data?.msg || 'Error fetching files';
  }
}

export async function getMemberProjectFiles(projectId, token) {
  try {
    const response = await axios.get(
      `${API_BASE}/member/projects/${projectId}/files`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    return response.data.files;
  } catch (error) {
    throw error.response?.data?.msg || 'Error fetching files';
  }
}

export async function deleteProjectFile(projectId, fileId, token) {
  try {
    const response = await axios.delete(
      `${API_BASE}/admin/projects/${projectId}/files/${fileId}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.msg || 'Error deleting file';
  }
}

// Task Files
export async function uploadTaskFile(taskId, file, token) {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await axios.post(
      `${API_BASE}/member/tasks/${taskId}/files`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.msg || 'Error uploading file';
  }
}

export async function getTaskFiles(taskId, token) {
  try {
    const response = await axios.get(
      `${API_BASE}/member/tasks/${taskId}/files`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    return response.data.files;
  } catch (error) {
    throw error.response?.data?.msg || 'Error fetching files';
  }
}

export async function deleteTaskFile(taskId, fileId, token) {
  try {
    const response = await axios.delete(
      `${API_BASE}/member/tasks/${taskId}/files/${fileId}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.msg || 'Error deleting file';
  }
}
