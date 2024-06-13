
from django.contrib import admin
from django.urls import path, include
from myapp import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('myapp.urls')),  
    path('login/', views.login_view, name='login'),  
    path('register/', views.register, name='register'),
    path('google/login/', views.google_login, name='google_login'),
    path('oauth2callback/', views.oauth2callback, name='oauth2callback'),
    path('logout/', views.logout_view, name='logout'),
    path('check_email/', views.check_email, name='check_email'),
    path('check_username/', views.check_username, name='check_username'),
    path('add-task/', views.add_task, name='add-task'),
    path('get-tasks/', views.get_tasks, name='get-tasks'),
    path('toggle-task/<int:task_id>/', views.toggle_task, name='toggle-task'),
    path('update-task/<int:task_id>/', views.update_task, name='update-task'),
    path('delete-task/<int:task_id>/', views.delete_task, name='delete-task'),
    path('password-reset/', views.password_reset_request, name='password_reset_request'),
    path('password-reset-confirm/', views.password_reset_confirm, name='password_reset_confirm'),
    path('change-password/', views.change_password, name='change_password'),
    path('myapp/', include('myapp.urls')),
    path('set_theme_color/', views.set_theme_color, name='set_theme_color'),
    path('get_theme_color/', views.get_theme_color, name='get_theme_color'),
    path('toggle-star/<int:task_id>/', views.toggle_star, name='toggle_star'),
    path('get-notifications/', views.get_notifications, name='get_notifications'),
    path('mark-notification-as-read/<int:notification_id>/', views.mark_notification_as_read, name='mark_notification_as_read'),
    path('save-telegram-nick/', views.save_telegram_nick, name='save-telegram-nick'),
    path('delete-telegram-nick/', views.delete_telegram_nick, name='delete-telegram-nick'),
    path('get-telegram-status/', views.get_telegram_status, name='get-telegram-status'),
]
