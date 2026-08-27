# Dockerfile — MasterKey Backend
# builder -> instala deps con uv | runtime -> backend Django | nginx_conf -> Nginx con conf horneada

# ---------- builder ----------
FROM python:3.12-slim AS builder

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

COPY . .

# ---------- runtime ----------
FROM python:3.12-slim AS runtime

WORKDIR /app
COPY --from=builder /app /app

ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["sh", "-c", "python manage.py collectstatic --no-input && python manage.py migrate --no-input && gunicorn backend.wsgi:application --bind 0.0.0.0:8000 --workers 3 --timeout 60"]

# ---------- nginx_conf ----------
# Pineada a 1.25: el Docker del servidor (API 1.41) rechaza syscalls de nginx:latest (EPERM en /run/nginx.pid)
FROM nginx:1.25 AS nginx_conf

COPY nginx.conf /etc/nginx/nginx.conf
RUN mkdir -p /home/app/nginx/html /home/app/nginx/logs /home/app/nginx/ssl
