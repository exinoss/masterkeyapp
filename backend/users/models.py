"""
Modelos de Usuario para AVI - Agente Virtual Inteligente.

Basado en el diagrama de clases:
- Usuario (clase base personalizada)
- Estudiante (hereda atributos, gestiona nivel de inglés y objetivos)
- Docente (supervisa reportes y retroalimentación)
- Administrador (gestión del sistema)
"""
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class TipoUsuario(models.TextChoices):
    """Tipos de usuario del sistema."""
    ESTUDIANTE = 'estudiante', 'Estudiante'
    DOCENTE = 'docente', 'Docente'
    ADMINISTRADOR = 'administrador', 'Administrador'


class NivelIngles(models.TextChoices):
    """Niveles de inglés según el Marco Común Europeo (MCER)."""
    A1 = 'A1', 'A1 - Principiante'
    A2 = 'A2', 'A2 - Elemental'
    B1 = 'B1', 'B1 - Intermedio'
    B2 = 'B2', 'B2 - Intermedio Alto'
    C1 = 'C1', 'C1 - Avanzado'
    C2 = 'C2', 'C2 - Maestría'


class UsuarioManager(BaseUserManager):
    """Manager personalizado para el modelo Usuario."""
    
    def create_user(self, email, username, password=None, **extra_fields):
        """Crear y guardar un usuario regular."""
        if not email:
            raise ValueError('El usuario debe tener un email')
        if not username:
            raise ValueError('El usuario debe tener un username')
        
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, username, password=None, **extra_fields):
        """Crear y guardar un superusuario."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_verified', True)
        extra_fields.setdefault('tipo_usuario', TipoUsuario.ADMINISTRADOR)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser debe tener is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser debe tener is_superuser=True.')
        
        return self.create_user(email, username, password, **extra_fields)


class Usuario(AbstractBaseUser, PermissionsMixin):
    """
    Modelo base de Usuario personalizado.
    Soporta login con email y diferentes tipos de usuario.
    """
    email = models.EmailField(unique=True, verbose_name='Correo Electrónico')
    username = models.CharField(max_length=100, unique=True, verbose_name='Nombre de Usuario')
    nombre = models.CharField(max_length=100, verbose_name='Nombre')
    apellido = models.CharField(max_length=100, verbose_name='Apellido')
    tipo_usuario = models.CharField(
        max_length=20,
        choices=TipoUsuario.choices,
        default=TipoUsuario.ESTUDIANTE,
        verbose_name='Tipo de Usuario'
    )
    avatar_url = models.URLField(blank=True, null=True, verbose_name='URL del Avatar')
    
    # Estados
    is_active = models.BooleanField(default=True, verbose_name='Activo')
    is_staff = models.BooleanField(default=False, verbose_name='Es Staff')
    is_verified = models.BooleanField(default=False, verbose_name='Email Verificado')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Última Actualización')
    
    objects = UsuarioManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'nombre', 'apellido']
    
    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.nombre} {self.apellido} ({self.email})"
    
    def get_full_name(self):
        return f"{self.nombre} {self.apellido}"
    
    def get_short_name(self):
        return self.nombre


class Estudiante(models.Model):
    """
    Modelo de Estudiante.
    Hereda de Usuario y gestiona nivel de inglés, objetivos y métricas.
    """
    usuario = models.OneToOneField(
        Usuario,
        on_delete=models.CASCADE,
        related_name='perfil_estudiante',
        verbose_name='Usuario'
    )
    nivel_ingles = models.CharField(
        max_length=5,
        choices=NivelIngles.choices,
        default=NivelIngles.A1,
        verbose_name='Nivel de Inglés'
    )
    objetivos = models.TextField(
        blank=True,
        null=True,
        verbose_name='Objetivos de Aprendizaje'
    )
    horas_practica = models.PositiveIntegerField(
        default=0,
        verbose_name='Horas de Práctica'
    )
    puntuacion_promedio = models.FloatField(
        default=0.0,
        verbose_name='Puntuación Promedio'
    )
    sesiones_completadas = models.PositiveIntegerField(
        default=0,
        verbose_name='Sesiones Completadas'
    )
    
    class Meta:
        verbose_name = 'Estudiante'
        verbose_name_plural = 'Estudiantes'
    
    def __str__(self):
        return f"Estudiante: {self.usuario.get_full_name()} - Nivel {self.nivel_ingles}"


class Docente(models.Model):
    """
    Modelo de Docente.
    Supervisa reportes y retroalimentación de estudiantes.
    """
    usuario = models.OneToOneField(
        Usuario,
        on_delete=models.CASCADE,
        related_name='perfil_docente',
        verbose_name='Usuario'
    )
    especialidad = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name='Especialidad'
    )
    años_experiencia = models.PositiveIntegerField(
        default=0,
        verbose_name='Años de Experiencia'
    )
    certificaciones = models.TextField(
        blank=True,
        null=True,
        verbose_name='Certificaciones'
    )
    
    class Meta:
        verbose_name = 'Docente'
        verbose_name_plural = 'Docentes'
    
    def __str__(self):
        return f"Docente: {self.usuario.get_full_name()}"


class Administrador(models.Model):
    """
    Modelo de Administrador.
    Gestiona el sistema completo.
    """
    usuario = models.OneToOneField(
        Usuario,
        on_delete=models.CASCADE,
        related_name='perfil_administrador',
        verbose_name='Usuario'
    )
    nivel_acceso = models.PositiveSmallIntegerField(
        default=1,
        verbose_name='Nivel de Acceso',
        help_text='1: Básico, 2: Medio, 3: Completo'
    )
    departamento = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name='Departamento'
    )
    
    class Meta:
        verbose_name = 'Administrador'
        verbose_name_plural = 'Administradores'
    
    def __str__(self):
        return f"Administrador: {self.usuario.get_full_name()}"


class AsignacionDocenteEstudiante(models.Model):
    """
    Relación entre Docentes y Estudiantes asignados.
    """
    docente = models.ForeignKey(
        Docente,
        on_delete=models.CASCADE,
        related_name='estudiantes_asignados',
        verbose_name='Docente'
    )
    estudiante = models.ForeignKey(
        Estudiante,
        on_delete=models.CASCADE,
        related_name='docentes_asignados',
        verbose_name='Estudiante'
    )
    fecha_asignacion = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de Asignación'
    )
    activo = models.BooleanField(default=True, verbose_name='Activo')
    
    class Meta:
        verbose_name = 'Asignación Docente-Estudiante'
        verbose_name_plural = 'Asignaciones Docente-Estudiante'
        unique_together = ['docente', 'estudiante']
    
    def __str__(self):
        return f"{self.docente.usuario.get_full_name()} -> {self.estudiante.usuario.get_full_name()}"
