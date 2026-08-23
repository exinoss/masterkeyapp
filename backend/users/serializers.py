"""
Serializers para la app Users.
"""
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Usuario, Estudiante, Docente, Administrador, TipoUsuario, NivelIngles


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
        """Validar que las contraseñas coincidan."""
        if attrs['password'] != attrs.pop('password_confirm'):
            raise serializers.ValidationError({
                'password_confirm': 'Las contraseñas no coinciden'
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
        elif tipo == TipoUsuario.ADMINISTRADOR:
            Administrador.objects.create(usuario=usuario)
        
        return usuario


class LoginSerializer(serializers.Serializer):
    """Serializer para login de usuarios."""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        """Validar credenciales y autenticar usuario."""
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(request=self.context.get('request'),
                              username=email, password=password)
            
            if not user:
                raise serializers.ValidationError(
                    'Credenciales inválidas. Verifica tu email y contraseña.'
                )
            
            if not user.is_active:
                raise serializers.ValidationError(
                    'Esta cuenta está desactivada.'
                )
            
            attrs['user'] = user
        else:
            raise serializers.ValidationError(
                'Debe incluir email y contraseña.'
            )
        
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
