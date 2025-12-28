from django.urls import include, path

from apps.accounts import views

urlpatterns = [
    path("login/", views.api_login, name="api_login"),
    path("logout/", views.logout, name="logout"),
    path("signup/", views.signup, name="register"),
    path("google/", views.google_login, name="google_login"),
    path("refresh_token/", views.refresh_token, name="refresh_token"),
    path("passkey/register/start/", views.passkey_register_start),
    path("passkey/register/finish/", views.passkey_register_finish),
    path("passkey/auth/start/", views.passkey_auth_start),
    path("passkey/auth/finish/", views.passkey_auth_finish),
    path("active-sessions/", include("apps.accounts.urls.sessions")),
]
