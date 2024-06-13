from django.shortcuts import redirect, render
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import HttpResponseRedirect
from django.http import JsonResponse
from django.contrib import messages
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from requests_oauthlib import OAuth2Session
from datetime import datetime, timedelta
from django.conf import settings
from asgiref.sync import sync_to_async, async_to_sync
from telegram import Bot
import requests
from .models import Task
from django.contrib.auth.decorators import login_required
import datetime
from django.utils import timezone
import logging
import json
from django.utils import timezone
from .serializers import TaskSerializer
from django.views.decorators.csrf import csrf_exempt
import os
from django.urls import reverse
logger = logging.getLogger(__name__)
from .forms import TaskForm
from .models import Task
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.contrib.auth.hashers import make_password

CLIENT_ID = '119541109841-lv2sckeea274dn85qkjpvsvndbdfpcjv.apps.googleusercontent.com'
CLIENT_SECRET = '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'
REDIRECT_URI = 'http://127.0.0.1:8000/oauth2callback/'  


AUTHORIZATION_BASE_URL = 'https://accounts.google.com/o/oauth2/auth'

TOKEN_URL = 'https://accounts.google.com/o/oauth2/token'

SCOPE = ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile']

def google_login(request):
    if request.user.is_authenticated:
        return redirect('tasks_home')

    google = OAuth2Session(CLIENT_ID, redirect_uri=REDIRECT_URI, scope=SCOPE)
    authorization_url, state = google.authorization_url(AUTHORIZATION_BASE_URL, access_type="offline", prompt="select_account")
    request.session['oauth_state'] = state
    return redirect(authorization_url)

def oauth2callback(request):
    if 'error' in request.GET:
        return HttpResponseRedirect('/')

    if request.user.is_authenticated:
        return HttpResponseRedirect('/')

    state = request.session.get('oauth_state')
    google = OAuth2Session(CLIENT_ID, state=state, redirect_uri=REDIRECT_URI)
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
    try:
        token = google.fetch_token(TOKEN_URL, client_secret=CLIENT_SECRET, authorization_response=request.build_absolute_uri())
    except Exception as e:
        return HttpResponseRedirect('/')

    try:
        userinfo = google.get('https://www.googleapis.com/oauth2/v1/userinfo').json()
    except Exception as e:
        return HttpResponseRedirect('/')

    user, created = User.objects.get_or_create(username=userinfo['email'], defaults={
        'first_name': userinfo.get('given_name', ''),
        'last_name': userinfo.get('family_name', ''),
        'email': userinfo['email'],
        'is_google_account': True
    })

    if created:
        user.set_password(User.objects.make_random_password())
        user.save()

    login(request, user, backend='django.contrib.auth.backends.ModelBackend')
    return HttpResponseRedirect('/')


def register(request):
    if request.method == 'POST':
        username = request.POST.get('name')
        email = request.POST.get('email')
        password = request.POST.get('password')
        password_confirm = request.POST.get('password-confirm')

        if not username or not email or not password or not password_confirm:
            if not username:
                messages.error(request, "Поле 'Логин' не может быть пустым.")
            if not email:
                messages.error(request, "Поле 'Почта' не может быть пустым.")
            if not password:
                messages.error(request, "Поле 'Пароль' не может быть пустым.")
            if not password_confirm:
                messages.error(request, "Поле 'Повторный пароль' не может быть пустым.")
            return redirect('register')

        if password != password_confirm:
            messages.error(request, "Пароли не совпадают.")
            return redirect('register')

        if User.objects.filter(username=username).exists():
            messages.error(request, "Этот логин уже используется.")
            return render(request, 'registration/register.html', {'username': username, 'email': email})

        if User.objects.filter(email=email).exists():
            messages.error(request, "Email уже используется.")
            return redirect('register')

        user = User.objects.create_user(username=username, email=email, password=password)
        user.save()
        login(request, user)
        messages.success(request, "Регистрация прошла успешно!")
        return redirect('tasks_home')
    else:
        return render(request, 'registration/register.html')

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({'redirect': reverse('tasks_home')})
        else:
            return JsonResponse({'error': 'Неправильные учетные данные. Проверьте правильность логина или пароля.'}, status=401)
    else:
        return render(request, 'registration/login.html')

def check_email(request):
    email = request.GET.get('email', None)
    data = {'is_taken': User.objects.filter(email__iexact=email).exists()}
    return JsonResponse(data)

def check_username(request):
    username = request.GET.get('username', None)
    data = {'is_taken': User.objects.filter(username__iexact=username).exists()}
    return JsonResponse(data)
def home(request):
    return render(request, 'myapp/base.html')
def logout_view(request):
    logout(request)
    return render(request, 'registration/login.html')
@login_required(login_url='/login/')  
def index(request):
    return render(request, 'myapp/base.html')

from django.utils import timezone

def parse_date(date_str):
    if date_str.lower() == "сегодня":
        return timezone.now().date()
    elif date_str.lower() == "завтра":
        return timezone.now().date() + datetime.timedelta(days=1)
    elif date_str.lower() == "следующая неделя":
        return timezone.now().date() + datetime.timedelta(weeks=1)
    try:
        return datetime.datetime.strptime(date_str, "%Y-%m-%d %H:%M")
    except ValueError:
        try:
            return datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            try:
                return datetime.datetime.strptime(date_str, "%H:%M").time()
            except ValueError:
                return None
@login_required
@csrf_exempt
def add_task(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        task = Task.objects.create(
            title=data['title'],
            due_date_text=data['due_date_text'],
            reminder_time_text=data['reminder_time_text'],
            repeat_text=data['repeat_text'],
            user=request.user
        )

        # Создаем уведомление, если задано напоминание
        if data['reminder_time_text']:
            notification = Notification.objects.create(
                message=f'Уведомление о задаче "{task.title}"',
                notification_type='reminder',
                is_read=False,
                created_at=timezone.now(),
                sent_at=timezone.now(),  # или установить нужное время
                task=task,
                user=request.user
            )
            # Отправляем уведомление о создании задачи
            send_telegram_notification(request.user, f'Напоминание создано для задачи "{task.title}"')

        return JsonResponse({
            'success': True,
            'id': task.id,
            'title': task.title,
            'due_date_text': task.due_date_text,
            'reminder_time_text': task.reminder_time_text,
            'repeat_text': task.repeat_text
        })

    return JsonResponse({'success': False, 'error': 'Invalid request method'})



@csrf_exempt
def toggle_task(request, task_id):
    if request.method == 'POST':
        data = json.loads(request.body)
        task = Task.objects.get(id=task_id, user=request.user)
        task.completed = data['completed']
        task.save()
        return JsonResponse({'success': True})
    return JsonResponse({'success': False, 'error': 'Invalid request method'})

@csrf_exempt
@login_required
def get_tasks(request):
    if request.method == 'GET':
        tasks = Task.objects.filter(user=request.user)
        tasks_data = [{
            'id': task.id,
            'title': task.title,
            'due_date_text': task.due_date_text,
            'reminder_time_text': task.reminder_time_text,
            'repeat_text': task.repeat_text,
            'completed': task.completed,
            'star': task.star,
            'text': task.text  # Добавляем поле text для заметок
        } for task in tasks]

        return JsonResponse(tasks_data, safe=False)
    
    return JsonResponse({'success': False, 'error': 'Invalid request method'})

@login_required
@csrf_exempt
def update_task(request, task_id):
    if request.method == 'POST':
        try:
            task = Task.objects.get(id=task_id)
            data = json.loads(request.body)
            task.title = data.get('title', task.title)
            task.text = data.get('text', task.text)
            task.save()
            return JsonResponse({'success': True})
        except Task.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Task not found'})
    return JsonResponse({'success': False, 'error': 'Invalid request'})

@login_required
@csrf_exempt
def delete_task(request, task_id):
    if request.method == 'DELETE':
        try:
            task = Task.objects.get(id=task_id)
            task.delete()
            return JsonResponse({'success': True})
        except Task.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Task not found'})
    return JsonResponse({'success': False, 'error': 'Invalid request'})

from .models import PasswordResetCode

def password_reset_request(request):
    message = None
    if request.method == "POST":
        email = request.POST.get('email')
        if not email:
            message = 'Поле Email не может быть пустым.'
        else:
            try:
                user = User.objects.get(email=email)
                if user.is_google_account:
                    message = 'Попробуйте войти через Google.'
                else:
                    code = '999999'
                    PasswordResetCode.objects.update_or_create(user=user, defaults={'code': code})
                    return redirect('password_reset_confirm')  # Замените 'password_reset_confirm' на имя вашего URL для страницы ввода кода
            except User.DoesNotExist:
                message = 'Пользователь с такой почтой не найден.'
    return render(request, 'registration/password_reset.html', {'message': message})
def password_reset_confirm(request):
    message = None
    if request.method == "POST":
        code = request.POST.get('code')
        new_password1 = request.POST.get('new_password1')
        new_password2 = request.POST.get('new_password2')
        
        if new_password1 != new_password2:
            message = 'Пароли не совпадают.'
        else:
            try:
                reset_code = PasswordResetCode.objects.get(code=code)
                user = reset_code.user
                if user.is_google_account:
                    message = 'Попробуйте войти через Google.'
                else:
                    user.password = make_password(new_password1)
                    user.save()
                    reset_code.delete()
                    return redirect('login')  # Замените 'login' на имя вашего URL для страницы авторизации
            except PasswordResetCode.DoesNotExist:
                message = 'Неверный код.'
    return render(request, 'registration/password_reset_confirm.html', {'message': message})
@login_required
def change_password(request):
    if request.method == 'POST':
        if request.content_type == 'application/json':
            data = json.loads(request.body.decode('utf-8'))
            if data.get('check_only'):
                password = data.get('password')
                password_exists = request.user.check_password(password)
                return JsonResponse({'exists': password_exists})

        new_password1 = request.POST.get('new_password1')
        new_password2 = request.POST.get('new_password2')

        if new_password1 and new_password2:
            if len(new_password1) < 6 or len(new_password2) < 6:
                return JsonResponse({'success': False, 'message': "Пароль должен содержать не менее 6 символов."})
            if new_password1 != new_password2:
                return JsonResponse({'success': False, 'message': "Пароли не совпадают."})
            elif any(char in "абвгдеёжзийклмнопрстуфхцчшщъыьэюя" for char in new_password1):
                return JsonResponse({'success': False, 'message': "Пароль не должен содержать русские символы."})
            elif request.user.check_password(new_password1):
                return JsonResponse({'success': False, 'message': "Такой пароль уже был установлен."})
            else:
                request.user.password = make_password(new_password1)
                request.user.save()
                return JsonResponse({'success': True, 'message': "Пароль успешно изменён."})
        else:
            return JsonResponse({'success': False, 'message': "Пароль не может быть пустым."})

    return render(request, 'registration/change_password.html')
from myapp.models import TelegramBot
@login_required
@csrf_exempt
def save_telegram_nick(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        telegram_nick = data.get('telegram_nick')

        if not telegram_nick or not telegram_nick.startswith('@'):
            return JsonResponse({'success': False, 'error': 'Invalid Telegram nick'})

        telegram_bot, created = TelegramBot.objects.update_or_create(
            user=request.user,
            defaults={'telegram_username': telegram_nick}
        )

        return JsonResponse({'success': True})

    return JsonResponse({'success': False, 'error': 'Invalid request method'})

@csrf_exempt
@login_required
def delete_telegram_nick(request):
    if request.method == 'POST':
        telegram_bot = TelegramBot.objects.filter(user=request.user).first()
        if telegram_bot:
            telegram_bot.delete()
            return JsonResponse({'success': True})
        return JsonResponse({'success': False, 'error': 'No Telegram nick found for user'})

    return JsonResponse({'success': False, 'error': 'Invalid request method'})

def get_telegram_status(request):
    try:
        telegram_bot = TelegramBot.objects.get(user=request.user)
        is_subscribed = telegram_bot.subscribed
    except TelegramBot.DoesNotExist:
        is_subscribed = False
    return JsonResponse({'isSubscribed': is_subscribed})
@login_required
@csrf_exempt
def set_theme_color(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        theme_color = data.get('color')
        if theme_color:
            request.session['theme_color'] = theme_color
            return JsonResponse({'success': True})
        return JsonResponse({'success': False, 'error': 'No color provided'})
    return JsonResponse({'success': False, 'error': 'Invalid request method'})

@login_required
@csrf_exempt
def get_theme_color(request):
    theme_color = request.session.get('theme_color', None)
    if theme_color:
        return JsonResponse({'color': theme_color})
    return JsonResponse({'color': None})
@csrf_exempt
@login_required
def toggle_star(request, task_id):
    if request.method == 'POST':
        try:
            task = Task.objects.get(id=task_id, user=request.user)
            task.star = not task.star
            task.save()
            return JsonResponse({'success': True, 'star': task.star})
        except Task.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Task not found'})
    return JsonResponse({'success': False, 'error': 'Invalid request method'})
from .models import Notification
@login_required
def get_notifications(request):
    notifications = Notification.objects.filter(user=request.user, is_read=False)
    response_data = [{
        'id': notification.id,
        'message': notification.message,
        'notification_type': notification.notification_type,
        'task_id': notification.task_id,
        'created_at': notification.created_at.strftime('%Y-%m-%d %H:%M:%S')
    } for notification in notifications]

    # Отправка уведомления в Telegram
    for notification in notifications:
        send_telegram_notification(request.user, notification.message)

    return JsonResponse(response_data, safe=False)

@login_required
def mark_notification_as_read(request, notification_id):
    try:
        notification = Notification.objects.get(id=notification_id, user=request.user)
        notification.is_read = True
        notification.save()
        return JsonResponse({'success': True})
    except Notification.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Notification not found'})
def send_telegram_notification(user, message):
    try:
        telegram_bot = TelegramBot.objects.get(user=user)
        if telegram_bot.telegram_chat_id:
            bot = Bot(token=settings.TELEGRAM_BOT_TOKEN)
            async_to_sync(bot.send_message)(chat_id=telegram_bot.telegram_chat_id, text=message)
            return True
    except TelegramBot.DoesNotExist:
        pass
    except Exception as e:
        logger.error(f"Error sending telegram notification: {e}")
    return False