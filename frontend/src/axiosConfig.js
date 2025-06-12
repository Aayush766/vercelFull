// src/axiosConfig.js
import axios from 'axios';

const apiClient = axios.create({

  baseURL: 'http://vercelfull.onrender.com/api', // Your backend API base URL
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

        // Attempt to refresh the token using the refresh token endpoint
        const refreshResponse = await axios.post('http://vercelfull.onrender.com/api/auth/refreshToken', {}, { withCredentials: true });

        // If refresh is successful, the backend would have set new access/refresh tokens in cookies
        // Re-run the original failed request
        return apiClient(originalRequest);

      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError.response?.data?.msg || refreshError.message);
        localStorage.removeItem('user'); // Clear any cached user data

        // --- MODIFICATION STARTS HERE ---
        // Determine the redirect path based on a stored user role or current path
        const currentUserRole = localStorage.getItem('userRole'); // Assuming you store the user's role
        
        let redirectPath = '/student-login'; // Default to student login

        if (currentUserRole === 'trainer' || window.location.pathname.startsWith('/trainer')) {
          redirectPath = '/trainer-login';
        }
        
        window.location.href = redirectPath; // Redirect to the appropriate login page
        // --- MODIFICATION ENDS HERE ---


        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
