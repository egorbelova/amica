from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import RefreshToken, TokenError

from apps.accounts.models.models import ActiveSession


class TokenAuthMiddlewareStack(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        User = get_user_model()

        @database_sync_to_async
        def get_user(user_id):
            try:
                return User.objects.get(id=user_id)
            except User.DoesNotExist:
                return AnonymousUser()

        cookies = {}
        for k, v in scope.get("headers", []):
            if k == b"cookie":
                raw_cookie = v.decode()
                for pair in raw_cookie.split(";"):
                    if "=" in pair:
                        key, value = pair.strip().split("=", 1)
                        cookies[key] = value

        refresh_token_str = cookies.get("refresh_token")

        if refresh_token_str:
            try:
                from functools import partial

                refresh_token = await database_sync_to_async(
                    partial(RefreshToken, refresh_token_str)
                )()
                session = await database_sync_to_async(
                    lambda: ActiveSession.objects.filter(
                        jti=str(refresh_token["jti"])
                    ).first()
                )()

                if session and session.is_active():
                    user_id = refresh_token["user_id"]
                    scope["user"] = await get_user(user_id)
                else:
                    scope["user"] = AnonymousUser()

            except TokenError:
                scope["user"] = AnonymousUser()

        else:
            scope["user"] = AnonymousUser()

        return await super().__call__(scope, receive, send)
