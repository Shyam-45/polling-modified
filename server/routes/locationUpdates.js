import express from 'express';
import {
  getLocationUpdates,
  createLocationUpdate,
  getLocationUpdatesByEmployee,
  deleteLocationUpdate
} from '../controllers/locationUpdateController.js';
import {
  validateLocationUpdate,
  validateEmpId,
  validatePagination
} from '../middleware/validation.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/location-updates
// @desc    Get all location updates with pagination
// @access  Private
router.get('/', authenticate, validatePagination, getLocationUpdates);

// @route   POST /api/location-updates/create
// @desc    Create new location update
// @access  Private
router.post('/create', authenticate, validateLocationUpdate, createLocationUpdate);

// @route   GET /api/location-updates/employee/:empId
// @desc    Get location updates for specific employee
// @access  Private
router.get('/employee/:empId', authenticate, validateEmpId, validatePagination, getLocationUpdatesByEmployee);

// @route   DELETE /api/location-updates/:id
// @desc    Delete location update
// @access  Private (Admin only)
router.delete('/:id', authenticate, authorize('admin'), deleteLocationUpdate);

export default router;