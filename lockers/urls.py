from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('floor1/', views.floor1_view, name='floor1'),
    path('floor2/', views.floor2_view, name='floor2'),
    path('notifications/', views.notifications_view, name='notifications'),
]
