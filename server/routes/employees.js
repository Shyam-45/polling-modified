import express from 'express';
import {
  getEmployees,
  getEmployee,
  getEmployeeByMobile,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getWards,
  getDashboardStats
} from '../controllers/employeeController.js';
import {
  validateEmployee,
  validateEmpId,
  validateMobileNumber,
  validatePagination
} from '../middleware/validation.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/employees
// @desc    Get all employees with pagination and search
// @access  Private
router.get('/', authenticate, validatePagination, getEmployees);

// @route   GET /api/employees/wards
// @desc    Get unique wards list
// @access  Private
router.get('/wards', authenticate, getWards);

// @route   GET /api/employees/stats/dashboard
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats/dashboard', authenticate, getDashboardStats);

// @route   GET /api/employees/mobile/:mobileNumber
// @desc    Get employee by mobile number
// @access  Private
router.get('/mobile/:mobileNumber', authenticate, validateMobileNumber, getEmployeeByMobile);

// @route   GET /api/employees/:empId
// @desc    Get single employee by empId
// @access  Private
router.get('/:empId', authenticate, validateEmpId, getEmployee);

// @route   POST /api/employees
// @desc    Create new employee
// @access  Private (Admin only)
router.post('/', authenticate, authorize('admin'), validateEmployee, createEmployee);

// @route   PUT /api/employees/:empId
// @desc    Update employee
// @access  Private (Admin only)
router.put('/:empId', authenticate, authorize('admin'), validateEmpId, validateEmployee, updateEmployee);

// @route   DELETE /api/employees/:empId
// @desc    Delete employee
// @access  Private (Admin only)
router.delete('/:empId', authenticate, authorize('admin'), validateEmpId, deleteEmployee);

export default router;