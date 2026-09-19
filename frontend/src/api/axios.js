import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const diaryPassword = sessionStorage.getItem('diaryPassword');
  if (diaryPassword) {
    config.headers['x-diary-password'] = diaryPassword;
  }
  return config;
});

export default api;
