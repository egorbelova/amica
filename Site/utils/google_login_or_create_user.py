from django.core.files.base import ContentFile
from urllib.request import urlopen
from io import BytesIO
from ..models import CustomUser


def google_login_or_create_user(id_token, client_id):
    from google.oauth2 import id_token as google_id_token
    from google.auth.transport import requests as google_requests

    data = google_id_token.verify_oauth2_token(
        id_token, google_requests.Request(), client_id
    )
    if not data or "email" not in data:
        raise ValueError("Invalid Google token")

    email = data["email"]
    first_name = data.get("given_name", "")
    last_name = data.get("family_name", "")
    avatar_url = data.get("picture")

    user, created = CustomUser.objects.get_or_create(
        email=email,
        defaults={
            "first_name": first_name,
            "last_name": last_name,
            "username": first_name.lower() + "_" + last_name.lower()[:5],
        },
    )

    profile = user.profile
    # if avatar_url and (not profile.image or created):
    #     img_temp = BytesIO(urlopen(avatar_url).read())
    #     profile.image.save(f"{user.email}_avatar.jpg", ContentFile(img_temp.read()), save=True)
    #     img_temp.close()

    return user
