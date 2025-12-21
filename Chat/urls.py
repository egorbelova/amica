from django.contrib import admin
from django.urls import path
from django.conf.urls import include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("Site.urls")),
]

handler404 = "Site.views.pageNotFound"
handler500 = "Site.views.pageNotFound500"
handler403 = "Site.views.pageNotFound"
handler400 = "Site.views.pageNotFound"
