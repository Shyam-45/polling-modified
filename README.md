# BLO Monitoring System - MERN Stack

A comprehensive Block Level Officer (BLO) monitoring system built with the MERN stack (MongoDB, Express.js, React, Node.js).

## 🚀 Features

### Admin Dashboard
- **User Authentication**: Secure login with show/hide password functionality
- **Dashboard Overview**: Real-time statistics and image upload distribution
- **Know Your BLO**: Complete BLO directory with search and filtering
- **Image Count Filtering**: Filter BLOs by daily image upload count (0-4)
- **Detailed View**: Individual BLO details with location history
- **Date-based Search**: Filter location updates by specific dates

### BLO User Interface
- **Secure Login**: User ID and password authentication
- **Profile Management**: View personal and booth information
- **Send Location**: Quick location sharing (lat/lon only)
- **Detailed Analysis**: Location + image upload (max 4 images/day)
- **Upload History**: View past location updates and images
- **Real-time Tracking**: Daily image count monitoring

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication tokens
- **Helmet** - Security middleware
- **Express Validator** - Input validation
- **Morgan** - HTTP request logging

### Frontend
- **React** - UI library with TypeScript
- **Tailwind CSS** - Utility-first styling
- **Vite** - Build tool and dev server
- **Lucide React** - Icon library

## 📊 Database Collections

### BLO Collection
- Name, Designation, Officer Type
- Mobile Number, Booth Number, Booth Name
- User ID, Password (stored as plain text as requested)
- Active status and timestamps

### Admin Collection
- Name, User ID, Password
- Active status and last login tracking

### TestUser Collection
- Same structure as BLO (for testing purposes)
- 5 fake users for development and testing

### LocationData Collection
- Latitude, Longitude coordinates
- Image URL (optional)
- Type: 'location_only' or 'detailed_analysis'
- Date tracking and user references

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI

# Seed the database with sample data
npm run seed

# Start the development server
npm run dev
```

The backend server will start on `http://localhost:5000`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:5173`

## 🔐 Login Credentials

### Admin Access
- **User ID**: `admin`
- **Password**: `admin123`

### Test BLO Users
- **User ID**: `test001` | **Password**: `test123`
- **User ID**: `test002` | **Password**: `test123`
- **User ID**: `test003` | **Password**: `test123`
- **User ID**: `test004` | **Password**: `test123`
- **User ID**: `test005` | **Password**: `test123`

### Production BLO Users
- **User ID**: `rajesh.blo` | **Password**: `rajesh123`
- **User ID**: `priya.blo` | **Password**: `priya123`
- **User ID**: `mohammed.blo` | **Password**: `mohammed123`

## 📱 API Endpoints

### Admin Routes (`/api/admin/`)
- `POST /login` - Admin authentication
- `GET /blos` - Get all BLOs with image counts
- `GET /dashboard-stats` - Dashboard statistics
- `GET /blo/:id/details` - Individual BLO details

### BLO Routes (`/api/blo/`)
- `POST /login` - BLO authentication
- `GET /profile` - User profile information
- `POST /send-location` - Send location only
- `POST /send-analysis` - Send location + image
- `GET /history` - User's upload history

## 🎯 Key Features Explained

### Image Upload Limit
- Each BLO can upload maximum 4 images per day
- Admin dashboard shows real-time image count distribution
- Color-coded indicators: Red (0-1), Yellow (2-3), Green (4)

### Location Tracking
- Two types: Location-only and Detailed Analysis
- GPS coordinates automatically captured
- Images uploaded to external service (placeholder in demo)

### Admin Monitoring
- Real-time dashboard with statistics
- Search BLOs by name, user ID, or booth number
- Filter by daily image upload count
- Date-based filtering for historical data

### Security Features
- JWT-based authentication
- Rate limiting and CORS protection
- Input validation on all endpoints
- Secure password handling (plain text as requested)

## 🔧 Environment Configuration

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/blo_monitoring
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## 📈 Sample Data

The seed script creates:
- 2 Admin users
- 5 Test users (for testing)
- 3 Production BLO users
- Sample location data with images
- Today's activity data for demonstration

## 🚀 Deployment

### Backend Deployment
1. Set environment variables in your hosting platform
2. Ensure MongoDB connection string is configured
3. Set `NODE_ENV=production`
4. Deploy the `server` directory

### Frontend Deployment
1. Set `VITE_API_BASE_URL` to your backend URL
2. Build the project: `npm run build`
3. Deploy the `dist` directory

## 🧪 Development Scripts

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

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and questions, please create an issue in the repository.