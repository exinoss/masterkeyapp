# Dockerfile — MasterKey Backend
# Dos targets:
#   builder  -> instala dependencias con uv (no se publica)
#   runtime  -> imagen final del backend Django (Gunicorn)
#
# El servicio de Nginx no se construye acá — usa la imagen "nginx" tal cual
# y monta nginx.conf directo (ver docker-compose.yml), igual que el resto
# de los proyectos en este servidor.

# ---------- builder ----------
FROM python:3.12-slim AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Capa de dependencias separada del código para aprovechar la cache de Docker
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

COPY . .

# ---------- runtime ----------
FROM python:3.12-slim AS runtime

RUN useradd --create-home --uid 1000 app

WORKDIR /app
COPY --from=builder --chown=app:app /app /app

ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

USER app

EXPOSE 8000

# collectstatic y migrate corren al arrancar el contenedor (no en el build)
# para no necesitar SECRET_KEY/DB reales durante el `docker build`.
CMD ["sh", "-c", "python manage.py collectstatic --no-input && python manage.py migrate --no-input && gunicorn backend.wsgi:application --bind 0.0.0.0:8000 --workers 3 --timeout 60"]
