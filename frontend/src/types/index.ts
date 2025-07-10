export interface Admin {
  id: string;
  name: string;
  userId: string;
}

export interface BLO {
  _id: string;
  name: string;
  designation: string;
  officerType: string;
  mobile: string;
  boothNumber: string;
  boothName: string;
  userId: string;
  password: string;
  isActive: boolean;
  todayImageCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TestUser {
  _id: string;
  name: string;
  designation: string;
  officerType: string;
  mobile: string;
  boothNumber: string;
  boothName: string;
  userId: string;
  password: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LocationData {
  _id: string;
  bloId?: string;
  testUserId?: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  type: 'location_only' | 'detailed_analysis';
  date: string;
  userId: string;
  location: string;
  formattedDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalBLOs: number;
  totalTestUsers: number;
  todayLocationUpdates: number;
  todayImageUploads: number;
  imageDistribution: {
    0: number;
    1: number;
    2: number;
    3: number;
    4: number;
  };
}

export interface User {
  id: string;
  name: string;
  userId: string;
  designation: string;
  officerType: string;
  mobile: string;
  boothNumber: string;
  boothName: string;
  userType: 'blo' | 'testUser';
  todayImageCount?: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}