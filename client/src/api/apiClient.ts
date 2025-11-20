import axios from 'axios';
import { authStorage } from '@/utils/auth';

/**
 * Centralized Axios instance for API calls
 * Includes interceptors for error handling and authentication
 */
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for session-based auth
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add JWT token to headers if available
    const token = authStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;

      if (status === 401) {
        // Unauthorized - redirect to login or handle auth failure
        // You can emit an event or dispatch a Redux action here
        console.error('Unauthorized access - please login');
      } else if (status === 403) {
        console.error('Forbidden - you do not have permission');
      } else if (status === 404) {
        console.error('Resource not found');
      } else if (status >= 500) {
        console.error('Server error - please try again later');
      }

      // Return the error message from the server if available
      return Promise.reject(data?.message || error.message);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response from server');
      return Promise.reject('Network error - please check your connection');
    } else {
      // Something happened in setting up the request
      console.error('Request error:', error.message);
      return Promise.reject(error.message);
    }
  }
);

export default apiClient;
