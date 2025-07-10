import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import BLO from '../models/BLO.js';
import TestUser from '../models/TestUser.js';

// Generate JWT token
export const generateToken = (userId, role = 'blo') => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Verify JWT token
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Admin authentication middleware
export const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      });
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7)
      : authHeader.startsWith('Token ')
      ? authHeader.substring(6)
      : authHeader;

    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied. Invalid token format.' 
      });
    }

    const decoded = verifyToken(token);
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied. Admin role required.' 
      });
    }

    const admin = await Admin.findById(decoded.userId);
    
    if (!admin) {
      return res.status(401).json({ 
        error: 'Access denied. Admin not found.' 
      });
    }

    if (!admin.isActive) {
      return res.status(401).json({ 
        error: 'Access denied. Admin account is disabled.' 
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Access denied. Invalid token.' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Access denied. Token expired.' 
      });
    }
    
    console.error('Admin authentication error:', error);
    res.status(500).json({ 
      error: 'Internal server error during authentication.' 
    });
  }
};

// BLO authentication middleware
export const authenticateBLO = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      });
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7)
      : authHeader.startsWith('Token ')
      ? authHeader.substring(6)
      : authHeader;

    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied. Invalid token format.' 
      });
    }

    const decoded = verifyToken(token);
    
    if (decoded.role !== 'blo') {
      return res.status(403).json({ 
        error: 'Access denied. BLO role required.' 
      });
    }

    // Try to find in TestUser first, then BLO
    let user = await TestUser.findById(decoded.userId);
    let userType = 'testUser';
    
    if (!user) {
      user = await BLO.findById(decoded.userId);
      userType = 'blo';
    }
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Access denied. User not found.' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        error: 'Access denied. User account is disabled.' 
      });
    }

    req.user = user;
    req.userType = userType;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Access denied. Invalid token.' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Access denied. Token expired.' 
      });
    }
    
    console.error('BLO authentication error:', error);
    res.status(500).json({ 
      error: 'Internal server error during authentication.' 
    });
  }
};