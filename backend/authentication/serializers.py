from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import CustomUser


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                if user.is_active:
                    data['user'] = user
                    return data
                else:
                    raise serializers.ValidationError('User account is disabled.')
            else:
                raise serializers.ValidationError('Invalid credentials.')
        else:
            raise serializers.ValidationError('Must include username and password.')


class MobileLoginSerializer(serializers.Serializer):
    mobile_number = serializers.CharField(max_length=15)

    def validate(self, data):
        mobile_number = data.get('mobile_number')
        
        if mobile_number:
            try:
                user = CustomUser.objects.get(mobile_number=mobile_number)
                if user.is_active:
                    data['user'] = user
                    return data
                else:
                    raise serializers.ValidationError('User account is disabled.')
            except CustomUser.DoesNotExist:
                raise serializers.ValidationError('Mobile number not found.')
        else:
            raise serializers.ValidationError('Mobile number is required.')


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'mobile_number', 'role', 'first_name', 'last_name']