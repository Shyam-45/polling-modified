from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from datetime import datetime, date
from .models import Employee, LocationUpdate
from .serializers import (
    EmployeeSerializer, LocationUpdateSerializer, 
    LocationUpdateCreateSerializer
)


class EmployeePagination(PageNumberPagination):
    page_size = 60
    page_size_query_param = 'page_size'
    max_page_size = 100


class EmployeeListView(generics.ListAPIView):
    serializer_class = EmployeeSerializer
    pagination_class = EmployeePagination
    
    def get_queryset(self):
        queryset = Employee.objects.all().order_by('emp_id')
        
        # Search by emp_id or name
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(emp_id__icontains=search) | 
                Q(name__icontains=search)
            )
        
        # Filter by ward
        ward = self.request.query_params.get('ward', None)
        if ward:
            queryset = queryset.filter(ward_number=ward)
        
        return queryset


class EmployeeDetailView(generics.RetrieveAPIView):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    lookup_field = 'emp_id'


class LocationUpdateListView(generics.ListAPIView):
    serializer_class = LocationUpdateSerializer
    
    def get_queryset(self):
        emp_id = self.kwargs['emp_id']
        queryset = LocationUpdate.objects.filter(employee__emp_id=emp_id)
        
        # Filter by date
        date_filter = self.request.query_params.get('date', None)
        if date_filter:
            try:
                filter_date = datetime.strptime(date_filter, '%Y-%m-%d').date()
                queryset = queryset.filter(timestamp__date=filter_date)
            except ValueError:
                pass
        
        return queryset


class LocationUpdateCreateView(generics.CreateAPIView):
    serializer_class = LocationUpdateCreateSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        try:
            # Try to find employee by user first
            if hasattr(self.request.user, 'employee'):
                employee = self.request.user.employee
            else:
                # If no direct relationship, try to find by mobile number
                mobile_number = getattr(self.request.user, 'username', None)
                if mobile_number:
                    employee = Employee.objects.get(mobile_number=mobile_number)
                else:
                    raise Employee.DoesNotExist
            
            context['employee'] = employee
        except Employee.DoesNotExist:
            pass
        return context


@api_view(['GET'])
def ward_list(request):
    """Get list of unique wards from employees"""
    try:
        # Get unique ward numbers and names from employees
        wards = Employee.objects.filter(
            ward_number__isnull=False
        ).exclude(
            ward_number__exact=''
        ).values('ward_number', 'ward_name').distinct().order_by('ward_number')
        
        # Convert to list format
        ward_data = []
        for ward in wards:
            ward_data.append({
                'ward_number': ward['ward_number'],
                'ward_name': ward['ward_name'] or ward['ward_number']
            })
        
        return Response(ward_data)
    except Exception as e:
        return Response(
            {'error': f'Failed to fetch wards: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def employee_by_mobile(request, mobile_number):
    """Get employee details by mobile number"""
    try:
        employee = Employee.objects.get(mobile_number=mobile_number)
        serializer = EmployeeSerializer(employee)
        return Response(serializer.data)
    except Employee.DoesNotExist:
        return Response(
            {'error': 'Employee not found with this mobile number'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to fetch employee: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def dashboard_stats(request):
    """Get dashboard statistics"""
    try:
        total_employees = Employee.objects.count()
        active_booths = Employee.objects.filter(
            booth_number__isnull=False
        ).exclude(
            booth_number__exact=''
        ).values('booth_number').distinct().count()
        
        unique_wards = Employee.objects.filter(
            ward_number__isnull=False
        ).exclude(
            ward_number__exact=''
        ).values('ward_number').distinct().count()
        
        return Response({
            'total_employees': total_employees,
            'active_booths': active_booths,
            'unique_wards': unique_wards,
            'on_duty': total_employees  # Simplified for now
        })
    except Exception as e:
        return Response(
            {'error': f'Failed to fetch dashboard stats: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )