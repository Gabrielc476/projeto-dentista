'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/lib/api';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    username: string | null;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [username, setUsername] = useState<string | null>(null);

    const checkAuth = async () => {
        try {
            const result = await api.checkAuth();
            setIsAuthenticated(result.authenticated);
            setUsername(result.username || null);
        } catch {
            setIsAuthenticated(false);
            setUsername(null);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await api.logout();
        } finally {
            setIsAuthenticated(false);
            setUsername(null);
            window.location.href = '/login';
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, username, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
