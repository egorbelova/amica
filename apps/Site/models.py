from datetime import datetime

from django.contrib.auth import get_user_model
from django.contrib.contenttypes.fields import GenericRelation
from django.db import models
from django.db.models import Count
from django.dispatch import receiver
from django.utils import timezone
from django.utils.translation import gettext_lazy as _


class Chat(models.Model):
    class ChatType(models.TextChoices):
        DIALOG = "D", "Dialog"
        GROUP = "G", "Group"
        CHANNEL = "C", "Channel"

    name = models.CharField(max_length=64, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    display_media = GenericRelation(
        "media_files.DisplayMedia", related_query_name="chat"
    )

    chat_type = models.CharField(
        max_length=1, choices=ChatType.choices, default=ChatType.DIALOG
    )

    users = models.ManyToManyField(
        "accounts.CustomUser", through="ChatMember", related_name="chats", blank=True
    )

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["-created_at", "chat_type"]),
        ]

    @property
    def is_dialog(self):
        return self.chat_type == self.ChatType.DIALOG

    @property
    def is_group(self):
        return self.chat_type == self.ChatType.GROUP

    @property
    def is_channel(self):
        return self.chat_type == self.ChatType.CHANNEL

    @property
    def is_multi_user(self):
        return self.chat_type in {self.ChatType.GROUP, self.ChatType.CHANNEL}

    def get_interlocutor(self, current_user):
        if not self.is_dialog:
            return None
        return self.users.exclude(id=current_user.id).first()

    def __str__(self):
        return self.name or f"Chat {self.id}"

    @classmethod
    def get_or_create_direct_chat(cls, user1, user2):
        chat = (
            cls.objects.filter(chat_type=cls.ChatType.DIALOG)
            .filter(users=user1)
            .filter(users=user2)
            .distinct()
            .first()
        )
        if chat:
            return chat, False

        chat = cls.objects.create(chat_type=cls.ChatType.DIALOG)
        ChatMember.objects.bulk_create(
            [
                ChatMember(chat=chat, user=user1, role=ChatMember.Role.MEMBER),
                ChatMember(chat=chat, user=user2, role=ChatMember.Role.MEMBER),
            ]
        )
        return chat, True


class ChatMember(models.Model):
    class Role(models.TextChoices):
        OWNER = "owner"
        ADMIN = "admin"
        MEMBER = "member"
        SUBSCRIBER = "subscriber"

    chat = models.ForeignKey("Chat", on_delete=models.CASCADE)
    user = models.ForeignKey("accounts.CustomUser", on_delete=models.CASCADE, null=True)

    role = models.CharField(max_length=16, choices=Role.choices, default=Role.MEMBER)

    muted = models.BooleanField(default=False)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["chat", "user"], name="unique_chat_member")
        ]


class Contact(models.Model):
    owner = models.ForeignKey(
        "accounts.CustomUser", on_delete=models.CASCADE, related_name="contacts"
    )
    user = models.ForeignKey(
        "accounts.CustomUser", on_delete=models.CASCADE, related_name="in_contacts"
    )
    name = models.CharField(max_length=64, blank=True)
    display_media = GenericRelation(
        "media_files.DisplayMedia", related_query_name="contact"
    )

    is_blocked = models.BooleanField(default=False)
    is_favorite = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["owner", "user"], name="unique_contact_per_owner"
            )
        ]

    def __str__(self):
        return f"{self.owner.display_name} → {self.user.display_name}"


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
        "accounts.CustomUser", on_delete=models.CASCADE, related_name="user_reactions"
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
        "accounts.CustomUser",
        blank=True,
        related_name="sent_messages",
        on_delete=models.PROTECT,
    )
    chat = models.ForeignKey(
        "Chat", blank=True, related_name="messages", on_delete=models.CASCADE
    )
    file = models.ManyToManyField(
        "media_files.File", blank=True, related_name="messages"
    )
    reply_to = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True, related_name="replies"
    )

    viewed_by = models.ManyToManyField(
        "accounts.CustomUser",
        through="MessageRecipient",
        through_fields=("message", "user"),
        related_name="viewed_messages",
        blank=True,
    )

    forwarded = models.ForeignKey(
        "accounts.CustomUser",
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
        User = get_user_model()
        return (
            User.objects.filter(
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
        "accounts.CustomUser",
        on_delete=models.CASCADE,
        related_name="message_recipients",
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
