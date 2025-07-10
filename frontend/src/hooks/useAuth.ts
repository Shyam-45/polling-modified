import { useState, useEffect } from 'react';
import { Admin, User } from '../types';
import { apiService } from '../services/api';

export const useAuth = () => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAdmin = localStorage.getItem('admin');
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedAdmin && token) {
      setAdmin(JSON.parse(storedAdmin));
    } else if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, []);

  const adminLogin = async (userId: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.adminLogin(userId, password);
      setAdmin(response.admin);
      return true;
    } catch (error) {
      console.error('Admin login failed:', error);
      return false;
    }
  };

  const bloLogin = async (userId: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.bloLogin(userId, password);
      setUser(response.user);
      return true;
    } catch (error) {
      console.error('BLO login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      if (admin) {
        await apiService.adminLogout();
        setAdmin(null);
      } else if (user) {
        await apiService.bloLogout();
        setUser(null);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return { 
    admin, 
    user, 
    loading, 
    adminLogin, 
    bloLogin, 
    logout 
  };
};