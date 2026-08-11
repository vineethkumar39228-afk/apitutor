import axios from 'axios';

// Dynamically retrieve API base URL from Vite environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create a custom Axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    // IMPORTANT: This tells Axios to send the HttpOnly refresh cookie with requests
    withCredentials: true
});

// Request Interceptor: Attach the current access token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401s and Forced Logouts
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If the error is 401 (Unauthorized) and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Attempt to refresh the token using the HttpOnly cookie
                let response;
                try {
                    response = await axios.post(
                        `${API_BASE_URL}/users/refresh`,
                        {},
                        { withCredentials: true }
                    );
                } catch (e) {
                    response = await axios.post(
                        `${API_BASE_URL}/auth/refresh`,
                        {},
                        { withCredentials: true }
                    );
                }

                // Save the shiny new access token
                const newToken = response.data.token;
                localStorage.setItem('token', newToken);

                // Update the original request's header and fire it again
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);

            } catch (refreshError) {
                // FORCED LOGOUT: The refresh token is expired or invalid
                localStorage.removeItem('token');

                // Redirect to login with a URL parameter so we can show a nice message
                window.location.href = '/login?session_expired=true';

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
