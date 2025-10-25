import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const authClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
authClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
authClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token } = response.data;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return authClient(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth APIs
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password,
    });
    return response.data;
  },

  logout: async () => {
    try {
      await authClient.post('/auth/logout');
    } catch (error) {
      // Ignore logout errors, just clear local storage
      console.error('Logout error:', error);
    }
    localStorage.clear();
  },

  validateToken: async (userId: string, organizationId: string) => {
    const response = await authClient.post('/auth/validate', {
      user_id: userId,
      organization_id: organizationId,
    });
    return response.data;
  },
};

// User APIs
export const userApi = {
  createUser: async (userData: any) => {
    const response = await authClient.post('/admin/users', userData);
    return response.data;
  },

  listUsers: async (organizationId?: string) => {
    const params = organizationId ? { organization_id: organizationId } : {};
    const response = await authClient.get('/admin/users', { params });
    return response.data;
  },

  updateUser: async (userId: string, userData: any) => {
    const response = await authClient.patch(`/admin/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId: string) => {
    await authClient.delete(`/admin/users/${userId}`);
  },
};

// Organization APIs
export const organizationApi = {
  createOrganization: async (orgData: any) => {
    const response = await authClient.post('/admin/organizations', orgData);
    return response.data;
  },

  listOrganizations: async () => {
    const response = await authClient.get('/admin/organizations');
    return response.data;
  },

  updateOrganization: async (orgId: string, orgData: any) => {
    const response = await authClient.patch(`/admin/organizations/${orgId}`, orgData);
    return response.data;
  },
};

// License APIs
export const licenseApi = {
  getStatus: async () => {
    const response = await authClient.get('/license/status');
    return response.data;
  },

  checkOrganization: async (organizationId: string) => {
    const response = await authClient.get(`/license/check/${organizationId}`);
    return response.data;
  },
};
