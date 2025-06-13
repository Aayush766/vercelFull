// src/axiosConfig.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://vercelfull.onrender.com/api',
  withCredentials: true, // crucial for sending cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.post(
          'https://vercelfull.onrender.com/api/auth/refreshToken',
          {},
          { withCredentials: true }
        );

        return apiClient(originalRequest); // retry the original request
      } catch (refreshError) {
        console.error('Refresh failed:', refreshError.response?.data?.msg || refreshError.message);
        localStorage.removeItem('user');

        const role = localStorage.getItem('userRole');
        let redirectPath = '/student-login';
        if (role === 'trainer' || window.location.pathname.startsWith('/trainer')) {
          redirectPath = '/trainer-login';
        }

        window.location.href = redirectPath;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
