import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '@/api/authClient';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  organization_id: string;
  organization_name: string;
  permissions: string[];
}

interface License {
  type: string;
  expires_at: string;
  features: string[];
  is_valid: boolean;
}

interface AuthContextType {
  user: User | null;
  license: License | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [license, setLicense] = useState<License | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    const storedLicense = localStorage.getItem('license');
    
    if (storedUser && storedLicense) {
      setUser(JSON.parse(storedUser));
      setLicense(JSON.parse(storedLicense));
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      
      // Store tokens
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('license', JSON.stringify(response.license));
      
      setUser(response.user);
      setLicense(response.license);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    setLicense(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        license,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
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
