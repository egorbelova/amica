from datetime import datetime

from Site.models import Message, MessageRecipient


def mark_message_as_read(message, user):
    try:
        recipient = MessageRecipient.objects.get(message=message, user=user)
        if recipient.read_date is None:
            recipient.read_date = datetime.now()
            recipient.save()
        return True
    except MessageRecipient.DoesNotExist:
        return False


def delete_message_for_user(message, user):
    try:
        recipient = MessageRecipient.objects.get(message=message, user=user)
        recipient.is_deleted = True
        recipient.save()
        return True
    except MessageRecipient.DoesNotExist:
        return False


def delete_message_for_all(message):
    message.is_deleted = True
    message.save()


def get_unread_count(chat, user):
    return MessageRecipient.objects.filter(
        message__chat=chat, user=user, is_deleted=False, read_date__isnull=True
    ).count()


def get_chat_messages_for_user(chat, user):
    return (
        Message.objects.filter(
            chat=chat,
            recipients__user=user,
            recipients__is_deleted=False,
            is_deleted=False,
        )
        .select_related("user")
        .prefetch_related("file")
        .order_by("-date")
    )
