# views.py
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required

#basic user login functionality using Django views.
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

#To restrict access to the index_view to logged-in users only
@login_required
def index_view(request):
    username = request.session.get('username', request.user.username)
    return render(request, 'lockers/index.html', {'username': username})

#To restrict access to the notifications_view to logged-in users only
@login_required
def notifications_view(request):
    return render(request, 'lockers/notifications.html')

# send_notification by MySQL 
# we use code by localStorage
# def send_notification(request):
#    if request.method == 'POST':
#        recipient_id = request.POST.get('recipient_id')
#        message = request.POST.get('message')
#        return JsonResponse({'status': 'success'})
