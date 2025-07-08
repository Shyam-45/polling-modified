import { useState, useEffect } from 'react';
import { User } from '../types';
import { apiService } from '../services/api';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.login(username, password);
      setUser(response.user);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const loginWithMobile = async (mobileNumber: string): Promise<boolean> => {
    try {
      const response = await apiService.loginWithMobile(mobileNumber);
      
      // If we have a user account, set it
      if (response.user) {
        setUser(response.user);
      } else if (response.employee) {
        // Create a temporary user object for mobile app access
        setUser({
          username: response.employee.mobile_number,
          role: 'employee'
        });
      }
      
      return true;
    } catch (error) {
      console.error('Mobile login failed:', error);
      return false;
    }
  };

  return { user, login, logout, loginWithMobile, loading };
};