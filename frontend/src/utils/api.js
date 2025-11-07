import axios from 'axios';

const getBaseUrl = () => {
  // Use environment variable for backend URL, fallback to empty string if not set
  return process.env.REACT_APP_API_URL;
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

// Submit new expense (with file upload)
export const submitExpense = async (expenseData, travelReceiptFile) => {
  const formData = new FormData();
  Object.entries(expenseData).forEach(([key, value]) => {
    formData.append(key, value);
  });
  if (travelReceiptFile) {
    formData.append('travelReceipt', travelReceiptFile);
  }
  // Use axios directly for multipart/form-data
  const response = await api.post('/api/expenses/submit', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  // The backend will return S3 URL in travelReceiptUrl
  return response.data;
};

export default api;
