# Site/apps.py
from django.apps import AppConfig


class SiteConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.Site"

    def ready(self):
        import apps.Site.signals
