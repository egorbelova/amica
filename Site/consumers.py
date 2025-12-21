import json
import traceback
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
import logging
from asgiref.sync import sync_to_async

logger = logging.getLogger(__name__)


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            self.user = self.scope["user"]
            print(
                f"User in connect: {self.user} (is_anonymous: {self.user.is_anonymous})"
            )

            if self.user.is_anonymous:
                logger.warning("WebSocket connection rejected: Anonymous user")
                await self.close(code=4001)
                return

            self.user_group_name = f"user_{self.user.id}"

            await self.channel_layer.group_add(self.user_group_name, self.channel_name)

            await self.accept()
            logger.info(
                f"WebSocket connected: {self.channel_name}, User: {self.user.username}, Group: {self.user_group_name}"
            )

            await self.send(
                text_data=json.dumps(
                    {
                        "type": "connection_established",
                        "message": "WebSocket connection established successfully",
                        "user_id": self.user.id,
                        "username": self.user.username,
                    }
                )
            )

        except Exception as e:
            logger.error(f"Connection error: {e}")
            await self.close(code=4002)

    async def disconnect(self, close_code):
        try:
            if hasattr(self, "user_group_name"):
                await self.channel_layer.group_discard(
                    self.user_group_name, self.channel_name
                )
            logger.info(
                f"WebSocket disconnected: {self.channel_name}, User: {getattr(self.user, 'username', 'Anonymous')}, Code: {close_code}"
            )
        except Exception as e:
            logger.error(f"Disconnection error: {e}")

    async def receive(self, text_data):
        try:
            if self.user.is_anonymous:
                await self.send(
                    text_data=json.dumps(
                        {"type": "error", "message": "Authentication required"}
                    )
                )
                return

            data = json.loads(text_data)
            message_type = data.get("type")
            room_id = data.get("room_id")

            logger.info(
                f"Received message from {self.user.username}: {message_type}, Room: {room_id}"
            )

            if message_type == "chat_message":
                await self.handle_chat_message(data, room_id)
            elif message_type == "message_reaction":
                await self.handle_message_reaction(data)
            elif message_type == "message_viewed":
                await self.handle_message_viewed(data)
            elif message_type == "ping":
                await self.send_pong()
            else:
                logger.warning(f"Unknown message type: {message_type}")

        except json.JSONDecodeError:
            logger.error("Invalid JSON received")
            await self.send(
                text_data=json.dumps(
                    {"type": "error", "message": "Invalid JSON format"}
                )
            )
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            traceback.print_exc()

    async def send_pong(self):
        await self.send(text_data=json.dumps({"type": "pong"}))

    async def handle_chat_message(self, data, room_id):
        try:
            message_content = data.get("data", {}).get("value", "").strip()

            if not message_content:
                await self.send(
                    text_data=json.dumps(
                        {"type": "error", "message": "Message cannot be empty"}
                    )
                )
                return

            message = await self.save_message(room_id, self.user, message_content)
            if not message:
                await self.send(
                    text_data=json.dumps(
                        {"type": "error", "message": "Failed to save message"}
                    )
                )
                return

            serialized_message = await self.serialize_message(message, self.user)

            room = await self.get_room_with_users(room_id)
            print(f"Room: {room}")
            print(f"Room name: {room.name}")
            print(f"Room type: {room.get_room_type_display()}")

            user_ids = await self.get_room_user_ids(room_id)
            print(f"Room users: {user_ids}")

            for user_id in user_ids:
                user_group_name = f"user_{user_id}"
                await self.channel_layer.group_send(
                    user_group_name,
                    {
                        "type": "chat_message",
                        "room_id": room_id,
                        "data": serialized_message,
                    },
                )

            print(f"Message sent to {len(user_ids)} users")

        except Exception as e:
            logger.error(f"Error handling chat message: {e}")
            await self.send(
                text_data=json.dumps(
                    {"type": "error", "message": "Failed to send message"}
                )
            )

    async def handle_message_reaction(self, data):
        try:
            message_id = data.get("message_id")
            reaction_data = data.get("data", {})

            updated_message = await self.update_message_reaction(
                message_id, self.user, reaction_data.get("reaction_type")
            )

            if updated_message:
                serialized_message = await self.serialize_message(
                    updated_message, self.user
                )

                room_id = await self.get_message_room_id(message_id)
                if room_id:
                    user_ids = await self.get_room_user_ids(room_id)
                    for user_id in user_ids:
                        user_group_name = f"user_{user_id}"
                        await self.channel_layer.group_send(
                            user_group_name,
                            {
                                "type": "message_reaction",
                                "message_id": message_id,
                                "data": serialized_message,
                            },
                        )

        except Exception as e:
            logger.error(f"Error handling message reaction: {e}")

    async def handle_message_viewed(self, data):
        try:
            message_id = data.get("message_id")
            await self.mark_message_as_viewed(message_id, self.user)

            room_id = await self.get_message_room_id(message_id)
            if room_id:
                user_ids = await self.get_room_user_ids(room_id)
                for user_id in user_ids:
                    user_group_name = f"user_{user_id}"
                    await self.channel_layer.group_send(
                        user_group_name,
                        {
                            "type": "message_viewed",
                            "message_id": message_id,
                            "data": {
                                "message_id": message_id,
                                "user_id": self.user.id,
                                "username": self.user.username,
                            },
                        },
                    )
        except Exception as e:
            logger.error(f"Error handling message viewed: {e}")

    @database_sync_to_async
    def get_room_with_users(self, room_id):
        from .models import Room

        return Room.objects.prefetch_related("users").get(id=room_id)

    @database_sync_to_async
    def get_room_user_ids(self, room_id):
        from .models import Room

        room = Room.objects.get(id=room_id)
        return list(room.users.values_list("id", flat=True))

    @database_sync_to_async
    def get_message_room_id(self, message_id):
        from .models import Message

        try:
            message = Message.objects.get(id=message_id)
            return message.room.id
        except Message.DoesNotExist:
            return None

    @database_sync_to_async
    def save_message(self, room_id, user, message_content):
        try:
            from .models import Room, Message, MessageReaction
            from django.db.models import Prefetch

            room = Room.objects.get(id=room_id)
            message = Message.objects.create(
                room=room, user=user, value=message_content
            )

            message = (
                Message.objects.filter(id=message.id)
                .select_related("user", "user__profile", "reply_to")
                .prefetch_related(
                    "file",
                    Prefetch(
                        "message_reactions",
                        queryset=MessageReaction.objects.select_related(
                            "user", "user__profile"
                        ),
                    ),
                )
                .first()
            )

            return message
        except Exception as e:
            logger.error(f"Error saving message: {e}")
            return None

    @database_sync_to_async
    def update_message_reaction(self, message_id, user, reaction_type):
        try:
            from .models import Message, MessageReaction

            message = (
                Message.objects.filter(id=message_id)
                .select_related("user", "user__profile", "reply_to")
                .prefetch_related(
                    "file", "message_reactions", "message_reactions__user"
                )
                .first()
            )

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

            message = (
                Message.objects.filter(id=message_id)
                .select_related("user", "user__profile", "reply_to")
                .prefetch_related(
                    "file", "message_reactions", "message_reactions__user"
                )
                .first()
            )

            return message
        except Exception as e:
            logger.error(f"Error updating message reaction: {e}")
            return None

    @database_sync_to_async
    def mark_message_as_viewed(self, message_id, user):
        try:
            from .models import MessageRecipient
            from django.utils import timezone

            recipient, created = MessageRecipient.objects.get_or_create(
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
        from .serializers import MessageSerializer

        serializer = MessageSerializer(message, context={"user_id": requesting_user.id})
        return serializer.data

    async def chat_message(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "chat_message",
                    "room_id": event["room_id"],
                    "data": event["data"],
                }
            )
        )

    async def message_reaction(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "message_reaction",
                    "message_id": event["message_id"],
                    "data": event["data"],
                }
            )
        )

    async def message_viewed(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "message_viewed",
                    "message_id": event["message_id"],
                    "data": event["data"],
                }
            )
        )
