import LocationUpdate from '../models/LocationUpdate.js';
import Employee from '../models/Employee.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Get all location updates with pagination
// @route   GET /api/location-updates
// @access  Private
export const getLocationUpdates = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Build query
  let query = {};

  // Filter by date
  if (req.query.date) {
    const date = new Date(req.query.date);
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);
    
    query.createdAt = {
      $gte: date,
      $lt: nextDate
    };
  }

  // Get total count for pagination
  const total = await LocationUpdate.countDocuments(query);

  // Get location updates with pagination
  const locationUpdates = await LocationUpdate.find(query)
    .populate('employee', 'empId name designation mobileNumber')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Calculate pagination info
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  res.json({
    success: true,
    results: locationUpdates,
    pagination: {
      count: total,
      page,
      pages: totalPages,
      limit,
      hasNext,
      hasPrev,
      next: hasNext ? `${req.baseUrl}${req.path}?page=${page + 1}&limit=${limit}` : null,
      previous: hasPrev ? `${req.baseUrl}${req.path}?page=${page - 1}&limit=${limit}` : null
    }
  });
});

// @desc    Create new location update
// @route   POST /api/location-updates/create
// @access  Private
export const createLocationUpdate = asyncHandler(async (req, res) => {
  const { latitude, longitude, place_name, image_url } = req.body;

  try {
    // Find employee by user or mobile number
    let employee;
    
    if (req.user) {
      // Try to find employee linked to this user
      employee = await Employee.findOne({ user: req.user._id });
      
      if (!employee && req.user.mobileNumber) {
        // If no direct link, try to find by mobile number
        employee = await Employee.findOne({ mobileNumber: req.user.mobileNumber });
      }
    }

    if (!employee) {
      return res.status(404).json({
        error: 'Employee profile not found. Please contact administrator.'
      });
    }

    // Create location update
    const locationUpdate = await LocationUpdate.create({
      employee: employee._id,
      latitude,
      longitude,
      placeName: place_name,
      imageUrl: image_url || ''
    });

    // Populate employee data
    await locationUpdate.populate('employee', 'empId name designation mobileNumber');

    res.status(201).json({
      success: true,
      data: locationUpdate,
      message: 'Location update created successfully'
    });
  } catch (error) {
    console.error('Failed to create location update:', error);
    
    // Handle duplicate serial number error
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Duplicate location update. Please try again.'
      });
    }
    
    res.status(500).json({
      error: 'Failed to create location update'
    });
  }
});

// @desc    Get location updates for specific employee
// @route   GET /api/location-updates/employee/:empId
// @access  Private
export const getLocationUpdatesByEmployee = asyncHandler(async (req, res) => {
  const { empId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Find employee
  const employee = await Employee.findOne({ empId });
  
  if (!employee) {
    return res.status(404).json({
      error: 'Employee not found'
    });
  }

  // Build query
  let query = { employee: employee._id };

  // Filter by date
  if (req.query.date) {
    const date = new Date(req.query.date);
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);
    
    query.createdAt = {
      $gte: date,
      $lt: nextDate
    };
  }

  // Get total count for pagination
  const total = await LocationUpdate.countDocuments(query);

  // Get location updates with pagination
  const locationUpdates = await LocationUpdate.find(query)
    .populate('employee', 'empId name designation mobileNumber')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Transform data to match frontend expectations
  const transformedUpdates = locationUpdates.map(update => ({
    id: update._id,
    emp_id: update.employee.empId,
    serial_number: update.serialNumber,
    location: update.location,
    place_name: update.placeName,
    timestamp: update.createdAt,
    image: update.imageUrl,
    image_url: update.imageUrl,
    has_image: update.hasImage,
    location_summary: update.locationSummary,
    update_details: `${update.employee.empId} - ${update.locationSummary} - Location: ${update.location}`
  }));

  // Calculate pagination info
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  res.json({
    success: true,
    results: transformedUpdates,
    pagination: {
      count: total,
      page,
      pages: totalPages,
      limit,
      hasNext,
      hasPrev,
      next: hasNext ? `${req.baseUrl}${req.path}?page=${page + 1}&limit=${limit}` : null,
      previous: hasPrev ? `${req.baseUrl}${req.path}?page=${page - 1}&limit=${limit}` : null
    }
  });
});

// @desc    Delete location update
// @route   DELETE /api/location-updates/:id
// @access  Private (Admin only)
export const deleteLocationUpdate = asyncHandler(async (req, res) => {
  const locationUpdate = await LocationUpdate.findById(req.params.id);

  if (!locationUpdate) {
    return res.status(404).json({
      error: 'Location update not found'
    });
  }

  await locationUpdate.deleteOne();

  res.json({
    success: true,
    message: 'Location update deleted successfully'
  });
});