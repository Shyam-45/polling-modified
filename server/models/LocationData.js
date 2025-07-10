import mongoose from 'mongoose';

const locationDataSchema = new mongoose.Schema({
  bloId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BLO',
    required: [true, 'BLO reference is required']
  },
  testUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestUser',
    default: null
  },
  latitude: {
    type: Number,
    required: [true, 'Latitude is required'],
    min: [-90, 'Latitude must be between -90 and 90'],
    max: [90, 'Latitude must be between -90 and 90']
  },
  longitude: {
    type: Number,
    required: [true, 'Longitude is required'],
    min: [-180, 'Longitude must be between -180 and 180'],
    max: [180, 'Longitude must be between -180 and 180']
  },
  imageUrl: {
    type: String,
    trim: true,
    maxlength: [500, 'Image URL cannot exceed 500 characters'],
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty strings
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Image URL must be a valid HTTP/HTTPS URL'
    }
  },
  type: {
    type: String,
    enum: ['location_only', 'detailed_analysis'],
    required: [true, 'Type is required']
  },
  date: {
    type: Date,
    default: Date.now
  },
  dayOfYear: {
    type: Number,
    required: true
  },
  userId: {
    type: String,
    required: [true, 'User ID is required']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for performance
locationDataSchema.index({ bloId: 1, date: -1 });
locationDataSchema.index({ testUserId: 1, date: -1 });
locationDataSchema.index({ userId: 1, date: -1 });
locationDataSchema.index({ dayOfYear: 1, userId: 1 });
locationDataSchema.index({ type: 1, date: -1 });

// Virtual for location string
locationDataSchema.virtual('location').get(function() {
  return `${this.latitude}, ${this.longitude}`;
});

// Virtual for formatted date
locationDataSchema.virtual('formattedDate').get(function() {
  return this.date.toISOString().split('T')[0];
});

// Pre-save middleware to calculate day of year
locationDataSchema.pre('save', function(next) {
  const start = new Date(this.date.getFullYear(), 0, 0);
  const diff = this.date - start;
  this.dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  next();
});

const LocationData = mongoose.model('LocationData', locationDataSchema);

export default LocationData;