import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employees.js';
import locationUpdateRoutes from './routes/locationUpdates.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.CORS_ORIGINS 
      ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
      : [
          'http://localhost:3000',
          'http://localhost:5173',
          'http://127.0.0.1:3000',
          'http://127.0.0.1:5173'
        ];
    
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/location-updates', locationUpdateRoutes);

// Additional route for location updates (to match frontend expectations)
app.use('/api/employees/:empId/location-updates', (req, res, next) => {
  req.url = `/employee/${req.params.empId}`;
  locationUpdateRoutes(req, res, next);
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Polling Station Management System API',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: {
      auth: '/api/auth',
      employees: '/api/employees',
      locationUpdates: '/api/location-updates'
    }
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 API Health Check: http://localhost:${PORT}/api/health`);
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`📖 API Documentation: http://localhost:${PORT}/`);
    console.log(`🔐 Admin Login: username=admin, password=admin123`);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`❌ Uncaught Exception: ${err.message}`);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('💤 Process terminated');
  });
});

export default app;