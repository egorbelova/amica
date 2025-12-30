from django.urls import path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"messages", views.MessageViewSet, basename="messages")

urlpatterns = [
    path("get_chats/", views.GetChats.as_view(), name="get_chats"),
    path(
        "get_messages/<int:chat>/",
        views.GetMessagesAPIView.as_view(),
        name="get_messages",
    ),
    path("get_general_info/", views.get_general_info, name="get_general_info"),
    path("get_contacts/", views.GetContacts, name="get_contacts"),
    path(
        "users/search/", views.UserEmailSearchView.as_view(), name="user-email-search"
    ),
    path(
        "files/<int:file_id>/", views.ProtectedFileView.as_view(), name="protected-file"
    ),
    path(
        "protected-file/<int:file_id>/<str:version>/",
        views.ProtectedFileView.as_view(),
        name="protected-file",
    ),
]

urlpatterns += router.urls
