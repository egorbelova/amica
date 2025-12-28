from datetime import timedelta

from django.utils import timezone
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken, TokenError

from apps.accounts.models import ActiveSession


class BearerJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        result = super().authenticate(request)
        if not result:
            return None

        user, token = result
        refresh_token_str = request.COOKIES.get("refresh_token")

        if refresh_token_str:
            try:
                jti = RefreshToken(refresh_token_str).payload.get("jti")
                if not jti:
                    raise AuthenticationFailed("Invalid refresh token")

                try:
                    session = ActiveSession.objects.get(user=user, jti=jti)
                except ActiveSession.DoesNotExist:
                    raise AuthenticationFailed("Session revoked")

                now = timezone.now()
                if session.expires_at <= now or session.last_active <= now - timedelta(
                    minutes=30
                ):
                    raise AuthenticationFailed("Session revoked")

                session.last_active = now
                session.save(update_fields=["last_active"])

            except TokenError:
                raise AuthenticationFailed("Invalid refresh token")

        return result
