import mongoose from 'mongoose';

const bloSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  designation: {
    type: String,
    required: [true, 'Designation is required'],
    trim: true,
    maxlength: [100, 'Designation cannot exceed 100 characters']
  },
  officerType: {
    type: String,
    required: [true, 'Officer Type is required'],
    trim: true,
    maxlength: [50, 'Officer Type cannot exceed 50 characters']
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    unique: true,
    trim: true,
    match: [/^\d{10}$/, 'Mobile number must be 10 digits']
  },
  boothNumber: {
    type: String,
    required: [true, 'Booth Number is required'],
    trim: true,
    maxlength: [20, 'Booth Number cannot exceed 20 characters']
  },
  boothName: {
    type: String,
    required: [true, 'Booth Name is required'],
    trim: true,
    maxlength: [200, 'Booth Name cannot exceed 200 characters']
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
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
bloSchema.index({ userId: 1 });
bloSchema.index({ mobile: 1 });
bloSchema.index({ boothNumber: 1 });
bloSchema.index({ name: 'text', userId: 'text', boothNumber: 'text' });

// Virtual for profile summary
bloSchema.virtual('profileSummary').get(function() {
  return `${this.name} (${this.userId}) - ${this.designation}, ${this.officerType} at Booth ${this.boothNumber} - ${this.boothName}`;
});

const BLO = mongoose.model('BLO', bloSchema);

export default BLO;