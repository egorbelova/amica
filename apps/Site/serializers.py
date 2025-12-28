from rest_framework import serializers

from apps.accounts.serializers.serializers import UserSerializer
from apps.media_files.models import ImageFile, VideoFile
from apps.media_files.serializers.serializers import (FileSerializer,
                                                      ImageFileSerializer,
                                                      VideoFileSerializer)

from .models import *


class MessageSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    files = serializers.SerializerMethodField()
    reactions_summary = serializers.SerializerMethodField()
    user_reaction = serializers.SerializerMethodField()
    is_own = serializers.SerializerMethodField()
    reply_to_message = serializers.SerializerMethodField()
    view_count = serializers.SerializerMethodField()
    is_viewed = serializers.SerializerMethodField()
    viewers = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            "id",
            "value",
            "date",
            "user",
            "chat",
            "files",
            "reactions_summary",
            "user_reaction",
            "is_own",
            "is_deleted",
            "edit_date",
            "forwarded",
            "reply_to",
            "reply_to_message",
            "view_count",
            "viewed_by",
            "is_viewed",
            "viewers",
        ]
        read_only_fields = fields

    def get_files(self, obj):
        request = self.context.get("request")
        serialized_files = []
        for f in obj.file.all():
            print(f.__class__.__name__, f.id, getattr(f, "width", None))
            if isinstance(f, ImageFile):
                serializer = ImageFileSerializer(f, context={"request": request})
            elif isinstance(f, VideoFile):
                serializer = VideoFileSerializer(f, context={"request": request})
            # elif isinstance(f, AudioFile):
            #     serializer = AudioFileSerializer(f, context={'request': request})
            else:
                serializer = FileSerializer(f, context={"request": request})

            serialized_files.append(serializer.data)

        return serialized_files

    def get_view_count(self, obj):
        return obj.view_count

    def get_is_viewed(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.is_viewed_by_user(request.user)
        return False

    def get_reactions_summary(self, obj):
        from collections import Counter

        reaction_counts = Counter(
            reaction.reaction_type for reaction in obj.message_reactions.all()
        )

        return [
            {
                "type": reaction_type,
                "emoji": dict(MessageReaction.REACTION_TYPES).get(reaction_type, "❓"),
                "count": count,
            }
            for reaction_type, count in reaction_counts.items()
        ]

    def get_user_reaction(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            try:
                return obj.message_reactions.get(user=request.user).reaction_type
            except MessageReaction.DoesNotExist:
                return None
        return None

    def get_is_own(self, obj):
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            return obj.user.id == request.user.id

        user_id = self.context.get("user_id")
        print(user_id, obj.user.id)
        if user_id:
            return obj.user.id == user_id

        return False

    def get_reply_to_message(self, obj):
        if obj.reply_to and not obj.reply_to.is_deleted:
            return {
                "id": obj.reply_to.id,
                "value": obj.reply_to.value,
                "user": {
                    "id": obj.reply_to.user.id,
                    "username": obj.reply_to.user.username,
                },
                "date": obj.reply_to.date.isoformat() if obj.reply_to.date else None,
                "is_deleted": obj.reply_to.is_deleted,
            }
        return None

    def get_viewers(self, obj):
        recipients = obj.recipients.filter(read_date__isnull=False).exclude(
            user=obj.user
        )

        return MessageRecipientSerializer(
            recipients, many=True, context=self.context
        ).data


class MessageRecipientSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = MessageRecipient
        fields = ["user", "read_date"]

    def get_user(self, obj):
        request = self.context.get("request")
        return UserSerializer(obj.user, context={"request": request}).data


class MessageReactionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = MessageReaction
        fields = ["id", "user", "reaction_type", "created_at"]
        read_only_fields = fields


class ChatListSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    other_users = serializers.SerializerMethodField()

    class Meta:
        model = Chat
        fields = [
            "id",
            "name",
            "chat_type",
            "image",
            "last_message",
            "unread_count",
            "other_users",
            "updated_at",
        ]
        read_only_fields = fields

    def get_last_message(self, obj):
        last_msg = obj.last_message
        if last_msg and not last_msg.is_deleted:
            return {
                "content": (
                    last_msg.value[:100] + "..."
                    if last_msg.value and len(last_msg.value) > 100
                    else last_msg.value
                ),
                "date": (
                    last_msg.date.isoformat()
                    if hasattr(last_msg.date, "isoformat")
                    else str(last_msg.date)
                ),
                "user_name": last_msg.user.display_name,
            }
        return None

    def get_unread_count(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return (
                obj.messages.exclude(viewed_by=request.user)
                .exclude(user=request.user)
                .count()
            )
        return 0

    def get_other_users(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            other_users = obj.users.exclude(id=request.user.id)
            return UserSerializer(other_users, many=True).data
        return []


class ChatSerializerMessage(serializers.ModelSerializer):
    # Chat = MessageSerializerChat(many=True, read_only=True)
    users = UserSerializer(many=True, read_only=True)
    # last_message = serializers.Field(source="latest")

    class Meta:
        model = Chat
        fields = ("name", "users", "chat_type", "id", "image")
        read_only_fields = fields


class ChatSerializerContacts(serializers.ModelSerializer):
    users = UserSerializer(many=True, read_only=True)

    class Meta:
        model = Chat
        fields = ("users",)
        read_only_fields = fields


class ContactSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    name = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    primary_media = serializers.SerializerMethodField()
    chat_id = serializers.SerializerMethodField()

    class Meta:
        model = Contact
        fields = [
            "id",
            "user",
            "name",
            "avatar",
            "primary_media",
            "is_blocked",
            "is_favorite",
            "created_at",
            "chat_id",
        ]

    def _get_current_user(self):
        request = self.context.get("request")
        return getattr(request, "user", None)

    def _get_display_cached(self, obj):
        if not hasattr(self, "_display_cache"):
            self._display_cache = {}

        if obj.pk not in self._display_cache:
            self._display_cache[obj.pk] = self._resolve_display(obj)
        return self._display_cache[obj.pk]

    def _resolve_display(self, obj):
        user = obj.user
        profile = getattr(user, "profile", None)

        name = obj.name.strip() if obj.name else user.display_name or user.username

        avatar = (
            obj.display_media.filter(is_primary=True).first()
            or (profile and profile.profile_media.filter(is_primary=True).first())
            or None
        )

        return {"name": name, "avatar": avatar}

    def get_name(self, obj):
        return self._get_display_cached(obj)["name"]

    def get_avatar(self, obj):
        avatar = self._get_display_cached(obj)["avatar"]
        if not avatar:
            return None

        concrete = avatar.concrete()
        if hasattr(concrete, "image_thumbnail_small"):
            return concrete.image_thumbnail_small.url
        elif hasattr(concrete, "image"):
            return concrete.image.url
        elif hasattr(concrete, "video"):
            return concrete.video.url
        return None

    def get_primary_media(self, obj):
        avatar = self._get_display_cached(obj)["avatar"]
        return (
            DisplayMediaSerializer(avatar, context=self.context).data
            if avatar
            else None
        )

    def get_chat_id(self, obj):
        user = self._get_current_user()
        chat = (
            Chat.objects.filter(chat_type=Chat.ChatType.DIALOG)
            .filter(users=user)
            .filter(users=obj.user)
            .distinct()
            .first()
        )
        return chat.id if chat else None


class MessageSerializerChat(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ("viewed", "user")
        read_only_fields = fields


from rest_framework import serializers

from apps.accounts.serializers.serializers import UserSerializer
from apps.media_files.serializers.serializers import DisplayMediaSerializer


class ChatSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    users = UserSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    media = serializers.SerializerMethodField()
    primary_media = serializers.SerializerMethodField()
    info = serializers.SerializerMethodField()

    class Meta:
        model = Chat
        fields = [
            "id",
            "name",
            "users",
            "chat_type",
            "last_message",
            "unread_count",
            "media",
            "primary_media",
            "info",
        ]

    def _get_display_cached(self, obj):
        if not hasattr(self, "_display_cache"):
            self._display_cache = {}

        if obj.pk not in self._display_cache:
            self._display_cache[obj.pk] = self._resolve_display(obj)

        return self._display_cache[obj.pk]

    def _get_interlocutor_cached(self, obj):
        if not hasattr(self, "_interlocutor_cache"):
            self._interlocutor_cache = {}

        if obj.pk not in self._interlocutor_cache:
            user = self._get_current_user()
            self._interlocutor_cache[obj.pk] = (
                obj.get_interlocutor(user) if user else None
            )

        return self._interlocutor_cache[obj.pk]

    def _get_contact_cached(self, interlocutor):
        if not hasattr(self, "_contact_cache"):
            self._contact_cache = {}

        key = interlocutor.pk if interlocutor else None
        if key not in self._contact_cache:
            user = self._get_current_user()
            self._contact_cache[key] = (
                Contact.objects.filter(owner=user, user=interlocutor).first()
                if user and interlocutor
                else None
            )

        return self._contact_cache[key]

    def _get_current_user(self):
        request = self.context.get("request")
        return getattr(request, "user", None)

    def _resolve_display(self, obj):
        user = self._get_current_user()

        if not obj.is_dialog or not user:
            avatar = obj.display_media.filter(is_primary=True).first()
            return {
                "name": obj.name,
                "avatar": avatar,
                "last_seen": None,
            }

        interlocutor = self._get_interlocutor_cached(obj)
        if not interlocutor:
            return {"name": obj.name, "avatar": None, "last_seen": None}

        contact = self._get_contact_cached(interlocutor)
        profile = getattr(interlocutor, "profile", None)

        if contact and contact.name:
            name = contact.name
        else:
            name = interlocutor.display_name

        avatar = None
        if contact:
            avatar = contact.display_media.filter(is_primary=True).first()
        if not avatar and profile:
            avatar = profile.profile_media.filter(is_primary=True).first()

        return {
            "name": name,
            "avatar": avatar,
            "last_seen": profile.last_seen if profile else None,
        }

    def get_name(self, obj):
        return self._get_display_cached(obj)["name"]

    def get_info(self, obj):
        if obj.is_dialog:
            return self._get_display_cached(obj)["last_seen"]
        return obj.users.count()

    def get_last_message(self, obj):
        last_msg = obj.messages.order_by("-date").first()
        if last_msg:
            return MessageSerializer(last_msg, context=self.context).data
        return None

    def get_unread_count(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if not user:
            return 0

        return (
            obj.messages.filter(
                recipients__user=user,
                recipients__read_date__isnull=True,
                recipients__is_deleted=False,
            )
            .exclude(user=user)
            .count()
        )

    def get_primary_media(self, obj):
        media = self._get_display_cached(obj)["avatar"]
        return (
            DisplayMediaSerializer(media, context=self.context).data if media else None
        )

    def get_media(self, obj):
        user = self._get_current_user()

        if obj.is_dialog and user:
            interlocutor = self._get_interlocutor_cached(obj)

            if not interlocutor:
                return []

            media_items = []

            contact = self._get_contact_cached(interlocutor)
            profile = getattr(interlocutor, "profile", None)

            display = self._get_display_cached(obj)
            display_avatar = display["avatar"]

            if contact:
                media_items.extend(contact.display_media.filter(is_primary=False))

            if profile:
                profile_primary = profile.profile_media.filter(is_primary=True).first()

                if profile_primary and profile_primary != display_avatar:
                    media_items.append(profile_primary)

                media_items.extend(profile.profile_media.filter(is_primary=False))

        else:
            media_items = list(obj.display_media.filter(is_primary=False))

        media_items = list(dict.fromkeys(media_items))
        return DisplayMediaSerializer(media_items, many=True, context=self.context).data


class ChatListSerializer(ChatSerializer):
    class Meta(ChatSerializer.Meta):
        fields = [
            "id",
            "name",
            "chat_type",
            "last_message",
            "unread_count",
            "primary_media",
            "info",
        ]
