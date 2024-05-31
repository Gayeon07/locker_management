from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from .models import Locker

from django.contrib.auth.models import User
from django.http import JsonResponse

from .models import Locker, Notification 

def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('index')
        else:
            return render(request, 'lockers/login.html', {'error': 'Invalid credentials'})
    return render(request, 'lockers/login.html')

@login_required
def index_view(request):
    lockers = Locker.objects.all()
    return render(request, 'lockers/index.html', {'lockers': lockers, 'username': request.user.username})

@login_required
def notifications_view(request):
    # 알림 로직을 여기에 추가할 수 있습니다.
    return render(request, 'lockers/notifications.html')


@login_required
def send_notification(request):
    if request.method == 'POST':
        recipient_id = request.POST.get('recipient_id')
        message = request.POST.get('message')
        recipient = User.objects.get(id=recipient_id)
        Notification.objects.create(recipient=recipient, message=message)
        return JsonResponse({'status': 'success'})

@login_required
def notifications_view(request):
    notifications = Notification.objects.filter(recipient=request.user).order_by('-created_at')
    return render(request, 'lockers/notifications.html', {'notifications': notifications})