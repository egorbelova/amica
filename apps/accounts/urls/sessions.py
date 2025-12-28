from django.urls import path

from apps.accounts import views

urlpatterns = [
    path("", views.ActiveSessionsView.as_view(), name="sessions-list"),
    path("others/", views.KillOtherSessionsView.as_view(), name="sessions-kill-others"),
    path("<str:jti>/", views.ActiveSessionsView.as_view(), name="sessions-kill-one"),
]
