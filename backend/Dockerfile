# Dockerfile — MasterKey Backend
# Tres targets:
#   builder     -> instala dependencias con uv (no se publica)
#   runtime     -> imagen final del backend Django (Gunicorn)
#   nginx_conf  -> imagen de Nginx con nginx.conf ya horneado adentro
#
# nginx.conf se hornea en el build (COPY), NO se monta por bind-mount desde
# el host: Jenkins corre containerizado, así que "docker compose" habla con
# el Docker del host, y un bind-mount de archivo se resuelve por path del
# host — que no coincide con el path del workspace de Jenkins. El contexto
# de build sí viaja bien (se manda como tar por la API de Docker).

# ---------- builder ----------
FROM python:3.12-slim AS builder

# Ninguna dependencia de pyproject.toml necesita compilar nada (psycopg2
# usa el -binary, cryptography/bcrypt/cffi ya traen wheels manylinux) —
# nada de build-essential, solo quema minutos en cada build.

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Capa de dependencias separada del código para aprovechar la cache de Docker
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

# collectstatic y migrate corren al arrancar el contenedor (no en el build)
# para no necesitar SECRET_KEY/DB reales durante el `docker build`.
CMD ["sh", "-c", "python manage.py collectstatic --no-input && python manage.py migrate --no-input && gunicorn backend.wsgi:application --bind 0.0.0.0:8000 --workers 3 --timeout 60"]

# ---------- nginx_conf ----------
# Versión PINEADA a propósito: el Docker de este servidor es viejo (API 1.41,
# Docker 20.10) y su perfil seccomp le devuelve EPERM a syscalls que usan los
# nginx nuevos — con `nginx:latest` el master muere al escribir /run/nginx.pid.
# Los otros proyectos del servidor no lo sufren porque usan `image: nginx` sin
# build y corren una imagen vieja ya cacheada ahí.
FROM nginx:1.25 AS nginx_conf

COPY nginx.conf /etc/nginx/nginx.conf
RUN mkdir -p /home/app/nginx/html /home/app/nginx/logs /home/app/nginx/ssl
