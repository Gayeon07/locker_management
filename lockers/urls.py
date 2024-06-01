from django.urls import path
from . import views

urlpatterns = [
    path('', views.login_view, name='login'),
    path('index/', views.index_view, name='index'),
    path('notifications/', views.notifications_view, name='notifications'),
]
