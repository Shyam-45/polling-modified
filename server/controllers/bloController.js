import BLO from '../models/BLO.js';
import TestUser from '../models/TestUser.js';
import LocationData from '../models/LocationData.js';
import { generateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    BLO login
// @route   POST /api/blo/login
// @access  Public
export const bloLogin = asyncHandler(async (req, res) => {
  const { userId, password } = req.body;

  // Try to find in TestUser first, then BLO
  let user = await TestUser.findOne({ userId });
  let userType = 'testUser';
  
  if (!user) {
    user = await BLO.findOne({ userId });
    userType = 'blo';
  }

  if (!user) {
    return res.status(401).json({
      error: 'Invalid credentials'
    });
  }

  // Direct password comparison (no encryption as requested)
  if (user.password !== password) {
    return res.status(401).json({
      error: 'Invalid credentials'
    });
  }

  if (!user.isActive) {
    return res.status(401).json({
      error: 'User account is disabled'
    });
  }

  // Generate token
  const token = generateToken(user._id, 'blo');

  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      userId: user.userId,
      designation: user.designation,
      officerType: user.officerType,
      mobile: user.mobile,
      boothNumber: user.boothNumber,
      boothName: user.boothName,
      userType: userType
    },
    message: 'Login successful'
  });
});

// @desc    Get user profile
// @route   GET /api/blo/profile
// @access  Private (BLO)
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  const userType = req.userType;

  // Get today's image count
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const todayImageCount = await LocationData.countDocuments({
    [userType === 'testUser' ? 'testUserId' : 'bloId']: user._id,
    date: { $gte: startOfDay, $lt: endOfDay },
    type: 'detailed_analysis'
  });

  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      userId: user.userId,
      designation: user.designation,
      officerType: user.officerType,
      mobile: user.mobile,
      boothNumber: user.boothNumber,
      boothName: user.boothName,
      userType: userType,
      todayImageCount: todayImageCount
    }
  });
});

// @desc    Send location only
// @route   POST /api/blo/send-location
// @access  Private (BLO)
export const sendLocation = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;
  const user = req.user;
  const userType = req.userType;

  const locationData = await LocationData.create({
    [userType === 'testUser' ? 'testUserId' : 'bloId']: user._id,
    latitude,
    longitude,
    type: 'location_only',
    userId: user.userId
  });

  res.status(201).json({
    success: true,
    data: locationData,
    message: 'Location sent successfully'
  });
});

// @desc    Send detailed analysis (location + image)
// @route   POST /api/blo/send-analysis
// @access  Private (BLO)
export const sendDetailedAnalysis = asyncHandler(async (req, res) => {
  const { latitude, longitude, imageUrl } = req.body;
  const user = req.user;
  const userType = req.userType;

  // Check if user has already sent 4 images today
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const todayImageCount = await LocationData.countDocuments({
    [userType === 'testUser' ? 'testUserId' : 'bloId']: user._id,
    date: { $gte: startOfDay, $lt: endOfDay },
    type: 'detailed_analysis'
  });

  if (todayImageCount >= 4) {
    return res.status(400).json({
      error: 'Daily image limit reached. You can only send 4 images per day.'
    });
  }

  const locationData = await LocationData.create({
    [userType === 'testUser' ? 'testUserId' : 'bloId']: user._id,
    latitude,
    longitude,
    imageUrl,
    type: 'detailed_analysis',
    userId: user.userId
  });

  res.status(201).json({
    success: true,
    data: locationData,
    message: 'Detailed analysis sent successfully',
    remainingImages: 4 - (todayImageCount + 1)
  });
});

// @desc    Get user's location history
// @route   GET /api/blo/history
// @access  Private (BLO)
export const getUserHistory = asyncHandler(async (req, res) => {
  const user = req.user;
  const userType = req.userType;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const date = req.query.date;

  // Build query
  let query = {
    [userType === 'testUser' ? 'testUserId' : 'bloId']: user._id
  };

  if (date) {
    const searchDate = new Date(date);
    const startOfDay = new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    
    query.date = { $gte: startOfDay, $lt: endOfDay };
  }

  // Get location data with pagination
  const locationData = await LocationData.find(query)
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit);

  // Get total count for pagination
  const total = await LocationData.countDocuments(query);

  res.json({
    success: true,
    data: locationData,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});