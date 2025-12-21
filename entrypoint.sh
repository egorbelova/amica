#!/bin/sh
set -e

export DJANGO_SETTINGS_MODULE=Chat.settings

python manage.py makemigrations --noinput
python manage.py migrate --noinput

python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); \
User.objects.filter(email='admin@gmail.com').exists() or User.objects.create_superuser(email='admin@gmail.com', password='admin')"

python manage.py collectstatic --no-input

exec daphne Chat.asgi:application -b 0.0.0.0 -p 8000
