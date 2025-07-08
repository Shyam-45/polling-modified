import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import LocationUpdate from '../models/LocationUpdate.js';
import connectDB from '../config/database.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Employee.deleteMany({}),
      LocationUpdate.deleteMany({})
    ]);

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
      isStaff: true,
      isSuperuser: true
    });

    // Create employee users
    console.log('👥 Creating employee users...');
    const employeeUsers = await User.create([
      {
        username: 'rajesh.kumar',
        email: 'rajesh@example.com',
        password: 'password123',
        firstName: 'Rajesh',
        lastName: 'Kumar',
        mobileNumber: '9876543210',
        role: 'employee'
      },
      {
        username: 'priya.sharma',
        email: 'priya@example.com',
        password: 'password123',
        firstName: 'Priya',
        lastName: 'Sharma',
        mobileNumber: '9876543211',
        role: 'employee'
      },
      {
        username: 'mohammed.ali',
        email: 'mohammed@example.com',
        password: 'password123',
        firstName: 'Mohammed',
        lastName: 'Ali',
        mobileNumber: '9876543212',
        role: 'employee'
      },
      {
        username: 'sunita.gupta',
        email: 'sunita@example.com',
        password: 'password123',
        firstName: 'Sunita',
        lastName: 'Gupta',
        mobileNumber: '9876543213',
        role: 'employee'
      },
      {
        username: 'amit.patel',
        email: 'amit@example.com',
        password: 'password123',
        firstName: 'Amit',
        lastName: 'Patel',
        mobileNumber: '9876543214',
        role: 'employee'
      }
    ]);

    // Create employees
    console.log('🏢 Creating employees...');
    const employees = await Employee.create([
      {
        name: 'Rajesh Kumar',
        designation: 'Polling Officer',
        mobileNumber: '9876543210',
        officeName: 'District Collector Office',
        officePlace: 'Central Delhi',
        boothNumber: 'B001',
        boothName: 'Primary School ABC',
        buildingName: 'Government Primary School',
        boothDuration: '7 AM - 7 PM',
        wardNumber: 'W001',
        wardName: 'Ward 1',
        user: employeeUsers[0]._id
      },
      {
        name: 'Priya Sharma',
        designation: 'Assistant Polling Officer',
        mobileNumber: '9876543211',
        officeName: 'Municipal Corporation',
        officePlace: 'South Delhi',
        boothNumber: 'B002',
        boothName: 'Community Hall XYZ',
        buildingName: 'Community Center',
        boothDuration: '7 AM - 7 PM',
        wardNumber: 'W002',
        wardName: 'Ward 2',
        user: employeeUsers[1]._id
      },
      {
        name: 'Mohammed Ali',
        designation: 'Security Officer',
        mobileNumber: '9876543212',
        officeName: 'Police Station',
        officePlace: 'North Delhi',
        boothNumber: 'B003',
        boothName: 'High School DEF',
        buildingName: 'Government High School',
        boothDuration: '6 AM - 8 PM',
        wardNumber: 'W001',
        wardName: 'Ward 1',
        user: employeeUsers[2]._id
      },
      {
        name: 'Sunita Gupta',
        designation: 'Polling Officer',
        mobileNumber: '9876543213',
        officeName: 'District Collector Office',
        officePlace: 'West Delhi',
        boothNumber: 'B004',
        boothName: 'Library Building',
        buildingName: 'Public Library',
        boothDuration: '7 AM - 7 PM',
        wardNumber: 'W003',
        wardName: 'Ward 3',
        user: employeeUsers[3]._id
      },
      {
        name: 'Amit Patel',
        designation: 'Technical Officer',
        mobileNumber: '9876543214',
        officeName: 'IT Department',
        officePlace: 'East Delhi',
        boothNumber: 'B005',
        boothName: 'College Auditorium',
        buildingName: 'Government College',
        boothDuration: '6 AM - 8 PM',
        wardNumber: 'W002',
        wardName: 'Ward 2',
        user: employeeUsers[4]._id
      }
    ]);

    // Create additional employees without user accounts
    console.log('👤 Creating additional employees...');
    const additionalEmployees = [];
    for (let i = 6; i <= 20; i++) {
      const empData = {
        name: `Employee ${i}`,
        designation: ['Polling Officer', 'Assistant Polling Officer', 'Security Officer', 'Technical Officer'][i % 4],
        mobileNumber: `987654${i.toString().padStart(4, '0')}`,
        officeName: ['District Collector Office', 'Municipal Corporation', 'Police Station', 'IT Department'][i % 4],
        officePlace: ['Central Delhi', 'South Delhi', 'North Delhi', 'East Delhi', 'West Delhi'][i % 5],
        boothNumber: `B${i.toString().padStart(3, '0')}`,
        boothName: `Booth ${i}`,
        buildingName: `Building ${i}`,
        boothDuration: '7 AM - 7 PM',
        wardNumber: `W${(i % 5) + 1}`.padStart(4, '00'),
        wardName: `Ward ${(i % 5) + 1}`
      };
      additionalEmployees.push(empData);
    }
    
    await Employee.create(additionalEmployees);

    // Create sample location updates
    console.log('📍 Creating sample location updates...');
    const locationUpdates = [];
    const baseDate = new Date();
    baseDate.setHours(9, 0, 0, 0); // Start at 9 AM

    for (let i = 0; i < employees.length; i++) {
      const employee = employees[i];
      
      // Create 3-5 location updates for each employee
      const updateCount = 3 + Math.floor(Math.random() * 3);
      
      for (let j = 1; j <= updateCount; j++) {
        const updateTime = new Date(baseDate);
        updateTime.setMinutes(baseDate.getMinutes() + (j * 30)); // 30 minutes apart
        
        locationUpdates.push({
          employee: employee._id,
          serialNumber: j,
          latitude: 28.6139 + (Math.random() - 0.5) * 0.02, // Random location around Delhi
          longitude: 77.2090 + (Math.random() - 0.5) * 0.02,
          placeName: `${employee.boothName}, ${employee.officePlace}`,
          imageUrl: j % 2 === 0 ? 'https://images.pexels.com/photos/8923962/pexels-photo-8923962.jpeg?auto=compress&cs=tinysrgb&w=400' : '',
          createdAt: updateTime
        });
      }
    }

    await LocationUpdate.create(locationUpdates);

    console.log('✅ Sample data created successfully!');
    console.log(`👤 Created ${employeeUsers.length + 1} users (including admin)`);
    console.log(`🏢 Created ${employees.length + additionalEmployees.length} employees`);
    console.log(`📍 Created ${locationUpdates.length} location updates`);
    console.log('\n🔑 Login credentials:');
    console.log('Admin: username=admin, password=admin123');
    console.log('Employee: username=rajesh.kumar, password=password123');
    console.log('Mobile Login: 9876543210 (Rajesh Kumar)');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    process.exit();
  }
};

seedData();