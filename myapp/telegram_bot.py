import asyncio
from telegram import Update, Bot
from telegram.ext import Application, CommandHandler, MessageHandler, filters
from django.core.management.base import BaseCommand
from myapp.models import TelegramBot, User
from asgiref.sync import sync_to_async
import django

django.setup()

async def start(update: Update, context):
    await update.message.reply_text(
        'Привет! Если вы хотите привязать аккаунт, введите ник на сайте в формате @nick'
    )

async def check_username(update: Update, context):
    text = update.message.text
    chat_id = update.message.chat_id
    print(f"Received message: {text}, chat_id: {chat_id}")  # Отладочное сообщение

    if text.startswith('@'):
        user = await sync_to_async(User.objects.filter(telegrambot__telegram_username=text).first)()
        
        if user:
            telegram_user = await sync_to_async(TelegramBot.objects.get)(user=user)
            telegram_user.telegram_chat_id = chat_id
            telegram_user.subscribed = True
            await sync_to_async(telegram_user.save)()
            await update.message.reply_text('Ник совпал. Привязка выполнена успешно. Ожидайте уведомлений.')
        else:
            await update.message.reply_text('Ник не совпадает. Проверьте правильность ввода.')
    else:
        await update.message.reply_text('Ник должен начинаться с @')

def start_bot_thread():
    asyncio.run(start_bot())

async def start_bot():
    application = Application.builder().token("6395922340:AAF2gwxvLsqPwLW4FYz3lrGVBcrmhUUqMqo").build()

    application.add_handler(CommandHandler("start", start))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, check_username))

    await application.initialize()
    await application.start()
    await application.updater.start_polling()

    try:
        await asyncio.Future()
    finally:
        await application.stop()
        await application.shutdown()

class Command(BaseCommand):
    help = 'Run the Telegram bot'

    def handle(self, *args, **kwargs):
        start_bot_thread()
