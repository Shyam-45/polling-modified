from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Employee(models.Model):
    # Personal Information - All manual entry
    user = models.OneToOneField(User, on_delete=models.CASCADE, blank=True, null=True)  # Optional for authentication only
    emp_id = models.CharField(max_length=20, unique=True, editable=False)  # Auto-generated, not editable
    name = models.CharField(max_length=100, blank=True, null=True)  # Manual entry - Full name
    designation = models.CharField(max_length=100, blank=True, null=True)  # Manual entry
    mobile_number = models.CharField(max_length=15, blank=True, null=True)  # Manual entry
    
    # Office Information (direct fields, no foreign key) - All nullable
    office_name = models.CharField(max_length=100, blank=True, null=True)
    office_place = models.CharField(max_length=100, blank=True, null=True)
    
    # Booth Information (direct fields, no foreign key) - All nullable
    booth_number = models.CharField(max_length=20, blank=True, null=True)
    booth_name = models.CharField(max_length=100, blank=True, null=True)
    building_name = models.CharField(max_length=100, blank=True, null=True)
    booth_duration = models.CharField(max_length=50, blank=True, null=True)
    
    # Ward Information (direct field, no foreign key) - All nullable
    ward_number = models.CharField(max_length=10, blank=True, null=True)
    ward_name = models.CharField(max_length=100, blank=True, null=True)
    
    def save(self, *args, **kwargs):
        if not self.emp_id:
            self.emp_id = self.generate_unique_emp_id()
        super().save(*args, **kwargs)
    
    def generate_unique_emp_id(self):
        """Generate a unique employee ID in format EMP001, EMP002, etc."""
        # Get the highest existing employee ID number
        last_employee = Employee.objects.filter(
            emp_id__startswith='EMP'
        ).order_by('emp_id').last()
        
        if last_employee and last_employee.emp_id:
            try:
                # Extract the number part from the last emp_id (e.g., "001" from "EMP001")
                last_number = int(last_employee.emp_id[3:])
                new_number = last_number + 1
            except (ValueError, IndexError):
                # If there's an issue parsing, start from 1
                new_number = 1
        else:
            # No existing employees, start from 1
            new_number = 1
        
        # Format as EMP001, EMP002, etc.
        new_emp_id = f"EMP{new_number:03d}"
        
        # Double-check uniqueness (in case of race conditions)
        while Employee.objects.filter(emp_id=new_emp_id).exists():
            new_number += 1
            new_emp_id = f"EMP{new_number:03d}"
        
        return new_emp_id
    
    def __str__(self):
        return f"{self.emp_id} - {self.name or 'Unnamed Employee'}"
    
    @property
    def employee_details(self):
        name = self.name or "Not Assigned"
        designation = self.designation or "Not Assigned"
        return f"{self.emp_id} - {name}, {designation}"
    
    @property
    def contact_details(self):
        mobile = self.mobile_number or "No mobile"
        email = self.user.email if self.user else "No email"
        return f"Mobile: {mobile}, Email: {email}"
    
    @property
    def office_details(self):
        office_name = self.office_name or "Not Assigned"
        office_place = self.office_place or "Not Assigned"
        return f"{office_name}, {office_place}"
    
    @property
    def booth_details(self):
        booth_number = self.booth_number or "Not Assigned"
        booth_name = self.booth_name or "Not Assigned"
        building_name = self.building_name or "Not Assigned"
        booth_duration = self.booth_duration or "Not Assigned"
        ward_number = self.ward_number or "Not Assigned"
        return f"Booth {booth_number} - {booth_name}, {building_name}, Duration: {booth_duration}, Ward: {ward_number}"
    
    @property
    def assignment_summary(self):
        name = self.name or "Not Assigned"
        emp_id = self.emp_id
        designation = self.designation or "Not Assigned"
        booth_name = self.booth_name or "Not Assigned"
        booth_number = self.booth_number or "Not Assigned"
        building_name = self.building_name or "Not Assigned"
        ward_number = self.ward_number or "Not Assigned"
        ward_name = self.ward_name or "Not Assigned"
        office_name = self.office_name or "Not Assigned"
        office_place = self.office_place or "Not Assigned"
        booth_duration = self.booth_duration or "Not Assigned"
        mobile_number = self.mobile_number or "Not Assigned"
        
        return f"{name} ({emp_id}) is assigned as {designation} at {booth_name} ({booth_number}), {building_name}, Ward {ward_number} - {ward_name}. Office: {office_name}, {office_place}. Duty Hours: {booth_duration}. Contact: {mobile_number}"


class LocationUpdate(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    serial_number = models.PositiveIntegerField()
    latitude = models.DecimalField(max_digits=10, decimal_places=8)
    longitude = models.DecimalField(max_digits=11, decimal_places=8)
    place_name = models.CharField(max_length=200)
    timestamp = models.DateTimeField(auto_now_add=True)
    # Changed from ImageField to URLField for storing image links
    image_url = models.URLField(max_length=500, blank=True, null=True, help_text="URL link to the uploaded image")
    
    class Meta:
        ordering = ['-timestamp']
        unique_together = ['employee', 'serial_number']
    
    def __str__(self):
        return f"{self.employee.emp_id} - Update #{self.serial_number}"
    
    @property
    def location(self):
        return f"{self.latitude}, {self.longitude}"
    
    @property
    def location_summary(self):
        return f"Update #{self.serial_number} at {self.place_name} on {self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}"
    
    @property
    def update_details(self):
        return f"{self.employee.employee_details} - {self.location_summary} - Location: {self.location}"
    
    @property
    def has_image(self):
        """Check if this update has an associated image URL"""
        return bool(self.image_url)