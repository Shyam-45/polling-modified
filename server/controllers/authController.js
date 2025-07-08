import User from '../models/User.js';
import Employee from '../models/Employee.js';
import { generateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (or Admin only in production)
export const register = asyncHandler(async (req, res) => {
  const { username, email, password, firstName, lastName, mobileNumber, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [
      { username },
      ...(email ? [{ email }] : []),
      ...(mobileNumber ? [{ mobileNumber }] : [])
    ]
  });

  if (existingUser) {
    return res.status(400).json({
      error: 'User with this username, email, or mobile number already exists'
    });
  }

  // Create user
  const user = await User.create({
    username,
    email,
    password,
    firstName,
    lastName,
    mobileNumber,
    role: role || 'employee'
  });

  // Generate token
  const token = generateToken(user._id);

  // Update last login
  await user.updateLastLogin();

  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      mobileNumber: user.mobileNumber
    },
    message: 'User registered successfully'
  });
});

// @desc    Login user with username/password
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Find user and include password for comparison
  const user = await User.findOne({ username }).select('+password');

  if (!user) {
    return res.status(401).json({
      error: 'Invalid credentials'
    });
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    return res.status(401).json({
      error: 'Invalid credentials'
    });
  }

  // Check if user is active
  if (!user.isActive) {
    return res.status(401).json({
      error: 'User account is disabled'
    });
  }

  // Generate token
  const token = generateToken(user._id);

  // Update last login
  await user.updateLastLogin();

  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      mobileNumber: user.mobileNumber
    },
    message: 'Login successful'
  });
});

// @desc    Login with mobile number
// @route   POST /api/auth/mobile-login
// @access  Public
export const mobileLogin = asyncHandler(async (req, res) => {
  const { mobile_number } = req.body;

  try {
    // Find employee by mobile number
    const employee = await Employee.findOne({ mobileNumber: mobile_number }).populate('user');

    if (!employee) {
      return res.status(404).json({
        error: 'Mobile number not found in employee records'
      });
    }

    // Check if employee has a linked user account
    if (employee.user) {
      const user = employee.user;

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          error: 'User account is disabled'
        });
      }

      // Generate token
      const token = generateToken(user._id);

      // Update last login
      await user.updateLastLogin();

      return res.json({
        success: true,
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          mobileNumber: user.mobileNumber
        },
        employee: {
          empId: employee.empId,
          name: employee.name,
          mobileNumber: employee.mobileNumber
        },
        message: 'Mobile login successful'
      });
    } else {
      // Employee exists but no user account - return employee info for limited access
      return res.json({
        success: true,
        employee: {
          empId: employee.empId,
          name: employee.name,
          mobileNumber: employee.mobileNumber
        },
        message: 'Employee found - limited access (no user account)'
      });
    }
  } catch (error) {
    console.error('Mobile login error:', error);
    res.status(500).json({
      error: 'Internal server error during mobile login'
    });
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  // In JWT implementation, logout is typically handled client-side
  // by removing the token from storage
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      error: 'User not found'
    });
  }

  res.json({
    success: true,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      mobileNumber: user.mobileNumber,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    }
  });
});