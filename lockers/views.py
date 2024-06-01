# views.py

from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required

def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            request.session['username'] = username
            return redirect('index')
        else:
            return render(request, 'lockers/login.html', {'error': 'Invalid credentials'})
    return render(request, 'lockers/login.html')

@login_required
def index_view(request):
    username = request.session.get('username', request.user.username)
    return render(request, 'lockers/index.html', {'username': username})

@login_required
def notifications_view(request):
    return render(request, 'lockers/notifications.html')

# 알림 전송 기능 제거
# def send_notification(request):
#    if request.method == 'POST':
#        recipient_id = request.POST.get('recipient_id')
#        message = request.POST.get('message')
#        # 로컬 스토리지와 상호 작용하는 코드로 대체
#        return JsonResponse({'status': 'success'})
