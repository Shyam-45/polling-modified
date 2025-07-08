from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from employees.models import Ward, Office, Booth, Employee, LocationUpdate
from datetime import datetime, timedelta
import random

User = get_user_model()


class Command(BaseCommand):
    help = 'Populate database with sample data'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')
        
        # Create admin user
        if not User.objects.filter(username='admin').exists():
            admin_user = User.objects.create_user(
                username='admin',
                password='admin123',
                email='admin@example.com',
                role='admin',
                is_staff=True,
                is_superuser=True
            )
            self.stdout.write('Created admin user')
        
        # Create wards
        wards_data = [
            ('W001', 'Ward 1'),
            ('W002', 'Ward 2'),
            ('W003', 'Ward 3'),
            ('W004', 'Ward 4'),
            ('W005', 'Ward 5'),
        ]
        
        for ward_number, ward_name in wards_data:
            ward, created = Ward.objects.get_or_create(
                ward_number=ward_number,
                defaults={'ward_name': ward_name}
            )
            if created:
                self.stdout.write(f'Created ward: {ward}')
        
        # Create offices
        offices_data = [
            ('District Collector Office', 'Central Delhi'),
            ('Municipal Corporation', 'South Delhi'),
            ('Police Station', 'North Delhi'),
            ('IT Department', 'East Delhi'),
        ]
        
        for name, place in offices_data:
            office, created = Office.objects.get_or_create(
                name=name,
                place=place
            )
            if created:
                self.stdout.write(f'Created office: {office}')
        
        # Create booths
        booths_data = [
            ('B001', 'Primary School ABC', 'Government Primary School', 'W001'),
            ('B002', 'Community Hall XYZ', 'Community Center', 'W002'),
            ('B003', 'High School DEF', 'Government High School', 'W001'),
            ('B004', 'Library Building', 'Public Library', 'W003'),
            ('B005', 'College Auditorium', 'Government College', 'W002'),
        ]
        
        for booth_number, booth_name, building_name, ward_number in booths_data:
            ward = Ward.objects.get(ward_number=ward_number)
            booth, created = Booth.objects.get_or_create(
                booth_number=booth_number,
                defaults={
                    'booth_name': booth_name,
                    'building_name': building_name,
                    'ward': ward
                }
            )
            if created:
                self.stdout.write(f'Created booth: {booth}')
        
        # Create employees
        employees_data = [
            ('EMP001', 'Rajesh', 'Kumar', 'polling_officer', '9876543210'),
            ('EMP002', 'Priya', 'Sharma', 'assistant_polling_officer', '9876543211'),
            ('EMP003', 'Mohammed', 'Ali', 'security_officer', '9876543212'),
            ('EMP004', 'Sunita', 'Gupta', 'polling_officer', '9876543213'),
            ('EMP005', 'Amit', 'Patel', 'technical_officer', '9876543214'),
        ]
        
        offices = list(Office.objects.all())
        booths = list(Booth.objects.all())
        
        for i, (emp_id, first_name, last_name, designation, mobile) in enumerate(employees_data):
            if not User.objects.filter(username=emp_id).exists():
                user = User.objects.create_user(
                    username=emp_id,
                    first_name=first_name,
                    last_name=last_name,
                    mobile_number=mobile,
                    role='employee'
                )
                
                employee = Employee.objects.create(
                    user=user,
                    emp_id=emp_id,
                    designation=designation,
                    mobile_number=mobile,
                    office=offices[i % len(offices)],
                    booth=booths[i % len(booths)]
                )
                
                self.stdout.write(f'Created employee: {employee}')
                
                # Create sample location updates
                base_time = datetime.now() - timedelta(days=1)
                for j in range(1, 5):
                    LocationUpdate.objects.create(
                        employee=employee,
                        serial_number=j,
                        latitude=28.6139 + random.uniform(-0.01, 0.01),
                        longitude=77.2090 + random.uniform(-0.01, 0.01),
                        place_name=f"{employee.booth.booth_name}, {employee.office.place}",
                        timestamp=base_time + timedelta(minutes=30*j)
                    )
        
        self.stdout.write(self.style.SUCCESS('Successfully populated database with sample data'))