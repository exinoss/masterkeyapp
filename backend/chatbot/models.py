"""
Modelos del Chatbot - AVI (Agente Virtual Inteligente).

Basado en el diagrama de clases:
- AgenteVirtual: Orquesta los servicios ASR, NLP y TTS
- SesionPractica: Interacción principal del estudiante
- Retroalimentacion: Corrección gramatical y métricas de pronunciación
- ConfiguracionServicio: Configuración de servicios externos
"""
from django.db import models
from users.models import Estudiante


class EstadoSesion(models.TextChoices):
    """Estados posibles de una sesión de práctica."""
    INICIADA = 'iniciada', 'Iniciada'
    EN_PROGRESO = 'en_progreso', 'En Progreso'
    COMPLETADA = 'completada', 'Completada'
    CANCELADA = 'cancelada', 'Cancelada'
    PAUSADA = 'pausada', 'Pausada'


class TipoServicio(models.TextChoices):
    """Tipos de servicios del agente virtual."""
    ASR = 'ASR', 'Reconocimiento de Voz (ASR)'
    NLP = 'NLP', 'Procesamiento de Lenguaje Natural (NLP)'
    TTS = 'TTS', 'Síntesis de Voz (TTS)'


class AgenteVirtual(models.Model):
    """
    Modelo del Agente Virtual.
    Orquesta los servicios tecnológicos:
    - ServicioASR (Reconocimiento de voz)
    - ServicioNLP (Procesamiento de lenguaje)
    - ServicioTTS (Síntesis de voz)
    """
    nombre = models.CharField(
        max_length=100,
        default='AVI Assistant',
        verbose_name='Nombre del Agente'
    )
    descripcion = models.TextField(
        blank=True,
        null=True,
        verbose_name='Descripción'
    )
    avatar_3d_url = models.URLField(
        blank=True,
        null=True,
        verbose_name='URL del Modelo 3D del Avatar'
    )
    voz_configurada = models.CharField(
        max_length=100,
        default='es-ES',
        verbose_name='Configuración de Voz TTS'
    )
    idioma_objetivo = models.CharField(
        max_length=50,
        default='en-US',
        verbose_name='Idioma Objetivo',
        help_text='Idioma que el agente enseña'
    )
    personalidad = models.JSONField(
        blank=True,
        null=True,
        verbose_name='Configuración de Personalidad'
    )
    is_active = models.BooleanField(default=True, verbose_name='Activo')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creación')
    
    class Meta:
        verbose_name = 'Agente Virtual'
        verbose_name_plural = 'Agentes Virtuales'
    
    def __str__(self):
        return self.nombre


class SesionPractica(models.Model):
    """
    Modelo de Sesión de Práctica.
    Representa la interacción principal entre el estudiante y el agente virtual.
    """
    estudiante = models.ForeignKey(
        Estudiante,
        on_delete=models.CASCADE,
        related_name='sesiones',
        verbose_name='Estudiante'
    )
    agente = models.ForeignKey(
        AgenteVirtual,
        on_delete=models.SET_NULL,
        null=True,
        related_name='sesiones',
        verbose_name='Agente Virtual'
    )
    
    # Información de la sesión
    titulo = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name='Título'
    )
    tema_practica = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name='Tema de Práctica',
        help_text='Ej: Saludos, Restaurante, Entrevista de trabajo'
    )
    nivel_dificultad = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name='Nivel de Dificultad'
    )
    
    # Métricas de la sesión
    duracion_minutos = models.PositiveIntegerField(
        default=0,
        verbose_name='Duración (minutos)'
    )
    palabras_practicadas = models.PositiveIntegerField(
        default=0,
        verbose_name='Palabras Practicadas'
    )
    frases_correctas = models.PositiveIntegerField(
        default=0,
        verbose_name='Frases Correctas'
    )
    frases_incorrectas = models.PositiveIntegerField(
        default=0,
        verbose_name='Frases Incorrectas'
    )
    puntuacion_sesion = models.FloatField(
        default=0.0,
        verbose_name='Puntuación de la Sesión',
        help_text='Puntuación de 0 a 100'
    )
    
    # Estado y tiempos
    estado = models.CharField(
        max_length=20,
        choices=EstadoSesion.choices,
        default=EstadoSesion.INICIADA,
        verbose_name='Estado'
    )
    fecha_inicio = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de Inicio'
    )
    fecha_fin = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name='Fecha de Fin'
    )
    
    # Historial de conversación
    historial_conversacion = models.JSONField(
        blank=True,
        null=True,
        default=list,
        verbose_name='Historial de Conversación'
    )
    
    class Meta:
        verbose_name = 'Sesión de Práctica'
        verbose_name_plural = 'Sesiones de Práctica'
        ordering = ['-fecha_inicio']
    
    def __str__(self):
        return f"Sesión {self.id} - {self.estudiante.usuario.get_full_name()} - {self.estado}"
    
    def calcular_puntuacion(self):
        """Calcula la puntuación basada en frases correctas e incorrectas."""
        total = self.frases_correctas + self.frases_incorrectas
        if total > 0:
            self.puntuacion_sesion = (self.frases_correctas / total) * 100
            self.save()
        return self.puntuacion_sesion


class Retroalimentacion(models.Model):
    """
    Modelo de Retroalimentación.
    Encapsula los datos de corrección gramatical y métricas de pronunciación
    generados durante cada interacción en la sesión.
    """
    sesion = models.ForeignKey(
        SesionPractica,
        on_delete=models.CASCADE,
        related_name='retroalimentaciones',
        verbose_name='Sesión'
    )
    
    # Texto original y corregido
    texto_original = models.TextField(
        verbose_name='Texto Original',
        help_text='Lo que dijo el estudiante'
    )
    texto_esperado = models.TextField(
        blank=True,
        null=True,
        verbose_name='Texto Esperado',
        help_text='Lo que debería haber dicho'
    )
    texto_corregido = models.TextField(
        blank=True,
        null=True,
        verbose_name='Texto Corregido',
        help_text='Corrección sugerida'
    )
    
    # Métricas de pronunciación (0-100)
    puntuacion_pronunciacion = models.FloatField(
        default=0.0,
        verbose_name='Puntuación de Pronunciación'
    )
    puntuacion_fluidez = models.FloatField(
        default=0.0,
        verbose_name='Puntuación de Fluidez'
    )
    puntuacion_entonacion = models.FloatField(
        default=0.0,
        verbose_name='Puntuación de Entonación'
    )
    puntuacion_ritmo = models.FloatField(
        default=0.0,
        verbose_name='Puntuación de Ritmo'
    )
    
    # Análisis gramatical
    errores_gramaticales = models.JSONField(
        blank=True,
        null=True,
        default=list,
        verbose_name='Errores Gramaticales'
    )
    sugerencias = models.JSONField(
        blank=True,
        null=True,
        default=list,
        verbose_name='Sugerencias de Mejora'
    )
    
    # Análisis fonético
    fonemas_problematicos = models.JSONField(
        blank=True,
        null=True,
        default=list,
        verbose_name='Fonemas Problemáticos'
    )
    palabras_problematicas = models.JSONField(
        blank=True,
        null=True,
        default=list,
        verbose_name='Palabras Problemáticas'
    )
    
    # Audio
    audio_estudiante = models.FileField(
        upload_to='audios/estudiantes/',
        blank=True,
        null=True,
        verbose_name='Audio del Estudiante'
    )
    audio_correccion = models.FileField(
        upload_to='audios/correcciones/',
        blank=True,
        null=True,
        verbose_name='Audio de Corrección'
    )
    
    # Respuesta del agente
    respuesta_agente = models.TextField(
        blank=True,
        null=True,
        verbose_name='Respuesta del Agente'
    )
    audio_respuesta = models.FileField(
        upload_to='audios/respuestas/',
        blank=True,
        null=True,
        verbose_name='Audio de Respuesta'
    )
    
    # Tiempos
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de Creación'
    )
    tiempo_respuesta_ms = models.PositiveIntegerField(
        default=0,
        verbose_name='Tiempo de Respuesta (ms)'
    )
    
    class Meta:
        verbose_name = 'Retroalimentación'
        verbose_name_plural = 'Retroalimentaciones'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Retroalimentación {self.id} - Sesión {self.sesion.id}"
    
    def puntuacion_general(self):
        """Calcula la puntuación general promediando todas las métricas."""
        metricas = [
            self.puntuacion_pronunciacion,
            self.puntuacion_fluidez,
            self.puntuacion_entonacion,
            self.puntuacion_ritmo
        ]
        return sum(metricas) / len(metricas)


class ConfiguracionServicio(models.Model):
    """
    Configuración de los servicios del agente virtual.
    Almacena la configuración de ASR, NLP y TTS.
    """
    nombre_servicio = models.CharField(
        max_length=100,
        verbose_name='Nombre del Servicio'
    )
    tipo = models.CharField(
        max_length=10,
        choices=TipoServicio.choices,
        verbose_name='Tipo de Servicio'
    )
    configuracion = models.JSONField(
        blank=True,
        null=True,
        verbose_name='Configuración',
        help_text='Configuración específica del servicio en formato JSON'
    )
    is_active = models.BooleanField(default=True, verbose_name='Activo')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Configuración de Servicio'
        verbose_name_plural = 'Configuraciones de Servicio'
    
    def __str__(self):
        return f"{self.nombre_servicio} ({self.tipo})"
