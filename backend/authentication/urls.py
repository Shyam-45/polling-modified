from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('mobile-login/', views.mobile_login_view, name='mobile_login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.user_profile, name='user_profile'),
]