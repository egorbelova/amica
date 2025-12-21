from rest_framework import serializers
from .models import *
from django.utils import timezone
from django.contrib.auth.models import User
from .models import Profile
from .utils.url import build_url


class FileSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = File
        fields = [
            "id",
            "file_url",
            "extension",
            "category",
            "original_name",
            "file_size",
            "uploaded_at",
        ]
        read_only_fields = fields

    def get_file_url(self, obj):
        request = self.context.get("request")
        if obj.file:
            return request.build_absolute_uri(obj.file.url) if request else obj.file.url
        return None


class ImageFileSerializer(FileSerializer):
    thumbnail_small_url = serializers.SerializerMethodField()
    thumbnail_medium_url = serializers.SerializerMethodField()
    width = serializers.SerializerMethodField()
    height = serializers.SerializerMethodField()
    dominant_color = serializers.SerializerMethodField()

    class Meta(FileSerializer.Meta):
        fields = FileSerializer.Meta.fields + [
            "thumbnail_small_url",
            "thumbnail_medium_url",
            "width",
            "height",
            "dominant_color",
        ]

    def get_thumbnail_small_url(self, obj):
        if getattr(obj, "thumbnail_small", None):
            request = self.context.get("request")
            return (
                request.build_absolute_uri(obj.thumbnail_small.url)
                if request
                else obj.thumbnail_small.url
            )
        return None

    def get_thumbnail_medium_url(self, obj):
        if getattr(obj, "thumbnail_medium", None):
            request = self.context.get("request")
            return (
                request.build_absolute_uri(obj.thumbnail_medium.url)
                if request
                else obj.thumbnail_medium.url
            )
        return None

    def get_width(self, obj):
        return getattr(obj, "width", None)

    def get_height(self, obj):
        return getattr(obj, "height", None)

    def get_dominant_color(self, obj):
        return getattr(obj, "dominant_color", None)


class VideoFileSerializer(FileSerializer):
    width = serializers.SerializerMethodField()
    height = serializers.SerializerMethodField()
    # duration = serializers.SerializerMethodField()

    class Meta(FileSerializer.Meta):
        fields = FileSerializer.Meta.fields + ["width", "height"]

    def get_width(self, obj):
        return getattr(obj, "width", None)

    def get_height(self, obj):
        return getattr(obj, "height", None)

    # def get_duration(self, obj):
    #     return getattr(obj, 'duration', None)


# class ProfilePhotoSerializer(serializers.ModelSerializer):
#     image = serializers.SerializerMethodField()
#     small = serializers.SerializerMethodField()
#     medium = serializers.SerializerMethodField()

#     class Meta:
#         model = ProfilePhoto
#         fields = ('id', 'is_active', 'created_at', 'image', 'small', 'medium')

#     def _build_url(self, request, field):
#         if field:
#             return request.build_absolute_uri(field.url)
#         return None

#     def get_image(self, obj):
#         request = self.context.get('request')
#         return self._build_url(request, obj.image)

#     def get_small(self, obj):
#         request = self.context.get('request')
#         return self._build_url(request, obj.small)

#     def get_medium(self, obj):
#         request = self.context.get('request')
#         return self._build_url(request, obj.medium)


class ProfilePhotoSerializer(serializers.ModelSerializer):
    small = serializers.SerializerMethodField()
    medium = serializers.SerializerMethodField()

    class Meta:
        model = ProfilePhoto
        fields = [
            "id",
            "small",
            "medium",
            "is_active",
            "is_primary",
            "created_at",
            "updated_at",
        ]

    def get_small(self, obj):
        return self._build_url(obj.image_thumbnail_small)

    def get_medium(self, obj):
        return self._build_url(obj.image_thumbnail_medium)

    def _build_url(self, field):
        request = self.context.get("request")
        if not field:
            return None
        return request.build_absolute_uri(field.url) if request else field.url


class ProfileVideoSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = ProfileVideo
        fields = [
            "id",
            "url",
            "duration",
            "is_active",
            "is_primary",
            "created_at",
        ]

    def get_url(self, obj):
        request = self.context.get("request")
        return request.build_absolute_uri(obj.video.url) if request else obj.video.url


class ProfileVideoCreateSerializer(serializers.ModelSerializer):
    is_primary = serializers.BooleanField(write_only=True, required=False)

    class Meta:
        model = ProfileVideo
        fields = ["video", "is_active", "is_primary"]

    def create(self, validated_data):
        is_primary = validated_data.pop("is_primary", False)
        profile = self.context["profile"]

        video = ProfileVideo.objects.create(
            profile=profile,
            **validated_data
        )

        if is_primary:
            ProfileVideo.objects.set_primary(profile, video.id)

        return video



class ProfilePhotoListSerializer(serializers.ModelSerializer):
    """Легкий сериализатор для списков"""

    thumbnail = serializers.SerializerMethodField()

    class Meta:
        model = ProfilePhoto
        fields = ["id", "thumbnail", "is_active", "is_primary"]

    def get_thumbnail(self, obj):
        if not obj.image_thumbnail_small:
            return None

        request = self.context.get("request")
        return (
            request.build_absolute_uri(obj.image_thumbnail_small.url)
            if request
            else obj.image_thumbnail_small.url
        )



class ProfilePhotoCreateSerializer(serializers.ModelSerializer):
    """Для создания/обновления"""

    is_primary = serializers.BooleanField(write_only=True, required=False)

    class Meta:
        model = ProfilePhoto
        fields = ["image", "is_active", "is_primary"]

    def create(self, validated_data):
        is_primary = validated_data.pop("is_primary", False)
        profile = self.context["profile"]  # Передается из view
        photo = ProfilePhoto.objects.create(profile=profile, **validated_data)

        if is_primary:
            ProfilePhoto.objects.set_primary(profile, photo.id)

        return photo
    

class ProfileMediaSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    type = serializers.CharField()
    small = serializers.CharField(allow_null=True)
    medium = serializers.CharField(allow_null=True)
    url = serializers.CharField(allow_null=True)
    duration = serializers.FloatField(allow_null=True)
    created_at = serializers.DateTimeField()
    is_active = serializers.BooleanField()


class ProfileSerializer(serializers.ModelSerializer):
    primary_avatar = serializers.SerializerMethodField()
    media = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = (
            "last_seen",
            "bio",
            "phone",
            "date_of_birth",
            "location",
            "primary_avatar",
            "media",
        )

    def get_primary_avatar(self, obj):
        # Сначала ищем явный primary
        photo = obj.profilephotos.filter(is_primary=True).first()
        video = obj.profilevideos.filter(is_primary=True).first()
        primary = photo or video

        # Если нет явного primary, берём последнее добавленное медиа
        if not primary:
            last_photo = obj.profilephotos.order_by('-created_at').first()
            last_video = obj.profilevideos.order_by('-created_at').first()
            if last_photo and last_video:
                primary = last_photo if last_photo.created_at > last_video.created_at else last_video
            else:
                primary = last_photo or last_video

        if not primary:
            return None
        return self._serialize_media(primary)

    def get_media(self, obj):
        # Все остальные медиа без primary
        photos = obj.profilephotos.exclude(is_primary=True)
        videos = obj.profilevideos.exclude(is_primary=True)
        all_media = list(photos) + list(videos)
        # Сортировка по дате добавления
        all_media.sort(key=lambda x: x.created_at, reverse=True)
        return [self._serialize_media(m) for m in all_media]

    def _serialize_media(self, media):
        # Фото
        if isinstance(media, ProfilePhoto):
            return {
                "id": media.id,
                "type": "photo",
                "small": self._build_url(media.image_thumbnail_small),
                "medium": self._build_url(media.image_thumbnail_medium),
                "url": None,
                "duration": None,
                "created_at": media.created_at,
                "is_active": media.is_active,
            }
        # Видео
        else:
            return {
                "id": media.id,
                "type": "video",
                "small": None,
                "medium": None,
                "url": self._build_url(media.video),
                "duration": media.duration,
                "created_at": media.created_at,
                "is_active": media.is_active,
            }

    def _build_url(self, field):
        request = self.context.get("request")
        if not field:
            return None
        return request.build_absolute_uri(field.url) if request else field.url





class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = CustomUser
        fields = ("id", "email", "username", "profile")
        read_only_fields = fields

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        return ret


class MessageSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    # files = FileSerializer(many=True, read_only=True, source='file')
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
            "room",
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


class RoomListSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    other_users = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = [
            "id",
            "name",
            "room_type",
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


class RoomSerializerMessage(serializers.ModelSerializer):
    # room = MessageSerializerRoom(many=True, read_only=True)
    users = UserSerializer(many=True, read_only=True)
    # last_message = serializers.Field(source="latest")

    class Meta:
        model = Room
        fields = ("name", "users", "room_type", "id", "image")
        read_only_fields = fields


class RoomSerializerContacts(serializers.ModelSerializer):
    users = UserSerializer(many=True, read_only=True)

    class Meta:
        model = Room
        fields = ("users",)
        read_only_fields = fields


# class FileSerializer(serializers.ModelSerializer):
#     file_url = serializers.SerializerMethodField()

#     class Meta:
#         model = File
#         fields = ['id', 'file_url']
#         read_only_fields = fields

#     def get_file_url(self, obj):
#         if obj.file:
#             request = self.context.get('request')
#             if request:
#                 return request.build_absolute_uri(obj.file.url)
#             return obj.file.url
#         return None


class MessageSerializerRoom(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ("viewed", "user")
        read_only_fields = fields


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ("name", "image", "room_type", "id")
        read_only_fields = fields
