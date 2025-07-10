import Admin from '../models/Admin.js';
import BLO from '../models/BLO.js';
import TestUser from '../models/TestUser.js';
import LocationData from '../models/LocationData.js';
import { generateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
export const adminLogin = asyncHandler(async (req, res) => {
  const { userId, password } = req.body;

  const admin = await Admin.findOne({ userId });

  if (!admin) {
    return res.status(401).json({
      error: 'Invalid credentials'
    });
  }

  // Direct password comparison (no encryption as requested)
  if (admin.password !== password) {
    return res.status(401).json({
      error: 'Invalid credentials'
    });
  }

  if (!admin.isActive) {
    return res.status(401).json({
      error: 'Admin account is disabled'
    });
  }

  // Generate token
  const token = generateToken(admin._id, 'admin');

  // Update last login
  await admin.updateLastLogin();

  res.json({
    success: true,
    token,
    admin: {
      id: admin._id,
      name: admin.name,
      userId: admin.userId
    },
    message: 'Admin login successful'
  });
});

// @desc    Get all BLOs with image count for today
// @route   GET /api/admin/blos
// @access  Private (Admin)
export const getAllBLOs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const search = req.query.search;
  const imageCount = req.query.imageCount;

  // Build query for BLO search
  let bloQuery = {};
  if (search) {
    bloQuery.$or = [
      { name: { $regex: search, $options: 'i' } },
      { userId: { $regex: search, $options: 'i' } },
      { boothNumber: { $regex: search, $options: 'i' } }
    ];
  }

  // Get today's date
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  // Get BLOs with pagination
  const blos = await BLO.find(bloQuery)
    .sort({ name: 1 })
    .skip(skip)
    .limit(limit);

  // Get today's image counts for each BLO
  const bloIds = blos.map(blo => blo._id);
  const imageCounts = await LocationData.aggregate([
    {
      $match: {
        bloId: { $in: bloIds },
        date: { $gte: startOfDay, $lt: endOfDay },
        type: 'detailed_analysis'
      }
    },
    {
      $group: {
        _id: '$bloId',
        imageCount: { $sum: 1 }
      }
    }
  ]);

  // Create a map for quick lookup
  const imageCountMap = {};
  imageCounts.forEach(item => {
    imageCountMap[item._id.toString()] = item.imageCount;
  });

  // Combine BLO data with image counts
  let bloData = blos.map(blo => ({
    ...blo.toObject(),
    todayImageCount: imageCountMap[blo._id.toString()] || 0
  }));

  // Filter by image count if specified
  if (imageCount !== undefined) {
    const targetCount = parseInt(imageCount);
    bloData = bloData.filter(blo => blo.todayImageCount === targetCount);
  }

  // Get total count for pagination
  const total = await BLO.countDocuments(bloQuery);

  res.json({
    success: true,
    data: bloData,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard-stats
// @access  Private (Admin)
export const getDashboardStats = asyncHandler(async (req, res) => {
  // Get today's date
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const [
    totalBLOs,
    totalTestUsers,
    todayLocationUpdates,
    todayImageUploads,
    imageCountDistribution
  ] = await Promise.all([
    BLO.countDocuments({ isActive: true }),
    TestUser.countDocuments({ isActive: true }),
    LocationData.countDocuments({
      date: { $gte: startOfDay, $lt: endOfDay }
    }),
    LocationData.countDocuments({
      date: { $gte: startOfDay, $lt: endOfDay },
      type: 'detailed_analysis'
    }),
    LocationData.aggregate([
      {
        $match: {
          date: { $gte: startOfDay, $lt: endOfDay },
          type: 'detailed_analysis'
        }
      },
      {
        $group: {
          _id: '$userId',
          imageCount: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$imageCount',
          userCount: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ])
  ]);

  // Format image count distribution
  const imageDistribution = {
    0: 0, 1: 0, 2: 0, 3: 0, 4: 0
  };
  
  imageCountDistribution.forEach(item => {
    if (item._id <= 4) {
      imageDistribution[item._id] = item.userCount;
    }
  });

  // Calculate users with 0 images
  const usersWithImages = imageCountDistribution.reduce((sum, item) => sum + item.userCount, 0);
  imageDistribution[0] = totalBLOs + totalTestUsers - usersWithImages;

  res.json({
    success: true,
    data: {
      totalBLOs,
      totalTestUsers,
      todayLocationUpdates,
      todayImageUploads,
      imageDistribution
    }
  });
});

// @desc    Get BLO details with location history
// @route   GET /api/admin/blo/:id/details
// @access  Private (Admin)
export const getBLODetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const date = req.query.date;

  // Find BLO
  const blo = await BLO.findById(id);
  if (!blo) {
    return res.status(404).json({
      error: 'BLO not found'
    });
  }

  // Build query for location data
  let locationQuery = { bloId: id };
  
  if (date) {
    const searchDate = new Date(date);
    const startOfDay = new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    
    locationQuery.date = { $gte: startOfDay, $lt: endOfDay };
  }

  // Get location data with pagination
  const locationData = await LocationData.find(locationQuery)
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit);

  // Get total count for pagination
  const total = await LocationData.countDocuments(locationQuery);

  res.json({
    success: true,
    blo: blo,
    locationData: locationData,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});