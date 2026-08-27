"""
URL configuration for backend project - AVI (Agente Virtual Inteligente).
"""
from django.contrib import admin
from django.http import HttpResponse
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static


def health(request):
    """Usado por el healthcheck del contenedor Docker — sin auth, sin DB."""
    return HttpResponse('ok')


def raiz(request):
    """Confirmación visual rápida de que el backend real responde."""
    return HttpResponse('API MasterKey encendida 🔑')


urlpatterns = [
    path('', raiz),
    path('health', health),
    path('admin/', admin.site.urls),

    # API endpoints
    path('api/', include('users.urls')),
    path('api/', include('chatbot.urls')),
]

# Servir archivos media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

