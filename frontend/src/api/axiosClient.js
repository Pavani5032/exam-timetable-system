import axios from 'axios';

// When empty string, requests use relative paths (e.g. /api/...)
// which automatically route through the Vite dev proxy on any device (phone, laptop, tunnel)!
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('simats_exam_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('simats_exam_token');
      localStorage.removeItem('simats_exam_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
