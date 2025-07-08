import Employee from '../models/Employee.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Get all employees with pagination and search
// @route   GET /api/employees
// @access  Private
export const getEmployees = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 60;
  const skip = (page - 1) * limit;
  const search = req.query.search;
  const ward = req.query.ward;

  // Build query
  let query = {};

  // Search by empId or name
  if (search) {
    query.$or = [
      { empId: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } }
    ];
  }

  // Filter by ward
  if (ward) {
    query.wardNumber = ward;
  }

  // Get total count for pagination
  const total = await Employee.countDocuments(query);

  // Get employees with pagination
  const employees = await Employee.find(query)
    .populate('user', 'username email')
    .sort({ empId: 1 })
    .skip(skip)
    .limit(limit);

  // Calculate pagination info
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  res.json({
    success: true,
    results: employees,
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

// @desc    Get single employee by empId
// @route   GET /api/employees/:empId
// @access  Private
export const getEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ empId: req.params.empId })
    .populate('user', 'username email');

  if (!employee) {
    return res.status(404).json({
      error: 'Employee not found'
    });
  }

  res.json({
    success: true,
    data: employee
  });
});

// @desc    Get employee by mobile number
// @route   GET /api/employees/mobile/:mobileNumber
// @access  Private
export const getEmployeeByMobile = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ mobileNumber: req.params.mobileNumber })
    .populate('user', 'username email');

  if (!employee) {
    return res.status(404).json({
      error: 'Employee not found with this mobile number'
    });
  }

  res.json({
    success: true,
    data: employee
  });
});

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private (Admin only)
export const createEmployee = asyncHandler(async (req, res) => {
  const employeeData = req.body;

  // Check if mobile number already exists
  if (employeeData.mobileNumber) {
    const existingEmployee = await Employee.findOne({ mobileNumber: employeeData.mobileNumber });
    if (existingEmployee) {
      return res.status(400).json({
        error: 'Employee with this mobile number already exists'
      });
    }
  }

  const employee = await Employee.create(employeeData);

  res.status(201).json({
    success: true,
    data: employee,
    message: 'Employee created successfully'
  });
});

// @desc    Update employee
// @route   PUT /api/employees/:empId
// @access  Private (Admin only)
export const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ empId: req.params.empId });

  if (!employee) {
    return res.status(404).json({
      error: 'Employee not found'
    });
  }

  // Check if mobile number already exists (excluding current employee)
  if (req.body.mobileNumber && req.body.mobileNumber !== employee.mobileNumber) {
    const existingEmployee = await Employee.findOne({ 
      mobileNumber: req.body.mobileNumber,
      _id: { $ne: employee._id }
    });
    
    if (existingEmployee) {
      return res.status(400).json({
        error: 'Employee with this mobile number already exists'
      });
    }
  }

  // Update employee
  Object.assign(employee, req.body);
  await employee.save();

  res.json({
    success: true,
    data: employee,
    message: 'Employee updated successfully'
  });
});

// @desc    Delete employee
// @route   DELETE /api/employees/:empId
// @access  Private (Admin only)
export const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ empId: req.params.empId });

  if (!employee) {
    return res.status(404).json({
      error: 'Employee not found'
    });
  }

  await employee.deleteOne();

  res.json({
    success: true,
    message: 'Employee deleted successfully'
  });
});

// @desc    Get unique wards list
// @route   GET /api/employees/wards
// @access  Private
export const getWards = asyncHandler(async (req, res) => {
  try {
    // Get unique ward numbers and names from employees
    const wards = await Employee.aggregate([
      {
        $match: {
          wardNumber: { $exists: true, $ne: null, $ne: '' }
        }
      },
      {
        $group: {
          _id: '$wardNumber',
          wardName: { $first: '$wardName' }
        }
      },
      {
        $project: {
          _id: 0,
          ward_number: '$_id',
          ward_name: { $ifNull: ['$wardName', '$_id'] }
        }
      },
      {
        $sort: { ward_number: 1 }
      }
    ]);

    res.json({
      success: true,
      data: wards
    });
  } catch (error) {
    console.error('Failed to fetch wards:', error);
    res.status(500).json({
      error: 'Failed to fetch wards'
    });
  }
});

// @desc    Get dashboard statistics
// @route   GET /api/employees/stats/dashboard
// @access  Private
export const getDashboardStats = asyncHandler(async (req, res) => {
  try {
    const [
      totalEmployees,
      activeBooths,
      uniqueWards
    ] = await Promise.all([
      Employee.countDocuments(),
      Employee.distinct('boothNumber', { 
        boothNumber: { $exists: true, $ne: null, $ne: '' } 
      }).then(booths => booths.length),
      Employee.distinct('wardNumber', { 
        wardNumber: { $exists: true, $ne: null, $ne: '' } 
      }).then(wards => wards.length)
    ]);

    res.json({
      success: true,
      data: {
        total_employees: totalEmployees,
        active_booths: activeBooths,
        unique_wards: uniqueWards,
        on_duty: totalEmployees // Simplified for now
      }
    });
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard stats'
    });
  }
});