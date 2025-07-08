from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login
from .serializers import LoginSerializer, MobileLoginSerializer, UserSerializer
from employees.models import Employee


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        login(request, user)
        
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data,
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def mobile_login_view(request):
    mobile_number = request.data.get('mobile_number')
    
    if not mobile_number:
        return Response(
            {'error': 'Mobile number is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Find employee by mobile number
        employee = Employee.objects.get(mobile_number=mobile_number)
        
        # Check if employee has a linked user account
        if employee.user:
            user = employee.user
            token, created = Token.objects.get_or_create(user=user)
            login(request, user)
            
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data,
                'employee': {
                    'emp_id': employee.emp_id,
                    'name': employee.name,
                    'mobile_number': employee.mobile_number
                },
                'message': 'Mobile login successful'
            }, status=status.HTTP_200_OK)
        else:
            # Employee exists but no user account - create a temporary session
            return Response({
                'employee': {
                    'emp_id': employee.emp_id,
                    'name': employee.name,
                    'mobile_number': employee.mobile_number
                },
                'message': 'Employee found - limited access (no user account)'
            }, status=status.HTTP_200_OK)
            
    except Employee.DoesNotExist:
        return Response(
            {'error': 'Mobile number not found in employee records'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
def logout_view(request):
    try:
        request.user.auth_token.delete()
    except:
        pass
    
    return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)


@api_view(['GET'])
def user_profile(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)