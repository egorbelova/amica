from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from ..managers import CustomUserManager


class CustomUser(AbstractUser):
    email = models.EmailField(_("email address"), unique=True)
    username = models.CharField(max_length=64, unique=False, blank=True, null=True)

    credential_id = models.BinaryField(null=True, blank=True)
    credential_public_key = models.BinaryField(null=True, blank=True)
    credential_signature = models.BinaryField(null=True, blank=True)
    credential_user_handle = models.BinaryField(null=True, blank=True)
    sign_count = models.BigIntegerField(default=0)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    @property
    def display_name(self):
        return self.username or self.email.split("@")[0] or "User"

    def __str__(self):
        return self.display_name

    class Meta:
        indexes = [
            models.Index(fields=["username"]),
        ]


User = get_user_model()

from django.contrib.contenttypes.fields import GenericRelation


class Profile(models.Model):
    user = models.OneToOneField(
        CustomUser, on_delete=models.CASCADE, related_name="profile"
    )

    last_seen = models.DateTimeField(null=True, blank=True)
    bio = models.TextField(max_length=128, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    location = models.CharField(max_length=100, blank=True)
    profile_media = GenericRelation(
        "media_files.DisplayMedia", related_query_name="profile"
    )

    def update_last_seen(self):
        self.last_seen = timezone.now()
        self.save(update_fields=["last_seen"])

    def __str__(self):
        return f"Profile of {self.user.email}"


@receiver(post_save, sender=CustomUser)
def manage_user_profile(sender, instance, created, **kwargs):
    profile, _ = Profile.objects.get_or_create(user=instance)
    profile.save()


from datetime import timedelta


class ActiveSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sessions")

    jti = models.CharField(max_length=255, unique=True)

    refresh_token = models.TextField()

    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    last_active = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["user", "jti"]),
        ]
        ordering = ["-created_at"]

    def is_active(self):
        now = timezone.now()
        return self.expires_at > now and (
            self.last_active > now - timedelta(minutes=30)
        )

    def revoke(self):
        self.delete()

    def __str__(self):
        return f"Session(user={self.user_id}, active={self.is_active()})"
