# ws/repositories/chat_repository.py
from channels.db import database_sync_to_async
from django.db.models import Prefetch

from apps.Site.models import Chat, Message, MessageReaction, MessageRecipient


class ChatRepository:
    @staticmethod
    @database_sync_to_async
    def get_user_ids(chat_id: int) -> list[int]:
        chat = Chat.objects.get(id=chat_id)
        return list(chat.users.values_list("id", flat=True))

    @staticmethod
    @database_sync_to_async
    def create_message(chat_id: int, user, content: str) -> Message:
        chat = Chat.objects.get(id=chat_id)
        msg = Message.objects.create(chat=chat, user=user, value=content)
        return ChatRepository._load_full_message(msg.id)

    @staticmethod
    @database_sync_to_async
    def _load_full_message(message_id: int) -> Message:
        return (
            Message.objects.filter(id=message_id)
            .select_related("user", "user__profile", "reply_to")
            .prefetch_related(
                "file",
                Prefetch(
                    "message_reactions",
                    MessageReaction.objects.select_related("user", "user__profile"),
                ),
            )
            .first()
        )
