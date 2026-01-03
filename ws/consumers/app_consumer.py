import asyncio
import json
import logging

from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async
from django.utils import timezone

from apps.accounts.services.sessions import update_user_session_lifetime
from apps.Site.models import Chat, Message, MessageReaction, MessageRecipient
from apps.Site.serializers import MessageSerializer

from .base_consumer import BaseConsumer

logger = logging.getLogger(__name__)

MAX_CONCURRENT_BROADCASTS = 50


class AppConsumer(BaseConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.chat_users_cache = {}

    async def handle_message(self, data):
        message_type = data.get("type")
        chat_id = data.get("chat_id")

        if (
            message_type in ("chat_message", "message_reaction", "message_viewed")
            and not chat_id
        ):
            return await self.send_json(
                {"type": "error", "message": "chat_id is required"}
            )

        try:
            if message_type == "chat_message":
                await self.handle_chat_message(data, chat_id)
            elif message_type == "message_reaction":
                await self.handle_message_reaction(data)
            elif message_type == "message_viewed":
                await self.handle_message_viewed(data)
            elif message_type == "set_session_lifetime":
                await self.set_session_lifetime(data)
            else:
                logger.warning(f"Unknown message type: {message_type}")
        except Exception as e:
            logger.error(f"Error handling message type '{message_type}': {e}")

    async def handle_chat_message(self, data, chat_id):
        message_content = data.get("data", {}).get("value", "").strip()
        if not message_content:
            return await self.send_json(
                {"type": "error", "message": "Message cannot be empty"}
            )

        if not await self.user_in_chat(chat_id):
            return await self.send_json(
                {"type": "error", "message": "You are not a member of this chat"}
            )

        message = await self.save_message(chat_id, self.user, message_content)
        if not message:
            return await self.send_json(
                {"type": "error", "message": "Failed to save message"}
            )

        serialized = await self.serialize_message(message, self.user)
        await self.broadcast_to_chat_users(
            chat_id, "chat_message", {"chat_id": chat_id, "data": serialized}
        )

    async def handle_message_reaction(self, data):
        message_id = data.get("message_id")
        if not message_id:
            return

        reaction_type = data.get("data", {}).get("reaction_type")

        chat_id = await self.get_message_chat_id(message_id)
        if not chat_id or not await self.user_in_chat(chat_id):
            return

        updated_message = await self.update_message_reaction(
            message_id, self.user, reaction_type
        )
        if not updated_message:
            return

        serialized = await self.serialize_message(updated_message, self.user)
        await self.broadcast_to_chat_users(
            chat_id,
            "message_reaction",
            {"message_id": message_id, "data": serialized},
        )

    async def handle_message_viewed(self, data):
        message_id = data.get("message_id")
        if not message_id:
            return

        chat_id = await self.get_message_chat_id(message_id)
        if not chat_id or not await self.user_in_chat(chat_id):
            return

        await self.mark_message_as_viewed(message_id, self.user)
        payload = {
            "message_id": message_id,
            "user_id": self.user.id,
            "username": self.user.username,
        }
        await self.broadcast_to_chat_users(chat_id, "message_viewed", payload)

    async def set_session_lifetime(self, data):
        days = data.get("days")
        if not days:
            return await self.send_json(
                {"type": "error", "message": "No session_lifetime_days provided"}
            )

        token = self.scope.get("refresh_token")  # Может быть None
        await sync_to_async(update_user_session_lifetime)(
            self.user, days, current_refresh_token=token
        )
        await self.send_json({"type": "session_lifetime_updated", "days": days})

    async def user_in_chat(self, chat_id):
        """Проверяет, состоит ли пользователь в чате"""
        user_ids = await self.get_chat_user_ids(chat_id)
        return self.user.id in user_ids

    @database_sync_to_async
    def get_chat_user_ids(self, chat_id):
        """Кэшируем пользователей чата для соединения"""
        if chat_id in self.chat_users_cache:
            return self.chat_users_cache[chat_id]
        chat = Chat.objects.get(id=chat_id)
        user_ids = list(chat.users.values_list("id", flat=True))
        self.chat_users_cache[chat_id] = user_ids
        return user_ids

    @database_sync_to_async
    def get_message_chat_id(self, message_id):
        try:
            message = Message.objects.get(id=message_id)
            return message.chat.id
        except Message.DoesNotExist:
            return None

    @database_sync_to_async
    def save_message(self, chat_id, user, message_content):
        try:
            chat = Chat.objects.get(id=chat_id)
            message = Message.objects.create(
                chat=chat, user=user, value=message_content
            )
            return (
                Message.objects.filter(id=message.id)
                .select_related("user", "user__profile", "reply_to")
                .prefetch_related("file", "message_reactions")
                .first()
            )
        except Exception as e:
            logger.error(f"Error saving message: {e}")
            return None

    @database_sync_to_async
    def update_message_reaction(self, message_id, user, reaction_type):
        try:
            message = Message.objects.filter(id=message_id).first()
            if not message:
                return None

            if reaction_type is None:
                MessageReaction.objects.filter(message=message, user=user).delete()
            else:
                MessageReaction.objects.update_or_create(
                    message=message,
                    user=user,
                    defaults={"reaction_type": reaction_type},
                )
            return Message.objects.filter(id=message_id).first()
        except Exception as e:
            logger.error(f"Error updating message reaction: {e}")
            return None

    @database_sync_to_async
    def mark_message_as_viewed(self, message_id, user):
        try:
            recipient, _ = MessageRecipient.objects.get_or_create(
                message_id=message_id, user=user
            )
            if not recipient.read_date:
                recipient.read_date = timezone.now()
                recipient.save()
            return True
        except Exception as e:
            logger.error(f"Error marking message as viewed: {e}")
            return False

    @database_sync_to_async
    def serialize_message(self, message, requesting_user):
        serializer = MessageSerializer(message, context={"user_id": requesting_user.id})
        return serializer.data

    async def broadcast_to_chat_users(self, chat_id, event_type, payload):
        user_ids = await self.get_chat_user_ids(chat_id)
        semaphore = asyncio.Semaphore(MAX_CONCURRENT_BROADCASTS)

        async def send_to_user(user_id):
            async with semaphore:
                await self.send_to_user_group(user_id, event_type, **payload)

        await asyncio.gather(*(send_to_user(uid) for uid in user_ids))

    # Методы для обработки событий от channel layer
    async def chat_message(self, event):
        await self.send_json(event)

    async def message_reaction(self, event):
        await self.send_json(event)

    async def message_viewed(self, event):
        await self.send_json(event)

    async def session_created(self, event):
        await self.send_json(event)

    async def session_lifetime_updated(self, event):
        await self.send_json(event)
        
    async def file_uploaded(self, event):
        await self.send_json({
            "type": "file_uploaded",
            "data": event["data"]
        })
