#!/usr/bin/env bash
# Terminar si hay cualquier error
set -o errexit

# Actualizar pip e instalar requerimientos desde la raíz del proyecto
python -m pip install --upgrade pip
pip install -r requirements.txt

# Moverse a la carpeta del backend
cd backend

# Recopilar archivos estáticos y ejecutar las migraciones de base de datos
python manage.py collectstatic --no-input
python manage.py migrate
