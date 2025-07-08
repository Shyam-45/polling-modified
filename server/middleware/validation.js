import { body, param, query, validationResult } from 'express-validator';

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// User validation rules
export const validateUserRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage('Username must be between 3 and 150 characters')
    .matches(/^[a-zA-Z0-9_.-]+$/)
    .withMessage('Username can only contain letters, numbers, dots, hyphens, and underscores'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage('First name cannot exceed 150 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage('Last name cannot exceed 150 characters'),
  
  body('mobileNumber')
    .optional()
    .trim()
    .matches(/^\d{10}$/)
    .withMessage('Mobile number must be exactly 10 digits'),
  
  body('role')
    .optional()
    .isIn(['admin', 'employee'])
    .withMessage('Role must be either admin or employee'),
  
  handleValidationErrors
];

export const validateUserLogin = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

export const validateMobileLogin = [
  body('mobile_number')
    .trim()
    .matches(/^\d{10}$/)
    .withMessage('Mobile number must be exactly 10 digits'),
  
  handleValidationErrors
];

// Employee validation rules
export const validateEmployee = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  
  body('designation')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Designation cannot exceed 100 characters'),
  
  body('mobileNumber')
    .optional()
    .trim()
    .matches(/^\d{10}$/)
    .withMessage('Mobile number must be exactly 10 digits'),
  
  body('officeName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Office name cannot exceed 100 characters'),
  
  body('officePlace')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Office place cannot exceed 100 characters'),
  
  body('boothNumber')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Booth number cannot exceed 20 characters'),
  
  body('boothName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Booth name cannot exceed 100 characters'),
  
  body('buildingName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Building name cannot exceed 100 characters'),
  
  body('boothDuration')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Booth duration cannot exceed 50 characters'),
  
  body('wardNumber')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('Ward number cannot exceed 10 characters'),
  
  body('wardName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Ward name cannot exceed 100 characters'),
  
  handleValidationErrors
];

// Location update validation rules
export const validateLocationUpdate = [
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  
  body('place_name')
    .trim()
    .notEmpty()
    .withMessage('Place name is required')
    .isLength({ max: 200 })
    .withMessage('Place name cannot exceed 200 characters'),
  
  body('image_url')
    .optional()
    .trim()
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Image URL must be a valid HTTP/HTTPS URL')
    .isLength({ max: 500 })
    .withMessage('Image URL cannot exceed 500 characters'),
  
  handleValidationErrors
];

// Parameter validation
export const validateEmpId = [
  param('empId')
    .matches(/^EMP\d{3}$/)
    .withMessage('Employee ID must be in format EMP001, EMP002, etc.'),
  
  handleValidationErrors
];

export const validateMobileNumber = [
  param('mobileNumber')
    .matches(/^\d{10}$/)
    .withMessage('Mobile number must be exactly 10 digits'),
  
  handleValidationErrors
];

// Query parameter validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term cannot exceed 100 characters'),
  
  query('ward')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('Ward number cannot exceed 10 characters'),
  
  query('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be in ISO 8601 format (YYYY-MM-DD)'),
  
  handleValidationErrors
];