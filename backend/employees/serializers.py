from rest_framework import serializers
from .models import Employee, LocationUpdate


class EmployeeSerializer(serializers.ModelSerializer):
    employee_details = serializers.CharField(read_only=True)
    contact_details = serializers.CharField(read_only=True)
    office_details = serializers.CharField(read_only=True)
    booth_details = serializers.CharField(read_only=True)
    assignment_summary = serializers.CharField(read_only=True)
    
    class Meta:
        model = Employee
        fields = [
            'id', 'emp_id', 'name', 'designation', 'mobile_number',
            'office_name', 'office_place', 'booth_number', 'booth_name',
            'booth_duration', 'building_name', 'ward_number', 'ward_name',
            'employee_details', 'contact_details', 'office_details', 
            'booth_details', 'assignment_summary'
        ]


class LocationUpdateSerializer(serializers.ModelSerializer):
    emp_id = serializers.CharField(source='employee.emp_id', read_only=True)
    location = serializers.CharField(read_only=True)
    location_summary = serializers.CharField(read_only=True)
    update_details = serializers.CharField(read_only=True)
    has_image = serializers.BooleanField(read_only=True)
    # Use image_url instead of image
    image = serializers.URLField(source='image_url', read_only=True)
    
    class Meta:
        model = LocationUpdate
        fields = [
            'id', 'emp_id', 'serial_number', 'location', 'place_name',
            'timestamp', 'image', 'image_url', 'has_image', 'location_summary', 'update_details'
        ]


class LocationUpdateCreateSerializer(serializers.ModelSerializer):
    # Accept image_url instead of file upload
    image_url = serializers.URLField(required=False, allow_blank=True, help_text="URL link to the uploaded image")
    
    class Meta:
        model = LocationUpdate
        fields = ['latitude', 'longitude', 'place_name', 'image_url']
    
    def create(self, validated_data):
        employee = self.context['employee']
        
        # Get the next serial number for this employee
        last_update = LocationUpdate.objects.filter(employee=employee).first()
        serial_number = (last_update.serial_number + 1) if last_update else 1
        
        validated_data['employee'] = employee
        validated_data['serial_number'] = serial_number
        
        return super().create(validated_data)