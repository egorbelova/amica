# amica/asgi.py
import os

from ws.routing import application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "amica.settings")
