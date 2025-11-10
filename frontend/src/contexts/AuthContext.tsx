import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Admin } from '../types';

interface AuthContextType {
  admin: Admin | null;
  isAuthenticated: boolean;
  login: (admin: Admin, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedAdmin = localStorage.getItem('admin');
    const accessToken = localStorage.getItem('access_token');

    if (storedAdmin && accessToken) {
      try {
        setAdmin(JSON.parse(storedAdmin));
      } catch (error) {
        // Handle corrupted localStorage data
        console.error('Failed to parse stored admin data:', error);
        localStorage.removeItem('admin');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    }

    setLoading(false);
  }, []);

  const login = (
    adminData: Admin,
    accessToken: string,
    refreshToken: string
  ) => {
    setAdmin(adminData);
    localStorage.setItem('admin', JSON.stringify(adminData));
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem('admin');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
