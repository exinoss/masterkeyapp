"""
URLs para la app Users.
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegistroView, LoginView, LogoutView, PerfilView, CambiarPasswordView,
    EstudianteListView, EstudianteDetailView,
    DocenteListView, DocenteDetailView,
    UsuarioListView, ActivarUsuarioView, DesactivarUsuarioView,
    AsignacionListView, AsignacionDetailView
)

urlpatterns = [
    # Autenticación
    path('auth/registro/', RegistroView.as_view(), name='registro'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/perfil/', PerfilView.as_view(), name='perfil'),
    path('auth/cambiar-password/', CambiarPasswordView.as_view(), name='cambiar_password'),

    # Estudiantes
    path('estudiantes/', EstudianteListView.as_view(), name='estudiante_list'),
    path('estudiantes/<int:pk>/', EstudianteDetailView.as_view(), name='estudiante_detail'),

    # Docentes
    path('docentes/', DocenteListView.as_view(), name='docente_list'),
    path('docentes/<int:pk>/', DocenteDetailView.as_view(), name='docente_detail'),

    # Gestión de usuarios (Administrador)
    path('usuarios/', UsuarioListView.as_view(), name='usuario_list'),
    path('usuarios/<int:pk>/activar/', ActivarUsuarioView.as_view(), name='usuario_activar'),
    path('usuarios/<int:pk>/desactivar/', DesactivarUsuarioView.as_view(), name='usuario_desactivar'),

    # Asignación Docente-Estudiante (Administrador)
    path('asignaciones/', AsignacionListView.as_view(), name='asignacion_list'),
    path('asignaciones/<int:pk>/', AsignacionDetailView.as_view(), name='asignacion_detail'),
]
