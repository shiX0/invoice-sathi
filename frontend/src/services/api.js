import axios from 'axios';
import { toast } from 'react-hot-toast';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
    const user = localStorage.getItem('user');
    if (user) {
        const { token } = JSON.parse(user);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Add response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
            localStorage.removeItem('user');
            window.location.href = '/login';
        }

        // Handle rate limit errors
        if (error.response?.status === 429) {
            const message = error.response?.data?.message || 'Too many requests. Please try again later.';
            // You might want to show a more prominent notification for rate limits
            toast.error(message, {
                duration: 5000, // Show for 5 seconds
                icon: '🚫'
            });
        }

        return Promise.reject(error);
    }
);

// Auth methods without React Query
export const authAPI = {
    login: async (credentials) => {
        const response = await api.post('/users/login', credentials);
        if (response.data?.data?.user) {
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        return response;
    },
    register: (userData) => api.post('/users/register', userData),
    getProfile: async () => {
        try {
            const response = await api.get('/users/profile');
            // Update local storage with fresh data
            if (response.data?.data?.user) {
                localStorage.setItem('user', JSON.stringify(response.data.data.user));
            }
            return response.data;
        } catch (error) {
            // If the request fails, try to return data from local storage
            const userStr = localStorage.getItem('user');
            if (userStr) {
                return { data: { user: JSON.parse(userStr) } };
            }
            throw error;
        }
    },
    updateProfile: async (data) => {
        const response = await api.put('/users/profile', data);
        // Update local storage with new data
        if (response.data?.data?.user) {
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        return response.data;
    },
    logout: async () => {
        try {
            await api.post('/users/logout');
        } finally {
            // Clear local storage
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
    }
};

// Keep other API methods for use with React Query
export const productsAPI = {
    getAll: async () => {
        try {
            const response = await api.get('/products');
            console.log('Products API response:', response); // For debugging
            return response;
        } catch (error) {
            console.error('Products API error:', error);
            throw error;
        }
    },
    getOne: (id) => api.get(`/products/${id}`),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
};

export const customersAPI = {
    getAll: () => api.get('/customers'),
    getOne: (id) => api.get(`/customers/${id}`),
    create: (data) => api.post('/customers', data),
    update: (id, data) => api.put(`/customers/${id}`, data),
    delete: (id) => api.delete(`/customers/${id}`),
};

export const invoicesAPI = {
    getAll: () => api.get('/invoices'),
    getOne: (id) => api.get(`/invoices/${id}`),
    create: async (data) => {
        try {
            const response = await api.post('/invoices', data);
            console.log('Invoice creation response:', response); // For debugging
            return response;
        } catch (error) {
            console.error('Invoice creation error:', error);
            throw error;
        }
    },
    update: (id, data) => api.patch(`/invoices/${id}`, data),
    delete: (id) => api.delete(`/invoices/${id}`),
    updatePaymentStatus: (id, status) => api.patch(`/invoices/${id}/payment-status`, { status }),
};

export default api;