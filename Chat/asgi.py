import os
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application
from Site.middleware import TokenAuthMiddlewareStack
from django.urls import re_path

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Chat.settings")
django_asgi_app = get_asgi_application()

def get_websocket_urlpatterns():
    from Site.consumers import ChatConsumer
    return [
        re_path(r"socket-server/(?P<user_id>\w+)/$", ChatConsumer.as_asgi()),
    ]

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(
        TokenAuthMiddlewareStack(
            URLRouter(get_websocket_urlpatterns())
        )
    ),
})
