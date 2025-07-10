import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/Admin.js';
import BLO from '../models/BLO.js';
import TestUser from '../models/TestUser.js';
import LocationData from '../models/LocationData.js';
import connectDB from '../config/database.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      Admin.deleteMany({}),
      BLO.deleteMany({}),
      TestUser.deleteMany({}),
      LocationData.deleteMany({})
    ]);

    // Create admin users
    console.log('👤 Creating admin users...');
    const admins = await Admin.create([
      {
        name: 'System Administrator',
        userId: 'admin',
        password: 'admin123'
      },
      {
        name: 'John Doe',
        userId: 'john.admin',
        password: 'password123'
      }
    ]);

    // Create test users (5 fake users for testing)
    console.log('👥 Creating test users...');
    const testUsers = await TestUser.create([
      {
        name: 'Test User 1',
        designation: 'Block Level Officer',
        officerType: 'BLO',
        mobile: '9876543210',
        boothNumber: 'TB001',
        boothName: 'Test Booth 1 - Primary School',
        userId: 'test001',
        password: 'test123'
      },
      {
        name: 'Test User 2',
        designation: 'Assistant BLO',
        officerType: 'ABLO',
        mobile: '9876543211',
        boothNumber: 'TB002',
        boothName: 'Test Booth 2 - Community Center',
        userId: 'test002',
        password: 'test123'
      },
      {
        name: 'Test User 3',
        designation: 'Senior BLO',
        officerType: 'SBLO',
        mobile: '9876543212',
        boothNumber: 'TB003',
        boothName: 'Test Booth 3 - Government Office',
        userId: 'test003',
        password: 'test123'
      },
      {
        name: 'Test User 4',
        designation: 'Block Level Officer',
        officerType: 'BLO',
        mobile: '9876543213',
        boothNumber: 'TB004',
        boothName: 'Test Booth 4 - High School',
        userId: 'test004',
        password: 'test123'
      },
      {
        name: 'Test User 5',
        designation: 'Junior BLO',
        officerType: 'JBLO',
        mobile: '9876543214',
        boothNumber: 'TB005',
        boothName: 'Test Booth 5 - Municipal Hall',
        userId: 'test005',
        password: 'test123'
      }
    ]);

    // Create some BLO users (for production use)
    console.log('🏢 Creating BLO users...');
    const blos = await BLO.create([
      {
        name: 'Rajesh Kumar',
        designation: 'Block Level Officer',
        officerType: 'BLO',
        mobile: '9876543220',
        boothNumber: 'BLO001',
        boothName: 'Primary School ABC',
        userId: 'rajesh.blo',
        password: 'rajesh123'
      },
      {
        name: 'Priya Sharma',
        designation: 'Senior BLO',
        officerType: 'SBLO',
        mobile: '9876543221',
        boothNumber: 'BLO002',
        boothName: 'Community Hall XYZ',
        userId: 'priya.blo',
        password: 'priya123'
      },
      {
        name: 'Mohammed Ali',
        designation: 'Assistant BLO',
        officerType: 'ABLO',
        mobile: '9876543222',
        boothNumber: 'BLO003',
        boothName: 'Government High School',
        userId: 'mohammed.blo',
        password: 'mohammed123'
      }
    ]);

    // Create sample location data for today
    console.log('📍 Creating sample location data...');
    const today = new Date();
    const locationData = [];

    // Create data for test users
    for (let i = 0; i < testUsers.length; i++) {
      const user = testUsers[i];
      const imageCount = Math.floor(Math.random() * 5); // 0-4 images
      
      // Create location-only entries
      for (let j = 0; j < 2; j++) {
        const time = new Date(today);
        time.setHours(9 + j * 2, Math.floor(Math.random() * 60), 0, 0);
        
        locationData.push({
          testUserId: user._id,
          latitude: 28.6139 + (Math.random() - 0.5) * 0.02,
          longitude: 77.2090 + (Math.random() - 0.5) * 0.02,
          type: 'location_only',
          userId: user.userId,
          date: time
        });
      }
      
      // Create detailed analysis entries with images
      for (let j = 0; j < imageCount; j++) {
        const time = new Date(today);
        time.setHours(10 + j * 2, Math.floor(Math.random() * 60), 0, 0);
        
        locationData.push({
          testUserId: user._id,
          latitude: 28.6139 + (Math.random() - 0.5) * 0.02,
          longitude: 77.2090 + (Math.random() - 0.5) * 0.02,
          imageUrl: `https://picsum.photos/400/300?random=${i * 10 + j}`,
          type: 'detailed_analysis',
          userId: user.userId,
          date: time
        });
      }
    }

    // Create data for BLO users
    for (let i = 0; i < blos.length; i++) {
      const user = blos[i];
      const imageCount = Math.floor(Math.random() * 5); // 0-4 images
      
      // Create location-only entries
      for (let j = 0; j < 3; j++) {
        const time = new Date(today);
        time.setHours(8 + j * 3, Math.floor(Math.random() * 60), 0, 0);
        
        locationData.push({
          bloId: user._id,
          latitude: 28.6139 + (Math.random() - 0.5) * 0.02,
          longitude: 77.2090 + (Math.random() - 0.5) * 0.02,
          type: 'location_only',
          userId: user.userId,
          date: time
        });
      }
      
      // Create detailed analysis entries with images
      for (let j = 0; j < imageCount; j++) {
        const time = new Date(today);
        time.setHours(11 + j * 2, Math.floor(Math.random() * 60), 0, 0);
        
        locationData.push({
          bloId: user._id,
          latitude: 28.6139 + (Math.random() - 0.5) * 0.02,
          longitude: 77.2090 + (Math.random() - 0.5) * 0.02,
          imageUrl: `https://picsum.photos/400/300?random=${(i + 10) * 10 + j}`,
          type: 'detailed_analysis',
          userId: user.userId,
          date: time
        });
      }
    }

    await LocationData.create(locationData);

    console.log('✅ Sample data created successfully!');
    console.log(`👤 Created ${admins.length} admin users`);
    console.log(`🧪 Created ${testUsers.length} test users`);
    console.log(`🏢 Created ${blos.length} BLO users`);
    console.log(`📍 Created ${locationData.length} location entries`);
    console.log('\n🔑 Login credentials:');
    console.log('Admin: userId=admin, password=admin123');
    console.log('Test User: userId=test001, password=test123');
    console.log('BLO User: userId=rajesh.blo, password=rajesh123');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    process.exit();
  }
};

seedData();