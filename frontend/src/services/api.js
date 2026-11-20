import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('solarsync_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only remove token if it was an authenticated endpoint error
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || '';
      if (!url.includes('/auth/login') && !url.includes('/health')) {
        localStorage.removeItem('solarsync_token');
      }
    }
    return Promise.reject(error);
  }
);

// Diagnostics
export const checkSystemHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    return { data: response.data, online: true };
  } catch (error) {
    // Secondary fallback: attempt direct port 8000 if proxy failed
    try {
      const direct = await axios.get('http://localhost:8000/api/v1/health', { timeout: 3000 });
      return { data: direct.data, online: true };
    } catch (e2) {
      return {
        data: { status: 'disconnected', error: error.message },
        online: false,
      };
    }
  }
};

// Auth Services
export const loginUser = async (identifier, password) => {
  const response = await apiClient.post('/auth/login', { 
    username_or_email: identifier,
    name: identifier,
    username: identifier,
    email: identifier,
    password 
  });
  if (response.data.access_token) {
    localStorage.setItem('solarsync_token', response.data.access_token);
  }
  return response.data;
};

export const registerUser = async (userData) => {
  const displayName = userData.name || userData.full_name || userData.username || '';
  const response = await apiClient.post('/auth/register', {
    name: displayName,
    full_name: displayName,
    username: userData.username || displayName,
    email: userData.email || '',
    password: userData.password,
    role: userData.role || 'installation_owner',
    phone_number: userData.phone_number || '',
    latitude: userData.latitude,
    longitude: userData.longitude,
    city: userData.city,
    address: userData.address
  });
  if (response.data.access_token) {
    localStorage.setItem('solarsync_token', response.data.access_token);
  }
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

export const getTechnicians = async (params = {}) => {
  const response = await apiClient.get('/auth/technicians', { params });
  return response.data;
};

export const getDistributors = async (params = {}) => {
  const response = await apiClient.get('/auth/distributors', { params });
  return response.data;
};

// Installation & Geospatial Services
export const getInstallations = async (params = {}) => {
  const response = await apiClient.get('/installations', { params });
  return response.data;
};

export const getNearbyInstallations = async (lat, lng, radius_km = 10, status = null) => {
  const params = { lat, lng, radius_km };
  if (status && status !== 'all') params.status = status;
  const response = await apiClient.get('/installations/nearby', { params });
  return response.data;
};

export const createInstallation = async (data) => {
  const response = await apiClient.post('/installations', data);
  return response.data;
};

export const deleteInstallation = async (id) => {
  const response = await apiClient.delete(`/installations/${id}`);
  return response.data;
};

// Fault Reporting Services
export const getFaults = async (params = {}) => {
  const response = await apiClient.get('/faults', { params });
  return response.data;
};

export const createFault = async (data) => {
  const response = await apiClient.post('/faults', data);
  return response.data;
};

export const updateFaultStatus = async (faultId, status) => {
  const response = await apiClient.put(`/faults/${faultId}/status`, { status });
  return response.data;
};

export const confirmRepairByResident = async (faultId) => {
  const response = await apiClient.post(`/faults/${faultId}/confirm-resident`);
  return response.data;
};

export const repairAllFaults = async () => {
  const response = await apiClient.post('/faults/repair-all');
  return response.data;
};

export const uploadFaultPhoto = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post('/faults/upload-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Maintenance & Work Order Services
export const getAssignments = async () => {
  const response = await apiClient.get('/maintenance/assignments');
  return response.data;
};

export const assignTechnician = async (data) => {
  const response = await apiClient.post('/maintenance/assignments', data);
  return response.data;
};

export const updateAssignmentProgress = async (id, status) => {
  const response = await apiClient.put(`/maintenance/assignments/${id}/progress`, { status });
  return response.data;
};

export const getSchedules = async () => {
  const response = await apiClient.get('/maintenance/schedules');
  return response.data;
};

export const createSchedule = async (data) => {
  const response = await apiClient.post('/maintenance/schedules', data);
  return response.data;
};

// Repair Evidence & Verification
export const submitRepairEvidence = async (data) => {
  const response = await apiClient.post('/evidence', data);
  return response.data;
};

export const verifyRepair = async (evidenceId, approved, verificationNotes) => {
  const response = await apiClient.post(`/evidence/${evidenceId}/verify`, {
    approved,
    verification_notes: verificationNotes,
  });
  return response.data;
};

export const getFaultEvidence = async (faultId) => {
  const response = await apiClient.get(`/evidence/fault/${faultId}`);
  return response.data;
};

// Analytics
export const getAnalytics = async () => {
  const response = await apiClient.get('/analytics/dashboard');
  return response.data;
};

// Notifications
export const getNotifications = async () => {
  const response = await apiClient.get('/notifications');
  return response.data;
};

export const markNotificationRead = async (id) => {
  const response = await apiClient.put(`/notifications/${id}/read`);
  return response.data;
};

// MongoDB Status
export const getMongoDbStatus = async () => {
  try {
    const response = await apiClient.get('/auth/mongodb-status');
    return response.data;
  } catch (error) {
    return { connected: false, total_users_stored: 0 };
  }
};

export const api = apiClient;
export default apiClient;
