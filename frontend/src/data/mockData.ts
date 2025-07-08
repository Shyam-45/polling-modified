import { Employee, LocationUpdate } from '../types';

export const mockEmployees: Employee[] = [
  {
    empId: 'EMP001',
    name: 'Rajesh Kumar',
    designation: 'Polling Officer',
    mobileNumber: '9876543210',
    officeName: 'District Collector Office',
    officePlace: 'Central Delhi',
    boothNumber: 'B001',
    boothName: 'Primary School ABC',
    boothDuration: '7 AM - 7 PM',
    buildingName: 'Government Primary School',
    wardNumber: 'W001'
  },
  {
    empId: 'EMP002',
    name: 'Priya Sharma',
    designation: 'Assistant Polling Officer',
    mobileNumber: '9876543211',
    officeName: 'Municipal Corporation',
    officePlace: 'South Delhi',
    boothNumber: 'B002',
    boothName: 'Community Hall XYZ',
    boothDuration: '7 AM - 7 PM',
    buildingName: 'Community Center',
    wardNumber: 'W002'
  },
  {
    empId: 'EMP003',
    name: 'Mohammed Ali',
    designation: 'Security Officer',
    mobileNumber: '9876543212',
    officeName: 'Police Station',
    officePlace: 'North Delhi',
    boothNumber: 'B003',
    boothName: 'High School DEF',
    boothDuration: '6 AM - 8 PM',
    buildingName: 'Government High School',
    wardNumber: 'W001'
  },
  {
    empId: 'EMP004',
    name: 'Sunita Gupta',
    designation: 'Polling Officer',
    mobileNumber: '9876543213',
    officeName: 'District Collector Office',
    officePlace: 'West Delhi',
    boothNumber: 'B004',
    boothName: 'Library Building',
    boothDuration: '7 AM - 7 PM',
    buildingName: 'Public Library',
    wardNumber: 'W003'
  },
  {
    empId: 'EMP005',
    name: 'Amit Patel',
    designation: 'Technical Officer',
    mobileNumber: '9876543214',
    officeName: 'IT Department',
    officePlace: 'East Delhi',
    boothNumber: 'B005',
    boothName: 'College Auditorium',
    boothDuration: '6 AM - 8 PM',
    buildingName: 'Government College',
    wardNumber: 'W002'
  }
];

export const mockLocationUpdates: LocationUpdate[] = [
  {
    id: '1',
    empId: 'EMP001',
    serialNumber: 1,
    location: '28.6139, 77.2090',
    placeName: 'Primary School ABC, Central Delhi',
    timestamp: new Date('2024-01-15T09:00:00'),
    image: 'https://images.pexels.com/photos/8923962/pexels-photo-8923962.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '2',
    empId: 'EMP001',
    serialNumber: 2,
    location: '28.6139, 77.2090',
    placeName: 'Primary School ABC, Central Delhi',
    timestamp: new Date('2024-01-15T09:30:00')
  },
  {
    id: '3',
    empId: 'EMP001',
    serialNumber: 3,
    location: '28.6139, 77.2090',
    placeName: 'Primary School ABC, Central Delhi',
    timestamp: new Date('2024-01-15T10:00:00'),
    image: 'https://images.pexels.com/photos/8923964/pexels-photo-8923964.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '4',
    empId: 'EMP001',
    serialNumber: 4,
    location: '28.6139, 77.2090',
    placeName: 'Primary School ABC, Central Delhi',
    timestamp: new Date('2024-01-15T10:30:00')
  }
];

export const wardNumbers = ['W001', 'W002', 'W003', 'W004', 'W005'];