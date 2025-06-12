// src/axiosConfig.js
import axios from 'axios';

// --- IMPORTANT: Hardcoded Backend URL ---
// This is for direct testing. In a production environment, it's highly recommended
// to use environment variables (as commented out below).
const API_BASE_URL = 'https://vercelfull.onrender.com'; // <--- YOUR ACTUAL RENDER BACKEND URL HERE (NO TRAILING /api)

// For local development fallback if needed, but not used when hardcoded as above:
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5004';

// --- axios client setup ---
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`, // This correctly appends /api to your base URL
  withCredentials: true, // This is CRUCIAL for sending HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Axios Interceptor for Token Refresh ---
apiClient.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is 401 Unauthorized and if the request hasn't been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark the original request as retried

      try {
        // Attempt to refresh the token using the refresh token endpoint
        // Use the 'apiClient' instance itself, which has withCredentials: true configured
        const refreshResponse = await apiClient.post('/auth/refreshToken', {}); // Relative path works with baseURL

        // If refresh is successful, the backend would have set new access/refresh tokens in cookies.
        // Re-run the original failed request with the new tokens (browser automatically sends them).
        return apiClient(originalRequest);

      } catch (refreshError) {
        // If refresh token fails (e.g., token invalid/expired, network issue, server error),
        // log the error and redirect the user to the login page.
        console.error('Refresh token failed:', refreshError.response?.data?.msg || refreshError.message);
        localStorage.removeItem('user'); // Clear any cached user data

        // Determine the redirect path based on a stored user role or current path
        const currentUserRole = localStorage.getItem('userRole'); // Assuming you store the user's role
        let redirectPath = '/student-login'; // Default to student login

        if (currentUserRole === 'trainer' || window.location.pathname.startsWith('/trainer')) {
          redirectPath = '/trainer-login';
        }
        window.location.href = redirectPath; // Redirect to the appropriate login page

        return Promise.reject(refreshError); // Propagate the error
      }
    }
    // For other errors, or if it's a 401 that has already been retried,
    // or if the refresh failed, simply reject the promise.
    return Promise.reject(error);
  }
);

export default apiClient;
