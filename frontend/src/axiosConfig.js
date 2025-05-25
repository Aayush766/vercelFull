// src/axiosConfig.js (Example)
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5004/api', // Your backend API base URL
  withCredentials: true, // This is CRUCIAL for sending HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// You would also add your interceptor logic here for refresh tokens
apiClient.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;
    // Check if the error is 401 Unauthorized and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark this request as retried
      try {
        // Attempt to refresh the token using the refresh token endpoint
        // This endpoint should also be configured to accept cookies
        const refreshResponse = await axios.post('http://localhost:5004/api/auth/refreshToken', {}, { withCredentials: true });

        // If refresh is successful, the backend would have set new access/refresh tokens in cookies
        // The original request can then be re-attempted
        return apiClient(originalRequest); // Re-run the original failed request

      } catch (refreshError) {
        // If refresh token fails or is expired, redirect to login
        console.error('Refresh token failed:', refreshError.response?.data?.msg || refreshError.message);
        localStorage.removeItem('user'); // Clear any cached user data
        window.location.href = '/login'; // Redirect to login page
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;