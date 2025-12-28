from django.contrib.auth import get_user_model
from django.utils import timezone


def run():
    User = get_user_model()

    admin_email = "a@a.com"
    if not User.objects.filter(email=admin_email).exists():
        admin = User.objects.create_superuser(
            username="admin", email=admin_email, password="admin"
        )
        print(f"Created admin: {admin_email}")

    names = [
        "Calista Monroe",
        "Ayla Reed",
        "Aurora Sinclair II",
        "Amarantha Blackwood",
        "Luna Everhart",
        "Isla Montgomery",
        "Seraphina Vale",
        "Elara Whitlock",
        "Ophelia Drake",
        "Selene Hawthorne",
    ]

    for i, full_name in enumerate(names, start=1):
        first_name, last_name = full_name.split(" ", 1)
        email = f"user{i}@example.com"

        if not User.objects.filter(email=email).exists():
            user = User.objects.create_user(
                username=full_name.replace(" ", "_"),
                email=email,
                password="password123",
                first_name=first_name,
                last_name=last_name,
            )
            print(f"Created user: {email} with username: {user.username}")
