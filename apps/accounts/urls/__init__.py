from .auth import urlpatterns as auth_urls
from .sessions import urlpatterns as sessions_urls

urlpatterns = auth_urls + sessions_urls
