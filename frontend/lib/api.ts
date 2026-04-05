import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}${['localhost', '127.0.0.1'].includes(window.location.hostname) || /^\d+\.\d+\.\d+\.\d+$/.test(window.location.hostname) ? ':8000' : ''}/api` : '/api'),
    // withCredentials is not needed for Bearer token auth in this context
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export default api;
