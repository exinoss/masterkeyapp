"""
Serializers para la app Users.
"""
from rest_framework import serializers
from .models import (
    Usuario, Estudiante, Docente, Administrador, Curso, Inscripcion,
    TipoUsuario, NivelIngles
)


class UsuarioSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Usuario (lectura)."""
    
    class Meta:
        model = Usuario
        fields = [
            'id', 'email', 'username', 'nombre', 'apellido',
            'tipo_usuario', 'avatar_url', 'is_active', 'is_verified',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class RegistroUsuarioSerializer(serializers.ModelSerializer):
    """Serializer para registrar nuevos usuarios."""
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True, min_length=6)
    
    # Campos adicionales según tipo de usuario
    nivel_ingles = serializers.ChoiceField(
        choices=NivelIngles.choices,
        required=False,
        default=NivelIngles.A1
    )
    objetivos = serializers.CharField(required=False, allow_blank=True)
    especialidad = serializers.CharField(required=False, allow_blank=True)
    años_experiencia = serializers.IntegerField(required=False, default=0)
    
    class Meta:
        model = Usuario
        fields = [
            'email', 'username', 'password', 'password_confirm',
            'nombre', 'apellido', 'tipo_usuario',
            # Campos de estudiante
            'nivel_ingles', 'objetivos',
            # Campos de docente
            'especialidad', 'años_experiencia'
        ]
    
    def validate(self, attrs):
        """Validar que las contraseñas coincidan y el tipo de usuario sea uno permitido."""
        if attrs['password'] != attrs.pop('password_confirm'):
            raise serializers.ValidationError({
                'password_confirm': 'Las contraseñas no coinciden'
            })

        # El registro público solo puede crear Estudiantes o Docentes.
        # Administrador se crea únicamente desde el panel admin de Django
        # (ver AdministradorAdmin) — nunca vía este endpoint, sin importar
        # qué mande el cliente.
        tipo = attrs.get('tipo_usuario', TipoUsuario.ESTUDIANTE)
        if tipo not in (TipoUsuario.ESTUDIANTE, TipoUsuario.DOCENTE):
            raise serializers.ValidationError({
                'tipo_usuario': 'El registro público solo admite Estudiante o Docente.'
            })

        return attrs

    def create(self, validated_data):
        """Crear usuario y perfil según tipo."""
        # Extraer campos de perfil específico
        nivel_ingles = validated_data.pop('nivel_ingles', NivelIngles.A1)
        objetivos = validated_data.pop('objetivos', '')
        especialidad = validated_data.pop('especialidad', '')
        años_experiencia = validated_data.pop('años_experiencia', 0)

        # Crear usuario base
        password = validated_data.pop('password')
        usuario = Usuario.objects.create_user(password=password, **validated_data)

        # Crear perfil según tipo de usuario
        tipo = validated_data.get('tipo_usuario', TipoUsuario.ESTUDIANTE)

        if tipo == TipoUsuario.ESTUDIANTE:
            Estudiante.objects.create(
                usuario=usuario,
                nivel_ingles=nivel_ingles,
                objetivos=objetivos
            )
        elif tipo == TipoUsuario.DOCENTE:
            Docente.objects.create(
                usuario=usuario,
                especialidad=especialidad,
                años_experiencia=años_experiencia
            )
            # Los Docentes quedan inactivos hasta que un Administrador los
            # apruebe desde /admin/ (ver LoginSerializer y RegistroView).
            usuario.is_active = False
            usuario.save(update_fields=['is_active'])

        return usuario


class LoginSerializer(serializers.Serializer):
    """Serializer para login de usuarios."""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        """
        Validar credenciales y autenticar usuario.

        No se usa `django.contrib.auth.authenticate()` porque su backend
        por defecto descarta usuarios con is_active=False devolviendo None,
        lo que volvería indistinguible "contraseña incorrecta" de "cuenta
        de Docente pendiente de aprobación". Se busca el usuario a mano
        para poder dar un mensaje específico en ese caso.
        """
        email = attrs.get('email')
        password = attrs.get('password')

        if not (email and password):
            raise serializers.ValidationError(
                'Debe incluir email y contraseña.'
            )

        try:
            user = Usuario.objects.get(email=email)
        except Usuario.DoesNotExist:
            user = None

        if user is None or not user.check_password(password):
            raise serializers.ValidationError(
                'Credenciales inválidas. Verifica tu email y contraseña.'
            )

        if not user.is_active:
            if user.tipo_usuario == TipoUsuario.DOCENTE:
                raise serializers.ValidationError(
                    'Tu cuenta de docente está pendiente de aprobación por un administrador.'
                )
            raise serializers.ValidationError(
                'Esta cuenta está desactivada.'
            )

        attrs['user'] = user
        return attrs


class CambiarPasswordSerializer(serializers.Serializer):
    """Serializer para cambiar contraseña."""
    password_actual = serializers.CharField(write_only=True)
    password_nuevo = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True, min_length=6)
    
    def validate(self, attrs):
        if attrs['password_nuevo'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Las contraseñas no coinciden'
            })
        return attrs


# ==================== ESTUDIANTE ====================

class EstudianteSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Estudiante."""
    usuario = UsuarioSerializer(read_only=True)
    
    class Meta:
        model = Estudiante
        fields = [
            'id', 'usuario', 'nivel_ingles', 'objetivos',
            'horas_practica', 'puntuacion_promedio', 'sesiones_completadas'
        ]


class EstudianteUpdateSerializer(serializers.ModelSerializer):
    """Serializer para actualizar estudiante."""
    
    class Meta:
        model = Estudiante
        fields = ['nivel_ingles', 'objetivos']


# ==================== DOCENTE ====================

class DocenteSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Docente."""
    usuario = UsuarioSerializer(read_only=True)
    
    class Meta:
        model = Docente
        fields = [
            'id', 'usuario', 'especialidad',
            'años_experiencia', 'certificaciones'
        ]


class DocenteUpdateSerializer(serializers.ModelSerializer):
    """Serializer para actualizar docente."""
    
    class Meta:
        model = Docente
        fields = ['especialidad', 'años_experiencia', 'certificaciones']


# ==================== ADMINISTRADOR ====================

class AdministradorSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Administrador."""
    usuario = UsuarioSerializer(read_only=True)

    class Meta:
        model = Administrador
        fields = ['id', 'usuario', 'nivel_acceso', 'departamento']


# ==================== CURSOS (código de acceso) ====================
# Reemplaza la asignación manual de Docente-Estudiante hacia adelante: el
# Docente crea un Curso con fechas y un código; el Estudiante se une solo
# con ese código (ver UnirseCursoView). AsignacionDocenteEstudiante (arriba
# en models.py) se deja intacta por los datos reales que ya tiene, pero
# ya no se crea nada nuevo ahí a mano.

class CursoSerializer(serializers.ModelSerializer):
    """Serializer de lectura — incluye el nombre del docente y si venció."""
    docente_nombre = serializers.CharField(source='docente.usuario.get_full_name', read_only=True)
    vencido = serializers.ReadOnlyField()
    total_inscritos = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Curso
        fields = [
            'id', 'nombre', 'codigo', 'fecha_inicio', 'fecha_fin',
            'docente_nombre', 'vencido', 'total_inscritos', 'created_at'
        ]
        read_only_fields = ['id', 'codigo', 'created_at']


class CursoCreateSerializer(serializers.ModelSerializer):
    """Serializer para que un Docente cree un curso — el código lo genera
    la vista, no se recibe del cliente."""

    class Meta:
        model = Curso
        fields = ['nombre', 'fecha_inicio', 'fecha_fin']

    def validate(self, attrs):
        if attrs['fecha_fin'] <= attrs['fecha_inicio']:
            raise serializers.ValidationError({
                'fecha_fin': 'La fecha de fin debe ser posterior a la de inicio.'
            })
        return attrs


class InscripcionSerializer(serializers.ModelSerializer):
    """Serializer de lectura para 'mi curso' del Estudiante — el curso va
    anidado para no tener que pedirlo aparte."""
    curso = CursoSerializer(read_only=True)

    class Meta:
        model = Inscripcion
        fields = ['id', 'curso', 'fecha_inscripcion']
