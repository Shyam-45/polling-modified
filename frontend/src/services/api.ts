// Get API base URL from environment variables
const getApiBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  
  if (apiUrl) {
    console.log('🔗 Using API URL from environment:', apiUrl);
    return apiUrl;
  }
  
  if (import.meta.env.DEV) {
    console.log('🔗 Using development fallback API URL');
    return 'http://localhost:5000/api';
  }
  
  console.warn('⚠️ No API URL found in environment variables! Using production fallback.');
  return 'https://your-backend-domain.com/api';
};

const API_BASE_URL = getApiBaseUrl();
console.log('🚀 Final API Base URL:', API_BASE_URL);

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
      headers['Authorization'] = `Bearer ${this.token}`;
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

  // Admin Authentication
  async adminLogin(userId: string, password: string) {
    const response = await this.request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ userId, password }),
    });

    if (response.token) {
      this.token = response.token;
      localStorage.setItem('token', response.token);
      localStorage.setItem('admin', JSON.stringify(response.admin));
    }

    return response;
  }

  async adminLogout() {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
  }

  // BLO Authentication
  async bloLogin(userId: string, password: string) {
    const response = await this.request('/blo/login', {
      method: 'POST',
      body: JSON.stringify({ userId, password }),
    });

    if (response.token) {
      this.token = response.token;
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  }

  async bloLogout() {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Admin APIs
  async getDashboardStats() {
    return this.request('/admin/dashboard-stats');
  }

  async getAllBLOs(params?: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    imageCount?: number; 
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.imageCount !== undefined) searchParams.append('imageCount', params.imageCount.toString());
    
    const query = searchParams.toString();
    return this.request(`/admin/blos${query ? `?${query}` : ''}`);
  }

  async getBLODetails(id: string, params?: { page?: number; limit?: number; date?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.date) searchParams.append('date', params.date);
    
    const query = searchParams.toString();
    return this.request(`/admin/blo/${id}/details${query ? `?${query}` : ''}`);
  }

  // BLO APIs
  async getUserProfile() {
    return this.request('/blo/profile');
  }

  async sendLocation(latitude: number, longitude: number) {
    return this.request('/blo/send-location', {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude }),
    });
  }

  async sendDetailedAnalysis(latitude: number, longitude: number, imageUrl: string) {
    return this.request('/blo/send-analysis', {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude, imageUrl }),
    });
  }

  async getUserHistory(params?: { page?: number; limit?: number; date?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.date) searchParams.append('date', params.date);
    
    const query = searchParams.toString();
    return this.request(`/blo/history${query ? `?${query}` : ''}`);
  }

  // Helper method to upload image to external service
  async uploadImageToExternalService(imageFile: File): Promise<string> {
    try {
      // Using a placeholder service for demo
      // In production, you would use a real image hosting service
      console.log('📤 Uploading image...');
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return a placeholder image URL
      const randomId = Math.random().toString(36).substring(7);
      return `https://picsum.photos/400/300?random=${randomId}`;
    } catch (error) {
      console.error('❌ Image upload failed:', error);
      throw new Error('Failed to upload image');
    }
  }
}

export const apiService = new ApiService();