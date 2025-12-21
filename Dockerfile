FROM python:3.14-slim

WORKDIR /app

COPY requirements.txt ./

RUN apt-get update && \
    apt-get install -y build-essential python3-dev && \
    pip install --no-cache-dir -r requirements.txt && \
    apt-get remove -y build-essential python3-dev && apt-get autoremove -y

COPY . .
RUN python manage.py makemigrations && python manage.py migrate

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

CMD ["/app/entrypoint.sh"]
