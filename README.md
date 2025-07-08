# Polling Station Management System - MERN Stack

A comprehensive employee management system for polling stations built with the MERN stack (MongoDB, Express.js, React, Node.js).

## 🚀 Features

- **User Authentication**: JWT-based authentication with role-based access control
- **Employee Management**: Complete CRUD operations for employee records
- **Location Tracking**: Real-time location updates with image uploads
- **Mobile App**: Dedicated mobile interface for field employees
- **Dashboard**: Administrative dashboard with statistics and search functionality
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Lucide React** - Icons

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd polling-system-mern
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env file with your MongoDB URI and JWT secret

# Seed the database with sample data
npm run seed

# Start the development server
npm run dev
```

The backend server will start on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:5173`

## 🔧 Environment Configuration

### Backend (.env)

```env
# Database
MONGODB_URI=mongodb://localhost:27017/polling_system

# JWT Secret (use a strong, random string in production)
JWT_SECRET=your-super-secret-jwt-key-here

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Origins
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env)

```env
# API Base URL
VITE_API_BASE_URL=http://localhost:5000/api

# Image Upload Service (Optional)
VITE_IMGBB_API_KEY=your-imgbb-api-key
```

## 📊 Database Schema

### Users Collection
```javascript
{
  username: String (unique),
  email: String,
  password: String (hashed),
  firstName: String,
  lastName: String,
  mobileNumber: String,
  role: String (admin/employee),
  isActive: Boolean,
  timestamps: true
}
```

### Employees Collection
```javascript
{
  empId: String (auto-generated, unique),
  name: String,
  designation: String,
  mobileNumber: String,
  officeName: String,
  officePlace: String,
  boothNumber: String,
  boothName: String,
  buildingName: String,
  boothDuration: String,
  wardNumber: String,
  wardName: String,
  user: ObjectId (ref: User),
  timestamps: true
}
```

### LocationUpdates Collection
```javascript
{
  employee: ObjectId (ref: Employee),
  serialNumber: Number,
  latitude: Number,
  longitude: Number,
  placeName: String,
  imageUrl: String,
  timestamps: true
}
```

## 🔐 Authentication

The system uses JWT (JSON Web Tokens) for authentication:

- **Admin Login**: Username/password authentication
- **Mobile Login**: Mobile number-based authentication for employees
- **Token Expiry**: 7 days
- **Role-based Access**: Admin and Employee roles with different permissions

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with username/password
- `POST /api/auth/mobile-login` - Login with mobile number
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile

### Employees
- `GET /api/employees` - Get all employees (with pagination)
- `GET /api/employees/:empId` - Get employee by ID
- `GET /api/employees/mobile/:mobile` - Get employee by mobile
- `POST /api/employees` - Create new employee (Admin only)
- `PUT /api/employees/:empId` - Update employee (Admin only)
- `DELETE /api/employees/:empId` - Delete employee (Admin only)
- `GET /api/employees/wards` - Get unique wards
- `GET /api/employees/stats/dashboard` - Get dashboard stats

### Location Updates
- `GET /api/location-updates` - Get all location updates
- `POST /api/location-updates/create` - Create location update
- `GET /api/location-updates/employee/:empId` - Get updates by employee
- `DELETE /api/location-updates/:id` - Delete location update (Admin only)

## 🔒 Security Features

- **Helmet.js** - Security headers
- **Rate Limiting** - Prevent abuse
- **CORS** - Cross-origin protection
- **Input Validation** - Express-validator
- **Password Hashing** - bcryptjs
- **JWT Authentication** - Secure token-based auth

## 📱 Mobile App Features

- **Mobile Login** - Quick access with mobile number
- **Location Tracking** - GPS-based location updates
- **Image Upload** - Capture and upload images with location
- **Employee Profile** - View assignment details
- **Duty Hours** - Time-based access control

## 🚀 Deployment

### Backend Deployment (Render/Heroku)

1. Set environment variables in your hosting platform
2. Ensure MongoDB Atlas connection string is configured
3. Set `NODE_ENV=production`
4. Deploy the `server` directory

### Frontend Deployment (Vercel/Netlify)

1. Set `VITE_API_BASE_URL` to your backend URL
2. Build the project: `npm run build`
3. Deploy the `dist` directory

## 🧪 Sample Data

The system includes a seed script that creates:

- **1 Admin User**: `username: admin, password: admin123`
- **5 Employee Users**: Various employees with different roles
- **20 Total Employees**: Mix of employees with and without user accounts
- **Sample Location Updates**: Historical location data

Run the seed script:
```bash
cd server
npm run seed
```

## 🔧 Development Scripts

### Backend
```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
npm run seed     # Seed database with sample data
```

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running locally
   - Check connection string in `.env`
   - For MongoDB Atlas, ensure IP whitelist is configured

2. **CORS Errors**
   - Verify `CORS_ORIGINS` in backend `.env`
   - Check frontend API URL configuration

3. **Authentication Issues**
   - Ensure JWT_SECRET is set in backend
   - Check token expiry and refresh logic

4. **Port Conflicts**
   - Backend default: 5000
   - Frontend default: 5173
   - Change ports in respective configurations if needed

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and questions, please create an issue in the repository or contact the development team.