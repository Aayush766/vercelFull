// src/axiosConfig.js
import axios from 'axios';

// --- FIX 3: Use an Environment Variable for your Backend URL (Recommended) ---
// Or temporarily hardcode if you're blocked.
// For Netlify, set a variable named REACT_APP_API_BASE_URL (or similar, depending on your framework)
// in your Netlify site settings -> Build & deploy -> Environment variables.
// Its value should be the base URL of your Render backend (e.g., https://vercelfull.onrender.com).
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5004'; // Default for local dev

// --- FIX 4: Ensure baseURL correctly points to your backend ---
// This will combine your base URL with the /api prefix
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`, // This forms 'https://vercelfull.onrender.com/api'
  withCredentials: true, // This is CRUCIAL for sending HTTP-only cookies
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
        // --- FIX 5: Use apiClient instance for refresh token call ---
        // This ensures the request uses the configured baseURL and withCredentials.
        const refreshResponse = await apiClient.post('/auth/refreshToken', {}); // Use apiClient.post and relative path

        return apiClient(originalRequest);

      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError.response?.data?.msg || refreshError.message);
        localStorage.removeItem('user');

        const currentUserRole = localStorage.getItem('userRole');
        let redirectPath = '/student-login';
        if (currentUserRole === 'trainer' || window.location.pathname.startsWith('/trainer')) {
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
