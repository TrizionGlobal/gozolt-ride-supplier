import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api/proxy',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // If the data is FormData, remove the default Content-Type so Axios sets it automatically with the boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    // Token is managed via HTTP-only cookies through Next.js API routes
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — handle 401 and refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Only attempt token refresh for genuine 401 Unauthorized errors.
    // 4xx errors like 400 Bad Request are NOT auth issues — never auto-logout for those.
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to silently refresh the access token via our Next.js API route.
        // Must send withCredentials so the refresh token cookie is included.
        await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        // Refresh succeeded — transparently retry the original request
        return apiClient(originalRequest);
      } catch (refreshError: any) {
        // Refresh token is also expired or invalid — force logout to /login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
