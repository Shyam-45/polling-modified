import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'User ID cannot exceed 50 characters']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for performance
adminSchema.index({ userId: 1 });

// Method to update last login
adminSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save({ validateBeforeSave: false });
};

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;