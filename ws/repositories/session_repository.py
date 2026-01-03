# ws/repositories/session_repository.py
import logging

from channels.db import database_sync_to_async
from django.utils import timezone

from apps.accounts.models.models import ActiveSession

logger = logging.getLogger(__name__)


class SessionRepository:
    @staticmethod
    @database_sync_to_async
    def is_active(jti: str) -> bool:
        try:
            session = ActiveSession.objects.get(jti=jti)
            if session.expires_at is None:
                return True
            return session.expires_at > timezone.now()
        except ActiveSession.DoesNotExist:
            return False
        except Exception as e:
            logger.error(f"Error in SessionRepository.is_active(jti={jti}): {e}")
            return False
