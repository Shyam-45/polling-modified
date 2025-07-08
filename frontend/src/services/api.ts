// Get API base URL from environment variables
const getApiBaseUrl = () => {
  // Check for environment variable first
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  
  if (apiUrl) {
    console.log('🔗 Using API URL from environment:', apiUrl);
    return apiUrl;
  }
  
  // Check if we're in development
  if (import.meta.env.DEV) {
    console.log('🔗 Using development fallback API URL');
    return 'http://localhost:5000/api';
  }
  
  // Production fallback - use your actual backend URL
  console.warn('⚠️ No API URL found in environment variables! Using production fallback.');
  return 'https://your-backend-domain.com/api';
};

const API_BASE_URL = getApiBaseUrl();
console.log('🚀 Final API Base URL:', API_BASE_URL);
console.log('🔍 Environment check:', {
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE,
  apiUrl: import.meta.env.VITE_API_BASE_URL
});

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Token ${this.token}`;
    }

    return headers;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      console.log(`🔗 API Request: ${config.method || 'GET'} ${url}`);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(username: string, password: string) {
    const response = await this.request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (response.token) {
      this.token = response.token;
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  }

  async loginWithMobile(mobile_number: string) {
    const response = await this.request('/auth/mobile-login/', {
      method: 'POST',
      body: JSON.stringify({ mobile_number }),
    });

    if (response.token) {
      this.token = response.token;
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    // Store employee data for mobile app
    if (response.employee) {
      localStorage.setItem('employee', JSON.stringify(response.employee));
    }

    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout/', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('employee');
    }
  }

  async getUserProfile() {
    return this.request('/auth/profile/');
  }

  // Employees
  async getEmployees(params?: { search?: string; ward?: string; page?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.ward) searchParams.append('ward', params.ward);
    if (params?.page) searchParams.append('page', params.page.toString());
    
    const query = searchParams.toString();
    return this.request(`/employees/${query ? `?${query}` : ''}`);
  }

  async getEmployee(empId: string) {
    return this.request(`/employees/${empId}/`);
  }

  async getEmployeeByMobile(mobileNumber: string) {
    return this.request(`/employees/mobile/${mobileNumber}/`);
  }

  async getLocationUpdates(empId: string, date?: string) {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    
    const query = params.toString();
    return this.request(`/location-updates/employee/${empId}${query ? `?${query}` : ''}`);
  }

  // Updated to use image URLs instead of file uploads
  async createLocationUpdate(data: {
    latitude: number;
    longitude: number;
    place_name: string;
    image_url?: string; // Changed from File to string URL
  }) {
    return this.request('/location-updates/create', {
      method: 'POST',
      body: JSON.stringify({
        latitude: data.latitude,
        longitude: data.longitude,
        place_name: data.place_name,
        image_url: data.image_url || '', // Optional image URL
      }),
    });
  }

  // Helper method to upload image to external service (like ImgBB)
  async uploadImageToExternalService(imageFile: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    try {
      // Using ImgBB API (free service)
      const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
      
      if (!apiKey) {
        console.warn('⚠️ ImgBB API key not found, using placeholder image');
        return 'https://via.placeholder.com/400x300?text=Demo+Image';
      }
      
      console.log('📤 Uploading image to ImgBB...');
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Image uploaded successfully:', result.data.url);
        return result.data.url; // Return the image URL
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      console.error('❌ Image upload failed:', error);
      // Fallback: return a placeholder image URL
      return 'https://via.placeholder.com/400x300?text=Image+Upload+Failed';
    }
  }

  // Wards
  async getWards() {
    return this.request('/employees/wards/');
  }

  // Dashboard stats
  async getDashboardStats() {
    return this.request('/employees/stats/dashboard/');
  }
}

export const apiService = new ApiService();