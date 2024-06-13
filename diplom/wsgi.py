import os
import threading
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'diplom.settings')

application = get_wsgi_application()

# Start the Telegram bot in a separate thread
from myapp.telegram_bot import start_bot_thread
threading.Thread(target=start_bot_thread, daemon=True).start()
