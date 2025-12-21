from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Message, MessageRecipient, Room, CustomUser
from django.db.models.signals import m2m_changed


@receiver(post_save, sender=Message)
def create_message_recipients(sender, instance, created, **kwargs):
    if created:
        room_users = instance.room.users.all()
        recipients = [
            MessageRecipient(message=instance, user=user) for user in room_users
        ]
        MessageRecipient.objects.bulk_create(recipients)


# @receiver(m2m_changed, sender=Room.users.through)
# def add_existing_messages_to_new_user(sender, instance, action, pk_set, **kwargs):
#     if action == "post_add":
#         new_users = CustomUser.objects.filter(pk__in=pk_set)
#         messages = instance.messages.all()
#         recipients = []

#         for user in new_users:
#             for msg in messages:
#                 if not MessageRecipient.objects.filter(message=msg, user=user).exists():
#                     recipients.append(MessageRecipient(message=msg, user=user))

#         if recipients:
#             MessageRecipient.objects.bulk_create(recipients)

from django.db.models.signals import m2m_changed
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import Room, MessageRecipient

User = get_user_model()


@receiver(m2m_changed, sender=Room.users.through)
def add_existing_messages_to_new_user(sender, instance, action, pk_set, **kwargs):
    if action != "post_add":
        return

    new_users = list(User.objects.filter(pk__in=pk_set).only("id"))
    if not new_users:
        return

    message_ids = list(instance.messages.values_list("id", flat=True))

    if not message_ids:
        return

    existing_links = set(
        MessageRecipient.objects.filter(
            user_id__in=pk_set,
            message_id__in=message_ids,
        ).values_list("message_id", "user_id")
    )

    recipients_to_create = []

    for user in new_users:
        for message_id in message_ids:
            link = (message_id, user.id)
            if link not in existing_links:
                recipients_to_create.append(
                    MessageRecipient(message_id=message_id, user_id=user.id)
                )

    if recipients_to_create:
        MessageRecipient.objects.bulk_create(recipients_to_create, batch_size=500)


from django.db.models.signals import m2m_changed
from django.dispatch import receiver
from .models import Room, MessageRecipient


@receiver(m2m_changed, sender=Room.users.through)
def remove_recipients_when_user_leaves_room(sender, instance, action, pk_set, **kwargs):
    if action != "post_remove":
        return

    user_ids = list(pk_set)

    MessageRecipient.objects.filter(
        user_id__in=user_ids, message__room=instance
    ).delete()

    print(
        f"[INFO] Removed MessageRecipient for users={user_ids} from room={instance.id}"
    )


# signals.py
import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import ProfileVideo
from .tasks import compress_video

logger = logging.getLogger(__name__)

@receiver(post_save, sender=ProfileVideo)
def profile_video_post_save(sender, instance, created, **kwargs):
    # Запускаем задачу только если файл загружен и видео только создано
    if created and instance.video and instance.video.name:
        compress_video.delay(instance.pk)
        logger.info(f"Scheduled compression for video {instance.pk}")

