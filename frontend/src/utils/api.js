import axios from 'axios';

const getBaseUrl = () => {
  // Replace with your backend server's IP address
  const serverIP = window.location.hostname === 'localhost' ? 'localhost' : 'localhost';
  return `http://${serverIP}:8000`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    'x-jwt-token': '35d854a97f22d7b32ddd279642f22586a62a4788ae4f9850abe342875244862a'  // Add default token
  }
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Get all projects with all fields
export const getAllProjectsWithFields = () => api.get('/api/expenses/projects/all-fields');

export default api;
