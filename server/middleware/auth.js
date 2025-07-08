import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Verify JWT token
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Authentication middleware
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      });
    }

    // Support both "Bearer token" and "Token token" formats
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
    const user = await User.findById(decoded.userId).select('-password');
    
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
    
    console.error('Authentication error:', error);
    res.status(500).json({ 
      error: 'Internal server error during authentication.' 
    });
  }
};

// Authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Access denied. Authentication required.' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access denied. Required role: ${roles.join(' or ')}` 
      });
    }

    next();
  };
};

// Optional authentication (for public endpoints that can benefit from user context)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (authHeader) {
      const token = authHeader.startsWith('Bearer ') 
        ? authHeader.substring(7)
        : authHeader.startsWith('Token ')
        ? authHeader.substring(6)
        : authHeader;

      if (token) {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (user && user.isActive) {
          req.user = user;
        }
      }
    }
    
    next();
  } catch (error) {
    // Ignore authentication errors for optional auth
    next();
  }
};