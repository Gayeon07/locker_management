from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import JsonResponse
from .models import Locker, Notification

def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            request.session['username'] = username  # 세션에 사용자 이름 저장
            return redirect('index')
        else:
            return render(request, 'lockers/login.html', {'error': 'Invalid credentials'})
    return render(request, 'lockers/login.html')

@login_required
def index_view(request):
    lockers = Locker.objects.all()
    username = request.session.get('username', request.user.username)  # 세션에서 사용자 이름 가져오기
    return render(request, 'lockers/index.html', {'lockers': lockers, 'username': username})

@login_required
def notifications_view(request):
    notifications = Notification.objects.filter(recipient=request.user).order_by('-created_at')
    return render(request, 'lockers/notifications.html', {'notifications': notifications})

@login_required
def send_notification(request):
    if request.method == 'POST':
        recipient_id = request.POST.get('recipient_id')
        message = request.POST.get('message')
        recipient = User.objects.get(id=recipient_id)
        Notification.objects.create(recipient=recipient, message=message)
        return JsonResponse({'status': 'success'})
