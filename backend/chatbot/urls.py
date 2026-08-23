"""
URLs para la app Chatbot (AVI).
"""
from django.urls import path

from .views import (
    AgenteVirtualListView, AgenteVirtualDetailView,
    SesionPracticaListView, SesionPracticaDetailView, FinalizarSesionView,
    InteraccionAgenteView, RetroalimentacionListView,
    EstadisticasEstudianteView, ReporteDocenteView
)

urlpatterns = [
    # Agentes Virtuales
    path('agentes/', AgenteVirtualListView.as_view(), name='agente_list'),
    path('agentes/<int:pk>/', AgenteVirtualDetailView.as_view(), name='agente_detail'),
    
    # Sesiones de Práctica
    path('sesiones/', SesionPracticaListView.as_view(), name='sesion_list'),
    path('sesiones/<int:pk>/', SesionPracticaDetailView.as_view(), name='sesion_detail'),
    path('sesiones/<int:pk>/finalizar/', FinalizarSesionView.as_view(), name='sesion_finalizar'),
    
    # Interacción con el Agente
    path('interaccion/', InteraccionAgenteView.as_view(), name='interaccion'),
    
    # Retroalimentación
    path('retroalimentaciones/', RetroalimentacionListView.as_view(), name='retroalimentacion_list'),
    
    # Estadísticas y Reportes
    path('estadisticas/', EstadisticasEstudianteView.as_view(), name='estadisticas'),
    path('reportes/estudiantes/', ReporteDocenteView.as_view(), name='reporte_estudiantes'),
]
