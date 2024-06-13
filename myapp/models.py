from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Task(models.Model):
    title = models.CharField(max_length=255)
    completed = models.BooleanField(default=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField(null=True, blank=True)
    reminder_time = models.DateTimeField(null=True, blank=True)
    repeat = models.CharField(max_length=255, blank=True)
    repeat_interval = models.CharField(max_length=255, blank=True)
    text = models.TextField(blank=True)
    due_date_text = models.CharField(max_length=255, blank=True)
    reminder_time_text = models.CharField(max_length=255, blank=True)
    mentions = models.CharField(max_length=255, blank=True)
    repeat_text = models.CharField(max_length=255, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    star = models.BooleanField(default=False)
    file = models.FileField(upload_to='tasks/files/', null=True, blank=True)
    category = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return self.title

from django.contrib.auth.models import User
from django.db import models

# Добавьте поле к модели User
User.add_to_class('is_google_account', models.BooleanField(default=False))

class PasswordResetCode(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='password_reset_code')
    code = models.CharField(max_length=6, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Password reset code for {self.user.username}"
    

from django.db import models
from django.contrib.auth.models import User


class TelegramBot(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    telegram_chat_id = models.BigIntegerField(unique=True, null=True, blank=True)
    subscribed = models.BooleanField(default=True)
    telegram_username = models.CharField(max_length=255, unique=True, null=True, blank=True)

    def __str__(self):
        return f'{self.user.username} - {self.telegram_chat_id}'

from telegram import Bot
from django.dispatch import receiver
from django.db.models.signals import post_save
class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('web', 'Web'),
        ('telegram', 'Telegram'),
    ]
    message = models.TextField()
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    task = models.ForeignKey('Task', on_delete=models.CASCADE)


@receiver(post_save, sender=Notification)
def notify_telegram(sender, instance, created, **kwargs):
    if created and instance.notification_type == 'web':
        instance.send_telegram_notification()