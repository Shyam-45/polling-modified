import express from 'express';
import {
  bloLogin,
  getUserProfile,
  sendLocation,
  sendDetailedAnalysis,
  getUserHistory
} from '../controllers/bloController.js';
import {
  validateBLOLogin,
  validateLocationOnly,
  validateDetailedAnalysis,
  validatePagination
} from '../middleware/validation.js';
import { authenticateBLO } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/blo/login
// @desc    BLO login
// @access  Public
router.post('/login', validateBLOLogin, bloLogin);

// @route   GET /api/blo/profile
// @desc    Get user profile
// @access  Private (BLO)
router.get('/profile', authenticateBLO, getUserProfile);

// @route   POST /api/blo/send-location
// @desc    Send location only
// @access  Private (BLO)
router.post('/send-location', authenticateBLO, validateLocationOnly, sendLocation);

// @route   POST /api/blo/send-analysis
// @desc    Send detailed analysis (location + image)
// @access  Private (BLO)
router.post('/send-analysis', authenticateBLO, validateDetailedAnalysis, sendDetailedAnalysis);

// @route   GET /api/blo/history
// @desc    Get user's location history
// @access  Private (BLO)
router.get('/history', authenticateBLO, validatePagination, getUserHistory);

export default router;