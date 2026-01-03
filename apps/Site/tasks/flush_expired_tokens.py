# apps/Site/tasks/flush_expired_tokens.py
from celery import shared_task
from django.utils import timezone

from apps.accounts.models.models import ActiveSession


@shared_task
def flush_expired_token(session_id):
    try:
        session = ActiveSession.objects.get(id=session_id)
        now = timezone.now()

        if session.expires_at > now:
            flush_expired_token.apply_async(args=[session.id], eta=session.expires_at)
            return f"Session {session_id} still valid, rescheduled for {session.expires_at}"

        session.revoke()
        return f"Session {session_id} deleted due to expired refresh token"

    except ActiveSession.DoesNotExist:
        return f"Session {session_id} already deleted"


from django.utils import timezone


@shared_task
def flush_expired_tokens_daily():
    now = timezone.now()
    expired = ActiveSession.objects.filter(expires_at__lte=now)
    count = expired.count()
    expired.delete()
    return f"Deleted {count} expired sessions"
