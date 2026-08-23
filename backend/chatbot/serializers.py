"""
Serializers para la app Chatbot (AVI).
"""
from rest_framework import serializers
from .models import AgenteVirtual, SesionPractica, Retroalimentacion, ConfiguracionServicio
from users.serializers import EstudianteSerializer


class AgenteVirtualSerializer(serializers.ModelSerializer):
    """Serializer para el modelo AgenteVirtual."""
    
    class Meta:
        model = AgenteVirtual
        fields = [
            'id', 'nombre', 'descripcion', 'avatar_3d_url',
            'voz_configurada', 'idioma_objetivo', 'personalidad',
            'is_active', 'created_at'
        ]


class RetroalimentacionSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Retroalimentacion."""
    puntuacion_general = serializers.SerializerMethodField()
    
    class Meta:
        model = Retroalimentacion
        fields = [
            'id', 'sesion', 'texto_original', 'texto_esperado', 'texto_corregido',
            'puntuacion_pronunciacion', 'puntuacion_fluidez',
            'puntuacion_entonacion', 'puntuacion_ritmo', 'puntuacion_general',
            'errores_gramaticales', 'sugerencias',
            'fonemas_problematicos', 'palabras_problematicas',
            'respuesta_agente', 'audio_respuesta',
            'created_at', 'tiempo_respuesta_ms'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_puntuacion_general(self, obj):
        return obj.puntuacion_general()


class RetroalimentacionCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear retroalimentación (entrada del estudiante)."""
    
    class Meta:
        model = Retroalimentacion
        fields = ['sesion', 'texto_original', 'texto_esperado', 'audio_estudiante']


class SesionPracticaSerializer(serializers.ModelSerializer):
    """Serializer para el modelo SesionPractica."""
    agente = AgenteVirtualSerializer(read_only=True)
    retroalimentaciones = RetroalimentacionSerializer(many=True, read_only=True)
    total_retroalimentaciones = serializers.SerializerMethodField()
    
    class Meta:
        model = SesionPractica
        fields = [
            'id', 'estudiante', 'agente', 'titulo', 'tema_practica',
            'nivel_dificultad', 'duracion_minutos', 'palabras_practicadas',
            'frases_correctas', 'frases_incorrectas', 'puntuacion_sesion',
            'estado', 'fecha_inicio', 'fecha_fin',
            'historial_conversacion', 'retroalimentaciones', 'total_retroalimentaciones'
        ]
        read_only_fields = ['id', 'estudiante', 'fecha_inicio', 'puntuacion_sesion']
    
    def get_total_retroalimentaciones(self, obj):
        return obj.retroalimentaciones.count()


class SesionPracticaCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear una sesión de práctica."""
    
    class Meta:
        model = SesionPractica
        fields = ['titulo', 'tema_practica', 'nivel_dificultad', 'agente']


class SesionPracticaListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listar sesiones."""
    agente_nombre = serializers.CharField(source='agente.nombre', read_only=True)
    
    class Meta:
        model = SesionPractica
        fields = [
            'id', 'titulo', 'tema_practica', 'nivel_dificultad',
            'puntuacion_sesion', 'estado', 'duracion_minutos',
            'fecha_inicio', 'fecha_fin', 'agente_nombre'
        ]


class InteraccionRequestSerializer(serializers.Serializer):
    """
    Serializer para solicitud de interacción con el agente virtual.
    El estudiante envía su audio/texto y recibe respuesta del agente.
    """
    sesion_id = serializers.IntegerField()
    texto_estudiante = serializers.CharField(required=False, allow_blank=True)
    audio_base64 = serializers.CharField(required=False, allow_blank=True)
    texto_esperado = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, attrs):
        """Validar que se envíe texto o audio."""
        if not attrs.get('texto_estudiante') and not attrs.get('audio_base64'):
            raise serializers.ValidationError(
                'Debe enviar texto o audio del estudiante.'
            )
        return attrs


class InteraccionResponseSerializer(serializers.Serializer):
    """
    Serializer de respuesta de la interacción con el agente virtual.
    """
    success = serializers.BooleanField()
    mensaje = serializers.CharField()
    retroalimentacion = RetroalimentacionSerializer(required=False)
    respuesta_texto = serializers.CharField(required=False)
    respuesta_audio_url = serializers.CharField(required=False)
    puntuacion_general = serializers.FloatField(default=0.0)
    necesita_repetir = serializers.BooleanField(default=False)
    emocion_avatar = serializers.CharField(default='neutral')
    animacion_avatar = serializers.CharField(required=False)


class ConfiguracionServicioSerializer(serializers.ModelSerializer):
    """Serializer para configuración de servicios."""
    
    class Meta:
        model = ConfiguracionServicio
        fields = ['id', 'nombre_servicio', 'tipo', 'configuracion', 'is_active']


class EstadisticasSesionSerializer(serializers.Serializer):
    """Serializer para estadísticas de una sesión."""
    total_interacciones = serializers.IntegerField()
    puntuacion_promedio = serializers.FloatField()
    palabras_correctas = serializers.IntegerField()
    palabras_incorrectas = serializers.IntegerField()
    tiempo_total_minutos = serializers.IntegerField()
    fonemas_practicados = serializers.ListField(child=serializers.CharField())
    areas_mejora = serializers.ListField(child=serializers.CharField())


class ReporteEstudianteSerializer(serializers.Serializer):
    """Serializer para reporte de estudiante (para docentes)."""
    estudiante_id = serializers.IntegerField()
    nombre_estudiante = serializers.CharField()
    nivel_actual = serializers.CharField()
    sesiones_totales = serializers.IntegerField()
    tiempo_practica_total = serializers.IntegerField()
    puntuacion_promedio = serializers.FloatField()
    progreso = serializers.DictField()
    areas_mejora = serializers.ListField(child=serializers.CharField())
    recomendaciones = serializers.ListField(child=serializers.CharField())
