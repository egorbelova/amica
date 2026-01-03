# ws/services/chat_service.py
from django.utils import timezone

from apps.Site.serializers import MessageSerializer

from ..repositories.chat_repository import ChatRepository
from ..repositories.session_repository import SessionRepository


class ChatService:
    @staticmethod
    async def send_message(chat_id: int, user, content: str, session_jti: str):
        # 1. Проверяем сессию
        if not await SessionRepository.is_active(session_jti):
            raise ValueError("Session inactive")

        # 2. Сохраняем сообщение
        message = await ChatRepository.create_message(chat_id, user, content)
        if not message:
            raise ValueError("Failed to create message")

        # 3. Сериализуем
        serialized = MessageSerializer(message, context={"user_id": user.id}).data

        # 4. Возвращаем payload для broadcast
        return {
            "chat_id": chat_id,
            "message": serialized,
            "user_ids": await ChatRepository.get_user_ids(chat_id),
        }
