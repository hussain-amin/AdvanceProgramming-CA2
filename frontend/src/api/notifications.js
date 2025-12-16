const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const getNotifications = async (token) => {
  const res = await fetch(`${API_URL}/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const getUnreadCount = async (token) => {
  const res = await fetch(`${API_URL}/notifications/unread-count`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const markAsRead = async (notificationId, token) => {
  const res = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const markAllAsRead = async (token) => {
  const res = await fetch(`${API_URL}/notifications/read-all`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};
