"""
URLs para la app Users.
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegistroView, LoginView, LogoutView, PerfilView, CambiarPasswordView,
    EstudianteListView, EstudianteDetailView,
    DocenteListView, DocenteDetailView
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
]
