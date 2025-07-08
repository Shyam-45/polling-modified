import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  empId: {
    type: String,
    unique: true,
    required: true,
    match: [/^EMP\d{3}$/, 'Employee ID must be in format EMP001, EMP002, etc.']
  },
  name: {
    type: String,
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  designation: {
    type: String,
    trim: true,
    maxlength: [100, 'Designation cannot exceed 100 characters']
  },
  mobileNumber: {
    type: String,
    trim: true,
    match: [/^\d{10}$/, 'Mobile number must be 10 digits']
  },
  
  // Office Information
  officeName: {
    type: String,
    trim: true,
    maxlength: [100, 'Office name cannot exceed 100 characters']
  },
  officePlace: {
    type: String,
    trim: true,
    maxlength: [100, 'Office place cannot exceed 100 characters']
  },
  
  // Booth Information
  boothNumber: {
    type: String,
    trim: true,
    maxlength: [20, 'Booth number cannot exceed 20 characters']
  },
  boothName: {
    type: String,
    trim: true,
    maxlength: [100, 'Booth name cannot exceed 100 characters']
  },
  buildingName: {
    type: String,
    trim: true,
    maxlength: [100, 'Building name cannot exceed 100 characters']
  },
  boothDuration: {
    type: String,
    trim: true,
    maxlength: [50, 'Booth duration cannot exceed 50 characters']
  },
  
  // Ward Information
  wardNumber: {
    type: String,
    trim: true,
    maxlength: [10, 'Ward number cannot exceed 10 characters']
  },
  wardName: {
    type: String,
    trim: true,
    maxlength: [100, 'Ward name cannot exceed 100 characters']
  },
  
  // Optional link to user account for authentication
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
employeeSchema.index({ empId: 1 });
employeeSchema.index({ mobileNumber: 1 });
employeeSchema.index({ wardNumber: 1 });
employeeSchema.index({ boothNumber: 1 });
employeeSchema.index({ name: 'text', empId: 'text' }); // Text search

// Auto-generate empId before saving
employeeSchema.pre('save', async function(next) {
  if (!this.empId) {
    try {
      // Find the highest existing employee ID
      const lastEmployee = await this.constructor
        .findOne({ empId: /^EMP\d{3}$/ })
        .sort({ empId: -1 })
        .select('empId');
      
      let nextNumber = 1;
      if (lastEmployee && lastEmployee.empId) {
        const lastNumber = parseInt(lastEmployee.empId.substring(3));
        nextNumber = lastNumber + 1;
      }
      
      // Format as EMP001, EMP002, etc.
      this.empId = `EMP${nextNumber.toString().padStart(3, '0')}`;
      
      // Ensure uniqueness
      while (await this.constructor.findOne({ empId: this.empId })) {
        nextNumber++;
        this.empId = `EMP${nextNumber.toString().padStart(3, '0')}`;
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Virtual properties for formatted display
employeeSchema.virtual('employeeDetails').get(function() {
  const name = this.name || "Not Assigned";
  const designation = this.designation || "Not Assigned";
  return `${this.empId} - ${name}, ${designation}`;
});

employeeSchema.virtual('contactDetails').get(function() {
  const mobile = this.mobileNumber || "No mobile";
  const email = this.user?.email || "No email";
  return `Mobile: ${mobile}, Email: ${email}`;
});

employeeSchema.virtual('officeDetails').get(function() {
  const officeName = this.officeName || "Not Assigned";
  const officePlace = this.officePlace || "Not Assigned";
  return `${officeName}, ${officePlace}`;
});

employeeSchema.virtual('boothDetails').get(function() {
  const boothNumber = this.boothNumber || "Not Assigned";
  const boothName = this.boothName || "Not Assigned";
  const buildingName = this.buildingName || "Not Assigned";
  const boothDuration = this.boothDuration || "Not Assigned";
  const wardNumber = this.wardNumber || "Not Assigned";
  return `Booth ${boothNumber} - ${boothName}, ${buildingName}, Duration: ${boothDuration}, Ward: ${wardNumber}`;
});

employeeSchema.virtual('assignmentSummary').get(function() {
  const name = this.name || "Not Assigned";
  const empId = this.empId;
  const designation = this.designation || "Not Assigned";
  const boothName = this.boothName || "Not Assigned";
  const boothNumber = this.boothNumber || "Not Assigned";
  const buildingName = this.buildingName || "Not Assigned";
  const wardNumber = this.wardNumber || "Not Assigned";
  const wardName = this.wardName || "Not Assigned";
  const officeName = this.officeName || "Not Assigned";
  const officePlace = this.officePlace || "Not Assigned";
  const boothDuration = this.boothDuration || "Not Assigned";
  const mobileNumber = this.mobileNumber || "Not Assigned";
  
  return `${name} (${empId}) is assigned as ${designation} at ${boothName} (${boothNumber}), ${buildingName}, Ward ${wardNumber} - ${wardName}. Office: ${officeName}, ${officePlace}. Duty Hours: ${boothDuration}. Contact: ${mobileNumber}`;
});

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;