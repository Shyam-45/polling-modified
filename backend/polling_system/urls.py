"""
URL configuration for polling_system project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.shortcuts import redirect

def api_health_check(request):
    """Simple health check endpoint"""
    return JsonResponse({
        'status': 'ok',
        'message': 'API is running',
        'debug': settings.DEBUG
    })

def redirect_to_admin(request):
    """Redirect root URL to admin panel"""
    return redirect('/admin/')

urlpatterns = [
    path('', redirect_to_admin, name='redirect_to_admin'),
    path('admin/', admin.site.urls),
    path('api/health/', api_health_check, name='health_check'),
    path('api/auth/', include('authentication.urls')),
    path('api/employees/', include('employees.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)