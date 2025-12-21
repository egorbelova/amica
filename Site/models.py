from django.db import models
from django.utils.translation import gettext_lazy as _
from django import forms
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.dispatch import receiver
from django.utils import timezone
from django.db.models.signals import post_save
from polymorphic.models import PolymorphicModel
from imagekit.models import ImageSpecField
from imagekit.processors import ResizeToFill
from datetime import datetime
from .managers import CustomUserManager
from PIL import Image
import os
from io import BytesIO
import subprocess


class Room(models.Model):
    class RoomType(models.TextChoices):
        DIALOG = "D", "Dialog"
        GROUP = "G", "Group" 
        CHANNEL = "C", "Channel"

    name = models.CharField(max_length=64, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    # avatar = models.ForeignKey(
    #     'Media', 
    #     on_delete=models.SET_NULL,
    #     null=True, 
    #     blank=True,
    #     related_name='rooms'
    # )
    room_type = models.CharField(
        max_length=1,
        choices=RoomType.choices,
        default=RoomType.DIALOG
    )
    
    users = models.ManyToManyField(
        "CustomUser", 
        related_name="rooms"
    )

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=['room_type']),
            models.Index(fields=['-created_at', 'room_type']),
            # ✅ УБРАЛИ сломанный UniqueConstraint
        ]
    
    # ✅ Методы отличные!
    def get_interlocutor(self, current_user):
        
        if self.room_type == self.RoomType.DIALOG:
            return self.users.exclude(id=current_user.id).first()
        return None
    
    @property
    def is_group_chat(self):
        return self.room_type in [self.RoomType.GROUP, self.RoomType.CHANNEL]

    def get_display_info(self, current_user):
        if self.room_type == self.RoomType.DIALOG:
            profile = self.user_profiles.filter(user=current_user).first()
            interlocutor_profile = self.user_profiles.exclude(user=current_user).first()
            
            return {
                'custom_name': profile.custom_name,
                'custom_avatar': profile.custom_avatar,
                'interlocutor_name': interlocutor_profile.custom_name,
                'interlocutor_avatar': interlocutor_profile.custom_avatar,
            }
        return {}
    
    def __str__(self):
        return self.name or f"Room {self.id}"
    

class UserRoomProfile(models.Model):
    user = models.ForeignKey('CustomUser', on_delete=models.CASCADE, related_name='room_profiles')
    room = models.ForeignKey('Room', on_delete=models.CASCADE, related_name='user_profiles')
    
    custom_name = models.CharField(max_length=64, blank=True, null=True)
    # custom_avatar = models.ForeignKey(
    #     'Media', 
    #     on_delete=models.SET_NULL, 
    #     null=True, 
    #     blank=True,
    #     related_name='user_room_avatars'
    # )
    
    is_blocked = models.BooleanField(default=False)
    is_favorite = models.BooleanField(default=False)
    notes = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'room']
        indexes = [
            models.Index(fields=['user', 'is_favorite']),
            models.Index(fields=['room', 'is_blocked']),
        ]

    def __str__(self):
        return f"{self.user.username} → {self.room}"


        



class CustomUser(AbstractUser):
    email = models.EmailField(_("email address"), unique=True)
    username = models.CharField(
        max_length=64, 
        unique=False, 
        blank=True,
        null=True
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    @property
    def display_name(self):
        return self.username or self.email.split('@')[0]

    def __str__(self):
        return self.display_name

    class Meta:
        indexes = [
            models.Index(fields=['username']),
        ]


User = get_user_model()


class Profile(models.Model):
    user = models.OneToOneField(
        CustomUser, on_delete=models.CASCADE, related_name="profile"
    )

    last_seen = models.DateTimeField(null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    location = models.CharField(max_length=100, blank=True)

    def update_last_seen(self):
        self.last_seen = timezone.now()
        self.save(update_fields=["last_seen"])

    def __str__(self):
        return f"Profile of {self.user.email}"


@receiver(post_save, sender=CustomUser)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=CustomUser)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, "profile"):
        instance.profile.save()
from django.db import transaction


class ProfileMediaManager(models.Manager):
    def get_primary(self, profile):
        return self.filter(profile=profile, is_primary=True).first()

    def get_active(self, profile):
        return self.filter(profile=profile, is_active=True)

    def set_primary(self, profile, media_id):
        with transaction.atomic():
            self.filter(profile=profile).update(is_primary=False)
            media = self.select_for_update().get(
                id=media_id,
                profile=profile,
            )
            media.is_primary = True
            media.save(update_fields=["is_primary"])
            return media


from django.core.exceptions import ValidationError


class ProfileMedia(models.Model):
    profile = models.ForeignKey(
        "Profile",
        related_name="%(class)ss",
        on_delete=models.CASCADE,
    )

    is_active = models.BooleanField(default=True)
    is_primary = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = ProfileMediaManager()

    class Meta:
        abstract = True
        ordering = ["-created_at"]



from django.core.validators import FileExtensionValidator
from imagekit.models import ImageSpecField
from imagekit.processors import ResizeToFill


class ProfilePhoto(ProfileMedia):
    image = models.ImageField(
        upload_to="profiles/photos/%Y/%m/%d/",
        validators=[
            FileExtensionValidator(
                allowed_extensions=["jpg", "jpeg", "png", "webp", "gif"]
            )
        ],
    )

    image_thumbnail_small = ImageSpecField(
        source="image",
        processors=[ResizeToFill(180, 180)],
        format="WEBP",
        options={"quality": 60},
    )

    image_thumbnail_medium = ImageSpecField(
        source="image",
        processors=[ResizeToFill(640, 640)],
        format="WEBP",
        options={"quality": 80},
    )

    class Meta(ProfileMedia.Meta):
        constraints = [
            models.UniqueConstraint(
                fields=["profile"],
                condition=models.Q(is_primary=True),
                name="unique_primary_photo_per_profile",
            )
        ]

    def clean(self):
        super().clean()
        if self.is_primary:
            exists = ProfilePhoto.objects.filter(
                profile=self.profile,
                is_primary=True
            ).exclude(id=self.id).exists()
            if exists:
                raise ValidationError("Profile already has a primary photo")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

from moviepy.video.io.VideoFileClip import VideoFileClip
from django.core.validators import FileExtensionValidator


from django.core.validators import FileExtensionValidator
from django.core.exceptions import ValidationError

class ProfileVideo(ProfileMedia):
    video = models.FileField(
        upload_to="profiles/videos/%Y/%m/%d/",
        validators=[FileExtensionValidator(["mp4", "mov", "webm"])],
    )

    duration = models.FloatField(null=True, blank=True)

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("done", "Done"),
        ("failed", "Failed"),
    ]

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
    )

    def clean(self):
        super().clean()
        if self.is_primary:
            exists = ProfileVideo.objects.filter(
                profile=self.profile,
                is_primary=True
            ).exclude(pk=self.pk).exists()
            if exists:
                raise ValidationError("Profile already has a primary video")







# class RegisterForm(CustomUser):
#     first_name = forms.CharField(max_length=30, label='', required=True, widget=forms.TextInput(attrs={'placeholder': 'Your Name'}), error_messages={'required': 'Please enter your name'})
#     username = forms.CharField(max_length=100, label='', required=True, widget=forms.TextInput(attrs={'placeholder': 'Username'}), error_messages={'required': 'Please enter your name'})
#     email = forms.EmailField(label='', max_length=254, help_text='', widget=forms.EmailInput(attrs={'placeholder': 'Email-address'}))
#     password1 = forms.CharField(label='', required=True,
#                                 widget=forms.PasswordInput(attrs={'placeholder': 'Enter password'}))
#     password2 = forms.CharField(label='', required=True,
#                                 widget=forms.PasswordInput(attrs={'placeholder': 'Enter the same password'}))
#
#     def clean_password2(self):
#         password1 = self.cleaned_data['password1']
#         password2 = self.cleaned_data['password2']
#
#         if password1 and password2 and password1 != password2:
#             raise ValidationError("Password don't match")
#         return password2
#
#     class Meta:
#         model = CustomUser
#         fields = ('first_name',)

# class Contact(models.Model):
#     owner = models.ForeignKey(
#         User,
#         on_delete=models.CASCADE,
#         related_name="contacts"
#     )
#     contact = models.ForeignKey(
#         User,
#         on_delete=models.CASCADE,
#         related_name="contact_of"
#     )

#     alias = models.CharField(max_length=100, blank=True)

#     avatar_photo = models.ForeignKey(
#         ProfilePhoto,
#         null=True,
#         blank=True,
#         on_delete=models.SET_NULL,
#         related_name="+"
#     )

#     avatar_video = models.ForeignKey(
#         ProfileVideo,
#         null=True,
#         blank=True,
#         on_delete=models.SET_NULL,
#         related_name="+"
#     )

#     class Meta:
#         unique_together = ("owner", "contact")



import subprocess
import os
from django.core.files.base import File


class Sticker(models.Model):
    file = models.FileField(max_length=255, null=True, blank=True, upload_to="images/")
    name = models.ForeignKey(
        "StickerCollection",
        blank=True,
        related_name="sticker",
        on_delete=models.PROTECT,
    )

    def get_absolute_url(self):
        return f"/person/{self.name}/"


class StickerCollection(models.Model):
    name = models.CharField(max_length=100, null=True)

    def __str__(self):
        return self.name


class DataMixin:
    def get_user_context(self, **kwargs):
        context = kwargs
        return context


# from .utils.url import build_url


class File(PolymorphicModel):
    file = models.FileField(max_length=255, null=True, blank=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    original_name = models.CharField(max_length=255, blank=True, null=True)
    extension = models.CharField(max_length=10, blank=True, null=True)
    category = models.CharField(max_length=20, blank=True, null=True)
    file_size = models.BigIntegerField(default=0)
    uploaded_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["-uploaded_at"]

    def save(self, *args, **kwargs):
        if self.file:
            if not self.original_name:
                self.original_name = os.path.basename(self.file.name)
            if not self.name:
                self.name = os.path.basename(self.file.name)
            if not self.extension:
                self.extension = os.path.splitext(self.original_name)[1].lower()
            if not self.file_size and self.file.size:
                self.file_size = self.file.size
            if not self.category:
                self.category = self.determine_category(self.extension)
        super().save(*args, **kwargs)

    def determine_category(self, ext: str) -> str:
        ext = ext.lower()
        if ext in [
            ".jpg",
            ".jpeg",
            ".png",
            ".gif",
            ".webp",
            ".bmp",
            ".ico",
            ".svg",
            ".tiff",
        ]:
            return "image"
        if ext in [".mp4", ".mov", ".avi", ".webm", ".mkv", ".mpeg", ".flv", ".m4v"]:
            return "video"
        if ext in [".mp3", ".wav", ".ogg", ".flac", ".m4a"]:
            return "audio"
        if ext in [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt"]:
            return "document"
        return "other"

    def __str__(self):
        return self.original_name or self.name or f"File {self.id}"


class ImageFile(File):
    width = models.PositiveIntegerField(null=True, blank=True)
    height = models.PositiveIntegerField(null=True, blank=True)
    thumbnail_small = models.ImageField(
        max_length=255, blank=True, null=True, upload_to="thumbnails/small/"
    )
    thumbnail_medium = models.ImageField(
        max_length=255, blank=True, null=True, upload_to="thumbnails/medium/"
    )
    dominant_color = models.CharField(max_length=7, blank=True, null=True)

    def get_average_color(self, img: Image.Image) -> str:
        img_small = img.resize((1, 1))
        pixel = img_small.getpixel((0, 0))
        r, g, b = pixel[:3]
        return f"#{r:02x}{g:02x}{b:02x}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.file:
            try:
                img = Image.open(self.file)
                self.width, self.height = img.size
                self.dominant_color = self.get_average_color(img)
                self.generate_thumbnails(img)
                super().save(
                    update_fields=[
                        "width",
                        "height",
                        "dominant_color",
                        "thumbnail_small",
                        "thumbnail_medium",
                    ]
                )
            except Exception as e:
                print(f"Image processing failed: {e}")

    def generate_thumbnails(self, img: Image.Image):
        # --- Small thumbnail ---
        thumb_small = img.copy()
        thumb_small.thumbnail((75, 75))
        thumb_small_io = BytesIO()
        thumb_small.save(
            thumb_small_io,
            format="WEBP",
            lossless=False,
            quality=50,
        )
        self.thumbnail_small.save(
            f"small_{os.path.basename(self.file.name)}.webp",
            ContentFile(thumb_small_io.getvalue()),
            save=False,
        )

        # --- Medium thumbnail ---
        thumb_medium = img.copy()
        thumb_medium.thumbnail((800, 800))
        thumb_medium_io = BytesIO()
        thumb_medium.save(
            thumb_medium_io,
            format="WEBP",
            lossless=False,
            quality=80,
        )
        self.thumbnail_medium.save(
            f"medium_{os.path.basename(self.file.name)}.webp",
            ContentFile(thumb_medium_io.getvalue()),
            save=False,
        )


class VideoFile(File):
    width = models.PositiveIntegerField(null=True, blank=True)
    height = models.PositiveIntegerField(null=True, blank=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        if self.file and (self.width is None or self.height is None):
            try:
                cmd = [
                    "ffprobe",
                    "-v",
                    "error",
                    "-select_streams",
                    "v:0",
                    "-show_entries",
                    "stream=width,height",
                    "-of",
                    "csv=s=x:p=0",
                    self.file.path,
                ]
                output = subprocess.check_output(cmd).decode().strip()
                w, h = map(int, output.split("x"))
                self.width, self.height = w, h

                super().save(update_fields=["width", "height"])
            except Exception as e:
                print(f"Video processing failed for {self.file.name}: {e}")


class MessageReaction(models.Model):
    REACTION_TYPES = [
        ("like", "👍"),
        ("heart", "❤️"),
        ("laugh", "😂"),
        ("wow", "😮"),
        ("sad", "😢"),
        ("angry", "😠"),
        ("fire", "🔥"),
        ("clap", "👏"),
    ]

    message = models.ForeignKey(
        "Message", on_delete=models.CASCADE, related_name="message_reactions"
    )
    user = models.ForeignKey(
        "CustomUser", on_delete=models.CASCADE, related_name="user_reactions"
    )
    reaction_type = models.CharField(
        max_length=10, choices=REACTION_TYPES, default="like"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["message", "user"]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} - {self.get_reaction_type_display()} on message {self.message.id}"


class Message(models.Model):
    value = models.TextField(max_length=10000, null=True)
    date = models.DateTimeField(default=datetime.now, blank=True)
    user = models.ForeignKey(
        "CustomUser", blank=True, related_name="sent_messages", on_delete=models.PROTECT
    )
    room = models.ForeignKey(
        "Room", blank=True, related_name="messages", on_delete=models.CASCADE
    )
    file = models.ManyToManyField("File", blank=True, related_name="messages")
    reply_to = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True, related_name="replies"
    )

    viewed_by = models.ManyToManyField(
        "CustomUser",
        through="MessageRecipient",
        through_fields=("message", "user"),
        related_name="viewed_messages",
        blank=True,
    )

    forwarded = models.ForeignKey(
        "CustomUser",
        blank=True,
        related_name="forwarded_messages",
        on_delete=models.PROTECT,
        null=True,
    )

    is_deleted = models.BooleanField(default=False)
    edit_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-date"]

    @property
    def reactions(self):
        return self.message_reactions.all()

    @property
    def reaction_summary(self):
        from django.db.models import Count

        return dict(
            self.message_reactions.values("reaction_type")
            .annotate(count=Count("id"))
            .values_list("reaction_type", "count")
        )

    @property
    def total_reactions(self):
        return self.message_reactions.count()

    @property
    def view_count(self):
        return (
            self.recipients.filter(read_date__isnull=False)
            .exclude(user=self.user)
            .count()
        )

    def is_viewed_by_user(self, user):
        return self.recipients.filter(user=user, read_date__isnull=False).exists()

    def get_user_reaction(self, user):
        try:
            return self.message_reactions.get(user=user).reaction_type
        except MessageReaction.DoesNotExist:
            return None

    def set_user_reaction(self, user, reaction_type):
        if reaction_type is None:
            self.message_reactions.filter(user=user).delete()
            return None
        else:
            reaction, created = MessageReaction.objects.update_or_create(
                message=self, user=user, defaults={"reaction_type": reaction_type}
            )
            return reaction_type

    def mark_as_viewed(self, user):
        from django.utils import timezone

        if user == self.user:
            return None

        recipient, created = MessageRecipient.objects.get_or_create(
            message=self, user=user
        )

        if not recipient.read_date:
            recipient.read_date = timezone.now()
            recipient.save()

        return recipient

    def get_viewers(self):
        return (
            CustomUser.objects.filter(
                message_recipients__message=self,
                message_recipients__read_date__isnull=False,
            )
            .exclude(id=self.user_id)
            .distinct()
        )


class MessageRecipient(models.Model):
    message = models.ForeignKey(
        Message, on_delete=models.CASCADE, related_name="recipients"
    )
    user = models.ForeignKey(
        "CustomUser", on_delete=models.CASCADE, related_name="message_recipients"
    )

    is_deleted = models.BooleanField(default=False)
    read_date = models.DateTimeField(null=True, blank=True)
    created_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["message", "user"]
        indexes = [
            models.Index(fields=["user", "read_date", "is_deleted"]),
            models.Index(fields=["message", "user"]),
        ]
        ordering = ["-created_date", "-pk"]

    def __str__(self):
        return f"{self.user.username} - {self.message.id}"


class UserSetting(models.Model):
    THEMES = [
        ("D", "DARK"),
        ("L", "LIGHT"),
    ]
    theme = models.CharField(max_length=1, choices=THEMES, default="D")
    user = models.OneToOneField(
        CustomUser, on_delete=models.CASCADE, primary_key=True, default=None, blank=True
    )


# class Profile(models.Model):
#     user = models.OneToOneField(User, null=True, on_delete=models.CASCADE)
#     image = models.ImageField(upload_to='images/', default='default_avatar.jpg', null=True, blank=True)


class RemoveUser(forms.Form):
    username = forms.CharField()


class UserDeleteForm(forms.ModelForm):
    class Meta:
        model = CustomUser
        fields = []
