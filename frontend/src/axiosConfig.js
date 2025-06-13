// src/axiosConfig.js
import axios from 'axios';

// Create an instance of Axios
const apiClient = axios.create({
  baseURL: 'https://vercelfull.onrender.com/api',
  withCredentials: true, // crucial for cookies like accessToken and refreshToken
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for handling 401 errors
apiClient.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite retry loop
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token
        const refreshResponse = await axios.post(
          'https://vercelfull.onrender.com/api/auth/refreshToken',
          {},
          { withCredentials: true }
        );

        // Optional: If backend sends new access token in body
        const { accessToken } = refreshResponse.data || {};
        if (accessToken) {
          // If token is passed manually (not via cookie)
          apiClient.defaults.headers.Authorization = `Bearer ${accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        // Retry the original request
        return apiClient(originalRequest);

      } catch (refreshError) {
        // Log the error (only in development)
        if (process.env.NODE_ENV !== 'production') {
          console.error('Token refresh failed:', refreshError.response?.data?.msg || refreshError.message);
        }

        // Clear user data
        localStorage.removeItem('user');

        // Determine redirect based on role
        const role = localStorage.getItem('userRole');
        let redirectPath = '/student-login';
        if (role === 'trainer' || window.location.pathname.startsWith('/trainer')) {
          redirectPath = '/trainer-login';
        }

        // Redirect to login
        window.location.href = redirectPath;
        return Promise.reject(refreshError);
      }
    }

    // If error is not 401, or already retried, just reject
    return Promise.reject(error);
  }
);

export default apiClient;
