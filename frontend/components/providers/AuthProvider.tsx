'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'ops' | 'customer' | 'partner';
    kyc_status: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: Record<string, unknown>) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function checkAuth() {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await api.get('/auth/me');
                if (response.data.data && !response.data.error) {
                    setUser(response.data.data);
                } else {
                    localStorage.removeItem('auth_token');
                }
            } catch {
                localStorage.removeItem('auth_token');
            } finally {
                setLoading(false);
            }
        }

        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.data.data && !response.data.error) {
                const { user, token } = response.data.data;
                localStorage.setItem('auth_token', token);
                setUser(user);

                // Redirect based on role
                if (user.role === 'admin' || user.role === 'ops') router.push('/ops/dashboard');
                else if (user.role === 'partner') router.push('/partner/dashboard');
                else router.push('/customer/dashboard');
            } else {
                throw new Error(response.data.error?.message || 'Login failed');
            }
        } catch (error: any) {
            const message = error.response?.data?.message || error.response?.data?.error?.message || error.message || 'Login failed';
            throw new Error(message);
        }
    };

    const register = async (data: Record<string, unknown>) => {
        try {
            const response = await api.post('/auth/register', data);
            if (response.data.data && !response.data.error) {
                const { user, token } = response.data.data;
                localStorage.setItem('auth_token', token);
                setUser(user);
            } else {
                throw new Error(response.data.error?.message || 'Registration failed');
            }
        } catch (error: any) {
            const message = error.response?.data?.message || error.response?.data?.error?.message || error.message || 'Registration failed';
            throw new Error(message);
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            localStorage.removeItem('auth_token');
            setUser(null);
            router.push('/login');
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
