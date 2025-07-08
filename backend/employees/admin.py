from django.contrib import admin
from .models import Employee, LocationUpdate


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ['emp_id', 'name', 'designation', 'mobile_number', 'office_name', 'booth_number', 'ward_number']
    list_filter = ['designation', 'ward_number', 'office_name']
    search_fields = ['emp_id', 'name', 'mobile_number', 'office_name', 'booth_name', 'designation']
    
    fieldsets = (
        ('Personal Information', {
            'fields': ('name', 'designation', 'mobile_number'),
            'description': 'Employee ID will be auto-generated (EMP001, EMP002, etc.). Enter all information manually.'
        }),
        ('Office Assignment', {
            'fields': ('office_name', 'office_place'),
            'description': 'Enter office details manually'
        }),
        ('Booth Assignment', {
            'fields': ('booth_number', 'booth_name', 'building_name', 'booth_duration'),
            'description': 'Enter booth details manually'
        }),
        ('Ward Information', {
            'fields': ('ward_number', 'ward_name'),
            'description': 'Enter ward details manually'
        }),
        ('Authentication (Optional)', {
            'fields': ('user',),
            'description': 'Optional: Link to user account for mobile app access. Only set by admin.',
            'classes': ('collapse',)  # Collapsed by default
        }),
    )
    
    readonly_fields = ['emp_id']  # Make emp_id read-only since it's auto-generated
    
    def get_readonly_fields(self, request, obj=None):
        # If editing existing employee, show emp_id as readonly
        if obj:
            return self.readonly_fields + ['emp_id']
        # If creating new employee, don't show emp_id field at all
        return self.readonly_fields


@admin.register(LocationUpdate)
class LocationUpdateAdmin(admin.ModelAdmin):
    list_display = ['employee', 'serial_number', 'place_name', 'timestamp', 'has_image_display']
    list_filter = ['timestamp', 'employee']
    search_fields = ['employee__emp_id', 'employee__name', 'place_name']
    readonly_fields = ['timestamp', 'serial_number', 'employee', 'latitude', 'longitude', 'place_name', 'image_url']
    
    def has_add_permission(self, request):
        # Disable manual addition of location updates - only from mobile app
        return False
    
    def has_change_permission(self, request, obj=None):
        # Make location updates read-only - only from mobile app
        return False
    
    def has_delete_permission(self, request, obj=None):
        # Allow deletion for cleanup purposes
        return True
    
    def has_image_display(self, obj):
        return bool(obj.image_url)
    has_image_display.boolean = True
    has_image_display.short_description = 'Has Image URL'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('employee')
    
    class Meta:
        verbose_name = "Location Update (Mobile App Only)"
        verbose_name_plural = "Location Updates (Mobile App Only)"