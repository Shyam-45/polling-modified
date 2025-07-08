export interface Employee {
  id?: number;
  emp_id: string;
  name: string;
  designation: string;
  mobile_number: string;
  office_name: string;
  office_place: string;
  booth_number: string;
  booth_name: string;
  booth_duration: string;
  building_name: string;
  ward_number: string;
  ward_name?: string;
  // Add computed properties from backend
  employee_details?: string;
  contact_details?: string;
  office_details?: string;
  booth_details?: string;
  assignment_summary?: string;
}

export interface LocationUpdate {
  id: string;
  emp_id: string;
  serial_number: number;
  location: string;
  place_name: string;
  timestamp: string;
  image?: string;
}

export interface User {
  id?: number;
  username: string;
  role: 'admin' | 'employee';
  email?: string;
  mobile_number?: string;
  first_name?: string;
  last_name?: string;
}