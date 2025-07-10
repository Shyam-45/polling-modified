import express from 'express';
import {
  adminLogin,
  getAllBLOs,
  getDashboardStats,
  getBLODetails
} from '../controllers/adminController.js';
import {
  validateAdminLogin,
  validatePagination
} from '../middleware/validation.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/admin/login
// @desc    Admin login
// @access  Public
router.post('/login', validateAdminLogin, adminLogin);

// @route   GET /api/admin/blos
// @desc    Get all BLOs with today's image count
// @access  Private (Admin)
router.get('/blos', authenticateAdmin, validatePagination, getAllBLOs);

// @route   GET /api/admin/dashboard-stats
// @desc    Get dashboard statistics
// @access  Private (Admin)
router.get('/dashboard-stats', authenticateAdmin, getDashboardStats);

// @route   GET /api/admin/blo/:id/details
// @desc    Get BLO details with location history
// @access  Private (Admin)
router.get('/blo/:id/details', authenticateAdmin, validatePagination, getBLODetails);

export default router;