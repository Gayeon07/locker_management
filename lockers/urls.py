from django.urls import path
from . import views

urlpatterns = [
    path('', views.login_view, name='login'),
    path('index/', views.index_view, name='index'),
    #path('floor1/', views.floor1_view, name='floor1'),
    #path('floor2/', views.floor2_view, name='floor2'),
    path('notifications/', views.notifications_view, name='notifications'),
]
