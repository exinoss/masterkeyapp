"""
Views para la app Users - Autenticación y gestión de usuarios.
"""
import random
import string

from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate
from django.db.models import Q, Count
from django.utils import timezone

from .models import (
    Usuario, Estudiante, Docente, Administrador, Curso, Inscripcion, TipoUsuario
)
from .serializers import (
    UsuarioSerializer, RegistroUsuarioSerializer, LoginSerializer,
    CambiarPasswordSerializer, EstudianteSerializer, EstudianteUpdateSerializer,
    DocenteSerializer, DocenteUpdateSerializer, AdministradorSerializer,
    CursoSerializer, CursoCreateSerializer, InscripcionSerializer
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
            # Estudiantes asignados al docente por la vía vieja
            # (AsignacionDocenteEstudiante, ya no se crea desde la UI pero
            # hay datos reales) O por la vía nueva (inscripto en uno de
            # sus cursos con código).
            try:
                docente = usuario.perfil_docente
                return Estudiante.objects.filter(
                    Q(docentes_asignados__docente=docente, docentes_asignados__activo=True) |
                    Q(inscripciones__curso__docente=docente)
                ).distinct()
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


# ==================== CURSOS (código de acceso) ====================
#
# Reemplaza la asignación manual de Docente-Estudiante como forma de crear
# la relación hacia adelante: el Docente crea un Curso con fechas y recibe
# un código; el Estudiante se une solo (UnirseCursoView). No se tocan ni
# se borran las AsignacionDocenteEstudiante ya existentes — las consultas
# que dependen de "qué estudiantes ve este docente" (acá y en chatbot/)
# siguen honrándolas además de esto.

def _generar_codigo_unico():
    """Código de 6 caracteres alfanuméricos en mayúscula, reintentando si
    colisiona (con 36^6 combinaciones posibles, prácticamente no pasa)."""
    alfabeto = string.ascii_uppercase + string.digits
    for _ in range(10):
        codigo = ''.join(random.choices(alfabeto, k=6))
        if not Curso.objects.filter(codigo=codigo).exists():
            return codigo
    # Extremadamente improbable, pero no se deja un código sin generar.
    return ''.join(random.choices(alfabeto, k=8))


class CursoListView(generics.ListCreateAPIView):
    """
    Listar/crear cursos. Un Docente ve y crea los suyos; un Administrador
    ve todos (sin poder crear — el rango de fechas lo define el Docente).
    GET/POST /api/cursos/
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        usuario = self.request.user
        if usuario.tipo_usuario == TipoUsuario.DOCENTE:
            try:
                queryset = Curso.objects.filter(docente=usuario.perfil_docente)
            except Docente.DoesNotExist:
                return Curso.objects.none()
        elif usuario.tipo_usuario == TipoUsuario.ADMINISTRADOR:
            queryset = Curso.objects.all()
        else:
            return Curso.objects.none()
        return queryset.annotate(total_inscritos=Count('inscripciones'))

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CursoCreateSerializer
        return CursoSerializer

    def create(self, request, *args, **kwargs):
        if request.user.tipo_usuario != TipoUsuario.DOCENTE:
            return Response(
                {'error': 'Solo un docente puede crear un curso'},
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            docente = request.user.perfil_docente
        except Docente.DoesNotExist:
            return Response({'error': 'Perfil de docente no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        curso = Curso.objects.create(
            docente=docente,
            codigo=_generar_codigo_unico(),
            **serializer.validated_data
        )
        curso.total_inscritos = 0
        return Response(CursoSerializer(curso).data, status=status.HTTP_201_CREATED)


class UnirseCursoView(APIView):
    """
    Un Estudiante se une a un curso con su código. Solo Estudiante.
    POST /api/cursos/unirse/  body: {"codigo": "ABC123"}
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if request.user.tipo_usuario != TipoUsuario.ESTUDIANTE:
            return Response(
                {'error': 'Solo un estudiante puede unirse a un curso'},
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            estudiante = request.user.perfil_estudiante
        except Estudiante.DoesNotExist:
            return Response({'error': 'Perfil de estudiante no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        codigo = (request.data.get('codigo') or '').strip().upper()
        if not codigo:
            return Response({'error': 'Ingresá un código.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            curso = Curso.objects.get(codigo=codigo)
        except Curso.DoesNotExist:
            return Response({'error': 'Ese código no corresponde a ningún curso.'}, status=status.HTTP_404_NOT_FOUND)

        if curso.vencido:
            return Response({'error': 'Este curso ya terminó.'}, status=status.HTTP_400_BAD_REQUEST)

        # Practicar sin curso está permitido (no es obligatorio) — la única
        # restricción es no poder estar en dos cursos vigentes a la vez.
        inscripcion_vigente = Inscripcion.objects.filter(
            estudiante=estudiante, curso__fecha_fin__gte=timezone.localdate()
        ).select_related('curso').order_by('-fecha_inscripcion').first()

        if inscripcion_vigente:
            if inscripcion_vigente.curso_id == curso.id:
                return Response({'error': 'Ya estás inscripto en este curso.'}, status=status.HTTP_400_BAD_REQUEST)
            return Response({
                'error': (
                    f'Ya estás inscripto en un curso vigente ("{inscripcion_vigente.curso.nombre}", '
                    f'termina el {inscripcion_vigente.curso.fecha_fin}). '
                    'Esperá a que termine para unirte a otro.'
                )
            }, status=status.HTTP_400_BAD_REQUEST)

        inscripcion = Inscripcion.objects.create(curso=curso, estudiante=estudiante)
        return Response(InscripcionSerializer(inscripcion).data, status=status.HTTP_201_CREATED)


class MiCursoView(APIView):
    """
    La inscripción más reciente del Estudiante autenticado (vigente o
    vencida) — o null si nunca se unió a ninguna. Solo Estudiante.
    GET /api/cursos/mi-curso/
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.tipo_usuario != TipoUsuario.ESTUDIANTE:
            return Response(
                {'error': 'Solo disponible para estudiantes'},
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            estudiante = request.user.perfil_estudiante
        except Estudiante.DoesNotExist:
            return Response({'error': 'Perfil de estudiante no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        inscripcion = Inscripcion.objects.filter(estudiante=estudiante) \
            .select_related('curso', 'curso__docente__usuario') \
            .order_by('-fecha_inscripcion').first()

        if not inscripcion:
            return Response({'inscripcion': None})
        return Response({'inscripcion': InscripcionSerializer(inscripcion).data})
