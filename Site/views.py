from django.http import (
    HttpResponse,
    HttpResponseNotFound,
    JsonResponse,
    HttpResponseRedirect,
)
from django.shortcuts import render, redirect, reverse
from .models import *
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from django.urls import reverse_lazy
from .utils import *
from .forms import *
from django.contrib.auth.views import LoginView
from django.contrib.auth.forms import AuthenticationForm
import hashlib
from django.views.generic import ListView, CreateView
from django.core.files.storage import FileSystemStorage
from django.utils.safestring import mark_safe
import json
from django.db.models.functions import Lower
from rest_framework.views import APIView
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.core import serializers
from django.forms.models import model_to_dict
from social_django import *
from asgiref.sync import sync_to_async

from django.contrib.auth import login, authenticate
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from django.http import JsonResponse

# views.py
# views.py
from django.http import JsonResponse
from django.template.loader import render_to_string

from django.http import JsonResponse
from django.contrib.auth import authenticate, login
from django.views.decorators.csrf import ensure_csrf_cookie

from rest_framework.authtoken.models import Token
from django.http import JsonResponse
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)


# views.py
from rest_framework.authtoken.models import Token
from .serializers import *
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated


from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .utils.google_login_or_create_user import google_login_or_create_user


@api_view(["POST"])
@permission_classes([AllowAny])
def google_login(request):
    token = request.data.get("id_token")
    if not token:
        return Response(
            {"error": "No token provided"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = google_login_or_create_user(
            token,
            "661213065242-4dt9tro2q8iokcfbnof6m7r2g9th1qcc.apps.googleusercontent.com",
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    refresh = RefreshToken.for_user(user)
    response = Response({"detail": "Login successful"})

    response.set_cookie(
        "access_token",
        str(refresh.access_token),
        httponly=True,
        secure=False,
        samesite="Lax",
        max_age=15 * 60,
    )
    response.set_cookie(
        "refresh_token",
        str(refresh),
        httponly=True,
        secure=False,
        samesite="Lax",
        max_age=7 * 24 * 60 * 60,
    )

    return response


@api_view(["POST"])
@permission_classes([AllowAny])
def api_login(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)
    if user is None:
        return Response({"error": "Invalid credentials"}, status=400)

    refresh = RefreshToken.for_user(user)

    response = Response(
        {"user_id": user.id, "username": user.username, "email": user.email}
    )

    response.set_cookie(
        "access_token",
        str(refresh.access_token),
        httponly=True,
        secure=False,
        samesite="Lax",
        max_age=15 * 60,
    )

    response.set_cookie(
        "refresh_token",
        str(refresh),
        httponly=True,
        secure=False,
        samesite="Lax",
        max_age=7 * 24 * 60 * 60,
    )

    return response


@api_view(["POST"])
@permission_classes([AllowAny])
def refresh_token(request):
    refresh_token = request.COOKIES.get("refresh_token")
    if not refresh_token:
        return Response({"error": "No refresh token"}, status=401)

    try:
        refresh = RefreshToken(refresh_token)
        access_token = str(refresh.access_token)
    except Exception as e:
        return Response({"error": "Invalid token"}, status=401)

    response = Response({"success": True})
    response.set_cookie(
        "access_token",
        access_token,
        httponly=True,
        secure=False,
        samesite="Lax",
        max_age=15 * 60,
    )
    return response


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def protected_view(request):
    return Response(
        {
            "user_id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
        }
    )


def home(request, room=0):
    if request.user.is_authenticated:
        return render_main_app(request, room)
    else:
        if request.method == "POST":
            username = request.POST.get("username")
            password = request.POST.get("password")
            user = authenticate(request, username=username, password=password)

            if user is not None:
                login(request, user)

                # Check if it's an AJAX request
                if request.headers.get("X-Requested-With") == "XMLHttpRequest":
                    return JsonResponse(
                        {"success": True, "message": "Login successful"}
                    )
                else:
                    return redirect("home")
            else:
                # Check if it's an AJAX request
                if request.headers.get("X-Requested-With") == "XMLHttpRequest":
                    return JsonResponse(
                        {"success": False, "error": "Invalid username or password"},
                        status=400,
                    )
                else:
                    return render(
                        request, "pages/login.html", {"error": "Invalid credentials"}
                    )

        # Regular GET request
        return render(request, "pages/login.html")


def render_main_app(request, room=0):
    """Render the main chat application for authenticated users"""
    User = get_user_model()
    all_chats = Room.objects.filter(users=request.user)
    all_users = User.objects.all()

    if room == 0:
        return render(
            request,
            "room.html",
            {
                "all_chats": all_chats,
                "all_users": all_users,
                "user": request.user,  # Make sure user is passed to template
            },
        )

    if Room.objects.filter(id=room).filter(users=request.user).exists():
        # Your existing room logic
        mes = Message.objects.all()
        for item in mes:
            for fl in item.file.all():
                print(fl.file)
        username = request.user
        opponent = Room.objects.get(id=room).users.exclude(id=request.user.id)[0]
        room_details = Room.objects.filter(id=room)
        return JsonResponse(
            {
                "username": str(username),
                "room": int(room),
                "room_details": list(room_details.values()),
                "users": str(opponent),
                "all_chats": list(all_chats.values()),
                "all_users": list(all_users.values()),
            }
        )
    else:
        # Stay on the same page but with room=0
        return render(
            request,
            "room.html",
            {"all_chats": all_chats, "all_users": all_users, "user": request.user},
        )


def handle_login(request):
    """Handle login form submission and rendering"""
    context = {}

    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            # Re-render the same page but now authenticated
            return render_main_app(request, 0)
        else:
            context["error"] = "Invalid credentials"

    # Render login form
    return render(request, "pages/login.html", context)


# Update your existing LoginUser view to work with the new flow
class LoginUser(DataMixin, LoginView):
    form_class = AuthenticationForm
    template_name = "pages/login.html"

    def get_success_url(self):
        # Redirect to home after login
        return self.request.POST.get("next") or self.request.GET.get("next") or "/"

    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data(**kwargs)
        c_def = self.get_user_context(title="Login")
        return dict(list(context.items()) + list(c_def.items()))

    def get(self, request, *args, **kwargs):
        # If user is already authenticated, redirect to home
        if request.user.is_authenticated:
            return redirect("home")
        return super().get(request, *args, **kwargs)


@login_required(login_url="login")
def checkview(request):
    room = request.POST["chats"]
    if Room.objects.filter(id=room).filter(users=request.user).exists():
        opponent = Room.objects.get(id=room).users.exclude(id=request.user.id)[0]
        room_details = Room.objects.filter(id=room)
        return JsonResponse(
            {
                # 'room': int(room),
                # 'room_details': list(room_details.values()),
                # # 'users': str(opponent),
                # "opponent": str(opponent.username),
            },
            safe=False,
        )
    else:
        return redirect("room")


@login_required(login_url="login")
def checkview_users(request):
    User = get_user_model()
    opponent = User.objects.get(id=request.POST["users"])
    username = request.user.username
    # username_id = request.user.id

    if Room.objects.filter(users=request.user).filter(users=opponent).exists():
        room = str(Room.objects.filter(users=request.user).filter(users=opponent)[0].id)
        return redirect("/" + room + "/?" + str(opponent.username))
    else:
        new_room = Room.objects.create()
        request.user.rooms.add(new_room)
        opponent.rooms.add(new_room)
        new_room.users.add(request.user, opponent)
        new_room.save()

        username = User.objects.filter(id=request.user.id)
        opponent = Room.objects.get(id=new_room.id).users.exclude(id=request.user.id)[0]
        room_details = Room.objects.filter(id=new_room.id)
        return JsonResponse({"id": new_room.id})


from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)

# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def send(request):
# try:
#     files = request.FILES.getlist('file', [])
#     message_text = request.POST.get('message', '')
#     room_id = request.POST.get('room_id')

#     if not room_id:
#         return JsonResponse({'error': 'Room ID is required'}, status=400)

#     user = request.user
#     room = Room.objects.get(id=room_id)

#     if not room.users.filter(id=user.id).exists():
#         return JsonResponse({'error': 'User not in room'}, status=403)

#     if message_text or files:
#         new_message = Message.objects.create(
#             value=message_text,
#             user=user,
#             room=room
#         )

#         if files:
#             for file in files:
#                 fss = FileSystemStorage()
#                 filename = fss.save(file.name, file)
#                 new_file = File.objects.create(file=filename)
#                 new_message.file.add(new_file)

#         new_message.save()

#         from .serializers import MessageSerializer
#         from channels.layers import get_channel_layer
#         from asgiref.sync import async_to_sync

#         channel_layer = get_channel_layer()

#         serialized_message = MessageSerializer(new_message, context={'user_id': user.id}).data

#         user_ids = list(room.users.values_list('id', flat=True))

#         for user_id in user_ids:
#             async_to_sync(channel_layer.group_send)(
#                 f"user_{user_id}",
#                 {
#                     'type': 'chat_message',
#                     'room_id': room_id,
#                     'data': serialized_message
#                 }
#             )

#         return JsonResponse({
#             'status': 'success',
#             'message': 'Message sent successfully',
#             'message_id': new_message.id
#         })

#     return JsonResponse({'error': 'No content to send'}, status=400)

# except Room.DoesNotExist:
#     return JsonResponse({'error': 'Room not found'}, status=404)
# except Exception as e:
#     print(f"Error in send view: {e}")
#     return JsonResponse({'error': 'Server error'}, status=500)

from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated


from django.db.models import Max
from datetime import datetime
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token


class GetChats(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from django.db.models import Max, Count, Q, OuterRef, Subquery

        last_message_subquery = (
            Message.objects.filter(
                room=OuterRef("pk"),
                recipients__user=request.user,
                recipients__is_deleted=False,
                is_deleted=False,
            )
            .order_by("-date")
            .values("id")[:1]
        )

        unread_subquery = (
            MessageRecipient.objects.filter(
                message__room=OuterRef("pk"),
                user=request.user,
                is_deleted=False,
                read_date__isnull=True,
            )
            .exclude(message__user=request.user)
            .values("message__room")
            .annotate(count=Count("id"))
            .values("count")[:1]
        )

        chats = (
            Room.objects.filter(users=request.user)
            .annotate(
                last_message_id=Subquery(last_message_subquery),
                unread_count=Subquery(unread_subquery),
            )
            .order_by("-last_message_id")
        )

        last_message_ids = [
            chat.last_message_id for chat in chats if chat.last_message_id
        ]
        last_messages = (
            Message.objects.filter(id__in=last_message_ids)
            .select_related("user")
            .prefetch_related("file")
        )

        last_message_dict = {msg.id: msg for msg in last_messages}

        chats_data = []
        for chat in chats:
            last_message = last_message_dict.get(chat.last_message_id)
            last_message_serialized = (
                MessageSerializer(last_message, context={"request": request}).data
                if last_message
                else None
            )
            chat_data = {
                "id": chat.id,
                "name": chat.name,
                "users": UserSerializer(
                    chat.users.all(), many=True, context={"request": request}
                ).data,
                "room_type": chat.room_type,
                "image": None,
                "last_message": last_message_serialized,
                "unread_count": chat.unread_count or 0,
            }

            chats_data.append(chat_data)

        return JsonResponse({"chats": chats_data})

    def get_absolute_url(self, relative_url):
        if not relative_url:
            return None
        if relative_url.startswith("http"):
            return relative_url
        return self.request.build_absolute_uri(relative_url)

    def get_user_image_url(self, user, request):
        if hasattr(user, "profile") and user.profile.thumbnail_small:
            return self.get_absolute_url(user.profile.thumbnail_small.url)
        return None

    def get_user_last_seen(self, user):
        if hasattr(user, "profile") and user.profile.last_seen:
            return user.profile.last_seen.isoformat()
        return None

    def serialize_message(self, message, request):
        if not message:
            return None

        return {
            "id": message.id,
            "value": message.value,
            "date": message.date.isoformat(),
            "sender": {
                "id": message.user.id,
                "email": message.user.email,
                "username": message.user.username,
                "image": self.get_user_image_url(message.user, request),
            },
            "is_edited": message.edit_date is not None,
            "has_files": message.file.exists(),
            "files": [
                {
                    "id": file.id,
                    "thumbnail_small_url": (
                        build_url(request, file.file.url) if file.file else None
                    ),
                    "category": file.category,
                }
                for file in message.file.all()
            ],
        }


class GetContacts(APIView):
    def get(self, request):
        all_chats = Room.objects.filter(users=request.user.id, room_type="D")
        serializer = RoomSerializerContacts(all_chats, many=True)
        my_user = request.user.id
        return Response({"all_chats": serializer.data, "my_user": my_user})


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


# views.py
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Prefetch
from django.core.paginator import Paginator


from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.paginator import Paginator
from django.db.models import Prefetch
from .models import Room, Message, MessageReaction, File
from .serializers import MessageSerializer
import logging

logger = logging.getLogger(__name__)


class GetMessagesAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        room_id = kwargs.get("room")
        cursor_id = request.GET.get("cursor_id")
        page_size = int(request.GET.get("page_size", 50))

        try:
            room = Room.objects.get(id=room_id, users=request.user)

            messages_qs = (
                room.messages.filter(
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

        except Room.DoesNotExist:
            return Response({"error": "Room not found"}, status=404)


class MessageViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self, room_id):
        return (
            Message.objects.filter(room_id=room_id, is_deleted=False)
            .select_related("user", "user__profile")
            .prefetch_related("file")
        )

    def retrieve(self, request, pk=None):
        try:
            room_id = pk
            last_message = self.get_queryset(room_id).order_by("-date").first()
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
            room_id = int(request.POST.get("room_id"))

            if not room_id:
                return JsonResponse({"error": "Room ID is required"}, status=400)

            user = request.user
            room = Room.objects.get(id=room_id)

            if not room.users.filter(id=user.id).exists():
                return JsonResponse({"error": "User not in room"}, status=403)

            if not message_text and not files:
                return JsonResponse(
                    {"error": "Message or file is required"}, status=400
                )

            if message_text or files:
                new_message = Message.objects.create(
                    value=message_text, user=user, room=room
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
                            print(mime_type)
                        elif mime_type and mime_type.startswith("video/"):
                            new_file = VideoFile.objects.create(file=filename)
                        # elif mime_type and mime_type.startswith('audio/'):
                        #     new_file = AudioFile.objects.create(file=filename)
                        else:
                            new_file = File.objects.create(file=filename)

                        new_message.file.add(new_file)

                new_message.save()

                from .serializers import MessageSerializer
                from channels.layers import get_channel_layer
                from asgiref.sync import async_to_sync

                channel_layer = get_channel_layer()

                serialized_message = MessageSerializer(
                    new_message, context={"request": request, "user_id": user.id}
                ).data

                user_ids = list(room.users.values_list("id", flat=True))

                for user_id in user_ids:
                    async_to_sync(channel_layer.group_send)(
                        f"user_{user_id}",
                        {
                            "type": "chat_message",
                            "room_id": room_id,
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

        except Room.DoesNotExist:
            return JsonResponse({"error": "Room not found"}, status=404)
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

    # DELETE
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


@login_required(login_url="login")
def deleteuser(request):
    if request.method == "POST":
        delete_form = UserDeleteForm(request.POST, instance=request.user)
        user = request.user
        user.delete()
        return redirect("login")
    else:
        delete_form = UserDeleteForm(instance=request.user)

    context = {"delete_form": delete_form}

    return redirect("login")


def pageNotFound(request, exception):
    return redirect("home")


def pageNotFound500(request):
    return redirect("home")


class RegisterUser(DataMixin, CreateView):
    form_class = CustomUserCreationForm
    template_name = "pages/signup.html"
    success_url = reverse_lazy("home")

    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data(**kwargs)
        c_def = self.get_user_context(title="Registration")
        return dict(list(context.items()) + list(c_def.items()))

    # def form_valid(self, form):
    #     user = form.save()
    #     # login(self.request, user, backend='django.contrib.auth.backends.ModelBackend')
    #     login(self.request, user)
    #     return redirect('home')


# class LoginUser(DataMixin, LoginView):
#     form_class = AuthenticationForm
#     template_name = 'pages/login.html'

#     def get_success_url(self):
#         return reverse_lazy('home')  # Redirect to home after login

#     def get_context_data(self, *, object_list = None, **kwargs):
#         context = super().get_context_data(**kwargs)
#         c_def = self.get_user_context(title="Login")
#         return dict(list(context.items()) + list(c_def.items()))

# views.py
# from django.views.decorators.http import require_POST


# @require_POST
@login_required
def logout_user(request):
    """Logout user and stay on the same page"""
    logout(request)
    # Return the home page which will now show login form
    return home(request, 0)


def profile(request):
    return render(request, "pages/profile.html")

    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data(**kwargs)
        c_def = self.get_user_context(title="Registration")
        return dict(list(context.items()) + list(c_def.items()))

    def form_valid(self, form):
        user = form.save()
        login(self.request, user)
        return redirect("home")


@login_required(login_url="login")
def set_settings(request):
    theme = request.POST.get("theme", False)
    if not UserSetting.objects.filter(user=request.user).exists():
        new_settings = UserSetting.objects.create(user=request.user)
        new_settings.save()
    request.user.usersetting.theme = theme
    request.user.usersetting.save()

    return HttpResponse("Message sent successfully")


@login_required(login_url="login")
def get_settings(request):
    if not UserSetting.objects.filter(user=request.user).exists():
        new_settings = UserSetting.objects.create(user=request.user)
        new_settings.save()
    settings = {"theme": request.user.usersetting.theme}

    return JsonResponse({"settings": settings}, safe=False)


@login_required(login_url="login")
def ms_reaction(request):
    reaction = request.POST.get("reaction", False)
    mes_id = request.POST.get("message_id", False)
    message = Message.objects.get(id=mes_id)
    if message.liked:
        message.liked = False
    else:
        message.liked = True
    message.save()
    return HttpResponse("Message saved")


@login_required(login_url="login")
def save_profile_avatar(request):
    avatar = request.FILES.getlist("user_avatar", False)
    if avatar:
        avatar = avatar[0]

    fss = FileSystemStorage()
    filename = fss.save(
        avatar.name[: avatar.name.rfind(".")].encode(encoding="utf8").hex()
        + avatar.name[avatar.name.rfind(".") :],
        avatar,
    )
    url = fss.url(filename)
    request.user.image = url
    request.user.save()
    return HttpResponse("Message saved")


@login_required(login_url="login")
def save_room_avatar(request):
    avatar = request.FILES.getlist("room_avatar", False)
    url = ""
    if avatar:
        avatar = avatar[0]
        fss = FileSystemStorage()
        filename = fss.save(
            avatar.name[: avatar.name.rfind(".")].encode(encoding="utf8").hex()
            + avatar.name[avatar.name.rfind(".") :],
            avatar,
        )
        url = fss.url(filename)
    room_name = request.POST.get("room_name", False)
    contacts_id = json.loads(request.POST.get("contacts_id", False))
    room_type = request.POST.get("room_type", False)
    print("AAA", contacts_id[0])

    if room_type == "G":
        new_room = Room.objects.create(room_type="G", name=room_name, image=url)
        for i in range(len(contacts_id)):
            new_room.users.add(int(contacts_id[i]))
        new_room.save()
        return JsonResponse({"id": new_room.id}, safe=False)

    if room_type == "D":
        new_room = Room.objects.create(room_type="D")
        for i in range(len(contacts_id)):
            new_room.users.add(int(contacts_id[i]))
        new_room.save()
        return JsonResponse({"id": new_room.id}, safe=False)


# views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from .serializers import UserSerializer
import logging

logger = logging.getLogger(__name__)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_general_info(request):
    """
    Get general information about the authenticated user
    """
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
    """
    Update user information
    """
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
class RoomListView(APIView):
    def get(self, request):
        user = request.user
        rooms = Room.objects.annotate(
            last_message_content=Subquery(
                Message.objects.filter(room=OuterRef("pk"))
                .order_by("-date")
                .values("value")[:1]
            ),
            last_message_date=Subquery(
                Message.objects.filter(room=OuterRef("pk"))
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

        return Response(rooms)
