from django.urls import path
from . import views

urlpatterns = [
    path('', views.EmployeeListView.as_view(), name='employee_list'),
    path('wards/', views.ward_list, name='ward_list'),
    path('stats/dashboard/', views.dashboard_stats, name='dashboard_stats'),
    path('mobile/<str:mobile_number>/', views.employee_by_mobile, name='employee_by_mobile'),
    path('location-updates/create/', views.LocationUpdateCreateView.as_view(), name='create_location_update'),
    path('<str:emp_id>/', views.EmployeeDetailView.as_view(), name='employee_detail'),
    path('<str:emp_id>/location-updates/', views.LocationUpdateListView.as_view(), name='location_updates'),
]