import axios, { AxiosError, AxiosResponse } from 'axios';

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:8000/api` : 'http://127.0.0.1:8000/api'),
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request interceptor for Bearer token
apiClient.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Response interceptor for envelope parsing and error normalization
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        // Return only the data payload if it follows the envelope pattern
        if (response.data && response.data.data !== undefined) {
            return response.data; // Keep the envelope but we will normalize extraction in hooks
        }
        return response;
    },
    (error: AxiosError) => {
        const normalizedError = {
            message: 'An unexpected error occurred',
            errors: {} as Record<string, string[]>,
            status: error.response?.status,
        };

        if (error.response) {
            const data = error.response.data as { message?: string; error?: { message?: string }; errors?: Record<string, string[]> };
            normalizedError.message = data.message || data.error?.message || normalizedError.message;
            normalizedError.errors = data.errors || {};

            // Global 401 handling
            if (error.response.status === 401 && typeof window !== 'undefined') {
                localStorage.removeItem('auth_token');
                window.location.href = '/login';
            }
        }

        return Promise.reject(normalizedError);
    }
);

/**
 * Helper to extract data from the envelope
 */
export const extractData = <T>(response: { data: T }): T => {
    return response.data;
};

export default apiClient;
