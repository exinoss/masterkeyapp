"""
Views para la app Users - Autenticación y gestión de usuarios.
"""
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate

from .models import (
    Usuario, Estudiante, Docente, Administrador, AsignacionDocenteEstudiante, TipoUsuario
)
from .serializers import (
    UsuarioSerializer, RegistroUsuarioSerializer, LoginSerializer,
    CambiarPasswordSerializer, EstudianteSerializer, EstudianteUpdateSerializer,
    DocenteSerializer, DocenteUpdateSerializer, AdministradorSerializer,
    AsignacionDocenteEstudianteSerializer
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

        if not usuario.is_active:
            # Docente recién registrado: queda pendiente de aprobación de
            # un Administrador (se activa desde /admin/). No se emiten
            # tokens para no autenticar una cuenta que aún no puede operar.
            return Response({
                'mensaje': 'Tu cuenta fue creada y está pendiente de aprobación por un administrador.',
                'usuario': UsuarioSerializer(usuario).data,
                'pendiente_aprobacion': True,
            }, status=status.HTTP_201_CREATED)

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


# ==================== GESTIÓN DE USUARIOS (solo Administrador) ====================
#
# Antes de estas vistas, la única forma de aprobar un Docente pendiente o
# de asignarle estudiantes era entrar a /admin/ de Django directamente —
# el rol de Administrador no tenía ninguna función real dentro de la app.

class UsuarioListView(generics.ListAPIView):
    """
    Listar todos los usuarios de la plataforma (solo Administrador).
    GET /api/usuarios/
    """
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.tipo_usuario == TipoUsuario.ADMINISTRADOR:
            return Usuario.objects.all().order_by('-created_at')
        return Usuario.objects.none()


class ActivarUsuarioView(APIView):
    """
    Activar una cuenta (aprobar un Docente pendiente, o reactivar una
    cuenta desactivada). Solo Administrador.
    POST /api/usuarios/<id>/activar/
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if request.user.tipo_usuario != TipoUsuario.ADMINISTRADOR:
            return Response({'error': 'Solo un administrador puede hacer esto'}, status=status.HTTP_403_FORBIDDEN)
        try:
            usuario = Usuario.objects.get(pk=pk)
        except Usuario.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        usuario.is_active = True
        usuario.save(update_fields=['is_active'])
        return Response({'mensaje': 'Usuario activado', 'usuario': UsuarioSerializer(usuario).data})


class DesactivarUsuarioView(APIView):
    """
    Desactivar una cuenta. Solo Administrador.
    POST /api/usuarios/<id>/desactivar/
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if request.user.tipo_usuario != TipoUsuario.ADMINISTRADOR:
            return Response({'error': 'Solo un administrador puede hacer esto'}, status=status.HTTP_403_FORBIDDEN)
        if int(pk) == request.user.id:
            return Response({'error': 'No podés desactivar tu propia cuenta'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            usuario = Usuario.objects.get(pk=pk)
        except Usuario.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        usuario.is_active = False
        usuario.save(update_fields=['is_active'])
        return Response({'mensaje': 'Usuario desactivado', 'usuario': UsuarioSerializer(usuario).data})


# ==================== ASIGNACIÓN DOCENTE-ESTUDIANTE (Administrador) ====================
#
# Única forma de vincular Docente-Estudiante en la app: sin esto, un Docente
# no ve ningún estudiante en Reportes/Retroalimentaciones (esas vistas
# filtran por AsignacionDocenteEstudiante con activo=True).

class AsignacionListView(generics.ListCreateAPIView):
    """
    Listar/crear asignaciones. Solo Administrador.
    GET/POST /api/asignaciones/
    """
    serializer_class = AsignacionDocenteEstudianteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.tipo_usuario != TipoUsuario.ADMINISTRADOR:
            return AsignacionDocenteEstudiante.objects.none()
        return AsignacionDocenteEstudiante.objects.filter(activo=True).select_related(
            'docente__usuario', 'estudiante__usuario'
        ).order_by('-fecha_asignacion')

    def create(self, request, *args, **kwargs):
        if request.user.tipo_usuario != TipoUsuario.ADMINISTRADOR:
            return Response({'error': 'Solo un administrador puede hacer esto'}, status=status.HTTP_403_FORBIDDEN)

        docente_id = request.data.get('docente')
        estudiante_id = request.data.get('estudiante')
        if not docente_id or not estudiante_id:
            return Response({'error': 'Debe indicar docente y estudiante'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            docente = Docente.objects.get(pk=docente_id)
            estudiante = Estudiante.objects.get(pk=estudiante_id)
        except (Docente.DoesNotExist, Estudiante.DoesNotExist):
            return Response({'error': 'Docente o estudiante no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        asignacion, creada = AsignacionDocenteEstudiante.objects.get_or_create(
            docente=docente, estudiante=estudiante, defaults={'activo': True}
        )
        if not creada:
            if asignacion.activo:
                return Response(
                    {'error': 'Ese estudiante ya está asignado a ese docente'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            # Ya existía (unique_together) pero estaba desactivada — reactivarla
            # en vez de intentar crear una fila duplicada.
            asignacion.activo = True
            asignacion.save(update_fields=['activo'])

        return Response(
            AsignacionDocenteEstudianteSerializer(asignacion).data,
            status=status.HTTP_201_CREATED
        )


class AsignacionDetailView(APIView):
    """
    Quitar una asignación. Solo Administrador.
    DELETE /api/asignaciones/<id>/
    """
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        if request.user.tipo_usuario != TipoUsuario.ADMINISTRADOR:
            return Response({'error': 'Solo un administrador puede hacer esto'}, status=status.HTTP_403_FORBIDDEN)
        try:
            asignacion = AsignacionDocenteEstudiante.objects.get(pk=pk)
        except AsignacionDocenteEstudiante.DoesNotExist:
            return Response({'error': 'Asignación no encontrada'}, status=status.HTTP_404_NOT_FOUND)

        asignacion.activo = False
        asignacion.save(update_fields=['activo'])
        return Response({'mensaje': 'Asignación quitada'})
