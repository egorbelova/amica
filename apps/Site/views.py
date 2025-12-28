import logging

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.core.files.storage import FileSystemStorage
from django.db.models import Count, OuterRef, Prefetch, Q, Subquery
from django.http import JsonResponse
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from urllib3 import request

from ..accounts.forms import *
from .models import *
from .serializers import *
from .serializers import MessageSerializer
from .utils import *

logger = logging.getLogger(__name__)


class GetChats(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        last_message_subquery = (
            Message.objects.filter(
                chat=OuterRef("pk"),
                recipients__user=request.user,
                recipients__is_deleted=False,
                is_deleted=False,
            )
            .order_by("-date")
            .values("id")[:1]
        )

        unread_subquery = (
            MessageRecipient.objects.filter(
                message__chat=OuterRef("pk"),
                user=request.user,
                is_deleted=False,
                read_date__isnull=True,
            )
            .exclude(message__user=request.user)
            .values("message__chat")
            .annotate(count=Count("id"))
            .values("count")[:1]
        )

        chats = (
            Chat.objects.filter(users=request.user)
            .prefetch_related(
                "display_media",
                "users__profile__profile_media",
                "users__contacts__display_media",
            )
            .annotate(
                last_message_id=Subquery(last_message_subquery),
                unread_count=Subquery(unread_subquery),
            )
            .order_by("-last_message_id")
        )

        serializer = ChatSerializer(chats, many=True, context={"request": request})
        return JsonResponse({"chats": serializer.data})


class MessageReactionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, message_id):
        try:
            message = Message.objects.get(id=message_id)
            reaction_type = request.data.get("reaction_type")

            valid_reactions = [choice[0] for choice in MessageReaction.REACTION_TYPES]
            if reaction_type not in valid_reactions and reaction_type is not None:
                return Response(
                    {"error": f"Invalid reaction type. Valid types: {valid_reactions}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            result = message.set_user_reaction(request.user, reaction_type)

            serializer = MessageSerializer(message, context={"request": request})
            return Response(
                {"success": True, "user_reaction": result, "message": serializer.data}
            )

        except Message.DoesNotExist:
            return Response(
                {"error": "Message not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error in MessageReactionView: {str(e)}")
            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class GetMessagesAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        chat_id = kwargs.get("chat")
        cursor_id = request.GET.get("cursor_id")
        page_size = int(request.GET.get("page_size", 50))

        try:
            chat = Chat.objects.get(id=chat_id, users=request.user)
            messages_qs = (
                chat.messages.filter(
                    is_deleted=False,
                    recipients__user=request.user,
                    recipients__is_deleted=False,
                )
                .select_related("user", "user__profile", "reply_to")
                .prefetch_related("file")
            )

            if cursor_id:
                messages_qs = messages_qs.filter(id__lt=cursor_id)

            messages = list(messages_qs.order_by("-date")[:page_size])

            messages.reverse()

            serializer = MessageSerializer(
                messages, many=True, context={"request": request}
            )
            return Response(
                {
                    "messages": serializer.data,
                    "next_cursor": messages[0].id if messages else None,
                }
            )

        except Chat.DoesNotExist:
            return Response({"error": "Chat not found"}, status=404)


class MessageViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self, chat_id):
        return (
            Message.objects.filter(chat_id=chat_id, is_deleted=False)
            .select_related("user", "user__profile")
            .prefetch_related("file")
        )

    def retrieve(self, request, pk=None):
        try:
            chat_id = pk
            last_message = self.get_queryset(chat_id).order_by("-date").first()
            if not last_message:
                return Response({"message": None})
            serializer = MessageSerializer(last_message, context={"request": request})
            return Response({"message": serializer.data})
        except Exception as e:
            logger.error(f"MessageViewSet retrieve error: {str(e)}")
            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def create(self, request):
        try:
            files = request.FILES.getlist("file", [])
            message_text = request.POST.get("message", "")
            chat_id = int(request.POST.get("chat_id"))

            if not chat_id:
                return JsonResponse({"error": "Chat ID is required"}, status=400)

            user = request.user
            chat = Chat.objects.get(id=chat_id)

            if not chat.users.filter(id=user.id).exists():
                return JsonResponse({"error": "User not in chat"}, status=403)

            if not message_text and not files:
                return JsonResponse(
                    {"error": "Message or file is required"}, status=400
                )

            if message_text or files:
                new_message = Message.objects.create(
                    value=message_text, user=user, chat=chat
                )

                MAX_FILE_SIZE = 1024 * 1024 * 1024  # 1GB

                if files:
                    for uploaded_file in files:
                        if uploaded_file.size > MAX_FILE_SIZE:
                            continue

                        fss = FileSystemStorage()
                        filename = fss.save(uploaded_file.name, uploaded_file)

                        from mimetypes import guess_type

                        mime_type, _ = guess_type(uploaded_file.name)
                        if mime_type and mime_type.startswith("image/"):
                            new_file = ImageFile.objects.create(file=filename)
                        elif mime_type and mime_type.startswith("video/"):
                            new_file = VideoFile.objects.create(file=filename)
                        # elif mime_type and mime_type.startswith('audio/'):
                        #     new_file = AudioFile.objects.create(file=filename)
                        else:
                            from apps.media_files.models.models import File

                            new_file = File.objects.create(file=filename)

                        new_message.file.add(new_file)

                new_message.save()

                channel_layer = get_channel_layer()

                serialized_message = MessageSerializer(
                    new_message, context={"request": request, "user_id": user.id}
                ).data

                user_ids = list(chat.users.values_list("id", flat=True))

                for user_id in user_ids:
                    async_to_sync(channel_layer.group_send)(
                        f"user_{user_id}",
                        {
                            "type": "chat_message",
                            "chat_id": chat_id,
                            "data": serialized_message,
                        },
                    )

                return JsonResponse(
                    {
                        "status": "success",
                        "message": "Message sent successfully",
                        "message_id": new_message.id,
                    }
                )

            return JsonResponse({"error": "No content to send"}, status=400)

        except Chat.DoesNotExist:
            return JsonResponse({"error": "Chat not found"}, status=404)
        except Exception as e:
            print(f"Error in send view: {e}")
            return JsonResponse({"error": "Server error"}, status=500)

    def update(self, request, pk=None):
        print("request")
        try:
            message = Message.objects.get(pk=pk, user=request.user)
            serializer = MessageSerializer(
                message, data=request.data, context={"request": request}
            )
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Message.DoesNotExist:
            return Response(
                {"error": "Message not found"}, status=status.HTTP_404_NOT_FOUND
            )

    def partial_update(self, request, pk=None):
        print("request")
        try:
            message = Message.objects.get(pk=pk, user=request.user)
            serializer = MessageSerializer(
                message, data=request.data, partial=True, context={"request": request}
            )
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Message.DoesNotExist:
            return Response(
                {"error": "Message not found"}, status=status.HTTP_404_NOT_FOUND
            )

    def destroy(self, request, pk=None):
        try:
            message = Message.objects.get(pk=pk, user=request.user)
            message.is_deleted = True
            message.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Message.DoesNotExist:
            return Response(
                {"error": "Message not found"}, status=status.HTTP_404_NOT_FOUND
            )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_general_info(request):
    try:
        logger.info(f"Getting general info for user: {request.user.id}")

        serializer = UserSerializer(request.user, context={"request": request})

        return Response({"success": True, "user": serializer.data})

    except Exception as e:
        logger.error(
            f"Error in get_general_info for user {request.user.id}: {str(e)}",
            exc_info=True,
        )

        return Response(
            {"success": False, "error": "Internal server error", "details": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def update_user_info(request):
    try:
        serializer = UserSerializer(request.user, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response({"success": True, "user": serializer.data})

        return Response(
            {"success": False, "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

    except Exception as e:
        return Response(
            {"success": False, "error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
class ChatListView(APIView):
    def get(self, request):
        chats = Chat.objects.annotate(
            last_message_content=Subquery(
                Message.objects.filter(chat=OuterRef("pk"))
                .order_by("-date")
                .values("value")[:1]
            ),
            last_message_date=Subquery(
                Message.objects.filter(chat=OuterRef("pk"))
                .order_by("-date")
                .values("date")[:1]
            ),
            unread_count=Count(
                "messages",
                filter=Q(messages__viewed=False) & ~Q(messages__user=request.user),
            ),
        ).values(
            "id", "name", "last_message_content", "last_message_date", "unread_count"
        )

        return Response(chats)


User = get_user_model()


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def GetContacts(request):
    try:
        contacts = (
            Contact.objects.filter(owner=request.user)
            .select_related("user", "user__profile")
            .prefetch_related(
                "display_media",
                "user__profile__profile_media",
            )
        )

        serializer = ContactSerializer(
            contacts, many=True, context={"request": request}
        )
        return Response({"contacts": serializer.data}, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(
            f"Error in GetContacts for user {request.user.id}: {str(e)}",
            exc_info=True,
        )
        return Response(
            {"error": "Internal server error"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


class UserEmailSearchView(APIView):
    def get(self, request):
        query = request.query_params.get("email", "").strip()

        if len(query) < 4:
            return Response(
                {"error": "Enter at least 4 characters"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        users = User.objects.filter(
            Q(email__icontains=query) | Q(username__icontains=query)
        )[:20]

        results = [
            {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "display_name": user.display_name,
            }
            for user in users
        ]

        return Response(results, status=status.HTTP_200_OK)
