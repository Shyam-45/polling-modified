import express from 'express';
import { 
  login, 
  mobileLogin, 
  logout, 
  getUserProfile,
  register 
} from '../controllers/authController.js';
import { 
  validateUserLogin, 
  validateMobileLogin,
  validateUserRegistration 
} from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public (or Admin only in production)
router.post('/register', validateUserRegistration, register);

// @route   POST /api/auth/login
// @desc    Login user with username/password
// @access  Public
router.post('/login', validateUserLogin, login);

// @route   POST /api/auth/mobile-login
// @desc    Login with mobile number
// @access  Public
router.post('/mobile-login', validateMobileLogin, mobileLogin);

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', authenticate, logout);

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authenticate, getUserProfile);

export default router;