"""
Admin para la app Chatbot.
"""
from django.contrib import admin
from .models import AgenteVirtual, SesionPractica, Retroalimentacion, ConfiguracionServicio


@admin.register(AgenteVirtual)
class AgenteVirtualAdmin(admin.ModelAdmin):
    """Admin para el modelo AgenteVirtual."""
    list_display = ['nombre', 'idioma_objetivo', 'voz_configurada', 'is_active', 'created_at']
    list_filter = ['is_active', 'idioma_objetivo']
    search_fields = ['nombre', 'descripcion']


@admin.register(SesionPractica)
class SesionPracticaAdmin(admin.ModelAdmin):
    """Admin para el modelo SesionPractica."""
    list_display = ['id', 'estudiante', 'agente', 'tema_practica', 'estado', 'puntuacion_sesion', 'fecha_inicio']
    list_filter = ['estado', 'nivel_dificultad', 'fecha_inicio']
    search_fields = ['titulo', 'tema_practica', 'estudiante__usuario__email']
    raw_id_fields = ['estudiante', 'agente']
    date_hierarchy = 'fecha_inicio'


@admin.register(Retroalimentacion)
class RetroalimentacionAdmin(admin.ModelAdmin):
    """Admin para el modelo Retroalimentacion."""
    list_display = ['id', 'sesion', 'puntuacion_pronunciacion', 'puntuacion_fluidez', 'created_at']
    list_filter = ['created_at']
    search_fields = ['texto_original', 'texto_esperado', 'respuesta_agente']
    raw_id_fields = ['sesion']
    date_hierarchy = 'created_at'


@admin.register(ConfiguracionServicio)
class ConfiguracionServicioAdmin(admin.ModelAdmin):
    """Admin para el modelo ConfiguracionServicio."""
    list_display = ['nombre_servicio', 'tipo', 'is_active', 'created_at']
    list_filter = ['tipo', 'is_active']
    search_fields = ['nombre_servicio']
