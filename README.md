# Instrucciones de Ejecución

## 1. Configurar y Ejecutar el Backend (Django)

1. Abrir una terminal en la ruta raíz del proyecto.
2. (Si no tienes el entorno virtual creado) Crear el entorno virtual:
   ```cmd
   python -m venv venv
   ```
3. Activar el entorno virtual:
   ```cmd
   .\venv\Scripts\activate.ps1
   ```
4. Instalar las dependencias usando el archivo requirements:
   ```cmd
   pip install -r requirements.txt
   ```
5. Navegar a la carpeta `backend`:
   ```cmd
   cd backend
   ```
6. (Si no has hecho las migraciones a la BD) Crear y aplicar migraciones:
   ```cmd
   python manage.py makemigrations
   python manage.py migrate
   ```
7. (Si necesitas un usuario administrador) Crear un superusuario:
   ```cmd
   python manage.py createsuperuser
   ```
8. Ejecutar el servidor principal:
   ```cmd
   python manage.py runserver
   ```

## 2. Configurar y Ejecutar el Frontend (Vite/React)

1. Abrir una nueva terminal en la ruta raíz del proyecto.
2. Navegar a la carpeta `frontend`:
   ```cmd
   cd frontend
   ```
3. Instalar dependencias correspondientes (solo la primera vez):
   ```cmd
   npm install
   ```
4. Iniciar el servidor de desarrollo:
   ```cmd
   npm run dev
   ```

## 3. Despliegue en Render (Producción / Gratis)

Sigue estos pasos en [Render.com](https://render.com/):

### Paso A: Base de Datos (PostgreSQL)

1. En Render, crea un nuevo **PostgreSQL**.
2. Dale el nombre `bdAVI` (o el que gustes) y selecciona la capa Free.
3. Una vez creado, busca y copia la variable llamada **"Internal Database URL"**.

### Paso B: Backend Django (Web Service)

1. En Render, crea un nuevo **Web Service** y conecta tu repositorio de GitHub.
2. En la configuración:
   - **Environment:** `Python 3`
   - **Build Command:** `bash build.sh`
   - **Start Command:** `cd backend && gunicorn backend.wsgi:application`
3. Ve a **"Environment Variables"** y añade:
   - `DATABASE_URL` (pega aquí la URL interna que copiaste en el Paso A, pero **cambia la palabra `postgres://` por `postgresql://`** al inicio del link).
   - `SECRET_KEY` (django-insecure-2(y@+#^4+dilad1l_6o#-n8yzc2gb$hfc$@c#!tx=2^cao1+a0).
   - `DEBUG` con el valor `True`.
   - `PYTHON_VERSION` con el valor `3.12.3`.
4. Guarda y espera a que el despliegue finalice exitosamente. Al terminar, **copia la URL pública web que Render te asignó** (ej. `https://tu-backend.onrender.com`).

### Paso C: Frontend Vite (Static Site)

1. En Render, crea un nuevo **Static Site** y conecta el mismo repositorio de GitHub.
2. En la configuración:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
3. Ve a **"Environment Variables"** y añade:
   - `VITE_API_URL` (pega aquí la URL de tu backend del Paso B agregándole `/api` al final. Ej: `https://tu-backend.onrender.com/api`).
3.1. En la sección "Redirects/Rewrites" añade una nueva regla exactamente así: 
    - **Source:** `/*`
    - **Destination:** `/index.html`
    - **Action:** `Rewrite`.
4. Guarda y listo. 
