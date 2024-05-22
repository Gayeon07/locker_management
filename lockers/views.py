from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required

def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('index')  # 로그인 후 index.html로 리디렉션
        else:
            return render(request, 'lockers/login.html', {'error': 'Invalid credentials'})
    return render(request, 'lockers/login.html')

@login_required
def index_view(request):
    return render(request, 'lockers/index.html')

@login_required
def notifications_view(request):
    # 알림 로직 추가
    return render(request, 'lockers/notifications.html')
