import mongoose from 'mongoose';

const locationUpdateSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Employee reference is required']
  },
  serialNumber: {
    type: Number,
    required: [true, 'Serial number is required'],
    min: [1, 'Serial number must be at least 1']
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
  placeName: {
    type: String,
    required: [true, 'Place name is required'],
    trim: true,
    maxlength: [200, 'Place name cannot exceed 200 characters']
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
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index for unique serial numbers per employee
locationUpdateSchema.index({ employee: 1, serialNumber: 1 }, { unique: true });

// Index for performance
locationUpdateSchema.index({ employee: 1, createdAt: -1 });
locationUpdateSchema.index({ createdAt: -1 });

// Virtual properties
locationUpdateSchema.virtual('location').get(function() {
  return `${this.latitude}, ${this.longitude}`;
});

locationUpdateSchema.virtual('locationSummary').get(function() {
  return `Update #${this.serialNumber} at ${this.placeName} on ${this.createdAt.toISOString().split('T')[0]} ${this.createdAt.toTimeString().split(' ')[0]}`;
});

locationUpdateSchema.virtual('hasImage').get(function() {
  return Boolean(this.imageUrl);
});

// Auto-generate serial number before saving
locationUpdateSchema.pre('save', async function(next) {
  if (this.isNew && !this.serialNumber) {
    try {
      // Find the highest serial number for this employee
      const lastUpdate = await this.constructor
        .findOne({ employee: this.employee })
        .sort({ serialNumber: -1 })
        .select('serialNumber');
      
      this.serialNumber = lastUpdate ? lastUpdate.serialNumber + 1 : 1;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Populate employee data when querying
locationUpdateSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'employee',
    select: 'empId name designation mobileNumber'
  });
  next();
});

const LocationUpdate = mongoose.model('LocationUpdate', locationUpdateSchema);

export default LocationUpdate;