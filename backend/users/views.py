"""
Views para la app Users - Autenticación y gestión de usuarios.
"""
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate

from .models import Usuario, Estudiante, Docente, Administrador, TipoUsuario
from .serializers import (
    UsuarioSerializer, RegistroUsuarioSerializer, LoginSerializer,
    CambiarPasswordSerializer, EstudianteSerializer, EstudianteUpdateSerializer,
    DocenteSerializer, DocenteUpdateSerializer, AdministradorSerializer
)


class RegistroView(generics.CreateAPIView):
    """
    Endpoint para registrar nuevos usuarios.
    POST /api/auth/registro/
    """
    queryset = Usuario.objects.all()
    serializer_class = RegistroUsuarioSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        usuario = serializer.save()
        
        # Generar tokens JWT
        refresh = RefreshToken.for_user(usuario)
        
        return Response({
            'mensaje': 'Usuario registrado exitosamente',
            'usuario': UsuarioSerializer(usuario).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """
    Endpoint para iniciar sesión.
    POST /api/auth/login/
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        usuario = serializer.validated_data['user']
        refresh = RefreshToken.for_user(usuario)
        
        # Obtener perfil según tipo de usuario
        perfil = None
        if usuario.tipo_usuario == TipoUsuario.ESTUDIANTE:
            try:
                perfil = EstudianteSerializer(usuario.perfil_estudiante).data
            except Estudiante.DoesNotExist:
                pass
        elif usuario.tipo_usuario == TipoUsuario.DOCENTE:
            try:
                perfil = DocenteSerializer(usuario.perfil_docente).data
            except Docente.DoesNotExist:
                pass
        elif usuario.tipo_usuario == TipoUsuario.ADMINISTRADOR:
            try:
                perfil = AdministradorSerializer(usuario.perfil_administrador).data
            except Administrador.DoesNotExist:
                pass
        
        return Response({
            'mensaje': 'Login exitoso',
            'usuario': UsuarioSerializer(usuario).data,
            'perfil': perfil,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })


class LogoutView(APIView):
    """
    Endpoint para cerrar sesión (invalidar refresh token).
    POST /api/auth/logout/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'mensaje': 'Logout exitoso'})
        except Exception:
            return Response({'mensaje': 'Logout exitoso'})


class PerfilView(APIView):
    """
    Endpoint para obtener/actualizar el perfil del usuario autenticado.
    GET/PUT /api/auth/perfil/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        usuario = request.user
        
        # Obtener perfil según tipo
        perfil = None
        if usuario.tipo_usuario == TipoUsuario.ESTUDIANTE:
            try:
                perfil = EstudianteSerializer(usuario.perfil_estudiante).data
            except Estudiante.DoesNotExist:
                pass
        elif usuario.tipo_usuario == TipoUsuario.DOCENTE:
            try:
                perfil = DocenteSerializer(usuario.perfil_docente).data
            except Docente.DoesNotExist:
                pass
        elif usuario.tipo_usuario == TipoUsuario.ADMINISTRADOR:
            try:
                perfil = AdministradorSerializer(usuario.perfil_administrador).data
            except Administrador.DoesNotExist:
                pass
        
        return Response({
            'usuario': UsuarioSerializer(usuario).data,
            'perfil': perfil
        })
    
    def put(self, request):
        usuario = request.user
        
        # Actualizar datos del usuario
        usuario_data = request.data.get('usuario', {})
        for field in ['nombre', 'apellido', 'avatar_url']:
            if field in usuario_data:
                setattr(usuario, field, usuario_data[field])
        usuario.save()
        
        # Actualizar perfil según tipo
        perfil_data = request.data.get('perfil', {})
        perfil = None
        
        if usuario.tipo_usuario == TipoUsuario.ESTUDIANTE:
            try:
                estudiante = usuario.perfil_estudiante
                serializer = EstudianteUpdateSerializer(estudiante, data=perfil_data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                perfil = EstudianteSerializer(estudiante).data
            except Estudiante.DoesNotExist:
                pass
        elif usuario.tipo_usuario == TipoUsuario.DOCENTE:
            try:
                docente = usuario.perfil_docente
                serializer = DocenteUpdateSerializer(docente, data=perfil_data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                perfil = DocenteSerializer(docente).data
            except Docente.DoesNotExist:
                pass
        
        return Response({
            'mensaje': 'Perfil actualizado',
            'usuario': UsuarioSerializer(usuario).data,
            'perfil': perfil
        })


class CambiarPasswordView(APIView):
    """
    Endpoint para cambiar contraseña.
    POST /api/auth/cambiar-password/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = CambiarPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        usuario = request.user
        
        # Verificar contraseña actual
        if not usuario.check_password(serializer.validated_data['password_actual']):
            return Response(
                {'error': 'Contraseña actual incorrecta'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Cambiar contraseña
        usuario.set_password(serializer.validated_data['password_nuevo'])
        usuario.save()
        
        return Response({'mensaje': 'Contraseña actualizada exitosamente'})


# ==================== CRUD ESTUDIANTES ====================

class EstudianteListView(generics.ListAPIView):
    """
    Listar todos los estudiantes (solo docentes y admins).
    GET /api/estudiantes/
    """
    queryset = Estudiante.objects.all()
    serializer_class = EstudianteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        usuario = self.request.user
        if usuario.tipo_usuario == TipoUsuario.DOCENTE:
            # Solo estudiantes asignados al docente
            try:
                docente = usuario.perfil_docente
                return Estudiante.objects.filter(
                    docentes_asignados__docente=docente,
                    docentes_asignados__activo=True
                )
            except Docente.DoesNotExist:
                return Estudiante.objects.none()
        elif usuario.tipo_usuario == TipoUsuario.ADMINISTRADOR:
            return Estudiante.objects.all()
        return Estudiante.objects.none()


class EstudianteDetailView(generics.RetrieveUpdateAPIView):
    """
    Obtener/Actualizar un estudiante.
    GET/PUT /api/estudiantes/<id>/
    """
    queryset = Estudiante.objects.all()
    serializer_class = EstudianteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return EstudianteUpdateSerializer
        return EstudianteSerializer


# ==================== CRUD DOCENTES ====================

class DocenteListView(generics.ListAPIView):
    """
    Listar todos los docentes (solo admins).
    GET /api/docentes/
    """
    queryset = Docente.objects.all()
    serializer_class = DocenteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        usuario = self.request.user
        if usuario.tipo_usuario == TipoUsuario.ADMINISTRADOR:
            return Docente.objects.all()
        return Docente.objects.none()


class DocenteDetailView(generics.RetrieveUpdateAPIView):
    """
    Obtener/Actualizar un docente.
    GET/PUT /api/docentes/<id>/
    """
    queryset = Docente.objects.all()
    serializer_class = DocenteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return DocenteUpdateSerializer
        return DocenteSerializer
