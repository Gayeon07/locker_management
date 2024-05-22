from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from .models import Locker

def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('floor1')
        else:
            return render(request, 'lockers/login.html', {'error': 'Invalid credentials'})
    return render(request, 'lockers/login.html')

@login_required
def floor1_view(request):
    lockers = Locker.objects.filter(floor=1)
    return render(request, 'lockers/floor1.html', {'lockers': lockers})

@login_required
def floor2_view(request):
    lockers = Locker.objects.filter(floor=2)
    return render(request, 'lockers/floor2.html', {'lockers': lockers})

@login_required
def notifications_view(request):
    # 알림 로직 추가
    return render(request, 'lockers/notifications.html')
