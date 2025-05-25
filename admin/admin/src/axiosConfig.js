// src/axiosConfig.js
import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:5004/api', // Set a base URL
    withCredentials: true, // IMPORTANT: Automatically send cookies
});

// Request Interceptor (optional, for logging or modifying requests)
apiClient.interceptors.request.use(
    (config) => {
        // You could log requests here, or add other headers if needed
        // console.log('Outgoing request:', config);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor for handling 401s and token refresh
apiClient.interceptors.response.use(
    (response) => response, // If response is successful, just return it
    async (error) => {
        const originalRequest = error.config;

        // If the error is 401 Unauthorized and it's not the refresh token request itself
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Mark this request as retried

            try {
                // Attempt to get a new access token using the refresh token
                const refreshResponse = await axios.post('http://localhost:5004/api/auth/refresh-token', {}, { withCredentials: true });

                // If refresh is successful, retry the original request
                // The new access token cookie will be automatically attached by the browser
                return apiClient(originalRequest); // Use apiClient to ensure interceptors are reapplied
            } catch (refreshError) {
                console.error('Refresh token failed. Redirecting to login...', refreshError);
                // If refresh fails, log out the user and redirect to login
                localStorage.removeItem('user'); // Clear any stored user info
                window.location.href = '/admin-login'; // Redirect
                return Promise.reject(refreshError); // Reject with the refresh error
            }
        }

        // For other errors or if the original request was already retried
        return Promise.reject(error);
    }
);

export default apiClient;