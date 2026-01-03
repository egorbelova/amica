# apps/Site/tasks/cleanup_blacklist.py

from celery import shared_task
from django.utils import timezone
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken


@shared_task
def cleanup_expired_blacklisted_tokens():
    now = timezone.now()
    expired_tokens = BlacklistedToken.objects.filter(token__expires_at__lte=now)
    count = expired_tokens.count()
    expired_tokens.delete()
    return f"Deleted {count} expired blacklisted token(s)"
